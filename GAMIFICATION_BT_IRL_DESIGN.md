# 게임화 + IRL 설계 (현재 구현: 표준 MaxEnt)

크레인 양중 스케줄링을 사람이 직접 풀게 하여, 그 결과로부터 보상 계수를 역추정하는 시스템의 구조 설계 문서.

> ### ⚠️ 현재 구현 노트 (2026-07 기준)
>
> 이 문서는 **원래 Bradley-Terry IRL 설계**로 작성되었고, 이후 **Conditional MaxEnt IRL**(같은 시나리오의 후보 trajectory 풀 위 softmax)을 거쳐, 현재는 **표준 MaxEnt IRL**(Ziebart 2008)로 전환되었습니다 (2026-07). 정규화(분배함수 Z)가 소수의 후보 풀이 아니라 시나리오의 **전체 궤적 공간**에 대해 정의되며, 궤적 공간이 조합적으로 크므로 균등 랜덤 정책 rollout에 대한 self-normalized importance sampling으로 Z를 추정합니다.
>
> | 항목 | 옛 설계 (BT) | 구 구현 (Conditional MaxEnt) | 현재 구현 (표준 MaxEnt) |
> |---|---|---|---|
> | 추정 대상 | 5차원 **scorer** 가중치 | 7차원 학습 reward 계수 | 7차원 **학습 reward 계수** (MAPPO가 그대로 씀) |
> | 정규화 | A vs B 페어 | human play + 휴리스틱 baseline pool(K+1) | 시나리오 전체 궤적 공간 (importance-sampled Z) |
> | 모듈 위치 | `python_mappo/...` (옛 경로) | `game_irl/...` | `game_irl/...` (현재 경로) |
> | 라벨러 | 4종(human_wins / scorer_label / mixed / explicit) | 1종(conditional_maxent) | 1종(maxent) |
> | explicit preference 라벨링 UI | 결과 화면 "AI와 비교" | **제거됨** (2026-06) | 동일 (DB 테이블·파일은 보존) |
>
> 본문 §0의 BT 선택 이유와 §5의 BT 파이프라인 코드 예시는 **설계 합의의 역사 기록**입니다. §6의 Phase 5와 explicit preference 관련 절차도 폐기된 대안이며 현재 기능이 아닙니다. 본문 하단의 "Conditional MaxEnt" 언급도 구 구현 기록입니다. 실제 알고리즘과 산출물 스키마는 `game_irl/irl_from_plays.py`를 기준으로 보세요.
>
> **표준 MaxEnt 전환 요점 (2026-07)**
> - 모델: P(τ) = exp(θ·φ(τ)) / Z_s, Z_s는 시나리오 s의 전체 궤적(정확히는 MAPPO와 동일한 행동 공간의 joint action sequence) 합.
> - Z 추정: 시나리오별 M회(기본 200) 균등 랜덤 정책 rollout. 각 rollout의 제안확률 q(τ)=∏ 1/|A_t,c|를 정확히 기록해 self-normalized importance sampling으로 보정. 시나리오별 ESS(유효 샘플 수)를 진단으로 보고.
> - gradient = E_demo[φ] − E_θ[φ] (교과서적 feature matching). L2 prior(현행 계수 스케일 기준)와 부트스트랩 CI는 유지.
> - 휴리스틱 baseline pool·auto_reward trial 주입은 모델에서 제거 (관련 파라미터는 하위 호환용으로만 남아 있고 무시됨).
> - 미완료 플레이(done < total)는 적합에서 제외 — 샘플 궤적 공간은 항상 완주하므로 완료 특징이 상수가 되어, 미완료 시연이 섞이면 r_single/r_all이 prior 한계까지 왜곡된다(회귀 테스트 있음).

## 구현 산출물 위치 (현재)

