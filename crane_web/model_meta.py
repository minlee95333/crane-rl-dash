"""Trained-model metadata: extract sidecar/.pt info, map to DB patch, list
models, and validate/resolve model paths. Extracted from app.py.

Depends on shared path roots (crane_web.paths) and the plan-config key set
(crane_web.config_helpers); crane_db.storage and torch are imported lazily
inside the functions. Must not import app.py.
"""
import json
import re
import time
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Dict, List, Optional, Tuple

from crane_web.paths import ROOT, TRAINER_ROOT, LEGACY_MAPPO_ROOT
from crane_web.config_helpers import (
    _MODEL_PLAN_CONFIG_KEYS,
    _coerce_crane_types,
    _copy_model_plan_config,
    _read_yaml,
)


def _extract_model_meta(pt_path: Path):
    meta = {}
    d = pt_path.parent
    cfg_path = d/'config.yaml'
    if cfg_path.exists():
        try:
            cfg = _read_yaml(cfg_path)
            meta['num_cranes'] = cfg.get('num_cranes')
            meta['num_lifts'] = cfg.get('num_lifts')
            meta['candidate_k'] = cfg.get('candidate_k')
            meta['crane_radius'] = cfg.get('crane_radius')
            meta['configEpisodes'] = cfg.get('train_episodes')
            _copy_model_plan_config(meta, cfg)
            # Full per-type training config (reward/curve/times/radius/count) so
            # the plan tab can show exactly which tonnage classes the model saw.
            ct = cfg.get('crane_types')
            if isinstance(ct, dict) and ct:
                meta['crane_types'] = ct
                if cfg.get('default_crane_type'):
                    meta['default_crane_type'] = cfg.get('default_crane_type')
        except Exception:
            pass
    val_path = d/'pytorch_mappo_validation_result.json'
    curr_path = d/'curriculum_mappo_result.json'
    # Curriculum and single-train result files are mutually exclusive in normal use.
    # If both exist, prefer curriculum (it's the more recent / more specific schema) and skip
    # the single-train block, otherwise it would partially overwrite curriculum fields.
    if val_path.exists() and not curr_path.exists():
        try:
            with open(val_path, encoding='utf-8') as f:
                v = json.load(f)
            meta['trainEpisodes'] = v.get('trainEpisodes')
            meta['elapsedSec'] = v.get('elapsedSec')
            best = (v.get('trainSummary') or {}).get('best') or {}
            meta['bestMakespan'] = best.get('makespan')
            val_mappo = (v.get('validation') or {}).get('mappo') or {}
            meta['validationMakespan'] = val_mappo.get('makespan')
            unseen_mappo = (v.get('unseen') or {}).get('mappo') or {}
            meta['unseenMakespan'] = unseen_mappo.get('makespan')
            meta['kind'] = 'single'
            ms = (v.get('trainSummary') or {}).get('modelStats') or {}
            meta['craneTypes'] = _coerce_crane_types(ms)
        except Exception:
            pass
    if curr_path.exists():
        try:
            with open(curr_path, encoding='utf-8') as f:
                c = json.load(f)
            levels = c.get('levels') or []
            meta['trainEpisodes'] = sum(int(l.get('episodes') or 0) for l in levels)
            meta['elapsedSec'] = c.get('elapsedSec')
            meta['kind'] = 'curriculum'
            matched = None
            for lv in levels:
                best = (lv.get('trainSummary') or {}).get('best') or {}
                lvl_name = best.get('level') or lv.get('name')
                if lvl_name and pt_path.name.startswith(str(lvl_name)):
                    matched = (lvl_name, best)
                    break
            if matched is None and levels:
                last_best = (levels[-1].get('trainSummary') or {}).get('best') or {}
                matched = (last_best.get('level') or 'final', last_best)
            if matched:
                meta['levelName'] = matched[0]
                meta['bestMakespan'] = matched[1].get('makespan')
            ms = c.get('modelStats') or {}
            meta['craneTypes'] = _coerce_crane_types(ms)
        except Exception:
            pass
    auto_path = d/'trial_summary.json'
    if auto_path.exists():
        try:
            with open(auto_path, encoding='utf-8') as f:
                a = json.load(f)
            meta['kind'] = 'auto_reward'
            meta['trainEpisodes'] = a.get('episodes')
            meta['autoRewardTrial'] = a.get('trial')
            meta['autoRewardScore'] = ((a.get('score') or {}).get('totalScore'))
            meta['autoRewardGrade'] = ((a.get('score') or {}).get('grade'))
            meta['autoRewardReward'] = a.get('reward')
            site = a.get('siteResult') or {}
            meta['bestMakespan'] = site.get('makespan')
        except Exception:
            pass
    label_path = pt_path.with_suffix('.label.json')
    if label_path.exists():
        try:
            with open(label_path, encoding='utf-8') as f:
                meta['label'] = json.load(f)
        except Exception:
            pass
    return meta


