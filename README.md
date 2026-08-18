# Crane RL Dashboard

다중 크레인 작업 스케줄링을 위한 **Crane Hub + 강화학습 모델 생성 + 게임 기반 IRL** 통합 프로젝트입니다.

- Crane DB / Hub: `crane_db/` (로컬 파일 저장 계층)
- 강화학습/보상 탐색: `rl_trainer/` (PyTorch MAPPO, curriculum, auto reward search)
- 게임 기반 IRL: `game_irl/` (human play, 표준 MaxEnt IRL)
- 공통 크레인 엔진: `crane_core/` (환경, scorer, 시나리오)
- 대시보드 서버: `app.py` (Python `http.server` 기반)
- 대시보드 UI: `web/index.html` (단일 페이지)
- 원클릭 실행: `Start.bat` (Windows)

## 빠른 시작 (Windows)

```bat
Start.bat
```

- 백그라운드에서 `app.py`를 띄우고 `http://127.0.0.1:8000`을 자동으로 엽니다.
- 서버 콘솔창은 대시보드를 사용하는 동안 열어둡니다.
- 이미 같은 포트의 대시보드 서버가 떠 있으면 최신 코드가 적용되도록 재시작합니다.

## 빠른 시작 (직접 실행)

```bash
python3 app.py
# 또는
npm run serve
```

브라우저에서 http://127.0.0.1:8000 접속. 루트 주소는 공개 랜딩 페이지이며,
게임과 관리 화면은 아래 작업공간 URL로 이동합니다.

기능별 작업공간 URL:

| URL | 작업공간 | 용도 |
| --- | --- | --- |
| `/` | Landing | 서비스 소개와 게임/연구 대시보드 진입 |
| `/hub` | Crane Hub | 모델, 플레이, 기존 preference, IRL 산출물 관리 |
| `/trainer` | RL Trainer | 강화학습 실행, 보상 계수 자동 탐색, AI 계획 생성 |
| `/game` | Game IRL | 일반 사용자/전문가 크레인 게임 풀이 |

세 URL은 같은 서버와 같은 저장소를 공유합니다. 별도 웹사이트 3개가 아니라 하나의 플랫폼 안에서 작업공간만 분리한 구조입니다.

## 학습 / 평가

`package.json`에 자주 쓰는 명령을 스크립트로 모아뒀습니다.

| 용도 | 명령 |
| --- | --- |
| 단일 학습 | `npm run train:pytorch-mappo` |
| 평가만 실행 | `npm run eval:pytorch-mappo` |
| 에피소드 수 비교 | `npm run experiment:pytorch-mappo` |
| 반복 검증 | `npm run repeat:pytorch-mappo` |
| 커리큘럼 학습 | `npm run curriculum:pytorch-mappo` |
| 보상 계수 자동 탐색 | `npm run auto-reward` (Optuna 필요: `pip install optuna`) |

자세한 학습 동작·산출물·seed split 규칙은 [`rl_trainer/README.md`](rl_trainer/README.md) 참고.

## 역할별 구조

이 저장소는 기능을 세 시스템으로 나누고, 계산 로직은 공통 패키지로 공유합니다.

| 영역 | 폴더 | 역할 |
| --- | --- | --- |
| Crane DB / Hub | `crane_db/` | 사용자, 시나리오, play, 기존 preference, IRL artifact, 모델 메타데이터 저장 계층 |
| RL 모델 생성 | `rl_trainer/` | 수동 보상 계수 학습, MAPPO 학습, curriculum, reward coefficient 자동 탐색 |
| Crane Game IRL | `game_irl/` | 일반 사용자/전문가 게임 풀이 수집, 표준 MaxEnt IRL prior 생성 |
| 공통 엔진 | `crane_core/` | 크레인 환경, 정격 하중/제한구역/스코어링/고정 시나리오 |

`python_mappo/`는 과거 경로 호환과 기존 실험 산출물 보관용입니다. 새 소스 코드는 위 4개 패키지를 기준으로 관리합니다.

## 로컬 전용 애플리케이션

이 프로그램은 로컬에서 동작합니다. 외부 데이터베이스도, 클라우드 인증도
사용하지 않습니다. 계정·플레이 기록·IRL 산출물은 모두 이 폴더 안의 JSON
파일로 저장되므로, 실행에 필요한 API 키나 접속 정보가 없습니다.

데이터가 어디에 저장되는가 — 전부 이 폴더 안입니다:

| 경로 | 내용 |
| --- | --- |
| `auth_data/` | 계정과 로그인 세션 (비밀번호 해시 포함) |
| `human_plays/` | 플레이 기록 한 판당 JSON 하나 |
| `human_sessions/` | 진행 중인 게임 세션 |
| `irl_priors/` | IRL 추정 산출물 |

모두 `.gitignore` 에 들어 있습니다. **커밋하지 마세요** — 참여자 이름·이메일과
비밀번호 해시가 들어갑니다.

