"""Standard-MaxEnt IRL analysis report over collected human plays.

Produces the eight diagnostics a MaxEnt fit has to be defended with:

  1. feature_expectations   E_demo[phi] (raw units, per feature and per scenario)
  2. feature_correlation    Pearson matrix over demo features, raw and
                            within-scenario-centered (scenario size otherwise
                            dominates every pair)
  3. reward_coef            the fitted 7 coefficients
  4. convergence            per-iteration loss / max|grad| of the main fit
  5. default_vs_fitted      prior coefficients against the fit, with the
                            "is the default inside the bootstrap CI" verdict
  6. group_contrast         top-25% vs bottom-25% participants (by mean
                            totalScore), fitted independently
  7. feature_matching       E_model[phi] - E_demo[phi], the MaxEnt optimality
                            condition, in raw units and in demo-sd units
  8. coefficient_ci         bootstrap std and 95% percentile interval

The partition function is estimated over the 'sweep' action space by default,
because that is the space the demonstrations live in: 1020 of the 1024 plays
collected in this study are sweep steps. ``--action-space pick`` reproduces the
earlier lift-by-lift sampler, whose rollouts leave the human plays outside the
sampled support entirely — see ``game_irl/sweep_exec.py`` for the measurement.

The play source is a directory of exported play documents (the recovery
export) or the live store. Only plays whose ``meta.play_purpose`` matches
``--purpose`` are fitted; filtering happens BEFORE repeat-attempt collapsing,
so a later non-research replay can never evict a consented research demo.
"""
from __future__ import annotations

import argparse
import json
import shutil
import sys
import time
from pathlib import Path
from typing import Dict, List, Optional, Sequence, Tuple

import numpy as np

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from game_irl.irl_from_plays import (  # noqa: E402
    DEFAULT_REWARD_COEFS,
    FEATURE_NAMES,
    SCALE_VEC,
    _logsumexp,
    cohort_summary,
    fit_maxent,
    load_human_trajectories,
    sample_trajectory_space,
)


# ---------------------------------------------------------------------------
# Source preparation

def filter_plays_by_purpose(src: Path, dest: Path, purpose: Optional[str]) -> Dict:
    """Copy play docs matching ``purpose`` into ``dest``; return a count report.

    A copy rather than an in-loader filter because repeat-attempt collapsing in
    ``load_human_trajectories`` runs over whatever the directory contains: if a
    'general' replay of the same scenario by the same person is present, it can
    outrank and drop the research demo we actually want to fit.
    """
    dest.mkdir(parents=True, exist_ok=True)
    counts: Dict[str, int] = {}
    kept = 0
    for path in sorted(Path(src).rglob("*.json")):
        try:
            doc = json.loads(path.read_text(encoding="utf-8"))
        except (OSError, json.JSONDecodeError):
            continue
        if not isinstance(doc, dict):
            continue
        meta = doc.get("meta") if isinstance(doc.get("meta"), dict) else {}
        p = meta.get("play_purpose") or "legacy"
        counts[p] = counts.get(p, 0) + 1
        if purpose and p != purpose:
            continue
        shutil.copyfile(path, dest / path.name)
        kept += 1
    return {"purpose_counts": counts, "n_kept": kept, "purpose": purpose}


def _total_score(path: Optional[str]) -> Optional[float]:
    """totalScore from the play's scorer snapshot (not part of the phi vector)."""
    if not path:
        return None
    try:
        doc = json.loads(Path(path).read_text(encoding="utf-8"))
    except (OSError, json.JSONDecodeError):
        return None
    snap = doc.get("scorer_snapshot") or {}
    try:
        return float(snap.get("totalScore"))
    except (TypeError, ValueError):
        return None


# ---------------------------------------------------------------------------
# 1 / 2 — descriptive statistics on the demonstration features

def feature_expectations(human: Sequence[Dict]) -> Dict:
    phi = np.stack([h["phi"] for h in human], axis=0)
    per_scenario: Dict[str, Dict] = {}
    for sid in sorted({h["scenario_id"] for h in human}):
        sub = np.stack([h["phi"] for h in human if h["scenario_id"] == sid], axis=0)
        per_scenario[sid] = {
            "n": int(sub.shape[0]),
            "mean": dict(zip(FEATURE_NAMES, np.round(sub.mean(axis=0), 4).tolist())),
        }
    return {
        "n_demos": int(phi.shape[0]),
        "mean": dict(zip(FEATURE_NAMES, phi.mean(axis=0).tolist())),
        "std": dict(zip(FEATURE_NAMES, phi.std(axis=0, ddof=1).tolist())),
        "min": dict(zip(FEATURE_NAMES, phi.min(axis=0).tolist())),
        "median": dict(zip(FEATURE_NAMES, np.median(phi, axis=0).tolist())),
        "max": dict(zip(FEATURE_NAMES, phi.max(axis=0).tolist())),
        "per_scenario": per_scenario,
    }


