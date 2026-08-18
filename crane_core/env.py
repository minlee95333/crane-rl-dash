from __future__ import annotations

from dataclasses import dataclass, asdict
import heapq
import math, random
from typing import Dict, List, Tuple, Optional

import numpy as np


def dist(a, b):
    return math.hypot(a[0]-b[0], a[1]-b[1])


# Sanity cap (t) for lift weights across the stack — raised from 50 when the
# 100t crane class was added. Keep in sync with crane_web.config_helpers
# _MAX_LIFT_WEIGHT_T and web/index.html MAX_LIFT_WEIGHT_T / input max attrs.
MAX_LIFT_WEIGHT_T = 100.0


@dataclass
class Crane:
    id: str
    x: float
    y: float
    setup_x: float
    setup_y: float
    available: float = 0.0
    jobs: int = 0
    type: str = 'default'  # framework hook for multi-type support; see cfg['crane_types']
    boom_len: float = 0.0   # luffing boom length in metres; 0 = 2D mode (no height constraint)
    ground_z: float = 0.0   # crane ground elevation (m); used when site is not flat


@dataclass
class Lift:
    id: str
    x: float
    y: float
    weight_t: float = 10.0
    done: bool = False
    assigned: Optional[str] = None
    z: float = 0.0       # placement height above ground (m) — the point the crane services


