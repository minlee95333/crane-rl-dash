"""Human-play session manager.

Wraps CraneSchedulingEnv so a human can step through a scenario one decision
at a time via /api/game/session/*. The same session can be undone (replays
from start) and finally submitted, which scores the trajectory with the
rule-based scorer and persists the play to disk for later IRL fitting.

Sessions live in process memory; restarting the server drops in-flight
sessions. Only submitted plays are persisted (under human_plays/).
"""
from __future__ import annotations

import json
import functools
import hashlib
import math
import os
import random
import re
import threading
import time
import uuid
from pathlib import Path
from typing import Dict, List, Optional, Tuple

try:
    from crane_core.env import CraneSchedulingEnv
    from crane_core.scorer import score_schedule, DEFAULT_WEIGHTS
    from crane_core.scenarios import get_scenario
    from crane_db import storage as _storage
except ImportError:
    from crane_core.env import CraneSchedulingEnv
    from crane_core.scorer import score_schedule, DEFAULT_WEIGHTS
    from crane_core.scenarios import get_scenario
    from crane_db import storage as _storage

try:
    from .sweep_exec import execute_sweep as _sweep_execute
    from .sweep_exec import hard_conflict_finish as _sweep_hard_conflict_finish
except ImportError:
    from sweep_exec import execute_sweep as _sweep_execute
    from sweep_exec import hard_conflict_finish as _sweep_hard_conflict_finish


ROOT = Path(__file__).resolve().parent.parent
PLAYS_DIR = ROOT / "human_plays"

_SESSIONS: Dict[str, "PlaySession"] = {}
_LOCK = threading.Lock()
SESSION_TTL_SECONDS = max(60, int(os.environ.get("CRANE_GAME_SESSION_TTL", "86400") or 86400))
# 인스턴스가 둘 이상이면(numReplicas > 1) 세션 메모리 캐시를 읽지 않는다 —
# 자세한 이유는 get_session 참고. 배포에서 replica 수를 올릴 때 반드시 함께
# 켜야 하는 플래그다.
MULTI_INSTANCE = str(os.environ.get("CRANE_MULTI_INSTANCE", "")).strip().lower() in (
    "1", "true", "yes", "on",
)
MAX_SESSIONS = max(10, int(os.environ.get("CRANE_GAME_MAX_SESSIONS", "1000") or 1000))
# 닉네임에 허용하는 문자. `가-힣`은 **완성형 음절(U+AC00–U+D7A3)만** 덮으므로
# `ㄱ-ㅣ`(호환 자모 U+3131–U+3163)를 반드시 함께 둬야 한다. 없으면 'ㄷㅎ'·'ㅋㅋ'
# 처럼 낱자로만 된 표시 ID가 통째로 제거돼 'anon'으로 저장된다.
# crane_db.storage의 같은 문자 집합과 일치해야 한다.
_NICK_CHARS = r"A-Za-z0-9가-힣ㄱ-ㅣ_-"
_NICK_RE = re.compile(rf"^[{_NICK_CHARS}]{{1,24}}$")
_ROLE_MAX = 80
# 1-탭 결정 이유 라벨 (IRL 사후 분석용 명시적 동기 신호). 클라이언트가 보내는
# 자유 문자열을 그대로 믿지 않고 화이트리스트로 제한한다.
DECISION_REASONS = {"move_min", "balance", "avoid_interference", "deadline", "other"}

# 플레이가 어느 클라이언트에서 왔는지 (모바일 vs PC). 클라이언트가 세션 시작 시
# 자기 신고하므로 화이트리스트로 제한하고, 미상은 "unknown"으로 남긴다.
CLIENTS = {"mobile", "pc"}


def _safe_client(raw) -> str:
    """Normalize the self-reported client platform to a known value.
    Unknown/absent → 'unknown' (kept explicit so old plays stay distinguishable)."""
    v = str(raw or "").strip().lower()
    return v if v in CLIENTS else "unknown"


def _validate_fleet(cranes, choice: Dict, scen: Dict) -> List[Dict]:
    """Validate a player-chosen fleet for a crane_choice (fleet-sizing) scenario.

    Rules (placement affects COST only — solvability is a map property verified
    offline, see crane_core.fleet): count within choice min/max, every crane
    inside the site and outside every restricted zone (the building footprint).
    Crane ids are reassigned server-side (C1..Ck) — client ids are not trusted.
    Raises ValueError with a user-facing Korean message on any violation."""
    if not isinstance(cranes, list) or not all(isinstance(c, dict) for c in cranes):
        raise ValueError("cranes 형식이 잘못되었습니다 (좌표 목록이어야 합니다)")
    lo = max(1, int(choice.get("min", 1)))
    hi = int(choice.get("max", lo))
    if not (lo <= len(cranes) <= hi):
        raise ValueError(f"크레인 투입 대수는 {lo}~{hi}대여야 합니다")
    cfg = scen.get("config") or {}
    site_w = float(cfg.get("site_width", 100.0))
    site_h = float(cfg.get("site_height", 100.0))
    zones = scen["layout"].get("restrictedZones") or []
    fleet: List[Dict] = []
    for i, c in enumerate(cranes):
        try:
            x, y = float(c.get("x")), float(c.get("y"))
        except (TypeError, ValueError):
            raise ValueError(f"{i + 1}번 크레인 좌표가 잘못되었습니다")
        if not (math.isfinite(x) and math.isfinite(y)):
            raise ValueError(f"{i + 1}번 크레인 좌표가 잘못되었습니다")
        if not (0.0 <= x <= site_w and 0.0 <= y <= site_h):
            raise ValueError(f"{i + 1}번 크레인이 부지를 벗어났습니다")
        for z in zones:
            x1, x2 = sorted((float(z.get("x1", 0)), float(z.get("x2", 0))))
            y1, y2 = sorted((float(z.get("y1", 0)), float(z.get("y2", 0))))
            if x1 <= x <= x2 and y1 <= y <= y2:
                raise ValueError(f"{i + 1}번 크레인이 현장 경계(제한구역) 안에 있습니다")
        fleet.append({"id": f"C{i + 1}", "x": round(x, 2), "y": round(y, 2)})
    return fleet


def _safe_nick(raw) -> str:
    """Clean a nickname to a filesystem-safe form. Empty/invalid → 'anon'."""
    if not raw:
        return "anon"
    raw = str(raw).strip()
    if not _NICK_RE.match(raw):
        # strip everything except allowed characters (_NICK_CHARS에서 파생 —
        # 문자 집합을 두 곳에 적으면 한쪽만 고쳐져 조용히 어긋난다)
        cleaned = re.sub(rf"[^{_NICK_CHARS}]", "", raw)
        return cleaned[:24] or "anon"
    return raw


def _clamp_int(v, lo, hi, default=0):
    try:
        return max(lo, min(hi, int(v)))
    except (TypeError, ValueError):
        return default


def _sanitize_step_meta(meta) -> Dict:
    """Whitelist + clamp the client's per-step behaviour telemetry. Never trust
    raw client numbers — bound them so the log can't be inflated."""
    if not isinstance(meta, dict):
        return {}
    out = {
        "dt_ms": _clamp_int(meta.get("dt_ms"), 0, 3_600_000),       # ≤ 1h per step
        "interactions": _clamp_int(meta.get("interactions"), 0, 100_000),
        "mode": meta.get("mode") if meta.get("mode") in ("sweep", "pick") else None,
        "undo_used": bool(meta.get("undo_used")),
    }
    reason = meta.get("reason")
    if reason in DECISION_REASONS:
        out["reason"] = reason
    return out


