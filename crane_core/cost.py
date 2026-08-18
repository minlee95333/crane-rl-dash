"""Rule-based schedule cost estimator.

Consumes the same result dict produced by env.run_policy / env.run_policy_layout
(the JSON returned by /api/plan/run) and produces an itemized cost estimate so a
generated hoist plan can be priced. Pure-Python, no ML dependency — the rates are
explicit so users can tune them in `DEFAULT_RATES` or override per request/UI.

Cost model (four distinct payees, additive):

    rentalCost = Σ_crane  hoistTime_c   × rentalPerMin[type_c]  # lifting time only
    idleCost   = Σ_crane  idleTime_c    × idlePerMin[type_c]    # waiting (makespan − working)
    fuelCost   =          moveTotal     × fuelPerMoveUnit       # travel distance → fuel/power
    laborCost  = Σ_crane  onsiteTime_c  × laborPerMin           # crane operator wages

    totalCost  = rentalCost + idleCost + fuelCost + laborCost

Per-crane time spans, all aggregated from the events:

    hoistTime_c  = Σ duration                                    the lift itself
    workTime_c   = Σ setup+travel+duration+teardown+finalTeardown
    idleTime_c   = max(0, makespan − workTime_c)                 waiting
    onsiteTime_c = workTime_c + idleTime_c                       whole project

Only `hoistTime_c` is billed as rental: setup, travel and teardown are not
lifting, so they are not charged as productive equipment time. `laborCost` uses
`onsiteTime_c` — one operator per crane, on the clock for the whole project
since they cannot be sent home between lifts. That makes labor the one line
that scales with crane count: an extra crane adds a full makespan of wages even
if it barely lifts. Labor therefore overlaps every other line in time; the
payees differ (machine vs person), so this is not double counting.

`workTime_c` matches scorer._per_crane_stats: teardown+finalTeardown+travel+setup+duration.

CLI:
    python -m crane_core.cost --in result.json [--rates rates.json] [--out cost.json]
"""
from __future__ import annotations

import argparse
import json
import math
from pathlib import Path
from typing import Dict, List, Optional


# Default unit rates (KRW). Tunable here or overridden per /api/plan/run request.
# rentalPerMin / idlePerMin are keyed by crane `type` with a '_default' fallback.
DEFAULT_RATES: Dict = {
    'currency': 'KRW',
    # 크레인 type별 분당 임대비 (순수 양중 시간 기준). '_default'는 미지정 type의 기본값.
    'rentalPerMin': {'_default': 3000.0},      # ≈ ₩180,000/시간
    # 대기(유휴) 시간 분당 비용. None이면 rentalPerMin과 동일 단가 적용(현장에 그대로 임대료 발생).
    'idlePerMin': None,
    # 이동 거리 1 단위(현장 좌표 단위)당 연료/전력비.
    'fuelPerMoveUnit': 50.0,
    # 전체 공정시간 분당 노무비 (크레인 1대당 운전수 1명 임금).
    'laborPerMin': 1200.0,
}

_RATE_KEYS = {
    'currency', 'rentalPerMin', 'idlePerMin',
    'fuelPerMoveUnit', 'laborPerMin',
}
_EVENT_COST_FIELDS = (
    'teardown', 'finalTeardown', 'travel', 'setup', 'duration', 'move',
)


def _nonnegative_number(value, path: str) -> float:
    if isinstance(value, bool):
        raise ValueError(f'{path} must be a finite non-negative number')
    try:
        number = float(value)
    except (TypeError, ValueError) as exc:
        raise ValueError(f'{path} must be a finite non-negative number') from exc
    if not math.isfinite(number) or number < 0.0:
        raise ValueError(f'{path} must be a finite non-negative number')
    return number


def _validate_rate_value(value, path: str, *, allow_none: bool = False):
    if value is None and allow_none:
        return
    if isinstance(value, dict):
        if not value:
            raise ValueError(f'{path} must not be an empty rate map')
        for crane_type, rate in value.items():
            if not isinstance(crane_type, str) or not crane_type.strip():
                raise ValueError(f'{path} rate-map keys must be non-empty strings')
            _nonnegative_number(rate, f'{path}.{crane_type}')
        return
    _nonnegative_number(value, path)


