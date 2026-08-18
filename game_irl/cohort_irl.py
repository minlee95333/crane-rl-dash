"""Score-quantile cohorts and specification sensitivity for the step-level fit.

Two questions ``step_irl.py`` alone does not answer:

**Does the reward function differ between well-played and badly-played games?**
``step_irl.group_contrast`` splits *participants* by mean score, which sounds
right and is not: ``totalScore`` is not normalised across difficulty (mean 91.4
on the tutorial maps against 70.4 on the hardest), so the top group fills up
with people who played three easy scenarios and left. Measured on the study
data, the top decile by participant score had **0%** of its plays on the two
hardest tiers. That split contrasts exposure, not skill.

Ranking plays *within a scenario* removes the confound: "top 20%" means the
best fifth of the plays submitted for that same map, pooled over all scenarios,
so every cohort has the same difficulty mix by construction. Ranking is per
play and ignores who produced it; participant identity is still carried so the
bootstrap can resample by participant, which is the unit that matters when one
person contributed 117 plays.

**How much of a coefficient is the specification rather than the data?**
``r_single`` and ``r_all`` sit in the collinear block with ``r_same``/``p_time``
(VIF 822/98/428 on the fitted differences), so leaving them free lets the ridge
move signal between them. Fitting once with them free and once with them held
at their design values (10 / 100) brackets that: coefficients that barely move
are specification-invariant, and the two that swap sign are not estimates at
all. The between-specification spread is larger than either bootstrap CI, so
reporting only the CI understates the uncertainty.

Stages (the first dominates the runtime, hence the cache):

    python game_irl/cohort_irl.py cache    --out-dir game_irl/reports/run
    python game_irl/cohort_irl.py cohorts  --out-dir game_irl/reports/run
    python game_irl/cohort_irl.py fixed-ci --out-dir game_irl/reports/run
"""
from __future__ import annotations

import argparse
import json
import math
import os
import sys
import time
from pathlib import Path
from typing import Dict, List, Optional, Sequence, Tuple

import numpy as np

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

try:
    from .step_irl import (
        _pack, _tensorize, _loss_grad_tensor, bootstrap_by_participant,
        choice_metrics, condition_report, feature_matching, fit_steps,
        identifiable_mask, l2_sensitivity, replay_matches, step_choices,
        _human_setup_cloud,
    )
    from .irl_from_plays import FEATURE_NAMES, PRIOR_THETA, SCALE_VEC
except ImportError:  # script execution
    from game_irl.step_irl import (  # type: ignore
        _pack, _tensorize, _loss_grad_tensor, bootstrap_by_participant,
        choice_metrics, condition_report, feature_matching, fit_steps,
        identifiable_mask, l2_sensitivity, replay_matches, step_choices,
        _human_setup_cloud,
    )
    from game_irl.irl_from_plays import FEATURE_NAMES, PRIOR_THETA, SCALE_VEC  # type: ignore

DEFAULT_PLAYS = Path(__file__).resolve().parents[1] / "human_plays"
DEFAULT_OUT = Path(__file__).resolve().parent / "reports" / "cohort"
CACHE_NAME = "cohort_steps.npz"

# Held at their design values in the constrained fit. Both are constant over a
# whole trajectory (every stored play completes every lift), so at that level
# they carry no gradient at all; at step level they vary only through how many
# lifts a candidate wave happens to finish.
FIXED_NAMES = ("r_single", "r_all")


# ---------------------------------------------------------------------------
# Loading

def load_docs_from_dir(plays_dir: Path) -> List[Dict]:
    docs = []
    for i, path in enumerate(sorted(Path(plays_dir).glob("*.json"))):
        try:
            doc = json.loads(path.read_text(encoding="utf-8"))
        except (OSError, json.JSONDecodeError):
            continue
        doc.setdefault("meta", {})
        doc["__play_id__"] = i
        docs.append(doc)
    return docs


def play_score(doc: Dict) -> Optional[float]:
    """The displayed score. Lives in scorer_snapshot, not outcome."""
    try:
        return float((doc.get("scorer_snapshot") or {}).get("totalScore"))
    except (TypeError, ValueError):
        return None


# ---------------------------------------------------------------------------
# Cache

