"""End-to-end check: train a model over HTTP, then plan with it over HTTP.

Covers the link the earlier investigation left unverified -- the previous pass
drove `rl_trainer.train` directly and only asserted that _list_models /
_resolve_model_path accepted the artifact. This drives the real server:

    POST /api/train/start  ->  poll /api/train/status  ->  GET /api/models/list
                           ->  POST /api/plan/run (modelPath = the new model)

Run directly (not under pytest -- it boots a server and trains for real):

    python tests/e2e_train_to_plan.py

The child server writes to the local file store — this build has no remote
storage path at all.
"""
import json
import os
import shutil
import subprocess
import sys
import time
import urllib.error
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
PORT = int(os.environ.get("E2E_PORT", "8123"))
BASE = f"http://127.0.0.1:{PORT}"
TRAIN_TIMEOUT_S = 900


def _post(path, payload):
    req = urllib.request.Request(
        BASE + path,
        data=json.dumps(payload).encode("utf-8"),
        headers={"Content-Type": "application/json"},
        method="POST",
    )
    with urllib.request.urlopen(req, timeout=120) as r:
        return json.loads(r.read().decode("utf-8"))


def _get(path):
    """GET returning the parsed body. 404 is a normal answer for /api/train/status
    before a job exists, so read the error body instead of raising."""
    try:
        with urllib.request.urlopen(BASE + path, timeout=60) as r:
            return json.loads(r.read().decode("utf-8"))
    except urllib.error.HTTPError as e:
        try:
            return json.loads(e.read().decode("utf-8"))
        except Exception:
            raise


def _wait_for_server(proc, timeout=90):
    """Ready as soon as the port answers HTTP at all.

    /api/train/status 404s until a job exists, and urllib raises HTTPError for
    that -- so any HTTP status (not just 200) counts as "the server is up".
    """
    deadline = time.time() + timeout
    while time.time() < deadline:
        if proc.poll() is not None:
            raise RuntimeError(f"server exited early with code {proc.returncode}")
        try:
            _get("/api/models/list")
            return
        except urllib.error.HTTPError:
            return
        except (urllib.error.URLError, OSError, json.JSONDecodeError):
            time.sleep(0.5)
    raise RuntimeError("server did not become ready")


def _layout():
    """A small but valid site: 2 cranes, 4 lifts inside their reach."""
    cranes = [
        {"id": "C1", "x": 30.0, "y": 30.0, "setup_x": 30.0, "setup_y": 30.0},
        {"id": "C2", "x": 70.0, "y": 70.0, "setup_x": 70.0, "setup_y": 70.0},
    ]
    lifts = [
        {"id": "L1", "x": 35.0, "y": 40.0, "weight_t": 12.0},
        {"id": "L2", "x": 25.0, "y": 25.0, "weight_t": 8.0},
        {"id": "L3", "x": 65.0, "y": 62.0, "weight_t": 20.0},
        {"id": "L4", "x": 75.0, "y": 78.0, "weight_t": 15.0},
    ]
    return cranes, lifts


def main():
    results = []

    def check(name, ok, detail=""):
        results.append((name, ok, detail))
        print(f"  [{'PASS' if ok else 'FAIL'}] {name}" + (f" -- {detail}" if detail else ""))
        return ok

    env = dict(os.environ)
    env["PORT"] = str(PORT)
    env["HOST"] = "127.0.0.1"
    env["PYTHONIOENCODING"] = "utf-8"

    print(f"[1/5] 서버 기동 (127.0.0.1:{PORT})")
    proc = subprocess.Popen(
        [sys.executable, "-u", "app.py"],
        cwd=str(ROOT), env=env,
        stdout=subprocess.PIPE, stderr=subprocess.STDOUT, text=True,
    )
    outdir = None
    try:
        _wait_for_server(proc)
        print("      서버 준비됨")

        print("[2/5] POST /api/train/start (episodes=2, lifts=6)")
        started = _post("/api/train/start", {
            "episodes": 2, "num_cranes": 2, "num_lifts": 6,
            "validation_seed_count": 2, "unseen_seed_count": 2,
        })
        check("train/start 수락", bool(started.get("ok")), started.get("message", ""))
        if not started.get("ok"):
            return 1
        job_id = started["job"]["jobId"]
        outdir = ROOT / started["job"]["outdir"]
        print(f"      jobId={job_id} outdir={started['job']['outdir']}")

        print("[3/5] 학습 완료 대기")
        deadline = time.time() + TRAIN_TIMEOUT_S
        job = {}
        while time.time() < deadline:
            job = (_get("/api/train/status") or {}).get("job") or {}
            if not job.get("running"):
                break
            time.sleep(3)
        check("학습 종료", not job.get("running"), f"exitCode={job.get('exitCode')}")
        check("학습 정상 종료(exit 0)", job.get("exitCode") == 0, str(job.get("message", "")))
        check("결과 JSON 생성", bool(job.get("resultExists")), str(job.get("message", "")))

        rel_model = f"{started['job']['outdir']}/pytorch_mappo_model.pt".replace("\\", "/")
        check(".pt 파일 생성", (ROOT / rel_model).exists(), rel_model)

        print("[4/5] GET /api/models/list — 목록 등장 및 메타데이터")
        models = (_get("/api/models/list") or {}).get("models") or []
        hit = next((m for m in models if m.get("path") == rel_model), None)
        check("모델 목록에 등장", hit is not None, rel_model)
        if hit:
            check("file_present=True (드롭다운 노출 조건)", hit.get("file_present") is True)
            meta = hit.get("meta") or {}
            curve = meta.get("crane_capacity_curve")
            check("정격곡선 메타 노출", isinstance(curve, list) and len(curve) > 0,
                  f"{len(curve)}점" if isinstance(curve, list) else "없음")
            check("plan config 메타 노출", meta.get("num_cranes") is not None,
                  f"num_cranes={meta.get('num_cranes')}, crane_radius={meta.get('crane_radius')}")

        print("[5/5] POST /api/plan/run — 새 모델로 양중계획 생성")
        cranes, lifts = _layout()
        plan = _post("/api/plan/run", {
            "cranes": cranes, "lifts": lifts, "policy": "mappo", "modelPath": rel_model,
        })
        check("plan/run 성공", bool(plan.get("ok")), str(plan.get("message", "")))
        res = plan.get("result") or {}
        check("스케줄 이벤트 생성", bool(res.get("events")), f"events={len(res.get('events') or [])}")
        check("makespan 산출", res.get("makespan") is not None, f"makespan={res.get('makespan')}")
        applied = res.get("appliedConfig") or {}
        ac = applied.get("crane_capacity_curve")
        check("정격곡선이 계획에 실제 적용", isinstance(ac, list) and len(ac) > 0,
              f"{len(ac)}점" if isinstance(ac, list) else "미적용")
        print(f"      완료 {res.get('done')}/{res.get('total')} · makespan {res.get('makespan')}")
    finally:
        proc.terminate()
        try:
            proc.wait(timeout=15)
        except subprocess.TimeoutExpired:
            proc.kill()
        if outdir and outdir.exists() and "dashboard_runs" in str(outdir):
            shutil.rmtree(outdir, ignore_errors=True)
            print(f"[cleanup] {outdir.name} 삭제")

    failed = [n for n, ok, _ in results if not ok]
    print()
    print(f"결과: {len(results) - len(failed)}/{len(results)} 통과")
    if failed:
        print("실패:", ", ".join(failed))
    return 1 if failed else 0


if __name__ == "__main__":
    sys.exit(main())
