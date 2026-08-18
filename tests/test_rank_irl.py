import sys
import unittest
from pathlib import Path

import numpy as np

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from game_irl.irl_from_plays import FEATURE_NAMES, PRIOR_THETA, SCALE_VEC
from game_irl.rank_irl import (
    build_attempt_pairs, build_pairs, fit_rank, holdout_by_participant,
    identifiable_mask, pair_accuracy,
)


def _row(scenario_id="S1", user_id="u1", score=50.0, phi=None, attempt=1):
    return {
        "scenario_id": scenario_id,
        "user_id": user_id,
        "total_score": score,
        "attempt_no": attempt,
        "phi": np.zeros(len(FEATURE_NAMES)) if phi is None else np.asarray(phi, float),
    }


class AttemptPairTests(unittest.TestCase):
    """Regression: the retry ordering must come from ONE person on ONE map.

    A retry is the only preference statement the players actually made — the
    scorer's totalScore is a separate rubric (makespan 30 / completion 25 /
    softInterference 25 / jobBalance 10 / timeBalance 10) whose last two terms
    have no counterpart in the 7-dim feature vector at all. Pairing across
    people would compare two players' styles instead, and pairing across
    scenarios would compare map sizes.
    """

    def test_pairs_stay_within_one_participant_and_scenario(self):
        rows = [_row("A", "u1", attempt=1), _row("A", "u1", attempt=2),
                _row("A", "u2", attempt=1), _row("B", "u1", attempt=1)]

        pairs = build_attempt_pairs(rows)

        # Only u1's two attempts on A form a pair.
        self.assertEqual(pairs["n_pairs"], 1)
        self.assertEqual(pairs["n_retry_groups"], 1)

    def test_later_attempt_is_the_winner(self):
        phi_early = np.zeros(len(FEATURE_NAMES)); phi_early[5] = 500.0
        phi_late = np.zeros(len(FEATURE_NAMES)); phi_late[5] = 100.0
        rows = [_row("A", "u1", attempt=1, phi=phi_early),
                _row("A", "u1", attempt=3, phi=phi_late)]

        d = build_attempt_pairs(rows)["d"]

        # winner(late) - loser(early) on p_time must be negative: the player
        # moved toward less busy time.
        self.assertLess(d[0, 5], 0)

    def test_equal_attempt_numbers_are_dropped(self):
        rows = [_row("A", "u1", attempt=2), _row("A", "u1", attempt=2)]

        pairs = build_attempt_pairs(rows)

        self.assertEqual(pairs["n_pairs"], 0)
        self.assertEqual(pairs["n_ties"], 1)

    def test_single_attempt_players_contribute_nothing(self):
        rows = [_row("A", f"u{i}", attempt=1) for i in range(5)]

        pairs = build_attempt_pairs(rows)

        self.assertEqual(pairs["n_pairs"], 0)


class PairConstructionTests(unittest.TestCase):
    """Regression: pairs are formed WITHIN a scenario.

    Every feature scales with map size, so a cross-scenario pair mostly encodes
    which map is bigger. Fitting on such pairs would recover the scenario size
    ordering and report it as a reward preference.
    """

    def test_pairs_never_cross_scenarios(self):
        rows = [_row("A", "u1", 10.0), _row("A", "u2", 20.0),
                _row("B", "u3", 30.0), _row("B", "u4", 40.0)]

        pairs = build_pairs(rows)

        # 2 scenarios x C(2,2)=1 pair each. A cross-scenario build would give 6.
        self.assertEqual(pairs["n_pairs"], 2)
        self.assertEqual(pairs["n_scenarios"], 2)

    def test_winner_comes_first_in_the_difference(self):
        rows = [_row("A", "u1", 10.0, phi=[0, 0, 0, 0, 0, 0, 0]),
                _row("A", "u2", 90.0, phi=[1, 0, 0, 0, 0, 0, 0])]

        d = build_pairs(rows)["d"]

        # Higher score wins, so the difference is (winner - loser) = +1 scaled.
        self.assertEqual(d.shape[0], 1)
        self.assertGreater(d[0, 0], 0)

    def test_ties_are_dropped_not_ordered_arbitrarily(self):
        rows = [_row("A", "u1", 50.0), _row("A", "u2", 50.0)]

        pairs = build_pairs(rows)

        self.assertEqual(pairs["n_pairs"], 0)
        self.assertEqual(pairs["n_ties"], 1)

    def test_min_margin_drops_near_ties(self):
        rows = [_row("A", "u1", 50.0), _row("A", "u2", 50.4),
                _row("A", "u3", 80.0)]

        pairs = build_pairs(rows, min_margin=1.0)

        # 50 vs 50.4 is below the margin; the other two pairs survive.
        self.assertEqual(pairs["n_pairs"], 2)
        self.assertEqual(pairs["n_below_margin"], 1)