| 항목 | 파일 |
|---|---|
| 시나리오 풀 (8개: tutorial 3 / standard 3 / expert 2) | `crane_core/scenarios.py` |
| 세션 매니저 + 디스크/DB 저장 | `game_irl/human_play.py` |
| 표준 MaxEnt IRL (7-dim reward coef 추정) | `game_irl/irl_from_plays.py` |
| auto_reward A/B 비교 분석 | `game_irl/compare_irl_runs.py` |
| 게임 IRL × auto_reward **상호 검증** (권장 워크플로) | `game_irl/cross_validate_irl.py` |
| `--irl-prior` 플래그 (7-dim 계수를 trial 탐색 범위로 주입) | `rl_trainer/auto_reward_opt.py` |
| 백엔드 엔드포인트 (`/api/game/*`) | `app.py` |
| 프론트엔드 탭 "사람 풀이 (게임)" + "데이터 · 연구" | `web/index.html` |
| 누적 plays | `human_plays/<scenario>/<tier>/*.json` 또는 Postgres `plays` |
| 누적 IRL priors + 상호검증/AB 리포트 | `irl_priors/irl_prior_*.json`, `irl_priors/ab_report_*.json` |

---

## 0. 동기와 과거 결정 사항

### 풀고자 하는 문제
`scorer.py`의 5개 표시용 카테고리 가중치와 MAPPO의 7개 학습 reward 계수는 기본값에서 시작한다. 현재 IRL은 사람(특히 현직 양중 계획자)의 trajectory와 같은 시나리오의 baseline pool을 이용해 **7개 학습 reward 계수**의 prior와 신뢰구간을 추정한다. 5개 scorer 가중치는 결과 표시와 외부 평가에만 사용하며 IRL 추정 대상이 아니다.

### 과거 학습 패러다임: Bradley-Terry (현재 미사용)
MaxEnt IRL 대비 다음 이유로 Bradley-Terry 선택:
- `scorer.py`가 이미 5차원 **선형** 가중합 → BT 우도가 convex, sklearn 로지스틱 회귀 한 줄
- `auto_reward_opt.py`가 누적한 다양한 가중치 rollout이 **공짜 비교군**
- multi-agent + discrete combinatorial action 환경에서 MaxEnt의 partition function 근사 비용 비현실적
- 1차 결과까지 1~2일 vs MaxEnt 1~2주

### 2-tier 데이터 구조
- **일반인 트랙**: 대량·튜토리얼·makespan 베이스라인 신호. IRL 학습에는 사용 안 함 (sub-optimal 가정 위반).
- **전문가 트랙**: 양중 계획자/현장 오퍼레이터. nickname + 직무 1줄 자가 신고. IRL 학습 입력.

### 가중합 표시 분리 원칙 (앵커링 방지)
플레이 중에는 **원시 카테고리 카운트만** 노출 (간섭 N건, makespan T초, 부하 편차 %). 제출 후에야 현재 시스템 가중치 기준 점수·등급을 사후 비교로 표시. 그렇지 않으면 사람들이 시스템 가중치를 향해 최적화하여 IRL이 동어반복이 됨.

---

## 1. 프론트엔드 (index.html 신규 탭)

### 위치
기존 6탭 옆에 7번째 탭 `사람 풀이 (게임)` 추가.

### 탭 내부 구조

```
[tier 선택] 일반인 | 전문가
  └ 전문가: nickname + 직무 (자가 신고, 인증 없음)

[시나리오 선택]
  └ 튜토리얼 3종 (제약 학습용)
  └ 표준 N종 (양중 5~10개, 크레인 2~3대)
  └ 도전 N종 (양중 15+, 정격 binding, 제한구역 다수)

[플레이 영역]
  ├ 캔버스: planCanvas 재사용 (편집 OFF, 표시 전용)
  ├ 상단 HUD: 현재 시각 T / 남은 양중 N개 / 진행 중 크레인 상태
  ├ 좌측 패널: 크레인 상태 카드 (idle / setup / lift / move)
  ├ 캔버스 인터랙션:
  │   1. 크레인 클릭 → 선택
  │   2. 후보 양중물 highlight (env.candidate_actions 그대로)
  │   3. 양중물 클릭 → 행동 확정 → 시뮬레이션 1 step 진행
  ├ 원시 카운터 (가중합 금지):
  │   - 간섭 N건
  │   - 진행 makespan T초
  │   - 부하 편차 (양중 개수 std)
  │   - 시간 편차 (busy time std)
  └ 컨트롤: Undo / 다시 시작 / 제출

[제출 후 화면]
  ├ 원시 카테고리 결과 (5개)
  ├ 현재 자동탐색 가중치 기준 사후 점수 + 등급
  ├ AI replay 나란히 보기 (선택 모델)
  └ 동일 시나리오 다시 풀기 / 다음 시나리오
```