# Keys produced by `_extract_model_meta` that belong in models.hparams (static
# training config) vs models.metrics (runtime / outcome). Anything not listed
# here either lives in its own column (kind, label) or is dropped from the DB
# patch — keeps the JSONB shape stable across re-extractions.
_MODEL_HPARAM_KEYS = (
    'num_cranes', 'num_lifts', 'configEpisodes', 'craneTypes', 'levelName',
    'crane_types', 'default_crane_type',
) + _MODEL_PLAN_CONFIG_KEYS
_MODEL_METRIC_KEYS = (
    'trainEpisodes', 'elapsedSec',
    'bestMakespan', 'validationMakespan', 'unseenMakespan',
    'autoRewardTrial', 'autoRewardScore', 'autoRewardGrade', 'autoRewardReward',
)


def _model_meta_to_db_patch(pt_path: Path) -> Dict:
    """Read disk sidecars (config.yaml / validation_result / label) for a .pt
    and return an upsert-ready patch for the models table. Stat info (size,
    mtime) is included so the DB tracks file presence for the redeploy case."""
    meta = _extract_model_meta(pt_path)
    patch: Dict[str, Any] = {
        'hparams': {k: meta[k] for k in _MODEL_HPARAM_KEYS if k in meta and meta[k] is not None},
        'metrics': {k: meta[k] for k in _MODEL_METRIC_KEYS if k in meta and meta[k] is not None},
    }
    if meta.get('kind'):
        patch['kind'] = meta['kind']
    label = meta.get('label') or {}
    if isinstance(label, dict):
        if label.get('name'):
            patch['name'] = label.get('name')
        if label.get('memo'):
            patch['memo'] = label.get('memo')
    try:
        st = pt_path.stat()
        patch['size_bytes'] = int(st.st_size)
        patch['file_mtime'] = datetime.fromtimestamp(st.st_mtime, tz=timezone.utc)
    except OSError:
        pass
    return patch


# Cache for _list_models. Each entry is `(pt_mtime, label_mtime_or_None, meta_dict)`.
# Invalidated purely by mtime comparison — when either the .pt file or its
# .label.json mtime differs from the cached value, we recompute. The label handler
# triggers this implicitly by rewriting the .label.json (which bumps its mtime).
_MODEL_META_CACHE: Dict[str, Tuple] = {}


def _label_mtime_ns(pt: Path):
    lp = pt.with_suffix('.label.json')
    try:
        return lp.stat().st_mtime_ns
    except OSError:
        return None


def _db_row_to_model_entry(row: dict) -> dict:
    """Reconstruct a list-shape entry from a DB row (used when the .pt is no
    longer on disk — typically after an ephemeral-host redeploy)."""
    rel = row.get('rel_path') or ''
    from pathlib import PurePosixPath
    ppath = PurePosixPath(rel)
    meta: Dict[str, Any] = {}
    hp = row.get('hparams') or {}
    mt = row.get('metrics') or {}
    if isinstance(hp, dict): meta.update(hp)
    if isinstance(mt, dict): meta.update(mt)
    if row.get('kind'):
        meta['kind'] = row['kind']
    if row.get('name') or row.get('memo'):
        meta['label'] = {
            'name': row.get('name') or '',
            'memo': row.get('memo') or '',
        }
    mtime_int = 0
    file_mtime = row.get('file_mtime')
    if file_mtime:
        try:
            # ISO string in TZ-aware form (we wrote it from utcnow), parse back to epoch.
            dt = datetime.fromisoformat(str(file_mtime).replace('Z', '+00:00'))
            mtime_int = int(dt.timestamp())
        except Exception:
            pass
    return {
        'path': rel,
        'name': ppath.name,
        'dir': str(ppath.parent) if str(ppath.parent) != '.' else '',
        'size': int(row.get('size_bytes') or 0),
        'mtime': mtime_int,
        'meta': meta,
        'file_present': False,
    }