def _corr(mat: np.ndarray) -> List[List[Optional[float]]]:
    """Pearson correlation, with constant columns reported as None, not NaN."""
    sd = mat.std(axis=0)
    out: List[List[Optional[float]]] = []
    for i in range(mat.shape[1]):
        row: List[Optional[float]] = []
        for j in range(mat.shape[1]):
            if sd[i] <= 1e-12 or sd[j] <= 1e-12:
                row.append(None)
            else:
                row.append(round(float(np.corrcoef(mat[:, i], mat[:, j])[0, 1]), 4))
        out.append(row)
    return out


def feature_correlation(human: Sequence[Dict]) -> Dict:
    phi = np.stack([h["phi"] for h in human], axis=0)
    centered = phi.copy()
    for sid in {h["scenario_id"] for h in human}:
        idx = [i for i, h in enumerate(human) if h["scenario_id"] == sid]
        centered[idx] -= phi[idx].mean(axis=0)
    return {
        "feature_names": FEATURE_NAMES,
        "raw": _corr(phi),
        # Scenario size drives every feature at once (more lifts -> more events,
        # more busy time, more travel), so the raw matrix mostly measures map
        # size. Centering within scenario leaves the player's own trade-offs.
        "within_scenario": _corr(centered),
    }


# ---------------------------------------------------------------------------
# 7 — feature matching under the fitted model

def model_feature_expectation(
    theta_coef: Sequence[float],
    human: Sequence[Dict],
    samples_by_scenario: Dict[str, Dict],
) -> Dict:
    """E_model[phi] weighted exactly as the MaxEnt gradient weights it.

    Per scenario the self-normalized IS weights give E_theta[z]; averaging over
    demonstrations (so a scenario counts once per demo, matching the gradient)
    and dividing out SCALE_VEC returns raw feature units.
    """
    theta = np.asarray(theta_coef, dtype=np.float64) / SCALE_VEC
    ez_by_sid: Dict[str, np.ndarray] = {}
    ess_by_sid: Dict[str, float] = {}
    for sid, part in samples_by_scenario.items():
        a = part["z"] @ theta - part["logq"]
        w = np.exp(a - _logsumexp(a))
        ez_by_sid[sid] = (w @ part["z"]) / SCALE_VEC
        ess_by_sid[sid] = float(1.0 / max(float(np.sum(w * w)), 1e-300))
    used = [h for h in human if h["scenario_id"] in ez_by_sid]
    e_model = np.mean([ez_by_sid[h["scenario_id"]] for h in used], axis=0)
    e_demo = np.mean([h["phi"] for h in used], axis=0)
    sd = np.std(np.stack([h["phi"] for h in used], axis=0), axis=0, ddof=1)
    resid = e_model - e_demo
    return {
        "n_demos_used": len(used),
        "e_demo": dict(zip(FEATURE_NAMES, e_demo.tolist())),
        "e_model": dict(zip(FEATURE_NAMES, e_model.tolist())),
        "residual": dict(zip(FEATURE_NAMES, resid.tolist())),
        "residual_in_demo_sd": dict(zip(
            FEATURE_NAMES,
            [float(r / s) if s > 1e-12 else None for r, s in zip(resid, sd)],
        )),
        "ess_per_scenario": {k: round(v, 2) for k, v in sorted(ess_by_sid.items())},
        "n_z_samples_per_scenario": {
            k: int(len(v["logq"])) for k, v in sorted(samples_by_scenario.items())
        },
    }


# ---------------------------------------------------------------------------
# 6 — score-based participant split

