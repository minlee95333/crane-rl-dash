# Project Structure

이 프로젝트는 Crane DB / 강화학습 모델 생성 / 게임 기반 IRL을 분리해서 관리한다.

```text
app.py
  통합 HTTP 서버. 웹 UI 서빙, API 라우팅, 학습 job 실행/상태 조회.
  /hub, /trainer, /game URL을 같은 web/index.html로 라우팅한다.

web/
  index.html
  단일 페이지 대시보드 UI. Crane Hub / RL Trainer / Game IRL 작업공간을 URL과 탭으로 분리한다.

crane_core/
  env.py
  scorer.py
  scenarios.py
  세 영역이 공유하는 크레인 스케줄링 도메인 로직.

crane_db/
  storage.py
  Crane 전용 저장 계층. 로컬 JSON 파일에 저장한다 (이 빌드는 로컬 전용이라
  원격 데이터베이스 경로가 없다).

rl_trainer/
  train.py
  curriculum.py
  auto_reward_opt.py
  evaluate.py
  mappo.py
  networks.py
  config.yaml
  사용자가 보상 수치를 직접 정하거나 자동 탐색해서 MAPPO 모델을 생성하는 영역.

game_irl/
  human_play.py
  irl_from_plays.py
  compare_irl_runs.py
  cross_validate_irl.py
  일반 사용자/전문가 게임 풀이를 수집하고 표준 MaxEnt IRL prior를 생성하는 영역.
  explicit preference 수집 UI/API는 제거됐고 저장 계층만 기존 데이터 호환을 위해 유지한다.

python_mappo/
  기존 python_mappo.* 경로 호환 wrapper와 과거 실험 산출물.
  새 소스 코드는 이 폴더에 추가하지 않는다.

curriculum_runs/
  기존 JS curriculum 실험/검증 보관 자료.
```

## Data Ownership

- Crane DB / Hub: 사용자, 시나리오, 플레이, 기존 preference, IRL artifact, 모델 메타데이터의 원장.
- RL Trainer: 모델과 학습 결과의 생산자. 새 dashboard run은 `rl_trainer/dashboard_runs/`에 저장한다.
- Game IRL: 사람 데이터와 IRL prior의 생산자. 저장은 `crane_db.storage`를 통해 처리한다.
- Crane Core: 세 시스템이 공유하는 계산 기준. 정격 하중, 제한구역, scoring 변경은 여기서만 한다.

## Compatibility

기존 명령인 `python -m python_mappo.train` 같은 호출은 wrapper를 통해 계속 동작한다. 새 문서와 새 스크립트는 `rl_trainer`, `game_irl`, `crane_core`, `crane_db` 경로를 기준으로 한다.
