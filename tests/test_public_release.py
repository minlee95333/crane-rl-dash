"""공개 배포 시나리오 검증 — 일반인 대상 IRL 데이터 수집.

각 클래스는 "배포 후 실제로 벌어질 상황" 하나를 재현한다. 단위 테스트가
함수를 검증한다면, 여기서는 배포 환경(리버스 프록시, 봇, 반복 참가자,
미승인 동의서)이 만드는 실패 모드를 검증한다.

시나리오 목록
  S1  리버스 프록시 뒤 다중 사용자 — rate limit 버킷이 사용자별로 분리되는가
  S2  봇 대량 제출 / 강의실 공용 NAT — 예산이 개인별로 나뉘는가 (step은 예외)
  S3  반복 재도전 — 한 참가자의 여러 attempt가 IRL을 지배하는가
  S4  코호트 품질 — 표본이 몇 명에게서 왔는지 IRL 결과가 보고하는가
  S5  세션 격리 — 남의 session_id로 조작이 가능한가
  S6  미승인 동의서 / 파일모드 PII — draft·DB 부재 상태로 개인정보를 받는가
  S6b 대학생 한정 자격 — 자격 확인이 실제 의사표시인가
  S7  내부 오류 노출 — 예외 문자열이 일반 사용자에게 그대로 나가는가
  S8  부팅 진단 — 로그 한 줄이 서버를 죽이는가
  S9  신뢰 프록시 — 관리자 게이트가 프록시 뒤에서 열리는가
  S10 실험 순서 27개 — 전 구간이 실제로 완주 가능한가
"""
import json
import os
import tempfile
import unittest
from pathlib import Path
from unittest.mock import patch

import app
from crane_web import research
from game_irl.irl_from_plays import load_human_trajectories


def _handler(client_addr, headers=None):
    """Construct a Handler without running BaseHTTPRequestHandler.__init__
    (which would need a live socket). Mirrors tests/test_app.py's approach."""
    h = object.__new__(app.Handler)
    h.client_address = client_addr
    h.headers = headers or {}
    return h


# ---------------------------------------------------------------------------
# S1 — 리버스 프록시 뒤 다중 사용자
# ---------------------------------------------------------------------------
class ProxyDeployedRateLimitScenario(unittest.TestCase):
    """리버스 프록시(nginx·Cloudflare 등) 뒤에 두는 경우.

    이때 TCP peer 주소는 모든 방문자가 동일한 프록시 IP다. IP만으로 버킷을
    나누면 참가자 20명이 동시에 가입하는 순간 21번째부터 429가 되고, 악의적
    사용자 한 명이 전체 코호트를 잠글 수 있다.
    """

    PROXY = ("10.0.0.7", 55000)

    def test_two_real_users_behind_one_proxy_get_independent_budgets(self):
        limiter = app._RateLimiter(1, 60)
        with patch.object(app, "_IDENTITY_RATE_LIMITER", limiter), \
                patch.object(app, "TRUST_PROXY_HEADERS", True), \
                patch("app._send_json") as send_json:
            a = _handler(self.PROXY, {"X-Forwarded-For": "203.0.113.10"})
            b = _handler(self.PROXY, {"X-Forwarded-For": "203.0.113.11"})
            self.assertFalse(a._rate_limited("/api/auth/signup"))
            self.assertFalse(b._rate_limited("/api/auth/signup"),
                             "다른 참가자가 앞사람 때문에 가입을 못 하면 안 된다")
            # 같은 참가자의 두 번째 시도만 차단된다.
            self.assertTrue(a._rate_limited("/api/auth/signup"))
            self.assertEqual(send_json.call_args.args[2], 429)

    def test_forwarded_header_is_ignored_when_proxy_is_not_trusted(self):
        """프록시를 안 쓰는 배포에서 헤더를 믿으면 누구나 헤더를 바꿔가며
        무한히 우회한다. 기본값(미신뢰)에서는 peer 주소만 쓴다."""
        limiter = app._RateLimiter(1, 60)
        with patch.object(app, "_IDENTITY_RATE_LIMITER", limiter), \
                patch.object(app, "TRUST_PROXY_HEADERS", False), \
                patch("app._send_json"):
            a = _handler(("203.0.113.9", 1), {"X-Forwarded-For": "1.1.1.1"})
            b = _handler(("203.0.113.9", 1), {"X-Forwarded-For": "2.2.2.2"})
            self.assertFalse(a._rate_limited("/api/auth/login"))
            self.assertTrue(b._rate_limited("/api/auth/login"))

    def test_trusted_proxy_uses_the_hop_its_own_proxy_appended(self):
        """XFF는 왼쪽에서 오른쪽으로 자란다 — 각 프록시가 자기가 받은 주소를
        덧붙인다. 따라서 위조할 수 없는 값은 **최우측**(우리 프록시가 쓴 것)이다.
        헤더를 덧붙이는 프록시 뒤에서 최좌측을 쓰면 클라이언트가 보낸 값을
        그대로 신뢰하게 되어 요청마다 새 버킷을 발급받을 수 있다."""
        with patch.object(app, "TRUST_PROXY_HEADERS", True), \
                patch.object(app, "TRUST_PROXY_HOPS", 1):
            h = _handler(self.PROXY, {"X-Forwarded-For": "203.0.113.5, 198.51.100.9"})
            self.assertEqual(h._rate_limit_client_key(), "198.51.100.9")

    def test_a_forged_leading_hop_cannot_mint_a_fresh_bucket(self):
        """공격자가 XFF를 위조해도 프록시가 실제 주소를 뒤에 덧붙이므로
        버킷 키는 바뀌지 않는다."""
        with patch.object(app, "TRUST_PROXY_HEADERS", True), \
                patch.object(app, "TRUST_PROXY_HOPS", 1):
            keys = {
                _handler(self.PROXY,
                         {"X-Forwarded-For": f"10.9.9.{i}, 198.51.100.9"}
                         )._rate_limit_client_key()
                for i in range(5)
            }
            self.assertEqual(keys, {"198.51.100.9"})

    def test_extra_trusted_hops_move_the_trusted_position_left(self):
        with patch.object(app, "TRUST_PROXY_HEADERS", True), \
                patch.object(app, "TRUST_PROXY_HOPS", 2):
            h = _handler(self.PROXY,
                         {"X-Forwarded-For": "1.1.1.1, 203.0.113.5, 198.51.100.9"})
            self.assertEqual(h._rate_limit_client_key(), "203.0.113.5")

    def test_proxied_request_is_never_exempt_even_when_untrusted(self):
        """프록시가 앱에 loopback으로 연결하는 구성에서, TCP peer만 보고
        면제하면 모든 rate limit이 조용히 꺼진다
        (예산 30/60에 120건이 전부 통과). 전달 헤더가 있으면 로컬이 아니다 —
        헤더 내용을 신뢰하는지와 무관하게."""
        for trust in (False, True):
            with self.subTest(trust_proxy=trust):
                with patch.object(app, "TRUST_PROXY_HEADERS", trust), \
                        patch.object(app, "_PLAY_RATE_LIMITER", app._RateLimiter(1, 60)), \
                        patch.object(app, "_PLAY_IP_RATE_LIMITER", app._RateLimiter(1000, 60)), \
                        patch("app._send_json"):
                    # 프록시가 loopback 에서 연결해 오는 배포 형태
                    h = _handler(("127.0.0.1", 5000),
                                 {"X-Forwarded-For": "198.51.100.9"})
                    self.assertFalse(h._rate_limit_exempt())
                    self.assertFalse(h._rate_limited("/api/game/session/start"))
                    self.assertTrue(h._rate_limited("/api/game/session/start"))

    def test_console_request_without_forwarding_stays_exempt(self):
        """로컬 개발과 테스트 스위트는 계속 면제되어야 한다."""
        with patch.object(app, "_PLAY_RATE_LIMITER", app._RateLimiter(1, 60)), \
                patch("app._send_json") as send_json:
            h = _handler(("127.0.0.1", 5000), {})
            self.assertTrue(h._rate_limit_exempt())
            for _ in range(10):
                self.assertFalse(h._rate_limited("/api/game/session/start"))
            send_json.assert_not_called()

    def test_malformed_forwarded_header_falls_back_to_peer(self):
        with patch.object(app, "TRUST_PROXY_HEADERS", True):
            for bad in ("", "   ", ",,", "not-an-ip"):
                with self.subTest(value=bad):
                    h = _handler(self.PROXY, {"X-Forwarded-For": bad})
                    self.assertEqual(h._rate_limit_client_key(), "10.0.0.7")