class CraneSchedulingEnv:
    """Stage-1 crane scheduling env matching the browser prototype conventions.

    - one crane = one agent
    - action = candidate slot, not raw lift ID
    - actual lifting radius is crane/setup-centered: distance(setup point, lift)
    - hard interference = overlap of actual lifting radii; infeasible/masked/resolved
    - soft interference = lifts handled in one step by cranes whose configured
      working radii overlap; each lift is counted at most once
    """

    def __init__(self, cfg: Dict):
        self.cfg = cfg
        self.nC = int(cfg.get('num_cranes', 3))
        self.nL = int(cfg.get('num_lifts', 24))
        self.K = int(cfg.get('candidate_k', 5))
        self.fixed_duration = float(cfg.get('fixed_duration', 25.0))
        self.setup_time = float(cfg.get('setup_time', 10.0))
        self.teardown_time = float(cfg.get('teardown_time', 5.0))
        self.crane_radius = float(cfg.get('crane_radius', 18.0))
        # Height-order precedence: when > 0, any two lifts within this horizontal
        # distance (m) must be erected lower-z first — the higher lift stays
        # masked until every strictly-lower neighbour is done, and its hoist may
        # not start before theirs finish. 0 disables (training default).
        self.height_order_radius = max(0.0, float(cfg.get('height_order_radius', 0.0) or 0.0))
        self.default_lift_weight_t = max(0.0, min(MAX_LIFT_WEIGHT_T, float(cfg.get('default_lift_weight_t', cfg.get('default_lift_weight', cfg.get('lift_weight_t', 10.0))))))
        self.lift_weight_min_t = max(0.0, min(MAX_LIFT_WEIGHT_T, float(cfg.get('lift_weight_min_t', cfg.get('lift_weight_min', self.default_lift_weight_t)))))
        self.lift_weight_max_t = max(0.0, min(MAX_LIFT_WEIGHT_T, float(cfg.get('lift_weight_max_t', cfg.get('lift_weight_max', self.default_lift_weight_t)))))
        if self.lift_weight_max_t < self.lift_weight_min_t:
            self.lift_weight_min_t, self.lift_weight_max_t = self.lift_weight_max_t, self.lift_weight_min_t
        # 2.5D height config: lift z range for random generation, default crane boom length
        self.lift_z_min = max(0.0, float(cfg.get('lift_z_min', 0.0)))
        self.lift_z_max = max(0.0, float(cfg.get('lift_z_max', 0.0)))
        if self.lift_z_max < self.lift_z_min:
            self.lift_z_min, self.lift_z_max = self.lift_z_max, self.lift_z_min
        self.default_boom_len = max(0.0, float(cfg.get('crane_boom_len', cfg.get('boom_len', 0.0))))
        self.crane_capacity_curve = self._normalize_capacity_curve(
            cfg.get('crane_capacity_curve') or cfg.get('rated_load_curve') or cfg.get('ratedLoadCurve')
        )
        # 2D rated-load chart (boom-length × radius), the industry-standard mobile-crane
        # format: one capacity-vs-radius curve per boom length. When present it supersedes
        # the 1D curve — a taller lift forces a longer boom, which derates capacity at the
        # same horizontal radius. The chart's longest boom also sets the reach limit.
        self.crane_capacity_chart = self._normalize_capacity_chart(
            cfg.get('crane_capacity_chart') or cfg.get('rated_load_chart') or cfg.get('ratedLoadChart')
        )
        self.chart_max_boom = self.crane_capacity_chart[-1][0] if self.crane_capacity_chart else 0.0
        self.max_steps = int(cfg.get('max_steps', 220))
        # Site dimensions in world units (meters). Default 100x100 matches the
        # original dashboard convention. Changing this requires retraining: a
        # model learned on 100m has different geometric scale than one on 200m.
        self.site_width = float(cfg.get('site_width', cfg.get('site_size', 100.0)))
        self.site_height = float(cfg.get('site_height', cfg.get('site_size', 100.0)))
        r = cfg.get('reward', {})
        self.r_single = float(r.get('r_single', 10.0))
        self.r_all = float(r.get('r_all', 100.0))
        self.r_same = float(r.get('r_same', 3.0))
        self.p_idle = float(r.get('p_idle', -0.5))
        self.p_inter_soft = float(r.get('p_inter_soft', -3.0))
        self.p_time = float(r.get('p_time', -0.1))
        self.p_move = float(r.get('p_move', -0.02))
        # Multi-type framework: each Crane carries a `type` label, and reward coefficients
        # can be overridden per type via cfg['crane_types'][<name>]['reward']. Missing
        # overrides fall back to the globals above. With no `crane_types` configured
        # (current default), every crane resolves to the global values — numerically
        # identical to single-type training.
        self.default_crane_type = str(cfg.get('default_crane_type', 'default'))
        # Append per-crane capability features to observations (obs 17→21). Off by
        # default: models trained without it keep their 17-dim actor, and planning
        # restores this flag from the model's own training cfg.
        self.obs_type_features = bool(cfg.get('obs_type_features', False))
        self._reward_keys = ('r_single', 'r_all', 'r_same', 'p_idle', 'p_inter_soft', 'p_time', 'p_move')
        self._global_reward = {k: float(getattr(self, k)) for k in self._reward_keys}
        self._reward_by_type: Dict[str, Dict[str, float]] = {}
        # Per-type 1D rated-load curves: cfg['crane_types'][name]['capacity_curve'].
        # A crane whose type carries a curve rates loads with it (2D chart and the
        # global curve are then ignored for that crane); types without a curve —
        # and the untyped default fleet — keep the global curve/chart behaviour,
        # so existing configs and checkpoints are unaffected.
        self._capacity_curve_by_type: Dict[str, List[Tuple[float, float]]] = {}
        # Per-type crane operation times: cfg['crane_types'][name]['setup_time' /
        # 'teardown_time' / 'fixed_duration']. Heavier classes deploy/pack up/hoist
        # slower. Absent keys fall back to the globals, so global-only configs are
        # numerically unchanged.
        self._time_by_type: Dict[str, Dict[str, float]] = {}
        # Per-type working radius: cfg['crane_types'][name]['crane_radius'].
        # Caps boom reach, rated-load radius, and drives the soft-interference
        # danger circle for cranes of that type; absent → global crane_radius.
        self._radius_by_type: Dict[str, float] = {}
        for tname, tcfg in (cfg.get('crane_types') or {}).items():
            type_r = ((tcfg or {}).get('reward') or {})
            merged = dict(self._global_reward)
            for k, v in type_r.items():
                if k in merged and v is not None:
                    merged[k] = float(v)
            self._reward_by_type[str(tname)] = merged
            t_times = {}
            for k in ('setup_time', 'teardown_time', 'fixed_duration'):
                v = (tcfg or {}).get(k)
                if v is not None:
                    try:
                        t_times[k] = float(v)
                    except (TypeError, ValueError):
                        pass
            if t_times:
                self._time_by_type[str(tname)] = t_times
            rv = (tcfg or {}).get('crane_radius')
            if rv is not None:
                try:
                    self._radius_by_type[str(tname)] = float(rv)
                except (TypeError, ValueError):
                    pass
            type_curve = self._normalize_capacity_curve(
                (tcfg or {}).get('capacity_curve')
                or (tcfg or {}).get('crane_capacity_curve')
                or (tcfg or {}).get('rated_load_curve')
            )
            if type_curve:
                self._capacity_curve_by_type[str(tname)] = type_curve
        self._lcg_state = 1
        self.reset(0)

    def _coef(self, ci: int, key: str) -> float:
        """Reward coefficient for crane index ci, key in self._reward_keys. Falls back to global."""
        t = self.cranes[ci].type if ci < len(self.cranes) else self.default_crane_type
        by = self._reward_by_type.get(t)
        return by[key] if by else self._global_reward[key]

    def _crane_radius_for(self, crane: Optional[Crane]) -> float:
        """Working radius for this crane, resolved by its type; global fallback."""
        if crane is None or not self._radius_by_type:
            return self.crane_radius
        return self._radius_by_type.get(getattr(crane, 'type', self.default_crane_type), self.crane_radius)

    def _crane_time(self, ci: int, key: str) -> float:
        """setup_time / teardown_time / fixed_duration for crane index ci, resolved
        by its type. Falls back to the global value when the type defines no override."""
        t = self.cranes[ci].type if ci < len(self.cranes) else self.default_crane_type
        by = self._time_by_type.get(t)
        if by and key in by:
            return by[key]
        if key == 'setup_time':
            return self.setup_time
        return self.teardown_time if key == 'teardown_time' else self.fixed_duration

    def _crane_type_assignment(self) -> List[str]:
        """Deterministic per-crane type labels for randomly generated scenarios.

        cfg['crane_types'][name]['count'] cranes take that type, in dict insertion
        order (C1 gets the first typed slot); remaining cranes fall back to
        default_crane_type. With 'count_max' > count, the per-episode count is
        sampled uniformly in [count, count_max] from a side LCG seeded by the
        episode seed — same seed, same composition — kept separate from the main
        LCG so composition sampling never perturbs seed-reproducible crane/lift
        positions (fixed-count and no-type configs also stay position-identical).
        With no counts configured every crane is default — single-type behavior.
        """
        types: List[str] = []
        side_state = None  # lazily seeded; untouched for fixed-count configs
        for tname, tcfg in (self.cfg.get('crane_types') or {}).items():
            tcfg = tcfg or {}
            try:
                lo = int(tcfg.get('count') or 0)
            except (TypeError, ValueError):
                lo = 0
            try:
                hi = int(tcfg.get('count_max') or 0)
            except (TypeError, ValueError):
                hi = 0
            lo = max(0, lo)
            n = lo
            if hi > lo:
                if side_state is None:
                    side_state = ((getattr(self, '_episode_seed', 0) * 2654435761)
                                  + 0x9E3779B9) & 0xFFFFFFFF
                side_state = (1664525 * side_state + 1013904223) & 0xFFFFFFFF
                n = lo + (side_state >> 16) % (hi - lo + 1)
            types.extend([str(tname)] * n)
        types = types[:self.nC]
        types.extend([self.default_crane_type] * (self.nC - len(types)))
        return types

    def _reset_idle_counters(self):
        self.idle_steps_per_crane = [0 for _ in range(max(0, int(self.nC)))]
        self.idle_steps_total = 0

    def _ensure_idle_counter_shape(self):
        vals = list(getattr(self, 'idle_steps_per_crane', []) or [])
        n = max(0, int(self.nC))
        if len(vals) < n:
            vals.extend([0] * (n - len(vals)))
        elif len(vals) > n:
            vals = vals[:n]
        self.idle_steps_per_crane = vals
        self.idle_steps_total = int(sum(vals))

    def record_idle_step(self, ci: int):
        """Record one step where crane `ci` received the idle penalty."""
        self._ensure_idle_counter_shape()
        if 0 <= int(ci) < len(self.idle_steps_per_crane):
            self.idle_steps_per_crane[int(ci)] += 1
        self.idle_steps_total = int(sum(self.idle_steps_per_crane))

    def _set_seed(self, seed: int):
        """Match the browser dashboard's makeRng(seed) LCG.

        JS uses uint32 arithmetic and rand(a,b)=a+rng()*(b-a). Keeping this
        generator here makes Python scenario seeds geometrically comparable with
        the browser dashboard.
        """
        self._lcg_state = int(seed or 1) & 0xFFFFFFFF
        self._episode_seed = int(seed or 0)

    def _rng(self) -> float:
        self._lcg_state = (1664525 * self._lcg_state + 1013904223) & 0xFFFFFFFF
        return self._lcg_state / 4294967296.0

    def _rand(self, a: float, b: float) -> float:
        return a + self._rng() * (b - a)

    def reset(self, seed: int = 0):
        self.rng = random.Random(seed)
        self._set_seed(seed)
        self.hard_mask_total = 0
        self.executed_hard_total = 0
        self.restricted_mask_total = 0
        self.restricted_executed_total = 0
        self.restricted_zones: List[Dict] = []
        self.step_count = 0
        self.events: List[Dict] = []
        self._reset_idle_counters()
        # Memoize candidate_outcome by (crane id, crane state, lift index). Keys auto-invalidate
        # when the crane's setup position or available time changes (mutation in step()),
        # so we never serve stale results. Reset here to avoid unbounded growth across episodes.
        self._co_cache: Dict[Tuple, Dict] = {}
        anchor = self.cfg.get('anchor_layout') or {}
        anchor_cranes = anchor.get('cranes') or []
        anchor_lifts = anchor.get('lifts') or []
        if anchor_cranes and anchor_lifts:
            jitter = float(self.cfg.get('anchor_jitter', 5.0))
            anchor_zones = anchor.get('restrictedZones') or anchor.get('restricted_zones') or self.cfg.get('restricted_zones') or []
            self.restricted_zones = self._normalize_restricted_zones(anchor_zones)
            random_zones = self._maybe_random_restricted_zones()
            if random_zones is not None:
                self.restricted_zones = random_zones
            self.nC = len(anchor_cranes); self.nL = len(anchor_lifts)
            self._reset_idle_counters()
            # 8%/92% margin keeps spawn positions away from the site boundary, matching
            # the browser's generateScenario(). Scales with site_width/height.
            x_lo, x_hi = 0.08 * self.site_width, 0.92 * self.site_width
            y_lo, y_hi = 0.08 * self.site_height, 0.92 * self.site_height
            self.cranes = []
            for i, c in enumerate(anchor_cranes):
                ax, ay = float(c.get('x', 0.5 * self.site_width)), float(c.get('y', 0.5 * self.site_height))
                x, y = ax, ay
                for _ in range(200):
                    if jitter > 0:
                        x = min(x_hi, max(x_lo, ax + self._rand(-jitter, jitter)))
                        y = min(y_hi, max(y_lo, ay + self._rand(-jitter, jitter)))
                    if not self._point_in_restricted(x, y):
                        break
                self.cranes.append(Crane(str(c.get('id', f'C{i+1}')), x, y, x, y,
                                         type=str(c.get('type', self.default_crane_type)),
                                         boom_len=self._crane_boom_len_from_dict(c),
                                         ground_z=max(0.0, float(c.get('ground_z', c.get('groundZ', 0.0))))))
            self.lifts = []
            for i, l in enumerate(anchor_lifts):
                ax, ay = float(l.get('x', 0.5 * self.site_width)), float(l.get('y', 0.5 * self.site_height))
                if jitter > 0:
                    x = min(x_hi, max(x_lo, ax + self._rand(-jitter, jitter)))
                    y = min(y_hi, max(y_lo, ay + self._rand(-jitter, jitter)))
                else:
                    x, y = ax, ay
                self.lifts.append(Lift(str(l.get('id', f'L{i+1}')), x, y, self._lift_weight_from_dict(l),
                                       z=self._lift_z_from_dict(l)))
            self._rebuild_height_order()
            return self.observe()
        self.restricted_zones = self._normalize_restricted_zones(self.cfg.get('restricted_zones') or self.cfg.get('restrictedZones') or [])
        random_zones = self._maybe_random_restricted_zones()
        if random_zones is not None:
            self.restricted_zones = random_zones
        # Match browser generateScenario(): cranes and lifts are uniform inside the
        # site, with an 8%/92% margin so they don't hug the boundary.
        x_lo, x_hi = 0.08 * self.site_width, 0.92 * self.site_width
        y_lo, y_hi = 0.08 * self.site_height, 0.92 * self.site_height
        self.cranes = []
        type_assignment = self._crane_type_assignment()
        for i in range(self.nC):
            for _ in range(200):
                x, y = self._rand(x_lo, x_hi), self._rand(y_lo, y_hi)
                if not self._point_in_restricted(x, y):
                    break
            self.cranes.append(Crane(f'C{i+1}', x, y, x, y, type=type_assignment[i],
                                     boom_len=self.default_boom_len))
        self.lifts = [
            Lift(f'L{i+1}', self._rand(x_lo, x_hi), self._rand(y_lo, y_hi),
                 self._sample_lift_weight(),
                 z=self._sample_lift_z())
            for i in range(self.nL)
        ]
        self._rebuild_height_order()
        return self.observe()

    def _rebuild_height_order(self):
        """Derive the lower-first precedence from the current lifts.

        For every pair of lifts within ``height_order_radius`` horizontal metres,
        the strictly lower one (smaller z) must be erected first. Stored as
        ``self._height_requires[i]`` = indices that must be done before lift i.
        Equal heights impose no order, so the relation is acyclic by
        construction. None when the feature is off (radius <= 0) — the training
        path and existing scenarios are then untouched.
        """
        self._lift_finish: Dict[int, float] = {}
        if self.height_order_radius <= 0.0 or not getattr(self, 'lifts', None):
            self._height_requires: Optional[List[List[int]]] = None
            return
        r = self.height_order_radius
        reqs: List[List[int]] = [[] for _ in self.lifts]
        for i, a in enumerate(self.lifts):
            for j, b in enumerate(self.lifts):
                if i == j:
                    continue
                if b.z < a.z - 1e-9 and dist((a.x, a.y), (b.x, b.y)) <= r + 1e-9:
                    reqs[i].append(j)
        self._height_requires = reqs

    def _height_blocked(self, li: int) -> bool:
        """True while a strictly-lower neighbour of lift li is not yet done."""
        reqs = getattr(self, '_height_requires', None)
        if not reqs:
            return False
        return any(not self.lifts[j].done for j in reqs[li])

    def _height_ready_time(self, li: int) -> float:
        """Earliest hoist-start time allowed by height precedence: the latest
        liftFinish among li's lower neighbours (0.0 when unconstrained)."""
        reqs = getattr(self, '_height_requires', None)
        if not reqs:
            return 0.0
        return max([self._lift_finish.get(j, 0.0) for j in reqs[li]] or [0.0])

    def _with_height_wait(self, li: int, out: Dict) -> Dict:
        """Return `out`, delayed so the hoist starts no earlier than every lower
        neighbour's liftFinish. The crane waits after setup — only the lift
        phase and the finish shift. Copies the dict; the candidate_outcome
        cache entry stays untouched."""
        ready = self._height_ready_time(li)
        delay = ready - out['liftStart']
        if delay <= 1e-9:
            return out
        shifted = dict(out)
        shifted['liftStart'] = out['liftStart'] + delay
        shifted['liftFinish'] = out['liftFinish'] + delay
        shifted['finish'] = out['finish'] + delay
        return shifted

    def _sample_lift_weight(self) -> float:
        if self.lift_weight_max_t > self.lift_weight_min_t:
            return self._rand(self.lift_weight_min_t, self.lift_weight_max_t)
        return max(0.0, min(MAX_LIFT_WEIGHT_T, self.default_lift_weight_t))

    def _sample_lift_z(self) -> float:
        if self.lift_z_max > self.lift_z_min:
            return self._rand(self.lift_z_min, self.lift_z_max)
        return self.lift_z_min

    def _lift_weight_from_dict(self, lift: Dict) -> float:
        raw = lift.get('weightT', lift.get('weight_t', lift.get('weight', lift.get('loadWeightT', lift.get('load_weight_t', self.default_lift_weight_t)))))
        try:
            return max(0.0, min(MAX_LIFT_WEIGHT_T, float(raw)))
        except (TypeError, ValueError):
            return max(0.0, min(MAX_LIFT_WEIGHT_T, self.default_lift_weight_t))

    def _lift_z_from_dict(self, lift: Dict) -> float:
        """Read the lift's placement height from a dict. Accepts `z`/`height` and,
        for back-compat with older from→to data, `z_to`/`z_from` (takes the max,
        which was the governing height under the old two-value model)."""
        aliases = ('z', 'height', 'zTo', 'z_to', 'toHeight', 'zFrom', 'z_from')
        best = 0.0
        seen = False
        for alias in aliases:
            v = lift.get(alias)
            if v is not None:
                try:
                    best = max(best, float(v)) if seen else float(v)
                    seen = True
                except (TypeError, ValueError):
                    pass
        return max(0.0, best)

    def _crane_boom_len_from_dict(self, c: Dict) -> float:
        """Read boom_len from a crane dict, with fallback to env default."""
        raw = c.get('boom_len', c.get('boomLen', c.get('boom_length', self.default_boom_len)))
        try:
            return max(0.0, float(raw))
        except (TypeError, ValueError):
            return max(0.0, self.default_boom_len)

    def _normalize_capacity_curve(self, raw_curve) -> List[Tuple[float, float]]:
        """Return sorted (radius, capacity_t) points for the single crane type.

        Absence of a curve preserves legacy behavior: every lift can use
        `crane_radius`. When a curve is configured, capacity is linearly
        interpolated between supplied chart points and no extrapolation is assumed
        beyond the largest radius in the chart.
        """
        pts: List[Tuple[float, float]] = []
        for p in raw_curve or []:
            try:
                if isinstance(p, dict):
                    r = float(p.get('radius', p.get('r')))
                    cap = float(p.get('capacityT', p.get('capacity_t', p.get('capacity', p.get('loadT')))))
                else:
                    r = float(p[0])
                    cap = float(p[1])
            except (TypeError, ValueError, IndexError):
                continue
            if math.isfinite(r) and math.isfinite(cap) and r >= 0.0 and cap >= 0.0:
                pts.append((r, cap))
        pts.sort(key=lambda x: x[0])
        dedup: List[Tuple[float, float]] = []
        for r, cap in pts:
            if dedup and abs(dedup[-1][0] - r) <= 1e-9:
                dedup[-1] = (r, cap)
            else:
                dedup.append((r, cap))
        return dedup

    def _normalize_capacity_chart(self, raw_chart) -> List[Tuple[float, List[Tuple[float, float]]]]:
        """Return sorted [(boom_len, curve), ...] for the 2D rated-load chart.

        Each entry pairs a boom length (m) with its own capacity-vs-radius curve,
        mirroring a real mobile-crane load chart (one column per boom length).
        Accepts list-of-pairs `[[boom, [[r,c],...]], ...]` or list-of-dicts
        `[{"boom_len":20,"curve":[...]}, ...]`. Sorted ascending by boom length so
        the lookup can pick the shortest boom that reaches a required slant range.
        """
        out: List[Tuple[float, List[Tuple[float, float]]]] = []
        for entry in raw_chart or []:
            try:
                if isinstance(entry, dict):
                    bl = float(entry.get('boom_len', entry.get('boomLen', entry.get('boom'))))
                    curve_raw = entry.get('curve', entry.get('points', entry.get('capacity_curve')))
                else:
                    bl = float(entry[0])
                    curve_raw = entry[1]
            except (TypeError, ValueError, IndexError, KeyError):
                continue
            if not math.isfinite(bl) or bl <= 0.0:
                continue
            curve = self._normalize_capacity_curve(curve_raw)
            if curve:
                out.append((bl, curve))
        out.sort(key=lambda e: e[0])
        return out

    def _delta_z(self, crane: Crane, lift: Lift) -> float:
        """Placement height above the crane's ground level (m). The boom tip must
        reach this height to service the lift point."""
        return getattr(lift, 'z', 0.0) - getattr(crane, 'ground_z', 0.0)

    def _effective_max_boom(self, crane: Crane) -> float:
        """Longest boom available to this crane. The 2D chart's longest boom wins
        when a chart is configured; otherwise the crane's own boom_len (simple
        reach-only mode); 0 means no height constraint (pure 2D)."""
        if self.crane_capacity_chart:
            return self.chart_max_boom
        return getattr(crane, 'boom_len', 0.0)

    def _boom_reach_radius(self, crane: Crane, lift: Lift) -> float:
        """Max horizontal reach radius after accounting for required lift height.

        A mobile crane's luffing boom of length L angled to reach height delta_z
        has max horizontal reach sqrt(L² - delta_z²).  Returns crane_radius when
        no boom is configured (2D mode) or no height is required.  Returns -1.0
        when the boom is too short to reach the required height (impossible).
        """
        boom_len = self._effective_max_boom(crane)
        radius = self._crane_radius_for(crane)
        if boom_len <= 0.0:
            return radius  # 2D fallback — no height constraint
        delta_z = self._delta_z(crane, lift)
        if delta_z <= 0.0:
            return radius  # crane is above or at the target height
        if delta_z >= boom_len:
            return -1.0  # boom physically cannot reach this height
        return min(radius, math.sqrt(boom_len ** 2 - delta_z ** 2))

    @staticmethod
    def _capacity_from_curve(pts: List[Tuple[float, float]], radius: float) -> Optional[float]:
        # Stair (step) interpretation matching the dashboard preview: for r in
        # (r_{i-1}, r_i] the capacity drops to c_i — i.e. between tabulated points
        # we conservatively use the lower-capacity (larger-radius) endpoint.
        if not pts:
            return None
        r = max(0.0, float(radius))
        if r <= pts[0][0]:
            return pts[0][1]
        for (r1, _c1), (r2, c2) in zip(pts, pts[1:]):
            if r1 < r <= r2:
                return c2
        return None

    def _capacity_at_radius(self, radius: float) -> Optional[float]:
        """1D capacity lookup (horizontal radius only). Used for the legacy curve
        and as the per-boom-length lookup inside the 2D chart."""
        return self._capacity_from_curve(self.crane_capacity_curve, radius)

    def _type_curve_for(self, crane: Optional[Crane]) -> Optional[List[Tuple[float, float]]]:
        """The crane's type-specific 1D curve, or None to use the global curve/chart."""
        if crane is None or not self._capacity_curve_by_type:
            return None
        return self._capacity_curve_by_type.get(getattr(crane, 'type', self.default_crane_type))

    def _capacity_at(self, radius: float, delta_z: float, crane: Optional[Crane] = None) -> Optional[float]:
        """Height-aware capacity (t) at a given horizontal radius.

        With a 2D chart: reaching horizontal radius R at height delta_z requires a
        boom of slant length L = sqrt(R² + delta_z²). The crane extends to the
        SHORTEST chart boom that covers L (shortest boom = most capacity), then we
        read capacity at radius R from that boom's curve. Returns None when no
        boom is long enough (infeasible). Without a chart this reduces to the 1D
        curve — height then only limits reach (handled separately), not the rating.

        A crane whose type has its own curve rates with that curve (1D semantics,
        chart bypassed) regardless of the global configuration.
        """
        type_curve = self._type_curve_for(crane)
        if type_curve:
            return self._capacity_from_curve(type_curve, radius)
        if self.crane_capacity_chart:
            l_req = math.hypot(max(0.0, float(radius)), max(0.0, float(delta_z)))
            for boom_len, curve in self.crane_capacity_chart:
                if boom_len + 1e-9 >= l_req:
                    return self._capacity_from_curve(curve, radius)
            return None  # no boom long enough → cannot reach this radius/height
        return self._capacity_at_radius(radius)

    def display_capacity_curve(self) -> List[Tuple[float, float]]:
        """Representative (radius, capacity_t) curve for UI display (capacity
        reference panel + 3D replay LMI gauge). Prefers the explicit 1D curve;
        otherwise derives a ground-level (z=0) curve from the 2D chart by reading
        each tabulated radius's rating with no height penalty. [] when neither is
        configured."""
        if self.crane_capacity_curve:
            return list(self.crane_capacity_curve)
        if not self.crane_capacity_chart:
            return []
        radii = sorted({r for _bl, curve in self.crane_capacity_chart for (r, _c) in curve})
        out: List[Tuple[float, float]] = []
        for r in radii:
            cap = self._capacity_at(r, 0.0)
            if cap is not None:
                out.append((float(r), float(cap)))
        return out

    def _max_radius_for_weight(self, weight_t: float, curve: Optional[List[Tuple[float, float]]] = None,
                               radius_cap: Optional[float] = None) -> float:
        # Step semantics: in (r_{i-1}, r_i] the rating is c_i, so a lift of weight w
        # is allowed out to r_i whenever c_i >= w. The initial flat region [0, r_0]
        # carries c_0. `curve` overrides the global curve (per-type rating);
        # `radius_cap` overrides the global working radius (per-type radius).
        cap = self.crane_radius if radius_cap is None else radius_cap
        pts = curve if curve is not None else self.crane_capacity_curve
        if not pts:
            return cap
        w = max(0.0, float(weight_t))
        best: Optional[float] = None
        if pts[0][1] + 1e-9 >= w:
            best = pts[0][0]
        for (_r1, _c1), (r2, c2) in zip(pts, pts[1:]):
            if c2 + 1e-9 >= w:
                best = r2 if best is None else max(best, r2)
        if best is None:
            return -1.0
        return min(cap, max(0.0, best))

    def _max_radius_chart(self, weight_t: float, delta_z: float,
                          radius_cap: Optional[float] = None) -> float:
        """Max horizontal radius where weight_t is liftable at height delta_z, using
        the 2D chart. capacity_at(R) is monotonically non-increasing in R (larger R
        forces a longer boom AND moves out the radius axis — both derate), so we
        binary-search the feasibility threshold. Returns -1.0 if infeasible even at
        radius 0 or if the height exceeds the longest boom."""
        w = max(0.0, float(weight_t))
        dz = max(0.0, float(delta_z))
        if dz >= self.chart_max_boom:
            return -1.0  # even the longest boom can't reach this height
        r_reach = math.sqrt(self.chart_max_boom ** 2 - dz ** 2)
        hi = min(self.crane_radius if radius_cap is None else radius_cap, r_reach)
        cap0 = self._capacity_at(0.0, dz)
        if cap0 is None or cap0 + 1e-9 < w:
            return -1.0  # cannot lift even directly overhead
        cap_hi = self._capacity_at(hi, dz)
        if cap_hi is not None and cap_hi + 1e-9 >= w:
            return hi  # feasible all the way to the reach limit
        lo = 0.0
        for _ in range(40):  # ~1e-12 m precision on a 100 m site
            mid = 0.5 * (lo + hi)
            cap = self._capacity_at(mid, dz)
            if cap is not None and cap + 1e-9 >= w:
                lo = mid
            else:
                hi = mid
        return lo

    def _lift_max_radius(self, crane: Crane, lift: Lift) -> float:
        """Max horizontal lifting radius for this crane+lift, combining rated load
        and (when configured) boom-reach height limits. -1.0 means infeasible.

        Chart mode: capacity is derated by the boom length the height forces.
        Curve mode: 1D weight radius, then capped by the boom-reach radius.
        A type-specific curve (cfg['crane_types'][type]['capacity_curve']) takes
        precedence for that crane and always rates in 1D curve mode.
        """
        weight = getattr(lift, 'weight_t', self.default_lift_weight_t)
        type_curve = self._type_curve_for(crane)
        radius_cap = self._crane_radius_for(crane)
        if type_curve is None and self.crane_capacity_chart:
            return self._max_radius_chart(weight, self._delta_z(crane, lift), radius_cap=radius_cap)
        weight_max_r = self._max_radius_for_weight(weight, curve=type_curve, radius_cap=radius_cap)
        boom_max_r = self._boom_reach_radius(crane, lift)
        if weight_max_r < -1e-9 or boom_max_r < -1e-9:
            return -1.0
        return min(weight_max_r, boom_max_r)

    def _normalize_restricted_zones(self, zones: Optional[List[Dict]]) -> List[Dict]:
        out = []
        for i, z in enumerate(zones or []):
            if (z.get('type') or 'rect') != 'rect':
                continue
            x1 = float(z.get('x1', z.get('x', 0)))
            y1 = float(z.get('y1', z.get('y', 0)))
            x2 = float(z.get('x2', x1 + float(z.get('w', 0))))
            y2 = float(z.get('y2', y1 + float(z.get('h', 0))))
            out.append({'id': str(z.get('id', f'RZ{i+1}')), 'type': 'rect',
                        'x1': min(x1, x2), 'y1': min(y1, y2), 'x2': max(x1, x2), 'y2': max(y1, y2)})
        return out

    def _maybe_random_restricted_zones(self) -> Optional[List[Dict]]:
        """If cfg.restricted_random.enabled is set, sample N rectangular zones using
        the same seeded LCG that places cranes/lifts (self._rng), so the same seed
        always produces the same zone layout — important for reproducible
        seen/validation/unseen evaluation under domain randomization.

        Returns None when randomization is off, so callers fall back to the static
        cfg.restricted_zones block. Returns [] when on but count_max <= 0.
        """
        block = self.cfg.get('restricted_random') or {}
        if not block.get('enabled'):
            return None
        try:
            cmin = max(0, int(block.get('count_min', 1)))
            cmax = max(cmin, int(block.get('count_max', cmin)))
            wmin = max(0.5, float(block.get('width_min', 8.0)))
            wmax = max(wmin, float(block.get('width_max', 20.0)))
            hmin = max(0.5, float(block.get('height_min', 8.0)))
            hmax = max(hmin, float(block.get('height_max', 20.0)))
        except (TypeError, ValueError):
            return None
        if cmax <= 0:
            return []
        # Inclusive integer in [cmin, cmax]
        n = cmin + int(self._rng() * (cmax - cmin + 1))
        n = max(cmin, min(cmax, n))
        x_hi, y_hi = self.site_width, self.site_height
        zones: List[Dict] = []
        for i in range(n):
            w = self._rand(wmin, wmax)
            h = self._rand(hmin, hmax)
            # Clamp top-left so the rectangle stays inside the site.
            x1 = self._rand(0.0, max(0.0, x_hi - w))
            y1 = self._rand(0.0, max(0.0, y_hi - h))
            zones.append({'id': f'RZ{i+1}', 'type': 'rect',
                          'x1': x1, 'y1': y1, 'x2': x1 + w, 'y2': y1 + h})
        return zones

    def _point_in_restricted(self, x: float, y: float) -> bool:
        return any(z['x1'] <= x <= z['x2'] and z['y1'] <= y <= z['y2'] for z in self.restricted_zones)

    def _segment_intersects_rect(self, ax: float, ay: float, bx: float, by: float, z: Dict) -> bool:
        if self._point_in_rect(ax, ay, z) or self._point_in_rect(bx, by, z):
            return True
        edges = [((z['x1'], z['y1']), (z['x2'], z['y1'])), ((z['x2'], z['y1']), (z['x2'], z['y2'])),
                 ((z['x2'], z['y2']), (z['x1'], z['y2'])), ((z['x1'], z['y2']), (z['x1'], z['y1']))]
        return any(self._segments_intersect((ax, ay), (bx, by), p, q) for p, q in edges)

    def _point_in_rect(self, x: float, y: float, z: Dict) -> bool:
        return z['x1'] <= x <= z['x2'] and z['y1'] <= y <= z['y2']

    def _segments_intersect(self, p1, p2, q1, q2) -> bool:
        def orient(a, b, c):
            return (b[0]-a[0])*(c[1]-a[1]) - (b[1]-a[1])*(c[0]-a[0])
        def on(a, b, c):
            return min(a[0], b[0])-1e-9 <= c[0] <= max(a[0], b[0])+1e-9 and min(a[1], b[1])-1e-9 <= c[1] <= max(a[1], b[1])+1e-9
        o1, o2, o3, o4 = orient(p1,p2,q1), orient(p1,p2,q2), orient(q1,q2,p1), orient(q1,q2,p2)
        if (o1 > 0) != (o2 > 0) and (o3 > 0) != (o4 > 0):
            return True
        return (abs(o1) < 1e-9 and on(p1,p2,q1)) or (abs(o2) < 1e-9 and on(p1,p2,q2)) or (abs(o3) < 1e-9 and on(q1,q2,p1)) or (abs(o4) < 1e-9 and on(q1,q2,p2))

    def _path_blocked_by_restricted(self, ax: float, ay: float, bx: float, by: float) -> bool:
        return any(self._segment_intersects_rect(ax, ay, bx, by, z) for z in self.restricted_zones)

    def _shortest_accessible_path(self, start: Tuple[float, float], goal: Tuple[float, float]) -> Tuple[Optional[float], List[Tuple[float, float]]]:
        """Shortest visibility-graph path that avoids rectangular restricted zones.

        Stage-2 restricted-zone model: direct travel is preferred, but if the
        direct segment crosses a restricted rectangle, the crane may detour via
        rectangle-corner waypoints expanded by a small clearance. Returns
        (distance, path_points). None distance means no accessible path.
        """
        sx, sy = start; gx, gy = goal
        if self._point_in_restricted(sx, sy) or self._point_in_restricted(gx, gy):
            return None, []
        sg_dist = dist(start, goal)
        direct_blocked = bool(self.restricted_zones) and self._path_blocked_by_restricted(sx, sy, gx, gy)
        if not direct_blocked:
            return sg_dist, [start, goal]
        clearance = float(self.cfg.get('restricted_clearance', 1.0))
        nodes = [start, goal]
        for z in self.restricted_zones:
            for px, py in [(z['x1']-clearance, z['y1']-clearance), (z['x1']-clearance, z['y2']+clearance),
                           (z['x2']+clearance, z['y1']-clearance), (z['x2']+clearance, z['y2']+clearance)]:
                px, py = max(0.0, min(self.site_width, px)), max(0.0, min(self.site_height, py))
                if not self._point_in_restricted(px, py):
                    nodes.append((px, py))
        # Deduplicate near-identical points.
        unique = []
        for p in nodes:
            if not any(dist(p, q) < 1e-7 for q in unique):
                unique.append(p)
        nodes = unique
        n = len(nodes)
        graph = [[] for _ in range(n)]
        for i in range(n):
            for j in range(i+1, n):
                ax, ay = nodes[i]
                bx, by = nodes[j]
                if self._path_blocked_by_restricted(ax, ay, bx, by):
                    continue
                w = dist(nodes[i], nodes[j])
                graph[i].append((j, w)); graph[j].append((i, w))
        dists = [float('inf')] * n; prev = [-1] * n
        dists[0] = 0.0
        # Min-heap Dijkstra: O((n + edges) log n) vs the previous O(n²) linear-scan.
        # heap stores (dist, node); we discard stale entries by comparing against dists[u].
        heap = [(0.0, 0)]
        while heap:
            du, u = heapq.heappop(heap)
            if du > dists[u]:
                continue
            if u == 1:
                break
            for v, w in graph[u]:
                nd = du + w
                if nd < dists[v]:
                    dists[v] = nd; prev[v] = u
                    heapq.heappush(heap, (nd, v))
        if not math.isfinite(dists[1]):
            return None, []
        path_idx = []
        cur = 1
        while cur != -1:
            path_idx.append(cur)
            cur = prev[cur]
        path_idx.reverse()
        return dists[1], [nodes[i] for i in path_idx]

    def _restricted_blocked(self, crane: Crane, sx: float, sy: float) -> bool:
        path_dist, _ = self._shortest_accessible_path((crane.setup_x, crane.setup_y), (sx, sy))
        return path_dist is None

    def reset_layout(self, cranes: List[Dict], lifts: List[Dict], restricted_zones: Optional[List[Dict]] = None):
        """Reset environment from a user-edited site layout in 0-100 coordinates."""
        self.restricted_zones = self._normalize_restricted_zones(restricted_zones)
        self.nC = len(cranes)
        self.nL = len(lifts)
        self.hard_mask_total = 0
        self.executed_hard_total = 0
        self.restricted_mask_total = 0
        self.restricted_executed_total = 0
        self.step_count = 0
        self.events = []
        self._reset_idle_counters()
        self._co_cache: Dict[Tuple, Dict] = {}
        self.cranes = []
        invalid_cranes = []
        for i, c in enumerate(cranes):
            x = float(c.get('x', c.get('setup_x', c.get('setupX', 8 + i*10))))
            y = float(c.get('y', c.get('setup_y', c.get('setupY', 8))))
            sx = float(c.get('setup_x', c.get('setupX', x)))
            sy = float(c.get('setup_y', c.get('setupY', y)))
            if self._point_in_restricted(sx, sy) or self._point_in_restricted(x, y):
                invalid_cranes.append(str(c.get('id', f'C{i+1}')))
            self.cranes.append(Crane(str(c.get('id', f'C{i+1}')), x, y, sx, sy,
                                     type=str(c.get('type', self.default_crane_type)),
                                     boom_len=self._crane_boom_len_from_dict(c),
                                     ground_z=max(0.0, float(c.get('ground_z', c.get('groundZ', 0.0))))))
        if invalid_cranes:
            raise ValueError('크레인 초기/setup 위치가 제한 구역 안에 있습니다: ' + ', '.join(invalid_cranes))
        self.lifts = []
        for i, l in enumerate(lifts):
            self.lifts.append(Lift(
                str(l.get('id', f'L{i+1}')),
                float(l.get('x', 20+i*5)),
                float(l.get('y', 40)),
                self._lift_weight_from_dict(l),
                z=self._lift_z_from_dict(l),
            ))
        self._rebuild_height_order()
        return self.observe()

    def run_policy_layout(self, policy: str, cranes: List[Dict], lifts: List[Dict], model=None, greedy=True, restricted_zones: Optional[List[Dict]] = None):
        self.reset_layout(cranes, lifts, restricted_zones)
        total_reward = 0.0
        while not self.is_done():
            obs, masks, glob = self.observe()
            if policy == 'random':
                actions=[self.rng.choice([i for i,m in enumerate(masks[ci]) if m] or [0]) for ci in range(self.nC)]
            elif policy in ('nearest','radiusPriority'):
                actions=self.heuristic_actions(policy)
            elif policy == 'mappo' and model is not None:
                actions=model.act_np(obs,masks,greedy=greedy)
            else:
                actions=[0 for _ in range(self.nC)]
            *_ , rewards, done, info = self.step(actions)
            total_reward += float(np.sum(rewards))
        # step() only applies final teardowns when every lift completed
        # (done_count >= nL). When the episode ends via the max_steps cap with
        # partial completion, each crane's last actual lift still represents work
        # that physically needs a teardown — apply it here so the Gantt shows
        # the closing teardown bar regardless of completion status. The
        # finalTeardownApplied guard prevents double-application when step()
        # already ran this on the full-completion path. rewards=None keeps the
        # training reward dynamics for run_policy() unchanged (this method is
        # only used by /api/plan/run, not by the training loop).
        self._apply_final_teardowns(rewards=None)
        s=self.summary(); s['reward']=total_reward
        return s

    def done_count(self):
        return sum(1 for l in self.lifts if l.done)

    def is_done(self):
        return self.done_count() >= self.nL or self.step_count >= self.max_steps

    def setup_target(self, crane: Crane, lift: Lift) -> Tuple[float, float, bool, bool, List[Tuple[float, float]], float]:
        cur = (crane.setup_x, crane.setup_y)
        lp = (lift.x, lift.y)
        candidates = []
        fallback_candidates = []
        d = dist(cur, lp)
        max_radius = self._lift_max_radius(crane, lift)
        if max_radius < -1e-9:
            return crane.setup_x, crane.setup_y, True, True, [], 0.0
        # Legal setup region is the whole disk(lift, max_radius). `inner_fraction`
        # controls how much of that disk is sampled; the default 1.0 uses the full
        # allowed radius area, including points close to the boundary.
        inner_fraction = float(self.cfg.get('lift_setup_inner_fraction', 0.85))
        inner_fraction = max(0.0, min(1.0, inner_fraction))
        target_radius = max_radius * inner_fraction
        if d <= target_radius + 1e-9:
            candidates.append((crane.setup_x, crane.setup_y, True))
        if d > target_radius + 1e-9:
            # Walk along current-setup -> lift line and stop INSIDE the disk at
            # target_radius — not on the boundary.
            ratio = (d - target_radius) / max(d, 1e-9)
            nx = crane.setup_x + (lift.x - crane.setup_x) * ratio
            ny = crane.setup_y + (lift.y - crane.setup_y) * ratio
            candidates.append((nx, ny, False))
        # If the direct setup point/path is blocked, try setup points throughout the
        # allowed disk area. The sqrt spacing gives roughly even area coverage instead
        # of concentrating every fallback on the outer max-radius circumference.
        try:
            area_rings = int(self.cfg.get('lift_setup_area_rings', 4))
        except (TypeError, ValueError):
            area_rings = 4
        try:
            area_angles = int(self.cfg.get('lift_setup_area_angles', 16))
        except (TypeError, ValueError):
            area_angles = 16
        area_rings = max(1, min(12, area_rings))
        area_angles = max(4, min(64, area_angles))
        sample_outer_radius = target_radius if target_radius > 1e-9 else max_radius
        disk_radii = [0.0]
        for i in range(1, area_rings + 1):
            disk_radii.append(sample_outer_radius * math.sqrt(i / area_rings))
        if target_radius > 1e-9:
            disk_radii.append(target_radius)
        unique_radii = []
        for rr in disk_radii:
            rr = max(0.0, min(max_radius, rr))
            if all(abs(rr - seen) > 1e-6 for seen in unique_radii):
                unique_radii.append(rr)
        for ri, rr in enumerate(unique_radii):
            if rr <= 1e-9:
                if 0 <= lift.x <= self.site_width and 0 <= lift.y <= self.site_height:
                    candidates.append((lift.x, lift.y, False))
                continue
            offset = (math.pi / area_angles) if (ri % 2) else 0.0
            for k in range(area_angles):
                ang = 2 * math.pi * k / area_angles + offset
                sx = lift.x + math.cos(ang) * rr
                sy = lift.y + math.sin(ang) * rr
                if 0 <= sx <= self.site_width and 0 <= sy <= self.site_height:
                    candidates.append((sx, sy, False))
        if sample_outer_radius < max_radius - 1e-6:
            for k in range(area_angles):
                ang = 2 * math.pi * k / area_angles
                sx = lift.x + math.cos(ang) * max_radius
                sy = lift.y + math.sin(ang) * max_radius
                if 0 <= sx <= self.site_width and 0 <= sy <= self.site_height:
                    fallback_candidates.append((sx, sy, False))

        def choose_best(candidate_list):
            # Pre-screen candidates by geometry (cheap) before path planning. We then try
            # `same=True` first (it wins lex order regardless of distance) and prune the
            # `same=False` search by direct distance — the path distance is a lower-bound
            # for the visibility-graph result, so once we have a viable path of length D
            # we can skip any remaining candidate whose direct distance >= D.
            same_true_cand = None
            same_false_scored = []
            for sx, sy, same in candidate_list:
                actual = dist((sx, sy), lp)
                if actual > max_radius + 1e-6:
                    continue
                direct = dist(cur, (sx, sy))
                if same:
                    if same_true_cand is None:
                        same_true_cand = (sx, sy, direct)
                else:
                    same_false_scored.append((direct, sx, sy))
            selected = None
            if same_true_cand is not None:
                sx, sy, direct = same_true_cand
                path_dist, path = self._shortest_accessible_path(cur, (sx, sy))
                if path_dist is not None:
                    selected = ((0, path_dist), sx, sy, True, path, direct)
            if selected is None:
                same_false_scored.sort(key=lambda t: t[0])
                best_pd = float('inf')
                for direct, sx, sy in same_false_scored:
                    if direct >= best_pd:
                        break
                    path_dist, path = self._shortest_accessible_path(cur, (sx, sy))
                    if path_dist is None:
                        continue
                    if path_dist < best_pd:
                        best_pd = path_dist
                        selected = ((1, path_dist), sx, sy, False, path, direct)
            return selected

        best = choose_best(candidates)
        if best is None:
            best = choose_best(fallback_candidates)
        if best is not None:
            _, sx, sy, same, path, direct_move = best
            return sx, sy, same, False, path, direct_move
        # Keep a deterministic fallback for diagnostics; caller will mask it.
        if candidates:
            sx, sy, same = candidates[0]
            return sx, sy, same, True, [], dist(cur, (sx, sy))
        return crane.setup_x, crane.setup_y, True, True, [], 0.0

    def candidate_outcome(self, ci: int, li: int) -> Dict:
        c, l = self.cranes[ci], self.lifts[li]
        # Cache key includes the crane state fields candidate_outcome actually reads,
        # so any mutation (mid-step assignment or reset) yields a fresh key and miss.
        key = (ci, c.available, c.setup_x, c.setup_y, c.jobs, li)
        cached = self._co_cache.get(key)
        if cached is not None:
            return cached
        sx, sy, same, restricted, move_path, direct_move = self.setup_target(c, l)
        path_move = sum(dist(move_path[i-1], move_path[i]) for i in range(1, len(move_path))) if move_path else direct_move
        move = path_move
        travel = move / 10.0
        setup = 0.0 if (same and c.jobs > 0) else self._crane_time(ci, 'setup_time')
        teardown = self._crane_time(ci, 'teardown_time') if (not same and c.jobs > 0) else 0.0
        start = c.available
        teardown_start = start
        travel_start = teardown_start + teardown
        setup_start = travel_start + travel
        lift_start = setup_start + setup
        finish = lift_start + self._crane_time(ci, 'fixed_duration')
        weight_t = max(0.0, min(MAX_LIFT_WEIGHT_T, float(getattr(l, 'weight_t', self.default_lift_weight_t))))
        delta_z = self._delta_z(c, l)
        max_radius = self._lift_max_radius(c, l)
        boom_max_r = self._boom_reach_radius(c, l)
        actual = dist((sx, sy), (l.x, l.y))
        capacity_at_actual = self._capacity_at(actual, delta_z, c)
        capacity_margin = None if capacity_at_actual is None else capacity_at_actual - weight_t
        required_boom = math.hypot(actual, max(0.0, delta_z))
        if (not restricted) and max_radius < -1e-9:
            restricted = True
        if (not restricted) and actual > max_radius + 1e-6:
            restricted = True
        if (not restricted) and capacity_margin is not None and capacity_margin < -1e-6:
            restricted = True
        result = dict(
            ci=ci, li=li, sx=sx, sy=sy, same=same,
            move=move, directMove=direct_move, detour=max(0.0, move-direct_move), movePath=move_path,
            travel=travel, setup=setup, teardown=teardown,
            start=start, finish=finish, actual=actual, maxRadius=max_radius,
            weightT=weight_t, capacityAtActual=capacity_at_actual, capacityMargin=capacity_margin,
            restricted=restricted,
            z=getattr(l, 'z', 0.0),
            boomReachRadius=boom_max_r, requiredBoomLen=required_boom,
            teardownStart=teardown_start, teardownFinish=travel_start,
            travelStart=travel_start, travelFinish=setup_start,
            setupStart=setup_start, setupFinish=lift_start,
            liftStart=lift_start, liftFinish=finish,
        )
        self._co_cache[key] = result
        return result

    def outcome_for_setup(self, ci: int, li: int, sx: float, sy: float) -> Dict:
        """Same shape as candidate_outcome but with a caller-supplied setup
        point (sx, sy). Used by human-play sessions where the user drags the
        crane to a specific position before lifting.

        Geometry: straight-line movement from current setup → user (sx, sy).
        No auto detour around restricted zones. Out-of-site points, paths that
        cross a restricted zone, invalid capacity, and excessive lift radius
        are marked restricted=True so the caller can reject the decision.

        Not cached (positions vary continuously across user drags).
        """
        c, l = self.cranes[ci], self.lifts[li]
        sx = float(sx)
        sy = float(sy)
        # Same-radius means the user kept the crane at its current setup spot.
        same = (abs(sx - c.setup_x) < 1e-6 and abs(sy - c.setup_y) < 1e-6)
        direct_move = dist((c.setup_x, c.setup_y), (sx, sy))
        move_path = [(c.setup_x, c.setup_y), (sx, sy)]
        move = direct_move
        travel = move / 10.0
        setup = 0.0 if (same and c.jobs > 0) else self._crane_time(ci, 'setup_time')
        teardown = self._crane_time(ci, 'teardown_time') if (not same and c.jobs > 0) else 0.0
        start = c.available
        teardown_start = start
        travel_start = teardown_start + teardown
        setup_start = travel_start + travel
        lift_start = setup_start + setup
        finish = lift_start + self._crane_time(ci, 'fixed_duration')
        weight_t = max(0.0, min(MAX_LIFT_WEIGHT_T, float(getattr(l, 'weight_t', self.default_lift_weight_t))))
        delta_z = self._delta_z(c, l)
        max_radius = self._lift_max_radius(c, l)
        boom_max_r = self._boom_reach_radius(c, l)
        actual = dist((sx, sy), (l.x, l.y))
        capacity_at_actual = self._capacity_at(actual, delta_z, c)
        capacity_margin = None if capacity_at_actual is None else capacity_at_actual - weight_t
        required_boom = math.hypot(actual, max(0.0, delta_z))
        out_of_bounds = not (0.0 <= sx <= self.site_width and 0.0 <= sy <= self.site_height)
        path_blocked = (
            not out_of_bounds
            and bool(self.restricted_zones)
            and self._path_blocked_by_restricted(c.setup_x, c.setup_y, sx, sy)
        )
        restricted = out_of_bounds or self._point_in_restricted(sx, sy) or path_blocked
        if (not restricted) and max_radius < -1e-9:
            restricted = True
        if (not restricted) and actual > max_radius + 1e-6:
            restricted = True
        if (not restricted) and capacity_margin is not None and capacity_margin < -1e-6:
            restricted = True
        return dict(
            ci=ci, li=li, sx=sx, sy=sy, same=same,
            move=move, directMove=direct_move, detour=0.0, movePath=move_path,
            travel=travel, setup=setup, teardown=teardown,
            start=start, finish=finish, actual=actual, maxRadius=max_radius,
            weightT=weight_t, capacityAtActual=capacity_at_actual, capacityMargin=capacity_margin,
            restricted=restricted, outOfBounds=out_of_bounds, pathBlocked=path_blocked,
            z=getattr(l, 'z', 0.0),
            boomReachRadius=boom_max_r, requiredBoomLen=required_boom,
            teardownStart=teardown_start, teardownFinish=travel_start,
            travelStart=travel_start, travelFinish=setup_start,
            setupStart=setup_start, setupFinish=lift_start,
            liftStart=lift_start, liftFinish=finish,
        )

    def apply_planned_event(self, ci: int, li: int, out: Dict, soft: int = 0,
                             hard: int = 0, restricted_here: int = 0) -> Dict:
        """Append an already-computed outcome to env state as one execution
        event. Mirrors the event-building tail of step() so human_play.py
        doesn't need to duplicate the wide event-dict construction. Returns
        the appended event dict (mutates env state).
        """
        c, l = self.cranes[ci], self.lifts[li]
        event = {
            'craneId': c.id, 'craneIndex': ci, 'liftId': l.id, 'liftIndex': li,
            'start': out['start'], 'finish': out['finish'],
            'teardown': out['teardown'], 'travel': out['travel'], 'setup': out['setup'], 'duration': self._crane_time(ci, 'fixed_duration'),
            'teardownStart': out['teardownStart'], 'teardownFinish': out['teardownFinish'],
            'travelStart': out['travelStart'], 'travelFinish': out['travelFinish'],
            'setupStart': out['setupStart'], 'setupFinish': out['setupFinish'],
            'liftStart': out['liftStart'], 'liftFinish': out['liftFinish'],
            'fromX': c.setup_x, 'fromY': c.setup_y, 'toX': out['sx'], 'toY': out['sy'],
            'radiusCenterX': out['sx'], 'radiusCenterY': out['sy'], 'liftX': l.x, 'liftY': l.y,
            'actualLiftRadius': out['actual'],
            'ratedMaxRadius': out.get('maxRadius', self.crane_radius),
            'loadWeightT': out.get('weightT', self.default_lift_weight_t),
            'capacityAtActualT': out.get('capacityAtActual'),
            'capacityMarginT': out.get('capacityMargin'),
            'craneRadius': self._crane_radius_for(c), 'dangerRadius': self._crane_radius_for(c),
            'sameRadius': out['same'], 'softConflict': int(soft), 'hardMask': int(hard),
            'restrictedMask': int(restricted_here),
            'restrictedViolation': bool(out.get('restricted')), 'move': out['move'],
            'directMove': out.get('directMove', out['move']),
            'restrictedDetourDistance': out.get('detour', 0.0),
            'movePath': [{'x': float(px), 'y': float(py)} for px, py in out.get('movePath', [])],
        }
        self.events.append(event)
        if out.get('restricted'):
            self.restricted_executed_total += 1
        c.setup_x, c.setup_y, c.available, c.jobs = out['sx'], out['sy'], out['finish'], c.jobs + 1
        l.done, l.assigned = True, c.id
        return event

    def _overlaps(self, a_start, a_finish, b_start, b_finish):
        return a_start < b_finish and b_start < a_finish

    def risk_counts(self, out: Dict, planned: Optional[List[Dict]] = None) -> Tuple[int, int]:
        hard = soft = 0
        planned = planned or []
        for e in self.events + planned:
            out_start = out.get('liftStart', out['start'])
            out_finish = out.get('liftFinish', out['finish'])
            e_start = e.get('liftStart', e['start'])
            e_finish = e.get('liftFinish', e['finish'])
            if not self._overlaps(out_start, out_finish, e_start, e_finish):
                continue
            cd = dist((out['sx'], out['sy']), (e['radiusCenterX'], e['radiusCenterY']))
            hard_lim = out['actual'] + e['actualLiftRadius']
            # Candidate crane's own (type-resolved) radius + the event crane's.
            own_ci = out.get('ci')
            own_radius = self._crane_radius_for(self.cranes[own_ci]) if (
                own_ci is not None and own_ci < len(self.cranes)) else self.crane_radius
            soft_lim = own_radius + float(e.get('craneRadius', self.crane_radius))
            if cd < hard_lim - 1e-9:
                hard += 1
            elif cd < soft_lim - 1e-9:
                soft += 1
        return hard, soft

    def apply_step_soft_conflicts(self, events: List[Dict]) -> int:
        """Mark every lift handled by overlapping working-radius cranes in one step.

        This is deliberately step-based rather than hoist-time-based: once two
        cranes are parked with overlapping configured working radii, every lift
        either crane handles in that user/RL step is considered exposed to the
        soft-interference risk. Each lift event contributes at most one count,
        even when its crane overlaps multiple other cranes.
        """
        risky = set()
        for i, a in enumerate(events):
            a_crane = a.get('craneId')
            ax = float(a.get('radiusCenterX', a.get('toX', 0.0)))
            ay = float(a.get('radiusCenterY', a.get('toY', 0.0)))
            ar = float(a.get('craneRadius', self.crane_radius))
            for j in range(i + 1, len(events)):
                b = events[j]
                if a_crane == b.get('craneId'):
                    continue
                bx = float(b.get('radiusCenterX', b.get('toX', 0.0)))
                by = float(b.get('radiusCenterY', b.get('toY', 0.0)))
                br = float(b.get('craneRadius', self.crane_radius))
                if dist((ax, ay), (bx, by)) < ar + br - 1e-9:
                    risky.add(i)
                    risky.add(j)
        for i, event in enumerate(events):
            event['softConflict'] = 1 if i in risky else 0
        return len(risky)

    def _apply_final_teardowns(self, rewards: Optional[np.ndarray] = None):
        for ci, c in enumerate(self.cranes):
            teardown = self._crane_time(ci, 'teardown_time')
            if teardown <= 0 or c.jobs <= 0:
                continue
            last = None
            for e in reversed(self.events):
                if e.get('craneIndex') == ci:
                    last = e
                    break
            if last is None or last.get('finalTeardownApplied'):
                continue
            start = float(last.get('liftFinish', last.get('finish', c.available)))
            finish = start + teardown
            last['finalTeardown'] = teardown
            last['finalTeardownStart'] = start
            last['finalTeardownFinish'] = finish
            last['finalTeardownApplied'] = True
            last['finish'] = max(float(last.get('finish', start)), finish)
            c.available = max(float(c.available), finish)
            if rewards is not None and ci < len(rewards):
                rewards[ci] += self._coef(ci, 'p_time') * teardown

    def candidate_actions(self, ci: int, reserved: Optional[set] = None) -> List[Optional[int]]:
        reserved = reserved or set()
        avail = [i for i, l in enumerate(self.lifts)
                 if not l.done and i not in reserved and not self._height_blocked(i)]
        if not avail:
            return [None] * self.K
        feasible=[]; blocked=[]
        for li in avail:
            out = self.candidate_outcome(ci, li)
            if out.get('restricted'):
                continue
            hard, soft = self.risk_counts(out)
            # Candidate-K composition: same-radius continuity, earliest finish, nearest/move, low risk.
            score = (0 if out['same'] else 1000) + out['finish'] + 0.18*out['move'] + 4*soft
            (blocked if hard>0 else feasible).append((score, li))
        scored = feasible if feasible else blocked
        scored.sort(key=lambda x: x[0])
        cands = [li for _, li in scored[:self.K]]
        return cands + [None] * (self.K - len(cands))

    def heuristic_actions(self, policy: str) -> List[int]:
        """Select deterministic Candidate-K slots for the named baseline policy.

        ``nearest`` ranks lifts by their physical distance from the crane's current
        setup. ``radiusPriority`` first keeps the current setup whenever possible,
        then prefers earlier, lower-risk outcomes with less movement. Keeping this
        policy-specific ranking outside ``candidate_actions`` preserves the feature
        and slot ordering expected by existing MAPPO checkpoints.
        """
        if policy not in ('nearest', 'radiusPriority'):
            raise ValueError(f'unsupported heuristic policy: {policy}')
        actions = []
        for ci, crane in enumerate(self.cranes):
            choices = []
            for action, li in enumerate(self.candidate_actions(ci)):
                if li is None:
                    continue
                lift = self.lifts[li]
                out = self.candidate_outcome(ci, li)
                _, soft = self.risk_counts(out)
                if policy == 'nearest':
                    key = (
                        dist((crane.setup_x, crane.setup_y), (lift.x, lift.y)),
                        out['finish'], soft, out['move'], li,
                    )
                else:
                    key = (
                        0 if out['same'] else 1,
                        out['finish'], soft, out['move'], li,
                    )
                choices.append((key, action))
            actions.append(min(choices, key=lambda item: item[0])[1] if choices else 0)
        return actions

    def action_masks(self):
        masks=[]
        for ci in range(self.nC):
            cands=self.candidate_actions(ci)
            masks.append([li is not None for li in cands])
        return np.array(masks, dtype=np.bool_)

    # Per-candidate feature layout: 5 local + 12 candidate-specific = 17.
    # With cfg['obs_type_features'] on, 4 crane-capability floats are appended
    # (indices 17..20) so the agent can observe its own tonnage class: rated
    # capacity + operation-time ratios. Capability encoding (not a type one-hot)
    # keeps the dimension fixed no matter how many user-defined types exist.
    _OBS_DIM = 17
    _TYPE_FEAT_DIM = 4

    @property
    def obs_dim(self) -> int:
        return self._OBS_DIM + (self._TYPE_FEAT_DIM if self.obs_type_features else 0)

    def _crane_type_obs(self, ci: int) -> List[float]:
        """4 capability floats for crane ci: [max rated capacity /100t,
        fixed_duration ratio, setup ratio, teardown ratio] vs the global values.
        Ratios are 1.0 for untyped cranes and clamped to [0,4]."""
        crane = self.cranes[ci] if ci < len(self.cranes) else None
        curve = self._type_curve_for(crane) or self.crane_capacity_curve
        cap = (max(c for _r, c in curve) / MAX_LIFT_WEIGHT_T) if curve else 0.0
        def ratio(key, global_v):
            g = max(1e-6, float(global_v))
            return min(4.0, max(0.0, self._crane_time(ci, key) / g))
        return [min(1.0, cap),
                ratio('fixed_duration', self.fixed_duration),
                ratio('setup_time', self.setup_time),
                ratio('teardown_time', self.teardown_time)]

    def _fill_candidate_features(self, ci: int, li: Optional[int], row: np.ndarray):
        """Write the 12 candidate-specific floats into `row[5:17]` (local prefix
        is filled by observe()). For li=None, leave zeros — matches the old
        `[0.0]*12` fallback. Replaces the previous list-allocating helper."""
        if li is None:
            return
        l = self.lifts[li]
        out = self.candidate_outcome(ci, li)
        hard, soft = self.risk_counts(out)
        rem = max(1, self.nL - self.done_count())
        nearby = sum(1 for x in self.lifts if not x.done and dist((x.x, x.y), (l.x, l.y)) <= self.crane_radius)
        row[5] = 1.0
        row[6] = 1.0 if out['same'] else 0.0
        row[7] = out['move'] / max(1.0, self.site_width)
        row[8] = out['travel'] / 20.0
        row[9] = out['setup'] / max(1.0, self.setup_time)
        row[10] = out['finish'] / 500.0
        row[11] = out['actual'] / max(1.0, out.get('maxRadius') or self.crane_radius)
        row[12] = hard / 5.0
        row[13] = soft / 5.0
        row[14] = nearby / rem
        row[15] = l.x / max(1.0, self.site_width)
        row[16] = l.y / max(1.0, self.site_height)

    def observe(self):
        # Pre-allocate output arrays once per call rather than building nested Python
        # lists and calling np.array() on them. Saves the list→ndarray conversion
        # overhead (which dominated the tight train-loop path) and gives later code
        # a contiguous buffer to slice into.
        obs = np.zeros((self.nC, self.K, self.obs_dim), dtype=np.float32)
        masks = np.zeros((self.nC, self.K), dtype=np.bool_)
        done_frac = self.done_count() / max(1, self.nL)
        nL_norm = max(1, self.nL)
        for ci, c in enumerate(self.cranes):
            cands = self.candidate_actions(ci)
            # Local-features prefix is identical across all K candidates of this crane;
            # broadcast it into rows once instead of repeating per candidate.
            obs[ci, :, 0] = c.setup_x / max(1.0, self.site_width)
            obs[ci, :, 1] = c.setup_y / max(1.0, self.site_height)
            obs[ci, :, 2] = c.available / 500.0
            obs[ci, :, 3] = c.jobs / nL_norm
            obs[ci, :, 4] = done_frac
            if self.obs_type_features:
                obs[ci, :, self._OBS_DIM:] = self._crane_type_obs(ci)
            for k, li in enumerate(cands):
                if li is not None:
                    masks[ci, k] = True
                    self._fill_candidate_features(ci, li, obs[ci, k])
        return obs, masks, self.global_state()

    def global_state(self):
        av=np.array([c.available for c in self.cranes], dtype=np.float32)
        return np.array([
            self.done_count()/max(1,self.nL),
            (self.nL-self.done_count())/max(1,self.nL),
            av.min()/500.0 if len(av) else 0,
            av.max()/500.0 if len(av) else 0,
            av.mean()/500.0 if len(av) else 0,
            av.std()/500.0 if len(av) else 0,
            self.nC/10.0,
            self.nL/100.0,
            self.K/12.0,
            self.step_count/max(1,self.max_steps),
            sum(e.get('softConflict',0) for e in self.events)/max(1,self.nL),
            sum(e.get('hardMask',0) for e in self.events)/max(1,self.nL),
            sum(e.get('move',0) for e in self.events)/1000.0,
            sum(e.get('setup',0) for e in self.events)/1000.0,
        ], dtype=np.float32)

    def step(self, actions: List[int]):
        self.step_count += 1
        rewards = np.zeros(self.nC, dtype=np.float32)
        planned=[]; used=set(); hard_masks=0; soft_total=0; restricted_masks=0
        order = sorted(range(self.nC), key=lambda i: self.cranes[i].available)
        # Bump the episode-cumulative restricted-mask counter once per restricted lift per
        # step. The previous version did this inside the crane loop, which counted each
        # lift up to nC times when the restriction was lift-position-driven (the common
        # case). Per-event/per-crane counts below are still tracked for visualization.
        for li0, l0 in enumerate(self.lifts):
            if l0.done:
                continue
            if all(self.candidate_outcome(ci, li0).get('restricted') for ci in order):
                self.restricted_mask_total += 1
        for ci in order:
            # Per-crane count for this step's events / per-step diagnostic.
            restricted_here = 0
            for li0, l0 in enumerate(self.lifts):
                if not l0.done and li0 not in used and self.candidate_outcome(ci, li0).get('restricted'):
                    restricted_here += 1
            restricted_masks += restricted_here
            cands = self.candidate_actions(ci, used)
            ai = int(actions[ci]) if ci < len(actions) else 0
            li = cands[ai] if 0 <= ai < len(cands) else None
            if li is None:
                if self.done_count() < self.nL:
                    self.record_idle_step(ci)
                    rewards[ci] += self._coef(ci, 'p_idle')
                continue
            out = self._with_height_wait(li, self.candidate_outcome(ci, li))
            hard, soft = self.risk_counts(out, planned)
            if hard > 0:  # hard overlap is infeasible; try the next feasible candidate before idling.
                hard_masks += hard
                self.hard_mask_total += hard
                replacement = None
                for alt_li in cands:
                    if alt_li is None or alt_li == li or alt_li in used:
                        continue
                    alt = self._with_height_wait(alt_li, self.candidate_outcome(ci, alt_li))
                    alt_hard, alt_soft = self.risk_counts(alt, planned)
                    if alt_hard == 0:
                        replacement = (alt_li, alt, alt_soft)
                        break
                if replacement is None:
                    self.record_idle_step(ci)
                    rewards[ci] += self._coef(ci, 'p_idle')
                    continue
                li, out, soft = replacement
                hard = 0
            c, l = self.cranes[ci], self.lifts[li]
            event = {
                'craneId': c.id, 'craneIndex': ci, 'liftId': l.id, 'liftIndex': li,
                'start': out['start'], 'finish': out['finish'],
                'teardown': out['teardown'], 'travel': out['travel'], 'setup': out['setup'], 'duration': self._crane_time(ci, 'fixed_duration'),
                'teardownStart': out['teardownStart'], 'teardownFinish': out['teardownFinish'],
                'travelStart': out['travelStart'], 'travelFinish': out['travelFinish'],
                'setupStart': out['setupStart'], 'setupFinish': out['setupFinish'],
                'liftStart': out['liftStart'], 'liftFinish': out['liftFinish'],
                'fromX': c.setup_x, 'fromY': c.setup_y, 'toX': out['sx'], 'toY': out['sy'],
                'radiusCenterX': out['sx'], 'radiusCenterY': out['sy'], 'liftX': l.x, 'liftY': l.y,
                'actualLiftRadius': out['actual'],
                'ratedMaxRadius': out.get('maxRadius', self.crane_radius),
                'loadWeightT': out.get('weightT', self.default_lift_weight_t),
                'capacityAtActualT': out.get('capacityAtActual'),
                'capacityMarginT': out.get('capacityMargin'),
                'craneRadius': self._crane_radius_for(c), 'dangerRadius': self._crane_radius_for(c),
                'sameRadius': out['same'], 'softConflict': soft, 'hardMask': hard, 'restrictedMask': restricted_here,
                'restrictedViolation': bool(out.get('restricted')), 'move': out['move'], 'directMove': out.get('directMove', out['move']),
                'restrictedDetourDistance': out.get('detour', 0.0),
                'movePath': [{'x': float(px), 'y': float(py)} for px, py in out.get('movePath', [])]
            }
            planned.append(event); used.add(li); soft_total += soft
            if out.get('restricted'):
                self.restricted_executed_total += 1
            task_time = out['finish'] - out['start']
            rewards[ci] += (self._coef(ci, 'r_single')
                            + (self._coef(ci, 'r_same') if out['same'] else 0.0)
                            + self._coef(ci, 'p_time') * task_time
                            + self._coef(ci, 'p_move') * out['move']
                            + self._coef(ci, 'p_inter_soft') * soft)
            c.setup_x, c.setup_y, c.available, c.jobs = out['sx'], out['sy'], out['finish'], c.jobs+1
            l.done, l.assigned = True, c.id
            self._lift_finish[li] = out['liftFinish']
        self.events.extend(planned)
        old_soft = [int(e.get('softConflict', 0) or 0) for e in planned]
        soft_total = self.apply_step_soft_conflicts(planned)
        for event, old in zip(planned, old_soft):
            ci = int(event.get('craneIndex', 0) or 0)
            new = int(event.get('softConflict', 0) or 0)
            rewards[ci] += self._coef(ci, 'p_inter_soft') * (new - old)
        done = self.is_done()
        if self.done_count() >= self.nL:
            self._apply_final_teardowns(rewards)
            denom = max(1, self.nC)
            for ci in range(self.nC):
                rewards[ci] += self._coef(ci, 'r_all') / denom
        obs, masks, glob = self.observe()
        info = self.summary()
        info['stepHardMask'] = hard_masks
        info['stepSoft'] = soft_total
        info['stepRestrictedMask'] = restricted_masks
        return obs, masks, glob, rewards, done, info

    def summary(self):
        makespan = max([c.available for c in self.cranes] + [0.0])
        reqs = getattr(self, '_height_requires', None)
        # Lower-first precedence pairs (only when height_order_radius is on):
        # liftId -> ids of strictly-lower neighbours that must be erected first.
        height_order = None
        if reqs:
            height_order = {self.lifts[i].id: [self.lifts[j].id for j in pre]
                            for i, pre in enumerate(reqs) if pre}
        return {
            'heightOrderRadius': float(self.height_order_radius),
            'heightOrder': height_order,
            'done': self.done_count(), 'total': self.nL, 'makespan': round(makespan, 3),
            'reward': 0.0, 'softInter': int(sum(e.get('softConflict',0) for e in self.events)),
            'idleStepsPerCrane': list(getattr(self, 'idle_steps_per_crane', []) or []),
            'idleStepsTotal': int(getattr(self, 'idle_steps_total', 0) or 0),
            # NOTE: hardExecuted is structurally always 0 — step() forbids executing a hard-overlap
            # event by always trying a replacement or idling. Kept for schema compatibility with
            # the dashboard and downstream reporting tools. The 1000*hardExecuted term in
            # train.py / curriculum.py checkpoint_selection_score is therefore inactive.
            'hardExecuted': int(self.executed_hard_total),
            'hardMask': int(self.hard_mask_total),
            'hardInter': int(self.hard_mask_total),  # backward-compatible alias
            'restrictedMask': int(self.restricted_mask_total),
            'restrictedExecuted': int(self.restricted_executed_total),
            'restrictedZones': list(self.restricted_zones),
            'travelTotal': sum(e.get('travel',0.0) for e in self.events),
            'setupTotal': sum(e.get('setup',0.0) for e in self.events),
            'teardownTotal': sum(e.get('teardown',0.0) + e.get('finalTeardown',0.0) for e in self.events),
            'moveTotal': sum(e.get('move',0.0) for e in self.events),
            'restrictedDetourDistance': sum(e.get('restrictedDetourDistance',0.0) for e in self.events),
            'actualLiftRadiusAvg': float(np.mean([e['actualLiftRadius'] for e in self.events])) if self.events else 0.0,
            'ratedMaxRadiusAvg': float(np.mean([e.get('ratedMaxRadius', self.crane_radius) for e in self.events])) if self.events else 0.0,
            'loadWeightAvgT': float(np.mean([e.get('loadWeightT', self.default_lift_weight_t) for e in self.events])) if self.events else 0.0,
            'loadWeightMaxT': float(np.max([e.get('loadWeightT', self.default_lift_weight_t) for e in self.events])) if self.events else 0.0,
            'capacityMarginMinT': float(np.min([e.get('capacityMarginT') for e in self.events if e.get('capacityMarginT') is not None])) if any(e.get('capacityMarginT') is not None for e in self.events) else None,
            'softInterferenceRadiusAvg': float(np.mean([e.get('craneRadius', self.crane_radius) for e in self.events])) if self.events else 0.0,
            'actualDangerRadiusAvg': float(np.mean([e['dangerRadius'] for e in self.events])) if self.events else 0.0,
            'events': list(self.events),
            'cranes': [asdict(c) for c in self.cranes],
            'lifts': [asdict(l) for l in self.lifts],
            'siteWidth': float(self.site_width),
            'siteHeight': float(self.site_height),
        }

    def run_policy(self, policy: str, model=None, seed: int = 0, greedy=True):
        self.reset(seed)
        total_reward=0.0
        while not self.is_done():
            obs,masks,glob = self.observe()
            if policy == 'random':
                actions=[self.rng.choice([i for i,m in enumerate(masks[ci]) if m] or [0]) for ci in range(self.nC)]
            elif policy in ('nearest','radiusPriority'):
                actions=self.heuristic_actions(policy)
            elif policy == 'mappo' and model is not None:
                actions=model.act_np(obs,masks,greedy=greedy)
            else:
                actions=[self.rng.choice([i for i,m in enumerate(masks[ci]) if m] or [0]) for ci in range(self.nC)]
            *_ , rewards, done, info = self.step(actions)
            total_reward += float(np.sum(rewards))
        s=self.summary(); s['reward']=total_reward
        return s