def split_by_participant_score(human: Sequence[Dict], quantile: float = 0.25) -> Dict:
    """Top / bottom participants by their mean totalScore.

    Splitting on participants, not plays: a play-level split can put the same
    person in both groups, and then the contrast measures play-to-play noise
    instead of the difference between strong and weak schedulers.
    """
    by_person: Dict[str, List[float]] = {}
    for h in human:
        pid = h.get("user_id") or ""
        score = h.get("total_score")
        if pid and score is not None:
            by_person.setdefault(pid, []).append(float(score))
    ranked = sorted(((pid, float(np.mean(v))) for pid, v in by_person.items()),
                    key=lambda kv: kv[1])
    if len(ranked) < 4:
        return {"ok": False, "message": f"참가자 {len(ranked)}명 — 사분위 분할 불가"}
    k = max(1, int(round(len(ranked) * quantile)))
    bottom = {pid for pid, _ in ranked[:k]}
    top = {pid for pid, _ in ranked[-k:]}
    return {
        "ok": True,
        "quantile": quantile,
        "n_participants_scored": len(ranked),
        "n_per_group": k,
        "top_ids": sorted(top),
        "bottom_ids": sorted(bottom),
        "top_mean_score": round(float(np.mean([s for p, s in ranked if p in top])), 2),
        "bottom_mean_score": round(float(np.mean([s for p, s in ranked if p in bottom])), 2),
        "top_demos": [h for h in human if h.get("user_id") in top],
        "bottom_demos": [h for h in human if h.get("user_id") in bottom],
    }


# ---------------------------------------------------------------------------
# Orchestration

def _demo_rows(human: Sequence[Dict]) -> List[Dict]:
    return [{"scenario_id": h["scenario_id"], "z": h["phi"] * SCALE_VEC} for h in human]


def analyze(
    plays_dir: Path,
    purpose: Optional[str],
    workdir: Path,
    n_samples: int,
    bootstrap: int,
    group_bootstrap: int,
    l2: float,
    seed: int,
    min_play_seconds: float,
    collapse_repeats: bool = True,
    action_space: str = "sweep",
    setup_proposal: str = "uniform",
) -> Dict:
    t0 = time.time()
    src_report = filter_plays_by_purpose(plays_dir, workdir, purpose)
    human = load_human_trajectories(workdir, min_play_seconds=min_play_seconds,
                                    collapse_repeats=collapse_repeats)
    if not human:
        raise SystemExit(f"적합 가능한 시연이 없습니다 (purpose={purpose}).")
    for h in human:
        h["total_score"] = _total_score(h.get("path"))

    scenarios = sorted({h["scenario_id"] for h in human})
    samples = sample_trajectory_space(scenarios, n_samples=n_samples, seed=seed,
                                      action_space=action_space,
                                      setup_proposal=setup_proposal)
    # A scenario whose rollouts all failed to complete has no sampled support,
    # so its demonstrations cannot be fitted — drop them rather than letting the
    # gradient silently skip them, and report the gap in `source`.
    dropped_scenarios = [s for s in scenarios if s not in samples]
    human = [h for h in human if h["scenario_id"] in samples]
    if not human:
        raise SystemExit(
            f"어떤 시나리오도 궤적 공간 표본을 얻지 못했습니다 "
            f"(action_space={action_space}, samples={n_samples}).")

    fit = fit_maxent(_demo_rows(human), samples, l2=l2, bootstrap=bootstrap,
                     seed=seed, record_history=True)
    coef = dict(zip(FEATURE_NAMES, fit["coef"]))
    diag = fit.get("diagnostic") or {}

    # 5 — default vs fitted, judged against the bootstrap interval.
    lo = dict(zip(FEATURE_NAMES, fit["ci_low"]))
    hi = dict(zip(FEATURE_NAMES, fit["ci_high"]))
    default_vs_fitted = {}
    for k in FEATURE_NAMES:
        d, f = DEFAULT_REWARD_COEFS[k], coef[k]
        default_vs_fitted[k] = {
            "default": d,
            "fitted": f,
            "delta": f - d,
            "pct_change": (f - d) / abs(d) * 100.0 if d else None,
            "default_inside_ci": bool(lo[k] <= d <= hi[k]) if bootstrap > 0 else None,
        }

    # 6 — group contrast.
    split = split_by_participant_score(human)
    group = {"ok": False}
    if split.get("ok"):
        group = {k: v for k, v in split.items() if not k.endswith("_demos")}
        for name in ("top", "bottom"):
            rows = split[f"{name}_demos"]
            gfit = fit_maxent(_demo_rows(rows), samples, l2=l2,
                              bootstrap=group_bootstrap, seed=seed)
            gcoef = dict(zip(FEATURE_NAMES, gfit["coef"]))
            group[name] = {
                "n_demos": len(rows),
                "n_participants": len({r.get("user_id") for r in rows}),
                "reward_coef": gcoef,
                "ci_low": dict(zip(FEATURE_NAMES, gfit["ci_low"])),
                "ci_high": dict(zip(FEATURE_NAMES, gfit["ci_high"])),
                "feature_mean": dict(zip(
                    FEATURE_NAMES,
                    np.stack([r["phi"] for r in rows], axis=0).mean(axis=0).tolist())),
            }
        group["coef_delta_top_minus_bottom"] = {
            k: group["top"]["reward_coef"][k] - group["bottom"]["reward_coef"][k]
            for k in FEATURE_NAMES
        }
        # Overlapping bootstrap intervals mean the contrast is not resolved by
        # this sample size; state it rather than reading the point difference.
        group["ci_disjoint"] = {
            k: bool(group["top"]["ci_low"][k] > group["bottom"]["ci_high"][k]
                    or group["bottom"]["ci_low"][k] > group["top"]["ci_high"][k])
            for k in FEATURE_NAMES
        } if group_bootstrap > 0 else None

    return {
        "generated_at": time.strftime("%Y-%m-%dT%H:%M:%S"),
        "source": {
            "plays_dir": str(plays_dir),
            "min_play_seconds": min_play_seconds,
            "collapse_repeats": collapse_repeats,
            "n_samples_per_scenario": n_samples,
            "action_space": action_space,
            "setup_proposal": setup_proposal,
            "scenarios_without_samples": dropped_scenarios,
            "bootstrap": bootstrap,
            "group_bootstrap": group_bootstrap,
            "l2": l2,
            "seed": seed,
            **src_report,
        },
        "feature_names": FEATURE_NAMES,
        "cohort": cohort_summary(human),
        "scenarios": sorted(samples.keys()),
        "feature_expectations": feature_expectations(human),
        "feature_correlation": feature_correlation(human),
        "reward_coef": coef,
        "convergence": {
            "iterations": diag.get("iterations"),
            "final_loss": diag.get("loss"),
            "loss_history": diag.get("loss_history"),
            "grad_inf_norm_history": diag.get("grad_inf_norm_history"),
        },
        "default_vs_fitted": default_vs_fitted,
        "group_contrast": group,
        "feature_matching": model_feature_expectation(fit["coef"], human, samples),
        "coefficient_ci": {
            k: {
                "coef": coef[k],
                "std": fit["std"][i],
                "ci_low": fit["ci_low"][i],
                "ci_high": fit["ci_high"][i],
                "ci_width": fit["ci_high"][i] - fit["ci_low"][i],
            }
            for i, k in enumerate(FEATURE_NAMES)
        },
        "elapsed_seconds": round(time.time() - t0, 1),
    }