저장 계층이 로컬 파일만 쓰는지는 테스트가 지킵니다
(`tests/test_public_release.py::test_storage_stays_local_only`).

### 지원하지 않는 기능

여러 사용자가 하나의 서버를 공유하는 전제가 필요한 기능은 동작하지 않습니다.

- **사용자 제작 시나리오 공유** — 공유 저장소가 필요합니다.
- **이메일 확인 메일 발송** — 메일 발송 경로가 없습니다. 가입하면 바로 로그인됩니다.
- **관리자 화면의 "Auth 가입자" 목록** — 계정은 `auth_data/users.json` 에 있습니다.

### 켜지 말아야 할 것

이 프로그램은 접근 제어 없이 참여자 이메일·이름을 평문 JSON으로 로컬 디스크에
씁니다. 개인 컴퓨터에서 혼자 쓴다는 전제이므로, 아래를 켜서 루프백 밖으로
열면 그 전제가 깨집니다.

```
CRANE_PUBLIC_GAME=1     # 인증 없이 게임 API 개방
HOST=0.0.0.0            # 모든 네트워크 인터페이스에 바인드
```

## 검증

```bash
python -m pytest -q     # 391 passed
npm ci && npm test      # 29 checks
npm run lint
```

## 현재 범위 (Stage-1)

- 3 cranes / 24 lifts
- action = Candidate-K slot
- type-shared actor + centralized critic
- hard interference: 실제 양중 반경 겹침 → 실행 차단
- soft interference: 작업 반경 겹침 → reward shaping
- 평가는 deterministic greedy

`rl_trainer/config.yaml`에서 크레인 수, 보상 weight, MAPPO 하이퍼파라미터를 조정합니다.

## 디렉토리

```
app.py                    # 대시보드 HTTP 서버 (학습 job 관리, 결과 조회 API)
web/index.html            # 대시보드 UI
Start.bat                 # Windows 원클릭 런처
tunnel.js                 # OpenSSH reverse tunnel로 외부 공유
crane_core/               # 공통 크레인 환경, scorer, 시나리오
crane_db/                 # 로컬 파일 저장 계층
rl_trainer/               # MAPPO 학습, 평가, curriculum, reward search
game_irl/                 # 게임 세션, play trajectory, 표준 MaxEnt IRL 분석
python_mappo/             # 기존 경로 호환 wrapper + 과거 산출물
curriculum_runs/          # 보관된 stage별 모델·평가 결과
```

학습 중 dashboard에서 생성되는 새 run은 `rl_trainer/dashboard_runs/`에 저장됩니다. 과거 run은 `python_mappo/dashboard_runs/`에 남아 있으며 모델 목록에서 함께 조회됩니다.

## 보상 계수 자동 탐색 (auto_reward_opt)

사용자 현장 layout(`site.json`)을 받아 Optuna(TPE)로 7개 reward 계수
(`r_single, r_all, r_same, p_idle, p_inter_soft, p_time, p_move`)를
자동 탐색합니다. 매 trial마다 ① 전체 학습 → ② 학습된 모델로 사용자
현장 스케줄 생성 → ③ `scorer.py`로 채점 → ④ totalScore를 목적값으로
Optuna에 반환합니다.

```bash
# site.json schema: { "cranes": [...], "lifts": [...], "restrictedZones": [...] }
python -m rl_trainer.auto_reward_opt \
    --layout rl_trainer/site_example.json \
    --n-trials 30 \
    --episodes 150 \
    --outroot rl_trainer/auto_reward_runs
```

산출물:

- `rl_trainer/auto_reward_runs/study.db` — Optuna SQLite (중단 시 같은
  명령으로 이어서 학습 가능)
- `rl_trainer/auto_reward_runs/trial_NNNN/` — 각 trial의 학습 결과
  + `trial_summary.json`, `site_eval.json`
- `rl_trainer/auto_reward_runs/best.json` — 최고 점수 trial의 계수,
  모델 경로, 점수 요약

기본은 사용자 layout을 `anchor_layout`으로 주입해서 학습 시나리오가
사용자 현장 주변에 jitter됩니다(`--no-anchor`로 끄면 기본 합성 분포로
학습하고 채점만 사용자 현장에서 수행).

## 의존성

- Python 3, PyTorch, PyYAML
- Optuna (보상 계수 자동 탐색 시): `pip install optuna`
- Node.js (선택, `npm run` 스크립트용)
- OpenSSH client (선택, 공개 SSH tunnel 사용 시)

공개 tunnel은 명시적 opt-in과 대시보드 token이 모두 있어야 실행됩니다.
`deploy_temp.py`는 기존 자동화 호환을 위해 같은 SSH launcher로 연결됩니다.

```bash
CRANE_ALLOW_PUBLIC_TUNNEL=1 CRANE_DASHBOARD_TOKEN='<strong-random-token>' python deploy_ssh.py
```