# ---------------------------------------------------------------------------
# S2 — 봇 대량 제출
# ---------------------------------------------------------------------------
class BotSubmissionFloodScenario(unittest.TestCase):
    """공개 링크가 커뮤니티에 퍼지면 스크립트로 session/start → submit을
    반복해 연구 데이터셋을 오염시킬 수 있다. 사람의 한 판은 ~1분이므로
    분당 수십 건의 제출은 정상 플레이가 아니다."""

    REMOTE = ("203.0.113.44", 40000)

    def test_session_start_and_submit_have_a_budget(self):
        for path in ("/api/game/session/start", "/api/game/session/submit"):
            with self.subTest(path=path):
                with patch.object(app, "_PLAY_RATE_LIMITER", app._RateLimiter(2, 60)), \
                        patch("app._send_json") as send_json:
                    h = _handler(self.REMOTE)
                    self.assertFalse(h._rate_limited(path))
                    self.assertFalse(h._rate_limited(path))
                    self.assertTrue(h._rate_limited(path),
                                    f"{path} 는 무제한이면 안 된다")
                    self.assertEqual(send_json.call_args.args[2], 429)

    def test_in_play_step_endpoints_are_never_limited(self):
        """step/undo/state는 한 판 안에서 수십 번 호출된다. 여기에 예산을
        걸면 정상 플레이가 중간에 끊긴다 — 데이터 유실이 더 큰 손해다."""
        with patch.object(app, "_PLAY_RATE_LIMITER", app._RateLimiter(1, 60)), \
                patch("app._send_json") as send_json:
            h = _handler(self.REMOTE)
            for path in ("/api/game/session/step", "/api/game/session/sweep-step",
                         "/api/game/session/undo", "/api/game/session/state"):
                for _ in range(50):
                    self.assertFalse(h._rate_limited(path))
            send_json.assert_not_called()

    def test_a_classroom_behind_one_nat_does_not_share_a_play_budget(self):
        """이 연구의 실제 배포 형태: 대학생 수십 명이 한 강의실 wifi(공용 NAT)에서
        동시에 참여한다. 공인 IP가 하나뿐이라 IP로만 예산을 나누면 학생들이 서로의
        할당량을 잡아먹고 429로 수업이 멈춘다. 세션 쿠키로 구분해야 한다."""
        nat = ("203.0.113.200", 40000)
        with patch.object(app, "_PLAY_RATE_LIMITER", app._RateLimiter(2, 60)), \
                patch.object(app, "_PLAY_IP_RATE_LIMITER", app._RateLimiter(1000, 60)), \
                patch("app._send_json") as send_json:
            for student in range(30):
                h = _handler(nat, {"Cookie": f"crane_auth=token-{student}"})
                self.assertFalse(h._rate_limited("/api/game/session/start"))
                self.assertFalse(h._rate_limited("/api/game/session/submit"))
            send_json.assert_not_called()
            # 같은 학생의 세 번째 요청만 차단된다.
            h = _handler(nat, {"Cookie": "crane_auth=token-0"})
            self.assertTrue(h._rate_limited("/api/game/session/start"))

    def test_rotating_cookies_still_hits_the_per_ip_ceiling(self):
        """쿠키만으로 나누면 위조 쿠키를 갈아끼워 무한 우회할 수 있다.
        바깥쪽 IP 상한이 그걸 막는다."""
        ip = ("203.0.113.201", 40000)
        with patch.object(app, "_PLAY_RATE_LIMITER", app._RateLimiter(100, 60)), \
                patch.object(app, "_PLAY_IP_RATE_LIMITER", app._RateLimiter(5, 60)), \
                patch("app._send_json") as send_json:
            blocked = 0
            for i in range(12):
                h = _handler(ip, {"Cookie": f"crane_auth=forged-{i}"})
                if h._rate_limited("/api/game/session/start"):
                    blocked += 1
        self.assertEqual(blocked, 7, "IP 상한 5건 초과분은 전부 차단되어야 한다")
        self.assertEqual(send_json.call_args.args[2], 429)

    def test_anonymous_requests_still_fall_back_to_ip(self):
        with patch.object(app, "_PLAY_RATE_LIMITER", app._RateLimiter(1, 60)), \
                patch.object(app, "_PLAY_IP_RATE_LIMITER", app._RateLimiter(1000, 60)), \
                patch("app._send_json"):
            a = _handler(("203.0.113.202", 1), {})
            self.assertFalse(a._rate_limited("/api/game/session/start"))
            self.assertTrue(a._rate_limited("/api/game/session/start"))

    def test_a_whole_class_can_sign_up_at_once(self):
        """부하 테스트에서 측정된 결함: 공용 NAT 뒤 30명이 동시에 가입하면
        auth 예산(20/60)에 걸려 10명이 429로 실패했다. 가입·로그인은 인증
        쿠키로 나눌 수 없으므로(계정이 아직 없다) 한 학급 규모의 IP 상한을
        따로 둔다."""
        nat = ("203.0.113.210", 40000)
        with patch.object(app, "_IDENTITY_RATE_LIMITER", app._RateLimiter(90, 60)), \
                patch("app._send_json") as send_json:
            for _ in range(30):
                h = _handler(nat, {})
                self.assertFalse(h._rate_limited("/api/auth/signup"))
                self.assertFalse(h._rate_limited("/api/auth/login"))
            send_json.assert_not_called()

    def test_brute_force_on_one_account_is_still_stopped(self):
        """계정 단위 예산이 무차별 대입을 막는다 — IP 공유와 무관하게."""
        nat = ("203.0.113.211", 40000)
        with patch.object(app, "_LOGIN_ID_RATE_LIMITER", app._RateLimiter(3, 60)), \
                patch("app._send_json") as send_json:
            h = _handler(nat, {})
            for _ in range(3):
                self.assertFalse(h._login_attempt_limited("victim@example.com"))
            self.assertTrue(h._login_attempt_limited("victim@example.com"))
            self.assertEqual(send_json.call_args.args[2], 429)
            # 같은 IP의 다른 학생 계정은 영향받지 않는다.
            self.assertFalse(h._login_attempt_limited("classmate@example.com"))

    def test_login_account_key_is_case_and_space_insensitive(self):
        """대소문자·공백만 바꿔 예산을 새로 받아가지 못하게 한다."""
        nat = ("203.0.113.212", 40000)
        with patch.object(app, "_LOGIN_ID_RATE_LIMITER", app._RateLimiter(1, 60)), \
                patch("app._send_json"):
            h = _handler(nat, {})
            self.assertFalse(h._login_attempt_limited("Victim@Example.com"))
            self.assertTrue(h._login_attempt_limited("  victim@example.com  "))

    def test_research_registration_is_limited(self):
        with patch.object(app, "_AUTH_RATE_LIMITER", app._RateLimiter(1, 60)), \
                patch("app._send_json"):
            h = _handler(self.REMOTE)
            self.assertFalse(h._rate_limited("/api/game/research/participation"))
            self.assertTrue(h._rate_limited("/api/game/research/participation"))


