"""Background training-job registry and the stdout reader thread.

In-process state for long-running train / curriculum / auto_reward subprocesses
started from the dashboard: the JOBS dict (keyed by job id), its lock, and the
`_reader` thread that streams a subprocess's stdout into a job's bounded log /
progress deques and, on exit, mirrors produced models / auto_reward runs to the DB.

The two "latest job id" pointers are rebindable scalars, so cross-module callers
go through get/set accessors rather than `global` (which only works within the
defining module). JOBS / JOBS_LOCK / PROGRESS_RETAIN are imported by reference,
so existing call sites keep working unchanged.

No app.py back-import (one-directional): ROOT comes from crane_web.paths and the
model-meta patch helper from crane_web.model_meta; storage writes are lazy.
"""
import json
import threading
from datetime import datetime, timezone

from crane_web.paths import ROOT
from crane_web.model_meta import _model_meta_to_db_patch

JOBS = {}
JOBS_LOCK = threading.Lock()
LATEST_JOB_ID = None
LATEST_AUTO_REWARD_JOB_ID = None
# Max retained per-job training-progress entries. A 150-episode train fits trivially;
# a 2000-episode curriculum still fits in memory. Older entries are evicted from the
# deque but progressTotal keeps counting, so the dashboard's "ep N/M" display stays right.
PROGRESS_RETAIN = 2000


def get_latest_job_id():
    return LATEST_JOB_ID


def set_latest_job_id(job_id):
    global LATEST_JOB_ID
    LATEST_JOB_ID = job_id


def get_latest_auto_reward_job_id():
    return LATEST_AUTO_REWARD_JOB_ID


def set_latest_auto_reward_job_id(job_id):
    global LATEST_AUTO_REWARD_JOB_ID
    LATEST_AUTO_REWARD_JOB_ID = job_id


def _job_response_snapshot(job: dict) -> dict:
    """Return the browser-facing job fields without live deque objects."""
    snap = {k: v for k, v in job.items() if k not in ('log', 'progress', 'process')}
    snap.setdefault('progressTotal', 0)
    snap['progress'] = []
    return snap


def _running_job_snapshot() -> dict | None:
    with JOBS_LOCK:
        for job in JOBS.values():
            if job.get('running'):
                return _job_response_snapshot(job)
    return None


def _reader(job_id, proc):
    job = JOBS[job_id]
    try:
        for line in proc.stdout:
            text = line.rstrip('\n')
            if text.startswith('PROGRESS_JSON: '):
                try:
                    parsed = json.loads(text[len('PROGRESS_JSON: '):])
                except Exception:
                    continue
                # progress is a bounded deque so very long curriculum runs (1000s of
                # episodes) don't grow JOBS unboundedly. progressTotal is the lifetime
                # count; deque retains only the last PROGRESS_RETAIN entries. Both
                # mutations under JOBS_LOCK so the status handler sees a consistent view.
                with JOBS_LOCK:
                    is_auto_reward = job.get('mode') == 'auto_reward'
                    is_auto_reward_event = parsed.get('type') in ('auto_reward_trial', 'auto_reward_done')
                    if is_auto_reward and not is_auto_reward_event:
                        job['latestInnerProgress'] = parsed
                        continue
                    job['progress'].append(parsed)
                    job['progressTotal'] = job.get('progressTotal', 0) + 1
                    if is_auto_reward and parsed.get('type') == 'auto_reward_trial':
                        score = parsed.get('totalScore')
                        if isinstance(score, (int, float)):
                            current_best = job.get('bestScore')
                            if current_best is None or float(score) > float(current_best):
                                job['bestScore'] = float(score)
                                job['bestTrial'] = parsed.get('trialNumber', parsed.get('trial'))
                                job['bestReward'] = parsed.get('reward')
                                job['bestModelPath'] = parsed.get('modelPath')
                continue
            if text.startswith('EPISODE_LAYOUT_JSON: '):
                # Lightweight per-episode scenario snapshot for the dashboard's live
                # preview. We only keep the latest one — older layouts are not useful
                # for an at-a-glance "what is the policy training on right now" view.
                try:
                    layout = json.loads(text[len('EPISODE_LAYOUT_JSON: '):])
                except Exception:
                    continue
                with JOBS_LOCK:
                    job['latestLayout'] = layout
                continue
            # log is a bounded deque (maxlen=300); append is atomic and the maxlen
            # eviction means we never reassign job['log'], so readers always see a
            # live, consistent reference.
            job['log'].append(text)
    finally:
        proc.wait()
        with JOBS_LOCK:
            job['running'] = False
            job['exitCode'] = proc.returncode
            # resultPath is kept relative for the browser-side fetch; resolve against ROOT
            # for the filesystem check so it doesn't depend on the process CWD.
            result = ROOT / job['resultPath']
            job['resultExists'] = result.exists()
            if result.exists():
                if job.get('mode') == 'auto_reward':
                    job['message'] = '보상 계수 자동 탐색 완료: best.json 생성됨'
                else:
                    job['message'] = '학습 완료: 결과 JSON 생성됨'
            else:
                if job.get('stopRequested'):
                    job['message'] = '사용자 요청으로 실행 중단됨'
                elif job.get('mode') == 'auto_reward':
                    job['message'] = '보상 계수 자동 탐색 종료: best.json을 찾지 못함'
                else:
                    job['message'] = '학습 종료: 결과 JSON을 찾지 못함'
            # Snapshot fields under the lock; do the DB writes outside it.
            mode = job.get('mode')
            outdir_rel = job.get('outdir')
            owner_id = job.get('ownerId')
            stop_requested = bool(job.get('stopRequested'))
            best_score = job.get('bestScore')
            best_trial = job.get('bestTrial')
            best_reward = job.get('bestReward')
            result_exists = job['resultExists']
        # ---- DB sync (best-effort; never fail the reader thread on DB error) ----
        try:
            outdir_abs = (ROOT / outdir_rel) if outdir_rel else None
            if mode in ('train', 'curriculum') and outdir_abs and outdir_abs.exists():
                # Mirror every .pt produced by this run into models. owner_id
                # comes from whoever started the job; subsequent labeling adds
                # name/memo without touching ownership.
                from crane_db.storage import upsert_model
                for pt in outdir_abs.rglob('*.pt'):
                    if '__pycache__' in pt.parts:
                        continue
                    try:
                        rel_path = pt.relative_to(ROOT).as_posix()
                        patch = _model_meta_to_db_patch(pt)
                        if owner_id:
                            patch['owner_id'] = owner_id
                        upsert_model(rel_path, patch)
                    except Exception:
                        continue
            elif mode == 'auto_reward':
                from crane_db.storage import upsert_auto_reward_run
                if stop_requested:
                    status = 'stopped'
                elif result_exists:
                    status = 'done'
                else:
                    status = 'failed'
                upsert_auto_reward_run(job_id, {
                    'status': status,
                    'best_score': best_score,
                    'best_trial': best_trial,
                    'best_reward': best_reward if isinstance(best_reward, (dict, list)) else None,
                    'finished_at': datetime.now(tz=timezone.utc),
                })
        except Exception:
            pass
