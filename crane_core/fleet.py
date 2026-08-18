# -*- coding: utf-8 -*-
"""Fleet-sizing scenario — the player decides HOW MANY cranes to deploy.

New mechanic map ("장비 투입 계획"): before the session starts the player picks
the crane count (1–3) and drags each crane to a spot OUTSIDE the central
building footprint. The submitted play is priced with ``crane_core.cost``
(rental + idle + fuel + labor), so the count choice is a real time-vs-cost
trade-off:

  * 1 crane  — cheap rental, but long detours around the building and a long
    makespan (idle cost stays 0 but fuel/travel pile up),
  * 2 cranes — balanced,
  * 3 cranes — fast, but triple rental plus idle time and interference risk.

Because cranes REPOSITION to each lift during play (env.setup_target), the
initial placement affects travel cost only — solvability is a property of the
lifts/zone/rated-load chart and is verified offline here, independent of where
the player parks the cranes. Start-gating therefore only needs: count in range,
cranes inside the site and outside the footprint.

Self-contained like ``crane_core.corridor``: exports ``SPEC`` (shape of
``scenarios_data.SCEN_SPECS`` plus a ``crane_choice`` field) and is registered
by ``crane_core.scenarios``. Expert tier so authored weight_t/z ship verbatim.
The layout carries a DEFAULT 2-crane fleet used as the AI-baseline layout and
as the fallback when no override is supplied.

Offline self-check: ``python -X utf8 -m crane_core.fleet``.
"""
from __future__ import annotations

from typing import Dict, List

SCEN_ID = "FLEET_1"
CRANE_RADIUS = 22.0

# Player-facing fleet-size bounds (validated server-side in human_play).
CRANE_CHOICE = {"min": 1, "max": 3}

# Central building footprint (restricted zone) the fleet works around/into.
# 28×22 m, centred on the 100×100 site.
_ZONE = {"id": "RZ1", "x1": 36.0, "y1": 39.0, "x2": 64.0, "y2": 61.0}

# Default fleet (baseline / no-override fallback): two cranes parked at the
# SW and NE corners of the site, outside the footprint.
_DEFAULT_CRANES = [
    {"id": "C1", "x": 30.0, "y": 30.0},
    {"id": "C2", "x": 70.0, "y": 70.0},
]

# Lifts: 8 inside the footprint (crane stands outside, boom reaches in) + 2 on
# outside laydown areas. Weight↔inset follows the rated-load chart: 20 t is
# liftable to ~14 m radius so it sits near the footprint edge (inset 3–4 m);
# only light 8 t members (reach ~21 m) sit deep inside (inset ~10 m). z is
# authored inversely to weight so every lift stays feasible.
_LIFTS = [
    # interior — corners (heavy/mid, small inset)
    {"id": "L1",  "x": 40.0, "y": 43.0, "weight_t": 20.0, "z": 0.0},
    {"id": "L2",  "x": 60.0, "y": 43.0, "weight_t": 16.0, "z": 4.0},
    {"id": "L3",  "x": 40.0, "y": 57.0, "weight_t": 16.0, "z": 4.0},
    {"id": "L4",  "x": 60.0, "y": 57.0, "weight_t": 20.0, "z": 0.0},
    # interior — mid-edge (mid weight, modest height)
    {"id": "L5",  "x": 50.0, "y": 42.0, "weight_t": 12.0, "z": 8.0},
    {"id": "L6",  "x": 50.0, "y": 58.0, "weight_t": 12.0, "z": 8.0},
    # interior — deep centre (light + high: only reachable because 8 t)
    {"id": "L7",  "x": 46.0, "y": 50.0, "weight_t": 8.0,  "z": 14.0},
    {"id": "L8",  "x": 54.0, "y": 50.0, "weight_t": 8.0,  "z": 14.0},
    # exterior laydown areas (far corners → travel cost bites with 1 crane)
    {"id": "L9",  "x": 20.0, "y": 24.0, "weight_t": 12.0, "z": 0.0},
    {"id": "L10", "x": 80.0, "y": 76.0, "weight_t": 12.0, "z": 0.0},
]


def build_spec() -> Dict:
    return {
        "id": SCEN_ID,
        "tier": "expert",
        "difficulty": 4,
        "name": "★4 현장 — 장비 투입 계획",
        "description": (
            f"투입 대수({CRANE_CHOICE['min']}~{CRANE_CHOICE['max']}대)와 배치를 직접 결정 · "
            f"양중 {len(_LIFTS)} · 중앙 건물 내부 양중 8 · "
            f"제출 시 총비용(임대+유휴+연료+노무)으로 평가"
        ),
        "cr": CRANE_RADIUS,
        "crane_choice": dict(CRANE_CHOICE),
        "layout": {
            "cranes": [dict(c) for c in _DEFAULT_CRANES],
            "lifts": [dict(l) for l in _LIFTS],
            "restrictedZones": [dict(_ZONE)],
        },
    }


SPEC = build_spec()

__all__ = ["SPEC", "build_spec", "verify_reachable", "SCEN_ID", "CRANE_CHOICE"]


# ── offline reachability verification (not run at import) ─────────────────────
def verify_reachable(spec: Dict | None = None, cranes: List[Dict] | None = None) -> List[str]:
    """Return ids of lifts no crane can take — the same feasibility the game
    enforces (``candidate_outcome`` → not ``restricted``). ``cranes`` overrides
    the default fleet so the placement-independence claim can be spot-checked
    with 1/2/3-crane fleets. Imports env lazily to avoid an import cycle."""
    from crane_core.env import CraneSchedulingEnv
    from crane_core.scenarios import DEFAULT_CAPACITY_CHART, _default_config

    spec = spec or build_spec()
    lay = spec["layout"]
    fleet = cranes if cranes is not None else lay["cranes"]
    cfg = _default_config(crane_radius=float(spec["cr"]))
    cfg["crane_capacity_chart"] = DEFAULT_CAPACITY_CHART
    cfg["num_cranes"] = len(fleet)
    cfg["num_lifts"] = len(lay["lifts"])
    env = CraneSchedulingEnv(cfg)
    env.reset_layout(fleet, lay["lifts"], lay["restrictedZones"])
    bad: List[str] = []
    for li, l in enumerate(env.lifts):
        if not any(not env.candidate_outcome(ci, li)["restricted"] for ci in range(env.nC)):
            bad.append(l.id)
    env._co_cache.clear()
    return bad


if __name__ == "__main__":
    spec = build_spec()
    print(f"id={spec['id']}  lifts={len(spec['layout']['lifts'])}  "
          f"zones={len(spec['layout']['restrictedZones'])}  choice={spec['crane_choice']}")
    # default fleet + single-crane fleets parked at several extreme corners:
    # reachability must hold regardless of where the player parks the cranes.
    fleets = {
        "default(2)": None,
        "1@SW": [{"id": "C1", "x": 8.0, "y": 8.0}],
        "1@NE": [{"id": "C1", "x": 92.0, "y": 92.0}],
        "3@corners": [{"id": "C1", "x": 8.0, "y": 8.0},
                      {"id": "C2", "x": 92.0, "y": 8.0},
                      {"id": "C3", "x": 50.0, "y": 92.0}],
    }
    for label, fleet in fleets.items():
        bad = verify_reachable(spec, cranes=fleet)
        print(f"  {label:12s} unreachable: {bad or 'none'}")
