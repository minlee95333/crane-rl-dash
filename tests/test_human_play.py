import unittest
from unittest.mock import patch

from crane_core.env import CraneSchedulingEnv
from game_irl.human_play import PlaySession


def setUpModule():
    global _persist_session_patch
    _persist_session_patch = patch("game_irl.human_play.persist_session")
    _persist_session_patch.start()


def tearDownModule():
    _persist_session_patch.stop()


class PlaySessionUndoTests(unittest.TestCase):
    def test_undo_does_not_expose_replayed_events_as_new_animation(self):
        session = PlaySession(
            "D1_1",
            "general",
            "tester",
            user={"id": "test-user", "display_name": "tester"},
        )
        session.submit_step({"C1": "L1"})
        session.submit_step({"C1": "L2"})

        state = session.undo()

        self.assertEqual(state["step"], 1)
        self.assertFalse(state["is_done"])
        self.assertEqual(state["last_step_events"], [])


class ManualSetupValidationTests(unittest.TestCase):
    def test_rejects_straight_path_crossing_restricted_zone(self):
        session = PlaySession(
            "D3_1",
            "general",
            "tester",
            user={"id": "test-user", "display_name": "tester"},
        )

        with self.assertRaisesRegex(ValueError, "이동 경로가 제한구역을 가로지릅니다"):
            session.submit_step({
                "C1": {"lift_id": "L1", "setup_x": 35, "setup_y": 45},
            })

        state = session.state()
        self.assertEqual(state["step"], 0)
        self.assertFalse(state["is_done"])
        self.assertFalse(any(lift["done"] for lift in state["lifts"]))

    def test_marks_manual_setup_outside_site_as_restricted(self):
        env = CraneSchedulingEnv({
            "num_cranes": 1,
            "num_lifts": 1,
            "site_width": 100,
            "site_height": 100,
            "crane_radius": 18,
            "anchor_jitter": 0,
            "anchor_layout": {
                "cranes": [{"id": "C1", "x": 1, "y": 10}],
                "lifts": [{"id": "L1", "x": 1, "y": 10, "weight": 1}],
                "restrictedZones": [],
            },
        })

        outcome = env.outcome_for_setup(0, 0, -1, 10)

        self.assertTrue(outcome["restricted"])
        self.assertTrue(outcome["outOfBounds"])


class HardInterferenceRuleTests(unittest.TestCase):
    def setUp(self):
        self.env = CraneSchedulingEnv({
            "num_cranes": 1,
            "num_lifts": 1,
            "site_width": 100,
            "site_height": 100,
            "crane_radius": 18,
            "anchor_jitter": 0,
            "anchor_layout": {
                "cranes": [{"id": "C1", "x": 10, "y": 10}],
                "lifts": [{"id": "L1", "x": 10, "y": 10, "weight": 1}],
                "restrictedZones": [],
            },
        })

    @staticmethod
    def _out():
        return {
            "start": 0.0,
            "finish": 10.0,
            "liftStart": 2.0,
            "liftFinish": 8.0,
            "sx": 0.0,
            "sy": 0.0,
            "actual": 5.0,
        }

    @staticmethod
    def _event(center_x, lift_start=4.0, lift_finish=7.0):
        return {
            "start": 0.0,
            "finish": 10.0,
            "liftStart": lift_start,
            "liftFinish": lift_finish,
            "radiusCenterX": center_x,
            "radiusCenterY": 0.0,
            "actualLiftRadius": 4.0,
            "craneRadius": 18.0,
        }

    def test_hard_requires_hoist_time_and_actual_radius_overlap(self):
        hard, _ = self.env.risk_counts(self._out(), [self._event(8.0)])
        self.assertEqual(hard, 1)

        hard, _ = self.env.risk_counts(
            self._out(),
            [self._event(8.0, lift_start=8.0, lift_finish=9.0)],
        )
        self.assertEqual(hard, 0)

    def test_exact_radius_tangency_is_not_hard(self):
        hard, _ = self.env.risk_counts(self._out(), [self._event(9.0)])
        self.assertEqual(hard, 0)


