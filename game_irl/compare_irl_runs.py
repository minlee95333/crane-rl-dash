"""A/B compare two auto_reward_opt runs (with vs without IRL prior).

Phase 4 of GAMIFICATION_BT_IRL_DESIGN.md. The user runs auto_reward_opt twice:

    python -m python_mappo.auto_reward_opt --layout site.json --n-trials 30 \\
        --outroot python_mappo/auto_reward_runs/baseline

    python -m python_mappo.auto_reward_opt --layout site.json --n-trials 30 \\
        --irl-prior irl_priors/irl_prior_<DATE>.json \\
        --outroot python_mappo/auto_reward_runs/with_prior

Then this script aggregates the trial summaries from both outroots and
produces a comparison report:

  * Final best score / best reward coefs per run
  * Per-trial score trajectories (so we can see if prior converges faster)
  * Median + IQR per-trial score within each run
  * Identifies the "convergence trial" — earliest trial whose score is
    within X% of the run's final best

Does NOT run any RL training itself. The user owns the training cost; this
script is the post-hoc analyzer.

CLI:
    python -m python_mappo.compare_irl_runs \\
        --baseline python_mappo/auto_reward_runs/baseline \\
        --with-prior python_mappo/auto_reward_runs/with_prior \\
        --out python_mappo/irl_priors/ab_report_<DATE>.json
"""
from __future__ import annotations

import argparse
import json
import math
import statistics
import time
from pathlib import Path
from typing import Dict, List, Optional


def _load_trials(run_dir: Path) -> List[Dict]:
    """Walk run_dir/trial_*/trial_summary.json and load each trial's record."""
    out = []
    for tdir in sorted(run_dir.glob("trial_*")):
        sf = tdir / "trial_summary.json"
        if not sf.exists():
            continue
        try:
            doc = json.loads(sf.read_text(encoding="utf-8"))
        except Exception:
            continue
        total = (doc.get("score") or {}).get("totalScore")
        if total is None:
            continue
        out.append({
            "trial": int(doc.get("trial") or 0),
            "totalScore": float(total),
            "grade": (doc.get("score") or {}).get("grade"),
            "reward": doc.get("reward") or {},
            "siteResult": doc.get("siteResult") or {},
            "elapsedSec": float(doc.get("elapsedSec") or 0.0),
            "modelPath": doc.get("modelPath"),
        })
    out.sort(key=lambda t: t["trial"])
    return out


def _running_best(trials: List[Dict]) -> List[float]:
    best = -math.inf
    out = []
    for t in trials:
        best = max(best, t["totalScore"])
        out.append(best)
    return out


def _convergence_trial(trials: List[Dict], best: float, within_pct: float = 1.0) -> Optional[int]:
    """Earliest trial whose totalScore is within `within_pct` percent of `best`."""
    if not trials:
        return None
    target = best * (1.0 - within_pct / 100.0)
    for t in trials:
        if t["totalScore"] >= target:
            return t["trial"]
    return None


def _summarize_run(trials: List[Dict], label: str) -> Dict:
    if not trials:
        return {"label": label, "n_trials": 0}
    scores = [t["totalScore"] for t in trials]
    best = max(scores)
    best_idx = scores.index(best)
    running = _running_best(trials)
    return {
        "label": label,
        "n_trials": len(trials),
        "best_score": round(best, 3),
        "best_trial": trials[best_idx]["trial"],
        "best_reward": trials[best_idx]["reward"],
        "best_siteResult": trials[best_idx]["siteResult"],
        "score_mean": round(statistics.mean(scores), 3),
        "score_median": round(statistics.median(scores), 3),
        "score_stdev": round(statistics.pstdev(scores), 3) if len(scores) > 1 else 0.0,
        "score_min": round(min(scores), 3),
        "score_max": round(max(scores), 3),
        "convergence_trial_within_1pct": _convergence_trial(trials, best, 1.0),
        "convergence_trial_within_5pct": _convergence_trial(trials, best, 5.0),
        "trial_scores": [round(s, 3) for s in scores],
        "running_best": [round(s, 3) for s in running],
        "total_compute_sec": round(sum(t["elapsedSec"] for t in trials), 2),
    }


def compare(baseline_dir: Path, with_prior_dir: Path) -> Dict:
    a = _load_trials(baseline_dir)
    b = _load_trials(with_prior_dir)
    a_sum = _summarize_run(a, "baseline (no prior)")
    b_sum = _summarize_run(b, "with IRL prior")
    if a and b:
        # Delta metrics
        delta_best = b_sum["best_score"] - a_sum["best_score"]
        delta_mean = b_sum["score_mean"] - a_sum["score_mean"]
        # Sample-budget efficiency: at trial N, how does running best compare?
        common_n = min(a_sum["n_trials"], b_sum["n_trials"])
        per_trial_gap = [
            round(b_sum["running_best"][i] - a_sum["running_best"][i], 3)
            for i in range(common_n)
        ]
    else:
        delta_best = delta_mean = None
        per_trial_gap = []
    return {
        "ok": True,
        "generated_at": time.strftime("%Y-%m-%dT%H:%M:%S"),
        "baseline_dir": str(baseline_dir),
        "with_prior_dir": str(with_prior_dir),
        "baseline": a_sum,
        "with_prior": b_sum,
        "delta_best_score": delta_best,
        "delta_mean_score": delta_mean,
        "running_best_gap": per_trial_gap,
        "interpretation": (
            "delta_best_score > 0 → IRL prior found a better final solution. "
            "delta_mean_score > 0 → prior explored more productively on average. "
            "convergence_trial_within_1pct (with_prior) < (baseline) → prior reached "
            "the final-quality region faster."
        ),
    }


def main():
    ap = argparse.ArgumentParser(description="Compare two auto_reward_opt runs (with vs without IRL prior).")
    ap.add_argument("--baseline", required=True, help="auto_reward_runs/ subdir for the no-prior run")
    ap.add_argument("--with-prior", required=True, help="auto_reward_runs/ subdir for the IRL-prior run")
    ap.add_argument("--out", default="", help="output JSON path; default = irl_priors/ab_report_<DATE>.json")
    args = ap.parse_args()
    report = compare(Path(args.baseline), Path(args.with_prior))
    if args.out:
        out_path = Path(args.out)
        out_path.parent.mkdir(parents=True, exist_ok=True)
        out_path.write_text(json.dumps(report, ensure_ascii=False, indent=2), encoding="utf-8")
        ref = str(out_path)
    else:
        try:
            from crane_db.storage import save_irl_artifact, IRL_KIND_AB_REPORT
        except ImportError:
            from crane_db.storage import save_irl_artifact, IRL_KIND_AB_REPORT
        ref = save_irl_artifact(IRL_KIND_AB_REPORT, report,
                                 label=f"cli:{Path(args.baseline).name}_vs_{Path(args.with_prior).name}")
    print(f"wrote {ref}")
    print(f"baseline best={report['baseline'].get('best_score')} mean={report['baseline'].get('score_mean')}")
    print(f"with_prior best={report['with_prior'].get('best_score')} mean={report['with_prior'].get('score_mean')}")
    print(f"delta best={report.get('delta_best_score')} mean={report.get('delta_mean_score')}")


if __name__ == "__main__":
    main()
