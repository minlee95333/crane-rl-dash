# Game IRL

일반 사용자 또는 전문가에게 배포되는 크레인 게임 기반 IRL 영역입니다.

- `human_play.py`: 게임 세션, step/undo/submit, play 저장
- **`step_irl.py`: 스텝 단위 조건부 MaxEnt — 현재 채택된 추정량.** 스윕 스텝마다 유한 후보 집합에 대해 정규화하므로 Z가 계산된다(추정되지 않는다)
- `rank_irl.py`: 순위 기반(Bradley-Terry) 참고 추정. 점수 순위는 채점표와의 동어반복, 재도전 순위는 신호 없음 — 둘 다 채택하지 않음
- `irl_from_plays.py`: 궤적 수준 표준 MaxEnt(importance-sampled Z). **이 환경에서 구조적으로 불가능**함이 확정됨 — `MAXENT_FINDINGS.md` §2
- `sweep_exec.py`: 스윕 스텝 실행기. 사람 게임과 IRL 샘플러가 **공유**한다 (수집 데이터의 99.6%가 스윕 스텝)
- `compare_irl_runs.py`: IRL prior 적용 전/후 auto-reward run 비교
- `cross_validate_irl.py`: 7차원 IRL reward coefficient CI와 auto-reward 결과 상호 검증
- **`MAXENT_FINDINGS.md`: 측정 기록과 결론. 계수를 prior로 쓰기 전에 반드시 읽을 것**

궤적 수준 리포트 생성은 `scripts/analyze_irl.py` (8종 진단). 참고용이며, 그 결과를
채택해서는 안 되는 이유가 `MAXENT_FINDINGS.md`에 있다.

이 영역은 사람 의사결정 데이터를 모아 Crane DB에 IRL prior로 저장하는 것이 목적입니다.
