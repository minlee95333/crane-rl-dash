"""Ranking-based reward estimation (Bradley-Terry) over human plays.

Standard trajectory-level MaxEnt needs the partition function Z over a
scenario's whole trajectory space, and estimating it by sampling failed on this
dataset: the demonstrations sit outside the sampled support, so per-scenario
effective sample sizes collapsed to ~1 and the p_idle feature-matching residual
stayed above 11 demo standard deviations no matter how the proposal was tilted
(uniform, rank-softmax, lift-mixture, human-KDE, setup persistence).

This estimator removes Z entirely. Instead of asking "how probable is this
trajectory among all trajectories", it asks "given two plays of the SAME
scenario, does the reward rank them the way the scorer did":

    P(A > B) = sigmoid(theta . (phi_A - phi_B))

The normalizer is per pair and closed-form, so nothing has to be sampled. What
is lost is the maximum-entropy interpretation — this fits rank reproduction,
not a distribution over trajectories. It is therefore a cross-check on, not a
replacement for, a working MaxEnt fit.

Two design rules matter for the result to mean anything:

* **Pairs are formed within a scenario.** Features scale with map size, so a
  cross-scenario pair would mostly measure which map is bigger.
* **Bootstrap resamples participants, not plays.** One participant contributes
  114 of the 999 plays; resampling plays would treat that person's repeat
  attempts as independent evidence and report a confidence interval several
  times too narrow.

Note that ``r_single`` and ``r_all`` are constant within a scenario for
completed plays, so their pairwise difference is exactly zero and they carry no
gradient here either. That is the same structural non-identifiability the
MaxEnt fit hit; it is a property of the study design, not of the estimator.
"""
from __future__ import annotations

import argparse
import json
import math
import sys
from pathlib import Path
from typing import Dict, List, Optional, Sequence, Tuple

import numpy as np

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

try:
    from .irl_from_plays import (
        DEFAULT_REWARD_COEFS, FEATURE_NAMES, PRIOR_THETA, SCALE_VEC,
        cohort_summary, load_human_trajectories,
    )
except ImportError:  # script execution
    from game_irl.irl_from_plays import (  # type: ignore
        DEFAULT_REWARD_COEFS, FEATURE_NAMES, PRIOR_THETA, SCALE_VEC,
        cohort_summary, load_human_trajectories,
    )


# ---------------------------------------------------------------------------
# Pair construction

def attach_scores(rows: Sequence[Dict]) -> int:
    """Read ``scorer_snapshot.totalScore`` into each row; return how many hit."""
    n = 0
    for r in rows:
        r["total_score"] = None
        path = r.get("path")
        if not path:
            continue
        try:
            doc = json.loads(Path(path).read_text(encoding="utf-8"))
        except (OSError, json.JSONDecodeError):
            continue
        try:
            r["total_score"] = float((doc.get("scorer_snapshot") or {}).get("totalScore"))
        except (TypeError, ValueError):
            continue
        n += 1
    return n