# ---------------------------------------------------------------------------
# S3 / S4 — 반복 재도전과 코호트 품질
# ---------------------------------------------------------------------------
class _PlayFixtureMixin:
    def _write_play(self, root: Path, scenario_id: str, *, user_id: str,
                    attempt_no: int, play_seconds: float = 60.0,
                    duration: float = 1.0):
        play_dir = root / scenario_id / "general"
        play_dir.mkdir(parents=True, exist_ok=True)
        path = play_dir / f"{user_id}_a{attempt_no}.json"
        path.write_text(json.dumps({
            "meta": {
                "scenario_id": scenario_id, "tier": "general",
                "user_id": user_id, "attempt_no": attempt_no,
                "play_purpose": "research", "play_seconds": play_seconds,
                "submitted_at": f"2026-07-29T00:00:{attempt_no:02d}",
            },
            "layout": {"cranes": [{"id": "C1"}], "lifts": [{"id": "L1"}]},
            "outcome": {
                "events": [{"liftId": "L1", "duration": duration, "move": 0}],
                "done": 1, "total": 1, "raw": {"idle_steps_total": 0},
            },
        }), encoding="utf-8")
        return path


class RepeatedAttemptScenario(_PlayFixtureMixin, unittest.TestCase):
    """참가자는 같은 시나리오를 몇 번이고 다시 풀 수 있다(잠금은 '앞 단계
    완료'만 요구한다). 재도전 기록이 전부 IRL 시연으로 들어가면, 열심히
    반복한 한 명의 선호가 코호트 전체의 보상계수를 끌고 간다."""

    def test_one_participants_repeats_count_as_a_single_demonstration(self):
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            for attempt in (1, 2, 3, 4, 5):
                self._write_play(root, "REPEAT_1", user_id="u-1", attempt_no=attempt)
            rows = load_human_trajectories(root, tier="general")
        self.assertEqual(len(rows), 1,
                         "한 참가자의 5회 재도전이 시연 5건으로 세어지면 안 된다")
        self.assertEqual(rows[0]["attempt_no"], 5, "가장 마지막 시도를 채택한다")

    def test_distinct_participants_are_all_kept(self):
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            for uid in ("u-1", "u-2", "u-3"):
                self._write_play(root, "REPEAT_1", user_id=uid, attempt_no=1)
            rows = load_human_trajectories(root, tier="general")
        self.assertEqual(len(rows), 3)

    def test_same_participant_across_scenarios_is_not_collapsed(self):
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            self._write_play(root, "REPEAT_1", user_id="u-1", attempt_no=1)
            self._write_play(root, "REPEAT_2", user_id="u-1", attempt_no=1)
            rows = load_human_trajectories(root, tier="general")
        self.assertEqual(len(rows), 2)

    def test_every_attempt_is_still_stored_only_the_fit_deduplicates(self):
        """정책 결정(A4, 현행 유지): 재도전은 자유롭게 허용하고 **모든 시도를
        저장**하되, 중복 제거는 IRL 적합 단계에서만 한다. 저장 단계에서 버리면
        학습곡선·재도전 행동 분석 같은 후속 연구 자료가 영영 사라진다."""
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            for attempt in (1, 2, 3):
                self._write_play(root, "KEEP_1", user_id="u-1", attempt_no=attempt)
            on_disk = list(root.rglob("*.json"))
            rows = load_human_trajectories(root, tier="general")
        self.assertEqual(len(on_disk), 3, "제출된 시도는 전부 디스크에 남아야 한다")
        self.assertEqual(len(rows), 1, "IRL 적합에는 최신 1건만 들어간다")

    def test_unattributed_legacy_plays_are_never_collapsed(self):
        """user_id 없는 과거/익명 기록은 서로 다른 사람일 수 있으므로
        하나로 합치면 데이터를 잃는다."""
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            play_dir = root / "LEGACY_1" / "general"
            play_dir.mkdir(parents=True)
            for i in (1, 2):
                (play_dir / f"p{i}.json").write_text(json.dumps({
                    "meta": {"scenario_id": "LEGACY_1", "tier": "general"},
                    "layout": {"cranes": [{"id": "C1"}], "lifts": [{"id": "L1"}]},
                    "outcome": {"events": [{"liftId": "L1", "duration": 1, "move": 0}],
                                "done": 1, "total": 1, "raw": {"idle_steps_total": 0}},
                }), encoding="utf-8")
            rows = load_human_trajectories(root, tier="general")
        self.assertEqual(len(rows), 2)


