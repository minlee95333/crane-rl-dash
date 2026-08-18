#!/usr/bin/env python3
"""crane-sim(독립 3D 시뮬 앱)을 빌드해 V2 대시보드의 web/sim/으로 복사한다.

배경: crane-sim은 별도 저장소/폴더의 Vite+Three.js 앱이다. AGENTS.md 규약상
V2와 소스를 병합하지 않고, **컴파일된 정적 번들만** `/sim/` 라우트로 호스팅한다.
이 스크립트가 그 산출물을 갱신하는 유일한 경로다 (수동 복사 대신).

사용:  python scripts/update_sim.py
전제:  crane-sim이 V2 폴더의 형제 디렉터리(../crane-sim)에 있고 `npm install` 완료.
       vite.config.js에 base:'/sim/' 설정이 되어 있어야 에셋 경로가 맞는다.
"""
import shutil
import subprocess
import sys
from pathlib import Path

V2_ROOT = Path(__file__).resolve().parent.parent
SIM_SRC = V2_ROOT.parent / 'crane-sim'
SIM_DIST = SIM_SRC / 'dist'
SIM_DEST = V2_ROOT / 'web' / 'sim'


def main() -> int:
    if not SIM_SRC.is_dir():
        print(f'[update_sim] crane-sim을 찾을 수 없음: {SIM_SRC}', file=sys.stderr)
        return 1
    print(f'[update_sim] 빌드: {SIM_SRC}')
    # Windows에서 npm은 npm.cmd. shell=True로 PATH 해석에 맡긴다.
    r = subprocess.run('npm run build', cwd=str(SIM_SRC), shell=True)
    if r.returncode != 0:
        print('[update_sim] 빌드 실패', file=sys.stderr)
        return r.returncode
    if not (SIM_DIST / 'index.html').is_file():
        print(f'[update_sim] dist 산출물 없음: {SIM_DIST}', file=sys.stderr)
        return 1
    if SIM_DEST.exists():
        shutil.rmtree(SIM_DEST)
    shutil.copytree(SIM_DIST, SIM_DEST)
    print(f'[update_sim] 완료: {SIM_DIST} -> {SIM_DEST}')
    return 0


if __name__ == '__main__':
    raise SystemExit(main())