def main() -> None:
    ap = argparse.ArgumentParser(description=__doc__,
                                 formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--plays", required=True, help="play 문서 디렉터리")
    ap.add_argument("--purpose", default="research",
                    help="meta.play_purpose 필터 ('' 이면 전체)")
    ap.add_argument("--workdir", required=True, help="필터된 play 복사본을 둘 임시 디렉터리")
    ap.add_argument("--samples", type=int, default=200, help="시나리오당 Z 추정 롤아웃 수")
    ap.add_argument("--bootstrap", type=int, default=200, help="주 적합의 부트스트랩 반복")
    ap.add_argument("--group-bootstrap", type=int, default=100,
                    help="상/하위 그룹 적합의 부트스트랩 반복")
    ap.add_argument("--l2", type=float, default=1.0)
    ap.add_argument("--seed", type=int, default=0)
    ap.add_argument("--min-play-seconds", type=float, default=0.0)
    ap.add_argument("--keep-repeats", action="store_true",
                    help="같은 참가자의 같은 시나리오 재도전을 모두 사용 (기본: 최신 1건)")
    ap.add_argument("--action-space", choices=("sweep", "pick"), default="sweep",
                    help="Z 추정 롤아웃의 행동 공간. 수집된 1024판 중 1020판이 sweep "
                         "이므로 기본값은 sweep — pick 은 시연이 표본 밖에 놓인다")
    ap.add_argument("--setup-proposal", choices=("uniform", "lift_mixture"),
                    default="uniform",
                    help="sweep 롤아웃의 크레인 설치점 제안분포 (기본: 양중 외접영역 균등)")
    ap.add_argument("--out", required=True, help="결과 JSON 경로")
    args = ap.parse_args()

    report = analyze(
        plays_dir=Path(args.plays),
        purpose=args.purpose or None,
        workdir=Path(args.workdir),
        n_samples=args.samples,
        bootstrap=args.bootstrap,
        group_bootstrap=args.group_bootstrap,
        l2=args.l2,
        seed=args.seed,
        min_play_seconds=args.min_play_seconds,
        collapse_repeats=not args.keep_repeats,
        action_space=args.action_space,
        setup_proposal=args.setup_proposal,
    )
    out = Path(args.out)
    out.parent.mkdir(parents=True, exist_ok=True)
    out.write_text(json.dumps(report, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"wrote {out}  ({report['elapsed_seconds']}s)")


if __name__ == "__main__":
    main()