def _sanitize_session_telemetry(t) -> Dict:
    """Whitelist + clamp the session-level behaviour summary sent at submit."""
    if not isinstance(t, dict):
        return {}
    undos = t.get("undos")
    undos = [_clamp_int(x, 0, 3_600_000) for x in undos[:500]] if isinstance(undos, list) else []
    return {
        "pointer_events": _clamp_int(t.get("pointer_events"), 0, 1_000_000),
        "mode_switches": _clamp_int(t.get("mode_switches"), 0, 100_000),
        "zoom_events": _clamp_int(t.get("zoom_events"), 0, 1_000_000),
        "undos": undos,
    }


# Raw timestamped event stream — the "collect everything now, derive features
# later" log. Schema is intentionally open (any event {t, type, ...}), so we
# sanitize generically instead of by a fixed field list: cap the count, keep
# scalars only, clamp numbers, truncate strings, and limit fields per event.
_EVENTS_MAX = 20_000
_EVENT_FIELDS_MAX = 16
_EVENT_STR_MAX = 120


def _sanitize_event_value(v):
    if isinstance(v, bool):
        return v
    if isinstance(v, int):
        return max(-1_000_000_000, min(1_000_000_000, v))
    if isinstance(v, float):
        if v != v or v in (float("inf"), float("-inf")):
            return 0.0
        return round(max(-1e9, min(1e9, v)), 3)
    if isinstance(v, str):
        return v[:_EVENT_STR_MAX]
    return None  # drop nested objects/arrays — keep the log flat & cheap


def _sanitize_events(events) -> list:
    if not isinstance(events, list):
        return []
    out = []
    for e in events[:_EVENTS_MAX]:
        if not isinstance(e, dict):
            continue
        clean = {"t": _clamp_int(e.get("t"), 0, 86_400_000)}  # ms since session start (≤24h)
        typ = e.get("type")
        clean["type"] = str(typ)[:40] if typ is not None else "unknown"
        n = 0
        for k, val in e.items():
            if k in ("t", "type"):
                continue
            if n >= _EVENT_FIELDS_MAX:
                break
            sv = _sanitize_event_value(val)
            if sv is not None:
                clean[str(k)[:40]] = sv
                n += 1
        out.append(clean)
    return out


def _session_locked(method):
    @functools.wraps(method)
    def wrapped(self, *args, **kwargs):
        with self._session_lock:
            result = method(self, *args, **kwargs)
            self.last_active_at = time.time()
            return result
    return wrapped


