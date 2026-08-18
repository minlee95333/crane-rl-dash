import sys
import unittest
from pathlib import Path

import numpy as np

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from game_irl.irl_from_plays import FEATURE_NAMES, PRIOR_THETA, SCALE_VEC
from game_irl.step_irl import (
    _loss_grad, _pack, choice_metrics, fit_steps, identifiable_mask,
    requires_of,
)


def _step(chosen, alts, user_id="u1", scenario_id="S1"):
    return {"chosen": np.asarray(chosen, float),
            "alts": [np.asarray(a, float) for a in alts],
            "user_id": user_id, "scenario_id": scenario_id}


class RequiresReconstructionTests(unittest.TestCase):
    """Regression: order_mode precedence lives in meta.order_perm, not layout.

    In the random-order variant the session synthesises ``requires`` at runtime
    from a seed, so the layout JSON carries none. Replaying such a play without
    rebuilding the chain leaves every lift unlocked, the sweep works lifts the
    player could not have worked, and the per-step features describe a game that
    was never played. Measured on the study data, ignoring this broke replay on
    the ORD_* scenarios.
    """

    def test_order_perm_becomes_a_precedence_chain(self):
        doc = {
            "layout": {"lifts": [{"id": "A"}, {"id": "B"}, {"id": "C"}]},
            "meta": {"order_perm": ["C", "A"]},
        }

        req = requires_of(doc)

        self.assertEqual(req["C"], [])       # first in the imposed sequence
        self.assertEqual(req["A"], ["C"])    # waits on the previous one
        self.assertEqual(req["B"], [])       # not in the subset — always free

    def test_structural_precedence_is_never_overridden(self):
        doc = {
            "layout": {"lifts": [{"id": "A", "requires": ["B"]}, {"id": "B"}]},
            "meta": {"order_perm": ["A", "B"]},
        }

        req = requires_of(doc)

        self.assertEqual(req["A"], ["B"])
        self.assertEqual(req["B"], [])


class NormalizerTests(unittest.TestCase):
    """The whole point of this estimator is that Z is exact.

    If the softmax over the candidate set were wrong, the fit would still
    converge — silently, on the wrong objective — exactly as the sampled
    partition function did.
    """

    def test_loss_equals_hand_computed_softmax(self):
        chosen = np.zeros(len(FEATURE_NAMES))
        alt = np.zeros(len(FEATURE_NAMES))
        chosen[5] = 1.0 / SCALE_VEC[5]     # scaled feature difference of exactly 1
        packed = _pack([_step(chosen, [alt])])
        theta = np.zeros(len(FEATURE_NAMES))
        theta[5] = 1.0

        loss, _ = _loss_grad(theta, packed, l2=0.0)

        # -log( e^1 / (e^1 + e^0) ) = log(1 + e^-1)
        self.assertAlmostEqual(loss, float(np.log1p(np.exp(-1.0))), places=9)

    def test_gradient_matches_finite_differences(self):
        rng = np.random.default_rng(0)
        steps = [_step(rng.normal(size=7), [rng.normal(size=7) for _ in range(4)])
                 for _ in range(6)]
        packed = _pack(steps)
        theta = rng.normal(size=7) * 0.1

        _, grad = _loss_grad(theta, packed, l2=0.5)
        num = np.zeros(7)
        for i in range(7):
            e = np.zeros(7)
            e[i] = 1e-6
            hi, _ = _loss_grad(theta + e, packed, l2=0.5)
            lo, _ = _loss_grad(theta - e, packed, l2=0.5)
            num[i] = (hi - lo) / 2e-6

        np.testing.assert_allclose(grad, num, rtol=1e-4, atol=1e-6)

    def test_more_alternatives_never_lowers_the_loss(self):
        """Adding a candidate can only add mass to the normalizer."""
        chosen = np.zeros(7); chosen[5] = 1.0
        alt = np.zeros(7)
        theta = np.zeros(7); theta[5] = 1.0

        few, _ = _loss_grad(theta, _pack([_step(chosen, [alt])]), l2=0.0)
        many, _ = _loss_grad(theta, _pack([_step(chosen, [alt, alt, alt])]), l2=0.0)

        self.assertGreater(many, few)


class FitTests(unittest.TestCase):
    def test_recovers_the_direction_of_a_dominant_feature(self):
        # In every step the human's choice has less busy time than the
        # alternatives, so p_time's coefficient must come out negative.
        rng = np.random.default_rng(1)
        steps = []
        for _ in range(40):
            chosen = np.zeros(7)
            chosen[FEATURE_NAMES.index("p_time")] = 100.0
            alts = []
            for _ in range(5):
                a = np.zeros(7)
                a[FEATURE_NAMES.index("p_time")] = 100.0 + abs(rng.normal(60, 10))
                alts.append(a)
            steps.append(_step(chosen, alts))

        theta, _ = fit_steps(_pack(steps), l2=0.0)

        self.assertLess(theta[FEATURE_NAMES.index("p_time")], 0.0)

    def test_loss_decreases(self):
        rng = np.random.default_rng(2)
        steps = [_step(rng.normal(size=7) * 10,
                       [rng.normal(size=7) * 10 for _ in range(4)])
                 for _ in range(20)]

        _, diag = fit_steps(_pack(steps), l2=1.0, record_history=True)

        self.assertLess(diag["loss_history"][-1], diag["loss_history"][0])


