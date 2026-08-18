import sys
import tempfile
import unittest
from pathlib import Path

import numpy as np

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from game_irl.cohort_irl import (
    cohort_play_ids, fit_steps_fixed, fixed_indices, load_cache, save_cache, vif,
)
from game_irl.irl_from_plays import FEATURE_NAMES, PRIOR_THETA, SCALE_VEC
from game_irl.step_irl import _pack, fit_steps


def _step(chosen, alts, play_id=0, score=50.0, user_id="u1", scenario_id="S1"):
    return {"chosen": np.asarray(chosen, float),
            "alts": [np.asarray(a, float) for a in alts],
            "user_id": user_id, "scenario_id": scenario_id,
            "play_id": play_id, "play_score": score, "total_score": score}


def _plays(scenario, scores, start_id=0):
    """One step per play, so play-level selection is directly observable."""
    return [_step([1.0] * 7, [[0.0] * 7], play_id=start_id + i, score=s,
                  scenario_id=scenario, user_id=f"u{i}")
            for i, s in enumerate(scores)]


class CohortSelectionTests(unittest.TestCase):
    """The cohort split exists to remove a difficulty confound, so the ranking
    must stay inside a scenario.

    Measured on the study data, ranking plays in one pooled list put 0% of the
    top decile's plays on the two hardest tiers: totalScore is not comparable
    across scenarios (mean 91.4 on tutorial maps against 70.4 on the hardest),
    so a pooled top-X% is a sample of easy maps wearing a quality label.
    """

    def test_selection_is_per_scenario_not_pooled(self):
        steps = _plays("EASY", [95.0, 94.0, 93.0, 92.0]) + \
                _plays("HARD", [60.0, 55.0, 50.0, 45.0], start_id=10)

        keep, per_scen = cohort_play_ids(steps, 0.5)

        chosen = {s["scenario_id"] for s in steps if s["play_id"] in keep}
        self.assertEqual(chosen, {"EASY", "HARD"})   # a pooled rank keeps EASY only
        self.assertEqual(per_scen["EASY"]["n_kept"], 2)
        self.assertEqual(per_scen["HARD"]["n_kept"], 2)

    def test_keeps_the_highest_scoring_plays_of_each_scenario(self):
        steps = _plays("S", [10.0, 90.0, 50.0, 70.0])

        keep, _ = cohort_play_ids(steps, 0.5)

        kept_scores = sorted(s["play_score"] for s in steps if s["play_id"] in keep)
        self.assertEqual(kept_scores, [70.0, 90.0])

    def test_cohorts_are_nested(self):
        steps = _plays("S", [float(i) for i in range(20)])

        top20, _ = cohort_play_ids(steps, 0.2)
        top50, _ = cohort_play_ids(steps, 0.5)
        top100, _ = cohort_play_ids(steps, 1.0)

        self.assertTrue(top20 < top50 < top100)
        self.assertEqual(len(top100), 20)

    def test_every_scenario_survives_the_narrowest_cohort(self):
        """A scenario with few plays must not vanish: dropping it would change
        the difficulty mix, which is the thing being controlled for."""
        steps = _plays("BIG", [float(i) for i in range(30)]) + \
                _plays("SMALL", [1.0, 2.0], start_id=100)

        keep, _ = cohort_play_ids(steps, 0.05)

        kept_scens = {s["scenario_id"] for s in steps if s["play_id"] in keep}
        self.assertEqual(kept_scens, {"BIG", "SMALL"})

    def test_selection_is_deterministic_under_ties(self):
        steps = _plays("S", [50.0, 50.0, 50.0, 50.0])

        first, _ = cohort_play_ids(steps, 0.5)
        second, _ = cohort_play_ids(list(reversed(steps)), 0.5)

        self.assertEqual(first, second)

    def test_rejects_a_fraction_outside_the_unit_interval(self):
        steps = _plays("S", [1.0, 2.0])
        for bad in (0.0, -0.1, 1.5):
            with self.assertRaises(ValueError):
                cohort_play_ids(steps, bad)