class PlaySession:
    """Single human-play session for one scenario.

    The env is fully rebuilt from the scenario each time the user undoes,
    then all preceding accepted actions are replayed. Scenarios are small
    enough (<=20 lifts) that replay-based undo is simpler than snapshotting
    env internals.
    """

    def __init__(self, scenario_id: str, tier: str, nickname: str, role: str = "",
                 user: Optional[Dict] = None, order_mode: bool = False,
                 order_seed: str = "", client: str = "",
                 cranes: Optional[List[Dict]] = None,
                 research_context: Optional[Dict] = None):
        scen = get_scenario(scenario_id)
        if not scen:
            raise ValueError(f"unknown scenario: {scenario_id}")
        user = user or {}
        # Fleet-sizing maps (scenario carries crane_choice): the player picked
        # the crane count + parking spots before starting. Validate and swap the
        # fleet into the (deep-copied) scenario so env build / replay / the
        # persisted play doc all see the chosen fleet. None → default fleet.
        self.fleet_override: Optional[List[Dict]] = None
        if cranes is not None:
            choice = scen.get("crane_choice")
            if not choice:
                raise ValueError("이 시나리오는 크레인 투입 대수를 선택할 수 없습니다")
            self.fleet_override = _validate_fleet(cranes, choice, scen)
            scen["layout"]["cranes"] = [dict(c) for c in self.fleet_override]
        self._session_lock = threading.RLock()
        self.session_id: str = uuid.uuid4().hex[:16]
        self.scenario = scen
        self.scenario_id = scenario_id
        self.tier = tier
        # Random-order variant: when on, the player must lift in a seeded-random
        # erection order (see _init_precedence). order_seed makes the order
        # reproducible across restarts/share-codes; falls back to scenario_id.
        # A scenario may opt in directly (order_mode flag baked into its spec),
        # so dedicated "순서" scenarios play in order without any client toggle.
        self.order_mode = bool(order_mode) or bool(scen.get("order_mode"))
        self.order_seed = str(order_seed or "")
        self.user_id = str(user.get("id") or "") or None
        self.display_name = _safe_nick(user.get("display_name") or nickname)
        self.nickname = _safe_nick(nickname)
        self.role = str(role or "")[:_ROLE_MAX]
        # 플랫폼 구분 (모바일/PC). IRL·분석에서 클라이언트별 필터링에 쓴다.
        self.client = _safe_client(client)
        rc = research_context if isinstance(research_context, dict) else {}
        self.research_context = {
            key: rc.get(key)
            for key in (
                "participant_id",
                "study_id",
                "study_version",
                "consent_version",
                "consented_at",
                "scenario_order",
            )
            if rc.get(key) is not None
        }
        self.play_purpose = "research" if rc.get("play_purpose") == "research" else "general"
        self.started_at = time.time()
        self.last_active_at = self.started_at
        # Accepted user step decisions (each step = dict {crane_id: lift_id or None})
        self.user_steps: List[Dict] = []
        # Behaviour log, kept SEPARATE from user_steps so it never affects replay.
        # step_meta is index-aligned with user_steps: each entry is the client's
        # per-step telemetry (deliberation time, interaction count, mode, undo flag).
        # behavior_session holds the session-level summary set at submit time.
        self.step_meta: List[Dict] = []
        self.behavior_session: Dict = {}
        # Raw timestamped event stream (client sends the whole log at submit).
        self.events_log: List[Dict] = []
        # Undo count for telemetry
        self.undo_count = 0
        self.submitted = False
        # Events appended during the most recent submit_step call. Used by the
        # frontend to animate the just-completed step (crane movePath, hoist).
        # Empty until the first step; cleared on undo/restart so stale frames
        # don't replay when the session jumps back in history.
        self._last_step_events: List[Dict] = []
        self.env: CraneSchedulingEnv = self._build_env()
        self._reset_env()
        self._init_precedence()

    # ------------------------------------------------------------------
    # env construction / replay

    def _build_env(self) -> CraneSchedulingEnv:
        cfg = dict(self.scenario["config"])
        # Force unrestricted candidate list for human play so the user can
        # pick any non-done lift (env.candidate_actions returns scored[:K]).
        nL = len(self.scenario["layout"]["lifts"])
        cfg["candidate_k"] = max(int(cfg.get("candidate_k", nL)), nL)
        cfg["num_cranes"] = len(self.scenario["layout"]["cranes"])
        cfg["num_lifts"] = nL
        return CraneSchedulingEnv(cfg)

    def _reset_env(self):
        layout = self.scenario["layout"]
        self.env.reset_layout(
            layout["cranes"],
            layout["lifts"],
            layout.get("restrictedZones") or [],
        )

    # ------------------------------------------------------------------
    # erection precedence (steel-frame scenarios; no-op for ordinary maps)

    def _init_precedence(self):
        """Build the erection-order maps from the layout. Scenarios without a
        ``requires`` field on their lifts (every ordinary map) produce empty
        maps → no gating, identical behavior to before. Kept here in the
        PlaySession layer so the core env and MAPPO training stay
        precedence-free; only human play enforces construction order."""
        self._requires: Dict[str, List[str]] = {}
        self._member_meta: Dict[str, Dict] = {}
        self._has_precedence = False
        # Random-order variant: the seeded erection order (lift ids, rank 0..N-1).
        # None on ordinary/structural maps. _locked_ids gates on this when set.
        self._order_perm: Optional[List[str]] = None
        for l in self.scenario["layout"]["lifts"]:
            reqs = [str(r) for r in (l.get("requires") or [])]
            self._requires[l["id"]] = reqs
            if reqs:
                self._has_precedence = True
            meta = {k: l[k] for k in ("member_type", "seq", "floor", "span") if k in l}
            if meta:
                self._member_meta[l["id"]] = meta
        # Random-order mode only applies when the scenario has no structural
        # precedence of its own (we never override a steel-frame DAG).
        if self.order_mode and not self._has_precedence:
            self._apply_random_order()

    def _apply_random_order(self):
        """Impose a seeded-random *partial* order: a subset of lifts must be
        worked in a fixed relative sequence (a precedence chain), while every
        other lift stays unconstrained and can be lifted anytime.

        Only the ordered subset gets a 1-based ``seq`` (so the UI numbers just
        those crates/discs) and a ``requires`` chain entry (each ordered lift
        waits on the previous one). Because the rest are free, a 1-wide chain
        doesn't serialize multi-crane play — idle cranes always have free lifts
        to take. ``self._order_perm`` records the ordered subset (in sequence)
        for telemetry/persistence. Deterministic in the seed.

        Subset size: scenario ``order_count`` if given, else ~40% of lifts
        (min 2, and always leaving at least one free lift)."""
        lifts = self.scenario["layout"]["lifts"]
        ids = [str(l["id"]) for l in lifts]
        n = len(ids)
        if n < 3:
            return  # too few lifts for a meaningful "some ordered, some free"
        seed_src = f"{self.order_seed or self.scenario_id}|{self.scenario_id}|{n}"
        seed_int = int(hashlib.sha256(seed_src.encode("utf-8")).hexdigest()[:16], 16)
        rng = random.Random(seed_int)
        want = self.scenario.get("order_count")
        if want is None:
            want = round(n * 0.4)
        m = max(2, min(int(want), n - 1))  # ≥2 ordered, ≥1 left free
        ordered = rng.sample(ids, m)       # the subset, in its imposed sequence
        for rank, lid in enumerate(ordered):
            # chain: each ordered lift waits on the previous ordered one. The
            # first is free to start; non-subset lifts keep their empty requires.
            self._requires[lid] = [ordered[rank - 1]] if rank > 0 else []
            meta = dict(self._member_meta.get(lid) or {})
            meta["seq"] = rank + 1
            self._member_meta[lid] = meta
        self._has_precedence = True
        self._order_perm = ordered

    def _locked_ids(self) -> set:
        """Lift ids whose erection prerequisites are not all completed yet —
        these are not legal candidates and render as locked in the UI. Covers
        both steel-frame DAGs and the partial-order subset chain; lifts with no
        ``requires`` (every free lift) are never locked."""
        if not self._has_precedence:
            return set()
        done = {l.id for l in self.env.lifts if l.done}
        return {
            lid for lid, reqs in self._requires.items()
            if reqs and not all(r in done for r in reqs)
        }

    def _replay(self):
        """Rebuild env from scratch and apply all accepted user_steps.
        Each step is in the rich normalized shape produced by
        _normalize_decision (auto vs custom setup is preserved)."""
        self._reset_env()
        saved = self.user_steps
        self.user_steps = []
        for step_decisions in saved:
            # _apply_saved_step dispatches by recorded mode (pick vs sweep);
            # both validate, mutate env, and append to user_steps.
            self._apply_saved_step(step_decisions)
        # Replay reconstructs state; it is not a new user action. Do not expose
        # the last replayed step as fresh animation data in the undo response.
        self._last_step_events = []

    # ------------------------------------------------------------------
    # action translation

    def _normalize_decision(self, raw) -> Dict:
        """Normalize a per-crane decision into {lift_id, setup_x?, setup_y?, reason?}.

        Accepted shapes:
          - None / '' / '__idle__'         → {lift_id: None}
          - 'L4'                            → {lift_id: 'L4'} (auto setup)
          - {'lift_id': 'L4'}               → {lift_id: 'L4'} (auto setup)
          - {'lift_id': 'L4', 'setup_x': .., 'setup_y': ..} → user-supplied
          - {'lift_id': 'L4', 'reason': 'move_min'} → optional 1-tap motive
            label (DECISION_REASONS whitelist) — flows into actions for IRL
        """
        if raw in (None, '', '__idle__'):
            return {'lift_id': None}
        if isinstance(raw, str):
            return {'lift_id': raw}
        if isinstance(raw, dict):
            lift_id = raw.get('lift_id') or raw.get('liftId')
            if not lift_id:
                return {'lift_id': None}
            out: Dict = {'lift_id': str(lift_id)}
            if raw.get('setup_x') is not None and raw.get('setup_y') is not None:
                out['setup_x'] = float(raw['setup_x'])
                out['setup_y'] = float(raw['setup_y'])
            reason = raw.get('reason')
            if isinstance(reason, str) and reason in DECISION_REASONS:
                out['reason'] = reason
            # 헤지테이션 메타 — step 시작→최종 선택까지 ms, 후보 변경 횟수.
            # 행동에는 영향 없는 관측치라 클램프만 하고 그대로 영속화한다.
            for key, cap in (('think_ms', 3_600_000), ('switches', 1000)):
                val = raw.get(key)
                if isinstance(val, (int, float)) and not isinstance(val, bool):
                    out[key] = max(0, min(int(val), cap))
            return out
        raise ValueError(f"unsupported decision shape: {raw!r}")

    def _execute_step_with_setups(self, decisions: Dict[str, Dict]):
        """Apply one step honoring user-supplied setup positions where given,
        otherwise falling back to env.candidate_outcome's auto setup.

        Mirrors env.step's order (earliest-available crane first) and its
        bookkeeping (events list, restricted/hard/soft totals). Raises
        ValueError on validation failure BEFORE mutating env state.
        """
        env = self.env
        order = sorted(range(env.nC), key=lambda i: env.cranes[i].available)
        crane_id_by_idx = {i: c.id for i, c in enumerate(env.cranes)}
        lift_idx_by_id = {l.id: i for i, l in enumerate(env.lifts)}
        locked = self._locked_ids()
        # Phase 1: precompute outcomes + validate everything (no env mutation)
        planned: List[Dict] = []
        idle_cis: set = set()
        used: set = set()
        soft_total = 0
        any_assigned = False
        for ci in order:
            crane_id = crane_id_by_idx[ci]
            decision = decisions.get(crane_id, {'lift_id': None})
            lift_id = decision.get('lift_id')
            if not lift_id:
                idle_cis.add(ci)
                continue
            any_assigned = True
            li = lift_idx_by_id.get(lift_id)
            if li is None:
                raise ValueError(f"unknown lift id: {lift_id}")
            if env.lifts[li].done:
                raise ValueError(f"lift {lift_id} is already completed")
            if lift_id in locked:
                raise ValueError(f"lift {lift_id} 은(는) 선행 부재가 완료되어야 양중할 수 있습니다")
            if li in used:
                raise ValueError(f"lift {lift_id} already assigned to another crane in this step")
            if 'setup_x' in decision and 'setup_y' in decision:
                out = env.outcome_for_setup(ci, li, decision['setup_x'], decision['setup_y'])
            else:
                # Fall back to the auto-selected setup point.
                out = env.candidate_outcome(ci, li)
            if out.get('restricted'):
                cap = out.get('capacityMargin')
                if out.get('outOfBounds'):
                    reason = (
                        f"크레인 {crane_id}의 setup 위치가 현장 경계 "
                        f"(0~{env.site_width:.1f}, 0~{env.site_height:.1f}) 밖에 있습니다"
                    )
                elif out.get('pathBlocked'):
                    reason = f"크레인 {crane_id}의 이동 경로가 제한구역을 가로지릅니다"
                elif cap is not None and cap < -1e-6:
                    reason = (
                        f"크레인 {crane_id}{'(드래그 위치)' if 'setup_x' in decision else ''}에서 "
                        f"{lift_id}({out.get('weightT'):.1f}t)는 정격 초과 — "
                        f"정격 {out.get('capacityAtActual'):.1f}t (여유 {cap:+.1f}t)"
                    )
                elif out.get('actual', 0) > out.get('maxRadius', 0) + 1e-6:
                    reason = (
                        f"크레인 {crane_id} 위치가 {lift_id}의 허용반경 "
                        f"{out.get('maxRadius'):.1f}m를 초과 (실제 {out.get('actual'):.1f}m)"
                    )
                else:
                    reason = f"크레인 {crane_id}의 위치가 제한구역 또는 정격 곡선 밖에 있습니다"
                raise ValueError(reason)
            # Hard interference vs other already-planned events of THIS step.
            # risk_counts reads event-shaped dicts; build a minimal one per planned out.
            planned_events_for_risk = [{
                'start': p['out']['start'], 'finish': p['out']['finish'],
                'liftStart': p['out']['liftStart'], 'liftFinish': p['out']['liftFinish'],
                'radiusCenterX': p['out']['sx'], 'radiusCenterY': p['out']['sy'],
                'actualLiftRadius': p['out']['actual'],
                'craneRadius': env.crane_radius,
            } for p in planned]
            hard, soft = env.risk_counts(out, planned_events_for_risk)
            if hard > 0:
                raise ValueError(
                    f"크레인 {crane_id}의 위치가 다른 크레인의 양중반경과 충돌합니다 (hard interference)"
                )
            used.add(li)
            planned.append({'ci': ci, 'li': li, 'out': out, 'soft': soft})
            soft_total += soft
        if not any_assigned:
            raise ValueError("적어도 한 크레인에는 양중을 배정해야 합니다")
        # Phase 2: apply (mutates env). Order matters — replicate the order list.
        env.step_count += 1
        planned_by_ci = {p['ci']: p for p in planned}
        for ci in order:
            p = planned_by_ci.get(ci)
            if p is None:
                if ci in idle_cis and env.done_count() < env.nL:
                    env.record_idle_step(ci)
                continue
            event = env.apply_planned_event(p['ci'], p['li'], p['out'],
                                              soft=p['soft'], hard=0)
            p['event'] = event
        if env.done_count() >= env.nL:
            env._apply_final_teardowns(rewards=None)

    def _decisions_to_action_vector(self, decisions: Dict[str, Optional[str]]) -> List[int]:
        """Translate {crane_id: lift_id_or_None} into the slot-action vector
        expected by env.step. Mirrors env.step's processing order (earliest-
        available crane first) so candidate slot indices align."""
        env = self.env
        order = sorted(range(env.nC), key=lambda i: env.cranes[i].available)
        used: set = set()
        actions = [0] * env.nC
        crane_idx_by_id = {c.id: i for i, c in enumerate(env.cranes)}
        lift_idx_by_id = {l.id: i for i, l in enumerate(env.lifts)}
        for ci in order:
            crane_id = env.cranes[ci].id
            chosen_lift_id = decisions.get(crane_id)
            cands = env.candidate_actions(ci, used)
            if chosen_lift_id in (None, "", "__idle__"):
                # find a None slot for clean idling; if there is none (all K
                # slots filled with real candidates), fall through to 0 — the
                # crane will pick whatever cands[0] is. The user explicitly
                # chose to idle so this is acceptable noise.
                actions[ci] = next((s for s, li in enumerate(cands) if li is None), 0)
                continue
            li_idx = lift_idx_by_id.get(chosen_lift_id)
            if li_idx is None:
                raise ValueError(f"unknown lift id: {chosen_lift_id}")
            if env.lifts[li_idx].done:
                raise ValueError(f"lift {chosen_lift_id} is already completed")
            if li_idx in used:
                raise ValueError(f"lift {chosen_lift_id} already assigned to another crane in this step")
            if li_idx not in cands:
                # Could happen if candidate K filtered it out. Should not
                # happen for human play (K = nL) but we surface the error
                # clearly anyway.
                raise ValueError(f"lift {chosen_lift_id} is not a legal candidate for crane {crane_id}")
            actions[ci] = cands.index(li_idx)
            used.add(li_idx)
        return actions

    # ------------------------------------------------------------------
    # public state snapshot

    def candidates_by_crane(self) -> Dict[str, List[Dict]]:
        """Per-crane list of currently legal lift candidates (id, weight, x, y,
        soft conflict count, finish time, same-radius flag). Excludes done
        lifts. Used by the frontend to render each crane's option list."""
        env = self.env
        locked = self._locked_ids()
        out: Dict[str, List[Dict]] = {}
        for ci, c in enumerate(env.cranes):
            cands_idxs = env.candidate_actions(ci)
            cand_list = []
            for li in cands_idxs:
                if li is None:
                    continue
                lift = env.lifts[li]
                # Erection precedence: a lift whose prerequisites aren't all done
                # is not yet a legal candidate (steel-frame maps only).
                if lift.id in locked:
                    continue
                out_outcome = env.candidate_outcome(ci, li)
                hard, soft = env.risk_counts(out_outcome)
                cand = {
                    "lift_id": lift.id,
                    "lift_x": lift.x,
                    "lift_y": lift.y,
                    "weight_t": lift.weight_t,
                    "z": float(getattr(lift, "z", 0.0)),  # 2.5D placement height (m)
                    "finish": round(float(out_outcome.get("finish", 0.0)), 2),
                    "move": round(float(out_outcome.get("move", 0.0)), 2),
                    "soft_conflict": int(soft),
                    "hard_conflict": int(hard),
                    "same_radius": bool(out_outcome.get("same")),
                    "rated_capacity_t": (
                        None if out_outcome.get("capacityAtActual") is None
                        else round(float(out_outcome["capacityAtActual"]), 2)
                    ),
                    "rated_margin_t": (
                        None if out_outcome.get("capacityMargin") is None
                        else round(float(out_outcome["capacityMargin"]), 2)
                    ),
                    "restricted": bool(out_outcome.get("restricted")),
                    # Frontend uses these to render the draggable setup handle.
                    "max_radius": round(float(out_outcome.get("maxRadius") or env.crane_radius), 2),
                    "auto_setup_x": round(float(out_outcome.get("sx", 0.0)), 2),
                    "auto_setup_y": round(float(out_outcome.get("sy", 0.0)), 2),
                    # Phase 2 — timing + actual radius so the client can preview
                    # hard/soft interference *before* the user finalizes a step.
                    # Mirrors env.risk_counts inputs (liftStart/liftFinish + actual).
                    "start": round(float(out_outcome.get("start", 0.0)), 2),
                    "lift_start": round(float(out_outcome.get("liftStart", 0.0)), 2),
                    "lift_finish": round(float(out_outcome.get("liftFinish", 0.0)), 2),
                    "actual": round(float(out_outcome.get("actual", 0.0)), 2),
                }
                # Steel-frame: surface erection order + member kind on the
                # candidate so the UI can label the button (absent on other maps).
                meta = self._member_meta.get(lift.id)
                if meta:
                    cand["seq"] = meta.get("seq")
                    cand["member_type"] = meta.get("member_type")
                cand_list.append(cand)
            out[c.id] = cand_list
        return out

    # Why a still-unfinished lift is missing from a crane's candidate list.
    # Order matters: the first matching cause wins (a height/order lock hides a
    # lift from every crane, so it is checked before the per-crane geometry).
    BLOCK_HEIGHT = "height"          # 높이 순서 규칙 — 아래층/위층이 먼저
    BLOCK_ORDER = "order"            # 시공 순서·순번 잠김
    BLOCK_CAPACITY = "capacity"      # 정격하중 초과 (어떤 반경에서도 불가)
    BLOCK_REACH = "reach"            # 도달 불가 — 제한구역/부지 밖/붐 길이
    BLOCK_INTERFERENCE = "interference"  # 다른 크레인 작업과 hard 간섭

    def _blocked_reason(self, ci: int, li: int, locked: set) -> Optional[str]:
        """Reason crane ``ci`` cannot take lift ``li`` right now, or None when it
        can. Mirrors the filters in env.candidate_actions + candidates_by_crane
        so the client never has to guess (it used to show "남은 양중 없음" for a
        crane whose options were merely blocked)."""
        env = self.env
        lift = env.lifts[li]
        if lift.done:
            return None
        if env._height_blocked(li):
            return self.BLOCK_HEIGHT
        if lift.id in locked:
            return self.BLOCK_ORDER
        out = env.candidate_outcome(ci, li)
        if out.get("restricted"):
            margin = out.get("capacityMargin")
            if (margin is not None and margin < -1e-6) or float(out.get("maxRadius") or 0.0) < -1e-9:
                return self.BLOCK_CAPACITY
            return self.BLOCK_REACH
        hard, _ = env.risk_counts(out)
        # candidate_actions serves `feasible if feasible else blocked`, so a
        # hard-conflict lift disappears entirely as soon as the crane has one
        # conflict-free option — the case that reads as "크레인이 인식 못한다".
        return self.BLOCK_INTERFERENCE if hard else None

    def blocked_by_crane(self, candidates: Optional[Dict[str, List[Dict]]] = None) -> Dict[str, Dict[str, str]]:
        """Per-crane {lift_id: reason} for unfinished lifts that are NOT in that
        crane's candidate list. Complements candidates_by_crane so the UI can
        explain an empty or short option list instead of misreporting it.

        Pass the already-built candidate map to avoid recomputing it (state()
        does)."""
        env = self.env
        locked = self._locked_ids()
        candidates = self.candidates_by_crane() if candidates is None else candidates
        out: Dict[str, Dict[str, str]] = {}
        for ci, crane in enumerate(env.cranes):
            shown = {c["lift_id"] for c in (candidates.get(crane.id) or [])}
            blocked: Dict[str, str] = {}
            for li, lift in enumerate(env.lifts):
                if lift.done or lift.id in shown:
                    continue
                reason = self._blocked_reason(ci, li, locked)
                if reason:
                    blocked[lift.id] = reason
            out[crane.id] = blocked
        return out

    def crane_status(self) -> List[Dict]:
        """Per-crane live status — position, available time, job count."""
        return [
            {
                "id": c.id,
                "x": round(c.x, 2),
                "y": round(c.y, 2),
                "setup_x": round(c.setup_x, 2),
                "setup_y": round(c.setup_y, 2),
                "available": round(c.available, 2),
                "jobs": c.jobs,
                "type": c.type,
            }
            for c in self.env.cranes
        ]

    def lift_status(self) -> List[Dict]:
        locked = self._locked_ids()
        out = []
        for l in self.env.lifts:
            row = {
                "id": l.id,
                "x": l.x,
                "y": l.y,
                "weight_t": l.weight_t,
                "z": float(getattr(l, "z", 0.0)),  # 2.5D placement height (m); 0 = ground
                "done": l.done,
                "assigned": l.assigned,
            }
            # Steel-frame extras (member geometry + erection order). Absent on
            # ordinary maps so their state payload is unchanged.
            meta = self._member_meta.get(l.id)
            if meta:
                row.update(meta)  # member_type, seq, floor, span
                row["locked"] = l.id in locked
            out.append(row)
        return out

    def interference_events(self) -> List[Dict]:
        """Compact geometry and hoist timing for live interference previews."""
        return [
            {
                "event_id": f"{e.get('craneId')}:{e.get('liftId')}:{idx}",
                "crane_id": e.get("craneId"),
                "lift_id": e.get("liftId"),
                "setup_x": float(e.get("radiusCenterX", e.get("toX", 0.0))),
                "setup_y": float(e.get("radiusCenterY", e.get("toY", 0.0))),
                "actual_radius": float(e.get("actualLiftRadius", 0.0)),
                "lift_start": float(e.get("liftStart", e.get("start", 0.0))),
                "lift_finish": float(e.get("liftFinish", e.get("finish", 0.0))),
            }
            for idx, e in enumerate(self.env.events)
        ]

    def raw_counters(self) -> Dict:
        """Plain non-weighted counters shown to the user mid-play.

        IMPORTANT: do NOT compute the weighted scorer total here. Surfacing
        a weighted score during play would anchor the user toward the
        current weights and defeat the IRL signal (see design doc §0).
        """
        env = self.env
        summary = env.summary()
        per_jobs = {c.id: c.jobs for c in env.cranes}
        per_busy: Dict[str, float] = {c.id: 0.0 for c in env.cranes}
        for e in env.events:
            cid = str(e.get("craneId") or "")
            if cid in per_busy:
                per_busy[cid] += (
                    float(e.get("teardown", 0) or 0)
                    + float(e.get("finalTeardown", 0) or 0)
                    + float(e.get("travel", 0) or 0)
                    + float(e.get("setup", 0) or 0)
                    + float(e.get("duration", 0) or 0)
                )
        jobs_vals = list(per_jobs.values())
        busy_vals = list(per_busy.values()) if per_busy else [0.0]
        return {
            "done": summary["done"],
            "total": summary["total"],
            "makespan": summary["makespan"],
            "soft_interference_count": summary["softInter"],
            "idle_steps_total": summary.get("idleStepsTotal", 0),
            "idle_steps_per_crane": summary.get("idleStepsPerCrane") or [],
            "restricted_executed": summary["restrictedExecuted"],
            "per_crane_jobs": per_jobs,
            "per_crane_busy": {k: round(v, 2) for k, v in per_busy.items()},
            "job_balance_min_max": [int(min(jobs_vals)), int(max(jobs_vals))] if jobs_vals else [0, 0],
            "time_balance_min_max": [round(min(busy_vals), 2), round(max(busy_vals), 2)],
        }

    @_session_locked
    def state(self) -> Dict:
        """Full state snapshot the frontend uses to re-render after each step."""
        candidates = self.candidates_by_crane()
        return {
            "session_id": self.session_id,
            "scenario_id": self.scenario_id,
            "tier": self.tier,
            "nickname": self.nickname,
            # Random-order variant flag — the client uses it to show the
            # "지정된 순서로만 양중" banner and to keep the #seq tags prominent.
            "order_mode": self.order_mode,
            "step": len(self.user_steps),
            "undo_count": self.undo_count,
            "is_done": bool(self.env.is_done()),
            "cranes": self.crane_status(),
            "lifts": self.lift_status(),
            "candidates_by_crane": candidates,
            # {crane_id: {lift_id: reason}} for unfinished lifts this crane can't
            # take right now. Without it the client had to guess, and guessed
            # wrong: an empty list rendered as "남은 양중 없음" and the mobile
            # lift diagnosis blamed 제한구역/도달 for what was really a hard
            # interference with the other crane's current job.
            "blocked_by_crane": self.blocked_by_crane(candidates),
            "interference_events": self.interference_events(),
            "restricted_zones": [
                {
                    "id": z.get("id"),
                    "x1": z["x1"], "y1": z["y1"], "x2": z["x2"], "y2": z["y2"],
                }
                for z in self.env.restricted_zones
            ],
            "raw_counters": self.raw_counters(),
            "site_width": self.env.site_width,
            "site_height": self.env.site_height,
            # crane_radius is the soft-interference threshold (operating swing
            # radius). The client uses it to flag soft conflicts in candidate
            # previews; hard threshold is computed per-candidate from `actual`.
            "crane_radius": float(self.env.crane_radius),
            # Rated-load curve actually enforced by this session's env — [] when
            # the scenario has none (standard/tutorial tiers). The client uses it
            # for the capacity reference panel and the 3D replay LMI readout, so
            # it must reflect the session env, not the trainer editor's curve.
            "crane_capacity_curve": [
                {"radius": float(r), "capacityT": float(c)}
                for (r, c) in self.env.display_capacity_curve()
            ],
            # Events that the most recent submit_step appended. Empty unless
            # the previous call was a step (start/undo/restart clear this). The
            # client uses these to animate the just-completed step.
            "last_step_events": list(self._last_step_events),
        }

    # ------------------------------------------------------------------
    # session ops

    @_session_locked
    def submit_step(self, decisions: Dict):
        """Accept a step. `decisions[crane_id]` can be:
          - None / '' / '__idle__': idle that crane this step
          - 'L4' (lift id string): assign that lift with auto setup
          - {'lift_id': 'L4'}: same as above
          - {'lift_id': 'L4', 'setup_x': 30.0, 'setup_y': 45.5}: user-supplied
            crane setup position

        Validates first; only mutates env on success. Raises ValueError on
        invalid input. Returns the new state dict.
        """
        if self.env.is_done():
            raise ValueError("session already finished")
        normalized = {c.id: self._normalize_decision(decisions.get(c.id)) for c in self.env.cranes}
        # All steps go through _execute_step_with_setups so the user gets the
        # SAME strict feedback whether they dragged a setup point or not. env.step's
        # behavior of silently swapping a hard-interfering lift for a feasible
        # alternative is desirable for RL training but confusing in a human-play
        # UI ("I clicked L5 but it executed L3?"); we surface a clear error here
        # instead. The auto branch in _execute_step_with_setups uses
        # env.candidate_outcome so the auto setup math is unchanged.
        prev_event_count = len(self.env.events)
        self._execute_step_with_setups(normalized)
        self.env.apply_step_soft_conflicts(self.env.events[prev_event_count:])
        # Capture the events that the step just appended so the client can
        # animate them. _summarize_event() trims the dict to the fields the
        # animation actually needs (movePath + timing markers + ids).
        self._last_step_events = [
            self._summarize_event(e) for e in self.env.events[prev_event_count:]
        ]
        # Persist the normalized decisions so undo / replay reproduces the
        # exact trajectory (including custom setup positions).
        self.user_steps.append(normalized)
        state = self.state()
        persist_session(self)
        return state

    # ------------------------------------------------------------------
    # Sweep mode (drag-to-park): one button press = every crane works ALL
    # reachable not-done lifts from its parked setup, nearest-first. Lifts in
    # two cranes' range go to the nearer crane. Coexists with submit_step
    # (lift-pick mode) — both record into user_steps and replay identically.

    def _apply_saved_step(self, step):
        """Replay one saved step through the mode it was recorded in."""
        if isinstance(step, dict) and step.get('__mode__') == 'sweep':
            self.submit_sweep_step(step.get('setups') or {})
        else:
            self.submit_step(step)

    def _hard_conflict_finish(self, out):
        """Delegates to :func:`sweep_exec.hard_conflict_finish` — see there."""
        return _sweep_hard_conflict_finish(self.env, out)

    def _execute_sweep(self, setups: Dict) -> Dict:
        """Delegates to :func:`sweep_exec.execute_sweep`.

        The executor is shared with the IRL trajectory sampler so that Z is
        estimated over the same action space the demonstrations were recorded
        in. Keep the logic there, not here.
        """
        return _sweep_execute(self.env, setups, self._locked_ids())

    def submit_sweep_step(self, setups: Dict) -> Dict:
        """One sweep step. `setups[crane_id] = {'setup_x':.., 'setup_y':..}`
        (missing cranes default to their current position). Validates nothing to
        reject — it simply works what's reachable — but raises if NO crane can
        reach any lift so the player gets feedback to move closer."""
        if self.env.is_done():
            raise ValueError("session already finished")
        prev_event_count = len(self.env.events)
        resolved = self._execute_sweep(setups or {})
        if len(self.env.events) == prev_event_count:
            # A refused step must leave no trace. execute_sweep has already
            # recorded an idle step for every unassigned crane and bumped
            # step_count, and those survive the exception: the play is then
            # scored with idle penalties for an action the game rejected and
            # never stored in `actions`. Rebuild from the accepted steps (which
            # exclude this one) so the refusal really is a no-op.
            self._replay()
            raise ValueError("반경 안에 처리할 양중이 없습니다 — 크레인을 양중물 가까이 옮기세요")
        self.env.apply_step_soft_conflicts(self.env.events[prev_event_count:])
        self._last_step_events = [
            self._summarize_event(e) for e in self.env.events[prev_event_count:]
        ]
        self.user_steps.append({'__mode__': 'sweep', 'setups': resolved})
        state = self.state()
        persist_session(self)
        return state

    @_session_locked
    def undo(self) -> Dict:
        if not self.user_steps:
            return self.state()
        self.user_steps.pop()
        if self.step_meta:
            self.step_meta.pop()        # keep step_meta index-aligned with user_steps
        self.undo_count += 1
        self._replay()
        state = self.state()
        persist_session(self)
        return state

    @_session_locked
    def record_step_meta(self, meta: Optional[Dict]) -> None:
        """Attach client behaviour telemetry for the step just accepted. Called by
        the endpoint after a successful submit_step/submit_sweep_step, never during
        replay, so user_steps replay stays unaffected. Pads to stay aligned."""
        while len(self.step_meta) < len(self.user_steps) - 1:
            self.step_meta.append({})
        self.step_meta.append(_sanitize_step_meta(meta))

    @_session_locked
    def record_session_telemetry(self, t) -> None:
        """Store the session-level behaviour summary (set just before submit)."""
        self.behavior_session = _sanitize_session_telemetry(t)

    @_session_locked
    def record_events(self, events) -> None:
        """Store the raw timestamped event stream (sent in full at submit)."""
        self.events_log = _sanitize_events(events)

    @_session_locked
    def restart(self) -> Dict:
        self.user_steps.clear()
        self.step_meta.clear()
        self.undo_count = 0
        self._last_step_events = []
        self._reset_env()
        state = self.state()
        persist_session(self)
        return state

    @staticmethod
    def _summarize_event(e: Dict) -> Dict:
        """Trim an env event dict to the keys the frontend animation needs.
        Keeps movePath + the phase timings so the client can interpolate the
        crane along its actual route (with detours around restricted zones).
        """
        path = e.get('movePath') or []
        return {
            'craneId': e.get('craneId'),
            'liftId': e.get('liftId'),
            'fromX': float(e.get('fromX', 0.0)),
            'fromY': float(e.get('fromY', 0.0)),
            'toX': float(e.get('toX', 0.0)),
            'toY': float(e.get('toY', 0.0)),
            'liftX': float(e.get('liftX', 0.0)),
            'liftY': float(e.get('liftY', 0.0)),
            'movePath': [[float(p[0]), float(p[1])] if isinstance(p, (list, tuple))
                         else [float(p.get('x', 0.0)), float(p.get('y', 0.0))]
                         for p in path],
            'start': float(e.get('start', 0.0)),
            'travelStart': float(e.get('travelStart', e.get('start', 0.0))),
            'travelFinish': float(e.get('travelFinish', e.get('start', 0.0))),
            'setupFinish': float(e.get('setupFinish', e.get('start', 0.0))),
            'liftStart': float(e.get('liftStart', e.get('start', 0.0))),
            'liftFinish': float(e.get('liftFinish', e.get('finish', 0.0))),
            'finish': float(e.get('finish', 0.0)),
        }

    @_session_locked
    def submit(self, scorer_weights: Optional[Dict] = None) -> Tuple[Dict, str]:
        """Finalize the play: run scorer for the post-hoc snapshot and write
        the play file to disk. Returns (response_payload, relative_path_str).
        """
        if self.submitted:
            raise ValueError("이미 제출된 세션입니다")
        env = self.env
        # If the user hasn't completed every lift, env may not have applied
        # final teardowns. Apply them best-effort so makespan reflects the
        # closing teardown bar — mirrors run_policy_layout behavior.
        env._apply_final_teardowns(rewards=None)
        result = env.summary()
        # Wrap layout info similar to /api/plan/run for downstream consumers.
        result["layout"] = self.scenario["layout"]
        result["policy"] = "human"
        params = {
            "fixed_duration": env.fixed_duration,
            "setup_time": env.setup_time,
            "teardown_time": env.teardown_time,
            "num_cranes": env.nC,
            "num_lifts": env.nL,
        }
        weights = scorer_weights or dict(DEFAULT_WEIGHTS)
        score = score_schedule(result, params=params, weights=weights)
        raw = self.raw_counters()
        # makespan / completion are intentionally NOT duplicated here: makespan is
        # canonical at outcome["makespan"] and completion is derivable from
        # outcome["done"]/outcome["total"]. Keep raw to metrics that live only here.
        outcome_raw = {
            "soft_interference_count": raw["soft_interference_count"],
            "idle_steps_total": raw.get("idle_steps_total", 0),
            "idle_steps_per_crane": raw.get("idle_steps_per_crane") or [],
            "restricted_executed": raw["restricted_executed"],
            "per_crane_jobs": raw["per_crane_jobs"],
            "per_crane_busy": raw["per_crane_busy"],
        }
        play_doc = {
            "meta": {
                "tier": self.tier,
                "scenario_id": self.scenario_id,
                "user_id": self.user_id,
                "display_name": self.display_name,
                "nickname": self.nickname,
                "role": self.role,
                # 플랫폼 구분 (mobile/pc/unknown) — 데이터·연구 탭·IRL 필터용.
                "client": self.client,
                "play_purpose": self.play_purpose,
                **self.research_context,
                "started_at": _iso_ts(self.started_at),
                "submitted_at": _iso_ts(time.time()),
                "play_seconds": round(time.time() - self.started_at, 2),
                "undo_count": self.undo_count,
                # Random-order variant — lets IRL/analysis separate ordered plays
                # (sequencing imposed) from free plays (sequencing chosen). The
                # permutation is recorded so the imposed order is auditable.
                "order_mode": self.order_mode,
                "order_seed": self.order_seed if self.order_mode else "",
                "order_perm": list(self._order_perm) if self._order_perm else None,
            },
            "layout": self.scenario["layout"],
            "config": self.scenario["config"],
            "actions": self.user_steps,
            # Behaviour log — index-aligned per-step telemetry + session summary.
            # Kept separate from `actions` so IRL replay of decisions is untouched;
            # this stream feeds deliberation/effort features for reward inference.
            "behavior": {
                "steps": list(self.step_meta),
                "session": dict(self.behavior_session),
                "events": list(self.events_log),
            },
            "outcome": {
                "events": result["events"],
                "makespan": result["makespan"],
                "done": result["done"],
                "total": result["total"],
                "raw": outcome_raw,
            },
            "scorer_snapshot": {
                "weights": dict(weights),
                "categories": score["categories"],
                "totalScore": score["totalScore"],
                "grade": score["grade"],
            },
        }
        # Fleet-sizing maps are ranked by money, not makespan: attach the
        # itemized cost estimate (rental + idle + fuel + labor, crane_core.cost)
        # so the count/placement choice has a recorded price. The effective
        # rates ship with it so the play stays auditable if rates change later.
        # Only on crane_choice maps — other maps' outcome schema is unchanged.
        if self.scenario.get("crane_choice"):
            try:
                from crane_core.cost import estimate_cost
                play_doc["outcome"]["cost"] = estimate_cost(result)
            except Exception as e:  # cost must never block a submit
                import sys as _sys
                print(f"[human_play] cost estimate failed: {e}", file=_sys.stderr)
        # Route persistence through the storage abstraction. The returned
        # `ref` is the opaque path that load_play/list_plays will surface.
        ref = _storage.save_play(play_doc)
        self.submitted = True
        # The session has been promoted to a permanent play row; drop the
        # in-flight session record so it stops occupying the persistence layer.
        try:
            _storage.delete_game_session(self.session_id)
        except Exception:
            pass
        return play_doc, ref

    # ------------------------------------------------------------------
    # cross-restart persistence (env is rebuilt via replay on hydration)

    def to_persisted_doc(self) -> Dict:
        """Snapshot the fields needed to rebuild this session after a server
        restart. Env state is omitted — it is reconstructed by replaying
        user_steps on a fresh env (same logic as _replay)."""
        return {
            "session_id": self.session_id,
            "scenario_id": self.scenario_id,
            "tier": self.tier,
            "nickname": self.nickname,
            "display_name": self.display_name,
            "role": self.role,
            "user_id": self.user_id,
            "client": self.client,
            "play_purpose": self.play_purpose,
            "research_context": dict(self.research_context),
            # Random-order variant — persisted so a hydrated session rebuilds the
            # identical seeded order (the env itself is replayed, not stored).
            "order_mode": self.order_mode,
            "order_seed": self.order_seed,
            # Fleet-sizing maps — the player-chosen fleet must survive restarts,
            # otherwise hydration would rebuild the default fleet and replay of
            # user_steps (keyed by crane id) would diverge or fail.
            "cranes_override": (list(self.fleet_override) if self.fleet_override else None),
            "started_at": float(self.started_at),
            "last_active_at": float(self.last_active_at),
            "user_steps": list(self.user_steps),
            "undo_count": int(self.undo_count),
            "submitted": bool(self.submitted),
            # Behaviour log survives restarts (it is NOT rebuilt by replay).
            "step_meta": list(self.step_meta),
            "behavior_session": dict(self.behavior_session),
            # _last_step_events is purely for animation continuity. Cheap to
            # keep but safe to drop if missing on hydration.
            "last_step_events": list(self._last_step_events),
        }

    @classmethod
    def from_persisted_doc(cls, doc: Dict) -> "PlaySession":
        """Rebuild a PlaySession from a doc produced by to_persisted_doc.
        Replays user_steps on a fresh env so the env state matches what the
        user had when the doc was saved."""
        user = {
            "id": doc.get("user_id"),
            "display_name": doc.get("display_name") or doc.get("nickname"),
        }
        sess = cls(
            scenario_id=str(doc.get("scenario_id") or ""),
            tier=str(doc.get("tier") or "unknown"),
            nickname=str(doc.get("nickname") or "anon"),
            role=str(doc.get("role") or ""),
            user=user,
            order_mode=bool(doc.get("order_mode") or False),
            order_seed=str(doc.get("order_seed") or ""),
            client=str(doc.get("client") or ""),
            cranes=doc.get("cranes_override") or None,
            research_context=(
                {
                    "play_purpose": "research",
                    **dict(doc.get("research_context") or {}),
                }
                if doc.get("play_purpose") == "research" else None
            ),
        )
        # Overwrite the freshly-generated session_id and timestamps with the
        # persisted ones so the client's stored session_id keeps working.
        sess.session_id = str(doc.get("session_id") or sess.session_id)
        try:
            sess.started_at = float(doc.get("started_at") or sess.started_at)
        except (TypeError, ValueError):
            pass
        try:
            sess.last_active_at = float(doc.get("last_active_at") or sess.last_active_at)
        except (TypeError, ValueError):
            pass
        sess.undo_count = int(doc.get("undo_count") or 0)
        sess.submitted = bool(doc.get("submitted") or False)
        # Replay each saved step through submit_step so env state is rebuilt
        # exactly (validation, event bookkeeping, counters all match what the
        # user had). submit_step appends to user_steps, so clear first.
        saved_steps = list(doc.get("user_steps") or [])
        sess.user_steps = []
        for step in saved_steps:
            sess._apply_saved_step(step)
        # Restore the behaviour log directly (replay does not rebuild it). Pad to
        # stay index-aligned with user_steps for docs saved before this field.
        sm = doc.get("step_meta")
        sess.step_meta = [_sanitize_step_meta(m) for m in sm] if isinstance(sm, list) else []
        while len(sess.step_meta) < len(sess.user_steps):
            sess.step_meta.append({})
        bs = doc.get("behavior_session")
        sess.behavior_session = _sanitize_session_telemetry(bs) if isinstance(bs, dict) else {}
        # Replay populated _last_step_events from the final replayed step.
        # Prefer the persisted animation buffer when present so the client's
        # next animation matches the one it would have shown pre-restart.
        persisted_last = doc.get("last_step_events")
        if isinstance(persisted_last, list):
            sess._last_step_events = list(persisted_last)
        return sess


