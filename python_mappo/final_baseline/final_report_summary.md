# 다중 모바일 크레인 양중 스케줄링을 위한 PyTorch Curriculum MAPPO 연구 결과 요약

## 1. 연구 목적

본 연구의 목적은 플랜트/EPC 양중 작업에서 복수의 모바일 크레인이 여러 양중물을 안전하고 효율적으로 처리하도록 하는 강화학습 기반 스케줄링 방법을 검토하는 것이다. Stage-1 prototype에서는 50톤 모바일 크레인만을 대상으로 하며, 각 크레인은 하나의 agent로 모델링된다. 학습 목표는 모든 양중물을 완료하면서 makespan을 줄이고, 실제 hard lifting-radius overlap은 실행되지 않도록 차단하며, 이동/준비 효율과 soft 근접 노출을 보조적으로 관리하는 것이다.

본 문서는 현재 구현된 PyTorch MAPPO 엔진과 브라우저 대시보드 검증 결과를 바탕으로 최종 기준 모델, 일반화 성능, 반복 실험, 민감도 분석 및 향후 확장 방향을 정리한다.

## 2. Stage-1 문제 설정

### 기본 가정

- 크레인 타입: 50톤 모바일 크레인 고정
- 크레인 1대 = 강화학습 agent 1개
- 양중물 수와 크레인 수는 curriculum level별로 증가
- 모든 양중물의 duration은 고정값 사용
- crane setup point가 바뀌면 setup time 발생
- 같은 setup point의 작업반경 내 연속 작업은 setup time 0 가능
- action은 전체 양중물 ID 직접 선택이 아니라 Candidate-K slot 선택
- actual lifting radius 기준 hard overlap은 실행 불가능 action으로 처리
- soft safety-radius overlap은 reward shaping 보조 지표로 사용

### 평가 우선순위

1. Makespan
2. 완료율 및 executed hard overlap 0 유지
3. 이동 거리 / setup 효율
4. soft near-work exposure
5. 누적 reward

## 3. 알고리즘 구조

### PyTorch MAPPO 구조

- Actor: type-shared actor
- Critic: centralized critic
- Agent: crane별 local observation 사용
- Critic input: global state 사용
- Action: Candidate-K slot 선택
- Evaluation: deterministic greedy policy
- 학습: PPO clipped objective + GAE + entropy bonus + value loss

### Candidate-K action 구조

각 agent는 매 step에서 전체 남은 양중물 중 일부 후보만 직접 비교한다. Actor는 후보 양중물 자체의 ID가 아니라 Candidate-K 목록의 slot을 선택한다. 이 구조는 seed와 scenario가 바뀌어도 action space가 고정되므로 일반화에 유리하다.

### Safety 처리

- `hardExecuted`: 실제 실행된 hard overlap count. 안전성 핵심 지표이며 0이어야 한다.
- `HardMask`: 실행 전에 차단된 infeasible candidate 수. 사고가 아니라 safety filter가 작동한 횟수이다.
- `soft`: 허용 가능한 근접 작업 노출 또는 reward shaping 신호이다. soft 노출은 보조 지표이며 primary failure metric은 아니다.

## 4. Reward 설계

현재 Stage-1 reward는 다음 요소를 포함한다.

- 단일 양중 완료 보상
- 전체 양중 완료 보상
- 같은 setup point 작업반경 내 반복 작업 보상
- idle penalty
- soft overlap shaping penalty
- time/makespan 관련 penalty
- crane movement distance penalty

현재 기본 이동 penalty는 다음과 같다.

```text
pMove = -0.02 per coordinate unit/meter
```

Sensitivity 후보로 `pMove = -0.05`도 검토했지만, 최종 makespan 기준에서는 기존 안정화 모델이 더 우수했다.

## 5. Curriculum 학습 구조

Curriculum은 다음 3단계로 구성된다.

- Level 1: 2 cranes / 12 lifts
- Level 2: 3 cranes / 24 lifts
- Level 3: 4 cranes / 36 lifts

학습은 level별로 모델을 새로 초기화하지 않고, 이전 level의 actor/critic 가중치를 다음 level로 이어받는 방식이다.

```text
L1 2C/12L → L2 3C/24L → L3 4C/36L
```

이 방식은 작은 문제에서 기본 dispatching pattern을 학습한 뒤, 더 큰 문제에서 정책을 확장하도록 한다.

## 6. Validation-aware checkpoint selection