class ConstrainedFitTests(unittest.TestCase):
    """r_single and r_all are design constants, not findings.

    Every stored play completes every lift, so at trajectory level both features
    are constant and the fit cannot move them off the L2 centre — a zero-width
    interval there is the signature of a coefficient the data never saw, not a
    precise one. Pinning them and re-fitting the rest makes that explicit and
    shows how much of the remaining coefficients was the specification.
    """

    def test_fixed_dimensions_keep_their_design_value(self):
        rng = np.random.default_rng(0)
        steps = [_step(rng.normal(size=7), [rng.normal(size=7) for _ in range(4)],
                       play_id=i, user_id=f"u{i % 3}") for i in range(30)]

        theta, _ = fit_steps_fixed(_pack(steps), l2=1.0)

        for i in fixed_indices():
            self.assertAlmostEqual(theta[i], PRIOR_THETA[i], places=12)

    def test_free_dimensions_still_move(self):
        rng = np.random.default_rng(1)
        steps = [_step(rng.normal(size=7), [rng.normal(size=7) for _ in range(4)],
                       play_id=i, user_id=f"u{i % 3}") for i in range(30)]

        theta, _ = fit_steps_fixed(_pack(steps), l2=1.0)

        free = [i for i in range(len(FEATURE_NAMES)) if i not in fixed_indices()]
        moved = [i for i in free if abs(theta[i] - PRIOR_THETA[i]) > 1e-6]
        self.assertTrue(moved, "고정 차원 외에는 움직여야 한다")

    def test_pinning_cannot_lower_the_unconstrained_loss(self):
        """The constrained optimum lives inside the free one's feasible set, so
        its loss is an upper bound. A lower one would mean the free fit stopped
        early."""
        rng = np.random.default_rng(2)
        steps = [_step(rng.normal(size=7), [rng.normal(size=7) for _ in range(4)],
                       play_id=i, user_id=f"u{i % 3}") for i in range(40)]
        packed = _pack(steps)

        _, free_diag = fit_steps(packed, l2=1.0)
        _, fixed_diag = fit_steps_fixed(packed, l2=1.0)

        self.assertGreaterEqual(fixed_diag["loss"], free_diag["loss"] - 1e-9)

    def test_a_constant_feature_leaves_the_free_fit_at_the_prior_too(self):
        """Same fact from the other side: pinning changes nothing for a feature
        that already carries no gradient."""
        steps = []
        for i in range(20):
            chosen = np.zeros(7)
            chosen[3] = 1.0
            alt = np.zeros(7)
            alt[3] = -1.0
            steps.append(_step(chosen, [alt], play_id=i, user_id=f"u{i % 3}"))

        theta, _ = fit_steps(_pack(steps), l2=1.0)

        for i in fixed_indices():
            self.assertAlmostEqual(theta[i], PRIOR_THETA[i], places=9)


class VifTests(unittest.TestCase):
    """VIF is computed on candidate-minus-chosen differences, because that is
    the only thing the estimator ever reads."""

    def test_a_duplicated_direction_is_flagged(self):
        rng = np.random.default_rng(3)
        steps = []
        for i in range(40):
            chosen = rng.normal(size=7)
            chosen[1] = chosen[0]            # r_all copies r_single exactly
            alt = rng.normal(size=7)
            alt[1] = alt[0]
            steps.append(_step(chosen, [alt], play_id=i))

        scores, n_rows = vif(_pack(steps))

        self.assertEqual(n_rows, 40)
        self.assertGreater(scores["r_single"], 100)
        self.assertGreater(scores["r_all"], 100)
        self.assertLess(scores["p_move"], 10)

    def test_independent_features_stay_near_one(self):
        rng = np.random.default_rng(4)
        steps = [_step(rng.normal(size=7), [rng.normal(size=7)], play_id=i)
                 for i in range(200)]

        scores, _ = vif(_pack(steps))

        for name in FEATURE_NAMES:
            self.assertLess(scores[name], 3.0)


class CacheRoundTripTests(unittest.TestCase):
    """Candidate generation dominates the runtime, so every re-analysis reads a
    cache. The cache must carry play identity and score or the cohorts cannot be
    rebuilt from it."""

    def test_play_id_and_score_survive_the_round_trip(self):
        steps = [_step([1.0] * 7, [[0.5] * 7, [0.2] * 7], play_id=7, score=88.5,
                       user_id="alice", scenario_id="D1_1"),
                 _step([0.3] * 7, [[0.1] * 7], play_id=9, score=None,
                       user_id="bob", scenario_id="D5_1")]

        with tempfile.TemporaryDirectory() as tmp:
            path = Path(tmp) / "c.npz"
            save_cache(path, steps, {"note": "t"})
            back, meta = load_cache(path)

        self.assertEqual(meta["note"], "t")
        self.assertEqual([s["play_id"] for s in back], [7, 9])
        self.assertEqual(back[0]["play_score"], 88.5)
        self.assertIsNone(back[1]["play_score"])
        self.assertEqual(back[0]["user_id"], "alice")
        self.assertEqual(back[1]["scenario_id"], "D5_1")
        # padding must not leak in as extra alternatives
        self.assertEqual(len(back[0]["alts"]), 2)
        self.assertEqual(len(back[1]["alts"]), 1)
        np.testing.assert_allclose(back[0]["chosen"], np.ones(7), atol=1e-9)

    def test_scaling_is_undone_on_load(self):
        steps = [_step([2.0] * 7, [[1.0] * 7], play_id=1)]

        with tempfile.TemporaryDirectory() as tmp:
            path = Path(tmp) / "c.npz"
            save_cache(path, steps, {})
            back, _ = load_cache(path)

        np.testing.assert_allclose(back[0]["chosen"], np.full(7, 2.0), rtol=1e-9)
        self.assertTrue(np.all(np.isfinite(SCALE_VEC)))


if __name__ == "__main__":
    unittest.main()