class StepSoftInterferenceRuleTests(unittest.TestCase):
    def setUp(self):
        self.env = CraneSchedulingEnv({
            "num_cranes": 2,
            "num_lifts": 7,
            "site_width": 100,
            "site_height": 100,
            "crane_radius": 18,
        })

    @staticmethod
    def _events(distance):
        events = []
        for i in range(5):
            events.append({
                "craneId": "C1", "liftId": f"L{i + 1}",
                "radiusCenterX": 20.0, "radiusCenterY": 20.0, "craneRadius": 18.0,
            })
        for i in range(2):
            events.append({
                "craneId": "C2", "liftId": f"L{i + 6}",
                "radiusCenterX": 20.0 + distance, "radiusCenterY": 20.0, "craneRadius": 18.0,
            })
        return events

    def test_counts_all_lifts_handled_by_overlapping_cranes(self):
        events = self._events(25.0)

        count = self.env.apply_step_soft_conflicts(events)

        self.assertEqual(count, 7)
        self.assertEqual([e["softConflict"] for e in events], [1] * 7)

    def test_does_not_count_tangent_or_separate_working_radii(self):
        events = self._events(36.0)

        count = self.env.apply_step_soft_conflicts(events)

        self.assertEqual(count, 0)
        self.assertEqual([e["softConflict"] for e in events], [0] * 7)


class InterferenceStateTests(unittest.TestCase):
    def test_state_exposes_accepted_event_geometry_for_preview(self):
        session = PlaySession(
            "D1_1",
            "general",
            "tester",
            user={"id": "test-user", "display_name": "tester"},
        )

        state = session.submit_step({"C1": "L1"})

        self.assertEqual(len(state["interference_events"]), 1)
        event = state["interference_events"][0]
        self.assertEqual(event["crane_id"], "C1")
        self.assertEqual(event["lift_id"], "L1")
        self.assertIn("actual_radius", event)
        self.assertLess(event["lift_start"], event["lift_finish"])


class DecisionReasonTests(unittest.TestCase):
    def _session(self):
        return PlaySession(
            "D1_1",
            "general",
            "tester",
            user={"id": "test-user", "display_name": "tester"},
        )

    def test_whitelisted_reason_is_persisted_into_actions(self):
        session = self._session()
        session.submit_step({"C1": {"lift_id": "L1", "reason": "move_min"}})

        self.assertEqual(session.user_steps[0]["C1"].get("reason"), "move_min")

    def test_unknown_reason_is_dropped(self):
        session = self._session()
        session.submit_step({"C1": {"lift_id": "L1", "reason": "DROP TABLE"}})

        self.assertNotIn("reason", session.user_steps[0]["C1"])

    def test_hesitation_meta_is_clamped_and_persisted(self):
        session = self._session()
        session.submit_step({"C1": {"lift_id": "L1", "think_ms": 4521.7, "switches": 3}})

        decision = session.user_steps[0]["C1"]
        self.assertEqual(decision["think_ms"], 4521)
        self.assertEqual(decision["switches"], 3)

    def test_hesitation_meta_rejects_garbage(self):
        session = self._session()
        session.submit_step({
            "C1": {"lift_id": "L1", "think_ms": -50, "switches": "many", "reason": True},
        })

        decision = session.user_steps[0]["C1"]
        self.assertEqual(decision["think_ms"], 0)
        self.assertNotIn("switches", decision)
        self.assertNotIn("reason", decision)

    def test_reason_survives_undo_replay_of_earlier_steps(self):
        session = self._session()
        session.submit_step({"C1": {"lift_id": "L1", "reason": "balance"}})
        session.submit_step({"C1": "L2"})

        session.undo()

        self.assertEqual(session.user_steps[0]["C1"].get("reason"), "balance")


