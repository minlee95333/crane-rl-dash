# python_mappo Compatibility Folder

이 폴더는 과거 `python_mappo.*` import/실행 경로를 유지하기 위한 wrapper와 기존 실험 산출물을 보관합니다.

새 소스 위치:

- `crane_core/`: 환경, scorer, 시나리오
- `crane_db/`: 저장 계층
- `rl_trainer/`: MAPPO 학습과 reward search
- `game_irl/`: 사람 풀이와 IRL

기존 명령은 계속 동작합니다.

```bash
python -m python_mappo.train
```

새 작업은 아래처럼 새 패키지 경로를 사용하세요.

```bash
python -m rl_trainer.train
```
