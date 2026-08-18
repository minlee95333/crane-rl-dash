"""Cross-validate a 7-dim IRL reward prior against an auto_reward_opt run.

The IRL track and auto_reward track now live in the same coefficient space:

    r_single, r_all, r_same, p_idle, p_inter_soft, p_time, p_move

This report compares the Optuna trial coefficients directly against the IRL
bootstrap confidence intervals. It is read-only and does not trigger training.
"""
from __future__ import annotations

import argparse
import json
import math
import statistics
import time
from pathlib import Path
from typing import Any, Dict, List, Optional, Tuple


REWARD_KEYS = [
    "r_single",
    "r_all",
    "r_same",
    "p_idle",
    "p_inter_soft",
    "p_time",
    "p_move",
]


# ---------------------------------------------------------------------------
# Loaders

def _load_irl_reward_prior(path: Path) -> Dict[str, Dict[str, float]]:
    doc = json.loads(path.read_text(encoding="utf-8"))
    return _load_irl_reward_prior_from_doc(doc, source=str(path))


def _as_float_dict(raw: Any, keys=REWARD_KEYS) -> Dict[str, float]:
    if not isinstance(raw, dict):
        return {}
    out = {}
    for k in keys:
        try:
            v = float(raw[k])
        except (KeyError, TypeError, ValueError):
            continue
        if math.isfinite(v):
            out[k] = v
    return out


def _load_irl_reward_prior_from_doc(doc: Dict, source: str = "doc") -> Dict[str, Dict[str, float]]:
    coef = _as_float_dict(doc.get("reward_coef") or doc.get("weights"))
    ci_low = _as_float_dict(doc.get("reward_coef_ci_low") or doc.get("weight_ci_low"))
    ci_high = _as_float_dict(doc.get("reward_coef_ci_high") or doc.get("weight_ci_high"))
    if set(coef) != set(REWARD_KEYS):
        raise SystemExit(f"IRL prior is not a 7-dim reward-coef prior: {source}")
    for k in REWARD_KEYS:
        if k not in ci_low:
            ci_low[k] = coef[k]
        if k not in ci_high:
            ci_high[k] = coef[k]
        if ci_low[k] > ci_high[k]:
            ci_low[k], ci_high[k] = ci_high[k], ci_low[k]
    return {"coef": coef, "ci_low": ci_low, "ci_high": ci_high}


def _load_irl_weights_from_doc(doc: Dict, source: str = "doc") -> Dict[str, float]:
    """Backward-compatible name used by app.py imports."""
    return _load_irl_reward_prior_from_doc(doc, source=source)["coef"]


def _load_trials(run_dir: Path) -> List[Dict]:
    out: List[Dict] = []
    for tdir in sorted(run_dir.glob("trial_*")):
        trial_num_str = tdir.name.replace("trial_", "")
        try:
            trial_num = int(trial_num_str)
        except ValueError:
            continue

        summary: Dict[str, Any] = {}
        sf = tdir / "trial_summary.json"
        if sf.exists():
            try:
                summary = json.loads(sf.read_text(encoding="utf-8"))
            except Exception:
                summary = {}

        site_eval: Dict[str, Any] = {}
        site_eval_path = tdir / "site_eval.json"
        if site_eval_path.exists():
            try:
                site_eval = json.loads(site_eval_path.read_text(encoding="utf-8"))
            except Exception:
                site_eval = {}

        reward = _as_float_dict(summary.get("reward"))
        if not reward:
            # Some Optuna versions persist params only in best.json / study DB; if
            # trial_summary is missing the reward we skip coefficient comparison.
            continue

        score = summary.get("score") or site_eval.get("score") or {}
        site_result = summary.get("siteResult") or {}
        if not site_result and isinstance(site_eval.get("result"), dict):
            result = site_eval["result"]
            site_result = {
                "done": result.get("done"),
                "total": result.get("total"),
                "makespan": result.get("makespan"),
                "softInter": result.get("softInter"),
            }
        out.append({
            "trial": trial_num,
            "trial_dir": str(tdir),
            "reward": reward,
            "score": score,
            "total_score": score.get("totalScore"),
            "grade": score.get("grade"),
            "siteResult": site_result,
        })
    out.sort(key=lambda t: t["trial"])
    return out


# ---------------------------------------------------------------------------
# Coefficient comparison

def _coef_status(value: float, mean: float, lo: float, hi: float) -> Dict[str, Any]:
    if lo > hi:
        lo, hi = hi, lo
    width = hi - lo
    inside = lo <= value <= hi
    if inside:
        outside_distance = 0.0
    elif value < lo:
        outside_distance = lo - value
    else:
        outside_distance = value - hi
    denom = width if width > 1e-12 else max(abs(mean), abs(value), 1.0)
    return {
        "value": value,
        "irlMean": mean,
        "ciLow": lo,
        "ciHigh": hi,
        "insideCi": inside,
        "outsideDistance": outside_distance,
        "outsideDistanceNorm": outside_distance / denom,
        "deltaFromMean": value - mean,
    }


def _compare_reward(reward: Dict[str, float], prior: Dict[str, Dict[str, float]]) -> Dict[str, Any]:
    per_key = {}
    inside_count = 0
    total_norm_distance = 0.0
    for k in REWARD_KEYS:
        st = _coef_status(
            float(reward[k]),
            float(prior["coef"][k]),
            float(prior["ci_low"][k]),
            float(prior["ci_high"][k]),
        )
        per_key[k] = st
        if st["insideCi"]:
            inside_count += 1
        total_norm_distance += float(st["outsideDistanceNorm"])
    return {
        "insideCount": inside_count,
        "coverage": inside_count / len(REWARD_KEYS),
        "outsideKeys": [k for k, st in per_key.items() if not st["insideCi"]],
        "totalOutsideDistanceNorm": total_norm_distance,
        "perKey": per_key,
    }