class CohortQualityScenario(_PlayFixtureMixin, unittest.TestCase):
    """연구자가 '표본 N건'만 보고 결론을 내면 안 된다. N건이 3명에게서 나온
    것인지 60명에게서 나온 것인지가 IRL 추정의 신뢰도를 좌우한다."""

    def test_cohort_summary_counts_participants_not_just_plays(self):
        from game_irl.irl_from_plays import cohort_summary
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            for attempt in (1, 2, 3):
                self._write_play(root, "COHORT_1", user_id="u-1", attempt_no=attempt)
            self._write_play(root, "COHORT_1", user_id="u-2", attempt_no=1)
            rows = load_human_trajectories(root, tier="general")
            summary = cohort_summary(rows)
        self.assertEqual(summary["n_demos"], 2)
        self.assertEqual(summary["n_participants"], 2)
        self.assertEqual(summary["max_demos_per_participant"], 1)
        self.assertEqual(summary["n_repeat_attempts_dropped"], 2)

    def test_speedrun_plays_are_excluded_when_a_floor_is_set(self):
        """무성의 플레이(초 단위 연타)는 완주해도 선호를 담고 있지 않다.
        임계값은 연구자 판단이므로 기본은 비활성, 옵트인으로 동작한다."""
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            self._write_play(root, "SPEED_1", user_id="u-fast", attempt_no=1,
                             play_seconds=1.5)
            self._write_play(root, "SPEED_1", user_id="u-real", attempt_no=1,
                             play_seconds=95.0)
            kept_default = load_human_trajectories(root, tier="general")
            kept_filtered = load_human_trajectories(root, tier="general",
                                                    min_play_seconds=10.0)
        self.assertEqual(len(kept_default), 2, "기본값은 아무것도 버리지 않는다")
        self.assertEqual(len(kept_filtered), 1)
        self.assertEqual(kept_filtered[0]["user_id"], "u-real")


