"""Rule-based schedule scorer.

Consumes a result dict produced by env.run_policy / env.run_policy_layout
(i.e. the JSON returned by /api/plan/run or stored in
pytorch_mappo_unseen_eval.json -> representative.<policy>) and produces a
0~100 점수 with category breakdown. Pure-Python, no ML dependency — the
weights are explicit so users can tune them in `DEFAULT_WEIGHTS`.

CLI:
    python -m python_mappo.scorer --in result.json [--out score.json]
"""
from __future__ import annotations

import argparse
import json
from pathlib import Path
from typing import Dict, List, Optional


# Category weights — must sum to 100. Tunable.
# Hard 간섭과 제한구역 진입은 env.candidate_actions/step에서 후보 자체가 걸러져
# hardExecuted=0, restrictedExecuted=0이 구조적으로 보장되어 채점 항목에서 제외.
# 이동/우회 항목은 "어쩔 수 없는 이동량"을 반영하지 못한다는 한계로 일단 제외.
# 부하 균형은 양중 개수 균형(10)과 작업 시간 균형(10) 두 항목으로 분리.
DEFAULT_WEIGHTS = {
    'completion':     25,  # 모든 양중을 완료했는가
    'makespan':       30,  # 총 작업시간이 이론 하한에 얼마나 가까운가
    'softInterference': 25,  # soft 간섭이 양중당 몇 건 발생했는가
    'jobBalance':     10,  # 각 크레인의 양중 개수가 얼마나 동일한가
    'timeBalance':    10,  # 각 크레인의 작업 시간이 얼마나 동등한가
}

GRADE_THRESHOLDS = [
    (90, 'A+'), (80, 'A'), (70, 'B'), (60, 'C'), (50, 'D'),
]


def _grade(total: float) -> str:
    for th, g in GRADE_THRESHOLDS:
        if total >= th:
            return g
    return 'F'


def _clip(x: float, lo: float = 0.0, hi: float = 100.0) -> float:
    return max(lo, min(hi, x))


def _infer_counts(result: dict) -> Dict[str, int]:
    """Derive nC (cranes), nL (lifts) from the result dict. Falls back to defaults."""
    events = result.get('events') or []
    total = int(result.get('total') or 0)
    if not total:
        total = len({e.get('liftId') for e in events if e.get('liftId') is not None})
    layout = result.get('layout') or {}
    cranes = result.get('cranes') or layout.get('cranes') or []
    nC = len(cranes) if cranes else len({e.get('craneId') for e in events if e.get('craneId') is not None})
    return {'nC': max(1, int(nC or 1)), 'nL': max(1, int(total or 1))}


def _score_completion(result: dict, nL: int) -> Dict:
    done = int(result.get('done') or 0)
    rate = done / max(1, nL)
    score = 100.0 * rate
    return {
        'score': _clip(score),
        'detail': f'완료 {done}/{nL} → 100 × {done}/{nL} = {score:.1f}',
    }


def _score_makespan(result: dict, nC: int, nL: int, params: dict) -> Dict:
    """단순 비율 공식: 100 × (nL/nC × fixed_duration) / makespan, 100 캡.

    분자 (nL/nC) × fixed_duration = 양중을 크레인 수로 균등 분배했을 때의 이상 makespan
                                    (setup·이동·간섭이 모두 0인 가정).
    분모 makespan                = 실제 마지막 크레인 완료 시각.
    실제 makespan이 이상값 이하라면 만점(100). 더 길어질수록 비례적으로 감점.
    """
    fixed_d = float(params.get('fixed_duration', 25.0))
    ms = float(result.get('makespan') or 0.0)
    if ms <= 0:
        return {'score': 0.0, 'detail': 'makespan 정보 없음'}
    nc_eff = max(1, int(nC or 1))
    ideal = (nL / nc_eff) * fixed_d
    score = 100.0 * ideal / ms
    return {
        'score': _clip(score),
        'detail': (f'makespan {ms:.1f}분 ((양중 {nL}건 / 크레인 {nc_eff}대) × {fixed_d:.1f}분 = {ideal:.1f}분 기준) → '
                   f'100 × {ideal:.1f} / {ms:.1f} = {score:.1f}'),
    }