def _best_trial(trials: List[Dict]) -> Optional[Dict]:
    scored = [t for t in trials if isinstance(t.get("total_score"), (int, float))]
    if scored:
        return max(scored, key=lambda t: float(t["total_score"]))
    return trials[0] if trials else None


def _summarize_trials(comparisons: List[Dict]) -> Dict[str, Any]:
    if not comparisons:
        return {}
    coverages = [float(c["comparison"]["coverage"]) for c in comparisons]
    distances = [float(c["comparison"]["totalOutsideDistanceNorm"]) for c in comparisons]
    return {
        "coverageAvg": round(statistics.mean(coverages), 4),
        "coverageMax": round(max(coverages), 4),
        "coverageMin": round(min(coverages), 4),
        "outsideDistanceAvg": round(statistics.mean(distances), 4),
        "outsideDistanceMin": round(min(distances), 4),
    }


# ---------------------------------------------------------------------------
# Main report builder

def cross_validate(irl_prior_source, auto_reward_run_dir: Path) -> Dict:
    if isinstance(irl_prior_source, dict):
        prior = _load_irl_reward_prior_from_doc(irl_prior_source, source="storage")
        prior_label = "storage"
    else:
        prior = _load_irl_reward_prior(Path(irl_prior_source))
        prior_label = str(irl_prior_source)

    trials = _load_trials(auto_reward_run_dir)
    comparisons: List[Dict] = []
    for t in trials:
        cmp = _compare_reward(t["reward"], prior)
        comparisons.append({
            "trial": t["trial"],
            "trial_dir": t["trial_dir"],
            "totalScore": t.get("total_score"),
            "grade": t.get("grade"),
            "reward": t["reward"],
            "comparison": cmp,
            "siteResult": t.get("siteResult") or {},
        })

    best = _best_trial(trials)
    best_cmp = _compare_reward(best["reward"], prior) if best else None
    closest = sorted(
        comparisons,
        key=lambda x: (
            -float(x["comparison"]["coverage"]),
            float(x["comparison"]["totalOutsideDistanceNorm"]),
            -float(x.get("totalScore") or -1e18),
        ),
    )

    return {
        "ok": True,
        "generated_at": time.strftime("%Y-%m-%dT%H:%M:%S"),
        "irl_prior_path": prior_label,
        "auto_reward_run_dir": str(auto_reward_run_dir),
        "reward_keys": REWARD_KEYS,
        "irl_reward_coef": prior["coef"],
        "irl_reward_coef_ci_low": prior["ci_low"],
        "irl_reward_coef_ci_high": prior["ci_high"],
        "n_trials": len(trials),
        "trial_coef_comparisons": comparisons,
        "summary": _summarize_trials(comparisons),
        "best_trial": None if best is None else best["trial"],
        "best_score": None if best is None else best.get("total_score"),
        "best_reward": None if best is None else best["reward"],
        "best_reward_ci_comparison": best_cmp,
        "closest_to_irl_top5": [
            {
                "trial": c["trial"],
                "coverage": c["comparison"]["coverage"],
                "outsideKeys": c["comparison"]["outsideKeys"],
                "totalOutsideDistanceNorm": c["comparison"]["totalOutsideDistanceNorm"],
                "totalScore": c.get("totalScore"),
            }
            for c in closest[:5]
        ],
        "interpretation": (
            "coverage=1.0이면 해당 trial의 7개 reward coefficient가 모두 IRL CI 안에 있습니다. "
            "best_reward가 CI 밖이면 Optuna가 사람 demonstration prior와 다른 보상 영역에서 좋은 scorer 점수를 찾은 것입니다. "
            "prior 적용 run에서는 best가 CI 경계에 붙었는지와 outsideKeys를 함께 확인하세요."
        ),
    }


def main():
    ap = argparse.ArgumentParser(
        description="Cross-validate a 7-dim game-IRL reward prior against an auto_reward_opt run."
    )
    ap.add_argument("--irl-prior", required=True, help="IRL prior JSON from irl_from_plays.py")
    ap.add_argument("--auto-reward-run", required=True,
                    help="auto_reward_runs subdir containing trial_* dirs with trial_summary.json")
    ap.add_argument("--out", default="", help="output JSON path; default = irl_priors/cross_validate_<DATE>.json")
    args = ap.parse_args()
    report = cross_validate(Path(args.irl_prior), Path(args.auto_reward_run))
    if args.out:
        out_path = Path(args.out)
        out_path.parent.mkdir(parents=True, exist_ok=True)
        out_path.write_text(json.dumps(report, ensure_ascii=False, indent=2), encoding="utf-8")
        ref = str(out_path)
    else:
        try:
            from crane_db.storage import save_irl_artifact, IRL_KIND_CROSS_VALIDATE
        except ImportError:
            from crane_db.storage import save_irl_artifact, IRL_KIND_CROSS_VALIDATE
        ref = save_irl_artifact(IRL_KIND_CROSS_VALIDATE, report,
                                 label=f"cli:{Path(args.auto_reward_run).name}")
    print(f"wrote {ref}")
    print(f"n_trials compared: {report['n_trials']}")
    print(f"best trial: {report['best_trial']} score={report['best_score']}")
    if report.get("best_reward_ci_comparison"):
        cmp = report["best_reward_ci_comparison"]
        print(f"best coverage: {cmp['coverage']:.2f}, outside={', '.join(cmp['outsideKeys']) or 'none'}")


if __name__ == "__main__":
    main()
