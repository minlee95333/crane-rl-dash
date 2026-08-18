from __future__ import annotations
import argparse, json, time, copy, random
from pathlib import Path
import yaml
import numpy as np
import torch

try:
    from crane_core.env import CraneSchedulingEnv
    from .mappo import MAPPOAgent, Transition, load_checkpoint
except ImportError:
    from crane_core.env import CraneSchedulingEnv
    from mappo import MAPPOAgent, Transition, load_checkpoint


def _deep_merge(base: dict, override: dict) -> dict:
    """Recursively merge `override` onto `base`. Dict values merge key-by-key;
    everything else (scalars, lists) is replaced. Returns the mutated `base`."""
    for k, v in (override or {}).items():
        if isinstance(v, dict) and isinstance(base.get(k), dict):
            _deep_merge(base[k], v)
        else:
            base[k] = v
    return base


def load_cfg(path):
    """Load a YAML config, optionally extending another via a top-level `_base:` key.

    `_base` is resolved relative to the loaded file's directory. Useful for keeping
    small "delta" configs that override only a few keys without duplicating the
    full hyperparameter block from the base config.

    Note: a model directory's sidecar must be named `config.yaml` — that is the
    only name the dashboard's metadata extractor reads (crane_web/model_meta.py).
    """
    path = Path(path)
    with open(path, 'r', encoding='utf-8') as f:
        cfg = yaml.safe_load(f) or {}
    base_ref = cfg.pop('_base', None)
    if base_ref:
        base_path = (path.parent / base_ref).resolve()
        base_cfg = load_cfg(base_path)
        cfg = _deep_merge(base_cfg, cfg)
    return cfg


def summarize(samples):
    def avg(key): return float(np.mean([s.get(key,0) for s in samples])) if samples else 0.0
    def sd(key): return float(np.std([s.get(key,0) for s in samples])) if samples else 0.0
    return {
        'n': len(samples),
        'completeRate': float(np.mean([100*s['done']/max(1,s['total']) for s in samples])) if samples else 0.0,
        'makespan': avg('makespan'), 'makespanSd': sd('makespan'), 'reward': avg('reward'),
        'soft': avg('softInter'),
        'hardExecuted': avg('hardExecuted'),
        'hardMask': avg('hardMask') if any('hardMask' in s for s in samples) else avg('hardInter'),
        'travel': avg('travelTotal'),
        'setup': avg('setupTotal'), 'teardown': avg('teardownTotal'), 'move': avg('moveTotal'),
        'restrictedMask': avg('restrictedMask'),
        'restrictedExecuted': avg('restrictedExecuted'),
        'restrictedDetourDistance': avg('restrictedDetourDistance'),
        'actualLiftRadius': avg('actualLiftRadiusAvg'), 'actualDangerRadius': avg('actualDangerRadiusAvg'),
        'ratedMaxRadius': avg('ratedMaxRadiusAvg'),
        'loadWeightAvgT': avg('loadWeightAvgT'),
        'loadWeightMaxT': avg('loadWeightMaxT'),
    }


def _is_finite_agent(agent) -> bool:
    """Return False if any actor/critic parameter contains NaN or Inf (training has diverged)."""
    for p in agent.actor.parameters():
        if not torch.isfinite(p).all():
            return False
    for p in agent.critic.parameters():
        if not torch.isfinite(p).all():
            return False
    return True


def _save_checkpoint_from_state(model_path, best_state, cfg, extra):
    """Persist best_state as a normal MAPPOAgent.save() compatible .pt without disturbing live agent."""
    torch.save({
        'actor': best_state['actor'],
        'critic': best_state['critic'],
        'cfg': cfg,
        'stats': best_state['stats'],
        'extra': extra or {},
    }, str(model_path))


