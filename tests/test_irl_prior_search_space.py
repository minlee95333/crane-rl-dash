import copy
import sys
import unittest
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from rl_trainer.auto_reward_opt import (
    DEFAULT_SEARCH_SPACE, _apply_irl_prior_to_search_space,
)


def _prior(coef, ci_low, ci_high, identified=None):
    doc = {
        "method": "test",
        "feature_names": list(DEFAULT_SEARCH_SPACE),
        "reward_coef": coef,
        "reward_coef_ci_low": ci_low,
        "reward_coef_ci_high": ci_high,
    }
    if identified is not None:
        doc["identified"] = identified
    return doc


class ZeroWidthGuardTests(unittest.TestCase):
    """Regression: a coefficient the IRL fit could not move must not narrow the
    trainer's search.

    ``r_single`` and ``r_all`` are constant across the alternatives the
    trajectory-level fit compares, so they never leave the prior and their
    bootstrap interval is floating-point noise. Measured on the study data,
    ``r_single`` came back as [9.999999999782803, 10.000000000237034] — width
    4.5e-10, which is a thousand times the old absolute 1e-12 floor. The guard
    let it through and pinned Optuna's search for that reward term to a single
    point, silently turning an assumption into a fixed hyperparameter.
    """

    def _coef(self):
        return {k: 1.0 for k in DEFAULT_SEARCH_SPACE}

    def test_float_noise_interval_does_not_narrow_the_search(self):
        coef = self._coef()
        coef["r_single"] = 10.0
        lo = dict(coef); hi = dict(coef)
        lo["r_single"] = 9.999999999782803
        hi["r_single"] = 10.000000000237034

        out, meta = _apply_irl_prior_to_search_space(
            copy.deepcopy(DEFAULT_SEARCH_SPACE), _prior(coef, lo, hi))

        self.assertEqual(meta["skipped"].get("r_single"), "zero-width CI")
        self.assertEqual(out["r_single"]["low"], DEFAULT_SEARCH_SPACE["r_single"]["low"])
        self.assertEqual(out["r_single"]["high"], DEFAULT_SEARCH_SPACE["r_single"]["high"])

    def test_the_guard_scales_with_the_coefficient(self):
        """The same absolute width is noise at 100 and real at 0.001."""
        coef = self._coef()
        coef["r_all"] = 100.0
        coef["p_move"] = -0.02
        lo, hi = dict(coef), dict(coef)
        lo["r_all"], hi["r_all"] = 100.0 - 4e-8, 100.0 + 4e-8      # noise at this scale
        lo["p_move"], hi["p_move"] = -0.03, -0.01                   # a real interval

        out, meta = _apply_irl_prior_to_search_space(
            copy.deepcopy(DEFAULT_SEARCH_SPACE), _prior(coef, lo, hi))

        self.assertEqual(meta["skipped"].get("r_all"), "zero-width CI")
        self.assertIn("p_move", meta["applied"])
        self.assertGreater(out["p_move"]["low"], DEFAULT_SEARCH_SPACE["p_move"]["low"])

    def test_a_genuine_interval_still_narrows(self):
        coef = self._coef()
        coef["p_idle"] = -0.536
        lo, hi = dict(coef), dict(coef)
        lo["p_idle"], hi["p_idle"] = -0.569, -0.502

        out, meta = _apply_irl_prior_to_search_space(
            copy.deepcopy(DEFAULT_SEARCH_SPACE), _prior(coef, lo, hi))

        self.assertIn("p_idle", meta["applied"])
        self.assertGreater(out["p_idle"]["low"], DEFAULT_SEARCH_SPACE["p_idle"]["low"])
        self.assertLess(out["p_idle"]["high"], DEFAULT_SEARCH_SPACE["p_idle"]["high"])


class IdentifiedFlagTests(unittest.TestCase):
    """Regression: an explicit ``identified: false`` is authoritative.

    Newer estimators report which coefficients the data could actually move.
    Where that flag says no, the interval must be ignored no matter how wide it
    looks — a wide interval around an unmoved prior is uncertainty about
    nothing, not evidence about the reward.
    """

    def test_unidentified_coefficient_is_skipped_even_with_a_wide_ci(self):
        coef = {k: 1.0 for k in DEFAULT_SEARCH_SPACE}
        coef["r_all"] = 100.0
        lo, hi = dict(coef), dict(coef)
        lo["r_all"], hi["r_all"] = 80.0, 120.0     # wide, but meaningless
        ident = {k: True for k in DEFAULT_SEARCH_SPACE}
        ident["r_all"] = False

        out, meta = _apply_irl_prior_to_search_space(
            copy.deepcopy(DEFAULT_SEARCH_SPACE), _prior(coef, lo, hi, ident))

        self.assertEqual(meta["skipped"].get("r_all"), "not identified by the IRL fit")
        self.assertEqual(out["r_all"]["high"], DEFAULT_SEARCH_SPACE["r_all"]["high"])

    def test_priors_without_the_flag_behave_as_before(self):
        coef = {k: 1.0 for k in DEFAULT_SEARCH_SPACE}
        coef["p_time"] = -0.086
        lo, hi = dict(coef), dict(coef)
        lo["p_time"], hi["p_time"] = -0.096, -0.076

        out, meta = _apply_irl_prior_to_search_space(
            copy.deepcopy(DEFAULT_SEARCH_SPACE), _prior(coef, lo, hi))

        self.assertIn("p_time", meta["applied"])


if __name__ == "__main__":
    unittest.main()
