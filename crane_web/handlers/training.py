"""Background training-job route handlers: auto_reward status/start/stop,
train stop, curriculum start.

Mixed into the concrete Handler in app.py. These drive long-running RL
subprocesses tracked in crane_web.jobs. The train-start and the live job-status
read stay inline in app.py's do_POST / do_GET dispatchers; everything else that
operates on a started job lives here. Methods use ``self`` for request state
(_read_json_payload, _current_user).
"""
import json
import subprocess
import sys
import threading
import time
import urllib.parse
from collections import deque

from crane_web.http_util import _send_json
from crane_web.paths import (
    ROOT,
    TRAINER_CONFIG_PATH,
    TRAINER_DASHBOARD_RUNS,
    TRAINER_AUTO_REWARD_RUNS,
)
from crane_web.model_meta import _is_relative_to
from crane_web.config_helpers import (
    _apply_crane_types_to_cfg,
    _apply_lift_load_config_to_cfg,
    _apply_restricted_zones_to_cfg,
    _read_yaml,
    _write_yaml,
)
from crane_web.jobs import (
    JOBS,
    JOBS_LOCK,
    PROGRESS_RETAIN,
    _job_response_snapshot,
    _running_job_snapshot,
    _reader,
    get_latest_job_id,
    set_latest_job_id,
    get_latest_auto_reward_job_id,
    set_latest_auto_reward_job_id,
)