class PartialOrderModeTests(unittest.TestCase):
    """Partial-order variant: only a seeded subset of lifts carries a relative
    order (a precedence chain); every other lift is free to lift anytime."""

    def _ordered(self, scenario="D3_1", seed="ABC", order_count=None):
        s = PlaySession(
            scenario, "general", "tester",
            user={"id": "u", "display_name": "tester"},
            order_mode=True, order_seed=seed,
        )
        if order_count is not None:
            # force a subset size for deterministic assertions
            s.scenario["order_count"] = order_count
            s._init_precedence()
        return s

    def _cand_ids(self, s, crane="C1"):
        return [c["lift_id"] for c in s.candidates_by_crane()[crane]]

    def test_off_by_default_no_order_imposed(self):
        s = PlaySession("D3_1", "general", "tester",
                        user={"id": "u", "display_name": "tester"})
        self.assertFalse(s.order_mode)
        self.assertIsNone(s._order_perm)
        n_lifts = len(s.scenario["layout"]["lifts"])
        self.assertEqual(len(s.candidates_by_crane()["C1"]), n_lifts)

    def test_only_subset_carries_seq_rest_are_free(self):
        s = self._ordered(order_count=4)
        n_lifts = len(s.scenario["layout"]["lifts"])
        self.assertEqual(len(s._order_perm), 4)
        # only the ordered subset has seq labels
        seq_lifts = [l["id"] for l in s.lift_status() if l.get("seq") is not None]
        self.assertCountEqual(seq_lifts, s._order_perm)
        # at start every free lift + the first ordered lift are candidates;
        # only the 2nd..Nth ordered lifts (waiting on predecessors) are locked.
        cands = set(self._cand_ids(s))
        locked = set(s._order_perm[1:])
        self.assertEqual(cands, set(l.id for l in s.env.lifts) - locked)
        self.assertIn(s._order_perm[0], cands)  # first ordered lift is free
        self.assertLess(len(s._order_perm), n_lifts)  # some lifts stay free

    def test_picking_ordered_lift_out_of_sequence_is_rejected(self):
        s = self._ordered(order_count=4)
        second = s._order_perm[1]  # needs the first ordered lift done first
        with self.assertRaises(ValueError):
            s.submit_step({"C1": second})

    def test_free_lift_can_be_taken_anytime(self):
        s = self._ordered(order_count=4)
        free = next(l.id for l in s.env.lifts if l.id not in s._order_perm)
        s.submit_step({"C1": free})  # should not raise
        self.assertTrue(any(l.done for l in s.env.lifts))

    def test_next_ordered_unlocks_after_predecessor(self):
        s = self._ordered(order_count=4)
        self.assertNotIn(s._order_perm[1], self._cand_ids(s))  # locked at start
        s.submit_step({"C1": s._order_perm[0]})                # do first ordered
        self.assertIn(s._order_perm[1], self._cand_ids(s))     # 2nd now unlocked

    def test_seed_is_deterministic_and_sensitive(self):
        self.assertEqual(self._ordered(seed="ABC")._order_perm,
                         self._ordered(seed="ABC")._order_perm)
        self.assertNotEqual(self._ordered(seed="ABC")._order_perm,
                            self._ordered(seed="ZZZ")._order_perm)

    def test_persistence_round_trip_preserves_order(self):
        s = self._ordered()
        s.submit_step({"C1": s._order_perm[0]})
        rebuilt = PlaySession.from_persisted_doc(s.to_persisted_doc())
        self.assertTrue(rebuilt.order_mode)
        self.assertEqual(rebuilt._order_perm, s._order_perm)
        self.assertEqual(rebuilt.state()["order_mode"], True)

    def test_state_exposes_order_mode_flag(self):
        self.assertTrue(self._ordered().state()["order_mode"])

    def test_dedicated_scenario_auto_enables_partial_order(self):
        # ORD_2 carries order_mode + order_count=4 in its spec.
        s = PlaySession("ORD_2", "general", "tester",
                        user={"id": "u", "display_name": "tester"})
        self.assertTrue(s.order_mode)
        self.assertEqual(len(s._order_perm), 4)
        n_lifts = len(s.scenario["layout"]["lifts"])
        # free lifts keep play unblocked: more candidates than just the chain head
        self.assertGreater(len(s.candidates_by_crane()["C1"]), 1)
        self.assertLess(len(s._order_perm), n_lifts)