def build_attempt_pairs(rows: Sequence[Dict]) -> Dict:
    """Pairs ordered by a participant's OWN retry sequence, not by the scorer.

    ``totalScore`` is not a proxy for player preference: it is a separate rubric
    weighting makespan 30, completion 25, soft interference 25, job balance 10
    and time balance 10. Two of those (job balance, time balance) have no
    counterpart in the 7-dim feature vector at all, and three features the
    reward does carry (r_same, p_idle, p_move) are absent from the rubric. So
    ranking on the score fits agreement with the game's scoring rule, not with
    the player.

    A retry is a preference statement the player made themselves: having seen
    their own result, they played the same scenario again and submitted a
    different plan. The later attempt is taken as preferred. Pairs are formed
    within (participant, scenario), so no cross-player or cross-map comparison
    enters, and the ordering comes from human behaviour rather than a rubric.

    The assumption is that a later attempt is a deliberate improvement. It can
    be wrong — a player may experiment or get worse — which is why the fit's
    pair accuracy is reported rather than assumed.
    """
    by_key: Dict[Tuple[str, str], List[Dict]] = {}
    for r in rows:
        uid = str(r.get("user_id") or "")
        if not uid:
            continue
        by_key.setdefault((uid, r["scenario_id"]), []).append(r)

    diffs: List[np.ndarray] = []
    pair_users: List[Tuple[str, str]] = []
    pair_scen: List[str] = []
    n_equal_attempt = 0
    for (uid, sid), group in sorted(by_key.items()):
        group = [g for g in group if g.get("attempt_no") is not None]
        for i in range(len(group)):
            for j in range(i + 1, len(group)):
                a, b = group[i], group[j]
                if a["attempt_no"] == b["attempt_no"]:
                    n_equal_attempt += 1
                    continue
                win, lose = (a, b) if a["attempt_no"] > b["attempt_no"] else (b, a)
                diffs.append((win["phi"] - lose["phi"]) * SCALE_VEC)
                pair_users.append((uid, uid))
                pair_scen.append(sid)
    return {
        "d": np.stack(diffs, axis=0) if diffs else np.zeros((0, len(FEATURE_NAMES))),
        "pair_users": pair_users,
        "pair_scenario": pair_scen,
        "n_pairs": len(diffs),
        "n_ties": n_equal_attempt,
        "n_below_margin": 0,
        "n_same_user_pairs": len(diffs),   # every pair is one person vs themselves
        "n_scenarios": len({s for s in pair_scen}),
        "n_retry_groups": sum(1 for g in by_key.values() if len(g) > 1),
    }


def build_pairs(rows: Sequence[Dict], min_margin: float = 0.0) -> Dict:
    """Ordered (winner, loser) feature differences, formed within a scenario.

    ``min_margin`` drops pairs whose scores are closer than the margin. Two
    plays a fraction of a point apart carry no ranking information but do carry
    feature noise, so including them adds variance without signal. It defaults
    to 0 (keep every non-tie) because the honest threshold depends on the
    scorer's resolution, which is the researcher's call.

    Returns the difference matrix, the participant id of each play in the pair
    (for cluster bootstrap) and the counts that were dropped and why.
    """
    by_scen: Dict[str, List[Dict]] = {}
    for r in rows:
        if r.get("total_score") is None:
            continue
        by_scen.setdefault(r["scenario_id"], []).append(r)

    diffs: List[np.ndarray] = []
    pair_users: List[Tuple[str, str]] = []
    pair_scen: List[str] = []
    ties = 0
    below_margin = 0
    same_user = 0
    for sid, group in sorted(by_scen.items()):
        for i in range(len(group)):
            for j in range(i + 1, len(group)):
                a, b = group[i], group[j]
                sa, sb = a["total_score"], b["total_score"]
                if sa == sb:
                    ties += 1
                    continue
                if abs(sa - sb) < min_margin:
                    below_margin += 1
                    continue
                # A pair of the same person's two attempts compares that person
                # against themselves; it is real ranking information, but it is
                # counted separately so its weight can be inspected.
                if a.get("user_id") and a.get("user_id") == b.get("user_id"):
                    same_user += 1
                win, lose = (a, b) if sa > sb else (b, a)
                diffs.append((win["phi"] - lose["phi"]) * SCALE_VEC)
                pair_users.append((str(win.get("user_id") or ""),
                                   str(lose.get("user_id") or "")))
                pair_scen.append(sid)
    return {
        "d": np.stack(diffs, axis=0) if diffs else np.zeros((0, len(FEATURE_NAMES))),
        "pair_users": pair_users,
        "pair_scenario": pair_scen,
        "n_pairs": len(diffs),
        "n_ties": ties,
        "n_below_margin": below_margin,
        "n_same_user_pairs": same_user,
        "n_scenarios": len(by_scen),
    }


# ---------------------------------------------------------------------------
# Fit

