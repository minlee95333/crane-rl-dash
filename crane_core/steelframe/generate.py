# -*- coding: utf-8 -*-
"""Deterministic generator for the 3-storey steel-frame erection map.

Builds ONE top-tier scenario: a ``GRID×GRID`` column grid over ``FLOORS``
storeys, with perimeter+interior beams on every floor. Erection precedence is
baked into each member's ``requires``:

  * every member of a floor requires EVERY member of the floor below
    → 1F fully erected before 2F (floor-by-floor),
  * a beam requires its two end columns on the same floor
    → columns before the beams that land on them,

which together yield z-low-first, column-before-beam, floor-by-floor erection.
``members.assign_seq`` then numbers the canonical order 1..N for display.

Tune the constants below and re-import — counts, geometry and sequence numbers
all follow. :func:`verify_reachable` checks every member against the real env
(rated-load chart + height derating) so an infeasible layout is caught offline
(run ``python -X utf8 -m crane_core.steelframe.generate``) instead of shipping
an unsolvable map. Building the spec itself does NOT touch the env (keeps import
cheap and avoids an import cycle with crane_core.scenarios).
"""
from __future__ import annotations

from typing import Dict, List, Tuple

from crane_core.steelframe import members as M

# ── geometry / scale (metres; the site is 100×100) ───────────────────────────
# Real steel bays are 7–9 m, so the footprint is ~22.5 m square and 12 m tall —
# a believable small 3-storey frame that dwarfs the ~7 m crane carrier (vs the
# old 13.5 m "Lego" footprint). Members are light (≤3 t), so even an interior
# column at 12 m is liftable once the crane repositions near it.
GRID = 4              # GRID×GRID columns per floor (4×4 = 16)
SPACING = 7.0         # beam length = gap between adjacent columns (m) → footprint 3×7 = 21 m
FLOORS = 3
FLOOR_H = 4.0         # storey height = single column-segment height (m) → z levels 4 / 8 / 12
CENTER = (50.0, 50.0)
COL_WEIGHT = 3.0      # t per single-storey column segment
BEAM_WEIGHT = 1.5     # t per beam
CRANE_RADIUS = 27.0   # crane_radius cap; true reach still governed by the chart
# Two mobile cranes flank the footprint on the low/high-y sides (outside it), so
# "which crane lifts which member" is a real decision. They reposition to a
# setup near each member during play; these are just the parked/idle spots.
# Footprint y-range is ~38.75..61.25 for the defaults above.
CRANES: List[Tuple[float, float]] = [(50.0, 27.0), (50.0, 73.0)]

SCEN_ID = "SF_3F"


def _coord(idx: int) -> float:
    """Plan coordinate of grid line ``idx`` (0..GRID-1), centred on CENTER."""
    return (idx - (GRID - 1) / 2.0) * SPACING


def _col_id(f: int, i: int, j: int) -> str:
    return f"F{f}C{i}{j}"