# ----------------------------------------------------------------------
# disk persistence

def _iso_ts(t: float) -> str:
    return time.strftime("%Y-%m-%dT%H:%M:%S", time.localtime(t))


def _save_play(tier: str, scenario_id: str, nickname: str, doc: Dict) -> Path:
    """Legacy writer retained for direct CLI usage. The session flow goes
    through storage.save_play; this helper writes the same layout directly."""
    safe_tier = re.sub(r"[^A-Za-z0-9_-]", "", tier or "unknown") or "unknown"
    safe_scen = re.sub(r"[^A-Za-z0-9_-]", "", scenario_id or "unknown") or "unknown"
    safe_nick = _safe_nick(nickname)
    dirpath = PLAYS_DIR / safe_scen / safe_tier
    dirpath.mkdir(parents=True, exist_ok=True)
    stamp = time.strftime("%Y%m%d-%H%M%S", time.localtime())
    path = dirpath / f"{stamp}_{safe_nick}_{uuid.uuid4().hex[:10]}.json"
    path.write_text(json.dumps(doc, ensure_ascii=False, indent=2), encoding="utf-8")
    return path


def list_plays(scenario_id: Optional[str] = None, tier: Optional[str] = None,
               user_id: Optional[str] = None,
               play_purpose: Optional[str] = None) -> List[Dict]:
    """Plays listing — delegates to storage so Postgres and file modes share
    the same caller contract."""
    return _storage.list_plays(
        scenario_id=scenario_id,
        tier=tier,
        user_id=user_id,
        play_purpose=play_purpose,
    )


