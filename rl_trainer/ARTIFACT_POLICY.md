# PyTorch MAPPO 산출물 보관 정책

이 폴더에는 학습 산출물(`.pt`, `.json`, `.csv`, `.log`)이 많다. 모델 비교와 보고서 재현성을 위해 자동 삭제는 하지 않는다.

## 항상 보관

- `final_baseline/`: 보고서와 대시보드의 최종 기준 모델
- `baselines/`: 명시적으로 이름 붙인 기준 실험
- 각 실험 폴더의 `config.yaml`, 결과 JSON, learning curve CSV, 선택된 `.pt` 모델

## 단기 보관

- `dashboard_runs/run_*`: 대시보드에서 직접 시작한 최근 학습 run
- `outputs_smoke*`, `outputs_debug*`: 디버그가 끝나면 archive 또는 삭제 후보

## 정리 기준

1. 최종 보고서나 README에서 참조하는 경로는 이동하지 않는다.
2. 비교 표에 쓰인 실험은 최소 결과 JSON, config, 모델 checkpoint를 같이 보관한다.
3. 임시 smoke/debug run은 7일 이상 지나고 참조 문서가 없으면 삭제 후보로 표시한다.
4. 삭제 대신 보관이 필요하면 `rl_trainer/archive/` 아래로 폴더 단위 이동한다.
5. 대시보드 모델 목록이 무거워지면 먼저 archive 폴더를 모델 검색에서 숨기는 방식으로 처리한다.

## 권장 명명

- `dashboard_runs/run_YYYYMMDD_HHMMSS`
- `outputs_<purpose>`
- `baselines/<scenario>_<episodes>ep_<selection>`

새 실험을 최종 후보로 승격할 때는 해당 폴더에 짧은 `README.md` 또는 `.label.json` 메모를 남긴다.
