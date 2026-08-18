# restricted_detour_mappo_150ep_valaware_baseline

Official baseline candidate promoted after expanded validation.

## Training
- Engine: PyTorch MAPPO
- Episodes: 150
- Checkpoint selection: validation-aware
- Training mode: split train/evaluate, `--skip-final-eval --no-representative`
- Source run: `python_mappo/dashboard_runs/restricted_detour_150ep_valaware_split_20260517_054311`

## Scenario
- Cranes: 3 fixed 50-ton mobile cranes
- Lifts: 24
- Restricted zone: `RZ1` rectangle `x=40~60`, `y=40~60`
- Restricted clearance: 1.0
- Rule: crane initial/setup points and crane travel paths cannot enter/cross restricted zones; lifts may be inside; detour pathfinding uses waypoint visibility graph.

## Expanded validation
- Seen: seeds 101-120, 20 seeds
- Validation: seeds 201-220, 20 seeds
- Unseen: seeds 301-330, 30 seeds

## Expanded validation summary
- Seen MAPPO makespan: 319.894 vs Nearest 341.646, delta +21.752 in favor of MAPPO
- Validation MAPPO makespan: 331.831 vs Nearest 341.928, delta +10.097 in favor of MAPPO
- Unseen MAPPO makespan: 318.890 vs Nearest 354.605, delta +35.714 in favor of MAPPO
- Completion: 100% in all expanded splits
- HardExecuted: 0 in all expanded splits
- RestrictedExecuted: 0 in all expanded splits

> **Heuristic baselines predate the policy split.** The `Nearest` numbers above
> and the `nearest` / `radiusPriority` columns in this directory's
> `pytorch_mappo_validation_result.json` and `expanded_*` files were produced
> before commit `9600fe2` separated the two heuristics, when both fell through to
> the degenerate first-candidate policy (so the two columns are identical). For a
> baseline comparison with genuinely distinct heuristics see
> [`postsplit_heuristic_compare_20260620/SUMMARY.md`](postsplit_heuristic_compare_20260620/SUMMARY.md).
> The pre-split files are left untouched as historical records.

## Status
Promoted baseline for current Stage-1 restricted-zone detour MAPPO experiments. Continue to treat soft interference as secondary; baseline success is based on makespan, completion, zero executed hard overlap, and zero restricted-zone violations.