def summary_by_scenario(tier: Optional[str] = None, user_id: Optional[str] = None,
                        play_purpose: Optional[str] = "general") -> List[Dict]:
    """Leaderboard view — delegates to storage so Postgres + file modes share
    the aggregation logic."""
    return _storage.summary_by_scenario(
        tier=tier,
        user_id=user_id,
        play_purpose=play_purpose,
    )


def _histogram(values, bins: int = 10, lo: float = 0, hi: float = 100) -> List[int]:
    """Legacy histogram helper retained for direct importers (the storage
    module has its own private copy used by summary_by_scenario)."""
    if not values:
        return [0] * bins
    out = [0] * bins
    step = (hi - lo) / max(1, bins)
    for v in values:
        idx = int((v - lo) / step) if step else 0
        idx = max(0, min(bins - 1, idx))
        out[idx] += 1
    return out


def load_play(rel_path: str) -> Optional[Dict]:
    """Load a single play doc by its opaque reference (DB id-prefix or file
    path relative to ROOT). Returns None if missing or unreachable."""
    return _storage.load_play(rel_path)


def load_plays(refs) -> Dict[str, Optional[Dict]]:
    """Batched sibling of `load_play` — one round trip per chunk of refs rather
    than one per play. Returns {ref: doc-or-None}."""
    return _storage.load_plays(refs)