def _score_soft_interference(result: dict, nL: int) -> Dict:
    """Count lifts handled in a step by working-radius-overlapping cranes.

    Each lift contributes at most once, so 0 risky lifts is 100 and all nL
    lifts being exposed is 0.
    """
    soft = int(result.get('softInter') or result.get('soft') or 0)
    score = _clip(100.0 * (1.0 - soft / max(1, nL)))
    return {
        'score': score,
        'detail': f'soft 간섭 {soft}건 → 100 × (1 − {soft}/{nL}) = {score:.1f}',
    }


def _per_crane_stats(result: dict, nC: int) -> Optional[dict]:
    """크레인별 양중 개수·busy time과 정수 제약 하 최선 분배(floor/ceil)를 한 번에 산출.
    크레인 2대 미만이거나 이벤트 없으면 None 반환."""
    events = result.get('events') or []
    if not events or nC <= 1:
        return None
    cranes_info = result.get('cranes') or []
    if cranes_info:
        crane_ids = [str(c.get('id')) for c in cranes_info if c.get('id')]
    else:
        crane_ids = sorted({str(e.get('craneId')) for e in events if e.get('craneId') is not None})
    if len(crane_ids) < 2:
        return None
    per_jobs = {cid: 0 for cid in crane_ids}
    per_busy = {cid: 0.0 for cid in crane_ids}
    for e in events:
        cid = str(e.get('craneId') or '')
        if cid not in per_jobs:
            continue
        per_jobs[cid] += 1
        per_busy[cid] += (
            float(e.get('teardown', 0) or 0)
            + float(e.get('finalTeardown', 0) or 0)
            + float(e.get('travel', 0) or 0)
            + float(e.get('setup', 0) or 0)
            + float(e.get('duration', 0) or 0)
        )
    nC_actual = len(crane_ids)
    total_assigned = sum(per_jobs.values())
    if total_assigned > 0:
        ideal_max = -(-total_assigned // nC_actual)  # ceil
        ideal_min = total_assigned // nC_actual      # floor
        ideal_ratio = ideal_min / ideal_max if ideal_max > 0 else 1.0
    else:
        ideal_max = ideal_min = 0
        ideal_ratio = 1.0
    return {'crane_ids': crane_ids, 'per_jobs': per_jobs, 'per_busy': per_busy,
            'ideal_max': ideal_max, 'ideal_min': ideal_min, 'ideal_ratio': ideal_ratio}


def _score_job_balance(stats: Optional[dict]) -> Dict:
    """양중 개수 균형: 시나리오 최선 분배(⌊nL/nC⌋/⌈nL/nC⌉ 비율)를 100점 기준으로 두고
    실제 min/max 비율이 얼마나 가까운지로 점수. nL=25, nC=3이면 {9,8,8}이 100점."""
    if stats is None:
        return {'score': 100.0, 'detail': '크레인 2대 미만 또는 이벤트 없음 — 만점 처리'}
    crane_ids = stats['crane_ids']
    per_jobs = stats['per_jobs']
    ideal_max, ideal_min, ideal_ratio = stats['ideal_max'], stats['ideal_min'], stats['ideal_ratio']
    jobs_vals = list(per_jobs.values())
    max_jobs, min_jobs = max(jobs_vals), min(jobs_vals)
    if max_jobs == 0:
        return {'score': 100.0, 'detail': '양중 0건 → 100.0'}
    actual_ratio = min_jobs / max_jobs
    score = _clip(100.0 * actual_ratio / ideal_ratio) if ideal_ratio > 0 else 100.0
    jobs_text = ', '.join(f'{k}:{per_jobs[k]}' for k in crane_ids)
    return {
        'score': score,
        'detail': f'양중 개수 [{jobs_text}] → 100 × ({min_jobs}/{max_jobs}) / ({ideal_min}/{ideal_max}) = {score:.1f}',
    }


def _score_time_balance(stats: Optional[dict]) -> Dict:
    """작업 시간 균형: 각 크레인의 busy time = teardown+travel+setup+duration 합.
    단순 min/max 비율로 점수화."""
    if stats is None:
        return {'score': 100.0, 'detail': '크레인 2대 미만 또는 이벤트 없음 — 만점 처리'}
    crane_ids = stats['crane_ids']
    per_busy = stats['per_busy']
    busy_vals = list(per_busy.values())
    max_busy, min_busy = max(busy_vals), min(busy_vals)
    if max_busy <= 0:
        return {'score': 100.0, 'detail': '작업 시간 0 → 100.0'}
    score = _clip(100.0 * min_busy / max_busy)
    busy_text = ', '.join(f'{k}:{per_busy[k]:.1f}' for k in crane_ids)
    return {
        'score': score,
        'detail': f'작업 시간 [{busy_text}] → 100 × {min_busy:.1f}/{max_busy:.1f} = {score:.1f}',
    }


def score_schedule(result: dict, params: Optional[dict] = None, weights: Optional[dict] = None) -> dict:
    """Compute a 0~100 schedule grade with category breakdown.

    Args:
      result: env.run_policy / env.run_policy_layout 결과 (events + summary 필드).
      params: optional env parameters {fixed_duration, setup_time, teardown_time, num_cranes, num_lifts}.
              없으면 result에서 추론.
      weights: optional category weight overrides. 합이 0이면 DEFAULT_WEIGHTS 사용.

    Returns:
      {'totalScore': float, 'grade': str, 'categories': {name: {weight, score, weighted, detail}}}
    """
    params = dict(params or {})
    counts = _infer_counts(result)
    nC = int(params.get('num_cranes') or counts['nC'])
    nL = int(params.get('num_lifts') or counts['nL'])

    w = dict(DEFAULT_WEIGHTS)
    if weights:
        for k, v in weights.items():
            if k in w and v is not None:
                w[k] = float(v)
    w_sum = sum(w.values()) or 1.0

    balance_stats = _per_crane_stats(result, nC)
    cats = {
        'completion': _score_completion(result, nL),
        'makespan': _score_makespan(result, nC, nL, params),
        'softInterference': _score_soft_interference(result, nL),
        'jobBalance': _score_job_balance(balance_stats),
        'timeBalance': _score_time_balance(balance_stats),
    }
    total = 0.0
    cat_out = {}
    for name, cat in cats.items():
        weight = float(w.get(name, 0.0))
        score = float(cat['score'])
        weighted = score * weight / w_sum
        total += weighted
        cat_out[name] = {
            'weight': weight,
            'score': round(score, 2),
            'weighted': round(weighted, 2),
            'detail': cat['detail'],
        }

    return {
        'totalScore': round(total, 2),
        'grade': _grade(total),
        'weightsSum': round(w_sum, 2),
        'counts': {'numCranes': nC, 'numLifts': nL},
        'categories': cat_out,
    }


def main():
    ap = argparse.ArgumentParser(description='Score a hoist schedule produced by the RL agent.')
    ap.add_argument('--in', dest='inp', required=True, help='Path to schedule result JSON')
    ap.add_argument('--out', default='', help='Optional path to write the score JSON')
    ap.add_argument('--fixed-duration', type=float, default=None)
    ap.add_argument('--setup-time', type=float, default=None)
    ap.add_argument('--teardown-time', type=float, default=None)
    args = ap.parse_args()

    with open(args.inp, encoding='utf-8') as f:
        result = json.load(f)
    # If the file is a /api/plan/run-style { ok, result }, unwrap.
    if isinstance(result, dict) and 'result' in result and 'events' not in result:
        result = result['result']
    params = {}
    if args.fixed_duration is not None:
        params['fixed_duration'] = args.fixed_duration
    if args.setup_time is not None:
        params['setup_time'] = args.setup_time
    if args.teardown_time is not None:
        params['teardown_time'] = args.teardown_time
    out = score_schedule(result, params=params)
    text = json.dumps(out, ensure_ascii=False, indent=2)
    if args.out:
        Path(args.out).write_text(text, encoding='utf-8')
    print(text)


if __name__ == '__main__':
    main()
