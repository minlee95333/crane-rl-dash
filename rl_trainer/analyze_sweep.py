"""Analyze and compare auto_reward_opt sweep runs.

Usage:
    python -m rl_trainer.analyze_sweep <outroot1> [<outroot2> ...]

Each <outroot> is a directory like python_mappo/auto_reward_runs/<job_id>/
containing trial_NNNN/trial_summary.json files plus best.json/study.db.

Prints per-trial breakdown and aggregate stats. When given >=2 outroots,
shows a side-by-side comparison (good for cold-start vs Hyperband vs ...).
"""
from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path
from statistics import mean, median, stdev
from typing import Any, Dict, List, Optional


def _load_trials(outroot: Path) -> List[Dict[str, Any]]:
    trials: List[Dict[str, Any]] = []
    for d in sorted(outroot.glob('trial_*')):
        summary = d / 'trial_summary.json'
        if not summary.exists():
            continue
        try:
            doc = json.loads(summary.read_text(encoding='utf-8'))
        except Exception as e:
            print(f"[warn] could not parse {summary}: {e}", file=sys.stderr)
            continue
        doc['_dir'] = d.name
        trials.append(doc)
    return trials


def _load_best(outroot: Path) -> Optional[Dict[str, Any]]:
    p = outroot / 'best.json'
    if not p.exists():
        return None
    try:
        return json.loads(p.read_text(encoding='utf-8'))
    except Exception:
        return None


def _load_effective_space(outroot: Path) -> Optional[Dict[str, Any]]:
    p = outroot / 'effective_search_space.json'
    if not p.exists():
        return None
    try:
        return json.loads(p.read_text(encoding='utf-8'))
    except Exception:
        return None


def _summarize(trials: List[Dict[str, Any]]) -> Dict[str, Any]:
    completed = [t for t in trials if isinstance(t.get('score'), dict)]
    scores = [float(t['score']['totalScore']) for t in completed]
    elapsed = [float(t.get('elapsedSec') or 0) for t in completed]
    episodes = [int(t.get('episodes') or 0) for t in completed]
    cat_scores: Dict[str, List[float]] = {}
    for t in completed:
        cats = (t.get('score') or {}).get('categories') or {}
        for k, v in cats.items():
            s = v.get('score')
            if s is not None:
                cat_scores.setdefault(k, []).append(float(s))
    return {
        'n_trials_dir': len(trials),
        'n_completed': len(completed),
        'best_score': max(scores) if scores else None,
        'best_trial_idx': scores.index(max(scores)) if scores else None,
        'mean_score': mean(scores) if scores else None,
        'median_score': median(scores) if scores else None,
        'std_score': stdev(scores) if len(scores) >= 2 else None,
        'total_elapsed_sec': sum(elapsed),
        'total_episodes_trained': sum(episodes),
        'mean_elapsed_sec': mean(elapsed) if elapsed else None,
        'category_means': {k: mean(v) for k, v in cat_scores.items() if v},
        'category_maxes': {k: max(v) for k, v in cat_scores.items() if v},
    }


def _print_per_trial(trials: List[Dict[str, Any]]) -> None:
    if not trials:
        print("  (no trial_summary.json files found)")
        return
    print(f"  {'trial':>5} {'total':>7} {'grade':>5} {'eps':>5} {'sec':>7}  reward")
    print(f"  {'-'*5} {'-'*7} {'-'*5} {'-'*5} {'-'*7}  {'-'*30}")
    for t in trials:
        n = t.get('trial', '?')
        sc = t.get('score') or {}
        total = sc.get('totalScore')
        grade = sc.get('grade') or '-'
        eps = t.get('episodes') or 0
        sec = t.get('elapsedSec') or 0
        reward = t.get('reward') or {}
        rstr = ', '.join(f"{k}={v:+.2g}" for k, v in reward.items())
        total_s = f"{total:.2f}" if isinstance(total, (int, float)) else '-'
        print(f"  {n:>5} {total_s:>7} {str(grade):>5} {eps:>5} {sec:>7.1f}  {rstr}")


