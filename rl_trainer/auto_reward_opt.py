"""Automated reward-coefficient optimization for the crane MAPPO pipeline.

For each Optuna trial we:
  1. Sample 7 reward coefficients (r_single, r_all, r_same, p_idle,
     p_inter_soft, p_time, p_move) from a configurable search space.
  2. Train a fresh MAPPO model with the sampled coefficients via train().
  3. Run the trained model on the *user's* site layout with
     env.run_policy_layout() (greedy, deterministic).
  4. Score the resulting schedule with scorer.score_schedule().
  5. Return totalScore to Optuna (maximize).

By default the user layout is also injected as `anchor_layout` into the
training cfg, so training scenarios are jittered around the real site
geometry. Pass --no-anchor to train on the default synthetic distribution
instead (still scored on the user site).

The study is persisted in a SQLite file under <outroot>/study.db so a
long sweep can be resumed by re-running the same command. Each trial
gets its own outdir with the trained checkpoint + result JSON.

Usage:
    python -m python_mappo.auto_reward_opt \
        --layout site.json \
        --n-trials 30 \
        --episodes 150 \
        --outroot python_mappo/auto_reward_runs

site.json schema (matches /api/plan/run payload):
    {
      "cranes": [{"id": "C1", "x": 20, "y": 30, "type": "..."}, ...],
      "lifts":  [{"id": "L1", "x": 55, "y": 12}, ...],
      "restrictedZones": [{"id": "RZ1", "x1": 40, "y1": 40, "x2": 60, "y2": 60}, ...]
    }
"""
from __future__ import annotations

import argparse
import copy
import json
import math
import sys
import time
from pathlib import Path
from typing import Any, Dict, List, Optional, Tuple

import numpy as np

try:
    from .train import load_cfg, train
    from crane_core.env import CraneSchedulingEnv
    from .mappo import MAPPOAgent
    from crane_core.scorer import score_schedule, DEFAULT_WEIGHTS
except ImportError:
    from train import load_cfg, train
    from crane_core.env import CraneSchedulingEnv
    from mappo import MAPPOAgent
    from crane_core.scorer import score_schedule, DEFAULT_WEIGHTS


# Tunable reward coefficients. Each entry: (key, kind, low, high)
#   kind: 'pos'  -> uniform on [low, high], values > 0
#         'neg'  -> uniform on [low, high], values < 0 (low < high <= 0)
class _PruneSignal(Exception):
    """Raised inside _run_trial when mid-training eval suggests this trial should be pruned."""
    pass


def _hyperband_rungs(min_resource: int, max_resource: int, reduction_factor: int) -> List[int]:
    """Return cumulative episode targets at which to report+check prune.

    Last entry is always max_resource. Example: min=15, max=150, rf=3 → [15, 45, 135, 150].
    """
    min_resource = max(1, int(min_resource))
    max_resource = max(min_resource, int(max_resource))
    rf = max(2, int(reduction_factor))
    rungs: List[int] = []
    r = min_resource
    while r < max_resource:
        rungs.append(r)
        r *= rf
    rungs.append(max_resource)
    seen = set()
    out: List[int] = []
    for x in rungs:
        if x not in seen:
            seen.add(x)
            out.append(x)
    return out


