# PyTorch MAPPO engine

Crane Hub의 강화학습 모델 생성 영역입니다. 수동 보상 계수 학습, curriculum 학습, reward coefficient 자동 탐색을 이 폴더에서 관리합니다.

## 실행

```bash
cd /root/crane_rl_dashboard
python3 -m rl_trainer.train --episodes 150 --outdir rl_trainer/outputs
```

기본 seed split은 curriculum 학습과 동일한 방식입니다.

- train: `base_seed`부터 `seed_runs`개 seed 순환
- seen: `101–110`
- validation: `201–220`
- unseen/test: `301–330`

단일 학습도 curriculum과 동일하게 validation-aware checkpoint selection을 사용합니다.

```text
score =
0.3 * seen_makespan
+ 0.7 * validation_makespan
+ 2.0 * max(0, validation_mappo - validation_nearest)
```

`hardExecuted`는 환경 실행 단계에서 구조적으로 차단되어 항상 0이어야 하므로 checkpoint score에는 포함하지 않습니다.

결과:

- `rl_trainer/outputs/pytorch_mappo_model.pt`
- `rl_trainer/outputs/pytorch_mappo_validation_result.json`

## 평가만 실행

```bash
python3 -m rl_trainer.evaluate \
  --model rl_trainer/outputs/pytorch_mappo_model.pt \
  --seed-start 201 --seed-count 30
```

## 현재 범위

- Stage-1 3 cranes / 24 lifts
- action = Candidate-K slot
- type-shared actor
- centralized critic
- hard interference: actual lifting radius overlap은 실행 불가 처리
- soft interference: dashboard crane working radius overlap은 reward shaping
- deterministic greedy evaluation

## 산출물 보관

학습 결과와 모델 checkpoint 보관 기준은 `ARTIFACT_POLICY.md`를 따른다.