초기 3000 episode curriculum 실험에서는 Level 2 seen 성능은 좋았지만, unseen에서는 Nearest heuristic보다 약간 낮은 결과가 나타났다. 이를 해결하기 위해 우선 Level 2에 validation-aware checkpoint selection을 적용했다. 이후 구현은 모든 curriculum level에서 validation-aware checkpoint selection을 사용할 수 있도록 확장하였다. 즉, validation seed가 제공되면 L1/L2/L3 각 level의 checkpoint 선택에 동일한 seen/validation 기반 score가 적용된다.

### Seed 분리

- Train seeds: 101–140
- Seen evaluation: 101–110
- Validation seeds: 201–220
- Final unseen test seeds: 301–330

### Checkpoint selection score

```text
score =
  0.3 × seen_mappo_makespan
+ 0.7 × validation_mappo_makespan
+ 2.0 × max(0, validation_mappo - validation_nearest)
```

이 score는 seen 성능만 좋은 모델이 아니라 validation에서 Nearest보다 안정적으로 우수한 모델을 선택하도록 설계되었다. `hardExecuted`는 환경 실행 단계에서 구조적으로 차단되어 항상 0이어야 하므로 현재 코드의 checkpoint score에는 포함하지 않는다.

## 7. 최종 기준 모델

최종 기준 모델은 다음 경로에 고정했다.

```text
python_mappo/final_baseline/curriculum_mappo_model.pt
python_mappo/final_baseline/curriculum_mappo_result.json
python_mappo/final_baseline/curriculum_learning_curve.csv
```

이 모델은 `outputs_curriculum_stabilized_l2` 결과를 기준으로 고정했으며, Level 1/2/3에서 Nearest 대비 개선을 보이고 completion 100%, executed hard overlap 0을 유지한다.

## 8. 최종 기준 모델 성능

### Level 1 — 2C / 12L

#### Seen

- MAPPO makespan: 212.093
- Nearest makespan: 224.799
- Random makespan: 222.458
- Nearest 대비 개선율: +5.65%
- Completion: 100.0%
- Executed hard overlap: 0.0

#### Unseen

- MAPPO makespan: 232.351
- Nearest makespan: 241.083
- Random makespan: 256.487
- Nearest 대비 개선율: +3.62%
- Completion: 100.0%
- Executed hard overlap: 0.0

### Level 2 — 3C / 24L

#### Seen

- MAPPO makespan: 333.133
- Nearest makespan: 347.840
- Random makespan: 358.890
- Nearest 대비 개선율: +4.23%
- Completion: 100.0%
- Executed hard overlap: 0.0

#### Validation

- MAPPO makespan: 317.339
- Nearest makespan: 355.474
- Random makespan: 352.330
- Nearest 대비 개선율: +10.73%
- Completion: 100.0%
- Executed hard overlap: 0.0

#### Unseen

- MAPPO makespan: 322.856
- Nearest makespan: 338.000
- Random makespan: 344.856
- Nearest 대비 개선율: +4.48%
- Completion: 100.0%
- Executed hard overlap: 0.0

### Level 3 — 4C / 36L

#### Seen

- MAPPO makespan: 372.024
- Nearest makespan: 401.108
- Random makespan: 427.569
- Nearest 대비 개선율: +7.25%
- Completion: 100.0%
- Executed hard overlap: 0.0

#### Unseen

- MAPPO makespan: 374.036
- Nearest makespan: 399.452
- Random makespan: 406.560
- Nearest 대비 개선율: +6.36%
- Completion: 100.0%
- Executed hard overlap: 0.0

## 9. 기존 3000 episode 결과와 안정화 결과 비교

초기 3000 episode curriculum에서는 Level 2 unseen 결과가 다음과 같았다.

```text
MAPPO:   341.743
Nearest: 332.218
Nearest 대비: -2.87%
```

Validation-aware 안정화 이후 Level 2 final unseen 결과는 다음과 같다.

```text
MAPPO:   322.856
Nearest: 338.000
Nearest 대비: +4.48%
```

따라서 validation-aware checkpoint selection과 Level 2 train seed diversity 확대는 Level 2 unseen 일반화 약점을 완화하는 데 효과가 있었다.

## 10. 긴 학습 결과 해석

추가로 더 긴 curriculum 학습도 실행했다.

```text
Level 1: 200 episode
Level 2: 1200 episode
Level 3: 400 episode
총 소요 시간: 약 564초
```

긴 학습 결과는 안전성 측면에서는 여전히 안정적이었다.

- Completion: 전 level 100%
- Executed hard overlap: 전 level 0.0

