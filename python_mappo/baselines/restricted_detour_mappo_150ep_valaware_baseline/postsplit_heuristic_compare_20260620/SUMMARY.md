# Post-split heuristic baseline comparison — 2026-06-20

Regenerated `nearest` / `radiusPriority` baselines after the heuristic policy
separation (commit `9600fe2`, *"distinct heuristics"*). Use **these** numbers for
any new baseline comparison; the older dated artifacts predate the split.

## Why this exists

Before the fix, both heuristic baselines fell through to `actions = [0, …]`
(always the first Candidate-K slot), so `nearest` and `radiusPriority` were the
**same degenerate policy** and produced identical rows. For example, the
pre-split `expanded_validation_201_220.json` reports them as exactly equal:

| policy (pre-split) | makespan | move | soft |
|---|--:|--:|--:|
| Nearest | 341.93 | 135.77 | 2.90 |
| Same-radius-priority | 341.93 | 135.77 | 2.90 |

`crane_core/env.py` now ranks Candidate-K slots per policy:

- **Nearest** — by physical distance from the crane's current setup, then
  finish / soft-risk / move / id.
- **Same-radius-priority** — keep the current setup whenever possible
  (`same` first), then finish / soft-risk / move / id.

## How it was regenerated

```
python -m rl_trainer.evaluate \
  --config config.yaml \
  --model  pytorch_mappo_model.pt \
  --seed-start <S> --seed-count <N> --out <split>.json
```

Model: `pytorch_mappo_model.pt` (restricted-detour 150ep val-aware baseline).
Greedy rollouts; heuristics are deterministic, so these are exactly
reproducible. Per-split raw results: `seen.json`, `validation.json`,
`unseen.json` in this directory.

## Results (post-split)

### seen  (seed 101–120, n=20)
| policy | makespan | makespanSd | complete% | soft | move |
|---|--:|--:|--:|--:|--:|
| PyTorch MAPPO | 344.15 | 32.59 | 100.0 | 5.45 | 274.63 |
| Nearest | 371.78 | 29.18 | 100.0 | 5.65 | 207.80 |
| Same-radius-priority | 368.20 | 29.13 | 100.0 | 6.05 | 205.05 |
| Random | 347.21 | 21.26 | 100.0 | 6.25 | 346.08 |

### validation  (seed 201–220, n=20)
| policy | makespan | makespanSd | complete% | soft | move |
|---|--:|--:|--:|--:|--:|
| PyTorch MAPPO | 347.16 | 58.59 | 100.0 | 6.25 | 232.05 |
| Nearest | 354.64 | 29.04 | 100.0 | 8.20 | 195.39 |
| Same-radius-priority | 373.64 | 59.37 | 100.0 | 7.45 | 180.65 |
| Random | 368.03 | 36.74 | 100.0 | 5.10 | 290.92 |

### unseen  (seed 301–330, n=30)
| policy | makespan | makespanSd | complete% | soft | move |
|---|--:|--:|--:|--:|--:|
| PyTorch MAPPO | 343.35 | 27.99 | 100.0 | 7.63 | 264.88 |
| Nearest | 372.02 | 35.23 | 100.0 | 7.33 | 194.44 |
| Same-radius-priority | 371.61 | 37.78 | 100.0 | 6.97 | 183.89 |
| Random | 352.81 | 36.33 | 100.0 | 6.00 | 315.55 |

## Reading the numbers

- The two heuristics are now genuinely different rows. `Same-radius-priority`
  trades makespan for the **lowest movement** of any policy (it avoids
  re-setup), while `Nearest` keeps makespan tighter at higher travel.
- PyTorch MAPPO keeps the **best makespan** across all three splits, buying it
  with more movement than the heuristics — the policy it was rewarded for.
- All policies complete 100% on this scenario, so makespan / soft / move are the
  discriminating axes here.

> Older `pytorch_mappo_validation_result.json` / `expanded_*` files and the
> dated `dashboard_runs/` and experiment outputs are kept as historical records
> of what ran at the time and are **not** edited. Their `nearest` /
> `radiusPriority` columns reflect the pre-split degenerate policy.