def _print_run(outroot: Path) -> Dict[str, Any]:
    print(f"\n=== {outroot} ===")
    if not outroot.exists():
        print("  (directory does not exist)")
        return {}
    trials = _load_trials(outroot)
    best = _load_best(outroot)
    space = _load_effective_space(outroot)
    summary = _summarize(trials)

    if space:
        irl = space.get('irlPriorBounds') or {}
        applied = irl.get('applied') or {}
        if applied:
            print(f"  IRL prior narrowed: {', '.join(sorted(applied))}")

    print(f"  trials found: {summary['n_trials_dir']}, completed: {summary['n_completed']}")
    if summary['n_completed']:
        print(f"  best score:   {summary['best_score']:.2f} (trial #{summary['best_trial_idx']})")
        print(f"  mean ± std:   {summary['mean_score']:.2f} ± {summary['std_score'] or 0:.2f}")
        print(f"  median:       {summary['median_score']:.2f}")
        print(f"  total time:   {summary['total_elapsed_sec']:.0f}s ({summary['total_elapsed_sec']/60:.1f} min)")
        print(f"  total eps:    {summary['total_episodes_trained']}")
        print(f"  avg time/trial: {summary['mean_elapsed_sec']:.1f}s")
    if summary['category_means']:
        print("  category means (max):")
        for k, v in sorted(summary['category_means'].items()):
            mx = summary['category_maxes'].get(k, v)
            flag = ' (LOW)' if v < 50 else ''
            print(f"    {k:>20}: {v:6.1f}  (max {mx:6.1f}){flag}")

    if best:
        print(f"  best.json says: trial #{best.get('bestTrial')} score {best.get('bestScore'):.2f}")
        rw = best.get('bestReward') or {}
        if rw:
            print(f"  best reward: {', '.join(f'{k}={v:+.3g}' for k, v in rw.items())}")

    _print_per_trial(trials)
    return summary


def _compare(summaries: List[Dict[str, Any]], outroots: List[Path]) -> None:
    print("\n=== comparison ===")
    print(f"  {'run':<40} {'best':>7} {'mean':>7} {'time':>9} {'eps':>7}")
    for outroot, s in zip(outroots, summaries):
        if not s:
            continue
        label = outroot.name[-40:]
        best = f"{s['best_score']:.2f}" if s.get('best_score') is not None else '-'
        avg = f"{s['mean_score']:.2f}" if s.get('mean_score') is not None else '-'
        time_min = f"{s['total_elapsed_sec']/60:.1f}m" if s.get('total_elapsed_sec') else '-'
        eps = str(s.get('total_episodes_trained', 0))
        print(f"  {label:<40} {best:>7} {avg:>7} {time_min:>9} {eps:>7}")

    # Carbon-style efficiency: episodes per +1 score over baseline
    valid = [(o, s) for o, s in zip(outroots, summaries) if s.get('best_score') is not None]
    if len(valid) >= 2:
        base_o, base_s = valid[0]
        print(f"\n  baseline: {base_o.name}")
        for o, s in valid[1:]:
            d_score = s['best_score'] - base_s['best_score']
            d_time = s['total_elapsed_sec'] - base_s['total_elapsed_sec']
            d_eps = s['total_episodes_trained'] - base_s['total_episodes_trained']
            print(f"  vs {o.name}:")
            print(f"    Δscore = {d_score:+.2f}  Δtime = {d_time:+.0f}s ({d_time/60:+.1f}m)  Δepisodes = {d_eps:+d}")


def main():
    ap = argparse.ArgumentParser(description='Analyze auto_reward_opt sweep results.')
    ap.add_argument('outroots', nargs='+', help='One or more sweep output directories (e.g. python_mappo/auto_reward_runs/auto_reward_*)')
    args = ap.parse_args()

    outroots = [Path(p) for p in args.outroots]
    summaries = [_print_run(p) for p in outroots]

    if len(outroots) >= 2:
        _compare(summaries, outroots)


if __name__ == '__main__':
    main()