그러나 makespan 기준에서는 최종 기준 안정화 모델보다 항상 좋지는 않았다.

### 긴 학습 주요 결과

- Level 1 unseen: MAPPO 246.877 vs Nearest 241.083, -2.40%
- Level 2 unseen: MAPPO 343.364 vs Nearest 338.000, -1.59%
- Level 3 unseen: MAPPO 393.249 vs Nearest 399.452, +1.55%

따라서 단순히 episode를 늘리는 것이 unseen 일반화 성능을 단조롭게 개선하지는 않았다. 현재 기준에서는 긴 학습 모델보다 validation-aware stabilized baseline을 최종 기준 모델로 채택하는 것이 타당하다.

## 11. 반복 실험 통계

3개 seed group에 대해 반복 검증을 수행했다.

### Aggregate 결과

- 반복 run 수: 3
- Unseen MAPPO makespan 평균: 315.16
- Unseen MAPPO makespan run 간 표준편차: 12.26
- Unseen Nearest 대비 평균 개선율: +5.40%
- Seen Nearest 대비 평균 개선율: +6.48%
- Unseen completion 평균: 100.00%
- Unseen executed hard overlap 평균: 0.00
- Unseen HardMask 평균: 12.72

### Run별 결과

#### Group 1

- Train seeds: 101–110
- Unseen seeds: 201–220
- Unseen MAPPO makespan: 321.32
- Nearest 대비 개선율: +9.61%
- HardExecuted unseen: 0.00

#### Group 2

- Train seeds: 111–120
- Unseen seeds: 231–250
- Unseen MAPPO makespan: 298.05
- Nearest 대비 개선율: +6.55%
- HardExecuted unseen: 0.00

#### Group 3

- Train seeds: 121–130
- Unseen seeds: 261–280
- Unseen MAPPO makespan: 326.11
- Nearest 대비 개선율: +0.05%
- HardExecuted unseen: 0.00

반복 실험 결과, seed group별 편차는 존재하지만 평균적으로 Nearest 대비 개선되며, safety constraint는 안정적으로 유지된다.

## 12. Candidate-K 및 reward sensitivity 분석

Sensitivity 실험에서는 Candidate K와 pMove를 비교했다.

### 짧은 sweep 결과

#### K=5, pMove=-0.05

- Unseen MAPPO: 324.151
- Unseen Nearest: 348.069
- Nearest 대비 개선율: +6.87%
- Completion: 100.0%
- Executed hard overlap: 0.0

#### K=5, pMove=-0.02

- Unseen MAPPO: 329.224
- Unseen Nearest: 348.069
- Nearest 대비 개선율: +5.41%
- Completion: 100.0%
- Executed hard overlap: 0.0

#### K=6, pMove=-0.05

- Unseen MAPPO: 343.023
- Unseen Nearest: 341.262
- Nearest 대비 개선율: -0.52%
- Completion: 100.0%
- Executed hard overlap: 0.0

#### K=6, pMove=-0.02

- Unseen MAPPO: 351.660
- Unseen Nearest: 341.262
- Nearest 대비 개선율: -3.05%
- Completion: 100.0%
- Executed hard overlap: 0.0

### Sensitivity 해석

짧은 sweep 기준으로는 K=5가 K=6보다 안정적이었다. pMove=-0.05는 pMove=-0.02보다 일부 조건에서 soft/setup 감소에 유리하지만, 최종 makespan 기준 모델을 대체할 정도는 아니었다.

## 13. 기준 모델 vs K=5, pMove=-0.05 후보 장기 검증

K=5, pMove=-0.05 후보를 200 episode로 추가 검증했다.

### 동일 seed 조건 비교: 201–230

#### 기준 안정화 L2 모델

- MAPPO makespan: 316.401
- Nearest makespan: 348.069
- Random makespan: 344.591
- Nearest 대비 개선율: +9.10%
- Completion: 100.0%
- Executed hard overlap: 0.0
- Soft: 6.20
- Move: 143.49
- Setup: 120.33

#### K=5, pMove=-0.05 후보

- MAPPO makespan: 321.280
- Nearest makespan: 348.069
- Random makespan: 344.591
- Nearest 대비 개선율: +7.70%
- Completion: 100.0%
- Executed hard overlap: 0.0
- Soft: 3.57
- Move: 177.48
- Setup: 92.33

### 판정

- Makespan 기준: 기준 안정화 L2 모델이 더 우수하다.
- Safety 기준: 두 모델 모두 completion 100%, executed hard overlap 0.0이다.
- Soft/setup 기준: K=5, pMove=-0.05 후보가 더 낮다.
- Move 기준: 기준 안정화 L2 모델이 더 낮다.