def build_cache(docs: Sequence[Dict], out: Path, n_uniform: int, n_human: int,
                seed: int, verbose: bool = True) -> Dict:
    t0 = time.time()
    usable, n_nonsweep, n_unreplayable = [], 0, 0
    for doc in docs:
        actions = doc.get("actions") or []
        if not actions or any(a.get("__mode__") != "sweep" for a in actions):
            n_nonsweep += 1
            continue
        if not replay_matches(doc):
            n_unreplayable += 1
            continue
        usable.append(doc)
    if verbose:
        print(f"재현 가능 {len(usable)}판 / 비스윕 {n_nonsweep} / 재현불가 {n_unreplayable} "
              f"({time.time()-t0:.0f}s)", flush=True)
    if not usable:
        raise SystemExit("재현 가능한 sweep play가 없습니다.")

    cloud = _human_setup_cloud(usable)
    steps: List[Dict] = []
    for j, doc in enumerate(usable):
        sid = str(doc["meta"].get("scenario_id") or "?")
        sc = play_score(doc)
        for s in step_choices(doc, cloud.get(sid, []), n_uniform, n_human, seed):
            s["play_id"] = doc["__play_id__"]
            s["play_score"] = sc
            steps.append(s)
        if verbose and (j + 1) % 100 == 0:
            print(f"    후보 생성 {j+1}/{len(usable)}판 — 스텝 {len(steps)} "
                  f"({time.time()-t0:.0f}s)", flush=True)
    if not steps:
        raise SystemExit("스텝 선택지를 만들지 못했습니다.")

    meta = {"n_plays_used": len(usable), "n_nonsweep": n_nonsweep,
            "n_unreplayable": n_unreplayable, "n_docs": len(docs),
            "cand_uniform": n_uniform, "cand_human": n_human, "seed": seed,
            "estimand_note": "계수는 후보 집합 정의에 조건부입니다."}
    save_cache(out, steps, meta)
    if verbose:
        print(f"캐시 저장 {out}  스텝 {len(steps)} ({time.time()-t0:.0f}s)", flush=True)
    return meta


def save_cache(path: Path, steps: Sequence[Dict], meta: Dict) -> None:
    X, mask = _tensorize(_pack(steps))
    path.parent.mkdir(parents=True, exist_ok=True)
    np.savez_compressed(
        path, X=X, mask=mask,
        user_id=np.array([s["user_id"] for s in steps], dtype=object),
        scenario_id=np.array([s["scenario_id"] for s in steps], dtype=object),
        play_id=np.array([s["play_id"] for s in steps], dtype=np.int64),
        play_score=np.array([np.nan if s.get("play_score") is None else s["play_score"]
                             for s in steps], dtype=float),
        meta=np.array([json.dumps(meta, ensure_ascii=False)], dtype=object),
        allow_pickle=True)


def load_cache(path: Path) -> Tuple[List[Dict], Dict]:
    z = np.load(path, allow_pickle=True)
    X, mask = z["X"], z["mask"]
    steps = []
    for i in range(X.shape[0]):
        rows = X[i][mask[i]] / SCALE_VEC
        sc = float(z["play_score"][i])
        sc = None if math.isnan(sc) else sc
        steps.append({
            "chosen": rows[0], "alts": [r for r in rows[1:]],
            "user_id": str(z["user_id"][i]),
            "scenario_id": str(z["scenario_id"][i]),
            "play_id": int(z["play_id"][i]),
            "play_score": sc,
            # group_contrast and friends read total_score under that name
            "total_score": sc,
        })
    return steps, json.loads(str(z["meta"][0]))


# ---------------------------------------------------------------------------
# Cohorts

def cohort_play_ids(steps: Sequence[Dict], frac: float) -> Tuple[set, Dict]:
    """Top ``frac`` of plays by score, taken separately within each scenario.

    Per-scenario selection is the whole point: a pooled ranking would fill the
    top cohort with plays from the easy maps, which is the confound this
    function exists to avoid. Ties and missing scores fall back to play_id so
    the selection is deterministic. At least one play per scenario is kept, so
    every cohort still spans all scenarios.
    """
    if not 0 < frac <= 1:
        raise ValueError("frac must be in (0, 1]")
    by_scen: Dict[str, Dict[int, Optional[float]]] = {}
    for s in steps:
        by_scen.setdefault(s["scenario_id"], {})[s["play_id"]] = s.get("play_score")
    keep, per_scen = set(), {}
    for sid, plays in by_scen.items():
        ranked = sorted(plays.items(),
                        key=lambda kv: (-(kv[1] if kv[1] is not None else -np.inf), kv[0]))
        k = max(1, int(round(len(ranked) * frac)))
        keep.update(p for p, _ in ranked[:k])
        per_scen[sid] = {"n_plays": len(ranked), "n_kept": k,
                         "top_score": ranked[0][1], "cut_score": ranked[k - 1][1]}
    return keep, per_scen