def _phase_schedule(pruner_kind: str, episodes: int,
                     hb_min_resource: int = 15, hb_reduction_factor: int = 3) -> List[int]:
    """Cumulative-episode checkpoints for the N-phase _run_trial loop.

    'none'       → [episodes]                 (single phase, no prune check)
    'median'     → [episodes//2, episodes]    (2 phases, 1 check)
    'hyperband'  → rungs from min→max         (N phases, N-1 checks)
    """
    episodes = max(1, int(episodes))
    if pruner_kind == 'hyperband':
        return _hyperband_rungs(hb_min_resource, episodes, hb_reduction_factor)
    if pruner_kind == 'median':
        half = max(10, episodes // 2)
        if half >= episodes:
            return [episodes]
        return [half, episodes]
    return [episodes]


DEFAULT_SEARCH_SPACE: Dict[str, Dict[str, Any]] = {
    'r_single':     {'kind': 'pos', 'low':  1.0,  'high':  50.0},
    'r_all':        {'kind': 'pos', 'low': 10.0,  'high': 500.0},
    'r_same':       {'kind': 'pos', 'low':  0.1,  'high':  20.0},
    'p_idle':       {'kind': 'neg', 'low': -5.0,  'high':  0.0},
    'p_inter_soft': {'kind': 'neg', 'low': -10.0, 'high':  0.0},
    'p_time':       {'kind': 'neg', 'low': -1.0,  'high':  0.0},
    'p_move':       {'kind': 'neg', 'low': -0.5,  'high':  0.0},
}


def _emit_progress(payload: Dict[str, Any]) -> None:
    print(f"PROGRESS_JSON: {json.dumps(payload, ensure_ascii=True)}", flush=True)


def _require_optuna():
    try:
        import optuna  # noqa: F401
        return optuna
    except ImportError as e:
        raise SystemExit(
            "optuna is required for auto_reward_opt. Install with:\n"
            "    pip install optuna\n"
            f"(import error: {e})"
        )


def _build_sampler(optuna, kind: str, seed: int):
    """Construct an Optuna sampler.

    'tpe'     -> TPESampler (default, best for >=30 trials).
    'botorch' -> BoTorchSampler (Gaussian-Process Bayesian opt; better at small
                 trial budgets <30; heavy deps: botorch + gpytorch + torch).
    """
    if kind == 'botorch':
        try:
            try:
                from optuna_integration.botorch import BoTorchSampler  # newer split package
            except ImportError:
                from optuna.integration.botorch import BoTorchSampler  # legacy path
        except ImportError as e:
            raise SystemExit(
                "BoTorchSampler requires botorch + gpytorch. Install with:\n"
                "    pip install optuna-integration[botorch] botorch gpytorch\n"
                f"(import error: {e})"
            )
        return BoTorchSampler(n_startup_trials=10, seed=seed)
    return optuna.samplers.TPESampler(seed=seed)


def _load_layout(path: Path) -> Dict[str, Any]:
    data = json.loads(Path(path).read_text(encoding='utf-8'))
    # Allow either { cranes, lifts, ... } or { layout: { ... } } or
    # { result: { layout: { ... } } } (the shape produced by /api/plan/run).
    if 'layout' in data and 'cranes' not in data:
        data = data['layout']
    if 'result' in data and 'cranes' not in data:
        data = data['result'].get('layout', data['result'])
    cranes = data.get('cranes') or []
    lifts = data.get('lifts') or []
    if not cranes or not lifts:
        raise SystemExit(f"layout file {path} must contain non-empty 'cranes' and 'lifts'")
    rz = data.get('restrictedZones') or data.get('restricted_zones') or []
    out = {'cranes': cranes, 'lifts': lifts, 'restrictedZones': rz}
    # Optional site dimensions (default 100x100 if absent).
    for src_key, dst_key in (('siteWidth', 'site_width'), ('site_width', 'site_width'),
                              ('siteHeight', 'site_height'), ('site_height', 'site_height')):
        if data.get(src_key) is not None:
            try:
                out[dst_key] = float(data[src_key])
            except (TypeError, ValueError):
                pass
    return out


def _load_search_space(path: Optional[Path]) -> Dict[str, Dict[str, Any]]:
    space = copy.deepcopy(DEFAULT_SEARCH_SPACE)
    if not path:
        _validate_search_space(space)
        return space
    override = json.loads(Path(path).read_text(encoding='utf-8'))
    for key, conf in (override or {}).items():
        if key not in space:
            continue
        for k in ('kind', 'low', 'high'):
            if k in conf and conf[k] is not None:
                space[key][k] = conf[k]
    _validate_search_space(space)
    return space


def _validate_search_space(space: Dict[str, Dict[str, Any]]) -> None:
    for key, conf in space.items():
        conf['low'] = float(conf['low'])
        conf['high'] = float(conf['high'])
        if conf['low'] >= conf['high']:
            raise SystemExit(f"search space for {key}: low ({conf['low']}) must be < high ({conf['high']})")
        if conf['kind'] == 'pos' and conf['low'] <= 0:
            raise SystemExit(f"search space for {key}: kind=pos requires low > 0 (got {conf['low']})")
        if conf['kind'] == 'neg' and conf['high'] > 0:
            raise SystemExit(f"search space for {key}: kind=neg requires high <= 0 (got {conf['high']})")


def _finite_float(value: Any) -> Optional[float]:
    try:
        out = float(value)
    except (TypeError, ValueError):
        return None
    return out if math.isfinite(out) else None


def _load_irl_prior_doc(path: Path) -> Dict[str, Any]:
    doc = json.loads(path.read_text(encoding='utf-8'))
    if not isinstance(doc, dict):
        raise SystemExit(f"--irl-prior is not a JSON object: {path}")
    names = set(doc.get('feature_names') or [])
    if not set(DEFAULT_SEARCH_SPACE).issubset(names):
        coef = doc.get('reward_coef')
        if not isinstance(coef, dict) or not set(DEFAULT_SEARCH_SPACE).issubset(coef):
            raise SystemExit(
                "--irl-prior must be a 7-dim reward-coef prior generated by the "
                f"new game_irl.irl_from_plays.py flow: {path}"
            )
    return doc


def _prior_dict(doc: Dict[str, Any], *keys: str) -> Dict[str, Any]:
    for key in keys:
        value = doc.get(key)
        if isinstance(value, dict):
            return value
    return {}


def _apply_irl_prior_to_search_space(
    space: Dict[str, Dict[str, Any]],
    prior_doc: Dict[str, Any],
    margin_alpha: float = 0.25,
) -> Tuple[Dict[str, Dict[str, Any]], Dict[str, Any]]:
    """Narrow reward search bounds using IRL coefficient confidence intervals.

    The incoming `space` is the hard domain boundary. IRL can only narrow it;
    it cannot flip reward signs or expand beyond user/default bounds.
    """
    out = copy.deepcopy(space)
    coef = _prior_dict(prior_doc, 'reward_coef', 'weights')
    ci_low = _prior_dict(prior_doc, 'reward_coef_ci_low', 'weight_ci_low')
    ci_high = _prior_dict(prior_doc, 'reward_coef_ci_high', 'weight_ci_high')
    # Newer estimators mark which coefficients the data could actually move.
    # Absent (older priors) every key is treated as identified, as before.
    identified = _prior_dict(prior_doc, 'identified')
    alpha = max(0.0, float(margin_alpha))
    applied: Dict[str, Dict[str, Any]] = {}
    skipped: Dict[str, str] = {}

    for key, base in space.items():
        base_low = float(base['low'])
        base_high = float(base['high'])
        lo = _finite_float(ci_low.get(key))
        hi = _finite_float(ci_high.get(key))
        mean = _finite_float(coef.get(key))
        if lo is None or hi is None:
            if mean is None:
                skipped[key] = 'missing CI and mean'
                continue
            lo = hi = mean
        if identified.get(key) is False:
            # The estimator says this feature carries no gradient (its value is
            # constant across the alternatives it was fitted against), so the
            # "coefficient" is the prior it started from. Narrowing the search
            # around it would pin the trainer to an assumption, not a finding.
            skipped[key] = 'not identified by the IRL fit'
            continue
        if lo > hi:
            lo, hi = hi, lo
        width = hi - lo
        # Relative, not absolute: an unidentified coefficient's bootstrap
        # interval is floating-point noise around a fixed value, and its width
        # scales with the value. r_single sat at 10.0 with a width of 4.5e-10 —
        # a thousand times the old 1e-12 floor, so it passed the guard and
        # pinned Optuna's search for that reward term to a single point.
        if width <= 1e-9 * max(1.0, abs(mean if mean is not None else hi)):
            skipped[key] = 'zero-width CI'
            continue
        expanded_low = lo - alpha * width
        expanded_high = hi + alpha * width
        clipped_low = max(base_low, expanded_low)
        clipped_high = min(base_high, expanded_high)
        if clipped_low >= clipped_high:
            skipped[key] = 'CI outside domain/sign bounds'
            continue
        base_width = base_high - base_low
        narrowed_width = clipped_high - clipped_low
        if narrowed_width >= base_width - 1e-12:
            skipped[key] = 'CI no narrower than domain'
            continue
        out[key]['low'] = clipped_low
        out[key]['high'] = clipped_high
        applied[key] = {
            'low': clipped_low,
            'high': clipped_high,
            'ciLow': lo,
            'ciHigh': hi,
            'expandedLow': expanded_low,
            'expandedHigh': expanded_high,
            'domainLow': base_low,
            'domainHigh': base_high,
        }

    _validate_search_space(out)
    meta = {
        'sourceMethod': prior_doc.get('method'),
        'marginAlpha': alpha,
        'applied': applied,
        'skipped': skipped,
    }
    return out, meta


def _suggest_reward(trial, space: Dict[str, Dict[str, Any]]) -> Dict[str, float]:
    out: Dict[str, float] = {}
    for key, conf in space.items():
        out[key] = float(trial.suggest_float(key, conf['low'], conf['high']))
    return out


def _build_trial_cfg(base_cfg: dict, reward: Dict[str, float], layout: Dict[str, Any], use_anchor: bool, anchor_jitter: float) -> dict:
    cfg = copy.deepcopy(base_cfg)
    cfg.setdefault('reward', {})
    cfg['reward'].update(reward)
    # Propagate site dimensions from the layout file when present, so trials
    # train at the same scale as the user's site.
    if 'site_width' in layout:
        cfg['site_width'] = float(layout['site_width'])
    if 'site_height' in layout:
        cfg['site_height'] = float(layout['site_height'])
    if use_anchor:
        cfg['anchor_layout'] = {
            'cranes': layout['cranes'],
            'lifts': layout['lifts'],
            'restrictedZones': layout['restrictedZones'],
        }
        cfg['anchor_jitter'] = float(anchor_jitter)
        cfg['num_cranes'] = len(layout['cranes'])
        cfg['num_lifts'] = len(layout['lifts'])
    return cfg


def _score_user_site(model_path: Path, cfg: dict, layout: Dict[str, Any],
                     weights: Optional[Dict[str, float]], n_eval_seeds: int = 1) -> Dict[str, Any]:
    """Load the trained model and evaluate on the user's site.

    Always runs the exact layout once (greedy, deterministic). When n_eval_seeds > 1
    and anchor_layout is configured, adds (n_eval_seeds - 1) jittered runs using seeds
    1000+ (well outside training seeds 101-330) and averages all scores. Jittered runs
    give a more robust generalization estimate without contaminating the exact-layout
    primary result stored in 'result'.
    """
    model = MAPPOAgent.load(str(model_path), device='cpu')
    params = {
        'fixed_duration': cfg.get('fixed_duration'),
        'setup_time': cfg.get('setup_time'),
        'teardown_time': cfg.get('teardown_time'),
        'num_cranes': len(layout['cranes']),
        'num_lifts': len(layout['lifts']),
    }
    env_exact = CraneSchedulingEnv(cfg)
    result = env_exact.run_policy_layout(
        'mappo', layout['cranes'], layout['lifts'],
        model=model, greedy=True,
        restricted_zones=layout['restrictedZones'],
    )
    result['layout'] = {
        'cranes': layout['cranes'],
        'lifts': layout['lifts'],
        'restrictedZones': layout['restrictedZones'],
    }
    exact_score = score_schedule(result, params=params, weights=weights)
    all_scores = [float(exact_score['totalScore'])]

    if n_eval_seeds > 1 and cfg.get('anchor_layout'):
        env_j = CraneSchedulingEnv(cfg)
        for s in range(1000, 1000 + n_eval_seeds - 1):
            r = env_j.run_policy('mappo', seed=s, model=model, greedy=True)
            sc = score_schedule(r, params=params, weights=weights)
            all_scores.append(float(sc['totalScore']))

    avg_total = float(np.mean(all_scores))
    combined = dict(exact_score)
    combined['totalScore'] = round(avg_total, 2)
    combined['evalScores'] = all_scores
    return {'result': result, 'score': combined}


def _run_trial(
    trial,
    base_cfg: dict,
    layout: Dict[str, Any],
    episodes: int,
    outroot: Path,
    total_trials: int,
    use_anchor: bool,
    anchor_jitter: float,
    weights: Optional[Dict[str, float]],
    space: Dict[str, Dict[str, Any]],
    device: str,
    progress_base: int = 0,
    progress_start_trial: int = 0,
    warm_start_path: Optional[str] = None,
    phase_schedule: Optional[List[int]] = None,
    n_eval_seeds: int = 1,
) -> float:
    reward = _suggest_reward(trial, space)
    trial_dir = outroot / f"trial_{trial.number:04d}"
    trial_dir.mkdir(parents=True, exist_ok=True)
    cfg = _build_trial_cfg(base_cfg, reward, layout, use_anchor, anchor_jitter)
    (trial_dir / 'config.yaml').write_text(json.dumps(cfg, ensure_ascii=False, indent=2), encoding='utf-8')

    t0 = time.time()
    model_path = trial_dir / 'pytorch_mappo_model.pt'

    # phase_schedule is cumulative episode counts. None = single full-episode phase.
    rungs = phase_schedule if phase_schedule else [episodes]
    prev_total = 0
    init_path: Optional[str] = warm_start_path
    for i, rung in enumerate(rungs):
        delta = max(1, rung - prev_total)
        train(cfg, episodes=delta, outdir=str(trial_dir), device=device,
              no_representative=True, skip_final_eval=True,
              init_model_path=init_path)
        is_last = (i == len(rungs) - 1)
        if not is_last and model_path.exists():
            mid_eval = _score_user_site(model_path, cfg, layout, weights, n_eval_seeds=1)
            trial.report(float(mid_eval['score']['totalScore']), step=rung)
            if trial.should_prune():
                raise _PruneSignal()
        prev_total = rung
        if model_path.exists():
            init_path = str(model_path)

    if not model_path.exists():
        raise RuntimeError(f"trial {trial.number}: no model artifact at {model_path}")

    eval_out = _score_user_site(model_path, cfg, layout, weights, n_eval_seeds=n_eval_seeds)
    total = float(eval_out['score']['totalScore'])
    elapsed = time.time() - t0

    summary = {
        'trial': trial.number,
        'reward': reward,
        'score': eval_out['score'],
        'siteResult': {
            'done': eval_out['result'].get('done'),
            'total': eval_out['result'].get('total'),
            'makespan': eval_out['result'].get('makespan'),
            'softInter': eval_out['result'].get('softInter'),
        },
        'elapsedSec': elapsed,
        'modelPath': str(model_path),
        'episodes': episodes,
        'anchor': use_anchor,
    }
    (trial_dir / 'trial_summary.json').write_text(
        json.dumps(summary, ensure_ascii=False, indent=2), encoding='utf-8'
    )
    (trial_dir / 'site_eval.json').write_text(
        json.dumps(eval_out, ensure_ascii=False, indent=2), encoding='utf-8'
    )

    completed_for_run = min(total_trials, progress_base + max(0, trial.number - progress_start_trial) + 1)
    _emit_progress({
        'type': 'auto_reward_trial',
        'trial': trial.number,
        'trialNumber': trial.number,
        'completedTrials': completed_for_run,
        'totalTrials': total_trials,
        'progressPct': completed_for_run / max(1, total_trials) * 100.0,
        'totalScore': total,
        'grade': eval_out['score'].get('grade'),
        'categories': eval_out['score'].get('categories') or {},
        'reward': reward,
        'elapsedSec': elapsed,
        'episodes': episodes,
        'anchor': use_anchor,
        'modelPath': str(model_path),
        'trialDir': str(trial_dir),
        'siteResult': summary['siteResult'],
    })

    # Per-category breakdown so we can also see Pareto trade-offs in the log.
    cat = ', '.join(f"{k}={v['score']:.1f}" for k, v in eval_out['score']['categories'].items())
    print(f"[trial {trial.number}] total={total:.2f} grade={eval_out['score']['grade']} ({cat}) "
          f"elapsed={elapsed:.1f}s reward={reward}", flush=True)
    return total


def _write_best(study, outroot: Path) -> None:
    if not study.trials:
        return
    completed = [t for t in study.trials if t.value is not None]
    if not completed:
        return
    best = max(completed, key=lambda t: t.value)
    best_dir = outroot / f"trial_{best.number:04d}"
    payload = {
        'bestTrial': best.number,
        'bestScore': best.value,
        'bestReward': best.params,
        'bestModelPath': str(best_dir / 'pytorch_mappo_model.pt'),
        'bestTrialDir': str(best_dir),
        'completedTrials': len(completed),
    }
    (outroot / 'best.json').write_text(
        json.dumps(payload, ensure_ascii=False, indent=2), encoding='utf-8'
    )


def main():
    ap = argparse.ArgumentParser(description='Auto-tune reward coefficients to maximize site score.')
    ap.add_argument('--layout', required=True, help='Path to user site layout JSON ({cranes, lifts, restrictedZones})')
    ap.add_argument('--config', default=str(Path(__file__).with_name('config.yaml')), help='Base MAPPO config.yaml')
    ap.add_argument('--n-trials', type=int, default=30)
    ap.add_argument('--episodes', type=int, default=None, help='Train episodes per trial (default: cfg.train_episodes)')
    ap.add_argument('--outroot', default=str(Path(__file__).with_name('auto_reward_runs')))
    ap.add_argument('--study-name', default=None, help='Optuna study name; default derived from layout filename')
    ap.add_argument('--storage', default=None, help='Optuna storage URI; default sqlite:///<outroot>/study.db')
    ap.add_argument('--sampler-seed', type=int, default=42)
    ap.add_argument('--sampler', choices=['tpe', 'botorch'], default='tpe',
                    help='Search algorithm. "tpe" (default): TPESampler, best for >=30 trials. '
                         '"botorch": Gaussian-Process Bayesian opt, better at small budgets <30. '
                         'Requires extra deps: pip install botorch gpytorch.')
    ap.add_argument('--anchor', dest='anchor', action='store_true', help='Train with user layout as anchor (default)')
    ap.add_argument('--no-anchor', dest='anchor', action='store_false', help='Train on default synthetic distribution; score on user site only')
    ap.set_defaults(anchor=True)
    ap.add_argument('--anchor-jitter', type=float, default=5.0)
    ap.add_argument('--score-weights', default=None, help='Optional JSON file with scorer weight overrides')
    ap.add_argument('--irl-prior', default=None,
                    help='IRL prior JSON from game_irl.irl_from_plays. Its 7-dim '
                         'reward coefficient confidence intervals narrow the Optuna '
                         'search bounds; trial scoring still uses scorer.DEFAULT_WEIGHTS '
                         'or --score-weights.')
    ap.add_argument('--irl-prior-margin', type=float, default=0.25,
                    help='Expand each IRL CI by alpha*width before clipping to the hard search domain')
    ap.add_argument('--search-space', default=None, help='Optional JSON file with search-space overrides')
    ap.add_argument('--device', default='cpu')
    ap.add_argument('--pruner', choices=['none', 'median', 'hyperband'], default=None,
                    help='Pruner type. "none": no pruning. "median": 2-phase 50/50 MedianPruner. '
                         '"hyperband": N-phase rungs (min..max) HyperbandPruner -- kills bad trials '
                         'earlier and explores more configs in the same wall-clock budget. '
                         'Default: derived from --pruning (none if absent, median if set).')
    ap.add_argument('--pruning', action='store_true',
                    help='[Deprecated] Alias for --pruner median. Use --pruner instead.')
    ap.add_argument('--hyperband-min-resource', type=int, default=15,
                    help='Hyperband first-rung episode count (default 15)')
    ap.add_argument('--hyperband-reduction-factor', type=int, default=3,
                    help='Hyperband rung multiplier (default 3, rungs at 15, 45, 135, ...)')
    ap.add_argument('--eval-seeds', type=int, default=1,
                    help='Number of evaluation runs per trial (1=exact layout only; >1 adds jittered runs for variance reduction, requires anchor)')
    ap.add_argument('--warm-start', action='store_true',
                    help='Warm-start each new trial from the running best checkpoint. '
                         'Speeds early-trial convergence but introduces path-dependence in TPE search '
                         '(can bias toward locally-good regions). Default off; use only when you prioritize '
                         'score maximization over unbiased reward-landscape exploration.')
    args = ap.parse_args()

    optuna = _require_optuna()

    layout = _load_layout(Path(args.layout))
    base_cfg = load_cfg(args.config)
    episodes = int(args.episodes or base_cfg.get('train_episodes', 150))

    weights: Optional[Dict[str, float]] = None
    weights_source: Optional[str] = None
    if args.score_weights:
        wpath = Path(args.score_weights)
        weights = json.loads(wpath.read_text(encoding='utf-8'))
        for k in list(weights.keys()):
            if k not in DEFAULT_WEIGHTS:
                weights.pop(k)
        weights_source = f"score_weights:{wpath.name}"

    space = _load_search_space(Path(args.search_space) if args.search_space else None)
    irl_space_meta: Optional[Dict[str, Any]] = None
    irl_prior_source: Optional[str] = None
    if args.irl_prior:
        ppath = Path(args.irl_prior)
        prior_doc = _load_irl_prior_doc(ppath)
        space, irl_space_meta = _apply_irl_prior_to_search_space(
            space,
            prior_doc,
            margin_alpha=args.irl_prior_margin,
        )
        irl_prior_source = str(ppath)
    outroot = Path(args.outroot)
    outroot.mkdir(parents=True, exist_ok=True)
    (outroot / 'effective_search_space.json').write_text(
        json.dumps({
            'searchSpace': space,
            'irlPriorSource': irl_prior_source,
            'irlPriorBounds': irl_space_meta,
        }, ensure_ascii=False, indent=2),
        encoding='utf-8',
    )

    study_name = args.study_name or f"auto_reward_{Path(args.layout).stem}"
    storage = args.storage or f"sqlite:///{(outroot / 'study.db').as_posix()}"
    sampler = _build_sampler(optuna, args.sampler, args.sampler_seed)
    pruner_kind = args.pruner or ('median' if args.pruning else 'none')
    if pruner_kind == 'hyperband':
        pruner = optuna.pruners.HyperbandPruner(
            min_resource=args.hyperband_min_resource,
            max_resource=episodes,
            reduction_factor=args.hyperband_reduction_factor,
        )
    elif pruner_kind == 'median':
        pruner = optuna.pruners.MedianPruner(n_startup_trials=10, n_warmup_steps=0)
    else:
        pruner = optuna.pruners.NopPruner()
    phase_schedule = _phase_schedule(pruner_kind, episodes,
                                     args.hyperband_min_resource,
                                     args.hyperband_reduction_factor)
    study = optuna.create_study(
        study_name=study_name,
        storage=storage,
        sampler=sampler,
        pruner=pruner,
        direction='maximize',
        load_if_exists=True,
    )
    completed_before = len([t for t in study.trials if t.value is not None])
    target_trials = max(1, int(args.n_trials))
    remaining_trials = max(0, target_trials - completed_before)
    start_trial_number = len(study.trials)

    print(f"[auto_reward_opt] study={study_name} storage={storage}", flush=True)
    print(f"[auto_reward_opt] layout cranes={len(layout['cranes'])} lifts={len(layout['lifts'])} zones={len(layout['restrictedZones'])}", flush=True)
    print(f"[auto_reward_opt] target_trials={target_trials} completed={completed_before} remaining={remaining_trials} episodes/trial={episodes} anchor={args.anchor} device={args.device}", flush=True)
    if weights_source:
        print(f"[auto_reward_opt] scoring weights override: {weights_source} → {weights}", flush=True)
    if irl_space_meta:
        applied_keys = ', '.join(sorted(irl_space_meta.get('applied') or {})) or 'none'
        print(f"[auto_reward_opt] IRL prior bounds: source={irl_prior_source} margin={args.irl_prior_margin} applied={applied_keys}", flush=True)
    print(f"[auto_reward_opt] sampler={args.sampler} pruner={pruner_kind} phase_schedule={phase_schedule} eval_seeds={args.eval_seeds} warm_start={args.warm_start}", flush=True)

    best_model_so_far: Optional[str] = None

    def _objective(trial):
        nonlocal best_model_so_far
        warm_path = best_model_so_far if args.warm_start else None
        try:
            result = _run_trial(
                trial, base_cfg, layout, episodes, outroot, target_trials,
                args.anchor, args.anchor_jitter, weights, space, args.device,
                completed_before, start_trial_number,
                warm_start_path=warm_path,
                phase_schedule=phase_schedule,
                n_eval_seeds=args.eval_seeds,
            )
        except _PruneSignal:
            raise optuna.TrialPruned()
        if args.warm_start:
            completed = [t for t in study.trials if t.value is not None]
            if completed:
                best_t = max(completed, key=lambda t: t.value)
                candidate = outroot / f"trial_{best_t.number:04d}" / 'pytorch_mappo_model.pt'
                if candidate.exists():
                    best_model_so_far = str(candidate)
        return result

    try:
        if remaining_trials > 0:
            study.optimize(_objective, n_trials=remaining_trials, gc_after_trial=True)
        else:
            print(f"[auto_reward_opt] target already reached: completed={completed_before} target={target_trials}", flush=True)
    finally:
        _write_best(study, outroot)

    completed = [t for t in study.trials if t.value is not None]
    if completed:
        best = max(completed, key=lambda t: t.value)
        print(json.dumps({
            'ok': True,
            'studyName': study_name,
            'completedTrials': len(completed),
            'bestTrial': best.number,
            'bestScore': best.value,
            'bestReward': best.params,
            'bestModelPath': str((outroot / f"trial_{best.number:04d}" / 'pytorch_mappo_model.pt').resolve()),
        }, ensure_ascii=False, indent=2))
        _emit_progress({
            'type': 'auto_reward_done',
            'studyName': study_name,
            'completedTrials': min(len(completed), target_trials),
            'totalTrials': target_trials,
            'bestTrial': best.number,
            'bestScore': best.value,
            'bestReward': best.params,
            'bestModelPath': str((outroot / f"trial_{best.number:04d}" / 'pytorch_mappo_model.pt').resolve()),
        })
    else:
        print(json.dumps({'ok': False, 'message': 'no completed trials'}, ensure_ascii=False))
        sys.exit(1)


if __name__ == '__main__':
    main()