def validate_rates(rates: Optional[Dict]) -> None:
    """Validate a partial rate override before merging it with defaults."""
    if rates is None:
        return
    if not isinstance(rates, dict):
        raise ValueError('rates must be an object')
    unknown = sorted(set(rates) - _RATE_KEYS)
    if unknown:
        raise ValueError(f'unsupported rate fields: {", ".join(unknown)}')
    if 'currency' in rates:
        currency = rates['currency']
        if not isinstance(currency, str) or not currency.strip() or len(currency.strip()) > 12:
            raise ValueError('rates.currency must be a non-empty string of at most 12 characters')
    for key in ('rentalPerMin', 'idlePerMin'):
        if key in rates:
            _validate_rate_value(rates[key], f'rates.{key}', allow_none=(key == 'idlePerMin'))
    for key in ('fuelPerMoveUnit', 'laborPerMin'):
        if key in rates:
            _nonnegative_number(rates[key], f'rates.{key}')


# The simulator accumulates per-event durations in floating point, so the last
# event's `finish` (and per-crane busy totals) can drift a few ten-thousandths of
# a minute past the separately rounded `makespan`. Observed drift across stored
# results is ~5e-4 regardless of schedule length; allow 1e-3 (0.06 s) plus a tiny
# proportional term so the validator rejects real overruns, not float noise.
def _makespan_tol(makespan: float) -> float:
    return 1e-3 + 1e-6 * abs(makespan)


def validate_result(result: Dict) -> None:
    """Validate the schedule fields consumed by the cost model."""
    if not isinstance(result, dict):
        raise ValueError('result must be an object')
    if 'makespan' not in result:
        raise ValueError('result.makespan is required')
    makespan = _nonnegative_number(result['makespan'], 'result.makespan')
    events = result.get('events')
    if not isinstance(events, list):
        raise ValueError('result.events must be a list')
    cranes = result.get('cranes')
    if cranes is not None:
        if not isinstance(cranes, list):
            raise ValueError('result.cranes must be a list')
        for index, crane in enumerate(cranes):
            if not isinstance(crane, dict):
                raise ValueError(f'result.cranes[{index}] must be an object')
            if crane.get('id') in (None, ''):
                raise ValueError(f'result.cranes[{index}].id is required')
    busy_by_crane: Dict[str, float] = {}
    event_totals = {'moveTotal': 0.0, 'setupTotal': 0.0, 'teardownTotal': 0.0}
    for index, event in enumerate(events):
        if not isinstance(event, dict):
            raise ValueError(f'result.events[{index}] must be an object')
        crane_id = event.get('craneId')
        if crane_id in (None, ''):
            raise ValueError(f'result.events[{index}].craneId is required')
        if 'duration' not in event:
            raise ValueError(f'result.events[{index}].duration is required')
        if 'finish' not in event:
            raise ValueError(f'result.events[{index}].finish is required')
        finish = _nonnegative_number(event['finish'], f'result.events[{index}].finish')
        if finish > makespan + _makespan_tol(makespan):
            raise ValueError(
                f'result.events[{index}].finish exceeds result.makespan '
                f'({finish:.6g} > {makespan:.6g})'
            )
        for field in _EVENT_COST_FIELDS:
            if field in event and event[field] is not None:
                _nonnegative_number(event[field], f'result.events[{index}].{field}')
        cid = str(crane_id)
        busy_by_crane[cid] = busy_by_crane.get(cid, 0.0) + _event_busy_time(event)
        event_totals['moveTotal'] += float(event.get('move', 0.0) or 0.0)
        event_totals['setupTotal'] += float(event.get('setup', 0.0) or 0.0)
        event_totals['teardownTotal'] += (
            float(event.get('teardown', 0.0) or 0.0)
            + float(event.get('finalTeardown', 0.0) or 0.0)
        )
    for cid, busy in busy_by_crane.items():
        if busy > makespan + _makespan_tol(makespan):
            raise ValueError(
                f'result events for crane {cid} exceed result.makespan '
                f'({busy:.6g} > {makespan:.6g})'
            )
    for field in ('moveTotal', 'setupTotal', 'teardownTotal'):
        if field in result and result[field] is not None:
            supplied = _nonnegative_number(result[field], f'result.{field}')
            derived = event_totals[field]
            if not math.isclose(supplied, derived, rel_tol=1e-7, abs_tol=1e-6):
                raise ValueError(
                    f'result.{field} does not match event total '
                    f'({supplied:.6g} != {derived:.6g})'
                )