class TrainingHandlerMixin:
    def _handle_auto_reward_status(self, parsed):
        qs = urllib.parse.parse_qs(parsed.query)
        job_id = qs.get('jobId', [get_latest_auto_reward_job_id()])[0]
        if not job_id or job_id not in JOBS:
            return _send_json(self, {'ok': False, 'message': '보상 계수 자동 탐색 job이 없습니다.'}, 404)
        with JOBS_LOCK:
            src = JOBS[job_id]
            if src.get('mode') != 'auto_reward':
                return _send_json(self, {'ok': False, 'message': 'auto-reward jobId가 아닙니다.'}, 400)
            log_snap = list(src['log'])
            progress_snap = list(src['progress'])
            progress_total = int(src.get('progressTotal', len(progress_snap)))
            job = {k: v for k, v in src.items() if k not in ('log', 'progress', 'process')}
        since_abs = max(0, min(progress_total, int(qs.get('since', ['0'])[0] or 0)))
        progress_offset = progress_total - len(progress_snap)
        rel = max(0, since_abs - progress_offset)
        job['progress'] = progress_snap[rel:]
        job['progressTotal'] = progress_total
        job['logTail'] = log_snap[-120:]
        trial_events = [p for p in progress_snap if isinstance(p, dict) and p.get('type') == 'auto_reward_trial']
        total_trials = int(job.get('totalTrials') or job.get('nTrials') or 0)
        completed = len(trial_events)
        job['completedTrials'] = completed
        job['currentTrial'] = min(total_trials, completed + 1) if job.get('running') and total_trials else completed
        job['recentTrials'] = trial_events[-50:]
        if not job.get('bestScore') and job.get('resultExists'):
            try:
                with open(ROOT / job['resultPath'], encoding='utf-8') as f:
                    best = json.load(f)
                job['bestScore'] = best.get('bestScore')
                job['bestTrial'] = best.get('bestTrial')
                job['bestReward'] = best.get('bestReward')
                job['bestModelPath'] = best.get('bestModelPath')
            except Exception:
                pass
        return _send_json(self, {'ok': True, 'job': job})

    def _handle_auto_reward_start(self):
        try:
            payload = self._read_json_payload()
            running = _running_job_snapshot()
            if running:
                return _send_json(self, {'ok': False, 'message': f"이미 실행 중인 job이 있습니다: {running.get('jobId')}", 'job': running}, 409)
            layout = payload.get('layout') if isinstance(payload.get('layout'), dict) else {}
            cranes = layout.get('cranes') or payload.get('cranes') or []
            lifts = layout.get('lifts') or payload.get('lifts') or []
            restricted_zones = (
                layout.get('restrictedZones') or layout.get('restricted_zones') or
                payload.get('restrictedZones') or payload.get('restricted_zones') or []
            )
            if not isinstance(cranes, list) or not cranes or not isinstance(lifts, list) or not lifts:
                return _send_json(self, {'ok': False, 'message': 'layout.cranes와 layout.lifts가 필요합니다.'}, 400)
            n_trials = max(1, int(payload.get('n_trials') or payload.get('nTrials') or 30))
            episodes = max(1, int(payload.get('episodes') or 150))
            anchor = payload.get('anchor', True)
            if isinstance(anchor, str):
                anchor = anchor.lower() not in ('0', 'false', 'no', 'off')
            anchor_jitter = float(payload.get('anchor_jitter') or payload.get('anchorJitter') or 5.0)
            pruner_raw = (payload.get('pruner') or '').strip().lower()
            if pruner_raw not in ('none', 'median', 'hyperband'):
                pruner_raw = 'median' if bool(payload.get('pruning') or payload.get('usePruning')) else 'none'
            pruner_kind = pruner_raw
            sampler_raw = (payload.get('sampler') or '').strip().lower()
            sampler_kind = sampler_raw if sampler_raw in ('tpe', 'botorch') else 'tpe'
            try:
                eval_seeds = max(1, int(payload.get('eval_seeds') or payload.get('evalSeeds') or 1))
            except (TypeError, ValueError):
                eval_seeds = 1
            warm_start = bool(payload.get('warm_start') or payload.get('warmStart'))
            job_id = time.strftime('auto_reward_%Y%m%d_%H%M%S')
            outroot = TRAINER_AUTO_REWARD_RUNS / job_id
            outroot.mkdir(parents=True, exist_ok=True)
            cfg = _read_yaml(TRAINER_CONFIG_PATH)
            for key in ['fixed_duration','setup_time','teardown_time','crane_radius','lift_setup_inner_fraction','lift_setup_area_rings','lift_setup_area_angles','candidate_k','site_width','site_height']:
                if key in payload and payload[key] not in (None, ''):
                    cfg[key] = int(payload[key]) if key in ['candidate_k','lift_setup_area_rings','lift_setup_area_angles'] else float(payload[key])
            _apply_lift_load_config_to_cfg(cfg, payload)
            cfg_path = outroot/'config.yaml'
            _write_yaml(cfg_path, cfg)
            layout_path = outroot/'site_layout.json'
            layout_doc = {'cranes': cranes, 'lifts': lifts, 'restrictedZones': restricted_zones}
            for src in ('site_width', 'siteWidth'):
                if payload.get(src) not in (None, ''):
                    try:
                        layout_doc['siteWidth'] = float(payload[src]); break
                    except (TypeError, ValueError):
                        pass
            for src in ('site_height', 'siteHeight'):
                if payload.get(src) not in (None, ''):
                    try:
                        layout_doc['siteHeight'] = float(payload[src]); break
                    except (TypeError, ValueError):
                        pass
            with open(layout_path, 'w', encoding='utf-8') as f:
                json.dump(layout_doc, f, ensure_ascii=False, indent=2)

            cmd = [
                sys.executable, '-u', '-m', 'rl_trainer.auto_reward_opt',
                '--layout', str(layout_path),
                '--config', str(cfg_path),
                '--n-trials', str(n_trials),
                '--episodes', str(episodes),
                '--outroot', str(outroot),
                '--study-name', job_id,
                '--anchor-jitter', str(anchor_jitter),
            ]
            if not anchor:
                cmd.append('--no-anchor')
            if pruner_kind != 'none':
                cmd += ['--pruner', pruner_kind]
            if sampler_kind != 'tpe':
                cmd += ['--sampler', sampler_kind]
            if eval_seeds > 1:
                cmd += ['--eval-seeds', str(eval_seeds)]
            if warm_start:
                cmd.append('--warm-start')
            search_space = payload.get('search_space') or payload.get('searchSpace')
            if isinstance(search_space, dict) and search_space:
                search_path = outroot/'search_space.json'
                with open(search_path, 'w', encoding='utf-8') as f:
                    json.dump(search_space, f, ensure_ascii=False, indent=2)
                cmd += ['--search-space', str(search_path)]
            score_weights = payload.get('score_weights') or payload.get('scoreWeights')
            if isinstance(score_weights, dict) and score_weights:
                weights_path = outroot/'score_weights.json'
                with open(weights_path, 'w', encoding='utf-8') as f:
                    json.dump(score_weights, f, ensure_ascii=False, indent=2)
                cmd += ['--score-weights', str(weights_path)]
            irl_prior_ref = (payload.get('irl_prior') or payload.get('irlPrior') or '').strip()
            irl_prior_path = None
            if irl_prior_ref:
                if irl_prior_ref.startswith('pg:'):
                    from crane_db.storage import load_irl_artifact
                    prior_doc = load_irl_artifact(irl_prior_ref)
                    if prior_doc is None:
                        return _send_json(self, {'ok': False, 'message': f'IRL prior not found: {irl_prior_ref}'}, 404)
                    irl_prior_path = outroot / 'irl_prior.json'
                    with open(irl_prior_path, 'w', encoding='utf-8') as f:
                        json.dump(prior_doc, f, ensure_ascii=False, indent=2)
                else:
                    candidate = (ROOT / irl_prior_ref).resolve()
                    allowed_prior_root = (ROOT / 'irl_priors').resolve()
                    if not _is_relative_to(candidate, allowed_prior_root):
                        return _send_json(self, {'ok': False, 'message': 'IRL prior 파일은 irl_priors/ 아래에 있어야 합니다.'}, 400)
                    if not candidate.exists():
                        return _send_json(self, {'ok': False, 'message': f'IRL prior file not found: {irl_prior_ref}'}, 404)
                    irl_prior_path = candidate
                cmd += ['--irl-prior', str(irl_prior_path)]
                margin_raw = payload.get('irl_prior_margin', payload.get('irlPriorMargin', 0.25))
                try:
                    margin = max(0.0, float(margin_raw))
                except (TypeError, ValueError):
                    margin = 0.25
                cmd += ['--irl-prior-margin', str(margin)]
            if payload.get('device'):
                cmd += ['--device', str(payload.get('device'))]

            proc = subprocess.Popen(cmd, cwd=ROOT, stdout=subprocess.PIPE, stderr=subprocess.STDOUT, text=True, bufsize=1)
            result_path = outroot/'best.json'
            owner_id = (self._current_user() or {}).get('id')
            with JOBS_LOCK:
                JOBS[job_id] = {
                    'jobId': job_id,
                    'mode': 'auto_reward',
                    'running': True,
                    'exitCode': None,
                    'startedAt': time.time(),
                    'command': ' '.join(cmd),
                    'outdir': str(outroot.relative_to(ROOT)),
                    'resultPath': str(result_path.relative_to(ROOT)),
                    'resultExists': False,
                    'message': '보상 계수 자동 탐색 실행 중',
                    'log': deque(maxlen=400),
                    'progress': deque(maxlen=PROGRESS_RETAIN),
                    'progressTotal': 0,
                    'totalTrials': n_trials,
                    'episodes': episodes,
                    'anchor': bool(anchor),
                    'anchorJitter': anchor_jitter,
                    'layoutPath': str(layout_path.relative_to(ROOT)),
                    'irlPrior': irl_prior_ref or None,
                    'pruner': pruner_kind,
                    'sampler': sampler_kind,
                    'evalSeeds': eval_seeds,
                    'warmStart': warm_start,
                    'process': proc,
                    'ownerId': owner_id,
                }
                set_latest_auto_reward_job_id(job_id)
                response = _job_response_snapshot(JOBS[job_id])
            # Record the study row with its inputs so the run is visible in the
            # DB-backed history even if the process never finishes (container
            # kill, OOM, etc.). status flips to done/failed/stopped in _reader.
            try:
                from crane_db.storage import upsert_auto_reward_run
                upsert_auto_reward_run(job_id, {
                    'owner_id': owner_id,
                    'status': 'running',
                    'n_trials': n_trials,
                    'episodes': episodes,
                    'layout': layout_doc,
                    'search_space': search_space if isinstance(search_space, dict) else None,
                    'score_weights': score_weights if isinstance(score_weights, dict) else None,
                    'irl_prior_ref': irl_prior_ref or None,
                })
            except Exception:
                pass
            threading.Thread(target=_reader, args=(job_id, proc), daemon=True).start()
            return _send_json(self, {'ok': True, 'job': response})
        except Exception as e:
            return _send_json(self, {'ok': False, 'message': str(e)}, 500)

    def _handle_auto_reward_stop(self):
        try:
            payload = self._read_json_payload()
            job_id = payload.get('jobId') or get_latest_auto_reward_job_id()
            if not job_id or job_id not in JOBS:
                return _send_json(self, {'ok': False, 'message': '보상 계수 자동 탐색 job이 없습니다.'}, 404)
            with JOBS_LOCK:
                job = JOBS[job_id]
                if job.get('mode') != 'auto_reward':
                    return _send_json(self, {'ok': False, 'message': 'auto-reward jobId가 아닙니다.'}, 400)
                proc = job.get('process')
                if not job.get('running') or proc is None:
                    return _send_json(self, {'ok': True, 'job': _job_response_snapshot(job), 'message': '이미 종료된 job입니다.'})
                job['stopRequested'] = True
                job['message'] = '중단 요청됨'
            proc.terminate()
            with JOBS_LOCK:
                response = _job_response_snapshot(JOBS[job_id])
            return _send_json(self, {'ok': True, 'job': response})
        except Exception as e:
            return _send_json(self, {'ok': False, 'message': str(e)}, 500)

    def _handle_train_stop(self):
        try:
            payload = self._read_json_payload()
            job_id = payload.get('jobId') or get_latest_job_id()
            if not job_id or job_id not in JOBS:
                return _send_json(self, {'ok': False, 'message': '학습 job이 없습니다.'}, 404)
            with JOBS_LOCK:
                job = JOBS[job_id]
                if job.get('mode') == 'auto_reward':
                    return _send_json(self, {'ok': False, 'message': 'auto-reward job은 /api/auto-reward/stop을 사용하세요.'}, 400)
                proc = job.get('process')
                if not job.get('running') or proc is None:
                    return _send_json(self, {'ok': True, 'job': _job_response_snapshot(job), 'message': '이미 종료된 job입니다.'})
                job['stopRequested'] = True
                job['message'] = '중단 요청됨'
            proc.terminate()
            with JOBS_LOCK:
                response = _job_response_snapshot(JOBS[job_id])
            return _send_json(self, {'ok': True, 'job': response})
        except Exception as e:
            return _send_json(self, {'ok': False, 'message': str(e)}, 500)

    def _handle_curriculum_start(self):
        try:
            payload = self._read_json_payload()
            running = _running_job_snapshot()
            if running:
                return _send_json(self, {'ok': False, 'message': f"이미 실행 중인 job이 있습니다: {running.get('jobId')}", 'job': running}, 409)
            cfg = _read_yaml(TRAINER_CONFIG_PATH)
            for key in ['fixed_duration','setup_time','teardown_time','crane_radius','lift_setup_inner_fraction','lift_setup_area_rings','lift_setup_area_angles','candidate_k','base_seed','seed_runs','seen_seed_start','seen_seed_count','validation_seed_start','validation_seed_count','unseen_seed_start','unseen_seed_count','site_width','site_height']:
                if key in payload and payload[key] not in (None, ''):
                    cfg[key] = int(payload[key]) if key not in ['fixed_duration','setup_time','teardown_time','crane_radius','lift_setup_inner_fraction','site_width','site_height'] else float(payload[key])
            _apply_lift_load_config_to_cfg(cfg, payload)
            cfg.setdefault('reward', {})
            for key in ['r_single','r_all','r_same','p_idle','p_inter_soft','p_time','p_move']:
                if key in payload and payload[key] not in (None, ''):
                    cfg['reward'][key] = float(payload[key])
            _apply_crane_types_to_cfg(cfg, payload)
            _apply_restricted_zones_to_cfg(cfg, payload)
            cfg.setdefault('mappo', {})
            for key in ['gamma','gae_lambda','actor_lr','critic_lr','clip_eps','entropy_coef','value_coef','max_grad_norm','update_epochs','minibatch_size','hidden_dim','eps_start','eps_end']:
                if key in payload and payload[key] not in (None, ''):
                    cfg['mappo'][key] = int(payload[key]) if key in ['update_epochs','minibatch_size','hidden_dim'] else float(payload[key])
            levels = payload.get('levels') or []
            if not levels:
                return _send_json(self, {'ok': False, 'message': '레벨 정보가 비어있습니다.'}, 400)
            normalized_levels = []
            episodes_per_level = []
            for i, lv in enumerate(levels):
                normalized_levels.append({
                    'name': str(lv.get('name') or f'L{i+1}'),
                    'num_cranes': int(lv.get('num_cranes') or 2),
                    'num_lifts': int(lv.get('num_lifts') or 12),
                    'max_steps': int(lv.get('max_steps') or 200),
                })
                episodes_per_level.append(int(lv.get('episodes') or 60))
            cfg['curriculum_levels'] = normalized_levels
            job_id = time.strftime('run_curriculum_%Y%m%d_%H%M%S')
            outdir = TRAINER_DASHBOARD_RUNS / job_id
            outdir.mkdir(parents=True, exist_ok=True)
            cfg_path = outdir/'config.yaml'
            _write_yaml(cfg_path, cfg)
            cmd = [sys.executable,'-u','-m','rl_trainer.curriculum',
                   '--config', str(cfg_path),
                   '--episodes'] + [str(e) for e in episodes_per_level] + [
                   '--outdir', str(outdir),
                   '--base-seed', str(cfg.get('base_seed', 101)),
                   '--seed-runs', str(cfg.get('seed_runs', 10)),
                   '--seen-start', str(cfg.get('seen_seed_start', 101)),
                   '--seen-count', str(cfg.get('seen_seed_count', 10)),
                   '--validation-start', str(cfg.get('validation_seed_start', 201)),
                   '--validation-count', str(cfg.get('validation_seed_count', 20)),
                   '--unseen-start', str(cfg.get('unseen_seed_start', 301)),
                   '--unseen-count', str(cfg.get('unseen_seed_count', 30)),
            ]
            proc = subprocess.Popen(cmd, cwd=ROOT, stdout=subprocess.PIPE, stderr=subprocess.STDOUT, text=True, bufsize=1)
            result_path = outdir/'curriculum_mappo_result.json'
            with JOBS_LOCK:
                JOBS[job_id] = {'jobId': job_id, 'running': True, 'exitCode': None, 'startedAt': time.time(), 'command': ' '.join(cmd), 'outdir': str(outdir.relative_to(ROOT)), 'resultPath': str(result_path.relative_to(ROOT)), 'resultExists': False, 'message': '커리큘럼 학습 실행 중', 'log': deque(maxlen=300), 'progress': deque(maxlen=PROGRESS_RETAIN), 'progressTotal': 0, 'mode': 'curriculum', 'process': proc, 'ownerId': (self._current_user() or {}).get('id')}
                set_latest_job_id(job_id)
                response = _job_response_snapshot(JOBS[job_id])
            threading.Thread(target=_reader, args=(job_id, proc), daemon=True).start()
            return _send_json(self, {'ok': True, 'job': response})
        except Exception as e:
            return _send_json(self, {'ok': False, 'message': str(e)}, 500)
