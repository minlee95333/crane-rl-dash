"""Config / cfg-payload transform helpers extracted from app.py.

Pure dict/YAML transforms with no module-global or app.py coupling: read/
write trainer YAML, and merge browser-supplied crane types, restricted
zones, capacity curves, and saved model plan config into a cfg dict.
"""
import json
import yaml


def _read_yaml(path):
    with open(path, 'r', encoding='utf-8') as f:
        return yaml.safe_load(f)

def _write_yaml(path, data):
    with open(path, 'w', encoding='utf-8') as f:
        yaml.safe_dump(data, f, allow_unicode=True, sort_keys=False)

_REWARD_KEYS = ('r_single','r_all','r_same','p_idle','p_inter_soft','p_time','p_move')
# Lift-weight sanity cap (t). Keep in sync with crane_core.env.MAX_LIFT_WEIGHT_T
# (not imported to keep this module free of the heavy crane_core dependency).
_MAX_LIFT_WEIGHT_T = 100.0
_MODEL_PLAN_CONFIG_KEYS = (
    'candidate_k',
    'max_steps',
    'fixed_duration',
    'setup_time',
    'teardown_time',
    'crane_radius',
    'lift_setup_inner_fraction',
    'lift_setup_area_rings',
    'lift_setup_area_angles',
    'default_lift_weight_t',
    'lift_weight_min_t',
    'lift_weight_max_t',
    'crane_capacity_curve',
    'site_width',
    'site_height',
    'obs_type_features',
)
_MODEL_PLAN_INT_KEYS = {'candidate_k', 'max_steps', 'lift_setup_area_rings', 'lift_setup_area_angles'}


def _apply_crane_types_to_cfg(cfg: dict, payload: dict):
    """Forward crane_types / default_crane_type from a train-start payload into cfg.
    Only writes when the payload contains a non-empty crane_types dict — otherwise leaves cfg unchanged
    so the default single-type behavior is preserved."""
    raw_types = payload.get('crane_types')
    if isinstance(raw_types, dict) and raw_types:
        prior_types = cfg.get('crane_types') if isinstance(cfg.get('crane_types'), dict) else {}
        cleaned = {}
        for name, conf in raw_types.items():
            if not name:
                continue
            reward_overrides = ((conf or {}).get('reward') or {})
            r_clean = {}
            for k, v in reward_overrides.items():
                if k in _REWARD_KEYS and v not in (None, ''):
                    try:
                        r_clean[k] = float(v)
                    except (TypeError, ValueError):
                        continue
            cleaned[str(name)] = {'reward': r_clean}
            # Per-type crane count for randomly generated training scenarios:
            # env assigns the first `count` cranes this type (insertion order),
            # the rest stay default. Absent/0 → type defined but not spawned.
            try:
                cnt = int((conf or {}).get('count') or 0)
            except (TypeError, ValueError):
                cnt = 0
            if cnt > 0:
                cleaned[str(name)]['count'] = cnt
            # Optional per-episode randomization: count..count_max sampled
            # seed-deterministically by env; only meaningful when > count.
            try:
                cnt_max = int((conf or {}).get('count_max') or 0)
            except (TypeError, ValueError):
                cnt_max = 0
            if cnt_max > cnt:
                cleaned[str(name)]['count_max'] = cnt_max
            # Per-type crane operation times and working radius (heavier classes
            # deploy/hoist slower, reach farther); absent → env global fallback.
            for tkey in ('setup_time', 'teardown_time', 'fixed_duration', 'crane_radius'):
                tv = (conf or {}).get(tkey)
                if tv in (None, ''):
                    continue
                try:
                    cleaned[str(name)][tkey] = float(tv)
                except (TypeError, ValueError):
                    continue
            # Per-type rated-load curve (e.g. a 100t class alongside the global
            # 50t curve). env resolves it via crane.type; absent → global curve.
            type_curve = _coerce_capacity_curve(
                (conf or {}).get('capacity_curve')
                or (conf or {}).get('crane_capacity_curve')
                or (conf or {}).get('rated_load_curve')
            )
            if not type_curve:
                # Reward-only payload entry (e.g. the trainer tab's type editor):
                # keep the curve the base config already defines for this type.
                type_curve = _coerce_capacity_curve(
                    ((prior_types.get(str(name)) or {}).get('capacity_curve'))
                )
            if type_curve:
                cleaned[str(name)]['capacity_curve'] = type_curve
        if cleaned:
            cfg['crane_types'] = cleaned
    default_type = payload.get('default_crane_type')
    if default_type:
        cfg['default_crane_type'] = str(default_type)


