# 기준 모델 vs K=5, pMove=-0.05 후보 장기 검증

## 비교 조건

- 문제: 3C / 24L
- 평가 seed: 201–230, 30개
- 비교 baseline: Nearest, Random
- 안전 기준: completion 100%, executed hard overlap 0.0 유지 여부

## 결과

### 기준 안정화 L2 모델

- model: `python_mappo/outputs_curriculum_stabilized_l2/L2_3C24L_best_model.pt`
- MAPPO makespan: 316.401
- Nearest makespan: 348.069
- Random makespan: 344.591
- Nearest 대비 개선율: +9.10%
- completion: 100.0%
- executed hard overlap: 0.0
- soft: 6.20
- move: 143.49
- setup: 120.33

### 후보: K=5, pMove=-0.05, 200 episode

- model: `python_mappo/outputs_sensitivity_k5_pmove005_long/K5_pMovem0p05_pTimem0p1_pSoftm3p0/pytorch_mappo_model.pt`
- MAPPO makespan: 321.280
- Nearest makespan: 348.069
- Random makespan: 344.591
- Nearest 대비 개선율: +7.70%
- completion: 100.0%
- executed hard overlap: 0.0
- soft: 3.57
- move: 177.48
- setup: 92.33

## 판정

- makespan 기준: 기준 안정화 L2 모델이 더 좋음.
- 안전성 기준: 두 모델 모두 completion 100%, executed hard overlap 0.0.
- soft exposure/setup 기준: pMove=-0.05 후보가 soft와 setup은 더 낮음.
- move 기준: pMove=-0.05 후보가 move distance는 더 큼.

## 권고

최종 기준 모델은 기존 안정화 L2 모델을 유지한다. pMove=-0.05 후보는 soft 노출과 setup 감소 목적의 보조 후보로 보관하되, makespan 최우선 기준에서는 채택하지 않는다.
