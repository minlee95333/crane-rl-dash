import unittest
from pathlib import Path


WEB_HTML = Path(__file__).resolve().parents[1] / "web" / "index.html"
MOBILE_HTML = Path(__file__).resolve().parents[1] / "web" / "game-mobile.html"


class DashboardTokenHandlingTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.source = WEB_HTML.read_text(encoding="utf-8")

    def test_query_token_is_consumed_once_and_removed_from_url(self):
        self.assertIn("if(_urlToken!==null)", self.source)
        self.assertIn("_urlParams.delete('token')", self.source)
        self.assertIn("history.replaceState(history.state,'',_cleanUrl)", self.source)


class SharedScenarioFlowTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.source = WEB_HTML.read_text(encoding="utf-8")

    def test_shared_scenario_code_is_sent_when_starting_session(self):
        # The session/start request still forwards a share_code when present
        # (gameplay plumbing kept for replay/baseline). The standalone "open by
        # share link" entry point was removed once admin scenarios became
        # always-public, so the gameStart(scen.id, code) call no longer exists.
        self.assertIn("share_code:shareCode || undefined", self.source)

    def test_shared_scenario_code_is_preserved_for_baseline(self):
        self.assertIn("share_code: shareCode || ''", self.source)
        self.assertIn(
            "share_code: g.rep.share_code || undefined",
            self.source,
        )

    def test_game_canvas_shows_live_hard_interference_details(self):
        self.assertIn("function _hardConflictDetails()", self.source)
        self.assertIn("gameState?.interference_events", self.source)
        self.assertIn("양중시간 겹침", self.source)
        self.assertIn("d ${d.distance.toFixed(1)} < R합", self.source)

    def test_game_canvas_animation_has_one_bounded_render_loop(self):
        self.assertIn("const GAME_CANVAS_FRAME_MS = 1000 / 30;", self.source)
        self.assertIn(
            "if(!_jibMotion || _juiceRAF || _gameAnimRAF || _REDUCED_MOTION) return;",
            self.source,
        )
        self.assertIn(
            "if(_juiceRAF){ cancelAnimationFrame(_juiceRAF); _juiceRAF = null; }",
            self.source,
        )
        self.assertNotIn("if(_jibMotion || hasSel)", self.source)


class TierSFeatureTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.source = WEB_HTML.read_text(encoding="utf-8")

    def test_reason_chips_render_and_send_with_decisions(self):
        self.assertIn("GAME_REASON_LABELS", self.source)
        self.assertIn("function gameSetReason(", self.source)
        self.assertIn("if(s.reason) d.reason = s.reason;", self.source)

    def test_candidate_delta_preview_is_unweighted_raw_only(self):
        self.assertIn("game-cand-delta", self.source)
        self.assertIn("Δmakespan", self.source)
        self.assertIn("Δ부하폭", self.source)
        # 가중 점수(scorer weights)는 플레이 중 노출 금지 — delta는 raw만
        self.assertNotIn("totalScore", self.source.split("function renderGame()")[1].split("function gamePick")[0])

    def test_hesitation_meta_sent_with_decisions(self):
        self.assertIn("function _gameResetDecisionMeta()", self.source)
        self.assertIn("d.think_ms = Math.max(0, s._picked_at - _gameStepT0);", self.source)
        self.assertIn("d.switches = _gameSwitchCount[c.id];", self.source)

    def test_attempt_progress_line_on_result(self):
        self.assertIn("function _gameProgRead()", self.source)
        self.assertIn("직전 대비 makespan", self.source)

    def test_baseline_ghost_overlay(self):
        self.assertIn("function _g3dToggleGhost()", self.source)
        self.assertIn("/api/game/baseline/run", self.source)
        self.assertIn("function _g3dGhostPose(", self.source)
        self.assertIn('id="game3dGhostBtn"', self.source)

    def test_danger_step_alarm(self):
        self.assertIn("function _g3dAlarm(", self.source)
        self.assertIn('id="game3dAlarm"', self.source)
        self.assertIn("g._alarmStep !== stepIdx", self.source)

    def test_drag_drop_target_hard_preview(self):
        self.assertIn("놓으면 hard 충돌", self.source)

    def test_mini_3d_widget(self):
        self.assertIn("function _mini3dToggle()", self.source)
        self.assertIn("function _mini3dSync()", self.source)
        self.assertIn('id="gameMini3dStage"', self.source)
        # renderGame이 미니 뷰를 동기화해야 한다
        self.assertIn("_mini3dSync();\n}", self.source)

    def test_mini_3d_is_closed_when_session_ends(self):
        drop_body = self.source.split("async function gameDrop(){", 1)[1].split(
            "async function gameSubmit(){", 1,
        )[0]
        submit_body = self.source.split("async function gameSubmit(){", 1)[1].split(
            "function showGameResult(", 1,
        )[0]
        self.assertIn("_mini3dClose();", drop_body)
        self.assertIn("_mini3dClose();", submit_body)

    def test_replay_clip_export(self):
        self.assertIn("function _g3dToggleRec()", self.source)
        self.assertIn("captureStream", self.source)
        self.assertIn("MediaRecorder", self.source)
        self.assertIn('id="game3dRecBtn"', self.source)

    def test_radius_footprint_rings(self):
        self.assertIn("footObjs", self.source)
        self.assertIn("fo.stepIdx < stepIdx", self.source)

    def test_digit_key_candidate_cycling(self):
        self.assertIn("반복 = 순환", self.source)
        self.assertIn("curIdx === avail.length - 1", self.source)

    def test_cabin_camera_mode(self):
        self.assertIn("'cabin'", self.source)
        self.assertIn("운전석", self.source)

    def test_ai_coach_line(self):
        self.assertIn("function _g3dCoachAnalyze()", self.source)
        self.assertIn("function _g3dCoachRender()", self.source)
        self.assertIn('id="g3dCoach"', self.source)

    def test_heatmap_overlay(self):
        self.assertIn("function _g3dToggleHeat()", self.source)
        self.assertIn("new URLSearchParams({scenario_id:", self.source)
        self.assertIn("heatParams.set('share_code', g.rep.share_code)", self.source)
        self.assertIn('id="game3dHeatBtn"', self.source)

    def test_replay_scrubber_bands_and_gantt(self):
        self.assertIn("soft_cum:", self.source)
        self.assertIn("const stepFlags = rep.steps.map", self.source)
        self.assertIn('id="g3dGantt"', self.source)
        self.assertIn("g3d-lane-cells", self.source)
        self.assertIn("g._ganttStep !== stepIdx", self.source)


class ResearchModeUiTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.pc = WEB_HTML.read_text(encoding="utf-8")
        cls.mobile = MOBILE_HTML.read_text(encoding="utf-8")

    def test_pc_has_separate_participation_form_and_server_confirmed_mode(self):
        for control in (
            'id="researchJoinBtn"',
            'id="researchFullName"',
            'id="researchUniversity"',
            'id="researchCollege"',
            'id="researchDepartment"',
            'id="researchStudentNumber"',
            'id="researchGrade"',
            'id="researchPhone"',
            'id="researchEmail"',
            'id="researchAgeConfirmed"',
            'id="researchParticipationConsent"',
            'id="researchPrivacyConsent"',
            'id="researchOverseasConsent"',
            'id="researchOpenDataConsent"',
        ):
            self.assertIn(control, self.pc)
        self.assertIn("downloadResearchConsentCopy()", self.pc)
        self.assertIn("research_mode:wantsResearch", self.pc)
        self.assertIn("gamePlayPurpose = data.play_purpose || 'general'", self.pc)

    def test_admin_plays_has_purpose_column_and_filter(self):
        self.assertIn('id="dmPlayPurpose"', self.pc)
        self.assertIn("<th>제출 목적</th>", self.pc)
        self.assertIn("p.play_purpose||'legacy'", self.pc)

    def test_mobile_has_same_research_contract_and_locked_adventure(self):
        for control in (
            'id="mobileResearchToggle"',
            'id="mrFullName"',
            'id="mrUniversity"',
            'id="mrCollege"',
            'id="mrDepartment"',
            'id="mrStudentNumber"',
            'id="mrGrade"',
            'id="mrPhone"',
            'id="mrEmail"',
            'id="mrAgeConfirmed"',
            'id="mrParticipationConsent"',
            'id="mrPrivacyConsent"',
            'id="mrOverseasConsent"',
            'id="mrOpenDataConsent"',
            'id="mrDownloadConsent"',
        ):
            self.assertIn(control, self.mobile)
        self.assertIn("research_mode:wantsResearch", self.mobile)
        self.assertIn("order>+(p.unlocked_index||0)", self.mobile)
        self.assertIn("G.playPurpose=r.play_purpose||'general'", self.mobile)


if __name__ == "__main__":
    unittest.main()
