import json
import math
import sys
import tempfile
import unittest
from pathlib import Path

import numpy as np

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from game_irl.irl_from_plays import SCALE_VEC, _maxent_fit, load_human_trajectories
from scripts.analyze_irl import filter_plays_by_purpose, split_by_participant_score


def _play_doc(scenario_id="D1_1", user_id="u1", purpose="research", attempt=1,
              score=80.0):
    return {
        "meta": {
            "scenario_id": scenario_id,
            "tier": "general",
            "user_id": user_id,
            "play_purpose": purpose,
            "attempt_no": attempt,
            "submitted_at": f"2026-07-0{attempt}T00:00:00",
        },
        "layout": {"cranes": [{"id": "C1"}], "lifts": [{"id": "L1"}]},
        "outcome": {
            "events": [{"liftId": "L1", "duration": 1, "move": 0}],
            "done": 1,
            "total": 1,
            "raw": {"idle_steps_total": 0},
        },
        "scorer_snapshot": {"totalScore": score},
    }


class ConvergenceHistoryTests(unittest.TestCase):
    """Regression: the convergence curve is instrumentation only.

    Recording the per-iteration loss must not perturb the optimizer — if it
    ever did, the reported curve would describe a different fit than the
    coefficients shipped alongside it.
    """

    def _tiny_problem(self):
        rng = np.random.default_rng(0)
        z = rng.normal(size=(32, 7))
        samples = {"S": {"z": z, "logq": np.zeros(32)}}
        demos = [{"scenario_id": "S", "z": z[i]} for i in range(8)]
        return demos, samples

    def test_history_does_not_change_the_fit(self):
        demos, samples = self._tiny_problem()
        plain, d_plain = _maxent_fit(demos, samples, l2=1.0)
        traced, d_traced = _maxent_fit(demos, samples, l2=1.0, record_history=True)

        np.testing.assert_allclose(plain, traced)
        self.assertEqual(d_plain["iterations"], d_traced["iterations"])
        self.assertNotIn("loss_history", d_plain)

    def test_history_length_matches_iterations_and_decreases(self):
        demos, samples = self._tiny_problem()
        _, diag = _maxent_fit(demos, samples, l2=1.0, record_history=True)

        hist = diag["loss_history"]
        self.assertEqual(len(hist), diag["iterations"])
        self.assertEqual(len(diag["grad_inf_norm_history"]), diag["iterations"])
        self.assertLess(hist[-1], hist[0])
        self.assertAlmostEqual(min(hist), diag["loss"])


class PurposeFilterTests(unittest.TestCase):
    """Regression: purpose filtering must happen BEFORE repeat-attempt
    collapsing.

    ``load_human_trajectories`` keeps one demo per (participant, scenario) —
    the latest attempt. If a participant's later non-research replay is still
    in the directory, it outranks and silently evicts the consented research
    demonstration, so the fit would drop data it is allowed to use and use data
    it is not.
    """

    def test_only_requested_purpose_is_copied(self):
        with tempfile.TemporaryDirectory() as tmp:
            src, dest = Path(tmp) / "src", Path(tmp) / "dest"
            src.mkdir()
            (src / "a.json").write_text(json.dumps(
                _play_doc(purpose="research", attempt=1)), encoding="utf-8")
            (src / "b.json").write_text(json.dumps(
                _play_doc(purpose="general", attempt=2)), encoding="utf-8")
            (src / "c.json").write_text(json.dumps(
                _play_doc(purpose=None, attempt=3)), encoding="utf-8")

            report = filter_plays_by_purpose(src, dest, "research")

            self.assertEqual(report["n_kept"], 1)
            self.assertEqual(report["purpose_counts"],
                             {"research": 1, "general": 1, "legacy": 1})
            self.assertEqual([p.name for p in sorted(dest.glob("*.json"))], ["a.json"])

    def test_research_demo_survives_a_later_general_replay(self):
        with tempfile.TemporaryDirectory() as tmp:
            src, dest = Path(tmp) / "src", Path(tmp) / "dest"
            src.mkdir()
            (src / "research.json").write_text(json.dumps(
                _play_doc(purpose="research", attempt=1)), encoding="utf-8")
            (src / "later_general.json").write_text(json.dumps(
                _play_doc(purpose="general", attempt=9)), encoding="utf-8")

            filter_plays_by_purpose(src, dest, "research")
            rows = load_human_trajectories(dest)

        self.assertEqual(len(rows), 1)
        self.assertTrue(rows[0]["path"].endswith("research.json"))


