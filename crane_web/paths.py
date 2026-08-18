"""Filesystem roots shared across app.py and crane_web modules.

Factored into one place so helper modules (e.g. model_meta) can resolve paths
without importing app.py back (which would be circular). ROOT is the project
root — this file lives in crane_web/, hence ``parent.parent``.
"""
import os
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
TRAINER_ROOT = ROOT / 'rl_trainer'
LEGACY_MAPPO_ROOT = ROOT / 'python_mappo'
TRAINER_CONFIG_PATH = TRAINER_ROOT / 'config.yaml'
TRAINER_DASHBOARD_RUNS = TRAINER_ROOT / 'dashboard_runs'


def persistence_status(path=TRAINER_DASHBOARD_RUNS):
    """Report whether dashboard-trained models survive a redeploy.

    A container platform hands every deploy a fresh filesystem, so anything
    written under the app directory is lost on the next deploy. Models trained
    from the dashboard land in TRAINER_DASHBOARD_RUNS, which therefore has to
    sit on a mounted volume when the app is containerised. Running locally it
    is an ordinary directory and always persists.

    A volume shows up as a different st_dev than the app root. That check is a
    heuristic (a volume mounted at the root's own device would read as absent),
    but it catches the failure that actually happens: the mount path is wrong or
    was never configured, which stays invisible until a redeploy silently drops
    every trained model.

    Returned dict is advisory only — nothing in the request path depends on it.
    """
    path = Path(path)
    info = {
        'path': str(path),
        'exists': path.exists(),
        'writable': False,
        'separate_device': False,
        'persistent': False,
        'detail': '',
    }
    try:
        path.mkdir(parents=True, exist_ok=True)
        info['exists'] = True
    except OSError as e:
        info['detail'] = f'생성 실패: {e}'
        return info
    probe = path / '.write_probe'
    try:
        probe.write_text('ok', encoding='utf-8')
        probe.unlink()
        info['writable'] = True
    except OSError as e:
        info['detail'] = f'쓰기 불가: {e}'
        return info
    try:
        info['separate_device'] = os.stat(path).st_dev != os.stat(ROOT).st_dev
    except OSError as e:
        info['detail'] = f'device 확인 실패: {e}'
        return info
    info['persistent'] = info['writable'] and info['separate_device']
    info['detail'] = (
        '볼륨 마운트 감지 - 학습한 모델이 재배포 후에도 유지됩니다.'
        if info['persistent']
        else '볼륨 없음 - 여기에 저장된 모델은 재배포 시 사라집니다.'
    )
    return info

# auto_reward optimization run roots. Both the current trainer location and the
# legacy python_mappo location are accepted so existing runs stay reachable.
TRAINER_AUTO_REWARD_RUNS = TRAINER_ROOT / 'auto_reward_runs'
AUTO_REWARD_RUN_ROOTS = (TRAINER_AUTO_REWARD_RUNS, LEGACY_MAPPO_ROOT / 'auto_reward_runs')