# ---------------------------------------------------------------------------
# S5 — 세션 격리 (회귀)
# ---------------------------------------------------------------------------
class SessionIsolationScenario(unittest.TestCase):
    """공개 배포에서는 session_id를 추측/공유해 남의 진행을 망가뜨리려는
    시도가 실제로 발생한다. 소유자 검사가 사라지면 안 된다."""

    def test_other_users_session_is_rejected(self):
        from crane_web.handlers.game_session import GameSessionHandlerMixin

        class _Sess:
            user_id = "owner-1"

        h = object.__new__(app.Handler)
        with patch.object(app.Handler, "_current_user",
                          lambda self: {"id": "attacker-2"}), \
                patch("game_irl.human_play.get_session", lambda sid: _Sess()):
            sess, err = GameSessionHandlerMixin._resolve_session(
                h, {"session_id": "s-1"})
        self.assertIsNone(sess)
        self.assertEqual(err[1], 403)


# ---------------------------------------------------------------------------
# S6 — 미승인 동의서로 배포
# ---------------------------------------------------------------------------
class DraftConsentScenario(unittest.TestCase):
    """현재 연구 설정의 consent_status는 'draft'이다. 이 상태로 일반
    공개하면 승인 전 동의서로 개인정보를 수집하게 된다. 서버가 막아야 한다."""

    def test_study_config_declares_a_consent_status(self):
        cfg = research.public_study_config()
        self.assertIn("consent_status", cfg)
        self.assertIn(cfg["consent_status"], ("draft", "approved"))

    def test_registration_is_refused_while_consent_is_a_draft(self):
        with patch.object(research, "CONSENT_STATUS", "draft"), \
                patch.object(research, "ALLOW_DRAFT_CONSENT", False):
            self.assertFalse(research.research_enrollment_open())
            reason = research.enrollment_block_reason()
            self.assertTrue(reason)

    def test_approved_consent_opens_registration(self):
        with patch.object(research, "CONSENT_STATUS", "approved"), \
                patch.object(research, "ALLOW_DRAFT_CONSENT", False):
            self.assertTrue(research.research_enrollment_open())
            self.assertIsNone(research.enrollment_block_reason())

    def test_explicit_pilot_override_allows_draft(self):
        """loopback 로컬 검증은 draft 폼을 명시적으로 열 수 있다."""
        with patch.object(research, "CONSENT_STATUS", "draft"), \
                patch.object(research, "ALLOW_DRAFT_CONSENT", True), \
                patch.object(research, "_LOOPBACK_BIND", True), \
                patch.object(research, "PUBLIC_DEPLOYMENT", False):
            self.assertTrue(research.research_enrollment_open())

    def test_public_deploy_cannot_use_the_draft_override(self):
        """환경변수가 남아 있어도 공개 게임에서는 draft 모집이 열리지 않는다."""
        with patch.object(research, "CONSENT_STATUS", "draft"), \
                patch.object(research, "ALLOW_DRAFT_CONSENT", True), \
                patch.object(research, "PUBLIC_DEPLOYMENT", True):
            self.assertFalse(research.research_enrollment_open("postgres"))

    def test_non_loopback_bind_cannot_use_the_draft_override(self):
        with patch.object(research, "CONSENT_STATUS", "draft"), \
                patch.object(research, "ALLOW_DRAFT_CONSENT", True), \
                patch.object(research, "_LOOPBACK_BIND", False), \
                patch.object(research, "PUBLIC_DEPLOYMENT", False):
            self.assertFalse(research.research_enrollment_open("file"))

    def test_non_loopback_preview_is_refused(self):
        env = {"HOST": "0.0.0.0", "CRANE_RESEARCH_ALLOW_DRAFT_CONSENT": "1"}
        with patch.dict(os.environ, env, clear=True):
            self.assertFalse(app._apply_local_research_preview_isolation())

    def test_storage_stays_local_only(self):
        """저장 계층이 로컬 파일만 쓴다는 사실을 고정한다.

        환경변수로 외부 저장소를 지정해도 무시하고 파일 모드로 움직여야
        한다. 데이터베이스 드라이버를 끌어오는 코드가 들어오면 여기서
        실패한다."""
        import crane_db.storage as st

        with patch.dict(os.environ,
                        {"DATABASE_URL": "postgresql://someone.example/db"}):
            self.assertEqual(st.storage_kind(), "file")

        source = Path(st.__file__).read_text(encoding="utf-8")
        for marker in ("psycopg", "sqlalchemy", "DATABASE_URL"):
            self.assertNotIn(marker, source,
                             f"저장 계층이 외부 저장소를 참조한다: {marker}")

    def test_windows_launcher_does_not_force_the_draft_preview(self):
        """더블클릭 런처는 인증 백엔드를 바꾸면 안 된다.

        여기서 CRANE_RESEARCH_ALLOW_DRAFT_CONSENT나 CRANE_PUBLIC_GAME을 켜면
        아직 승인되지 않은 동의서로 참여 등록이 열리거나, 루프백 밖으로
        열려 개인정보가 평문 JSON에 쌓인다. 필요하면 터미널에서 세션
        단위로 켠다."""
        root = Path(__file__).resolve().parents[1]
        launcher = (root / "Start.bat").read_text(encoding="utf-8")
        self.assertIn('set "HOST=127.0.0.1"', launcher)
        self.assertNotIn('set "CRANE_RESEARCH_ALLOW_DRAFT_CONSENT=1"', launcher)
        self.assertNotIn('set "CRANE_PUBLIC_GAME=1"', launcher)

    def test_public_deploy_refuses_to_write_pii_to_the_file_fallback(self):
        """이 빌드는 항상 파일 저장 모드다. 그 상태로 루프백 밖에 열어두고
        등록을 받으면 이메일·표시이름이 접근 제어 없는 평문 JSON으로 쌓인다.
        공개 바인드에서는 시끄럽게 실패해야 한다."""
        with patch.object(research, "CONSENT_STATUS", "approved"), \
                patch.object(research, "PUBLIC_DEPLOYMENT", True):
            self.assertIsNotNone(research.enrollment_block_reason("file"))
            self.assertIsNone(research.enrollment_block_reason("postgres"))

    def test_local_development_keeps_the_file_fallback(self):
        """로컬 개발은 DB 없이도 돌아야 한다 — 공개 배포일 때만 막는다."""
        with patch.object(research, "CONSENT_STATUS", "approved"), \
                patch.object(research, "PUBLIC_DEPLOYMENT", False):
            self.assertIsNone(research.enrollment_block_reason("file"))

    def test_draft_consent_outranks_the_storage_check(self):
        with patch.object(research, "CONSENT_STATUS", "draft"), \
                patch.object(research, "ALLOW_DRAFT_CONSENT", False), \
                patch.object(research, "PUBLIC_DEPLOYMENT", True):
            self.assertIn("동의서", research.enrollment_block_reason("postgres"))

    def test_participation_endpoint_returns_403_before_touching_storage(self):
        """PII가 저장 계층에 닿기 *전에* 거절되어야 한다."""
        from crane_web.handlers.auth import AuthProfileHandlerMixin
        h = object.__new__(app.Handler)
        h._json_payload = {"university": "X", "consent": True}
        sent = {}

        def fake_send(handler, body, status=200, **kw):
            sent["body"], sent["status"] = body, status

        with patch.object(research, "CONSENT_STATUS", "draft"), \
                patch.object(research, "ALLOW_DRAFT_CONSENT", False), \
                patch.object(app.Handler, "_profile_user_id_or_401", lambda self: "u-1"), \
                patch("crane_db.storage.upsert_research_participation",
                      side_effect=AssertionError("draft 상태에서 저장이 호출되면 안 된다")), \
                patch("crane_web.handlers.auth._send_json", fake_send):
            AuthProfileHandlerMixin._handle_research_participation_post(h)

        self.assertEqual(sent["status"], 403)
        self.assertFalse(sent["body"]["ok"])

    def test_both_clients_hide_the_enrolment_form_when_closed(self):
        root = Path(__file__).resolve().parents[1] / "web"
        for name in ("index.html", "game-mobile.html"):
            with self.subTest(client=name):
                src = (root / name).read_text(encoding="utf-8")
                self.assertIn("enrollment_open", src)
                self.assertIn("참여 모집 준비 중", src)
                self.assertIn("local_draft_preview", src)
                self.assertIn("로컬 검증용 동의서 초안", src)

    def test_both_clients_drop_the_draft_banner_once_consent_is_approved(self):
        """승인된 동의서에 초안 배너가 남으면 참여자에게 거짓을 말하게 된다.

        배너 문구가 '참여 모집은 열려 있지 않습니다'인데 모집은 열려 있으므로,
        approved에서는 배너 자체가 렌더링되지 않아야 한다."""
        root = Path(__file__).resolve().parents[1] / "web"
        for name in ("index.html", "game-mobile.html"):
            with self.subTest(client=name):
                src = (root / name).read_text(encoding="utf-8")
                self.assertIn("s.consent_status==='approved'", src)


