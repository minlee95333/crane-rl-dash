"""The IRL re-estimation runs in the background, not inside the HTTP request.

Regression for the 2026-08-05 report: pressing "IRL 재추정 실행" on the hosted
dashboard answered `실패: Unexpected token 'u', "upstream error" is not valid
JSON`. The endpoint ran the whole MaxEnt fit synchronously — over ten minutes of
CPU on the study's 26 scenarios at 200 rollouts each — so the connection timed
out and the page was handed plain text that it fed to `r.json()`. These tests pin the two properties that fix it: starting a run
returns without waiting for the fit, and the result is collected by polling.
"""
import threading
import time
import unittest

from crane_web import irl_jobs


class _Gate:
    """A run that blocks until the test lets it finish."""

    def __init__(self):
        self.started = threading.Event()
        self.release = threading.Event()
        self.calls = []

    def run_irl(self, **kwargs):
        self.calls.append(kwargs)
        self.started.set()
        cb = kwargs.get("progress_cb")
        if cb:
            cb("sample", 3, 26)
        if not self.release.wait(timeout=10):
            raise AssertionError("test never released the gated run")
        return {"ok": True, "n_demo_pools": 7, "reward_coef": {}}


class IrlJobTests(unittest.TestCase):
    def setUp(self):
        irl_jobs._JOB = None
        self.gate = _Gate()
        self.saved = []

        def fake_run(job_id, params):
            """Stand in for _run's imports without touching storage or plays."""
            try:
                result = self.gate.run_irl(
                    progress_cb=lambda p, d, t: irl_jobs._set_progress(job_id, p, d, t),
                    **params,
                )
                self.saved.append(result)
                irl_jobs._finish(job_id, ok=True, prior=result, path="pg:irl:1",
                                 phase="done", message="새 prior 생성 완료")
            except Exception as e:  # mirrors _run's failure path
                irl_jobs._finish(job_id, ok=False, error=str(e), message=str(e))

        self._real_run = irl_jobs._run
        irl_jobs._run = fake_run

    def tearDown(self):
        irl_jobs._run = self._real_run
        self.gate.release.set()
        irl_jobs._JOB = None

    def test_start_returns_before_the_fit_finishes(self):
        t0 = time.time()
        started, job = irl_jobs.start_irl_job({"bootstrap": 200, "l2": 1.0})
        elapsed = time.time() - t0

        self.assertTrue(started)
        self.assertTrue(job["running"])
        # The point of the change: the caller is not held for the fit. The gated
        # run is still blocked at this moment.
        self.assertLess(elapsed, 2.0)
        self.assertTrue(self.gate.started.wait(timeout=5))
        self.assertFalse(self.gate.release.is_set())

    def test_progress_is_visible_while_running(self):
        irl_jobs.start_irl_job({"bootstrap": 200})
        self.assertTrue(self.gate.started.wait(timeout=5))

        snap = irl_jobs.irl_job_snapshot()
        self.assertTrue(snap["running"])
        self.assertEqual(snap["phase"], "sample")
        self.assertEqual((snap["phaseDone"], snap["phaseTotal"]), (3, 26))
        self.assertIn("3/26", snap["message"])

    def test_result_is_collected_by_polling_after_completion(self):
        irl_jobs.start_irl_job({"bootstrap": 200})
        self.assertTrue(self.gate.started.wait(timeout=5))
        self.gate.release.set()

        deadline = time.time() + 5
        while time.time() < deadline:
            snap = irl_jobs.irl_job_snapshot()
            if not snap["running"]:
                break
            time.sleep(0.02)

        self.assertFalse(snap["running"])
        self.assertTrue(snap["ok"])
        self.assertEqual(snap["path"], "pg:irl:1")
        self.assertEqual(snap["prior"]["n_demo_pools"], 7)
        self.assertIsNotNone(snap["finishedAt"])

    def test_second_start_is_refused_while_one_is_running(self):
        irl_jobs.start_irl_job({"bootstrap": 200})
        self.assertTrue(self.gate.started.wait(timeout=5))

        started, job = irl_jobs.start_irl_job({"bootstrap": 200})
        self.assertFalse(started)
        self.assertTrue(job["running"])
        # Refused, not queued: two concurrent fits would double the load on the
        # remote DB for a prior that is overwritten anyway.
        self.assertEqual(len(self.gate.calls), 1)

    def test_a_finished_run_does_not_block_the_next_one(self):
        irl_jobs.start_irl_job({"bootstrap": 200})
        self.assertTrue(self.gate.started.wait(timeout=5))
        self.gate.release.set()
        deadline = time.time() + 5
        while time.time() < deadline and irl_jobs.irl_job_snapshot()["running"]:
            time.sleep(0.02)

        self.gate.started.clear()
        started, _ = irl_jobs.start_irl_job({"bootstrap": 200})
        self.assertTrue(started)
        self.assertTrue(self.gate.started.wait(timeout=5))

    def test_snapshot_never_leaks_the_thread_object(self):
        irl_jobs.start_irl_job({"bootstrap": 200})
        self.assertTrue(self.gate.started.wait(timeout=5))
        self.assertNotIn("thread", irl_jobs.irl_job_snapshot())

    def test_failure_is_reported_rather_than_swallowed(self):
        def boom(job_id, params):
            irl_jobs._finish(job_id, ok=False, error="boom", message="IRL 실행 실패: boom")

        irl_jobs._run = boom
        irl_jobs.start_irl_job({"bootstrap": 200})
        deadline = time.time() + 5
        while time.time() < deadline and irl_jobs.irl_job_snapshot()["running"]:
            time.sleep(0.02)

        snap = irl_jobs.irl_job_snapshot()
        self.assertFalse(snap["running"])
        self.assertFalse(snap["ok"])
        self.assertEqual(snap["error"], "boom")

    def test_no_snapshot_before_any_run(self):
        self.assertIsNone(irl_jobs.irl_job_snapshot())


class IrlRunProgressPlumbingTests(unittest.TestCase):
    """run_irl must accept and drive the callback the job registry hands it."""

    def test_sampler_reports_scenario_progress(self):
        from game_irl.irl_from_plays import sample_trajectory_space

        seen = []
        sample_trajectory_space(
            ["CORRIDOR_1"], n_samples=2, seed=0,
            progress_cb=lambda phase, done, total: seen.append((phase, done, total)),
        )

        self.assertIn(("sample", 0, 1), seen)
        self.assertIn(("sample", 1, 1), seen)

    def test_run_irl_accepts_progress_cb(self):
        import inspect
        from game_irl.irl_from_plays import run_irl

        self.assertIn("progress_cb", inspect.signature(run_irl).parameters)


if __name__ == "__main__":
    unittest.main()