def _apply_restricted_zones_to_cfg(cfg: dict, payload: dict):
    """Forward optional restricted_zones / restricted_clearance from a train-start
    payload into cfg so env.reset() picks them up via the top-level scenario branch.
    Accepts snake_case or camelCase keys. Only writes when the payload supplies a
    non-empty list — otherwise leaves cfg untouched so unrelated runs aren't affected.
    Note: when anchor_layout is also present, env prefers anchor.restrictedZones first
    (see env.py:reset), so writing top-level zones in addition is harmless."""
    raw_zones = payload.get('restricted_zones')
    if raw_zones is None:
        raw_zones = payload.get('restrictedZones')
    if isinstance(raw_zones, list) and raw_zones:
        cleaned = []
        for i, z in enumerate(raw_zones):
            if not isinstance(z, dict):
                continue
            try:
                x1 = float(z.get('x1', z.get('x', 0)))
                y1 = float(z.get('y1', z.get('y', 0)))
                x2 = float(z.get('x2', x1 + float(z.get('w', 0) or 0)))
                y2 = float(z.get('y2', y1 + float(z.get('h', 0) or 0)))
            except (TypeError, ValueError):
                continue
            cleaned.append({'id': str(z.get('id') or f'RZ{i+1}'), 'type': 'rect',
                            'x1': min(x1, x2), 'y1': min(y1, y2),
                            'x2': max(x1, x2), 'y2': max(y1, y2)})
        if cleaned:
            cfg['restricted_zones'] = cleaned
    clearance = payload.get('restricted_clearance')
    if clearance is None:
        clearance = payload.get('restrictedClearance')
    if clearance not in (None, ''):
        try:
            cfg['restricted_clearance'] = float(clearance)
        except (TypeError, ValueError):
            pass
    raw_random = payload.get('restricted_random')
    if raw_random is None:
        raw_random = payload.get('restrictedRandom')
    if isinstance(raw_random, dict):
        block = {}
        if 'enabled' in raw_random:
            block['enabled'] = bool(raw_random.get('enabled'))
        for src_key, dst_key, cast in (
            ('count_min', 'count_min', int), ('countMin', 'count_min', int),
            ('count_max', 'count_max', int), ('countMax', 'count_max', int),
            ('width_min', 'width_min', float), ('widthMin', 'width_min', float),
            ('width_max', 'width_max', float), ('widthMax', 'width_max', float),
            ('height_min', 'height_min', float), ('heightMin', 'height_min', float),
            ('height_max', 'height_max', float), ('heightMax', 'height_max', float),
        ):
            if src_key in raw_random and raw_random[src_key] not in (None, ''):
                try:
                    block[dst_key] = cast(raw_random[src_key])
                except (TypeError, ValueError):
                    continue
        if block:
            cfg['restricted_random'] = block


def _coerce_capacity_curve(raw_curve):
    if raw_curve in (None, ''):
        return None
    if isinstance(raw_curve, str):
        text = raw_curve.strip()
        if not text:
            return None
        try:
            raw_curve = json.loads(text)
        except Exception:
            rows = []
            for line in text.replace(';', '\n').splitlines():
                parts = [p.strip() for p in line.split(',') if p.strip()]
                if len(parts) >= 2:
                    rows.append({'radius': parts[0], 'capacityT': parts[1]})
            raw_curve = rows
    if not isinstance(raw_curve, list):
        return None
    cleaned = []
    for p in raw_curve:
        try:
            if isinstance(p, dict):
                radius = float(p.get('radius', p.get('r')))
                capacity = float(p.get('capacityT', p.get('capacity_t', p.get('capacity', p.get('loadT')))))
            else:
                radius = float(p[0])
                capacity = float(p[1])
        except (TypeError, ValueError, IndexError):
            continue
        if radius >= 0 and capacity >= 0:
            cleaned.append({'radius': radius, 'capacityT': capacity})
    cleaned.sort(key=lambda x: x['radius'])
    return cleaned or None


def _apply_lift_load_config_to_cfg(cfg: dict, payload: dict):
    aliases = {
        'default_lift_weight_t': ('default_lift_weight_t', 'default_lift_weight', 'lift_weight_t', 'defaultLiftWeightT'),
        'lift_weight_min_t': ('lift_weight_min_t', 'lift_weight_min', 'liftWeightMinT'),
        'lift_weight_max_t': ('lift_weight_max_t', 'lift_weight_max', 'liftWeightMaxT'),
    }
    for dst, srcs in aliases.items():
        for src in srcs:
            if src in payload and payload[src] not in (None, ''):
                try:
                    cfg[dst] = max(0.0, min(_MAX_LIFT_WEIGHT_T, float(payload[src])))
                except (TypeError, ValueError):
                    pass
                break
    raw_curve = payload.get('crane_capacity_curve')
    if raw_curve is None:
        raw_curve = payload.get('rated_load_curve', payload.get('ratedLoadCurve'))
    curve = _coerce_capacity_curve(raw_curve)
    if curve:
        cfg['crane_capacity_curve'] = curve


def _coerce_crane_types(model_stats: dict):
    """Pull crane type list out of a modelStats dict, handling both new (craneTypes list) and legacy (craneType single string) schemas."""
    if not model_stats:
        return None
    if isinstance(model_stats.get('craneTypes'), list):
        return [str(t) for t in model_stats['craneTypes'] if t]
    legacy = model_stats.get('craneType')
    if legacy:
        return [str(legacy)]
    return None


def _copy_model_plan_config(meta: dict, cfg: dict):
    if not isinstance(cfg, dict):
        return
    for key in _MODEL_PLAN_CONFIG_KEYS:
        if key in cfg and cfg.get(key) is not None:
            meta[key] = cfg.get(key)
    if 'teardown_time' not in meta and 'fixed_duration' in meta:
        meta['teardown_time'] = 0.0


def _apply_model_plan_config(cfg: dict, model_cfg: dict):
    if not isinstance(model_cfg, dict):
        return
    # Observation layout must always match the model's training-time layout:
    # absent in an old model's cfg means the 17-dim actor, so force False rather
    # than inheriting the base config's (possibly True) value.
    cfg['obs_type_features'] = bool(model_cfg.get('obs_type_features', False))
    for key in _MODEL_PLAN_CONFIG_KEYS:
        if key == 'obs_type_features':
            continue
        val = model_cfg.get(key)
        if val in (None, ''):
            continue
        if key == 'crane_capacity_curve':
            curve = _coerce_capacity_curve(val)
            if curve:
                cfg[key] = curve
        else:
            try:
                cfg[key] = int(val) if key in _MODEL_PLAN_INT_KEYS else float(val)
            except (TypeError, ValueError):
                continue
    if 'teardown_time' not in model_cfg and model_cfg.get('fixed_duration') is not None:
        cfg['teardown_time'] = 0.0
