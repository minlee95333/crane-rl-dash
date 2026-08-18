"""Scoring / planning route handlers: score a schedule, re-price a schedule,
and run a policy to generate a schedule (/api/plan/run).

Mixed into the concrete Handler in app.py. These are stateless request/response
handlers (no background-job machinery). Methods use ``self`` only for
_read_json_payload. Config/model helpers come from crane_web; the heavy
crane_core / rl_trainer imports stay lazy inside the handlers.
"""
from crane_web.http_util import _send_json
from crane_web.paths import ROOT, TRAINER_ROOT, LEGACY_MAPPO_ROOT, TRAINER_CONFIG_PATH
from crane_web.model_meta import _is_relative_to, _resolve_model_path
from crane_web.config_helpers import (
    _MODEL_PLAN_CONFIG_KEYS,
    _apply_crane_types_to_cfg,
    _apply_lift_load_config_to_cfg,
    _apply_model_plan_config,
    _coerce_capacity_curve,
    _read_yaml,
)

import json


class PlanningHandlerMixin:
    def _handle_score_schedule(self):
        """Rule-based scorer over a single schedule result.

        Accepts: { result: <plan/run result dict>, params?: { fixed_duration, setup_time, teardown_time, num_cranes, num_lifts }, weights?: {...} }
        Or:      { path: 'rl_trainer/.../some_result.json' }  (relative to ROOT, .json under rl_trainer/ or legacy python_mappo/)
        Returns: { ok, score: { totalScore, grade, categories, ... } }
        """
        try:
            from crane_core.scorer import score_schedule
            payload = self._read_json_payload()
            result = payload.get('result')
            rel_path = payload.get('path')
            if not result and rel_path:
                target = (ROOT/rel_path).resolve()
                allowed_roots = (TRAINER_ROOT.resolve(), LEGACY_MAPPO_ROOT.resolve())
                if not any(_is_relative_to(target, root) for root in allowed_roots):
                    return _send_json(self, {'ok': False, 'message': 'path must be under rl_trainer/ or python_mappo/'}, 400)
                if target.suffix.lower() != '.json' or not target.exists():
                    return _send_json(self, {'ok': False, 'message': 'JSON file not found'}, 404)
                with open(target, encoding='utf-8') as f:
                    loaded = json.load(f)
                if isinstance(loaded, dict) and 'result' in loaded and 'events' not in loaded:
                    result = loaded['result']
                else:
                    result = loaded
            if not isinstance(result, dict):
                return _send_json(self, {'ok': False, 'message': 'result dict required'}, 400)
            params = payload.get('params') if isinstance(payload.get('params'), dict) else None
            weights = payload.get('weights') if isinstance(payload.get('weights'), dict) else None
            # If params not provided, fall back to the active config so makespan bounds match training.
            if params is None:
                try:
                    cfg = _read_yaml(TRAINER_CONFIG_PATH)
                    params = {'fixed_duration': cfg.get('fixed_duration'), 'setup_time': cfg.get('setup_time'), 'teardown_time': cfg.get('teardown_time')}
                except Exception:
                    params = None
            score = score_schedule(result, params=params, weights=weights)
            return _send_json(self, {'ok': True, 'score': score})
        except Exception as e:
            return _send_json(self, {'ok': False, 'message': str(e)}, 500)

    def _handle_plan_cost(self):
        """Re-price an already-generated schedule with (optionally edited) rates.

        Accepts: { result: <plan/run result dict>, rates?: <DEFAULT_RATES overrides> }
        Returns: { ok, cost: { totalCost, items, perCrane, ... } }

        The schedule is deterministic, so repricing never re-runs the policy —
        the cost-card rate editor posts here instead of /api/plan/run.
        """
        try:
            from crane_core.cost import estimate_cost
            payload = self._read_json_payload()
            if not isinstance(payload, dict):
                return _send_json(self, {'ok': False, 'message': 'invalid JSON object'}, 400)
            result = payload.get('result')
            if isinstance(result, dict) and 'result' in result and 'events' not in result:
                result = result['result']
            if not isinstance(result, dict):
                return _send_json(self, {'ok': False, 'message': 'result dict required'}, 400)
            rates = payload.get('rates')
            cost = estimate_cost(result, rates=rates)
            return _send_json(self, {'ok': True, 'cost': cost})
        except ValueError as e:
            return _send_json(self, {'ok': False, 'message': str(e)}, 400)
        except Exception as e:
            return _send_json(self, {'ok': False, 'message': str(e)}, 500)

    def _handle_plan_run(self):
        try:
            from crane_core.env import CraneSchedulingEnv
            try:
                from rl_trainer.mappo import MAPPOAgent
            except ImportError as e:
                # requirements.txt requests the CPU-only PyTorch wheel. Surface
                # a specific 503 when that install failed, was intentionally
                # omitted, or another MAPPO dependency cannot be imported.
                return _send_json(self, {
                    'ok': False,
                    'message': (
                        f"AI 양중 계획 생성에 필요한 모듈을 불러올 수 없습니다 ({e}). "
                        "requirements.txt에는 CPU 전용 PyTorch가 포함되어 있습니다. "
                        "배포 빌드 로그에서 requirements 설치 성공 여부와 Python/PyTorch 호환성을 확인하고 "
                        "필요하면 자원이 더 큰 인스턴스에서 재배포하세요."
                    ),
                }, 503)
            payload = self._read_json_payload()
            if not isinstance(payload, dict):
                return _send_json(self, {'ok': False, 'message': 'invalid JSON object'}, 400)
            cranes = payload.get('cranes') or []
            lifts = payload.get('lifts') or []
            restricted_zones = payload.get('restrictedZones') or payload.get('restricted_zones') or []
            if not cranes or not lifts:
                return _send_json(self, {'ok': False, 'message': 'cranes/lifts layout is required'}, 400)
            policy = payload.get('policy', 'mappo')
            allowed_policies = ('mappo', 'nearest', 'radiusPriority', 'random')
            if policy not in allowed_policies:
                return _send_json(self, {'ok': False, 'message': f'unsupported policy: {policy}'}, 400)
            from crane_core.cost import estimate_cost, validate_rates
            cost_rates = payload.get('costRates')
            validate_rates(cost_rates)
            model = None
            model_cfg = None
            if policy == 'mappo':
                rel_model = payload.get('modelPath') or 'python_mappo/baselines/restricted_detour_mappo_150ep_valaware_baseline/pytorch_mappo_model.pt'
                try:
                    model_path = _resolve_model_path(rel_model)
                except (ValueError, FileNotFoundError) as e:
                    return _send_json(self, {'ok': False, 'message': str(e)}, 400)
                model = MAPPOAgent.load(str(model_path), device='cpu')
                model_cfg = getattr(model, 'cfg', None)
            cfg = _read_yaml(TRAINER_CONFIG_PATH)
            cfg['num_cranes'] = len(cranes); cfg['num_lifts'] = len(lifts)
            model_curve = None
            if model_cfg:
                _apply_model_plan_config(cfg, model_cfg)
                model_curve = _coerce_capacity_curve(
                    model_cfg.get('crane_capacity_curve') or model_cfg.get('rated_load_curve') or model_cfg.get('ratedLoadCurve')
                )
            # camelCase alias from the browser payload for the height-order rule.
            if payload.get('heightOrderRadius') not in (None, '') and payload.get('height_order_radius') in (None, ''):
                payload['height_order_radius'] = payload['heightOrderRadius']
            for key in ['candidate_k','fixed_duration','setup_time','teardown_time','crane_radius','height_order_radius','lift_setup_inner_fraction','lift_setup_area_rings','lift_setup_area_angles','max_steps','site_width','site_height']:
                if key in payload and payload[key] not in (None, ''):
                    cfg[key] = int(payload[key]) if key in ['candidate_k','max_steps','lift_setup_area_rings','lift_setup_area_angles'] else float(payload[key])
            _apply_lift_load_config_to_cfg(cfg, payload)
            # Per-type crane specs (reward overrides + per-type capacity curve,
            # e.g. mobile_100t). Applied for every policy: the type curve rides
            # on crane.type and is independent of the global-curve pop below.
            _apply_crane_types_to_cfg(cfg, payload)
            if model_curve:
                cfg['crane_capacity_curve'] = model_curve
            else:
                cfg.pop('crane_capacity_curve', None)
            cfg.setdefault('reward', {})
            for key in ['r_single','r_all','r_same','p_idle','p_inter_soft','p_time','p_move']:
                if key in payload and payload[key] not in (None, ''):
                    cfg['reward'][key] = float(payload[key])
            env = CraneSchedulingEnv(cfg)
            result = env.run_policy_layout(policy, cranes, lifts, model=model, greedy=True, restricted_zones=restricted_zones)
            result['policy'] = policy
            result['layout'] = {'cranes': cranes, 'lifts': lifts, 'restrictedZones': restricted_zones}
            result['appliedConfig'] = {key: cfg.get(key) for key in _MODEL_PLAN_CONFIG_KEYS}
            # Itemized cost estimate for the generated schedule. Rates default to
            # crane_core.cost.DEFAULT_RATES and can be overridden per request via
            # payload['costRates'] (the result-screen cost card edits these).
            result['cost'] = estimate_cost(result, rates=cost_rates)
            return _send_json(self, {'ok': True, 'result': result})
        except ValueError as e:
            return _send_json(self, {'ok': False, 'message': str(e)}, 400)
        except Exception as e:
            return _send_json(self, {'ok': False, 'message': str(e)}, 500)