# ---------------------------------------------------------------------------
# S6b — 성인 참여 자격과 분리된 동의
# ---------------------------------------------------------------------------
class AdultConsentScenario(unittest.TestCase):
    """연령, 연구 참여, 개인정보, 국외 이전은 각각 실제 의사표시여야 하고,
    공개·2차 사용 동의는 선택이어야 한다."""

    def test_study_is_declared_adults_only(self):
        self.assertIn("만 19세 이상", research.public_study_config()["eligibility"])

    def test_server_refuses_registration_without_each_required_affirmation(self):
        from crane_db import storage
        payload = {
            "display_name": "참여자", "role_kind": "general",
            "role_grade": "", "role_years": "",
            "email": "participant@example.com",
            "age_confirmed": True, "research_consent": True,
            "privacy_consent": True, "overseas_transfer_consent": True,
            "open_data_consent": False,
        }
        for key in ("age_confirmed", "research_consent", "privacy_consent",
                    "overseas_transfer_consent"):
            for value in (False, None, "true", 1):
                with self.subTest(key=key, value=value):
                    bad = dict(payload, **{key: value})
                    with self.assertRaises(ValueError):
                        storage.upsert_research_participation("u-1", bad)

    def test_clients_send_real_required_and_optional_checkbox_values(self):
        root = Path(__file__).resolve().parents[1] / "web"
        clients = {
            "index.html": (
                ("researchAgeConfirmed", "age_confirmed"),
                ("researchParticipationConsent", "research_consent"),
                ("researchPrivacyConsent", "privacy_consent"),
                ("researchOverseasConsent", "overseas_transfer_consent"),
                ("researchOpenDataConsent", "open_data_consent"),
            ),
            "game-mobile.html": (
                ("mrAgeConfirmed", "age_confirmed"),
                ("mrParticipationConsent", "research_consent"),
                ("mrPrivacyConsent", "privacy_consent"),
                ("mrOverseasConsent", "overseas_transfer_consent"),
                ("mrOpenDataConsent", "open_data_consent"),
            ),
        }
        for name, fields in clients.items():
            src = (root / name).read_text(encoding="utf-8")
            for box, key in fields:
                expected = f"{key}:$('{box}').checked"
                with self.subTest(client=name, field=key):
                    self.assertIn(f'id="{box}"', src)
                    self.assertIn(expected, src)
                    self.assertNotIn(f"{key}:true", src)

    def test_clients_tell_nonparticipants_the_general_game_still_works(self):
        root = Path(__file__).resolve().parents[1] / "web"
        for name in ("index.html", "game-mobile.html"):
            with self.subTest(client=name):
                src = (root / name).read_text(encoding="utf-8")
                self.assertIn("만 19세 이상", src)
                self.assertIn("일반 게임", src)