def _merge_rates(rates: Optional[Dict]) -> Dict:
    """Shallow-merge user rates over DEFAULT_RATES, with a nested merge for the
    per-type rentalPerMin/idlePerMin maps so a partial override keeps the rest."""
    validate_rates(rates)
    out = json.loads(json.dumps(DEFAULT_RATES))  # deep copy via JSON
    if not rates:
        return out
    for key, val in rates.items():
        if key in ('rentalPerMin', 'idlePerMin') and isinstance(val, dict):
            base = out.get(key)
            if not isinstance(base, dict):
                base = {}
            base.update({k: float(v) for k, v in val.items() if v is not None})
            out[key] = base
        elif val is not None:
            out[key] = val
    return out


def _rate_for_type(rate_map, crane_type: str, default: float) -> float:
    if isinstance(rate_map, dict):
        if crane_type in rate_map and rate_map[crane_type] is not None:
            return float(rate_map[crane_type])
        if '_default' in rate_map and rate_map['_default'] is not None:
            return float(rate_map['_default'])
    elif rate_map is not None:
        return float(rate_map)
    return float(default)


def _event_busy_time(e: Dict) -> float:
    return (
        float(e.get('teardown', 0.0) or 0.0)
        + float(e.get('finalTeardown', 0.0) or 0.0)
        + float(e.get('travel', 0.0) or 0.0)
        + float(e.get('setup', 0.0) or 0.0)
        + float(e.get('duration', 0.0) or 0.0)
    )


def _crane_types(result: Dict) -> Dict[str, str]:
    """Map crane id → type. Cranes come from result['cranes'] (asdict of Crane)."""
    out: Dict[str, str] = {}
    for c in result.get('cranes') or []:
        cid = c.get('id')
        if cid is not None:
            out[str(cid)] = str(c.get('type') or '_default')
    return out