def _loss_grad(theta: np.ndarray, d: np.ndarray, l2: float) -> Tuple[float, np.ndarray]:
    """Mean negative log-likelihood of the observed orderings, plus an L2 prior.

    The prior is centred on PRIOR_THETA (the current training coefficients), the
    same anchor the MaxEnt fit uses, so the two runs' coefficients are directly
    comparable rather than differing by an arbitrary regularization origin.
    """
    z = d @ theta
    # log(1 + exp(-z)) computed stably for both signs.
    loss = float(np.mean(np.logaddexp(0.0, -z)))
    sig = 1.0 / (1.0 + np.exp(np.clip(z, -500, 500)))   # = sigmoid(-z)
    grad = -(d * sig[:, None]).mean(axis=0)
    delta = theta - PRIOR_THETA
    loss += l2 * float(np.sum(delta * delta)) / len(theta)
    grad = grad + (2.0 * l2 / len(theta)) * delta
    return loss, grad


def fit_rank(d: np.ndarray, l2: float = 1.0, lr: float = 0.05,
             max_iter: int = 3000, tol: float = 1e-9,
             record_history: bool = False) -> Tuple[np.ndarray, Dict]:
    """Adam fit of the dimensionless multipliers, mirroring ``_maxent_fit``."""
    theta = PRIOR_THETA.astype(np.float64).copy()
    m = np.zeros_like(theta)
    v = np.zeros_like(theta)
    best_theta, best_loss = theta.copy(), float("inf")
    beta1, beta2, eps = 0.9, 0.999, 1e-8
    hist: List[float] = []
    it = 0
    for it in range(1, max_iter + 1):
        loss, grad = _loss_grad(theta, d, l2)
        if record_history:
            hist.append(float(loss))
        if loss < best_loss:
            best_loss, best_theta = loss, theta.copy()
        if float(np.max(np.abs(grad))) < tol:
            break
        m = beta1 * m + (1 - beta1) * grad
        v = beta2 * v + (1 - beta2) * (grad * grad)
        theta = theta - lr * (m / (1 - beta1 ** it)) / (np.sqrt(v / (1 - beta2 ** it)) + eps)
        theta = np.clip(theta, -1000.0, 1000.0)
    diag = {"loss": best_loss, "iterations": it}
    if record_history:
        diag["loss_history"] = hist
    return best_theta, diag


def pair_accuracy(theta: np.ndarray, d: np.ndarray) -> float:
    """Fraction of pairs the fitted reward orders the way the scorer did."""
    if d.shape[0] == 0:
        return float("nan")
    return float(np.mean((d @ theta) > 0))


def identifiable_mask(d: np.ndarray, tol: float = 1e-12) -> np.ndarray:
    """Features whose pairwise difference is not identically zero.

    A feature that never differs between two plays of the same scenario cannot
    be ranked on, so its coefficient stays at the prior. Reporting the mask is
    what keeps that from being read as a confident estimate.
    """
    return np.max(np.abs(d), axis=0) > tol if d.shape[0] else np.zeros(
        d.shape[1], dtype=bool)


# ---------------------------------------------------------------------------
# Uncertainty and generalization, both clustered by participant

def _participants(rows: Sequence[Dict]) -> List[str]:
    return sorted({str(r.get("user_id") or "") for r in rows if r.get("user_id")})


def _pairs_for(rows: Sequence[Dict], rank_by: str, min_margin: float) -> Dict:
    if rank_by == "attempt":
        return build_attempt_pairs(rows)
    return build_pairs(rows, min_margin=min_margin)


def bootstrap_by_participant(rows: Sequence[Dict], l2: float, n_boot: int,
                             seed: int, min_margin: float,
                             rank_by: str = "score") -> Dict:
    """Cluster bootstrap: resample PARTICIPANTS, rebuild pairs, refit.

    Resampling plays instead would treat one participant's 114 attempts as 114
    independent observations and shrink the interval by roughly the square root
    of that clustering.
    """
    people = _participants(rows)
    by_person: Dict[str, List[Dict]] = {p: [] for p in people}
    for r in rows:
        uid = str(r.get("user_id") or "")
        if uid in by_person:
            by_person[uid].append(r)
    rng = np.random.default_rng(seed)
    coefs = []
    for _ in range(int(n_boot)):
        picked = rng.choice(len(people), size=len(people), replace=True)
        sample: List[Dict] = []
        for idx in picked:
            sample.extend(by_person[people[idx]])
        pairs = _pairs_for(sample, rank_by, min_margin)
        if pairs["n_pairs"] < len(FEATURE_NAMES):
            continue
        theta, _ = fit_rank(pairs["d"], l2=l2)
        coefs.append(theta * SCALE_VEC)
    if not coefs:
        z = [None] * len(FEATURE_NAMES)
        return {"n_ok": 0, "std": z, "ci_low": z, "ci_high": z}
    C = np.stack(coefs, axis=0)
    return {
        "n_ok": int(C.shape[0]),
        "std": C.std(axis=0, ddof=1).tolist(),
        "ci_low": np.percentile(C, 2.5, axis=0).tolist(),
        "ci_high": np.percentile(C, 97.5, axis=0).tolist(),
    }


