"""Background registry for the dashboard's IRL re-estimation run.

The MaxEnt fit cannot be served inside an HTTP request. Measured against the
live study data (829 research plays, 26 scenarios, 200 rollouts/scenario,
bootstrap 200) the trajectory sampling alone burns over ten minutes of CPU, so
the request sat open until the browser or an intermediary gave up and
answered the browser with a plain-text ``upstream error`` — which the page then
tried to parse as JSON. Reducing the work is not an option either: the rollout
count and bootstrap size are the study's parameters, not tuning knobs.

So the run happens on a worker thread and the browser polls. This is
deliberately NOT the JOBS registry in crane_web.jobs: that one models
*subprocesses* (it holds a Popen handle and streams stdout through `_reader`),
and `_running_job_snapshot` is what makes the dashboard refuse to start a second
training run. An IRL fit is in-process work and has no business blocking a train
start, so it gets its own single slot.

One run at a time. A second request while a run is in flight is refused with the
running job rather than queued — two concurrent fits would double the load on a
remote database for a result that is overwritten anyway.
"""
import threading
import time
import traceback

_LOCK = threading.Lock()
# Single slot: the latest run, finished or not. Kept after completion so a page
# that reloads mid-run can still collect the result it started.
_JOB = None


def _snapshot_locked() -> dict | None:
    if _JOB is None:
        return None
    return {k: v for k, v in _JOB.items() if k != 'thread'}


def irl_job_snapshot() -> dict | None:
    """Browser-facing view of the latest run, or None if none was ever started."""
    with _LOCK:
        return _snapshot_locked()


def _set_progress(job_id: str, phase: str, done: int, total: int) -> None:
    with _LOCK:
        if _JOB is None or _JOB.get('jobId') != job_id:
            return
        _JOB['phase'] = phase
        _JOB['phaseDone'] = int(done)
        _JOB['phaseTotal'] = int(total)
        _JOB['message'] = _phase_message(phase, done, total)


_PHASE_LABELS = {
    'load': '플레이 기록 로딩 중',
    'sample': '궤적 공간 샘플링 중',
    'fit': 'MaxEnt 적합 + bootstrap 중',
}


def _phase_message(phase: str, done: int, total: int) -> str:
    label = _PHASE_LABELS.get(phase, phase)
    if total > 0:
        return f'{label} ({done}/{total})'
    return label


def start_irl_job(params: dict, owner_id=None):
    """Start a run. Returns (True, snapshot) or (False, snapshot-of-running-job)."""
    global _JOB
    with _LOCK:
        if _JOB is not None and _JOB.get('running'):
            return False, _snapshot_locked()
        job_id = time.strftime('irl_%Y%m%d_%H%M%S')
        _JOB = {
            'jobId': job_id,
            'running': True,
            'ok': None,
            'phase': 'load',
            'phaseDone': 0,
            'phaseTotal': 0,
            'message': _PHASE_LABELS['load'],
            'startedAt': time.time(),
            'finishedAt': None,
            'params': dict(params),
            'ownerId': owner_id,
            'prior': None,
            'path': None,
            'error': None,
        }
        snapshot = _snapshot_locked()
        thread = threading.Thread(target=_run, args=(job_id, dict(params)),
                                  name=f'irl-{job_id}', daemon=True)
        _JOB['thread'] = thread
    thread.start()
    return True, snapshot


def _finish(job_id: str, **fields) -> None:
    with _LOCK:
        if _JOB is None or _JOB.get('jobId') != job_id:
            return
        _JOB.update(fields)
        _JOB['running'] = False
        _JOB['finishedAt'] = time.time()
        _JOB.pop('thread', None)


def _run(job_id: str, params: dict) -> None:
    try:
        from game_irl.irl_from_plays import run_irl
        from game_irl.human_play import PLAYS_DIR
        from crane_db.storage import save_irl_artifact, IRL_KIND_PRIOR

        labeler = params.get('labeler') or 'maxent'
        tier = params.get('tier') or None
        result = run_irl(
            plays_dir=PLAYS_DIR,
            tier=tier,
            labeler=labeler,
            bootstrap=int(params.get('bootstrap') or 100),
            l2=float(params.get('l2') or 1.0),
            n_samples=int(params.get('n_samples') or 200),
            sample_seed=int(params.get('sample_seed') or 0),
            progress_cb=lambda phase, done, total: _set_progress(job_id, phase, done, total),
        )
        if not result.get('ok'):
            _finish(job_id, ok=False, error=result.get('message') or 'IRL failed',
                    message=result.get('message') or 'IRL failed', prior=result)
            return
        ref = save_irl_artifact(IRL_KIND_PRIOR, result,
                                label=f"prior:{labeler}:{tier or 'all'}")
        _finish(job_id, ok=True, prior=result, path=ref,
                phase='done', message='새 prior 생성 완료')
    except Exception as e:
        # The traceback goes to the server log; the browser gets the message.
        # Losing it entirely would leave a failed run with nothing to debug.
        traceback.print_exc()
        _finish(job_id, ok=False, error=str(e), message=f'IRL 실행 실패: {e}')