class SubmitOutcomeSchemaTests(unittest.TestCase):
    """Regression: the play doc must not duplicate makespan / completion into
    outcome["raw"]. makespan is canonical at outcome["makespan"] and completion
    is derivable from outcome["done"]/["total"]; raw only holds metrics that live
    nowhere else. Removing them keeps the recorded schema free of redundancy while
    IRL (which reads outcome.makespan/done/total + raw.soft_interference_count /
    idle_steps_*) stays intact."""

    def _submit_one_step(self):
        session = PlaySession(
            "D1_1", "general", "tester",
            user={"id": "test-user", "display_name": "tester"},
        )
        session.submit_step({"C1": "L1"})
        with patch("game_irl.human_play._storage.save_play", return_value="ref"), \
                patch("game_irl.human_play._storage.delete_game_session"):
            doc, _ = session.submit()
        return doc

    def test_outcome_raw_omits_duplicated_makespan_and_completion(self):
        outcome = self._submit_one_step()["outcome"]
        # canonical fields live at the top level ...
        self.assertIn("makespan", outcome)
        self.assertIn("done", outcome)
        self.assertIn("total", outcome)
        # ... and are neither duplicated (makespan) nor derived (completion) in raw
        self.assertNotIn("makespan", outcome["raw"])
        self.assertNotIn("completion", outcome["raw"])

    def test_outcome_raw_retains_metrics_that_live_only_there(self):
        raw = self._submit_one_step()["outcome"]["raw"]
        for key in ("soft_interference_count", "idle_steps_total",
                    "idle_steps_per_crane", "restricted_executed",
                    "per_crane_jobs", "per_crane_busy"):
            self.assertIn(key, raw)


class CorridorScenarioTests(unittest.TestCase):
    """Regression for the pipe-rack corridor map (crane_core.corridor): it must be
    registered, exposed in the frontend list as an expert map, and playable end to
    end — every one of its 12 lifts completes under a greedy first-candidate policy
    (guards against a future coordinate/zone edit that strands a lift)."""

    def test_registered_and_listed_as_expert(self):
        from crane_core import scenarios as S
        row = next((r for r in S.list_scenarios() if r["id"] == "CORRIDOR_1"), None)
        self.assertIsNotNone(row, "CORRIDOR_1 not in list_scenarios")
        self.assertEqual(row["tier"], "expert")
        self.assertEqual(row["num_lifts"], 12)
        self.assertEqual(row["num_restricted"], 1)

    def test_offline_reachability_has_no_stranded_lift(self):
        from crane_core.corridor import verify_reachable
        self.assertEqual(verify_reachable(), [])

    def test_greedy_playthrough_completes_all_lifts(self):
        session = PlaySession(
            "CORRIDOR_1", "expert", "tester",
            user={"id": "u", "display_name": "tester"},
        )
        n_lifts = len(session.scenario["layout"]["lifts"])
        state = session.state()
        steps = 0
        while not state["is_done"] and steps < 60:
            # One crane per step (the first with any candidate). Staggering avoids
            # inter-crane radius interference, which players navigate but a blind
            # greedy driver would trip; the point here is that every lift completes.
            decisions = {}
            for crane_id, cands in session.candidates_by_crane().items():
                if cands:
                    decisions[crane_id] = cands[0]["lift_id"]
                    break
            self.assertTrue(decisions, "expected a legal candidate every step")
            state = session.submit_step(decisions)
            steps += 1
        self.assertTrue(state["is_done"], "corridor scenario did not complete")
        self.assertEqual(sum(1 for l in session.env.lifts if l.done), n_lifts)


