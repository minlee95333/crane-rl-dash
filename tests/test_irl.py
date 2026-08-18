import json
import tempfile
import unittest
from pathlib import Path

import numpy as np

from game_irl.irl_from_plays import load_human_trajectories


class CustomPlayDirectoryTests(unittest.TestCase):
    def test_load_human_trajectories_uses_requested_directory(self):
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            play_dir = root / "CUSTOM_1" / "general"
            play_dir.mkdir(parents=True)
            play_path = play_dir / "play.json"
            play_path.write_text(json.dumps({
                "meta": {"scenario_id": "CUSTOM_1", "tier": "general"},
                "layout": {"cranes": [{"id": "C1"}], "lifts": [{"id": "L1"}]},
                "outcome": {
                    "events": [{"liftId": "L1", "duration": 1, "move": 0}],
                    "done": 1,
                    "total": 1,
                    "raw": {"idle_steps_total": 0},
                },
            }), encoding="utf-8")

            rows = load_human_trajectories(root, tier="general")

        self.assertEqual(len(rows), 1)
        self.assertEqual(rows[0]["scenario_id"], "CUSTOM_1")
        self.assertEqual(rows[0]["path"], str(play_path))


class FleetChoiceExclusionTests(unittest.TestCase):
    """Regression: fleet-sizing (crane_choice) plays must be EXCLUDED from IRL
    fitting. Their crane count varies per play while heuristic baselines are
    rolled out on the scenario's default fleet — mixing them would bias the
    idle/time/move coefficients. Ordinary plays in the same directory must
    still load."""

    def _write_play(self, root: Path, scenario_id: str) -> Path:
        play_dir = root / scenario_id / "general"
        play_dir.mkdir(parents=True)
        play_path = play_dir / "play.json"
        play_path.write_text(json.dumps({
            "meta": {"scenario_id": scenario_id, "tier": "general"},
            "layout": {"cranes": [{"id": "C1"}], "lifts": [{"id": "L1"}]},
            "outcome": {
                "events": [{"liftId": "L1", "duration": 1, "move": 0}],
                "done": 1,
                "total": 1,
                "raw": {"idle_steps_total": 0},
            },
        }), encoding="utf-8")
        return play_path

    def test_fleet_choice_play_is_excluded_but_ordinary_play_loads(self):
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            self._write_play(root, "FLEET_1")   # crane_choice map → excluded
            self._write_play(root, "D1_1")      # ordinary map → kept

            rows = load_human_trajectories(root, tier="general")

        self.assertEqual([r["scenario_id"] for r in rows], ["D1_1"])

    def test_flag_helper_only_matches_crane_choice_maps(self):
        from game_irl.irl_from_plays import _is_fleet_choice_scenario
        self.assertTrue(_is_fleet_choice_scenario("FLEET_1"))
        self.assertFalse(_is_fleet_choice_scenario("D1_1"))
        self.assertFalse(_is_fleet_choice_scenario("usr_nonexistent"))
        self.assertFalse(_is_fleet_choice_scenario(""))


class IncompletePlayExclusionTests(unittest.TestCase):
    """Regression: aborted plays (done < total) must be excluded from fitting.
    Sampled rollouts always run to completion, so completion features are
    constant in the Z estimate; an incomplete demo would drag r_single/r_all
    to the prior-limited extreme (observed as sign flips, e.g. r_all=-163)."""

    def _write_play(self, root: Path, name: str, done: int, total: int):
        play_dir = root / "D1_1" / "general"
        play_dir.mkdir(parents=True, exist_ok=True)
        (play_dir / f"{name}.json").write_text(json.dumps({
            "meta": {"scenario_id": "D1_1", "tier": "general"},
            "layout": {"cranes": [{"id": "C1"}], "lifts": [{"id": "L1"}]},
            "outcome": {
                "events": [{"liftId": "L1", "duration": 1, "move": 0}] * done,
                "done": done,
                "total": total,
                "raw": {"idle_steps_total": 0},
            },
        }), encoding="utf-8")

    def test_incomplete_play_is_excluded(self):
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            self._write_play(root, "full", done=3, total=3)
            self._write_play(root, "aborted", done=1, total=3)

            rows = load_human_trajectories(root, tier="general")

        self.assertEqual(len(rows), 1)
        self.assertTrue(rows[0]["path"].endswith("full.json"))