def delete_play(rel_path: str) -> bool:
    """Delete a single play by opaque ref. Returns True if removed, False if
    not found / outside the plays sandbox / DB unavailable."""
    return _storage.delete_play(rel_path)


# ----------------------------------------------------------------------
# session registry (thread-safe)

def _prune_sessions_locked(now: Optional[float] = None):
    now = time.time() if now is None else float(now)
    expired = [
        sid for sid, sess in _SESSIONS.items()
        if sess.submitted or now - getattr(sess, "last_active_at", sess.started_at) > SESSION_TTL_SECONDS
    ]
    for sid in expired:
        _SESSIONS.pop(sid, None)
    overflow = len(_SESSIONS) - MAX_SESSIONS + 1
    if overflow > 0:
        oldest = sorted(
            _SESSIONS.items(),
            key=lambda item: getattr(item[1], "last_active_at", item[1].started_at),
        )
        for sid, _ in oldest[:overflow]:
            _SESSIONS.pop(sid, None)
    # Best-effort sweep of persisted rows older than the TTL so stale sessions
    # don't accumulate forever in Postgres / disk. Failures are non-fatal.
    try:
        _storage.purge_expired_game_sessions(now - SESSION_TTL_SECONDS)
    except Exception:
        pass


def persist_session(sess: PlaySession) -> None:
    """Best-effort write-through to the storage layer. Called after any
    state-mutating session op so a server restart can rehydrate from the
    last known step. Storage errors are swallowed because losing one
    persistence write is better than 500-ing the active gameplay request."""
    try:
        _storage.save_game_session(sess.to_persisted_doc())
    except Exception:
        pass


