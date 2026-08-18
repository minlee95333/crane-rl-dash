# -*- coding: utf-8 -*-
"""Steel-frame member model + erection-precedence MECHANICS.

Mechanism only — the map geometry/policy lives in ``generate.py``. Here we:

  * build lift dicts for columns / beams that carry the extra erection fields
    (``member_type``, ``floor``, ``span``, ``requires``) on top of the base lift
    shape (``id``/``x``/``y``/``z``/``weight_t``) that ``CraneSchedulingEnv``
    already understands, and
  * run a deterministic topological sort over ``requires`` that assigns every
    member an erection-order number ``seq`` (1..N) and validates the DAG.

The base env ignores the extra keys (it only reads id/x/y/z/weight_t), so a
steel-frame layout stays a plain serialisable scenario. Precedence is ENFORCED
elsewhere (the engine candidate filter, task #4); this module only models and
orders it.

``span`` is ``[x1, y1, z1, x2, y2, z2]`` — the two endpoints of the physical
member, used by the 3D layer to draw a column (vertical) or beam (horizontal)
box. ``x``/``y``/``z`` stay the crane SERVICE point so the existing 2.5D physics
is untouched (column → top of segment; beam → its midpoint).
"""
from __future__ import annotations

from typing import Dict, List, Sequence

COLUMN = "column"
BEAM = "beam"


def make_member(
    mid: str,
    member_type: str,
    x: float,
    y: float,
    z: float,
    weight_t: float,
    *,
    floor: int,
    span: Sequence[float],
    requires: Sequence[str],
) -> Dict:
    """Base builder. ``span`` = [x1,y1,z1, x2,y2,z2]; ``requires`` = lift ids."""
    return {
        "id": str(mid),
        "member_type": member_type,
        "floor": int(floor),
        "x": round(float(x), 2),
        "y": round(float(y), 2),
        "z": round(float(z), 2),
        "weight_t": round(float(weight_t), 2),
        "span": [round(float(v), 2) for v in span],
        "requires": list(requires),
    }


def make_column(
    mid: str, x: float, y: float, z_base: float, z_top: float, weight_t: float,
    *, floor: int, requires: Sequence[str],
) -> Dict:
    """Vertical member from z_base→z_top at plan position (x, y). Service point
    is the segment top (where the crane lands it)."""
    return make_member(
        mid, COLUMN, x, y, z_top, weight_t,
        floor=floor, span=[x, y, z_base, x, y, z_top], requires=requires,
    )


def make_beam(
    mid: str, x1: float, y1: float, x2: float, y2: float, z: float, weight_t: float,
    *, floor: int, requires: Sequence[str],
) -> Dict:
    """Horizontal member spanning (x1,y1)→(x2,y2) at height z. Service point is
    the midpoint."""
    return make_member(
        mid, BEAM, 0.5 * (x1 + x2), 0.5 * (y1 + y2), z, weight_t,
        floor=floor, span=[x1, y1, z, x2, y2, z], requires=requires,
    )


def _sort_key(l: Dict):
    """Canonical erection-order tiebreak when ``requires`` leaves freedom:
    lower floor first, columns before beams, lower height, then id — i.e.
    z-low-first and column-before-beam."""
    return (
        l.get("floor", 0),
        0 if l.get("member_type") == COLUMN else 1,
        l.get("z", 0.0),
        l["id"],
    )


def topo_order(lifts: List[Dict]) -> List[str]:
    """Deterministic Kahn topological sort honouring ``requires``. Tiebreak by
    :func:`_sort_key` so the numbering reflects a sensible erection sequence.
    Raises ValueError on a dangling requirement or a precedence cycle."""
    by_id = {l["id"]: l for l in lifts}
    indeg = {i: 0 for i in by_id}
    dependents: Dict[str, List[str]] = {i: [] for i in by_id}
    for l in lifts:
        for r in l.get("requires", []):
            if r not in by_id:
                raise ValueError(f"{l['id']} requires unknown member {r}")
            indeg[l["id"]] += 1
            dependents[r].append(l["id"])
    ready = sorted([by_id[i] for i in by_id if indeg[i] == 0], key=_sort_key)
    order: List[str] = []
    while ready:
        cur = ready.pop(0)
        order.append(cur["id"])
        for d in dependents[cur["id"]]:
            indeg[d] -= 1
            if indeg[d] == 0:
                ready.append(by_id[d])
        ready.sort(key=_sort_key)
    if len(order) != len(lifts):
        raise ValueError("precedence cycle detected (topological sort incomplete)")
    return order


def assign_seq(lifts: List[Dict]) -> List[Dict]:
    """Mutate each lift, adding a 1-based ``seq`` per the canonical topo order.
    Returns the same list for chaining."""
    rank = {mid: n + 1 for n, mid in enumerate(topo_order(lifts))}
    for l in lifts:
        l["seq"] = rank[l["id"]]
    return lifts


def validate(lifts: List[Dict]) -> List[str]:
    """Return a list of human-readable problems; empty list means a valid DAG
    (unique ids, every requirement resolvable, acyclic)."""
    issues: List[str] = []
    seen = set()
    for l in lifts:
        if l["id"] in seen:
            issues.append(f"duplicate id: {l['id']}")
        seen.add(l["id"])
    idset = set(seen)
    for l in lifts:
        for r in l.get("requires", []):
            if r not in idset:
                issues.append(f"{l['id']} requires unknown member {r}")
    try:
        topo_order(lifts)
    except ValueError as e:
        issues.append(str(e))
    return issues
