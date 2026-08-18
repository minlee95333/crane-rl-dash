# -*- coding: utf-8 -*-
"""Pipe-rack corridor scenario — a linear site with a central existing building.

A new-character general (free-order) map, distinct from the roughly-square
clustered maps in ``scenarios_data.py``:

  * the site is a long CORRIDOR — two rows of lifts (a pipe-rack / conveyor
    gallery) run east-west, one along the south edge, one along the north edge,
  * a central RESTRICTED zone (an existing building the crane must reach around)
    splits the corridor, so "which crane takes which side" and how each crane
    detours around the block are real decisions,
  * two mobile cranes are parked at the west and east ends.

Self-contained like ``crane_core.steelframe``: it exports ``SPEC`` (same shape
as ``scenarios_data.SCEN_SPECS``) and is registered by ``crane_core.scenarios``.
Expert tier so the per-lift ``weight_t``/``z`` authored here are shipped verbatim
(the standard-tier diversify/height passes don't touch expert), which means the
offline reachability check below matches exactly what the game serves.

``verify_reachable`` runs the SAME feasibility the game enforces
(``candidate_outcome`` → not ``restricted``) so an unsolvable layout is caught
offline (``python -X utf8 -m crane_core.corridor``) instead of being shipped.
"""
from __future__ import annotations

from typing import Dict, List

SCEN_ID = "CORRIDOR_1"
CRANE_RADIUS = 22.0

# Central existing building the corridor wraps around (x1,y1)-(x2,y2).
_ZONE = {"id": "RZ1", "x1": 41.0, "y1": 42.0, "x2": 60.0, "y2": 58.0}

# Two mobile cranes parked at the west / east ends of the corridor.
_CRANES = [
    {"id": "C1", "x": 12.0, "y": 50.0},
    {"id": "C2", "x": 88.0, "y": 50.0},
]

# Two east-west rows of pipe-rack lifts, south (y=30) and north (y=70) of the
# central building. weight_t/z authored per lift: heavier loads sit low so they
# stay liftable; lighter loads go high to exercise the boom-reach derate.
# (weight, z) presets by role.
_HEAVY = (20.0, 0.0)
_MID = (16.0, 6.0)
_LIGHT = (12.0, 10.0)
_TALL = (8.0, 16.0)

# x positions along each row (kept clear of the central building's x-span so the
# setup disk around every lift has free ground outside the zone).
_ROW_X = [20.0, 31.0, 44.0, 57.0, 69.0, 80.0]
_SOUTH_Y = 30.0
_NORTH_Y = 70.0
# weight/height role per column, alternated so each row mixes reach challenges.
_SOUTH_ROLES = [_HEAVY, _LIGHT, _MID, _TALL, _HEAVY, _LIGHT]
_NORTH_ROLES = [_TALL, _MID, _HEAVY, _LIGHT, _MID, _TALL]


def build_lifts() -> List[Dict]:
    lifts: List[Dict] = []
    n = 1
    for x, (w, z) in zip(_ROW_X, _SOUTH_ROLES):
        lifts.append({"id": f"L{n}", "x": x, "y": _SOUTH_Y, "weight_t": w, "z": z})
        n += 1
    for x, (w, z) in zip(_ROW_X, _NORTH_ROLES):
        lifts.append({"id": f"L{n}", "x": x, "y": _NORTH_Y, "weight_t": w, "z": z})
        n += 1
    return lifts


def build_spec() -> Dict:
    lifts = build_lifts()
    return {
        "id": SCEN_ID,
        "tier": "expert",
        "difficulty": 4,
        "name": "★4 현장 — 파이프랙 회랑",
        "description": (
            f"선형 부지 · 크레인 {len(_CRANES)} · 양중 {len(lifts)} · "
            f"제한구역 1(중앙 건물) · 남/북 2열 파이프랙을 건물 우회로 양중"
        ),
        "cr": CRANE_RADIUS,
        "layout": {
            "cranes": [dict(c) for c in _CRANES],
            "lifts": lifts,
            "restrictedZones": [dict(_ZONE)],
        },
    }


SPEC = build_spec()

__all__ = ["SPEC", "build_spec", "verify_reachable", "SCEN_ID"]


# ── offline reachability verification (not run at import) ─────────────────────
def verify_reachable(spec: Dict | None = None) -> List[str]:
    """Return ids of lifts no crane can take (the same feasibility the game
    enforces): a lift is solvable when at least one crane's ``candidate_outcome``
    is not ``restricted``. Imports env lazily to avoid an import cycle."""
    from crane_core.env import CraneSchedulingEnv
    from crane_core.scenarios import DEFAULT_CAPACITY_CHART, _default_config

    spec = spec or build_spec()
    lay = spec["layout"]
    cfg = _default_config(crane_radius=float(spec["cr"]))
    cfg["crane_capacity_chart"] = DEFAULT_CAPACITY_CHART
    cfg["num_cranes"] = len(lay["cranes"])
    cfg["num_lifts"] = len(lay["lifts"])
    env = CraneSchedulingEnv(cfg)
    env.reset_layout(lay["cranes"], lay["lifts"], lay["restrictedZones"])
    bad: List[str] = []
    for li, l in enumerate(env.lifts):
        if not any(not env.candidate_outcome(ci, li)["restricted"] for ci in range(env.nC)):
            bad.append(l.id)
    env._co_cache.clear()
    return bad


if __name__ == "__main__":
    spec = build_spec()
    bad = verify_reachable(spec)
    print(f"id={spec['id']}  cranes={len(spec['layout']['cranes'])}  "
          f"lifts={len(spec['layout']['lifts'])}  zones={len(spec['layout']['restrictedZones'])}")
    print(f"unreachable: {bad or 'none'}")
