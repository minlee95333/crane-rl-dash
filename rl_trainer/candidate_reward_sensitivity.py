from __future__ import annotations

import argparse
import copy
import json
from pathlib import Path

try:
    from .train import load_cfg, train
except ImportError:
    from train import load_cfg, train


def parse_ints(text: str):
    return [int(x.strip()) for x in text.split(',') if x.strip()]


def parse_floats(text: str):
    return [float(x.strip()) for x in text.split(',') if x.strip()]


def improve(base: float, value: float) -> float:
    return ((base - value) / base * 100.0) if base else 0.0


def main():
    ap = argparse.ArgumentParser(description='Candidate-K and reward sensitivity sweep for PyTorch MAPPO.')
    ap.add_argument('--config', default=str(Path(__file__).with_name('config.yaml')))
    ap.add_argument('--episodes', type=int, default=80)
    ap.add_argument('--candidate-k', default='5,6')
    ap.add_argument('--p-move', default='-0.02')
    ap.add_argument('--p-time', default='-0.1')
    ap.add_argument('--p-inter-soft', default='-3')
    ap.add_argument('--outroot', default=str(Path(__file__).with_name('outputs_sensitivity')))
    ap.add_argument('--device', default='cpu')
    args = ap.parse_args()

    base_cfg = load_cfg(args.config)
    outroot = Path(args.outroot)
    outroot.mkdir(parents=True, exist_ok=True)
    rows = []
    for k in parse_ints(args.candidate_k):
        for p_move in parse_floats(args.p_move):
            for p_time in parse_floats(args.p_time):
                for p_inter in parse_floats(args.p_inter_soft):
                    cfg = copy.deepcopy(base_cfg)
                    cfg['candidate_k'] = k
                    cfg.setdefault('reward', {})['p_move'] = p_move
                    cfg.setdefault('reward', {})['p_time'] = p_time
                    cfg.setdefault('reward', {})['p_inter_soft'] = p_inter
                    tag = f"K{k}_pMove{str(p_move).replace('-', 'm').replace('.', 'p')}_pTime{str(p_time).replace('-', 'm').replace('.', 'p')}_pSoft{str(p_inter).replace('-', 'm').replace('.', 'p')}"
                    outdir = outroot / tag
                    result = train(cfg, episodes=args.episodes, outdir=str(outdir), device=args.device)
                    seen = result.get('seen', {})
                    unseen = result.get('unseen', {})
                    sm, sn, sr = seen.get('mappo', {}), seen.get('nearest', {}), seen.get('random', {})
                    um, un, ur = unseen.get('mappo', {}), unseen.get('nearest', {}), unseen.get('random', {})
                    row = {
                        'candidateK': k,
                        'pMove': p_move,
                        'pTime': p_time,
                        'pInterSoft': p_inter,
                        'episodes': args.episodes,
                        'outdir': str(outdir),
                        'seenMAPPO': sm.get('makespan'),
                        'seenNearest': sn.get('makespan'),
                        'seenRandom': sr.get('makespan'),
                        'seenImproveVsNearestPct': improve(sn.get('makespan', 0), sm.get('makespan', 0)),
                        'unseenMAPPO': um.get('makespan'),
                        'unseenNearest': un.get('makespan'),
                        'unseenRandom': ur.get('makespan'),
                        'unseenImproveVsNearestPct': improve(un.get('makespan', 0), um.get('makespan', 0)),
                        'unseenImproveVsRandomPct': improve(ur.get('makespan', 0), um.get('makespan', 0)),
                        'completionUnseen': um.get('completeRate'),
                        'hardExecutedUnseen': um.get('hardExecuted'),
                        'hardMaskUnseen': um.get('hardMask'),
                        'softUnseen': um.get('soft'),
                        'moveUnseen': um.get('move'),
                        'setupUnseen': um.get('setup'),
                        'teardownUnseen': um.get('teardown'),
                    }
                    rows.append(row)
                    rows_sorted = sorted(rows, key=lambda r: (-(r.get('unseenImproveVsNearestPct') or -999), r.get('unseenMAPPO') or 999999))
                    (outroot / 'candidate_reward_sensitivity_summary.json').write_text(json.dumps({'runs': rows, 'ranked': rows_sorted}, ensure_ascii=False, indent=2), encoding='utf-8')
    print(json.dumps({'runs': rows, 'ranked': sorted(rows, key=lambda r: (-(r.get('unseenImproveVsNearestPct') or -999), r.get('unseenMAPPO') or 999999))}, ensure_ascii=False, indent=2))


if __name__ == '__main__':
    main()