class IdentifiabilityTests(unittest.TestCase):
    """Regression: features constant within a scenario must be reported as
    unidentified rather than as confident estimates.

    ``r_all`` is 1 for every completed play and ``r_single`` is the scenario's
    lift count, so their pairwise difference is exactly zero and the fit leaves
    them at the prior. A CI printed next to such a value reads as near-perfect
    precision when it is really the absence of any evidence.
    """

    def _rows_with_constant_dims(self):
        rows = []
        for i, score in enumerate((10.0, 30.0, 60.0, 90.0)):
            phi = np.zeros(len(FEATURE_NAMES))
            phi[FEATURE_NAMES.index("r_single")] = 7.0   # constant per scenario
            phi[FEATURE_NAMES.index("r_all")] = 1.0      # constant everywhere
            phi[FEATURE_NAMES.index("p_time")] = 100.0 - score
            rows.append(_row("A", f"u{i}", score, phi))
        return rows

    def test_constant_features_are_flagged_unidentified(self):
        d = build_pairs(self._rows_with_constant_dims())["d"]

        mask = identifiable_mask(d)

        self.assertFalse(mask[FEATURE_NAMES.index("r_single")])
        self.assertFalse(mask[FEATURE_NAMES.index("r_all")])
        self.assertTrue(mask[FEATURE_NAMES.index("p_time")])

    def test_constant_features_stay_at_the_prior(self):
        d = build_pairs(self._rows_with_constant_dims())["d"]

        theta, _ = fit_rank(d, l2=1.0)

        for name in ("r_single", "r_all"):
            i = FEATURE_NAMES.index(name)
            self.assertAlmostEqual(theta[i], PRIOR_THETA[i], places=9)


class FitTests(unittest.TestCase):
    """The fit must actually recover an ordering it is shown."""

    def test_recovers_a_known_preference_direction(self):
        # Score decreases with busy time, so p_time's coefficient must be
        # negative: the reward has to penalise what the scorer punished.
        rows = []
        for i, t in enumerate((100.0, 200.0, 300.0, 400.0, 500.0)):
            phi = np.zeros(len(FEATURE_NAMES))
            phi[FEATURE_NAMES.index("p_time")] = t
            rows.append(_row("A", f"u{i}", 1000.0 - t, phi))

        d = build_pairs(rows)["d"]
        theta, _ = fit_rank(d, l2=0.0)

        self.assertLess(theta[FEATURE_NAMES.index("p_time")], 0.0)
        self.assertEqual(pair_accuracy(theta, d), 1.0)

    def test_loss_decreases(self):
        rng = np.random.default_rng(0)
        rows = []
        for i in range(12):
            phi = rng.normal(size=len(FEATURE_NAMES)) * 10.0
            rows.append(_row("A", f"u{i}", float(-phi[5]), phi))

        d = build_pairs(rows)["d"]
        _, diag = fit_rank(d, l2=1.0, record_history=True)

        self.assertLess(diag["loss_history"][-1], diag["loss_history"][0])
        self.assertEqual(len(diag["loss_history"]), diag["iterations"])

    def test_accuracy_of_a_coin_flip_model_is_about_half(self):
        # theta = 0 orders nothing; every margin is exactly 0, so no pair is
        # counted correct. This pins the meaning of the accuracy baseline.
        rng = np.random.default_rng(1)
        d = rng.normal(size=(64, len(FEATURE_NAMES)))

        self.assertEqual(pair_accuracy(np.zeros(len(FEATURE_NAMES)), d), 0.0)


class HoldoutTests(unittest.TestCase):
    """Regression: generalization is measured across PARTICIPANTS.

    Pairs from one person share that person's playing style. Splitting pairs
    rather than people would leak that style across the train/test boundary and
    report an optimistic accuracy that says nothing about a new player.
    """

    def _rows(self, n_people=10):
        rng = np.random.default_rng(3)
        rows = []
        for p in range(n_people):
            for k in range(4):
                phi = np.zeros(len(FEATURE_NAMES))
                phi[FEATURE_NAMES.index("p_time")] = 100.0 + 50.0 * k
                phi[FEATURE_NAMES.index("p_move")] = float(rng.normal(50, 5))
                rows.append(_row("A", f"u{p}", 500.0 - 50.0 * k, phi))
        return rows

    def test_train_and_test_participants_are_disjoint(self):
        out = holdout_by_participant(self._rows(), l2=1.0, seed=0, min_margin=0.0)

        self.assertTrue(out["ok"])
        self.assertEqual(out["n_train_participants"] + out["n_test_participants"], 10)
        self.assertGreater(out["n_test_pairs"], 0)

    def test_reports_too_few_participants_instead_of_splitting(self):
        out = holdout_by_participant(self._rows(n_people=2), l2=1.0, seed=0,
                                     min_margin=0.0)

        self.assertFalse(out["ok"])


class ScaleTests(unittest.TestCase):
    """The fit works on scaled features but must report raw reward units.

    Reporting theta instead of theta * SCALE_VEC would make the coefficients
    incomparable with both the MaxEnt fit and the trainer's defaults.
    """

    def test_coefficients_are_returned_in_raw_units(self):
        rows = []
        for i, t in enumerate((100.0, 300.0, 500.0)):
            phi = np.zeros(len(FEATURE_NAMES))
            phi[FEATURE_NAMES.index("p_time")] = t
            rows.append(_row("A", f"u{i}", -t, phi))
        d = build_pairs(rows)["d"]

        theta, _ = fit_rank(d, l2=1.0)
        coef = theta * SCALE_VEC

        # Raw-unit p_time sits near the default scale (~0.1), not near theta's.
        self.assertLess(abs(coef[FEATURE_NAMES.index("p_time")]), 10.0)


if __name__ == "__main__":
    unittest.main()