class RepeatAttemptOptionTests(unittest.TestCase):
    """Regression: collapsing repeats stays the default.

    ``collapse_repeats=False`` is an opt-in for whole-dataset runs. If the
    default ever flipped, every existing caller (the live IRL prior job
    included) would silently start weighting participants by how many times
    they replayed a scenario.
    """

    def _dir_with_three_attempts(self, root: Path):
        for attempt in (1, 2, 3):
            (root / f"a{attempt}.json").write_text(
                json.dumps(_play_doc(user_id="u1", attempt=attempt)),
                encoding="utf-8")

    def test_default_keeps_only_the_latest_attempt(self):
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            self._dir_with_three_attempts(root)

            rows = load_human_trajectories(root)

        self.assertEqual(len(rows), 1)
        self.assertEqual(rows[0]["attempt_no"], 3)

    def test_opt_out_keeps_every_attempt(self):
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            self._dir_with_three_attempts(root)

            rows = load_human_trajectories(root, collapse_repeats=False)

        self.assertEqual(sorted(r["attempt_no"] for r in rows), [1, 2, 3])

    def test_cohort_reports_the_per_participant_load(self):
        from game_irl.irl_from_plays import cohort_summary

        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            self._dir_with_three_attempts(root)
            rows = load_human_trajectories(root, collapse_repeats=False)

        cohort = cohort_summary(rows)
        # The whole point of allowing repeats is that this number is no longer
        # bounded by the scenario count, so the report must surface it.
        self.assertEqual(cohort["n_demos"], 3)
        self.assertEqual(cohort["n_participants"], 1)
        self.assertEqual(cohort["max_demos_per_participant"], 3)
        self.assertEqual(cohort["n_repeat_attempts_dropped"], 0)


class ProposalDistributionTests(unittest.TestCase):
    """The Z estimate is only unbiased if log q matches the draw exactly.

    Self-normalized importance sampling divides each sampled trajectory's
    utility by its proposal probability. If ``logq`` and the sampling rule ever
    disagree, Z is silently wrong and every coefficient with it — and nothing
    downstream would flag it, because the fit still converges.
    """

    def test_uniform_stays_the_default_and_is_reproducible(self):
        from game_irl.irl_from_plays import sample_trajectory_space

        a = sample_trajectory_space(["D1_1"], n_samples=4, seed=3)
        b = sample_trajectory_space(["D1_1"], n_samples=4, seed=3,
                                    proposal="uniform")

        np.testing.assert_allclose(a["D1_1"]["z"], b["D1_1"]["z"])
        np.testing.assert_allclose(a["D1_1"]["logq"], b["D1_1"]["logq"])

    def test_rank_softmax_is_reproducible(self):
        from game_irl.irl_from_plays import sample_trajectory_space

        a = sample_trajectory_space(["D1_1"], n_samples=4, seed=3,
                                    proposal="rank_softmax", temperature=1.5)
        b = sample_trajectory_space(["D1_1"], n_samples=4, seed=3,
                                    proposal="rank_softmax", temperature=1.5)

        np.testing.assert_allclose(a["D1_1"]["logq"], b["D1_1"]["logq"])

    def test_rank_weights_normalize_and_prefer_better_ranks(self):
        from game_irl.irl_from_plays import _rank_softmax_weights

        w = _rank_softmax_weights(5, 1.0)

        self.assertAlmostEqual(sum(w), 1.0)
        self.assertEqual(w, sorted(w, reverse=True))
        # A large temperature must degenerate to the uniform proposal, so the
        # two modes stay comparable rather than being different models.
        flat = _rank_softmax_weights(5, 1e6)
        for p in flat:
            self.assertAlmostEqual(p, 0.2, places=4)

    def test_logq_is_bounded_by_the_uniform_case(self):
        """A greedy tilt concentrates mass, so log q of the drawn trajectory
        must be no lower than uniform's -sum log|A| on the same rollout."""
        from game_irl.irl_from_plays import sample_trajectory_space

        uni = sample_trajectory_space(["D1_1"], n_samples=6, seed=11)
        tilt = sample_trajectory_space(["D1_1"], n_samples=6, seed=11,
                                       proposal="rank_softmax", temperature=0.5)

        self.assertGreaterEqual(float(np.mean(tilt["D1_1"]["logq"])),
                                float(np.mean(uni["D1_1"]["logq"])))

    def test_invalid_proposal_and_temperature_are_rejected(self):
        from game_irl.irl_from_plays import sample_trajectory_space

        with self.assertRaises(ValueError):
            sample_trajectory_space(["D1_1"], n_samples=1, proposal="greedy")
        with self.assertRaises(ValueError):
            sample_trajectory_space(["D1_1"], n_samples=1,
                                    proposal="rank_softmax", temperature=0.0)