### UI 제약 자동 차단
hard interference / 제한구역 진입 / 정격 초과는 `env.candidate_actions`가 이미 걸러내므로 클릭 자체가 불가능. soft interference만 클릭은 되되 시각 경고(노란 외곽선).

---

## 2. 백엔드 (app.py 엔드포인트 추가)

```
GET  /api/game/scenarios
       → tier별 시나리오 메타 목록 (id, name, 난이도, layout 미리보기)

POST /api/game/session/start
       body: {scenario_id, tier, nickname?}
       → {session_id, initial_state, candidate_actions_by_crane}

POST /api/game/session/step
       body: {session_id, crane_id, lift_id}
       → {next_state, candidate_actions_by_crane, raw_counters, done}
       제약 위반 시: 400 + {reason: "interference" | "rated_load" | ...}

POST /api/game/session/undo
       body: {session_id}
       → 1 step 롤백, 새 state 반환

POST /api/game/session/submit
       body: {session_id}
       → 종료 처리, scorer 통과, 디스크 저장, {outcome, scorer_snapshot}

GET  /api/game/leaderboard/<scenario_id>?tier=<>
       → 점수 분포 (옵션, Phase 2)
```

세션 상태: 서버 메모리 `dict[session_id → EnvState]`. 서버 재시작 시 진행 중 세션은 휘발 OK. 제출된 결과만 디스크에 영속.

---

## 3. 파이썬 모듈 (현재 위치)

```
game_irl/
  human_play.py        # 세션 매니저 (env wrapping, action 검증, 직렬화)
  irl_from_plays.py    # 표준 MaxEnt 7차원 reward 계수 추정
crane_core/
  scenarios.py         # 고정 시나리오 풀 (layout + capacity_curve + tier 메타)
```

### 3.1 `human_play.py`
- `class PlaySession`: `CraneSchedulingEnv` 래핑, action history 보관, undo 스택
- `start(scenario_id, tier, nickname) -> session_id`
- `step(session_id, crane_id, lift_id) -> StepResult`
- `undo(session_id)`
- `submit(session_id) -> (outcome, file_path)`
- env의 `candidate_actions`, `step`, `is_terminal`을 그대로 호출 — 시뮬 로직 중복 작성 금지

### 3.2 `scenarios.py`
```python
SCENARIOS = {
    "TUT_01": {"tier": "tutorial", "name": "...", "layout": {...}, "capacity_curve": [...]},
    "STD_01": {"tier": "standard", ...},
    "EXP_01": {"tier": "expert",   ...},
    ...
}
```
- 고정 시드로 재현성 보장
- 일반인용은 정격이 binding 안 하는 단순 시나리오, 전문가용은 정격·제한구역·간섭 트레이드오프 강제

### 3.3 `irl_from_plays.py`
표준 MaxEnt 추정기다. human trajectory를 시연으로 두고, 시나리오별 균등 랜덤 rollout에 대한
importance sampling으로 분배함수 Z를 추정해 feature matching으로 7차원 계수를 적합한다.
§5는 이전 Bradley-Terry 설계 기록이므로 현재 구현 근거로 사용하지 않는다.

---

## 4. 데이터 스키마

### 디스크 레이아웃
```
human_plays/
  <scenario_id>/
    general/
      <YYYYMMDD-HHMMSS>_<nick>.json
    expert/
      <YYYYMMDD-HHMMSS>_<nick>.json
```

### 단일 play 파일 (`*.json`)
```json
{
  "meta": {
    "tier": "expert",
    "scenario_id": "EXP_03",
    "nickname": "kim",
    "role": "양중계획 8년차",
    "ts": "2026-05-30T13:00:00",
    "play_seconds": 142,
    "undo_count": 3
  },
  "layout": { "cranes": [...], "lifts": [...], "restrictedZones": [...],
              "capacity_curve": [...] },
  "actions": [
    {"step": 0, "crane_id": "C1", "lift_id": "L4", "t_sim": 0.0},
    {"step": 1, "crane_id": "C2", "lift_id": "L1", "t_sim": 0.0},
    ...
  ],
  "outcome": {
    "events": [...],
    "makespan": 487.3,
    "done": 8,
    "raw": {
      "completion": 1.0,
      "softInterferenceCount": 3,
      "jobBalanceStd": 0.5,
      "timeBalanceStd": 12.4,
      "makespan_ratio": 0.78
    }
  },
  "scorer_snapshot": {
    "weights": {"completion": 25, "makespan": 30, "softInterference": 25,
                "jobBalance": 10, "timeBalance": 10},
    "category_scores": {"completion": 100, "makespan": 88, ...},
    "total": 82.4,
    "grade": "A"
  }
}
```

