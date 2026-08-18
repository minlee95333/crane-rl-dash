"""Unit tests for the pure-helper modules extracted from app.py into crane_web.

These were exercised only indirectly (through the request Handler) after the
mixin refactor; this locks in their behaviour directly — the host/loopback
parsing, the TTL-cached public-scenarios helper, and the background-job
registry's accessors and snapshot helpers.
"""
import unittest
from unittest.mock import patch

from crane_web import net_util
from crane_web import scenarios_cache
from crane_web import jobs


class HostLoopbackTests(unittest.TestCase):
    def test_host_name_strips_port_and_lowercases(self):
        self.assertEqual(net_util._host_name("Example.com:8000"), "example.com")
        self.assertEqual(net_util._host_name("LOCALHOST"), "localhost")

    def test_host_name_takes_first_of_forwarded_list(self):
        self.assertEqual(net_util._host_name("a.com, b.com"), "a.com")

    def test_host_name_handles_ipv6_brackets(self):
        self.assertEqual(net_util._host_name("[::1]:9000"), "::1")
        self.assertEqual(net_util._host_name("[2001:db8::1]"), "2001:db8::1")

    def test_host_name_empty(self):
        self.assertEqual(net_util._host_name(""), "")
        self.assertEqual(net_util._host_name(None), "")

    def test_is_loopback_name(self):
        for name in ("localhost", "127.0.0.1", "::1", "127.5.5.5"):
            self.assertTrue(net_util._is_loopback_name(name), name)
        for name in ("example.com", "10.0.0.1", "", "128.0.0.1"):
            self.assertFalse(net_util._is_loopback_name(name), name)

    def test_is_loopback_client_reads_first_addr_element(self):
        self.assertTrue(net_util._is_loopback_client(("127.0.0.1", 5000)))
        self.assertFalse(net_util._is_loopback_client(("203.0.113.9", 5000)))
        self.assertFalse(net_util._is_loopback_client(None))


class PublicScenariosCacheTests(unittest.TestCase):
    def setUp(self):
        scenarios_cache._invalidate_public_scenarios_cache()
        self.addCleanup(scenarios_cache._invalidate_public_scenarios_cache)

    def test_fetches_then_serves_from_cache_within_ttl(self):
        rows = [{"id": "usr_1", "name": "A"}]
        with patch("crane_db.storage.list_user_scenarios", return_value=rows) as ls:
            first = scenarios_cache._get_public_scenarios_cached()
            second = scenarios_cache._get_public_scenarios_cached()
        self.assertEqual(first, rows)
        self.assertEqual(second, rows)
        # Second call must hit the cache, not the DB.
        self.assertEqual(ls.call_count, 1)
        ls.assert_called_once_with(visibility="public", with_layout=False)

    def test_invalidate_forces_refetch(self):
        with patch("crane_db.storage.list_user_scenarios", return_value=[]) as ls:
            scenarios_cache._get_public_scenarios_cached()
            scenarios_cache._invalidate_public_scenarios_cache()
            scenarios_cache._get_public_scenarios_cached()
        self.assertEqual(ls.call_count, 2)

    def test_storage_error_degrades_to_empty_list(self):
        with patch("crane_db.storage.list_user_scenarios", side_effect=RuntimeError("db down")):
            self.assertEqual(scenarios_cache._get_public_scenarios_cached(), [])


class JobAccessorTests(unittest.TestCase):
    def setUp(self):
        # Snapshot and restore the module-global pointers so tests are isolated.
        self._lj = jobs.LATEST_JOB_ID
        self._la = jobs.LATEST_AUTO_REWARD_JOB_ID
        def restore():
            jobs.set_latest_job_id(self._lj)
            jobs.set_latest_auto_reward_job_id(self._la)
        self.addCleanup(restore)

    def test_latest_job_id_set_get_roundtrip_rebinds_module_global(self):
        jobs.set_latest_job_id("job-42")
        self.assertEqual(jobs.get_latest_job_id(), "job-42")
        # The accessor must rebind the module's own name (cross-module global).
        self.assertEqual(jobs.LATEST_JOB_ID, "job-42")

    def test_latest_auto_reward_job_id_is_independent(self):
        jobs.set_latest_job_id("train-1")
        jobs.set_latest_auto_reward_job_id("ar-1")
        self.assertEqual(jobs.get_latest_job_id(), "train-1")
        self.assertEqual(jobs.get_latest_auto_reward_job_id(), "ar-1")