# ---------------------------------------------------------------------------
# Constrained fit

def fixed_indices(names: Sequence[str] = FIXED_NAMES) -> List[int]:
    return [FEATURE_NAMES.index(n) for n in names]


def fit_steps_fixed(packed: Sequence[np.ndarray], l2: float = 1.0,
                    fixed: Optional[Sequence[int]] = None, lr: float = 0.05,
                    max_iter: int = 2000, tol: float = 1e-9
                    ) -> Tuple[np.ndarray, Dict]:
    """``fit_steps`` with some dimensions pinned to their design value.

    The L2 divisor stays ``len(theta)`` rather than the number of free
    dimensions, so the per-dimension prior strength is identical to the
    unconstrained fit: the only thing that changes between the two fits is which
    dimensions are allowed to move, which is what makes them comparable.
    """
    idx = list(fixed) if fixed is not None else fixed_indices()
    theta = PRIOR_THETA.astype(np.float64).copy()
    m, v = np.zeros_like(theta), np.zeros_like(theta)
    best_theta, best_loss = theta.copy(), float("inf")
    b1, b2, eps = 0.9, 0.999, 1e-8
    if not packed:
        return theta, {"loss": float("nan"), "iterations": 0}
    X, mask = _tensorize(packed)
    it = 0
    for it in range(1, max_iter + 1):
        loss, grad = _loss_grad_tensor(theta, X, mask, l2)
        grad[idx] = 0.0
        if loss < best_loss:
            best_loss, best_theta = loss, theta.copy()
        if float(np.max(np.abs(grad))) < tol:
            break
        m = b1 * m + (1 - b1) * grad
        v = b2 * v + (1 - b2) * (grad * grad)
        step = lr * (m / (1 - b1 ** it)) / (np.sqrt(v / (1 - b2 ** it)) + eps)
        step[idx] = 0.0
        theta = np.clip(theta - step, -1000.0, 1000.0)
        theta[idx] = PRIOR_THETA[idx]
    best_theta[idx] = PRIOR_THETA[idx]
    return best_theta, {"loss": best_loss, "iterations": it}


def bootstrap_fixed(steps: Sequence[Dict], l2: float, n_boot: int, seed: int,
                    fixed: Optional[Sequence[int]] = None) -> Dict:
    """Participant-clustered bootstrap around the constrained fit.

    Resampling plays instead of participants would treat one person's 117 plays
    as 117 independent observations and shrink every interval several-fold.
    """
    people = sorted({s["user_id"] for s in steps if s["user_id"]})
    by = {p: [] for p in people}
    for s in steps:
        if s["user_id"] in by:
            by[s["user_id"]].append(s)
    if not people:
        z = [None] * len(FEATURE_NAMES)
        return {"n_ok": 0, "std": z, "ci_low": z, "ci_high": z}
    rng = np.random.default_rng(seed)
    coefs = []
    for _ in range(int(n_boot)):
        picked = rng.choice(len(people), size=len(people), replace=True)
        sample: List[Dict] = []
        for i in picked:
            sample.extend(by[people[i]])
        if not sample:
            continue
        theta, _ = fit_steps_fixed(_pack(sample), l2=l2, fixed=fixed)
        coefs.append(theta * SCALE_VEC)
    if not coefs:
        z = [None] * len(FEATURE_NAMES)
        return {"n_ok": 0, "std": z, "ci_low": z, "ci_high": z}
    C = np.stack(coefs, axis=0)
    return {"n_ok": int(C.shape[0]), "std": C.std(axis=0, ddof=1).tolist(),
            "ci_low": np.percentile(C, 2.5, axis=0).tolist(),
            "ci_high": np.percentile(C, 97.5, axis=0).tolist(),
            "ci_low90": np.percentile(C, 5.0, axis=0).tolist(),
            "ci_high90": np.percentile(C, 95.0, axis=0).tolist()}