def _write_partial_result(result_path, cfg, train_log, best, best_eval, model_stats, t0, ep, episodes,
                          use_validation, seen_start, seen_count, validation_start, validation_count,
                          unseen_start, unseen_count, eval_interval, model_path):
    """Write an in-progress result JSON every eval interval so a mid-train crash leaves usable artifacts."""
    payload = {
        'config': cfg,
        'elapsedSec': time.time() - t0,
        'trainEpisodes': ep,
        'plannedEpisodes': episodes,
        'inprogress': True,
        'lastEpisode': ep,
        'selection': {'validationAware': use_validation, 'seenStart': seen_start, 'seenCount': seen_count,
                      'validationStart': validation_start, 'validationCount': validation_count,
                      'unseenStart': unseen_start, 'unseenCount': unseen_count, 'evalInterval': eval_interval},
        'trainSummary': {'best': best, 'bestCheckpointSeen': best_eval, 'modelStats': model_stats},
        'learningCurve': train_log,
        'modelPath': str(model_path),
    }
    Path(result_path).write_text(json.dumps(payload, ensure_ascii=False, indent=2), encoding='utf-8')


def evaluate(env, agent, seed_start, seed_count):
    policies = ['mappo', 'nearest', 'radiusPriority', 'random']
    out={}
    for pol in policies:
        samples=[]
        for seed in range(seed_start, seed_start+seed_count):
            samples.append(env.run_policy(pol, model=agent, seed=seed, greedy=True))
        out[pol]=summarize(samples)
    return out


def pct_improve(base: float, value: float) -> float:
    """Percentage improvement of `value` over `base` (positive when value < base).
    Returns 0 when base is falsy/zero so callers don't divide by zero. Used by the
    sweep drivers (repeated_validation, reward_sweep) for the Nearest-vs-MAPPO delta."""
    if not base:
        return 0.0
    return (base - value) / base * 100.0


def seed_everything(seed: int) -> int:
    """Seed every global RNG used by MAPPO training and return the normalized seed."""
    seed = int(seed)
    random.seed(seed)
    np.random.seed(seed)
    torch.manual_seed(seed)
    return seed


def run_one_episode(env, agent, ep, episodes, base, seed_runs, eps_start, eps_end):
    """Roll out one episode and return everything the caller needs to drive the
    update step and log progress. Identical loop body to what train() and
    curriculum.train_one_level() used to inline separately; extract to keep them
    from drifting (GAE bootstrap, true-terminal flag, etc. should match exactly).

    Returns: (seed, ep_reward, transitions, bootstrap_value).
    """
    seed = base + ((ep - 1) % max(1, seed_runs))
    obs, masks, glob = env.reset(seed)
    # Emit a small per-episode layout snapshot so the dashboard can preview what
    # the policy is seeing right now (Option A — layout only, no schedule events).
    # Init positions are captured here BEFORE step() starts mutating crane setup_x/y.
    layout_payload = {
        'ep': ep, 'seed': seed,
        'cranes': [{'id': c.id, 'x': round(float(c.x), 3), 'y': round(float(c.y), 3), 'type': c.type} for c in env.cranes],
        'lifts': [{
            'id': l.id,
            'x': round(float(l.x), 3),
            'y': round(float(l.y), 3),
            'weightT': round(float(l.weight_t), 3),
            # 2.5D: rated radius depends on crane (ground_z) + lift (z). For this
            # layout preview use the first crane as representative; in pure-2D mode
            # (no boom/chart) the result is crane-independent, matching legacy output.
            'ratedMaxRadius': round(float(env._lift_max_radius(env.cranes[0], l)) if env.cranes else float(env.crane_radius), 3),
        } for l in env.lifts],
        'restrictedZones': [{'id': z.get('id'), 'x1': round(float(z['x1']), 3), 'y1': round(float(z['y1']), 3),
                              'x2': round(float(z['x2']), 3), 'y2': round(float(z['y2']), 3)} for z in env.restricted_zones],
        'craneRadius': float(env.crane_radius),
        'defaultLiftWeightT': float(env.default_lift_weight_t),
        'liftWeightMinT': float(env.lift_weight_min_t),
        'liftWeightMaxT': float(env.lift_weight_max_t),
        'craneCapacityCurve': [{'radius': r, 'capacityT': c} for r, c in env.crane_capacity_curve],
        'siteWidth': float(env.site_width),
        'siteHeight': float(env.site_height),
    }
    print(f"EPISODE_LAYOUT_JSON: {json.dumps(layout_payload)}", flush=True)
    transitions = []
    ep_reward = 0.0
    done = False
    while not done:
        eps = eps_start + (eps_end - eps_start) * (ep / max(1, episodes))
        actions, logps = agent.act(obs, masks, greedy=False, epsilon=eps)
        values = agent.value(np.stack([glob] * env.nC))
        prev_obs, prev_masks, prev_glob = obs.copy(), masks.copy(), glob.copy()
        obs, masks, glob, rewards, done, info = env.step(actions)
        ep_reward += float(np.sum(rewards))
        # done=True from env covers both true terminal (all lifts placed) and step-cap truncation.
        # For GAE we want done=True only on true terminal; truncated rollouts must bootstrap V(s_T).
        true_terminal = bool(done) and env.done_count() >= env.nL
        for ci in range(env.nC):
            transitions.append(Transition(
                ci, prev_obs[ci], prev_masks[ci], prev_glob,
                int(actions[ci]), float(logps[ci]), float(values[ci]),
                float(rewards[ci]), true_terminal, epsilon=float(eps),
            ))
    bootstrap_value = 0.0 if (env.done_count() >= env.nL) else float(agent.value(np.stack([glob]))[0])
    return seed, ep_reward, transitions, bootstrap_value