class JobSnapshotTests(unittest.TestCase):
    def test_response_snapshot_drops_live_objects_and_defaults_progress(self):
        job = {
            "jobId": "j1", "running": True, "mode": "train",
            "log": object(), "progress": object(), "process": object(),
        }
        snap = jobs._job_response_snapshot(job)
        for k in ("log", "process"):
            self.assertNotIn(k, snap)
        self.assertEqual(snap["progress"], [])
        self.assertEqual(snap["progressTotal"], 0)
        self.assertEqual(snap["jobId"], "j1")
        self.assertTrue(snap["running"])

    def test_response_snapshot_preserves_existing_progress_total(self):
        snap = jobs._job_response_snapshot({"progressTotal": 7, "log": [], "progress": []})
        self.assertEqual(snap["progressTotal"], 7)


class RunningJobSnapshotTests(unittest.TestCase):
    def setUp(self):
        self._saved = dict(jobs.JOBS)
        jobs.JOBS.clear()
        def restore():
            jobs.JOBS.clear()
            jobs.JOBS.update(self._saved)
        self.addCleanup(restore)

    def _job(self, jid, running):
        return {"jobId": jid, "running": running, "log": [], "progress": [], "process": None}

    def test_returns_none_when_no_running_job(self):
        jobs.JOBS["a"] = self._job("a", False)
        self.assertIsNone(jobs._running_job_snapshot())

    def test_returns_snapshot_of_running_job(self):
        jobs.JOBS["a"] = self._job("a", False)
        jobs.JOBS["b"] = self._job("b", True)
        snap = jobs._running_job_snapshot()
        self.assertIsNotNone(snap)
        self.assertEqual(snap["jobId"], "b")
        self.assertNotIn("process", snap)


class ModelMetaExtractionTests(unittest.TestCase):
    """Regression: the app.py→crane_web refactor dropped the _read_yaml /
    _copy_model_plan_config / _coerce_crane_types imports in model_meta, so
    the silent `except Exception` in _extract_model_meta ate a NameError and
    every config-derived field (crane_capacity_curve, num_cranes, weights,
    crane_radius, …) vanished — the dashboard showed '정격곡선 없음' for models
    trained with a curve."""

    def test_extract_meta_surfaces_run_config_fields(self):
        import json
        import tempfile
        from pathlib import Path
        from crane_web.config_helpers import _write_yaml
        from crane_web.model_meta import _extract_model_meta

        with tempfile.TemporaryDirectory() as td:
            d = Path(td)
            _write_yaml(d / "config.yaml", {
                "num_cranes": 3, "num_lifts": 24, "candidate_k": 5,
                "crane_radius": 18.0, "train_episodes": 150,
                "crane_capacity_curve": [
                    {"radius": 3.0, "capacityT": 50.0},
                    {"radius": 18.0, "capacityT": 10.0},
                ],
            })
            with open(d / "pytorch_mappo_validation_result.json", "w", encoding="utf-8") as f:
                json.dump({
                    "trainEpisodes": 150,
                    "trainSummary": {
                        "best": {"makespan": 298.52},
                        "modelStats": {"craneTypes": ["default"]},
                    },
                }, f)
            pt = d / "pytorch_mappo_model.pt"
            pt.write_bytes(b"")

            meta = _extract_model_meta(pt)

        self.assertEqual(meta.get("num_cranes"), 3)
        self.assertEqual(meta.get("crane_radius"), 18.0)
        self.assertEqual(len(meta.get("crane_capacity_curve") or []), 2)
        self.assertEqual(meta.get("craneTypes"), ["default"])
        self.assertEqual(meta.get("bestMakespan"), 298.52)