class IdentifiabilityTests(unittest.TestCase):
    """A feature that never varies across a step's options cannot be estimated.

    r_single and r_all are the known cases from the trajectory-level fit; the
    mask has to catch any such feature so a prior value is not reported as a
    result with a confidence interval attached.
    """

    def test_constant_feature_is_flagged_and_stays_at_the_prior(self):
        rng = np.random.default_rng(3)
        steps = []
        for _ in range(20):
            chosen = rng.normal(size=7)
            alts = [rng.normal(size=7) for _ in range(4)]
            for v in [chosen] + alts:
                v[FEATURE_NAMES.index("r_all")] = 1.0   # identical everywhere
            steps.append(_step(chosen, alts))
        packed = _pack(steps)

        mask = identifiable_mask(packed)
        theta, _ = fit_steps(packed, l2=1.0)

        i = FEATURE_NAMES.index("r_all")
        self.assertFalse(mask[i])
        self.assertAlmostEqual(theta[i], PRIOR_THETA[i], places=9)


class L2SensitivityTests(unittest.TestCase):
    """Regression: a coefficient the prior is holding must not be reported as a
    finding.

    The L2 term is centred on the training defaults, so a feature the data says
    little about drifts to its default and stays. Reading that as "the estimate
    reproduces the default" is tautology, not confirmation — measured on this
    study's data, releasing the anchor moved p_time from −0.086 to +0.019 (a
    sign flip) while the choice accuracy barely changed, meaning the data never
    distinguished the two answers.
    """

    def _steps_with_one_informative_feature(self):
        # Only p_move varies between the chosen option and the alternatives, so
        # only p_move can be data-determined; the rest are pinned by the prior.
        rng = np.random.default_rng(5)
        steps = []
        for _ in range(60):
            chosen = np.zeros(7)
            chosen[FEATURE_NAMES.index("p_move")] = 20.0
            alts = []
            for _ in range(4):
                a = np.zeros(7)
                a[FEATURE_NAMES.index("p_move")] = 20.0 + abs(rng.normal(40, 8))
                alts.append(a)
            steps.append(_step(chosen, alts))
        return steps

    def test_only_the_informative_feature_leaves_the_prior(self):
        from game_irl.step_irl import l2_sensitivity

        out = l2_sensitivity(_pack(self._steps_with_one_informative_feature()),
                             levels=(1.0, 0.1, 0.01))
        d = out["distance_from_prior_at_lowest_l2"]

        # Only p_move has a gradient, so only p_move moves off its prior once
        # the anchor is loosened. The rest sit exactly on it.
        self.assertGreater(d["p_move"], 0.5)
        for name in ("r_single", "r_all", "r_same", "p_time"):
            self.assertLess(d[name], 1e-6)

    def test_moving_a_lot_is_not_evidence_of_being_prior_held(self):
        """Regression against the classification this diagnostic used to make.

        A strongly informative feature is held back by a tight prior and springs
        out when it is released — so a large move across L2 does NOT mean the
        prior was holding it. The report must state the movement, not a cause.
        """
        from game_irl.step_irl import l2_sensitivity

        out = l2_sensitivity(_pack(self._steps_with_one_informative_feature()),
                             levels=(1.0, 0.1, 0.01))

        self.assertIn("p_move", out["unstable_across_l2"])
        self.assertGreater(out["distance_from_prior_at_lowest_l2"]["p_move"], 0.5)
        self.assertNotIn("data_determined", out)
        self.assertNotIn("prior_held", out)

    def test_uninformative_features_stay_at_the_prior_across_levels(self):
        from game_irl.step_irl import l2_sensitivity

        out = l2_sensitivity(_pack(self._steps_with_one_informative_feature()),
                             levels=(1.0, 0.1, 0.01))

        for name in ("r_single", "p_time"):
            vals = [out["by_level"][str(l)]["reward_coef"][name]
                    for l in out["levels"]]
            # No gradient at all in these directions, so every level returns the
            # same prior value — they are not estimates.
            self.assertAlmostEqual(min(vals), max(vals), places=6)

    def test_conditioning_reports_the_l2_floor(self):
        from game_irl.step_irl import condition_report, fit_steps as fs

        packed = _pack(self._steps_with_one_informative_feature())
        theta, _ = fs(packed, l2=1.0)

        rep = condition_report(theta, packed, l2=1.0)

        # 2 * l2 / dim — the curvature the prior alone contributes.
        self.assertAlmostEqual(rep["l2_floor"], 2.0 / 7, places=9)
        # Directions with no data behind them sit at that floor.
        flat = [e for e in rep["eigen"] if abs(e["data_curvature"]) < 1e-6]
        self.assertGreaterEqual(len(flat), 1)


class ChoiceMetricTests(unittest.TestCase):
    """Accuracy must be reported against the right chance level.

    With 17 options a top-1 rate of 0.2 is three times chance, not a failure;
    reading it against 0.5 would invert the conclusion.
    """

    def test_chance_reflects_the_option_count(self):
        chosen = np.zeros(7)
        steps = [_step(chosen, [np.zeros(7) for _ in range(9)]) for _ in range(5)]

        out = choice_metrics(np.zeros(7), _pack(steps))

        self.assertAlmostEqual(out["chance"], 0.1)
        self.assertAlmostEqual(out["mean_options"], 10.0)

    def test_perfect_ranking_scores_one(self):
        chosen = np.zeros(7); chosen[5] = -1.0
        alts = [np.zeros(7) for _ in range(4)]
        theta = np.zeros(7); theta[5] = -1.0

        out = choice_metrics(theta, _pack([_step(chosen, alts)]))

        self.assertEqual(out["top1"], 1.0)
        self.assertEqual(out["mean_percentile"], 1.0)


if __name__ == "__main__":
    unittest.main()