`scorer_snapshot`은 **참고용**: IRL은 `outcome.raw`의 원시값을 feature로 사용하며 `scorer_snapshot.weights`를 학습 입력으로 쓰지 않음.

---

## 5. Bradley-Terry IRL 파이프라인 (폐기된 설계 기록)

이 절의 5차원 feature, pair labeler, 출력 스키마는 현재 실행 경로에서 사용하지 않는다.
현재 구현은 `game_irl/irl_from_plays.py`의 7차원 표준 MaxEnt 파이프라인이다.

### 5.1 입력
- `human_plays/*/expert/*.json`: 전문가 궤적 (N개)
- `auto_reward_runs/*/trial_*/dashboard_baseline_result.json`: 다양한 가중치로 학습된 AI rollout (M개, 시나리오별)

### 5.2 Feature 정의
```python
def phi(outcome) -> np.ndarray:
    """5차원 feature 벡터, scorer.py의 카테고리와 1:1 대응."""
    return np.array([
        outcome["raw"]["completion"],          # 0~1
        outcome["raw"]["makespan_ratio"],      # 0~1, ideal/actual
        1.0 - outcome["raw"]["softInterferenceCount"] / nL,
        job_balance_metric(outcome),           # 0~1
        time_balance_metric(outcome),          # 0~1
    ])
```
정규화: 모든 차원 [0, 1]. scorer 의 각 카테고리 score를 100으로 나눈 값과 동치.

### 5.3 페어 생성
```
for 시나리오 s in 전문가 plays:
    human_outcomes = [모든 expert play in s]
    ai_outcomes    = [auto_reward_runs의 모든 rollout in s]

    # 비교군 다양성 강제: auto_reward의 가중치 grid 양 극단을 반드시 포함
    ai_sample = stratified_sample(ai_outcomes, by="reward_coef_extremity", k=20)

    for h in human_outcomes:
        for a in ai_sample:
            if scorer.total(h) > scorer.total(a):
                pairs.append((phi(h) - phi(a), label=1))
            elif scorer.total(h) < scorer.total(a):
                pairs.append((phi(a) - phi(h), label=1))
            # 동률은 제외 (정보 없음)
```
주의:
- "전문가 ≻ AI"를 가정하지 않고 **현재 scorer 기준 더 높은 쪽이 이긴 것**으로 라벨링. 이렇게 하면 BT는 "현재 scorer를 가장 잘 재현하는 가중치"를 학습 → **시드용 sanity check**가 됨.
- 명시적 페어 라벨링은 검토됐으나 2026-06에 UI/API에서 제거됐다. 아래 내용은 재도입할 경우의 과거 대안이다.

### 5.4 학습
```python
from sklearn.linear_model import LogisticRegression

X = np.stack([dphi for dphi, _ in pairs])   # (P, 5)
y = np.ones(len(pairs))                      # 모두 1 (label은 dphi 방향에 인코딩됨)

# Bradley-Terry는 intercept 없는 로지스틱
clf = LogisticRegression(fit_intercept=False, C=1.0, penalty="l2")
clf.fit(X, y)

w_irl = clf.coef_.flatten()
w_irl = np.clip(w_irl, 0, None)              # 보상 가중치는 음수 안 됨
w_irl = w_irl / w_irl.sum() * 100             # scorer convention (합 100)
```

### 5.5 출력
```
auto_reward_runs/irl_prior_<YYYYMMDD>.json
{
  "method": "bradley_terry_v1",
  "n_human_plays": 47,
  "n_pairs": 894,
  "weights": {
    "completion": 22.3, "makespan": 34.1, "softInterference": 28.7,
    "jobBalance": 7.8, "timeBalance": 7.1
  },
  "confidence": {... bootstrap std ...},
  "generated_at": "2026-05-30T..."
}
```

### 5.6 `auto_reward_opt.py` 연동
- 두 가지 사용처:
  1. **탐색 시작점 (warm start)**: Optuna sampler의 첫 trial 가중치로 `w_irl` 사용
  2. **사전분포 (prior)**: 탐색 공간을 `w_irl ± 2·std`로 좁힘