class FleetScenarioTests(unittest.TestCase):
    """Regression for the fleet-sizing map (crane_core.fleet, FLEET_1): the player
    picks the crane count (1–3) + parking spots before starting. Covers the list
    flag (crane_choice), placement-independent reachability, server-side fleet
    validation, fleet persistence across restarts, and the priced outcome
    (outcome.cost) that only fleet maps carry."""

    U = {"id": "u", "display_name": "tester"}

    def test_listed_with_crane_choice_flag(self):
        from crane_core import scenarios as S
        row = next((r for r in S.list_scenarios() if r["id"] == "FLEET_1"), None)
        self.assertIsNotNone(row, "FLEET_1 not in list_scenarios")
        self.assertEqual(row["crane_choice"], {"min": 1, "max": 3})
        # ordinary maps must NOT carry the flag (clients key UI off it)
        other = next(r for r in S.list_scenarios() if r["id"] == "D1_1")
        self.assertIsNone(other["crane_choice"])

    def test_reachability_is_placement_independent(self):
        from crane_core.fleet import verify_reachable
        self.assertEqual(verify_reachable(), [])
        # a single crane parked in a far corner must still solve every lift
        self.assertEqual(verify_reachable(cranes=[{"id": "C1", "x": 8.0, "y": 92.0}]), [])

    def test_fleet_validation_rejections(self):
        cases = [
            ([], "0 cranes"),
            ([{"x": 10, "y": 10}] * 4, "4 cranes over max"),
            ([{"x": 50, "y": 50}], "inside the footprint zone"),
            ([{"x": 120, "y": 50}], "outside the site"),
            ([{"x": "no", "y": 10}], "non-numeric coords"),
        ]
        for cranes, label in cases:
            with self.subTest(case=label):
                with self.assertRaises(ValueError):
                    PlaySession("FLEET_1", "expert", "t", user=self.U, cranes=cranes)

    def test_non_fleet_scenario_rejects_cranes_param(self):
        with self.assertRaises(ValueError):
            PlaySession("D1_1", "general", "t", user=self.U, cranes=[{"x": 10, "y": 10}])

    def test_persistence_round_trip_keeps_fleet(self):
        s = PlaySession("FLEET_1", "expert", "t", user=self.U, cranes=[{"x": 15, "y": 15}])
        s.submit_step({"C1": "L9"})
        rebuilt = PlaySession.from_persisted_doc(s.to_persisted_doc())
        self.assertEqual(rebuilt.env.nC, 1)
        self.assertEqual(rebuilt.scenario["layout"]["cranes"],
                         [{"id": "C1", "x": 15.0, "y": 15.0}])

    def _play_to_submit(self, session):
        state = session.state()
        steps = 0
        while not state["is_done"] and steps < 60:
            decisions = {}
            for crane_id, cands in session.candidates_by_crane().items():
                if cands:  # one crane per step avoids radius interference
                    decisions[crane_id] = cands[0]["lift_id"]
                    break
            self.assertTrue(decisions, "expected a legal candidate every step")
            state = session.submit_step(decisions)
            steps += 1
        self.assertTrue(state["is_done"])
        with patch("game_irl.human_play._storage.save_play", return_value="ref"), \
                patch("game_irl.human_play._storage.delete_game_session"):
            doc, _ = session.submit()
        return doc

    def test_each_fleet_size_completes_and_is_priced(self):
        fleets = {
            1: [{"x": 20, "y": 20}],
            2: [{"x": 20, "y": 20}, {"x": 80, "y": 80}],
            3: [{"x": 20, "y": 20}, {"x": 80, "y": 80}, {"x": 80, "y": 20}],
        }
        for n, cranes in fleets.items():
            with self.subTest(cranes=n):
                s = PlaySession("FLEET_1", "expert", "t", user=self.U, cranes=cranes)
                doc = self._play_to_submit(s)
                self.assertEqual(len(doc["layout"]["cranes"]), n)
                cost = doc["outcome"].get("cost")
                self.assertIsNotNone(cost, "fleet map submit must be priced")
                self.assertGreater(cost["totalCost"], 0)
                for key in ("rental", "idle", "fuel", "labor"):
                    self.assertIn(key, cost["items"])

    def test_non_fleet_outcome_has_no_cost_block(self):
        # ordinary maps keep their outcome schema unchanged (no cost key)
        s = PlaySession("D1_1", "general", "t", user=self.U)
        doc = self._play_to_submit(s)
        self.assertNotIn("cost", doc["outcome"])