class CraneTypeCountPayloadTests(unittest.TestCase):
    """crane_types[name]['count'] must survive the train-start payload → cfg
    merge (mixed-fleet training), and junk counts must be dropped."""

    def test_count_forwarded_and_junk_dropped(self):
        from crane_web.config_helpers import _apply_crane_types_to_cfg

        cfg = {}
        _apply_crane_types_to_cfg(cfg, {"crane_types": {
            "mobile_100t": {"reward": {"p_move": -0.05}, "count": 2},
            "tower": {"reward": {}, "count": "junk"},
            "crawler": {"reward": {}},
        }})
        self.assertEqual(cfg["crane_types"]["mobile_100t"]["count"], 2)
        self.assertNotIn("count", cfg["crane_types"]["tower"])
        self.assertNotIn("count", cfg["crane_types"]["crawler"])

    def test_count_max_forwarded_only_when_above_count(self):
        from crane_web.config_helpers import _apply_crane_types_to_cfg

        cfg = {}
        _apply_crane_types_to_cfg(cfg, {"crane_types": {
            "a": {"reward": {}, "count": 1, "count_max": 3},
            "b": {"reward": {}, "count": 2, "count_max": 2},   # not a range
            "c": {"reward": {}, "count": 1, "count_max": "junk"},
        }})
        self.assertEqual(cfg["crane_types"]["a"]["count_max"], 3)
        self.assertNotIn("count_max", cfg["crane_types"]["b"])
        self.assertNotIn("count_max", cfg["crane_types"]["c"])

    def test_operation_times_forwarded_and_junk_dropped(self):
        from crane_web.config_helpers import _apply_crane_types_to_cfg

        cfg = {}
        _apply_crane_types_to_cfg(cfg, {"crane_types": {
            "mobile_100t": {"reward": {}, "setup_time": 20, "teardown_time": "8.5",
                            "fixed_duration": 40},
            "tower": {"reward": {}, "setup_time": "junk", "teardown_time": "",
                      "fixed_duration": None},
        }})
        self.assertEqual(cfg["crane_types"]["mobile_100t"]["setup_time"], 20.0)
        self.assertEqual(cfg["crane_types"]["mobile_100t"]["teardown_time"], 8.5)
        self.assertEqual(cfg["crane_types"]["mobile_100t"]["fixed_duration"], 40.0)
        cfg2 = {}
        _apply_crane_types_to_cfg(cfg2, {"crane_types": {
            "big": {"reward": {}, "crane_radius": 30}}})
        self.assertEqual(cfg2["crane_types"]["big"]["crane_radius"], 30.0)
        self.assertNotIn("setup_time", cfg["crane_types"]["tower"])
        self.assertNotIn("teardown_time", cfg["crane_types"]["tower"])
        self.assertNotIn("fixed_duration", cfg["crane_types"]["tower"])


class ModelMetaCraneTypesTests(unittest.TestCase):
    """The plan tab's per-model tonnage readout needs the full crane_types
    training config surfaced in model meta (not just the name list)."""

    def test_extract_meta_surfaces_crane_types(self):
        import tempfile
        from pathlib import Path
        from crane_web.config_helpers import _write_yaml
        from crane_web.model_meta import _extract_model_meta

        with tempfile.TemporaryDirectory() as tmp:
            d = Path(tmp)
            _write_yaml(d / "config.yaml", {
                "num_cranes": 3,
                "crane_types": {"mobile_100t": {
                    "reward": {}, "count": 1, "count_max": 3, "crane_radius": 30.0,
                    "capacity_curve": [{"radius": 3, "capacityT": 100}],
                }},
                "default_crane_type": "default",
            })
            pt = d / "pytorch_mappo_model.pt"
            pt.write_bytes(b"")
            meta = _extract_model_meta(pt)

        ct = meta.get("crane_types") or {}
        self.assertIn("mobile_100t", ct)
        self.assertEqual(ct["mobile_100t"]["count"], 1)
        self.assertEqual(ct["mobile_100t"]["count_max"], 3)
        self.assertEqual(ct["mobile_100t"]["crane_radius"], 30.0)
        self.assertEqual(len(ct["mobile_100t"]["capacity_curve"]), 1)
        self.assertEqual(meta.get("default_crane_type"), "default")


class ObsTypeFeaturePlanConfigTests(unittest.TestCase):
    """Planning must rebuild each model's observation layout exactly: a model cfg
    without obs_type_features (old 17-dim actor) forces the flag off even when
    the base trainer config has it on; a model trained with it keeps it on."""

    def test_absent_flag_forces_off(self):
        from crane_web.config_helpers import _apply_model_plan_config

        cfg = {"obs_type_features": True}  # base trainer yaml default
        _apply_model_plan_config(cfg, {"candidate_k": 5})
        self.assertIs(cfg["obs_type_features"], False)

    def test_present_flag_carries_through(self):
        from crane_web.config_helpers import _apply_model_plan_config

        cfg = {}
        _apply_model_plan_config(cfg, {"obs_type_features": True})
        self.assertIs(cfg["obs_type_features"], True)


if __name__ == "__main__":
    unittest.main()