def vif(packed: Sequence[np.ndarray]) -> Tuple[Dict[str, float], int]:
    """Variance inflation on what the fit actually sees.

    Not the raw play features: the estimator only ever looks at the difference
    between a candidate and the chosen option, and it is in *those* differences
    that r_single/r_same/p_time turn out to be nearly one direction.
    """
    rows = [M[1:] - M[0] for M in packed if M.shape[0] > 1]
    if not rows:
        return {n: float("nan") for n in FEATURE_NAMES}, 0
    D = np.concatenate(rows, axis=0)
    out = {}
    for i, name in enumerate(FEATURE_NAMES):
        y = D[:, i]
        Xo = np.column_stack([np.delete(D, i, axis=1), np.ones(len(D))])
        beta, *_ = np.linalg.lstsq(Xo, y, rcond=None)
        resid = y - Xo @ beta
        ss_tot = float(np.sum((y - y.mean()) ** 2))
        if ss_tot <= 0:
            out[name] = float("inf")
            continue
        r2 = 1.0 - float(np.sum(resid ** 2)) / ss_tot
        out[name] = float("inf") if r2 >= 1 - 1e-12 else float(1.0 / (1.0 - r2))
    return out, int(D.shape[0])


# ---------------------------------------------------------------------------
# Reports

def fit_report(steps: Sequence[Dict], l2: float, n_boot: int, seed: int,
               constrained: bool = False) -> Dict:
    packed = _pack(steps)
    if constrained:
        theta, diag = fit_steps_fixed(packed, l2=l2)
        boot = bootstrap_fixed(steps, l2, n_boot, seed)
    else:
        theta, diag = fit_steps(packed, l2=l2)
        boot = bootstrap_by_participant(steps, l2, n_boot, seed)
    coef = theta * SCALE_VEC
    scores = [s["play_score"] for s in steps if s.get("play_score") is not None]
    return {
        "constrained": constrained,
        "n_steps": len(steps),
        "n_plays": len({s["play_id"] for s in steps}),
        "n_participants": len({s["user_id"] for s in steps if s["user_id"]}),
        "n_scenarios": len({s["scenario_id"] for s in steps}),
        "mean_play_score": float(np.mean(scores)) if scores else None,
        "reward_coef": dict(zip(FEATURE_NAMES, coef.tolist())),
        "std": dict(zip(FEATURE_NAMES, boot["std"])),
        "ci_low": dict(zip(FEATURE_NAMES, boot["ci_low"])),
        "ci_high": dict(zip(FEATURE_NAMES, boot["ci_high"])),
        "identified": dict(zip(FEATURE_NAMES,
                               [bool(x) for x in identifiable_mask(packed)])),
        "fit_choice": choice_metrics(theta, packed),
        "prior_choice": choice_metrics(PRIOR_THETA, packed),
        "feature_matching": feature_matching(theta, packed),
        "convergence": {"iterations": diag["iterations"], "final_loss": diag["loss"]},
        "bootstrap_n_ok": boot["n_ok"],
    }


def cohort_report(steps: Sequence[Dict], fracs: Sequence[float], l2: float,
                  n_boot: int, seed: int, verbose: bool = True) -> Dict:
    """Nested cohorts plus, for each, the disjoint complement.

    The nested cohorts share plays, so their intervals must not be read against
    each other; the complement of each is disjoint from it, and that is the
    comparison a CI separation can actually support.
    """
    out: Dict[str, Dict] = {}
    for frac in fracs:
        keep, per_scen = cohort_play_ids(steps, frac)
        inside = [s for s in steps if s["play_id"] in keep]
        name = f"top{int(round(frac * 100))}"
        out[name] = fit_report(inside, l2, n_boot, seed)
        out[name]["per_scenario_cut"] = per_scen
        out[name]["l2_sensitivity"] = l2_sensitivity(_pack(inside))
        if frac < 1.0:
            rest = [s for s in steps if s["play_id"] not in keep]
            out["not_" + name] = fit_report(rest, l2, n_boot, seed)
        if verbose:
            r = out[name]
            print(f"{name:>7}: 판 {r['n_plays']:>4} 스텝 {r['n_steps']:>5} "
                  f"참가자 {r['n_participants']:>2} 평균점수 {r['mean_play_score']:.2f} "
                  f"top1 {r['fit_choice']['top1']:.4f}", flush=True)
    return out