class NicknameSanitisationTests(unittest.TestCase):
    """표시 ID가 낱자(호환 자모)만으로 되어 있어도 살아남아야 한다.

    `가-힣`은 완성형 음절만 덮으므로 자모를 허용 집합에 넣지 않으면
    'ㄷㅎ'·'ㅋㅋ' 같은 흔한 한국어 닉네임이 통째로 지워져 'anon'이 되고,
    리더보드와 플레이 기록에 ANON으로 남는다. 실제로 발생했던 결함이다."""

    def test_jamo_only_nicknames_survive(self):
        from game_irl.human_play import _safe_nick
        for raw in ("ㄷㅎ", "ㅋㅋ", "ㅁㅁㅁ", "ㅎㅇ", "ㅠㅠ"):
            with self.subTest(raw=raw):
                self.assertEqual(_safe_nick(raw), raw)

    def test_storage_display_name_keeps_jamo(self):
        from crane_db.storage import _display_name
        for raw in ("ㄷㅎ", "ㅋㅋ"):
            with self.subTest(raw=raw):
                self.assertEqual(_display_name(raw), raw)

    def test_two_modules_agree_on_allowed_characters(self):
        """문자 집합이 두 모듈에 각각 적혀 있어 한쪽만 고쳐지면 조용히 어긋난다."""
        from game_irl.human_play import _safe_nick
        from crane_db.storage import _display_name
        for raw in ("ㄷㅎ", "이승민", "abc123", "ㅋㅋ쿠쿠", "a-b_c", "홍길동"):
            with self.subTest(raw=raw):
                self.assertEqual(_safe_nick(raw), _display_name(raw))

    def test_unsafe_characters_are_still_stripped(self):
        from game_irl.human_play import _safe_nick
        self.assertEqual(_safe_nick("../../etc"), "etc")
        self.assertEqual(_safe_nick("a/b\\c"), "abc")
        self.assertEqual(_safe_nick("!@#$%"), "anon")
        self.assertEqual(_safe_nick(""), "anon")


class MultiInstanceSessionTests(unittest.TestCase):
    """numReplicas > 1 에서 세션 진행이 롤백되지 않아야 한다.

    로드밸런서가 라운드로빈이라 A에서 만든 세션의 다음 step 이 B로 가고 그
    다음이 다시 A로 온다. A의 메모리 캐시는 B가 진행시킨 상태를 모르므로,
    캐시를 그대로 돌려주면 참여자의 진행이 사라진다. 모든 상태 변경은
    persist_session 으로 DB에 write-through 되므로 멀티 인스턴스에서는 DB를
    유일한 진실로 삼아야 한다.
    """

    def test_cache_is_bypassed_so_another_instance_progress_is_not_lost(self):
        from game_irl import human_play

        session = PlaySession(
            "D1_1", "general", "tester",
            user={"id": "test-user", "display_name": "tester"},
        )
        sid = session.session_id
        # 인스턴스 A의 캐시: 아직 한 수도 두지 않은 상태.
        stale = session
        # 인스턴스 B가 진행시켜 DB에 저장한 상태를 흉내낸다.
        fresh = PlaySession(
            "D1_1", "general", "tester",
            user={"id": "test-user", "display_name": "tester"},
        )
        fresh.session_id = sid
        fresh.submit_step({"C1": "L1"})
        self.assertGreater(len(fresh.user_steps), len(stale.user_steps),
                           "B 인스턴스가 실제로 진행한 상태여야 한다")

        loaded = {"calls": 0}

        def fake_load(session_id):
            loaded["calls"] += 1
            return {"session_id": session_id}

        with patch.dict(human_play._SESSIONS, {sid: stale}, clear=True), \
                patch.object(human_play, "MULTI_INSTANCE", True), \
                patch.object(human_play._storage, "load_game_session", fake_load), \
                patch.object(human_play.PlaySession, "from_persisted_doc",
                             staticmethod(lambda doc: fresh)):
            got = human_play.get_session(sid)

        self.assertEqual(loaded["calls"], 1, "멀티 인스턴스에서는 매번 DB를 읽는다")
        self.assertIs(got, fresh, "캐시된 옛 상태가 아니라 DB의 최신 상태를 돌려준다")
        self.assertEqual(len(got.user_steps), len(fresh.user_steps))

    def test_single_instance_still_uses_the_cache(self):
        """단일 인스턴스 배포의 성능은 그대로 — step 마다 DB를 치지 않는다."""
        from game_irl import human_play

        session = PlaySession(
            "D1_1", "general", "tester",
            user={"id": "test-user", "display_name": "tester"},
        )
        sid = session.session_id
        calls = {"n": 0}

        def fake_load(session_id):
            calls["n"] += 1
            return None

        with patch.dict(human_play._SESSIONS, {sid: session}, clear=True), \
                patch.object(human_play, "MULTI_INSTANCE", False), \
                patch.object(human_play._storage, "load_game_session", fake_load):
            got = human_play.get_session(sid)

        self.assertIs(got, session)
        self.assertEqual(calls["n"], 0, "캐시 히트면 DB를 읽지 않는다")