def checkpoint_selection_score(seen_eval, validation_eval=None):
    """Lower is better. Same selection rule as curriculum.py.

    If validation is disabled, this falls back to seen makespan so old runs remain possible.
    """
    seen = seen_eval['mappo'] if 'mappo' in seen_eval else seen_eval
    if validation_eval is None:
        return float(seen['makespan'])
    val_mappo = validation_eval['mappo']
    val_nearest = validation_eval['nearest']
    # The previous formulation carried a `1000.0 * val_mappo['hardExecuted']` penalty,
    # but env.step() forbids executing hard-overlap candidates (it always replaces or
    # idles), so hardExecuted is structurally always 0 and that term contributed
    # nothing. Removed to make the score function honest about what it actually weighs.
    return (
        0.3 * float(seen['makespan'])
        + 0.7 * float(val_mappo['makespan'])
        + 2.0 * max(0.0, float(val_mappo['makespan']) - float(val_nearest['makespan']))
    )


def train(
    cfg,
    episodes=None,
    outdir='outputs',
    device='cpu',
    validation_start=None,
    validation_count=None,
    unseen_start=None,
    unseen_count=None,
    eval_interval=None,
    no_best_checkpoint=False,
    no_representative=False,
    skip_final_eval=False,
    init_model_path=None,
    final_eval_max=None,
    skip_final_checkpoint_eval=False,
):
    outdir=Path(outdir); outdir.mkdir(parents=True, exist_ok=True)
    base_seed = seed_everything(cfg.get('base_seed', 101))
    env=CraneSchedulingEnv(cfg)
    obs,masks,glob=env.reset(base_seed)
    agent=MAPPOAgent(obs_dim=obs.shape[-1], state_dim=glob.shape[-1], cfg=cfg, device=device)
    if init_model_path:
        ckpt = load_checkpoint(init_model_path, map_location=device)
        ckpt_actor_dim = ckpt.get('stats', {}).get('actorDim')
        ckpt_critic_dim = ckpt.get('stats', {}).get('criticDim')
        if ckpt_actor_dim != obs.shape[-1] or ckpt_critic_dim != glob.shape[-1]:
            raise RuntimeError(f"init-model architecture mismatch: checkpoint actorDim={ckpt_actor_dim} criticDim={ckpt_critic_dim} but current env actorDim={obs.shape[-1]} criticDim={glob.shape[-1]}. num_cranes/num_lifts/candidate_k must match.")
        agent.actor.load_state_dict(ckpt['actor'])
        agent.critic.load_state_dict(ckpt['critic'])
        print(f"[init] loaded weights from {init_model_path}", flush=True)
    m=cfg.get('mappo', {})
    episodes = int(episodes or cfg.get('train_episodes',150))
    seed_runs=int(cfg.get('seed_runs',10)); base=int(cfg.get('base_seed',101))
    eps_start=float(m.get('eps_start',0.35)); eps_end=float(m.get('eps_end',0.05))
    train_log=[]; best=None; best_eval=None; best_state=None; t0=time.time()
    seen_start = int(cfg.get('seen_seed_start',101))
    seen_count = int(cfg.get('seen_seed_count',10))
    validation_start = int(validation_start if validation_start is not None else cfg.get('validation_seed_start', 201))
    validation_count = int(validation_count if validation_count is not None else cfg.get('validation_seed_count', 20))
    unseen_start = int(unseen_start if unseen_start is not None else cfg.get('unseen_seed_start',301))
    unseen_count = int(unseen_count if unseen_count is not None else cfg.get('unseen_seed_count',30))
    use_validation = validation_start > 0 and validation_count > 0
    eval_interval = int(eval_interval or cfg.get('eval_interval', 0) or max(5, episodes//10))
    aborted_due_to_nan = False
    last_ep = 0
    model_path = outdir/'pytorch_mappo_model.pt'
    result_path = outdir/'pytorch_mappo_validation_result.json'
    for ep in range(1, episodes+1):
        last_ep = ep
        seed, ep_reward, transitions, bootstrap_value = run_one_episode(env, agent, ep, episodes, base, seed_runs, eps_start, eps_end)
        loss=agent.update(transitions, bootstrap_value=bootstrap_value)
        if not _is_finite_agent(agent):
            print(f"[ABORT] NaN/Inf detected in actor/critic weights after ep={ep}. Rolling back to last best checkpoint and ending training cleanly. best_eval_ep={(best_eval or {}).get('ep')}", flush=True)
            aborted_due_to_nan = True
            break
        summary=env.summary(); summary['reward']=ep_reward
        row={'ep':ep,'seed':seed,'makespan':summary['makespan'],'done':summary['done'],'total':summary['total'],'reward':ep_reward,'soft':summary['softInter'],'hardExecuted':summary.get('hardExecuted',0),'hardMask':summary.get('hardMask',summary.get('hardInter',0)),'restrictedMask':summary.get('restrictedMask',0),'restrictedExecuted':summary.get('restrictedExecuted',0),'restrictedDetourDistance':summary.get('restrictedDetourDistance',0),'move':summary['moveTotal'],'travel':summary['travelTotal'],'setup':summary['setupTotal'],'teardown':summary.get('teardownTotal',0)}
        train_log.append(row)
        print(f"PROGRESS_JSON: {json.dumps({'totalEpisodes': episodes, **row})}", flush=True)
        if summary['done']==summary['total'] and (best is None or summary['makespan']<best['makespan']):
            best=dict(row)
        # Keep the best checkpoint by the same validation-aware rule as curriculum.py.
        # skip_final_checkpoint_eval drops the forced eval at the last episode — the
        # dashboard pays a 30-episode (seen 10 + validation 20) tail otherwise. The
        # last periodic eval still runs if ep happens to coincide; otherwise the
        # most recent prior best_state is what gets saved.
        fires_periodic = (ep % max(1, eval_interval) == 0) and (ep != episodes)
        fires_final = (ep == episodes) and not skip_final_checkpoint_eval
        if not no_best_checkpoint and (fires_periodic or fires_final):
            seen_eval = evaluate(CraneSchedulingEnv(cfg), agent, seen_start, seen_count)
            validation_eval = evaluate(CraneSchedulingEnv(cfg), agent, validation_start, validation_count) if use_validation else None
            score = checkpoint_selection_score(seen_eval, validation_eval)
            probe = dict(seen_eval['mappo'], ep=ep, selectionScore=score)
            if validation_eval is not None:
                probe['validation'] = validation_eval
                probe['validationMakespan'] = validation_eval['mappo']['makespan']
                probe['validationNearestMakespan'] = validation_eval['nearest']['makespan']
            updated_best = False
            if best_eval is None or score < best_eval['selectionScore']:
                best_eval = probe
                best_state = {
                    'actor': copy.deepcopy(agent.actor.state_dict()),
                    'critic': copy.deepcopy(agent.critic.state_dict()),
                    'stats': copy.deepcopy(agent.stats),
                }
                updated_best = True
            # Persist progress to disk every eval so a crash later doesn't lose anything.
            if best_state is not None and updated_best:
                _save_checkpoint_from_state(model_path, best_state, cfg, extra={
                    'best': best, 'bestCheckpointSeen': best_eval, 'inprogress': True,
                    'savedAtEpisode': ep, 'plannedEpisodes': episodes,
                    'selection': {'validationAware': use_validation, 'seenStart': seen_start, 'seenCount': seen_count,
                                  'validationStart': validation_start, 'validationCount': validation_count,
                                  'unseenStart': unseen_start, 'unseenCount': unseen_count},
                })
            _write_partial_result(result_path, cfg, train_log, best, best_eval, agent.stats, t0, ep, episodes,
                                  use_validation, seen_start, seen_count, validation_start, validation_count,
                                  unseen_start, unseen_count, eval_interval, model_path)
        if ep % max(1, episodes//10) == 0:
            best_msg = None
            if best_eval is not None:
                best_msg = f"score={best_eval['selectionScore']:.3f} seen={best_eval['makespan']:.3f} val={best_eval.get('validationMakespan', 'n/a')}"
            print(f"ep={ep}/{episodes} makespan={summary['makespan']:.1f} reward={ep_reward:.1f} best={best['makespan'] if best else None} checkpointBest={best_msg} updates={agent.stats['updates']}", flush=True)
    if aborted_due_to_nan and best_state is None:
        print(f"[FATAL] NaN detected at ep={last_ep} before any best checkpoint was recorded. No usable model artifact produced.", flush=True)
        raise RuntimeError(f"training diverged at ep={last_ep} with no usable checkpoint; consider reducing actor_lr/critic_lr or episodes")
    if best_state is not None and not no_best_checkpoint:
        agent.actor.load_state_dict(best_state['actor'])
        agent.critic.load_state_dict(best_state['critic'])
        agent.stats = best_state['stats']
        if aborted_due_to_nan:
            # Adam carries running moment estimates that may have been polluted by the
            # diverged update. Rebuild the optimizers so any future resume after rollback
            # starts from a clean slate; current callers only run inference after this,
            # but this guards against an in-place training resume being added later.
            mm = cfg.get('mappo', {})
            agent.actor_opt = torch.optim.Adam(agent.actor.parameters(), lr=float(mm.get('actor_lr', 1e-3)))
            agent.critic_opt = torch.optim.Adam(agent.critic.parameters(), lr=float(mm.get('critic_lr', 2e-3)))
    # The post-training "report" evaluations are the dominant cost of the 99%→100%
    # tail because they run seen+validation+unseen episodes greedily after every
    # PROGRESS_JSON line has been emitted. final_eval_max caps each split for this
    # final pass only (during-training eval-interval checkpoints stay full so best-
    # checkpoint selection isn't degraded).
    cap = None if final_eval_max is None else max(0, int(final_eval_max))
    fseen_n = seen_count if cap is None else min(seen_count, cap)
    fval_n = validation_count if cap is None else min(validation_count, cap)
    funseen_n = unseen_count if cap is None else min(unseen_count, cap)
    seen=evaluate(env, agent, seen_start, fseen_n) if (not skip_final_eval and fseen_n>0) else None
    validation=evaluate(env, agent, validation_start, fval_n) if (use_validation and not skip_final_eval and fval_n>0) else None
    unseen=evaluate(env, agent, unseen_start, funseen_n) if (not skip_final_eval and funseen_n>0) else None
    agent.save(str(model_path), extra={'best':best, 'bestCheckpointSeen':best_eval, 'abortedDueToNan': aborted_due_to_nan, 'lastEpisode': last_ep, 'selection':{'validationAware':use_validation,'seenStart':seen_start,'seenCount':seen_count,'validationStart':validation_start,'validationCount':validation_count,'unseenStart':unseen_start,'unseenCount':unseen_count}})
    representative={}
    if not no_representative:
        representative={
            'mappo': env.run_policy('mappo', model=agent, seed=int(cfg.get('seen_seed_start',101)), greedy=True),
            'nearest': env.run_policy('nearest', model=agent, seed=int(cfg.get('seen_seed_start',101)), greedy=True),
        }
    result={'config':cfg,'elapsedSec':time.time()-t0,'trainEpisodes':last_ep if aborted_due_to_nan else episodes,'plannedEpisodes':episodes,'abortedDueToNan':aborted_due_to_nan,'lastEpisode':last_ep,'selection':{'validationAware':use_validation,'seenStart':seen_start,'seenCount':seen_count,'validationStart':validation_start,'validationCount':validation_count,'unseenStart':unseen_start,'unseenCount':unseen_count,'evalInterval':eval_interval,'skipFinalEval':skip_final_eval,'representativeSaved':not no_representative},'trainSummary':{'best':best,'bestCheckpointSeen':best_eval,'first10':summarize(_rows_to_samples(train_log[:10])),'last20':summarize(_rows_to_samples(train_log[-20:])),'modelStats':agent.stats},'learningCurve':train_log,'seen':seen,'validation':validation,'unseen':unseen,'representative':representative,'modelPath':str(model_path)}
    result_path.write_text(json.dumps(result, ensure_ascii=False, indent=2), encoding='utf-8')
    curve_path=outdir/'learning_curve.csv'
    curve_cols=['ep','seed','makespan','done','total','reward','soft','hardExecuted','hardMask','restrictedMask','restrictedExecuted','restrictedDetourDistance','travel','setup','teardown','move']
    curve_path.write_text(','.join(curve_cols)+'\n'+'\n'.join(','.join(str(r.get(c,'')) for c in curve_cols) for r in train_log), encoding='utf-8')
    summary_out = {
        'ok': True,
        'modelPath': str(model_path),
        'resultPath': str(result_path),
        'curvePath': str(curve_path),
        'elapsedSec': result['elapsedSec'],
        'trainEpisodes': episodes,
        'selection': result['selection'],
        'best': best,
        'bestCheckpointSeen': best_eval,
    }
    print(json.dumps(summary_out, ensure_ascii=False, indent=2))
    return result


def _rows_to_samples(rows):
    return [{'done':r['done'],'total':r['total'],'makespan':r['makespan'],'reward':r['reward'],'softInter':r['soft'],'hardExecuted':r.get('hardExecuted',0),'hardMask':r.get('hardMask',0),'hardInter':r.get('hardMask',0),'restrictedMask':r.get('restrictedMask',0),'restrictedExecuted':r.get('restrictedExecuted',0),'restrictedDetourDistance':r.get('restrictedDetourDistance',0),'moveTotal':r['move'],'travelTotal':r.get('travel',0),'setupTotal':r.get('setup',0),'teardownTotal':r.get('teardown',0)} for r in rows]


if __name__ == '__main__':
    ap=argparse.ArgumentParser()
    ap.add_argument('--config', default=str(Path(__file__).with_name('config.yaml')))
    ap.add_argument('--episodes', type=int, default=None)
    ap.add_argument('--outdir', default=str(Path(__file__).with_name('outputs')))
    ap.add_argument('--device', default='cpu')
    ap.add_argument('--validation-start', type=int, default=None, help='validation seed start for checkpoint selection; 0 disables validation-aware selection')
    ap.add_argument('--validation-count', type=int, default=None)
    ap.add_argument('--unseen-start', type=int, default=None)
    ap.add_argument('--unseen-count', type=int, default=None)
    ap.add_argument('--eval-interval', type=int, default=None)
    ap.add_argument('--no-best-checkpoint', action='store_true')
    ap.add_argument('--no-representative', action='store_true', help='skip replay-heavy representative schedules in result JSON')
    ap.add_argument('--skip-final-eval', action='store_true', help='save trained model without final seen/validation/unseen evaluation; run evaluate.py separately')
    ap.add_argument('--final-eval-max', type=int, default=None, help='cap per-split episodes in the post-training seen/validation/unseen evaluation (does not affect during-training checkpoint eval)')
    ap.add_argument('--skip-final-checkpoint-eval', action='store_true', help='skip the forced eval-interval checkpoint at ep==episodes (the prior periodic best_state is what gets saved)')
    ap.add_argument('--init-model', default=None, help='path to an existing .pt checkpoint to warm-start actor/critic weights before training')
    args=ap.parse_args()
    train(
        load_cfg(args.config),
        args.episodes,
        args.outdir,
        args.device,
        validation_start=args.validation_start,
        validation_count=args.validation_count,
        unseen_start=args.unseen_start,
        unseen_count=args.unseen_count,
        eval_interval=args.eval_interval,
        no_best_checkpoint=args.no_best_checkpoint,
        no_representative=args.no_representative,
        skip_final_eval=args.skip_final_eval,
        init_model_path=args.init_model,
        final_eval_max=args.final_eval_max,
        skip_final_checkpoint_eval=args.skip_final_checkpoint_eval,
    )