def holdout_by_participant(rows: Sequence[Dict], l2: float, seed: int,
                           min_margin: float, frac: float = 0.3,
                           rank_by: str = "score") -> Dict:
    """Fit on one set of participants, score pairs from the held-out ones.

    Splitting on participants rather than pairs is what makes this a
    generalization test: pairs from the same person share that person's style,
    so a pair-level split would leak it across the boundary.
    """
    people = _participants(rows)
    if len(people) < 4:
        return {"ok": False, "message": f"참가자 {len(people)}명 — 분할 불가"}
    rng = np.random.default_rng(seed)
    order = rng.permutation(len(people))
    n_test = max(1, int(round(len(people) * frac)))
    test_ids = {people[i] for i in order[:n_test]}
    train = [r for r in rows if str(r.get("user_id") or "") not in test_ids]
    test = [r for r in rows if str(r.get("user_id") or "") in test_ids]
    tr = _pairs_for(train, rank_by, min_margin)
    te = _pairs_for(test, rank_by, min_margin)
    if tr["n_pairs"] < len(FEATURE_NAMES) or te["n_pairs"] == 0:
        return {"ok": False, "message": "분할 후 쌍이 부족합니다"}
    theta, _ = fit_rank(tr["d"], l2=l2)
    return {
        "ok": True,
        "n_train_participants": len(people) - n_test,
        "n_test_participants": n_test,
        "n_train_pairs": tr["n_pairs"],
        "n_test_pairs": te["n_pairs"],
        "train_accuracy": pair_accuracy(theta, tr["d"]),
        "test_accuracy": pair_accuracy(theta, te["d"]),
        # The reward is only useful if it beats calling every pair a coin flip.
        "baseline_accuracy": 0.5,
        "prior_test_accuracy": pair_accuracy(PRIOR_THETA, te["d"]),
    }


# ---------------------------------------------------------------------------
# Orchestration