def ci_disjoint(a: Dict, b: Dict) -> Dict[str, bool]:
    return {k: bool(a["ci_low"][k] > b["ci_high"][k] or b["ci_low"][k] > a["ci_high"][k])
            for k in FEATURE_NAMES}


# ---------------------------------------------------------------------------
# CLI

def main() -> None:
    ap = argparse.ArgumentParser(description=__doc__,
                                 formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("stage", choices=["cache", "cohorts", "fixed-ci"])
    ap.add_argument("--out-dir", default=str(DEFAULT_OUT))
    ap.add_argument("--plays", default=str(DEFAULT_PLAYS),
                    help="플레이 JSON이 들어 있는 디렉터리")
    ap.add_argument("--l2", type=float, default=1.0)
    ap.add_argument("--seed", type=int, default=0)
    ap.add_argument("--bootstrap", type=int, default=200)
    ap.add_argument("--cand-uniform", type=int, default=8)
    ap.add_argument("--cand-human", type=int, default=8)
    ap.add_argument("--fracs", default="1.0,0.8,0.5,0.2")
    args = ap.parse_args()

    out_dir = Path(args.out_dir)
    out_dir.mkdir(parents=True, exist_ok=True)
    cache = out_dir / CACHE_NAME

    if args.stage == "cache":
        docs = load_docs_from_dir(Path(args.plays))
        print(f"플레이 {len(docs)}판 로드", flush=True)
        build_cache(docs, cache, args.cand_uniform, args.cand_human, args.seed)
        return

    if not cache.exists():
        raise SystemExit(f"캐시가 없습니다: {cache} — 먼저 'cache' 단계를 실행하세요.")
    steps, meta = load_cache(cache)
    packed = _pack(steps)
    v, n_rows = vif(packed)
    print(f"스텝 {len(steps)} · 판 {len({s['play_id'] for s in steps})} · "
          f"참가자 {len({s['user_id'] for s in steps})} · VIF 표본 {n_rows}", flush=True)

    if args.stage == "cohorts":
        fracs = [float(x) for x in args.fracs.split(",") if x.strip()]
        report = {"source": meta, "l2": args.l2, "seed": args.seed,
                  "bootstrap": args.bootstrap, "vif": v, "vif_rows": n_rows,
                  "cohorts": cohort_report(steps, fracs, args.l2, args.bootstrap,
                                           args.seed)}
        for frac in fracs:
            name = f"top{int(round(frac * 100))}"
            if "not_" + name in report["cohorts"]:
                report["cohorts"][name]["ci_disjoint_vs_complement"] = ci_disjoint(
                    report["cohorts"][name], report["cohorts"]["not_" + name])
        path = out_dir / "cohorts.json"
    else:
        free = fit_report(steps, args.l2, args.bootstrap, args.seed, constrained=False)
        fixed = fit_report(steps, args.l2, args.bootstrap, args.seed, constrained=True)
        spread = {k: abs(free["reward_coef"][k] - fixed["reward_coef"][k])
                  for k in FEATURE_NAMES}
        report = {"source": meta, "l2": args.l2, "seed": args.seed,
                  "bootstrap": args.bootstrap, "vif": v, "vif_rows": n_rows,
                  "free": free, "fixed": fixed,
                  "fixed_at_design": list(FIXED_NAMES),
                  "specification_spread": spread,
                  "ci_disjoint_free_vs_fixed": ci_disjoint(free, fixed),
                  "l2_sensitivity_free": l2_sensitivity(packed),
                  "conditioning": condition_report(
                      np.array([free["reward_coef"][k] for k in FEATURE_NAMES]) / SCALE_VEC,
                      packed, args.l2)}
        for label, r in (("free", free), ("fixed", fixed)):
            print(f"[{label}] top1={r['fit_choice']['top1']:.4f} "
                  f"loss={r['convergence']['final_loss']:.4f}", flush=True)
            for k in FEATURE_NAMES:
                print(f"   {k:<14} {r['reward_coef'][k]:>9.4f} "
                      f"[{r['ci_low'][k]:>8.4f}, {r['ci_high'][k]:>8.4f}]  "
                      f"VIF {v[k]:>8.1f}", flush=True)
        path = out_dir / "fixed_ci.json"

    path.write_text(json.dumps(report, ensure_ascii=False, indent=2), encoding="utf-8")
    print("wrote", path, flush=True)


if __name__ == "__main__":
    main()