- 효과 검증: `w_irl` warm start vs 기존 random start의 **N trials 후 최고 점수**, **수렴 epoch 수** 비교

---

## 6. Phase 단계

### Phase 1: 데이터 수집 인프라
- index.html: 새 탭 + 플레이 UI (캔버스 인터랙션 + 원시 카운터)
- app.py: `/api/game/session/*` 엔드포인트
- `game_irl/human_play.py` + `crane_core/scenarios.py`
- `human_plays/` 디스크 저장 동작 확인
- **출구 조건**: 본인이 5개 시나리오 풀이 + 저장 + 재불러오기 작동

### Phase 2: 일반인 트랙 공개 + 누적
- 튜토리얼 + 표준 시나리오 풀 공개
- leaderboard (점수 분포 시각화)
- 일반인 데이터 100+개 누적, **가중치는 건드리지 않음**
- **출구 조건**: 일반인 plays가 분포로 보임 (UX 정상 작동의 정성 신호)

### Phase 3: 전문가 트랙 + MaxEnt
- 전문가 시나리오 풀 추가 (정격·제한구역 binding)
- 양중 계획자 섭외 (5~10명)
- `game_irl/irl_from_plays.py`의 7차원 표준 MaxEnt fit
- **출구 조건**: reward coefficient와 부트스트랩 신뢰구간 확인

### Phase 4: prior 주입 효과 검증
- `auto_reward_opt.py`에 `--prior <irl_prior.json>` 옵션 추가
- A/B 실험: warm start (w_irl) vs random start
- 동일 N trials 예산에서 최종 score / 수렴 속도 비교
- **출구 조건**: prior가 통계적으로 유의한 개선을 주는지 결론

### Phase 5: 명시적 선호 라벨 (폐기)
- 2026-06에 결과 비교 라벨링 UI/API를 제거했다.
- `preferences` DB 테이블과 `human_preferences` 파일 호환 구조만 기존 데이터 보존을 위해 유지한다.
- AI baseline endpoint는 replay ghost 시각화에 사용하며 선호를 저장하지 않는다 (표준 MaxEnt 전환 이후 후보 pool 생성 용도는 사라짐).

---

## 7. 기술적 위험과 완화

| 위험 | 영향 | 완화 |
|---|---|---|
| 전문가 섭외 실패 (N < 5) | IRL 데이터 부족 | 일반인 play trajectory를 별도 cohort로 분석하고 표본 한계를 보고 |
| Z 샘플의 feature 분산 부족 / ESS 낮음 | MaxEnt 식별 신호 약함, Z 추정 불안정 | 시나리오별 `--samples` 증량, per-scenario ESS 진단 확인 |
| Feature 다중공선성 (예: jobBalance ↔ timeBalance) | 가중치 식별 불안정 | L2 정규화, 부트스트랩 신뢰구간 보고 |
| 인간이 makespan만 최적화 (자명 신호) | 시간 관련 reward 계수에 추정이 편중 | 시나리오 설계에서 정격·제한구역·간섭 trade-off 강제 |
| 시뮬-인간 환경 mismatch (사람은 직관 들고 실제는 다른 dynamics) | 학습 가중치가 잘못된 신호 | scenarios.py를 env.py와 동일 dynamics로 — 양쪽 다 server-side 시뮬만 사용 |

---

## 8. 사용법 요약

### 데이터 수집
대시보드 → "사람 풀이 (게임)" 탭 → tier + nickname 입력 → 시나리오 시작 → 각 step마다 크레인-양중 매핑을 클릭으로 결정 → "다음 step 진행" → 모두 끝나면 "제출" (`human_plays/<scenario>/<tier>/...json` 저장).

### IRL 추정
대시보드의 IRL 실행은 사람 play를 시연으로 두고, 시나리오별 균등 랜덤 rollout(기본 200회)의
importance sampling으로 분배함수 Z를 추정해 7차원 표준 MaxEnt reward coefficient를 적합한다.
explicit preference는 입력으로 사용하지 않는다. 미완료(done < total) 플레이는 제외된다.

CLI:
```
python -m game_irl.irl_from_plays --tier expert --bootstrap 200 --samples 200
```

`--labeler`는 이전 호출과의 호환을 위해 메타데이터 인자만 남아 있으며 어떤 값을 넣어도
알고리즘은 표준 MaxEnt로 실행된다. `--heuristic-seeds`/`--no-heuristic`/`--auto-reward-root`는
구 conditional 구현의 잔재로 무시된다.