def build_lifts() -> List[Dict]:
    """All columns + beams across every floor, with ``requires`` baked in and a
    canonical ``seq`` assigned. Pure geometry/precedence — no env."""
    cx, cy = CENTER
    lifts: List[Dict] = []

    # floor f members all require every member of floor f-1 (floor-by-floor gate)
    prev_floor_ids: List[str] = []
    for f in range(1, FLOORS + 1):
        z_base = (f - 1) * FLOOR_H
        z_top = f * FLOOR_H
        floor_ids: List[str] = []

        # columns ----------------------------------------------------------
        for i in range(GRID):
            for j in range(GRID):
                x, y = cx + _coord(i), cy + _coord(j)
                cid = _col_id(f, i, j)
                lifts.append(M.make_column(
                    cid, x, y, z_base, z_top, COL_WEIGHT,
                    floor=f, requires=list(prev_floor_ids),
                ))
                floor_ids.append(cid)

        # beams (perimeter + interior) land on this floor's columns ---------
        b = 0
        for i in range(GRID):
            for j in range(GRID):
                x, y = cx + _coord(i), cy + _coord(j)
                # +x neighbour
                if i + 1 < GRID:
                    nx = cx + _coord(i + 1)
                    a, c = _col_id(f, i, j), _col_id(f, i + 1, j)
                    bid = f"F{f}B{b}"; b += 1
                    lifts.append(M.make_beam(
                        bid, x, y, nx, y, z_top, BEAM_WEIGHT,
                        floor=f, requires=[a, c] + list(prev_floor_ids),
                    ))
                    floor_ids.append(bid)
                # +y neighbour
                if j + 1 < GRID:
                    ny = cy + _coord(j + 1)
                    a, c = _col_id(f, i, j), _col_id(f, i, j + 1)
                    bid = f"F{f}B{b}"; b += 1
                    lifts.append(M.make_beam(
                        bid, x, y, x, ny, z_top, BEAM_WEIGHT,
                        floor=f, requires=[a, c] + list(prev_floor_ids),
                    ))
                    floor_ids.append(bid)

        prev_floor_ids = floor_ids

    M.assign_seq(lifts)
    return lifts


def build_spec() -> Dict:
    """The scenario spec in the same shape as crane_core.scenarios_data.SCEN_SPECS
    (id/tier/difficulty/name/description/cr/layout). Carries the extra member
    fields on each lift; the env ignores them, the 3D/engine layers use them."""
    lifts = build_lifts()
    n_col = sum(1 for l in lifts if l["member_type"] == M.COLUMN)
    n_beam = len(lifts) - n_col
    cranes = [{"id": f"C{i+1}", "x": float(x), "y": float(y)}
              for i, (x, y) in enumerate(CRANES)]
    return {
        "id": SCEN_ID,
        "tier": "expert",
        "difficulty": 5,
        "name": "★5 현장 — 3층 철골조 양중",
        "description": (
            f"실제 현장 시뮬레이션 · 크레인 {len(cranes)} · "
            f"기둥 {n_col} + 보 {n_beam} = {len(lifts)}부재 · "
            f"시공순서 강제(아래층→위층, 기둥→보)"
        ),
        "cr": CRANE_RADIUS,
        "layout": {
            "cranes": cranes,
            "lifts": lifts,
            "restrictedZones": [],
        },
    }


# ── offline reachability verification (not run at import) ─────────────────────
def verify_reachable(spec: Dict | None = None) -> List[str]:
    """Return ids of members no crane can lift. A mobile crane repositions to a
    setup just outside the footprint nearest the member, so the horizontal radius
    it must cover is the member's INSET depth (0 for perimeter members). A member
    is feasible when the rated-load chart still lifts its weight at that height
    out to at least that radius. Imports env lazily (avoids an import cycle)."""
    from crane_core.env import CraneSchedulingEnv
    from crane_core.scenarios import _default_config

    spec = spec or build_spec()
    env = CraneSchedulingEnv(_default_config(crane_radius=float(spec["cr"])))
    lifts = spec["layout"]["lifts"]
    x0, x1 = min(l["x"] for l in lifts), max(l["x"] for l in lifts)
    y0, y1 = min(l["y"] for l in lifts), max(l["y"] for l in lifts)
    bad: List[str] = []
    for l in lifts:
        inset = max(0.0, min(l["x"] - x0, x1 - l["x"], l["y"] - y0, y1 - l["y"]))
        max_r = env._max_radius_chart(float(l["weight_t"]), float(l["z"]))
        if max_r < inset - 1e-6:
            bad.append(l["id"])
    return bad


if __name__ == "__main__":
    spec = build_spec()
    issues = M.validate(spec["layout"]["lifts"])
    bad = verify_reachable(spec)
    print(f"id={spec['id']}  members={len(spec['layout']['lifts'])}  cranes={len(spec['layout']['cranes'])}")
    print(f"DAG issues: {issues or 'none'}")
    print(f"unreachable: {bad or 'none'}")
