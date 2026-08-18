"""모든 시나리오가 실제로 완주 가능한지, 그리고 후보에서 빠진 양중물의 사유가
정확히 보고되는지.

배경: "어떤 시나리오는 완료 후 축하 카드가 안 뜬다 / 어떤 시나리오는 파란 크레인이
양중물을 인식 못한다"는 보고. 두 증상 모두 '완주 불가능한 맵'이라는 하나의 원인으로
설명될 수 있어서(완주 못 하면 full clear가 아니고, 그러면 폭죽도 안 뜬다), 전 시나리오를
실제 PlaySession API로 끝까지 플레이해 검증한다.

검증 결과(이 테스트가 고정하는 사실):
  • 27개 시나리오 전부 완주 가능하며, 시작 시점에 "어느 크레인도 못 드는 양중물"은 없다
  • 후보에서 빠지는 사유는 정격하중/도달이 아니라 순서 잠김과 hard 간섭뿐이다
    (hard 간섭 건은 후보 목록에서 통째로 사라지므로 UI가 사유를 말해 줘야 한다)
"""
import unittest

from crane_core.scenarios import list_scenarios
from game_irl.human_play import PlaySession

MAX_STEPS = 600


def greedy_play(sess, max_steps=MAX_STEPS):
    """각 step마다 놀고 있는 크레인에 첫 후보를 배정하고, 서버가 반경 충돌로
    거부하면 배정 수를 줄여가며 재시도한다 (사람이 할 수 있는 최소한의 조율)."""
    steps = 0
    while steps < max_steps and not sess.state().get("is_done"):
        picks, used = [], set()
        for cid, cands in sess.candidates_by_crane().items():
            for cand in cands:
                if cand["lift_id"] in used:
                    continue
                picks.append((cid, cand["lift_id"], int(cand.get("hard_conflict") or 0)))
                used.add(cand["lift_id"])
                break
        if not picks:
            return False, steps
        picks.sort(key=lambda p: p[2])
        for n in range(len(picks), 0, -1):
            try:
                sess.submit_step({cid: lid for cid, lid, _ in picks[:n]})
                break
            except ValueError:
                continue
        else:
            return False, steps
        steps += 1
    return bool(sess.state().get("is_done")), steps


class AllScenariosPlayableTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.metas = list_scenarios()

    def test_pool_is_not_empty(self):
        self.assertGreaterEqual(len(self.metas), 27)

    def test_every_scenario_can_be_finished(self):
        for meta in self.metas:
            with self.subTest(scenario=meta["id"]):
                sess = PlaySession(meta["id"], meta["tier"], "verify")
                done, steps = greedy_play(sess)
                counters = sess.state().get("raw_counters") or {}
                self.assertTrue(
                    done,
                    f"{meta['id']} 완주 실패: {counters.get('done')}/{counters.get('total')} "
                    f"({steps} steps)",
                )
                self.assertEqual(counters.get("done"), counters.get("total"))

    def test_every_lift_has_at_least_one_capable_crane_at_start(self):
        for meta in self.metas:
            with self.subTest(scenario=meta["id"]):
                sess = PlaySession(meta["id"], meta["tier"], "verify")
                env = sess.env
                for li, lift in enumerate(env.lifts):
                    servers = [
                        crane.id for ci, crane in enumerate(env.cranes)
                        if not env.candidate_outcome(ci, li).get("restricted")
                    ]
                    self.assertTrue(
                        servers,
                        f"{meta['id']}/{lift.id} ({lift.weight_t}t, z={getattr(lift, 'z', 0)}m): "
                        "정격하중·도달 제약으로 어떤 크레인도 들 수 없다",
                    )

    def test_blocked_lifts_are_reported_with_a_reason(self):
        """후보에서 빠진 미완료 양중물은 전부 사유가 붙어야 한다 — 사유 없는
        '조용한 제외'가 있으면 UI가 다시 '남은 양중 없음'으로 거짓말하게 된다."""
        seen_reasons = set()
        for meta in self.metas:
            with self.subTest(scenario=meta["id"]):
                sess = PlaySession(meta["id"], meta["tier"], "verify")
                for _ in range(MAX_STEPS):
                    state = sess.state()
                    if state.get("is_done"):
                        break
                    candidates = state["candidates_by_crane"]
                    blocked = state["blocked_by_crane"]
                    self.assertEqual(set(blocked), {c["id"] for c in state["cranes"]})
                    unfinished = {l["id"] for l in state["lifts"] if not l["done"]}
                    for crane_id, shown in candidates.items():
                        explained = set(blocked[crane_id]) | {c["lift_id"] for c in shown}
                        self.assertEqual(
                            unfinished - explained, set(),
                            f"{meta['id']}/{crane_id}: 사유 없이 빠진 양중물",
                        )
                        for lift_id, reason in blocked[crane_id].items():
                            self.assertIn(lift_id, unfinished)
                            self.assertIn(reason, (
                                PlaySession.BLOCK_HEIGHT, PlaySession.BLOCK_ORDER,
                                PlaySession.BLOCK_CAPACITY, PlaySession.BLOCK_REACH,
                                PlaySession.BLOCK_INTERFERENCE,
                            ))
                            seen_reasons.add(reason)
                    done, _ = greedy_play(sess, max_steps=1)
                    if done:
                        break
        # 실제로 발생하는 사유는 순서 잠김과 hard 간섭 두 가지다. 정격하중/도달로
        # 막히는 양중물이 생기면 맵 밸런스가 깨진 것이므로 여기서 드러나야 한다.
        self.assertIn(PlaySession.BLOCK_INTERFERENCE, seen_reasons)
        self.assertNotIn(PlaySession.BLOCK_CAPACITY, seen_reasons)
        self.assertNotIn(PlaySession.BLOCK_REACH, seen_reasons)


if __name__ == "__main__":
    unittest.main()