# ---------------------------------------------------------------------------
# S7 — 내부 오류 노출
# ---------------------------------------------------------------------------
class InternalErrorLeakScenario(unittest.TestCase):
    """내부 예외 문자열에는 호스트·경로·쿼리 같은 구현 세부가 들어 있다.
    공개 엔드포인트가 그걸 그대로 반환하면 안 된다."""

    def test_public_error_body_hides_internal_detail(self):
        from crane_web.http_util import _send_internal_error
        captured = {}

        def fake_send(handler, body, status=200, **kw):
            captured["body"] = body
            captured["status"] = status

        exc = RuntimeError(
            'connection to server at "internal.example.invalid", port 5432 failed')
        with patch("crane_web.http_util._send_json", fake_send):
            _send_internal_error(None, exc)

        self.assertEqual(captured["status"], 500)
        self.assertFalse(captured["body"]["ok"])
        self.assertNotIn("internal.example.invalid", json.dumps(captured["body"], ensure_ascii=False))
        self.assertNotIn("5432", json.dumps(captured["body"], ensure_ascii=False))
        self.assertTrue(captured["body"].get("errorId"),
                        "서버 로그와 대조할 수 있는 식별자는 남겨야 한다")


# ---------------------------------------------------------------------------
# S8 — 부팅 진단이 서버를 죽이는 경우 (실제 발생: cp949 콘솔)
# ---------------------------------------------------------------------------
class BootDiagnosticScenario(unittest.TestCase):
    """배포 점검 로그를 추가했더니 cp949 콘솔에서 UnicodeEncodeError로 부팅이
    죽었다. except 절이 같은 문자열을 다시 출력해 두 번째 예외까지 났다.
    진단 한 줄이 서비스를 내리는 일은 없어야 한다."""

    class _Cp949Stdout:
        encoding = "cp949"

        def __init__(self):
            self.written = []

        def write(self, text):
            text.encode("cp949")  # 콘솔과 동일하게 인코딩 불가 문자를 거부
            self.written.append(text)

        def flush(self):
            pass

    def test_unencodable_boot_line_degrades_instead_of_raising(self):
        stream = self._Cp949Stdout()
        with patch("sys.stdout", stream):
            app._boot_print("[deploy] 경고 — 프록시 설정")  # em dash
        joined = "".join(stream.written)
        self.assertIn("[deploy]", joined)
        self.assertNotIn("—", joined)

    def test_encodable_boot_line_is_unchanged(self):
        stream = self._Cp949Stdout()
        with patch("sys.stdout", stream):
            app._boot_print("[deploy] 연구 동의서 상태=draft")
        self.assertIn("[deploy] 연구 동의서 상태=draft", "".join(stream.written))


# ---------------------------------------------------------------------------
# S9 — 신뢰 프록시 설정이 관리자 게이트를 열어버리는 경우
# ---------------------------------------------------------------------------
class ProxiedAdminGateScenario(unittest.TestCase):
    """CRANE_TRUST_PROXY를 켜면 프록시가 같은 호스트에 있을 때 모든 요청의
    peer가 loopback으로 보인다. loopback=관리자 경로가 그대로 열리면 외부
    방문자가 학습·모델 엔드포인트에 닿는다."""

    def test_forwarded_request_is_not_treated_as_local_operator(self):
        h = _handler(("127.0.0.1", 5000), {"X-Forwarded-For": "203.0.113.7"})
        with patch.object(app, "TRUST_PROXY_HEADERS", True):
            self.assertFalse(h._is_local_operator())

    def test_console_request_still_counts_as_local_operator(self):
        h = _handler(("127.0.0.1", 5000), {})
        with patch.object(app, "TRUST_PROXY_HEADERS", True):
            self.assertTrue(h._is_local_operator())
        with patch.object(app, "TRUST_PROXY_HEADERS", False):
            self.assertTrue(h._is_local_operator())

    def test_forwarded_header_denies_local_admin_even_when_untrusted(self):
        """전달 헤더의 *내용*은 신뢰하지 않아도, 그것이 존재한다는 사실은
        "이 요청은 프록시를 거쳐 왔다"는 신호다. 관리자 판정에서는 그걸
        거부 근거로만 쓴다 — 헤더를 보내서 권한을 얻을 수는 없고, 잃을
        수만 있으므로 위조는 공격자에게 이득이 없다.

        이 규칙이 CRANE_TRUST_PROXY 설정을 깜빡한 프록시 배포(운영에서 실제로
        발생)를 구제한다. 콘솔에서 직접 보내는 요청에는 이 헤더가 없다."""
        h = _handler(("127.0.0.1", 5000), {"X-Forwarded-For": "203.0.113.7"})
        for trust in (False, True):
            with self.subTest(trust_proxy=trust):
                with patch.object(app, "TRUST_PROXY_HEADERS", trust):
                    self.assertFalse(h._is_local_operator())


