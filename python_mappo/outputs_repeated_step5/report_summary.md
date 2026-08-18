# Stage-1 PyTorch MAPPO 반복 검증 요약

- 반복 run 수: 3
- Unseen MAPPO makespan 평균: 315.16
- Unseen MAPPO makespan run 간 표준편차: 12.26
- Unseen Nearest 대비 평균 개선율: 5.40%
- Seen Nearest 대비 평균 개선율: 6.48%
- Unseen 완료율 평균: 100.00%
- Unseen 실행 hard overlap 평균: 0.00
- Unseen HardMask 평균: 12.72

## Run별 결과

### group1_train101-110_unseen201-220
- train seeds: 101~110
- episodes: 80
- seen MAPPO makespan: 317.77 / Nearest 개선율 8.65%
- unseen MAPPO makespan: 321.32 / Nearest 개선율 9.61%
- hardExecuted unseen: 0.00, HardMask unseen: 15.50

### group2_train111-120_unseen231-250
- train seeds: 111~120
- episodes: 80
- seen MAPPO makespan: 313.31 / Nearest 개선율 8.24%
- unseen MAPPO makespan: 298.05 / Nearest 개선율 6.55%
- hardExecuted unseen: 0.00, HardMask unseen: 11.20

### group3_train121-130_unseen261-280
- train seeds: 121~130
- episodes: 80
- seen MAPPO makespan: 316.60 / Nearest 개선율 2.56%
- unseen MAPPO makespan: 326.11 / Nearest 개선율 0.05%
- hardExecuted unseen: 0.00, HardMask unseen: 11.45