### 두 트랙 상호 검증 (권장 워크플로 — 옵션 2)
게임 IRL과 auto_reward는 모두 같은 7차원 학습 reward 계수 공간을 사용한다.
`cross_validate_irl.py`는 auto_reward trial 계수를 IRL bootstrap 신뢰구간과 직접 비교한다:
```
# 1. auto_reward 독립 실행
python -m rl_trainer.auto_reward_opt --layout site.json --n-trials 30 \
    --outroot rl_trainer/auto_reward_runs/main

# 2. 게임 IRL 독립 산출
python -m game_irl.irl_from_plays --tier expert --bootstrap 200
    # → irl_priors/irl_prior_<DATE>.json

# 3. 상호 검증: 게임 가중치로 auto_reward trial 재채점
python -m game_irl.cross_validate_irl \
    --irl-prior irl_priors/irl_prior_<DATE>.json \
    --auto-reward-run rl_trainer/auto_reward_runs/main
    # → irl_priors/cross_validate_<DATE>.json
    # → Kendall τ, best-trial agreement, ranking shift
```

대시보드 게임 탭의 **상호 검증** 패널에서도 동일 분석 가능 (IRL prior + auto_reward run 선택 → 실행).

### (옵션 1 — 통합 모드, 권장 X)
하나의 추천 결과만 원하면 `--irl-prior`로 IRL 가중치를 auto_reward의 채점 기준에 주입 + 대비 비교:
```
python -m rl_trainer.auto_reward_opt --layout site.json --n-trials 30 \
    --outroot rl_trainer/auto_reward_runs/baseline
python -m rl_trainer.auto_reward_opt --layout site.json --n-trials 30 \
    --irl-prior irl_priors/irl_prior_<DATE>.json \
    --outroot rl_trainer/auto_reward_runs/with_prior
python -m game_irl.compare_irl_runs \
    --baseline rl_trainer/auto_reward_runs/baseline \
    --with-prior rl_trainer/auto_reward_runs/with_prior
```
이 모드는 인간 선호를 채점에 강제 주입하므로 자동 탐색의 자유도가 줄어듦. 상호 검증으로 결과 일치성을 확인한 *다음* 이 모드로 강하게 가는 게 안전.

### AI baseline 비교
결과 replay의 AI 고스트는 `/api/game/baseline/run`으로 생성한다. 이는 사람이 어느 지점에서
baseline과 다른 결정을 했는지 시각화하는 기능이며,
"내 결과/AI 결과" 선호 라벨을 수집하거나 `human_preferences`에 쓰지 않는다.

## 9. 식별성 한계

표준 MaxEnt도 샘플된 궤적 공간에 충분한 feature 분산이 없으면 7개 reward 계수를 안정적으로
분리할 수 없다. 모든 rollout이 완주하는 시나리오에서는 완료 특징(r_single/r_all)이 상수가 되어
해당 계수는 prior에 머문다(식별 불가 시의 올바른 동작). makespan만 달라지는 공간에서는 일부
계수의 신뢰구간이 넓어질 수 있다. 또한 균등 랜덤 proposal은 고보상 궤적 근방을 희박하게
커버하므로 그 영역의 Z 추정 분산이 커진다 — per-scenario ESS 진단으로 감시한다.

**완화 경로:**
1. 시나리오별 `--samples`를 늘려 Z 샘플의 feature 분산·ESS를 확보
2. 일반인/전문가 cohort를 분리하고 계수 추정치와 bootstrap 신뢰구간을 함께 보고
3. `EXP_*` 시나리오를 추가해 정격·제한구역·간섭 trade-off를 강제

충분한 분산과 표본 없이 계수를 식별할 수 없다는 한계는 알고리즘을 바꿔도 사라지지 않는다.

## 10. 비목표 (Out of Scope)

- 인간을 진짜 최적이라고 가정하는 MaxEnt IRL (지금 환경 부적합, §0 참조)
- `scorer.py`의 5개 표시용 평가 가중치 추정 — 현재 IRL은 MAPPO의 7개 학습 reward 계수만 추정
- 실시간 멀티플레이어 / 협동 풀이 — 단일 세션 단일 사용자
- explicit preference 라벨링 UI/API 재도입 — 기존 DB 구조는 호환 목적으로만 유지