if __name__ == "__main__":
    unittest.main()


# ---------------------------------------------------------------------------
# S10 — 실험 순서 27개 전 구간 완주 가능성
# ---------------------------------------------------------------------------
class FullStudySequencePlayabilityScenario(unittest.TestCase):
    """참가자는 27개 시나리오를 순서대로 풀어야 하고, 앞 단계를 완주해야 다음이
    열린다. 중간의 한 개라도 완주 불가능하면 참가자는 30분을 쓴 뒤 막히고 그
    지점 이후의 데이터는 영영 수집되지 않는다. 이름 일치 검사만으로는 못 잡는다.

    실제 HTTP로 start -> step... -> submit 을 27개 전부 돌린다.
    """

    @classmethod
    def setUpClass(cls):
        import http.client
        import threading
        from http.server import ThreadingHTTPServer
        cls._http = http.client
        # 27개 x 수십 스텝이라 접근 로그가 수천 줄 나온다 — 실패 원인만 보이게 끈다.
        cls._log_patch = patch.object(app.Handler, "log_message",
                                      lambda *a, **k: None)
        cls._log_patch.start()
        cls.server = ThreadingHTTPServer(("127.0.0.1", 0), app.Handler)
        cls.thread = threading.Thread(target=cls.server.serve_forever, daemon=True)
        cls.thread.start()
        cls.port = cls.server.server_address[1]
        cls._user_patch = patch.object(
            app.Handler, "_current_user",
            lambda self: {"id": "seq-tester", "display_name": "seq", "role": ""},
        )
        cls._user_patch.start()

    @classmethod
    def tearDownClass(cls):
        cls._user_patch.stop()
        cls.server.shutdown()
        cls.server.server_close()
        cls.thread.join(timeout=2)
        cls._log_patch.stop()

    def call(self, path, body):
        conn = self._http.HTTPConnection("127.0.0.1", self.port, timeout=20)
        data = json.dumps(body).encode("utf-8")
        conn.request("POST", path, body=data,
                     headers={"Content-Type": "application/json"})
        res = conn.getresponse()
        raw = res.read()
        conn.close()
        return res.status, (json.loads(raw.decode("utf-8")) if raw else {})

    def _advance_one_step(self, sid, state):
        """Move the play forward by one accepted step.

        Assigns a single crane per step and walks its candidates until the
        server accepts one, then the next crane. Joint moves are skipped on
        purpose: two cranes independently picking their own first candidate
        collide (same lift, or hard interference), which is the *driver* being
        wrong, not the scenario being unplayable. One legal assignment per step
        is enough to prove the scenario can be finished.

        Returns (new_state, None) or (None, reason).
        """
        cands = state.get("candidates_by_crane") or {}
        attempts = 0
        for crane_id, options in cands.items():
            for option in options or []:
                attempts += 1
                if attempts > 40:
                    return None, "후보 40개를 시도해도 합법 수가 없음"
                status, stepped = self.call(
                    "/api/game/session/step",
                    {"session_id": sid, "decisions": {crane_id: option["lift_id"]}},
                )
                if status == 200 and stepped.get("ok"):
                    return stepped["state"], None
                if status not in (400,):
                    return None, f"{status}: {stepped.get('message')}"
        return None, f"합법 수 없음 (후보 {attempts}개 전부 거절)"

    def _play_to_completion(self, scenario_id):
        status, started = self.call("/api/game/session/start",
                                    {"scenario_id": scenario_id, "tier": "general"})
        if status != 200 or not started.get("ok"):
            return False, f"start {status}: {started.get('message')}"
        state = started["state"]
        sid = state["session_id"]
        steps = 0
        while not state.get("is_done") and steps < 300:
            state, reason = self._advance_one_step(sid, state)
            if state is None:
                return False, f"step {steps}: {reason}"
            steps += 1
        if not state.get("is_done"):
            return False, "300 스텝 내 미완주"
        status, submitted = self.call("/api/game/session/submit", {"session_id": sid})
        if status != 200 or not submitted.get("ok"):
            return False, f"submit {status}: {submitted.get('message')}"
        outcome = submitted.get("outcome") or {}
        if outcome.get("total") and outcome.get("done") != outcome.get("total"):
            return False, f"완주로 표시됐으나 done={outcome.get('done')}/{outcome.get('total')}"
        return True, f"{steps} steps"

    def test_every_scenario_in_the_frozen_sequence_is_completable(self):
        from crane_web.research import SCENARIO_SEQUENCE
        failures = []
        for scenario_id in SCENARIO_SEQUENCE:
            ok, detail = self._play_to_completion(scenario_id)
            if not ok:
                failures.append(f"{scenario_id}: {detail}")
        self.assertEqual(
            failures, [],
            "실험 순서에 완주 불가능한 시나리오가 있습니다:\n  "
            + "\n  ".join(failures),
        )
