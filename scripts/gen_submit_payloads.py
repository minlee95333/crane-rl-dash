"""Regenerate tests/fixtures/submit_payloads.json.

Plays every scenario to a full clear through the real PlaySession API and dumps
the exact /api/game/session/submit response for each, so the browser result
screen can be tested against real payload shapes (the fleet map carries an extra
outcome.cost block, ordered maps carry order metadata, and so on) instead of
hand-written fixtures that drift from the server.

    python scripts/gen_submit_payloads.py

The play files the submit step writes are removed afterwards, so a run never
leaves "verify" plays behind in human_plays/.
"""
import json
import os
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT))

from crane_core.scenarios import list_scenarios  # noqa: E402
from game_irl.human_play import PlaySession  # noqa: E402

OUT = ROOT / "tests" / "fixtures" / "submit_payloads.json"
# Second fixture: two real in-play states the crane panel has to explain — one
# where a crane's option list is EMPTY although lifts remain (it used to render
# the false "남은 양중 없음"), and one where the list is only partially hidden.
OUT_BLOCKED = ROOT / "tests" / "fixtures" / "blocked_states.json"
# Every event carries a full movePath polyline. The result screen never reads
# them (the 3D replay keeps its own client-side log), so keep a couple per
# scenario for shape realism and drop the rest — otherwise the fixture is ~500 KB.
MAX_EVENTS = 2


def play(sess, max_steps=600):
    """Greedy playthrough: each step, give every free crane its first candidate,
    shrinking the batch when the server rejects a radius-overlapping pair."""
    steps = 0
    while steps < max_steps and not sess.state().get("is_done"):
        picks, used = [], set()
        for cid, lst in sess.candidates_by_crane().items():
            for cand in lst:
                if cand["lift_id"] in used:
                    continue
                picks.append((cid, cand["lift_id"], int(cand.get("hard_conflict") or 0)))
                used.add(cand["lift_id"])
                break
        if not picks:
            return False
        picks.sort(key=lambda p: p[2])
        for n in range(len(picks), 0, -1):
            try:
                sess.submit_step({cid: lid for cid, lid, _ in picks[:n]})
                break
            except Exception:  # noqa: BLE001 — combination rejected, try a smaller one
                continue
        else:
            return False
        steps += 1
    return bool(sess.state().get("is_done"))


def capture_blocked_states():
    """Walk scenarios until we have a real 'empty list but lifts remain' state
    and a real 'partially hidden' state."""
    found = {}
    for meta in list_scenarios():
        if len(found) >= 2:
            break
        sess = PlaySession(meta["id"], meta["tier"], "verify")
        for _ in range(200):
            state = sess.state()
            if state.get("is_done"):
                break
            for crane in state["cranes"]:
                shown = state["candidates_by_crane"].get(crane.id if hasattr(crane, "id") else crane["id"]) or []
                blocked = state["blocked_by_crane"].get(crane["id"]) or {}
                if not blocked:
                    continue
                key = "empty" if not shown else "partial"
                if key not in found:
                    found[key] = {"scenario_id": meta["id"], "crane_id": crane["id"], "state": state}
            if len(found) >= 2:
                break
            if not _advance(sess):
                break
    return found


def _advance(sess):
    picks, used = [], set()
    for cid, cands in sess.candidates_by_crane().items():
        for cand in cands:
            if cand["lift_id"] in used:
                continue
            picks.append((cid, cand["lift_id"], int(cand.get("hard_conflict") or 0)))
            used.add(cand["lift_id"])
            break
    if not picks:
        return False
    picks.sort(key=lambda p: p[2])
    for n in range(len(picks), 0, -1):
        try:
            sess.submit_step({cid: lid for cid, lid, _ in picks[:n]})
            return True
        except Exception:  # noqa: BLE001
            continue
    return False


def main():
    payloads = {}
    for meta in list_scenarios():
        sid = meta["id"]
        sess = PlaySession(sid, meta["tier"], "verify", role="대학생·3학년", client="pc")
        if not play(sess):
            print(f"[skip] {sid}: 완주 실패")
            continue
        doc, rel_path = sess.submit()
        outcome = dict(doc["outcome"])
        outcome["events"] = (outcome.get("events") or [])[:MAX_EVENTS]
        payloads[sid] = {
            "ok": True,
            "path": rel_path,
            "meta": doc["meta"],
            "outcome": outcome,
            "scorer_snapshot": doc["scorer_snapshot"],
        }
        saved = ROOT / rel_path
        if saved.exists():
            saved.unlink()
        snap = doc["scorer_snapshot"]
        print(f"[ok  ] {sid}: {snap.get('totalScore')}점 {snap.get('grade')} "
              f"({outcome.get('done')}/{outcome.get('total')})")
    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text(json.dumps(payloads, ensure_ascii=False, indent=1), encoding="utf-8")
    print(f"\nwrote {len(payloads)} payloads -> {OUT.relative_to(ROOT)}")

    blocked = capture_blocked_states()
    OUT_BLOCKED.write_text(json.dumps(blocked, ensure_ascii=False, indent=1), encoding="utf-8")
    for key, entry in blocked.items():
        reasons = sorted(set((entry["state"]["blocked_by_crane"][entry["crane_id"]] or {}).values()))
        print(f"[{key:7s}] {entry['scenario_id']}/{entry['crane_id']} 사유={reasons}")
    print(f"wrote {len(blocked)} states -> {OUT_BLOCKED.relative_to(ROOT)}")


if __name__ == "__main__":
    main()