def estimate_cost(result: Dict, rates: Optional[Dict] = None) -> Dict:
    """Itemized cost estimate for one generated schedule.

    Args:
      result: env.run_policy / run_policy_layout result (events + summary fields).
      rates:  optional override of DEFAULT_RATES (partial allowed).

    Returns:
      {'totalCost', 'currency', 'items': {name: {cost, detail, ...}},
       'perCrane': [...], 'rates': <effective rates>}
    """
    validate_result(result)
    r = _merge_rates(rates)
    currency = r.get('currency', 'KRW')
    events = result.get('events') or []
    makespan = float(result.get('makespan') or 0.0)
    types = _crane_types(result)

    # Two per-crane spans, both aggregated from events:
    #   per_busy  = setup + travel + hoist + teardown  (all working minutes)
    #   per_hoist = hoist only                          (the billed rental span)
    # per_busy still drives idle (makespan - working) and the makespan sanity
    # check in validate_result; per_hoist is what the rental invoice charges.
    per_busy: Dict[str, float] = {cid: 0.0 for cid in types}
    per_hoist: Dict[str, float] = {cid: 0.0 for cid in types}
    for e in events:
        cid = str(e.get('craneId') or '')
        if not cid:
            continue
        per_busy[cid] = per_busy.get(cid, 0.0) + _event_busy_time(e)
        per_hoist[cid] = per_hoist.get(cid, 0.0) + float(e.get('duration', 0.0) or 0.0)
    # Cranes that appear only via events (no explicit cranes list) still count.
    for cid in list(per_busy.keys()):
        types.setdefault(cid, '_default')

    rental_map = r.get('rentalPerMin')
    idle_map = r.get('idlePerMin')
    rental_default = _rate_for_type(rental_map, '_default', 3000.0)

    rental_cost = 0.0
    idle_cost = 0.0
    onsite_total = 0.0
    per_crane: List[Dict] = []
    for cid in sorted(per_busy.keys()):
        ctype = types.get(cid, '_default')
        busy = float(per_busy[cid])
        hoist = float(per_hoist.get(cid, 0.0))
        idle = max(0.0, makespan - busy)
        # Whole time the crane is committed to the project. Derived as
        # working + waiting rather than taken as `makespan` directly so a crane
        # whose events overrun makespan (within validate_result's tolerance)
        # still reports the time it actually consumed.
        onsite = busy + idle
        onsite_total += onsite
        rrate = _rate_for_type(rental_map, ctype, rental_default)
        irate = rrate if idle_map is None else _rate_for_type(idle_map, ctype, rrate)
        rc = hoist * rrate
        ic = idle * irate
        rental_cost += rc
        idle_cost += ic
        per_crane.append({
            'craneId': cid, 'type': ctype,
            'hoistMin': round(hoist, 2), 'busyMin': round(busy, 2),
            'idleMin': round(idle, 2), 'onsiteMin': round(onsite, 2),
            'rentalRate': rrate, 'idleRate': irate,
            'rentalCost': round(rc, 2), 'idleCost': round(ic, 2),
        })

    move_total = float(result.get('moveTotal') if result.get('moveTotal') is not None
                       else sum(float(e.get('move', 0.0) or 0.0) for e in events))
    setup_total = float(result.get('setupTotal') if result.get('setupTotal') is not None
                        else sum(float(e.get('setup', 0.0) or 0.0) for e in events))
    teardown_total = float(result.get('teardownTotal') if result.get('teardownTotal') is not None
                           else sum(float(e.get('teardown', 0.0) or 0.0)
                                    + float(e.get('finalTeardown', 0.0) or 0.0) for e in events))
    # One operator per crane, on the clock for the crane's whole time on site —
    # waiting included, since an operator cannot be sent home between lifts.
    # This is the only line that scales with crane count: adding a crane adds a
    # full makespan of wages even if it barely lifts anything.
    labor_min_total = onsite_total
    hoist_total = sum(per_hoist.values())

    fuel_rate = float(r.get('fuelPerMoveUnit', 0.0) or 0.0)
    labor_rate = float(r.get('laborPerMin', 0.0) or 0.0)
    fuel_cost = move_total * fuel_rate
    labor_min = labor_min_total
    labor_cost = labor_min * labor_rate

    total = rental_cost + idle_cost + fuel_cost + labor_cost
    for name, value in (
        ('rental cost', rental_cost), ('idle cost', idle_cost),
        ('fuel cost', fuel_cost), ('labor cost', labor_cost), ('total cost', total),
    ):
        if not math.isfinite(value):
            raise ValueError(f'calculated {name} is not finite')
    items = {
        'rental': {
            'label': '크레인 임대비 (가동)',
            'cost': round(rental_cost, 2),
            'detail': f'Σ 크레인별 양중시간 {hoist_total:.1f}분 × 임대단가 = {rental_cost:,.0f} {currency}',
        },
        'idle': {
            'label': '유휴 손실비',
            'cost': round(idle_cost, 2),
            'detail': f'Σ 크레인별 대기시간 (makespan {makespan:.1f}분 - 작업시간) × 유휴단가 = {idle_cost:,.0f} {currency}',
        },
        'fuel': {
            'label': '운행/연료비',
            'cost': round(fuel_cost, 2),
            'detail': f'이동거리 {move_total:.1f} × {fuel_rate:,.0f}/단위 = {fuel_cost:,.0f} {currency}',
        },
        'labor': {
            'label': '노무비',
            'cost': round(labor_cost, 2),
            'detail': f'Σ 크레인별 전체 공정시간 {labor_min:.1f}분 × {labor_rate:,.0f}/분 = {labor_cost:,.0f} {currency}',
        },
    }
    return {
        'totalCost': round(total, 2),
        'currency': currency,
        'items': items,
        'perCrane': per_crane,
        'totals': {
            'makespanMin': round(makespan, 2),
            'moveTotal': round(move_total, 2),
            'setupMin': round(setup_total, 2),
            'teardownMin': round(teardown_total, 2),
            'hoistMin': round(hoist_total, 2),
            'onsiteMin': round(onsite_total, 2),
        },
        'rates': r,
    }


def main():
    ap = argparse.ArgumentParser(description='Estimate the cost of a generated hoist schedule.')
    ap.add_argument('--in', dest='inp', required=True, help='Path to schedule result JSON')
    ap.add_argument('--rates', default='', help='Optional JSON file with rate overrides')
    ap.add_argument('--out', default='', help='Optional path to write the cost JSON')
    args = ap.parse_args()

    with open(args.inp, encoding='utf-8') as f:
        result = json.load(f)
    # Unwrap /api/plan/run-style { ok, result }.
    if isinstance(result, dict) and 'result' in result and 'events' not in result:
        result = result['result']
    rates = None
    if args.rates:
        rates = json.loads(Path(args.rates).read_text(encoding='utf-8'))
    out = estimate_cost(result, rates=rates)
    text = json.dumps(out, ensure_ascii=False, indent=2)
    if args.out:
        Path(args.out).write_text(text, encoding='utf-8')
    print(text)


if __name__ == '__main__':
    main()