따라서 논문/보고서의 메인 모델은 기준 안정화 모델로 유지하고, K=5, pMove=-0.05는 operational trade-off 또는 sensitivity 분석 후보로 제시하는 것이 적절하다.

## 14. 대시보드 및 시각화 연동

PyTorch curriculum 결과 JSON은 브라우저 대시보드에서 import/replay 가능하도록 연동했다.

검증된 기능은 다음과 같다.

- Curriculum level selector: L1 / L2 / L3
- Split selector: Seen / Validation / Unseen
- Baseline comparison rows rendering
- Representative MAPPO replay 연결
- Replay slider max와 makespan 일치
- Event geometry fields 포함 확인
  - radiusCenterX
  - radiusCenterY
  - actualLiftRadius
  - craneRadius

대시보드 요약용 SVG는 다음 경로에 저장했다.

```text
python_mappo/final_baseline/dashboard_summary.svg
```

## 15. 주요 결론

1. PyTorch MAPPO는 Stage-1 multi-crane scheduling 문제에서 baseline 대비 makespan 개선 가능성을 보였다.
2. Curriculum 구조는 4C/36L처럼 큰 문제에서 특히 효과가 나타났다.
3. 단순 episode 증가만으로 unseen 일반화가 항상 좋아지지는 않았다.
4. Validation-aware checkpoint selection은 Level 2 unseen 일반화 약점을 개선하는 데 효과적이었다.
5. 최종 기준 모델은 Level 1/2/3에서 completion 100%, executed hard overlap 0.0을 유지했다.
6. HardMask는 사고가 아니라 infeasible candidate가 사전에 차단된 count이다.
7. Soft interference는 대시보드 크레인 작업반경 중첩에 대한 보조 shaping 지표이며, makespan 및 hard safety보다 후순위로 해석해야 한다.
8. K=5 action candidate 구조가 현재 조건에서는 K=6보다 안정적이었다.
9. pMove=-0.05는 soft/setup 감소에는 유리하지만, 최종 makespan 기준에서는 기준 안정화 모델을 대체하지 못했다.

## 16. 한계

현재 결과는 Stage-1 prototype 기준이다. 다음 한계가 있다.

- 크레인 타입은 50톤 모바일 크레인으로 고정되어 있다.
- 양중물 duration은 고정값을 사용한다.
- 실제 현장 제약인 지반 조건, 작업 허가, rigging resource, 선후행 공정, 장비 반입 동선 등은 아직 포함되지 않았다.
- Python scenario generator와 브라우저 scenario generator의 완전한 장기 정합성은 지속 관리가 필요하다.
- 반복 실험은 3개 seed group 수준이므로 논문급 통계 검정을 위해서는 더 많은 반복이 필요하다.

## 17. 향후 확장 방향

### 단기

- 최종 기준 모델 결과를 논문/보고서 표와 그림으로 정리
- Level 2와 Level 3 representative replay를 qualitative case로 설명
- 대시보드 캡처 이미지 정리
- 반복 실험 수를 5회 이상으로 확대

### 중기

- Scenario generator 정합성 고도화
- Candidate-K 구성 다양화
  - nearest
  - same setup
  - earliest finish
  - minimum setup
  - hard-margin safe
  - load balancing
- validation-aware checkpoint를 모든 level에 일반화
- 학습 curve 기반 early stopping 검토

### 장기

- 다중 crane type 확장
- lift duration 분포화
- rigging crew/resource constraint 추가
- 작업 구역/동선 제약 추가
- 실제 프로젝트 데이터 기반 calibration
- OR-heuristic 또는 MILP baseline과 비교

## 18. 최종 권고

현 단계의 연구/보고서 기준 모델은 다음을 사용한다.

```text
python_mappo/final_baseline/curriculum_mappo_model.pt
python_mappo/final_baseline/curriculum_mappo_result.json
```

보고서 본문에서는 다음 메시지를 중심으로 정리하는 것이 좋다.

```text
Validation-aware Curriculum MAPPO는 multi-crane lifting scheduling의 Stage-1 prototype에서 completion 100%와 executed hard overlap 0을 유지하면서, Level 1/2/3 seen 및 unseen 평가에서 Nearest baseline 대비 makespan 개선을 보였다. 특히 초기 3000 episode 학습에서 관찰된 Level 2 unseen 일반화 약점은 train/validation/test seed 분리와 validation-aware checkpoint selection을 통해 개선되었다.
```