class StandardMaxEntTests(unittest.TestCase):
    """Regression tests for the standard-MaxEnt conversion: the partition
    function is estimated from importance-sampled uniform-random rollouts, not
    from per-demonstration candidate pools."""

    def test_sample_trajectory_space_is_reproducible(self):
        from game_irl.irl_from_plays import sample_trajectory_space
        a = sample_trajectory_space(["D1_1"], n_samples=5, seed=7)
        b = sample_trajectory_space(["D1_1"], n_samples=5, seed=7)
        self.assertIn("D1_1", a)
        self.assertEqual(a["D1_1"]["z"].shape, (5, 7))
        np.testing.assert_allclose(a["D1_1"]["z"], b["D1_1"]["z"])
        np.testing.assert_allclose(a["D1_1"]["logq"], b["D1_1"]["logq"])
        # Proposal log-probs are true log-probabilities of the action sequence.
        self.assertTrue(np.all(a["D1_1"]["logq"] <= 1e-12))
        self.assertTrue(np.isfinite(a["D1_1"]["z"]).all())

    def test_fit_moves_coef_toward_demonstrated_feature(self):
        """Feature matching: when demos show LESS of a cost feature than the
        model expectation, the fitted coefficient must drop below the prior."""
        from game_irl.irl_from_plays import (
            FEATURE_NAMES, PRIOR_THETA, SCALE_VEC, fit_maxent,
        )
        j = FEATURE_NAMES.index("p_move")
        rng = np.random.default_rng(0)
        z = rng.normal(0.0, 1.0, size=(64, 7))
        z[:, j] = rng.uniform(5.0, 10.0, size=64)  # samples move a lot
        demo_z = z.mean(axis=0).copy()
        demo_z[j] = 0.0                            # demos avoid moving
        samples = {"S": {"z": z, "logq": np.zeros(64)}}
        demos = [{"scenario_id": "S", "z": demo_z}] * 3
        fit = fit_maxent(demos, samples, l2=0.01, bootstrap=0)
        prior_coef = PRIOR_THETA[j] * SCALE_VEC[j]
        self.assertLess(fit["coef"][j], prior_coef)
        self.assertEqual(fit["n_demos"], 3)
        self.assertIn("ess_per_scenario", fit["diagnostic"])

    def test_fit_without_matching_scenarios_falls_back_to_defaults(self):
        from game_irl.irl_from_plays import DEFAULT_REWARD_COEFS, FEATURE_NAMES, fit_maxent
        fit = fit_maxent([{"scenario_id": "NOPE", "z": np.zeros(7)}], {}, bootstrap=0)
        self.assertEqual(fit["n_demos"], 0)
        self.assertEqual(fit["coef"], [DEFAULT_REWARD_COEFS[k] for k in FEATURE_NAMES])

    def test_run_irl_end_to_end_on_builtin_scenario(self):
        from game_irl.irl_from_plays import FEATURE_NAMES, run_irl
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            play_dir = root / "D1_1" / "general"
            play_dir.mkdir(parents=True)
            (play_dir / "play.json").write_text(json.dumps({
                "meta": {"scenario_id": "D1_1", "tier": "general"},
                "layout": {"cranes": [{"id": "C1"}], "lifts": [{"id": "L1"}]},
                "outcome": {
                    "events": [
                        {"liftId": "L1", "duration": 25, "move": 3.0, "travel": 1.0,
                         "setup": 10.0, "teardown": 5.0, "sameRadius": True},
                    ],
                    "done": 3, "total": 3,
                    "raw": {"idle_steps_total": 0, "soft_interference_count": 0},
                },
            }), encoding="utf-8")

            result = run_irl(plays_dir=root, tier="general", bootstrap=0, n_samples=8)

        self.assertTrue(result["ok"], result)
        self.assertEqual(result["method"], "maxent_v1")
        self.assertEqual(result["n_human"], 1)
        self.assertEqual(result["n_demo_pools"], 1)
        self.assertEqual(result["per_scenario"]["D1_1"]["z_samples"], 8)
        self.assertIsNotNone(result["per_scenario"]["D1_1"]["ess"])
        for k in FEATURE_NAMES:
            self.assertIn(k, result["reward_coef"])
            self.assertTrue(np.isfinite(result["reward_coef"][k]))


if __name__ == "__main__":
    unittest.main()