class RejectedSweepStepTests(unittest.TestCase):
    """Regression: a refused sweep step must leave the play untouched.

    ``submit_sweep_step`` executes the sweep first and only then checks whether
    anything got done. By that point ``execute_sweep`` has already recorded an
    idle step for every unassigned crane and bumped ``step_count``, and those
    survive the raised exception. The player is told the step was rejected, the
    step never enters ``actions`` — but the submitted play still carries the
    idle penalties for it.

    This was measured on the collected study data: 37 of 1020 sweep plays could
    not be reproduced from their own recorded ``actions``, every one of them
    because the stored p_idle exceeded the replay by a multiple of the crane
    count (up to +46). p_idle is the feature the reward fit is most sensitive
    to, so silent inflation there corrupts the estimated coefficients.
    """

    def _far_setups(self, session):
        """Setups parked far outside every crane's reach, so nothing is worked."""
        return {c.id: {"setup_x": 1e6, "setup_y": 1e6} for c in session.env.cranes}

    def test_rejected_step_does_not_leak_idle_or_step_count(self):
        session = PlaySession(
            "D1_1", "general", "tester",
            user={"id": "test-user", "display_name": "tester"},
        )
        before_idle = int(session.env.idle_steps_total)
        before_steps = int(session.env.step_count)
        before_events = len(session.env.events)

        with self.assertRaisesRegex(ValueError, "반경 안에 처리할 양중이 없습니다"):
            session.submit_sweep_step(self._far_setups(session))

        self.assertEqual(session.env.idle_steps_total, before_idle)
        self.assertEqual(session.env.step_count, before_steps)
        self.assertEqual(len(session.env.events), before_events)
        self.assertEqual(session.user_steps, [])

    def test_rejection_preserves_work_already_accepted(self):
        """The rollback rebuilds from accepted steps, so it must not undo them."""
        session = PlaySession(
            "D1_1", "general", "tester",
            user={"id": "test-user", "display_name": "tester"},
        )
        session.submit_step({"C1": "L1"})
        done_before = session.env.done_count()
        idle_before = int(session.env.idle_steps_total)

        with self.assertRaises(ValueError):
            session.submit_sweep_step(self._far_setups(session))

        self.assertEqual(session.env.done_count(), done_before)
        self.assertEqual(session.env.idle_steps_total, idle_before)
        self.assertEqual(len(session.user_steps), 1)


if __name__ == "__main__":
    unittest.main()