def create_session(scenario_id: str, tier: str, nickname: str, role: str = "",
                   user: Optional[Dict] = None, order_mode: bool = False,
                   order_seed: str = "", client: str = "",
                   cranes: Optional[List[Dict]] = None,
                   research_context: Optional[Dict] = None) -> PlaySession:
    sess = PlaySession(scenario_id, tier, nickname, role, user=user,
                       order_mode=order_mode, order_seed=order_seed, client=client,
                       cranes=cranes, research_context=research_context)
    with _LOCK:
        _prune_sessions_locked()
        _SESSIONS[sess.session_id] = sess
    persist_session(sess)
    return sess


def get_session(session_id: str) -> Optional[PlaySession]:
    """Return the session for `session_id`, falling back to the storage
    layer when the in-memory cache misses (e.g. after a server restart).
    Hydrated sessions are reinserted into _SESSIONS so subsequent calls
    skip the disk hit.

    여러 인스턴스로 배포하면(numReplicas > 1) 이 캐시를 신뢰할 수 없다:
    로드밸런서가 라운드로빈이라 A에서 만든 세션의 다음 step이 B로 가고, 그
    다음이 다시 A로 온다. A의 캐시는 B가 진행시킨 상태를 모르므로 그대로
    돌려주면 진행이 롤백된다. 상태 변경은 모두 persist_session 으로 DB에
    write-through 되므로, 멀티 인스턴스에서는 DB를 유일한 진실로 삼는다.
    CRANE_MULTI_INSTANCE=1 일 때만 캐시 조회를 건너뛰므로 단일 인스턴스
    배포의 성능은 그대로다 (step 당 DB 왕복 1회가 늘어난다).
    """
    if not session_id:
        return None
    if not MULTI_INSTANCE:
        with _LOCK:
            sess = _SESSIONS.get(session_id)
            if sess is not None:
                return sess
    try:
        doc = _storage.load_game_session(session_id)
    except Exception:
        doc = None
    if not doc or doc.get("submitted"):
        return None
    try:
        sess = PlaySession.from_persisted_doc(doc)
    except Exception:
        # Corrupted or scenario-changed doc — drop it so the user gets a
        # clean "session not found" rather than a permanent 500.
        try:
            _storage.delete_game_session(session_id)
        except Exception:
            pass
        return None
    with _LOCK:
        _SESSIONS[sess.session_id] = sess
    return sess


def drop_session(session_id: str):
    with _LOCK:
        _SESSIONS.pop(session_id, None)
    try:
        _storage.delete_game_session(session_id)
    except Exception:
        pass


def session_count() -> int:
    with _LOCK:
        return len(_SESSIONS)