def analyze(plays_dir: Path, l2: float, n_boot: int, seed: int,
            collapse_repeats: bool, min_margin: float,
            rank_by: str = "score") -> Dict:
    if rank_by not in ("score", "attempt"):
        raise ValueError(f"unsupported rank_by: {rank_by}")
    if rank_by == "attempt" and collapse_repeats:
        # Collapsing keeps one attempt per (participant, scenario), which is
        # exactly the data the attempt ordering is made of.
        raise SystemExit("rank_by=attempt 는 --keep-repeats 와 함께 써야 합니다.")
    rows = load_human_trajectories(plays_dir, collapse_repeats=collapse_repeats)
    if not rows:
        raise SystemExit("적합 가능한 시연이 없습니다.")
    n_scored = attach_scores(rows)
    if rank_by == "score":
        rows = [r for r in rows if r.get("total_score") is not None]
        if not rows:
            raise SystemExit("totalScore가 있는 시연이 없습니다.")

    pairs = _pairs_for(rows, rank_by, min_margin)
    if pairs["n_pairs"] < len(FEATURE_NAMES):
        raise SystemExit(f"쌍이 {pairs['n_pairs']}개뿐입니다 — 적합 불가.")
    theta, diag = fit_rank(pairs["d"], l2=l2, record_history=True)
    coef = theta * SCALE_VEC
    mask = identifiable_mask(pairs["d"])
    boot = bootstrap_by_participant(rows, l2, n_boot, seed, min_margin, rank_by)
    hold = holdout_by_participant(rows, l2, seed, min_margin, rank_by=rank_by)

    return {
        "method": "bradley_terry_rank",
        "source": {
            "plays_dir": str(plays_dir), "l2": l2, "seed": seed,
            "bootstrap": n_boot, "collapse_repeats": collapse_repeats,
            "min_margin": min_margin, "n_demos": len(rows),
            "n_scored": n_scored, "rank_by": rank_by,
            # What the ordering actually encodes, so a reader cannot mistake
            # scorer agreement for player preference.
            "ranking_signal": (
                "게임 채점표 totalScore (makespan 30 / completion 25 / "
                "softInterference 25 / jobBalance 10 / timeBalance 10) — "
                "7차원 보상과 다른 지표이며 jobBalance·timeBalance는 특징에 없음"
                if rank_by == "score" else
                "같은 참가자의 같은 시나리오 재도전 순서 — 나중 시도를 선호로 간주"
            ),
        },
        "cohort": cohort_summary(rows),
        "feature_names": FEATURE_NAMES,
        "pairs": {k: v for k, v in pairs.items()
                  if k not in ("d", "pair_users", "pair_scenario")},
        "reward_coef": dict(zip(FEATURE_NAMES, coef.tolist())),
        "identified": dict(zip(FEATURE_NAMES, mask.tolist())),
        "default_vs_fitted": {
            k: {"default": DEFAULT_REWARD_COEFS[k], "fitted": float(c),
                "delta": float(c) - DEFAULT_REWARD_COEFS[k]}
            for k, c in zip(FEATURE_NAMES, coef)
        },
        "convergence": {"iterations": diag["iterations"], "final_loss": diag["loss"],
                        "loss_history": diag.get("loss_history")},
        "fit_accuracy": pair_accuracy(theta, pairs["d"]),
        "prior_accuracy": pair_accuracy(PRIOR_THETA, pairs["d"]),
        "holdout": hold,
        "coefficient_ci": {
            k: {
                "coef": float(coef[i]),
                # A feature with no pairwise variation has no interval to report;
                # emitting null keeps a bootstrap artifact from being read as
                # near-perfect precision downstream.
                "std": (boot["std"][i] if mask[i] else None),
                "ci_low": (boot["ci_low"][i] if mask[i] else None),
                "ci_high": (boot["ci_high"][i] if mask[i] else None),
                "identified": bool(mask[i]),
            }
            for i, k in enumerate(FEATURE_NAMES)
        },
        "bootstrap_n_ok": boot["n_ok"],
    }


def main() -> None:
    ap = argparse.ArgumentParser(description=__doc__,
                                 formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--plays", required=True)
    ap.add_argument("--out", required=True)
    ap.add_argument("--l2", type=float, default=1.0)
    ap.add_argument("--seed", type=int, default=0)
    ap.add_argument("--bootstrap", type=int, default=200)
    ap.add_argument("--keep-repeats", action="store_true",
                    help="같은 참가자의 같은 시나리오 재도전을 모두 사용")
    ap.add_argument("--min-margin", type=float, default=0.0,
                    help="점수 차가 이보다 작은 쌍은 제외 (기본 0 = 동점만 제외). rank-by=score 전용")
    ap.add_argument("--rank-by", choices=("score", "attempt"), default="attempt",
                    help="순서의 출처. attempt(기본) = 같은 참가자의 재도전 순서(사람의 선호). "
                         "score = 게임 채점표 totalScore — 7차원 보상과 다른 지표라 "
                         "'채점 규칙과의 일치도'를 적합하게 됨")
    args = ap.parse_args()

    report = analyze(Path(args.plays), args.l2, args.bootstrap, args.seed,
                     not args.keep_repeats, args.min_margin, args.rank_by)
    out = Path(args.out)
    out.parent.mkdir(parents=True, exist_ok=True)
    out.write_text(json.dumps(report, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"wrote {out}  pairs={report['pairs']['n_pairs']} "
          f"acc={report['fit_accuracy']:.3f}")


if __name__ == "__main__":
    main()
