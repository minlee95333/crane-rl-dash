# Restricted-zone condition comparison — completed chunked full evaluation

Experiment dir: `python_mappo/experiments/restricted_zone_condition_compare_20260517_084636`

Model: `python_mappo/baselines/restricted_detour_mappo_150ep_valaware_baseline/pytorch_mappo_model.pt`

All listed split summaries use 20 seen seeds, 20 validation seeds, and 30 unseen seeds. Multi-zone validation/unseen were completed by chunked evaluation to avoid environment SIGKILL.

## no_restricted

- seen seeds 101-120: MAPPO 338.122, Nearest 334.411, Random 353.617, delta(Nearest-MAPPO) -3.711, completion 100.0%, hardExecuted 0.0, restrictedExecuted 0.0, detour 0.000
- validation seeds 201-220: MAPPO 330.389, Nearest 361.168, Random 362.841, delta(Nearest-MAPPO) 30.779, completion 100.0%, hardExecuted 0.0, restrictedExecuted 0.0, detour 0.000
- unseen seeds 301-330: MAPPO 324.440, Nearest 353.200, Random 352.111, delta(Nearest-MAPPO) 28.760, completion 100.0%, hardExecuted 0.0, restrictedExecuted 0.0, detour 0.000

## single_restricted

- seen seeds 101-120: MAPPO 319.894, Nearest 341.646, Random 336.721, delta(Nearest-MAPPO) 21.752, completion 100.0%, hardExecuted 0.0, restrictedExecuted 0.0, detour 1.691
- validation seeds 201-220: MAPPO 331.831, Nearest 341.928, Random 338.599, delta(Nearest-MAPPO) 10.097, completion 100.0%, hardExecuted 0.0, restrictedExecuted 0.0, detour 1.995
- unseen seeds 301-330: MAPPO 318.890, Nearest 354.605, Random 361.758, delta(Nearest-MAPPO) 35.714, completion 100.0%, hardExecuted 0.0, restrictedExecuted 0.0, detour 1.529

## multi_restricted

- seen seeds 101-120: MAPPO 334.955, Nearest 344.095, Random 348.090, delta(Nearest-MAPPO) 9.140, completion 100.0%, hardExecuted 0.0, restrictedExecuted 0.0, detour 1.610
- validation seeds 201-220: MAPPO 331.353, Nearest 332.832, Random 335.761, delta(Nearest-MAPPO) 1.479, completion 100.0%, hardExecuted 0.0, restrictedExecuted 0.0, detour 2.582
- unseen seeds 301-330: MAPPO 331.066, Nearest 347.065, Random 336.470, delta(Nearest-MAPPO) 15.999, completion 100.0%, hardExecuted 0.0, restrictedExecuted 0.0, detour 1.368

## Overall interpretation

- Single-zone condition remains the strongest and most stable MAPPO-vs-Nearest result.
- Multi-zone full chunked evaluation now shows MAPPO ahead of Nearest on Seen, Validation, and Unseen while maintaining zero executed hard/restricted violations.
- No-restricted condition is mixed on Seen, but MAPPO remains better on Validation and Unseen.

Safety status: PASS; issues=0