def _list_models(owner_id: Optional[str] = None):
    """List models by merging the disk walk with the models DB table.

    When `owner_id` is given the result is filtered to that user's models —
    legacy disk-only files (which have no recorded owner) are still backfilled
    into the DB on the way through, but they don't appear in an owner-filtered
    view because we can't attribute them to anybody."""
    # Step 1: walk the disk. This is still the authoritative source for files
    # that exist right now (size, mtime) and for any model that hasn't been
    # touched by a label / training-completion DB hook yet.
    disk_entries: Dict[str, dict] = {}
    for base in (TRAINER_ROOT, LEGACY_MAPPO_ROOT):
        if not base.exists():
            continue
        for pt in base.rglob('*.pt'):
            if '__pycache__' in pt.parts:
                continue
            try:
                rel = pt.relative_to(ROOT).as_posix()
                st = pt.stat()
                # Use ns-precision mtime for cache invalidation: int-seconds tied on the
                # same-second case (common when label.json gets rewritten right after a
                # /api/models/list). The wire value stays in integer seconds since the
                # dashboard reads `m.mtime * 1000` to construct a JS Date.
                pt_mtime_ns = st.st_mtime_ns
                lb_mtime_ns = _label_mtime_ns(pt)
                cache_key = str(pt)
                cached = _MODEL_META_CACHE.get(cache_key)
                if cached and cached[0] == pt_mtime_ns and cached[1] == lb_mtime_ns:
                    meta = cached[2]
                else:
                    meta = _extract_model_meta(pt)
                    _MODEL_META_CACHE[cache_key] = (pt_mtime_ns, lb_mtime_ns, meta)
                disk_entries[rel] = {
                    'path': rel,
                    'name': pt.name,
                    'dir': pt.parent.relative_to(ROOT).as_posix(),
                    'size': st.st_size,
                    'mtime': int(st.st_mtime),
                    'meta': meta,
                    'file_present': True,
                }
            except Exception:
                continue
    # Step 2: pull DB rows. After an ephemeral redeploy the disk may be empty
    # while the DB still has every model the user labeled — those show up here
    # with file_present=False so the UI can grey them out instead of silently
    # dropping them. DB-provided label fields win over the on-disk sidecar so
    # a freshly re-uploaded .pt with a stale .label.json reads the canonical
    # user-supplied name/memo.
    try:
        from crane_db.storage import list_models_db
        db_rows = list_models_db(owner_id=owner_id)
    except Exception:
        db_rows = []
    items = []
    consumed = set()
    for row in db_rows or []:
        rel = row.get('rel_path')
        if not rel:
            continue
        consumed.add(rel)
        if rel in disk_entries:
            entry = disk_entries[rel]
            if row.get('name') or row.get('memo'):
                meta = dict(entry.get('meta') or {})
                meta['label'] = {
                    'name': row.get('name') or '',
                    'memo': row.get('memo') or '',
                }
                entry['meta'] = meta
            items.append(entry)
        else:
            items.append(_db_row_to_model_entry(row))
    # Step 3: handle disk-only entries (no DB row yet). One-time backfill of
    # legacy .pt files so their metadata + label survives the next redeploy
    # even if the user never re-touches them. Owner stays NULL (unknown), so
    # an owner-filtered view excludes them — appearing only in the global view.
    try:
        from crane_db.storage import upsert_model as _upsert_model
    except Exception:
        _upsert_model = None
    for rel, entry in disk_entries.items():
        if rel in consumed:
            continue
        if _upsert_model is not None:
            try:
                pt = ROOT / rel
                _upsert_model(rel, _model_meta_to_db_patch(pt))
            except Exception:
                pass
        if owner_id is None:
            items.append(entry)
    items.sort(key=lambda x: x['mtime'], reverse=True)
    return items


def _is_relative_to(path: Path, root: Path) -> bool:
    try:
        path.relative_to(root)
        return True
    except ValueError:
        return False


def _validate_model_path(rel_path: str) -> Path:
    """Path-only validation: shape, allowed root, .pt suffix. Doesn't require
    the file to exist on disk — used by code paths that may legitimately
    operate on DB-only rows whose .pt was wiped by a redeploy."""
    if not rel_path:
        raise ValueError('path required')
    target = (ROOT/rel_path).resolve()
    allowed_roots = (TRAINER_ROOT.resolve(), LEGACY_MAPPO_ROOT.resolve())
    if not any(_is_relative_to(target, root) for root in allowed_roots):
        raise ValueError('path must be under rl_trainer/ or python_mappo/')
    if target.suffix != '.pt':
        raise ValueError('path must point to a .pt file')
    return target


def _resolve_model_path(rel_path: str) -> Path:
    target = _validate_model_path(rel_path)
    if not target.exists():
        raise FileNotFoundError(f'model not found: {rel_path}')
    return target