class SweepSamplerTests(unittest.TestCase):
    """The sweep sampler must roll out in the demonstrations' action space
    using the SAME executor the human game uses, with an exact log q."""

    def test_session_and_sampler_share_one_executor(self):
        """Regression: no second copy of the sweep logic.

        If the human game and the IRL sampler ever diverge, Z is estimated over
        a different action space than the demonstrations were recorded in —
        which is the exact defect this module was built to fix, and it fails
        silently (the fit still converges, on the wrong space).
        """
        from game_irl import human_play, sweep_exec

        self.assertIs(human_play._sweep_execute, sweep_exec.execute_sweep)
        self.assertIs(human_play._sweep_hard_conflict_finish,
                      sweep_exec.hard_conflict_finish)

    def test_lift_mixture_density_integrates_to_one(self):
        """log q must be a real density or the IS weights are meaningless."""
        from game_irl.irl_from_plays import _lift_mixture_logpdf

        lifts = [(10.0, 10.0), (30.0, 20.0)]
        sigma = 4.0
        step = 0.5
        grid = np.arange(-20.0, 60.0, step)
        total = 0.0
        for x in grid:
            for y in grid:
                total += math.exp(_lift_mixture_logpdf(float(x), float(y),
                                                       lifts, sigma))
        self.assertAlmostEqual(total * step * step, 1.0, places=3)

    def test_sweep_rollouts_are_reproducible(self):
        from game_irl.irl_from_plays import sample_trajectory_space

        a = sample_trajectory_space(["D1_1"], n_samples=6, seed=5,
                                    action_space="sweep")
        b = sample_trajectory_space(["D1_1"], n_samples=6, seed=5,
                                    action_space="sweep")

        np.testing.assert_allclose(a["D1_1"]["z"], b["D1_1"]["z"])
        np.testing.assert_allclose(a["D1_1"]["logq"], b["D1_1"]["logq"])

    def test_sweep_returns_only_completed_trajectories(self):
        """Demonstrations are all complete plays, so the sampled support must
        be the completed-trajectory space — an unfinished rollout would make
        the completion features incomparable."""
        from game_irl.irl_from_plays import FEATURE_NAMES, SCALE_VEC, sample_trajectory_space

        part = sample_trajectory_space(["D1_1"], n_samples=8, seed=2,
                                       action_space="sweep")["D1_1"]

        phi = part["z"] / SCALE_VEC
        r_all = phi[:, FEATURE_NAMES.index("r_all")]
        np.testing.assert_allclose(r_all, np.ones_like(r_all))

    def test_pick_remains_the_default_action_space(self):
        from game_irl.irl_from_plays import sample_trajectory_space

        default = sample_trajectory_space(["D1_1"], n_samples=4, seed=8)
        pick = sample_trajectory_space(["D1_1"], n_samples=4, seed=8,
                                       action_space="pick")

        np.testing.assert_allclose(default["D1_1"]["logq"], pick["D1_1"]["logq"])

    def test_invalid_action_space_and_setup_proposal_are_rejected(self):
        from game_irl.irl_from_plays import sample_trajectory_space

        with self.assertRaises(ValueError):
            sample_trajectory_space(["D1_1"], n_samples=1, action_space="drag")
        with self.assertRaises(ValueError):
            sample_trajectory_space(["D1_1"], n_samples=1, action_space="sweep",
                                    setup_proposal="kmeans")


