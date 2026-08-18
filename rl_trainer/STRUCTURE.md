# RL Trainer Structure

`rl_trainer`는 모델 생성 영역입니다.

- 수동 보상 계수 학습: `train.py`
- curriculum 학습: `curriculum.py`
- reward coefficient 자동 탐색: `auto_reward_opt.py`
- 모델 평가: `evaluate.py`
- MAPPO 구현: `mappo.py`, `networks.py`
- 기준 설정: `config.yaml`

대시보드에서 새로 시작한 학습은 `rl_trainer/dashboard_runs/`에 저장됩니다. 과거 산출물은 `python_mappo/` 아래에 남겨두며 모델 목록에서 같이 조회합니다.