class AnalyzeWiringTests(unittest.TestCase):
    """Regression: the report must be fitted in the action space it claims.

    ``analyze`` accepting ``action_space`` but not forwarding it to
    ``sample_trajectory_space`` is the silent failure this whole module was
    built around: the run would still produce coefficients and diagnostics,
    labelled 'sweep', estimated over the 'pick' space the demonstrations do not
    live in.
    """

    def _plays_dir(self, root: Path, scenario_ids=("D1_1",)):
        src = root / "src"
        src.mkdir()
        for i, sid in enumerate(scenario_ids):
            # Two participants per scenario, so the descriptive statistics have
            # a defined sample standard deviation.
            for j in range(2):
                (src / f"p{i}_{j}.json").write_text(
                    json.dumps(_play_doc(scenario_id=sid, user_id=f"u{i}{j}")),
                    encoding="utf-8")
        return src

    def _stub_samples(self, scenario_ids):
        rng = np.random.default_rng(0)
        return {sid: {"z": rng.normal(size=(8, 7)), "logq": np.zeros(8)}
                for sid in scenario_ids}

    def _run(self, src, workdir, sampled, **kw):
        """Run analyze with the sampler stubbed; return (report, call kwargs)."""
        from scripts import analyze_irl

        seen: Dict = {}

        def fake_sampler(scenario_ids, **kwargs):
            seen.update(kwargs)
            seen["scenario_ids"] = list(scenario_ids)
            return self._stub_samples(sampled)

        real = analyze_irl.sample_trajectory_space
        analyze_irl.sample_trajectory_space = fake_sampler
        try:
            report = analyze_irl.analyze(
                plays_dir=src, purpose="research", workdir=workdir,
                n_samples=8, bootstrap=0, group_bootstrap=0, l2=1.0, seed=0,
                min_play_seconds=0.0, **kw)
        finally:
            analyze_irl.sample_trajectory_space = real
        return report, seen

    def test_action_space_reaches_the_sampler_and_the_report(self):
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            src = self._plays_dir(root)
            report, seen = self._run(src, root / "work", ["D1_1"],
                                     action_space="sweep",
                                     setup_proposal="lift_mixture")

        self.assertEqual(seen["action_space"], "sweep")
        self.assertEqual(seen["setup_proposal"], "lift_mixture")
        self.assertEqual(report["source"]["action_space"], "sweep")
        self.assertEqual(report["source"]["setup_proposal"], "lift_mixture")

    def test_scenarios_without_samples_are_reported_not_silently_fitted(self):
        """A scenario whose rollouts never complete has no sampled support. Its
        demos must be dropped visibly — an unreported drop would make `cohort`
        describe more data than the coefficients were fitted on."""
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            src = self._plays_dir(root, scenario_ids=("D1_1", "D1_2"))
            # The sampler only covers D1_1, as if D1_2 never finished a rollout.
            report, _ = self._run(src, root / "work", ["D1_1"])

        self.assertEqual(report["source"]["scenarios_without_samples"], ["D1_2"])
        self.assertEqual(report["scenarios"], ["D1_1"])
        self.assertEqual(report["cohort"]["n_demos"], 2)
        self.assertEqual(report["feature_expectations"]["n_demos"], 2)


class ParticipantSplitTests(unittest.TestCase):
    """Regression: the top/bottom contrast splits people, not plays.

    A play-level split can place the same participant in both groups, and then
    the coefficient difference measures that person's play-to-play noise rather
    than the difference between strong and weak schedulers.
    """

    def _rows(self):
        rows = []
        # 8 participants; each plays twice with one high and one low score, so a
        # play-level split would put every person in both groups.
        for i in range(8):
            base = 40.0 + i * 5.0
            for offset in (-15.0, +15.0):
                rows.append({
                    "scenario_id": "D1_1",
                    "user_id": f"u{i}",
                    "phi": np.zeros(7),
                    "total_score": base + offset,
                })
        return rows

    def test_groups_are_disjoint_and_ordered(self):
        split = split_by_participant_score(self._rows(), quantile=0.25)

        self.assertTrue(split["ok"])
        self.assertEqual(split["n_participants_scored"], 8)
        self.assertEqual(split["n_per_group"], 2)
        self.assertFalse(set(split["top_ids"]) & set(split["bottom_ids"]))
        self.assertGreater(split["top_mean_score"], split["bottom_mean_score"])
        top_people = {r["user_id"] for r in split["top_demos"]}
        bottom_people = {r["user_id"] for r in split["bottom_demos"]}
        self.assertFalse(top_people & bottom_people)
        # Every play of a selected participant travels with them.
        self.assertEqual(len(split["top_demos"]), 4)

    def test_too_few_participants_reports_instead_of_splitting(self):
        rows = [{"scenario_id": "D1_1", "user_id": "u0", "phi": np.zeros(7),
                 "total_score": 50.0}]

        split = split_by_participant_score(rows)

        self.assertFalse(split["ok"])


class ModelFeatureExpectationTests(unittest.TestCase):
    """The feature-matching check must be reported in raw feature units.

    The optimizer works on scaled features (phi * SCALE_VEC); reporting the
    model expectation without dividing the scale back out would compare
    E_model against E_demo in different units and make the residual look large
    for r_all and small for p_move purely from the scaling.
    """

    def test_uniform_weights_recover_the_sample_mean_in_raw_units(self):
        from scripts.analyze_irl import model_feature_expectation

        rng = np.random.default_rng(1)
        phi = rng.uniform(1.0, 2.0, size=(64, 7))
        # theta = 0 with logq = 0 makes the IS weights uniform, so E_model is
        # exactly the raw-unit mean of the sampled trajectories.
        samples = {"S": {"z": phi * SCALE_VEC, "logq": np.zeros(64)}}
        human = [{"scenario_id": "S", "phi": phi[i]} for i in range(64)]

        out = model_feature_expectation(np.zeros(7), human, samples)

        np.testing.assert_allclose(
            list(out["e_model"].values()), phi.mean(axis=0), rtol=1e-9)
        np.testing.assert_allclose(
            list(out["e_demo"].values()), phi.mean(axis=0), rtol=1e-9)
        self.assertAlmostEqual(out["ess_per_scenario"]["S"], 64.0, places=2)


if __name__ == "__main__":
    unittest.main()
