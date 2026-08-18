import builtins
import http.client
import io
import json
import math
import threading
import unittest
from http.server import ThreadingHTTPServer
from unittest.mock import patch
from urllib.parse import urlparse

import app
from crane_web.handlers.game_query import (
    _public_play_summary,
    _public_leaderboard_entry,
)


class HeadRoutingTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.server = ThreadingHTTPServer(("127.0.0.1", 0), app.Handler)
        cls.thread = threading.Thread(target=cls.server.serve_forever, daemon=True)
        cls.thread.start()
        cls.port = cls.server.server_address[1]

    @classmethod
    def tearDownClass(cls):
        cls.server.shutdown()
        cls.server.server_close()
        cls.thread.join(timeout=2)

    def head(self, path):
        conn = http.client.HTTPConnection("127.0.0.1", self.port, timeout=5)
        conn.request("HEAD", path)
        response = conn.getresponse()
        body = response.read()
        headers = dict(response.getheaders())
        conn.close()
        return response.status, headers, body

    def get(self, path):
        conn = http.client.HTTPConnection("127.0.0.1", self.port, timeout=5)
        conn.request("GET", path)
        response = conn.getresponse()
        body = response.read()
        conn.close()
        return response.status, body

    def test_root_returns_promo_headers_without_body(self):
        status, headers, body = self.head("/")

        self.assertEqual(status, 200)
        self.assertEqual(body, b"")
        self.assertEqual(int(headers["Content-Length"]), app.WEB_ROOT.joinpath("promo.html").stat().st_size)
        self.assertEqual(headers["Referrer-Policy"], "same-origin")
        self.assertEqual(headers["X-Content-Type-Options"], "nosniff")

    def test_app_route_returns_index_headers_without_body(self):
        status, headers, body = self.head("/game")

        self.assertEqual(status, 200)
        self.assertEqual(body, b"")
        self.assertEqual(int(headers["Content-Length"]), app.WEB_ROOT.joinpath("index.html").stat().st_size)

    def test_favicon_returns_no_content_instead_of_forbidden(self):
        status, headers, body = self.head("/favicon.ico")

        self.assertEqual(status, 204)
        self.assertEqual(body, b"")
        self.assertEqual(headers["X-Content-Type-Options"], "nosniff")
        self.assertEqual(self.get("/favicon.ico"), (204, b""))

    def test_mobile_result_shows_score_before_operational_details(self):
        status, body = self.get("/game/mobile")
        html = body.decode("utf-8")

        self.assertEqual(status, 200)
        self.assertIn('id="winScoreCats"', html)
        self.assertNotIn('id="winDetailBtn"', html)
        self.assertNotIn("점수 상세 보기", html)
        self.assertIn('id="winReplayBtn"', html)
        self.assertIn('id="winNextBtn"', html)
        self.assertIn("snap.totalScore", html)
        # 카테고리별 가중 점수 막대는 제출 팝업에서 제거됨 (anchoring 방지 —
        # 항목별 분해는 관리자용 Plays 상세). showWin 은 더 이상 snap.categories 를
        # 읽지 않고 총점·등급만 표시하며, winScoreCats 컨테이너는 비워 숨긴다.
        self.assertNotIn("snap.categories", html)
        self.assertNotIn('id="winGrid"', html)
        self.assertNotIn('class="win-stars"', html)
        self.assertIn("saveBestScore", html)
        self.assertIn("미제출", html)
        self.assertNotIn("starsFor", html)

    def test_mobile_has_signup_and_leaderboard_screens(self):
        status, body = self.get("/game/mobile")
        html = body.decode("utf-8")

        self.assertEqual(status, 200)
        # Signup screen reuses the same auth API and demographic fields as desktop.
        self.assertIn('id="scrSignup"', html)
        self.assertIn('id="signupForm"', html)
        self.assertIn("/api/auth/signup", html)
        self.assertIn('id="suRoleKind"', html)
        self.assertIn('id="suPrivacyConsent"', html)
        self.assertIn('id="goSignupBtn"', html)
        # Leaderboard screen driven by the public plays feed — scenario ranking only.
        self.assertIn('id="scrBoard"', html)
        self.assertIn("/api/game/plays", html)
        self.assertIn('id="boardBtn"', html)
        self.assertIn("renderBoard", html)
        # Global ("종합 순위") mode was removed — only per-scenario ranking remains.
        self.assertNotIn("종합 순위", html)
        self.assertNotIn('id="lbTabGlobal"', html)
        self.assertNotIn("renderBoardGlobal", html)

    def test_repository_files_are_not_exposed_by_head(self):
        for path in ("/app.py", "/.env", "/rl_trainer/config.yaml"):
            with self.subTest(path=path):
                status, _, body = self.head(path)
                self.assertEqual(status, 403)
                self.assertEqual(body, b"")


class TokenLogRedactionTests(unittest.TestCase):
    def test_redacts_plain_and_encoded_token_query_parameters(self):
        for request_line in (
            "GET /trainer?token=top-secret&view=models HTTP/1.1",
            "GET /trainer?view=models&To%6Ben=top-secret HTTP/1.1",
        ):
            with self.subTest(request_line=request_line):
                redacted = app._redact_token_query(request_line)
                self.assertNotIn("top-secret", redacted)
                self.assertIn("[REDACTED]", redacted)
                self.assertIn("view=models", redacted)

    def test_leaves_unrelated_query_parameters_unchanged(self):
        request_line = "GET /game?share_code=abc123 HTTP/1.1"
        self.assertEqual(app._redact_token_query(request_line), request_line)


class JsonPostBodyGuardTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.server = ThreadingHTTPServer(("127.0.0.1", 0), app.Handler)
        cls.thread = threading.Thread(target=cls.server.serve_forever, daemon=True)
        cls.thread.start()
        cls.port = cls.server.server_address[1]

    @classmethod
    def tearDownClass(cls):
        cls.server.shutdown()
        cls.server.server_close()
        cls.thread.join(timeout=2)

    def raw_post(self, path, *, headers=None, body=None):
        conn = http.client.HTTPConnection("127.0.0.1", self.port, timeout=5)
        conn.putrequest("POST", path)
        for key, value in (headers or {}).items():
            conn.putheader(key, str(value))
        conn.endheaders(body)
        response = conn.getresponse()
        raw = response.read()
        conn.close()
        return response.status, json.loads(raw.decode('utf-8'))

    def test_required_json_post_without_content_length_returns_411(self):
        status, response = self.raw_post('/api/auth/login')

        self.assertEqual(status, 411)
        self.assertIn('Content-Length', response['message'])

    def test_oversized_json_post_returns_413_without_reading_body(self):
        status, response = self.raw_post(
            '/api/game/session/start',
            headers={'Content-Length': app.MAX_JSON_BODY_BYTES + 1},
        )

        self.assertEqual(status, 413)
        self.assertEqual(response['maxBytes'], app.MAX_JSON_BODY_BYTES)

    def test_invalid_content_length_returns_400(self):
        status, response = self.raw_post(
            '/api/auth/login',
            headers={'Content-Length': 'not-a-number'},
        )

        self.assertEqual(status, 400)
        self.assertIn('invalid Content-Length', response['message'])

    def test_empty_malformed_and_non_object_json_return_400(self):
        cases = (
            ({'Content-Length': 0}, None, 'required'),
            ({'Content-Length': 1}, b'{', 'invalid JSON'),
            ({'Content-Length': 2}, b'[]', 'must be an object'),
        )
        for headers, body, message in cases:
            with self.subTest(message=message):
                status, response = self.raw_post('/api/auth/login', headers=headers, body=body)
                self.assertEqual(status, 400)
                self.assertIn(message, response['message'])

    def test_transfer_encoding_is_rejected_and_bodyless_logout_still_works(self):
        status, response = self.raw_post(
            '/api/auth/login',
            headers={'Transfer-Encoding': 'chunked'},
        )
        self.assertEqual(status, 400)
        self.assertIn('Transfer-Encoding', response['message'])

        status, response = self.raw_post('/api/auth/logout')
        self.assertEqual(status, 200)
        self.assertTrue(response['ok'])


class PlanEndpointValidationTests(unittest.TestCase):
    @staticmethod
    def handler(payload):
        body = json.dumps(payload).encode('utf-8')
        handler = object.__new__(app.Handler)
        handler.headers = {'Content-Length': str(len(body))}
        handler.rfile = io.BytesIO(body)
        return handler

    @staticmethod
    def result():
        return {
            'makespan': 10.0,
            'cranes': [{'id': 'C1', 'type': 'default'}],
            'events': [{
                'craneId': 'C1', 'duration': 5.0, 'setup': 1.0,
                'teardown': 1.0, 'travel': 1.0, 'move': 10.0, 'finish': 8.0,
            }],
        }

    def test_plan_cost_rejects_negative_rate_with_400(self):
        handler = self.handler({
            'result': self.result(),
            'rates': {'fuelPerMoveUnit': -1},
        })
        with patch('crane_web.handlers.planning._send_json') as send_json:
            handler._handle_plan_cost()

        self.assertEqual(send_json.call_args.args[2], 400)
        self.assertIn('finite non-negative', send_json.call_args.args[1]['message'])

    def test_plan_cost_rejects_nonfinite_result_with_400(self):
        result = self.result()
        result['makespan'] = math.nan
        handler = self.handler({'result': result})
        with patch('crane_web.handlers.planning._send_json') as send_json:
            handler._handle_plan_cost()

        self.assertEqual(send_json.call_args.args[2], 400)
        self.assertIn('result.makespan', send_json.call_args.args[1]['message'])

    def test_plan_cost_accepts_valid_repricing_request(self):
        handler = self.handler({
            'result': self.result(),
            'rates': {'rentalPerMin': {'_default': 100}},
        })
        with patch('crane_web.handlers.planning._send_json') as send_json:
            handler._handle_plan_cost()

        response = send_json.call_args.args[1]
        self.assertTrue(response['ok'])
        self.assertGreater(response['cost']['totalCost'], 0)

    def test_plan_run_rejects_unsupported_policy_with_400(self):
        handler = self.handler({
            'policy': 'bogus',
            'cranes': [{'id': 'C1', 'x': 10, 'y': 10}],
            'lifts': [{'id': 'L1', 'x': 12, 'y': 10}],
        })
        with patch('crane_web.handlers.planning._send_json') as send_json:
            handler._handle_plan_run()

        self.assertEqual(send_json.call_args.args[2], 400)
        self.assertIn('unsupported policy', send_json.call_args.args[1]['message'])

    def test_plan_run_rejects_invalid_cost_rates_before_execution(self):
        handler = self.handler({
            'policy': 'nearest',
            'costRates': {'laborPerMin': math.inf},
            'cranes': [{'id': 'C1', 'x': 10, 'y': 10}],
            'lifts': [{'id': 'L1', 'x': 12, 'y': 10}],
        })
        with patch('crane_web.handlers.planning._send_json') as send_json:
            handler._handle_plan_run()

        self.assertEqual(send_json.call_args.args[2], 400)
        self.assertIn('finite non-negative', send_json.call_args.args[1]['message'])

    def test_plan_run_applies_height_order_radius_camel_case(self):
        # Two nearby lifts: the higher one must wait for the lower one, and the
        # camelCase browser key must reach the env as height_order_radius.
        handler = self.handler({
            'policy': 'nearest',
            'heightOrderRadius': 10,
            'cranes': [{'id': 'C1', 'x': 10, 'y': 10}],
            'lifts': [
                {'id': 'L-high', 'x': 20, 'y': 10, 'weightT': 1, 'z': 12},
                {'id': 'L-low', 'x': 25, 'y': 10, 'weightT': 1, 'z': 3},
            ],
        })
        with patch('crane_web.handlers.planning._send_json') as send_json:
            handler._handle_plan_run()

        response = send_json.call_args.args[1]
        self.assertTrue(response['ok'], response.get('message'))
        result = response['result']
        self.assertEqual(result['heightOrderRadius'], 10.0)
        self.assertEqual(result['heightOrder'], {'L-high': ['L-low']})
        order = [e['liftId'] for e in result['events']]
        self.assertLess(order.index('L-low'), order.index('L-high'))

    def test_plan_run_applies_per_type_capacity_curve(self):
        # A mobile_100t crane must rate loads with the payload's type curve:
        # 30t → 14m on the 100t curve vs 8m on the config's global curve.
        handler = self.handler({
            'policy': 'nearest',
            'crane_types': {'mobile_100t': {'capacity_curve': [
                {'radius': 3, 'capacityT': 100},
                {'radius': 14, 'capacityT': 36},
                {'radius': 30, 'capacityT': 12},
            ]}},
            'cranes': [{'id': 'C-100', 'x': 40, 'y': 10, 'type': 'mobile_100t'}],
            'lifts': [{'id': 'L1', 'x': 50, 'y': 10, 'weightT': 30}],
        })
        with patch('crane_web.handlers.planning._send_json') as send_json:
            handler._handle_plan_run()

        response = send_json.call_args.args[1]
        self.assertTrue(response['ok'], response.get('message'))
        events = response['result']['events']
        self.assertEqual(len(events), 1)
        self.assertAlmostEqual(events[0]['ratedMaxRadius'], 14.0)

    def test_plan_run_import_error_matches_cpu_torch_deployment(self):
        handler = self.handler({})
        real_import = builtins.__import__

        def import_without_mappo(name, *args, **kwargs):
            if name == 'rl_trainer.mappo':
                raise ImportError('simulated missing MAPPO dependency')
            return real_import(name, *args, **kwargs)

        with patch('builtins.__import__', side_effect=import_without_mappo), patch('crane_web.handlers.planning._send_json') as send_json:
            handler._handle_plan_run()

        response, status = send_json.call_args.args[1:3]
        self.assertEqual(status, 503)
        self.assertIn('CPU 전용 PyTorch가 포함', response['message'])
        self.assertNotIn('PyTorch를 포함하지 않습니다', response['message'])


class ScenarioAccessTests(unittest.TestCase):
    def handler(self, user=None):
        handler = object.__new__(app.Handler)
        handler._current_user = lambda: user
        return handler

    def custom_scenario(self, visibility="private"):
        return {
            "id": "usr_private",
            "owner_id": "owner-1",
            "share_code": "shr_secret",
            "visibility": visibility,
            "name": "Private",
            "description": "",
            "tier": "custom",
            "difficulty": 3,
            "layout": {"cranes": [], "lifts": [], "restrictedZones": []},
            "config": {},
        }

    def test_private_scenario_requires_owner_or_share_code(self):
        custom = self.custom_scenario()
        with patch("crane_db.storage.get_user_scenario", return_value=custom):
            scenario, error = self.handler()._resolve_game_scenario_access("usr_private")

        self.assertIsNone(scenario)
        self.assertEqual(error[1], 403)

    def test_private_scenario_allows_matching_share_code(self):
        custom = self.custom_scenario()
        with patch("crane_db.storage.get_user_scenario", return_value=custom):
            scenario, error = self.handler()._resolve_game_scenario_access(
                "usr_private", "shr_secret",
            )

        self.assertIsNone(error)
        self.assertEqual(scenario["id"], "usr_private")

    def test_private_scenario_allows_owner(self):
        custom = self.custom_scenario()
        with patch("crane_db.storage.get_user_scenario", return_value=custom):
            scenario, error = self.handler({"id": "owner-1"})._resolve_game_scenario_access(
                "usr_private",
            )

        self.assertIsNone(error)
        self.assertEqual(scenario["id"], "usr_private")


class PublicPlayResponseTests(unittest.TestCase):
    def play(self):
        return {
            "path": "pg:play:42",
            "user_id": "user-secret",
            "scenario_id": "scenario-1",
            "tier": "expert",
            "nickname": "operator",
            "display_name": "Operator",
            "role": "admin",
            "role_kind": "engineer",
            "role_grade": "senior",
            "role_years": 12,
            "submitted_at": "2026-06-12T00:00:00+00:00",
            "play_seconds": 90,
            "undo_count": 1,
            "makespan": 120.0,
            "done": 10,
            "total": 10,
            "totalScore": 88.5,
            "grade": "A",
        }

    def test_public_play_summary_hides_internal_metadata(self):
        summary = _public_play_summary(
            self.play(),
            {"id": "user-secret", "display_name": "Operator"},
        )

        for key in ("path", "user_id", "role", "role_kind", "role_grade", "role_years"):
            self.assertNotIn(key, summary)
        self.assertTrue(summary["is_mine"])
        self.assertEqual(len(summary["player_id"]), 20)
        self.assertEqual(summary["totalScore"], 88.5)

    def test_public_leaderboard_sanitizes_recent_plays(self):
        entry = _public_leaderboard_entry(
            {"scenario_id": "scenario-1", "n_plays": 1, "recent": [self.play()]},
            {"id": "other-user"},
        )

        self.assertEqual(entry["n_plays"], 1)
        self.assertNotIn("path", entry["recent"][0])
        self.assertFalse(entry["recent"][0]["is_mine"])

    def test_leaderboard_never_reveals_which_plays_are_research(self):
        """실험 플레이도 리더보드에 함께 집계하되, 어느 기록이 실험인지는
        드러나지 않아야 한다. _PUBLIC_PLAY_FIELDS 가 allowlist라 목적·참여자
        식별자는 통과하지 못한다 — 새 필드를 추가할 때 이 계약이 깨지기 쉬워
        여기서 고정한다."""
        research_play = self.play()
        research_play.update({
            "play_purpose": "research",
            "participant_id": "participant-secret",
            "study_id": "crane-scheduling-study",
            "study_version": "v1",
            "consent_version": "2026-07-29-v2",
            "scenario_order": 3,
            "attempt_no": 2,
        })

        summary = _public_play_summary(research_play, {"id": "other-user"})
        for key in ("play_purpose", "participant_id", "study_id", "study_version",
                    "consent_version", "scenario_order", "attempt_no"):
            self.assertNotIn(key, summary, f"{key} 가 리더보드 응답에 실리면 안 된다")
        # 점수는 일반 플레이와 똑같이 노출된다 (같은 순위에 들어간다).
        self.assertEqual(summary["totalScore"], 88.5)

        entry = _public_leaderboard_entry(
            {"scenario_id": "scenario-1", "n_plays": 1, "recent": [research_play]},
            {"id": "other-user"},
        )
        self.assertNotIn("play_purpose", entry["recent"][0])

    def test_leaderboard_handler_does_not_filter_by_purpose(self):
        """리더보드는 목적으로 거르지 않는다 — play_purpose=None 으로 조회해야
        실험 플레이가 순위에 포함된다."""
        captured = {}

        def _fake_summary(**kwargs):
            captured.update(kwargs)
            return []

        handler = app.Handler.__new__(app.Handler)
        handler.headers = {}
        sent = {}
        with patch("game_irl.human_play.summary_by_scenario", _fake_summary), \
                patch.object(app.Handler, "_is_admin_request", lambda self: True), \
                patch("crane_web.handlers.game_query._send_json",
                      lambda h, payload, status=200: sent.update(payload=payload, status=status)):
            handler._handle_game_leaderboard(urlparse("/api/game/leaderboard"))

        self.assertIsNone(captured.get("play_purpose"),
                          "리더보드가 general 로 좁히면 실험 플레이가 빠진다")
        self.assertTrue(sent["payload"]["ok"])


class GameEndpointSecurityTests(unittest.TestCase):
    def handler(self):
        return object.__new__(app.Handler)

    def test_submit_rejects_client_controlled_scorer_weights(self):
        handler = self.handler()
        session = type("Session", (), {"session_id": "session-1"})()
        handler._read_json_payload = lambda: {
            "session_id": "session-1",
            "scorer_weights": {"completion": 1000},
        }
        handler._resolve_session = lambda payload: (session, None)

        # _handle_game_session_submit now lives in the game_session handler
        # mixin, so patch _send_json where that module looks it up.
        with patch("crane_web.handlers.game_session._send_json") as send_json:
            handler._handle_game_session_submit()

        self.assertEqual(send_json.call_args.args[2], 400)
        self.assertIn("server-controlled", send_json.call_args.args[1]["message"])

    def test_public_plays_endpoint_returns_sanitized_summaries(self):
        handler = self.handler()
        handler._is_admin_request = lambda: False
        handler._current_user = lambda: {"id": "user-secret"}
        stored_play = {
            "path": "pg:play:42",
            "user_id": "user-secret",
            "scenario_id": "scenario-1",
            "nickname": "operator",
            "display_name": "Operator",
            "role": "admin",
            "totalScore": 88.5,
        }

        with (
            patch("crane_web.handlers.game_query._send_json") as send_json,
            patch("game_irl.human_play.list_plays", return_value=[stored_play]) as list_plays,
        ):
            handler._handle_game_plays(urlparse("/api/game/plays"))

        self.assertEqual(list_plays.call_args.kwargs["play_purpose"], "general")
        response = send_json.call_args.args[1]
        self.assertEqual(response["count"], 1)
        self.assertNotIn("path", response["plays"][0])
        self.assertNotIn("user_id", response["plays"][0])
        self.assertTrue(response["plays"][0]["is_mine"])

    def test_heatmap_checks_private_scenario_access_before_loading_plays(self):
        handler = self.handler()
        handler._resolve_game_scenario_access = lambda scenario_id, share_code: (
            None,
            ("private scenario", 403),
        )

        with (
            patch("crane_web.handlers.game_query._send_json") as send_json,
            patch("crane_db.storage.list_plays") as list_plays,
        ):
            handler._handle_game_heatmap(urlparse("/api/game/heatmap?scenario_id=private-1"))

        self.assertEqual(send_json.call_args.args[2], 403)
        list_plays.assert_not_called()

    def test_public_heatmap_uses_only_general_plays(self):
        handler = self.handler()
        handler._resolve_game_scenario_access = lambda scenario_id, share_code: ({}, None)

        with (
            patch("crane_web.handlers.game_query._send_json"),
            patch("crane_db.storage.list_plays", return_value=[]) as list_plays,
        ):
            handler._handle_game_heatmap(urlparse("/api/game/heatmap?scenario_id=D1_1"))

        self.assertEqual(list_plays.call_args.kwargs["play_purpose"], "general")

    def test_scenario_create_is_admin_only(self):
        # A logged-in but non-admin user must not be able to register scenarios;
        # only admins (CRANE_ADMIN_EMAILS / loopback) may create/edit/delete.
        handler = self.handler()
        handler._require_game_user = lambda: {"id": "u1", "display_name": "User"}
        handler._is_admin_request = lambda: False
        handler._read_json_payload = lambda: {"name": "X"}
        with (
            patch("crane_web.handlers.scenarios._send_json") as send_json,
            patch("crane_db.storage.create_user_scenario") as create,
        ):
            handler._handle_user_scenario_post()
        self.assertEqual(send_json.call_args.args[2], 403)
        create.assert_not_called()

    def test_scenario_create_allowed_for_admin(self):
        handler = self.handler()
        handler._require_game_user = lambda: {"id": "admin", "display_name": "Admin"}
        handler._is_admin_request = lambda: True
        handler._read_json_payload = lambda: {"name": "X", "visibility": "public"}
        created = {"id": "usr_1", "visibility": "public"}
        with (
            patch("crane_web.handlers.scenarios._send_json") as send_json,
            patch("crane_db.storage.create_user_scenario", return_value=created) as create,
        ):
            handler._handle_user_scenario_post()
        create.assert_called_once()
        self.assertEqual(send_json.call_args.args[2], 201)


class RateLimiterTests(unittest.TestCase):
    def test_allows_up_to_budget_then_blocks_then_recovers(self):
        limiter = app._RateLimiter(3, 60)
        for _ in range(3):
            self.assertEqual(limiter.hit("k", now=1000.0), 0)
        retry_after = limiter.hit("k", now=1000.0)
        self.assertGreater(retry_after, 0)
        self.assertLessEqual(retry_after, 60)
        # A distinct key has its own independent budget.
        self.assertEqual(limiter.hit("other", now=1000.0), 0)
        # Once the window fully passes the original key is allowed again.
        self.assertEqual(limiter.hit("k", now=1061.0), 0)

    def test_zero_budget_disables_the_limiter(self):
        limiter = app._RateLimiter(0, 60)
        self.assertFalse(limiter.enabled)
        for _ in range(100):
            self.assertEqual(limiter.hit("k"), 0)


class RateLimitRoutingTests(unittest.TestCase):
    def handler(self, client, headers=None):
        h = object.__new__(app.Handler)
        h.client_address = client
        # A real BaseHTTPRequestHandler always has .headers; rate limiting now
        # inspects them (a forwarded request is never a local operator).
        h.headers = headers or {}
        return h

    def test_loopback_clients_are_never_limited(self):
        handler = self.handler(("127.0.0.1", 5000))
        with patch.object(app, "_GAME_RATE_LIMITER", app._RateLimiter(1, 60)):
            with patch("app._send_json") as send_json:
                for _ in range(5):
                    self.assertFalse(handler._rate_limited("/api/game/irl/run"))
                send_json.assert_not_called()

    def test_irl_run_status_poll_is_never_rate_limited(self):
        # The IRL fit takes minutes, so the browser polls this every 3 s while a
        # run is in flight. Charging it against the game bucket (which /run
        # itself uses) would 429 the poll and orphan a running job.
        handler = self.handler(("203.0.113.9", 5000))
        with patch.object(app, "_GAME_RATE_LIMITER", app._RateLimiter(1, 60)):
            with patch("app._send_json") as send_json:
                for _ in range(20):
                    self.assertFalse(handler._rate_limited("/api/game/irl/run/status"))
                send_json.assert_not_called()

    def test_remote_client_gets_429_with_retry_after_when_over_budget(self):
        handler = self.handler(("203.0.113.9", 5000))
        # login/signup live in the identity bucket (classroom-sized per-IP
        # ceiling); the auth bucket now covers resend + research enrolment.
        with patch.object(app, "_IDENTITY_RATE_LIMITER", app._RateLimiter(1, 60)):
            with patch("app._send_json") as send_json:
                self.assertFalse(handler._rate_limited("/api/auth/login"))
                self.assertTrue(handler._rate_limited("/api/auth/login"))

        self.assertEqual(send_json.call_args.args[2], 429)
        self.assertIn("Retry-After", send_json.call_args.kwargs["extra_headers"])

    def test_unlisted_paths_are_not_limited(self):
        handler = self.handler(("203.0.113.9", 5000))
        with patch("app._send_json") as send_json:
            self.assertFalse(handler._rate_limited("/api/train/start"))
            send_json.assert_not_called()


class GameSessionFlowIntegrationTests(unittest.TestCase):
    """End-to-end over real HTTP: drive a built-in scenario from start through
    every legal step to submit, exercising the actual handler + env + scorer
    pipeline (not string assertions). Auth is the one stubbed seam so the flow
    stays hermetic; the request/response path is otherwise real."""

    @classmethod
    def setUpClass(cls):
        cls.server = ThreadingHTTPServer(("127.0.0.1", 0), app.Handler)
        cls.thread = threading.Thread(target=cls.server.serve_forever, daemon=True)
        cls.thread.start()
        cls.port = cls.server.server_address[1]
        cls._user_patch = patch.object(
            app.Handler, "_current_user",
            lambda self: {"id": "itest-user", "display_name": "itester", "role": ""},
        )
        cls._user_patch.start()

    @classmethod
    def tearDownClass(cls):
        cls._user_patch.stop()
        cls.server.shutdown()
        cls.server.server_close()
        cls.thread.join(timeout=2)

    def call(self, method, path, body=None):
        conn = http.client.HTTPConnection("127.0.0.1", self.port, timeout=10)
        data = json.dumps(body).encode("utf-8") if body is not None else None
        headers = {"Content-Type": "application/json"} if data is not None else {}
        conn.request(method, path, body=data, headers=headers)
        response = conn.getresponse()
        raw = response.read()
        conn.close()
        return response.status, (json.loads(raw.decode("utf-8")) if raw else {})

    def _first_scenario_id(self):
        status, body = self.call("GET", "/api/game/scenarios")
        self.assertEqual(status, 200)
        self.assertTrue(body["scenarios"], "expected at least one built-in scenario")
        return body["scenarios"][0]["id"]

    def test_full_play_through_start_step_submit(self):
        scenario_id = self._first_scenario_id()
        status, started = self.call(
            "POST", "/api/game/session/start",
            {"scenario_id": scenario_id, "tier": "general"},
        )
        self.assertEqual(status, 200)
        self.assertTrue(started["ok"])
        state = started["state"]
        session_id = state["session_id"]
        self.assertFalse(state["is_done"])

        steps = 0
        while not state["is_done"] and steps < 60:
            decisions = {
                crane_id: cands[0]["lift_id"]
                for crane_id, cands in state["candidates_by_crane"].items() if cands
            }
            self.assertTrue(decisions, "expected at least one legal candidate per step")
            status, stepped = self.call(
                "POST", "/api/game/session/step",
                {"session_id": session_id, "decisions": decisions},
            )
            self.assertEqual(status, 200)
            self.assertTrue(stepped["ok"])
            state = stepped["state"]
            steps += 1

        self.assertGreater(steps, 0)
        self.assertTrue(state["is_done"], "scenario should complete within the step budget")

        status, submitted = self.call(
            "POST", "/api/game/session/submit", {"session_id": session_id},
        )
        self.assertEqual(status, 200)
        self.assertTrue(submitted["ok"])
        self.assertIn("outcome", submitted)
        self.assertIn("scorer_snapshot", submitted)

    def test_step_on_unknown_session_returns_404(self):
        status, body = self.call(
            "POST", "/api/game/session/step",
            {"session_id": "does-not-exist", "decisions": {}},
        )
        self.assertEqual(status, 404)
        self.assertFalse(body["ok"])

    def test_assets_static_route_serves_media_and_blocks_traversal(self):
        # /assets/ 는 web/assets/ 정적 미디어(튜토리얼 영상 등) 공개 라우트.
        # HEAD 로 검증해 25MB 본문 전송 없이 헤더만 확인한다.
        conn = http.client.HTTPConnection("127.0.0.1", self.port, timeout=10)
        conn.request("HEAD", "/assets/tutorial-play.mp4")
        r = conn.getresponse(); r.read()
        self.assertEqual(r.status, 200)
        self.assertEqual(r.getheader("Content-Type"), "video/mp4")
        self.assertGreater(int(r.getheader("Content-Length") or 0), 0)
        # 경로 탈출 차단 + 미존재 404
        conn.request("HEAD", "/assets/../index.html")
        r = conn.getresponse(); r.read()
        self.assertIn(r.status, (403, 404))
        conn.request("HEAD", "/assets/no-such-file.mp4")
        r = conn.getresponse(); r.read()
        self.assertEqual(r.status, 404)
        # Range 지원 — <video> 재생 필수. 브라우저는 moov 메타데이터를 얻으려
        # suffix range(마지막 N바이트)를, 시킹 때 구간 range 를 보낸다.
        conn.request("GET", "/assets/tutorial-play.mp4", headers={"Range": "bytes=0-99"})
        r = conn.getresponse(); body = r.read()
        self.assertEqual(r.status, 206)
        self.assertEqual(len(body), 100)
        self.assertRegex(r.getheader("Content-Range") or "", r"^bytes 0-99/\d+$")
        self.assertEqual(r.getheader("Accept-Ranges"), "bytes")
        conn.request("GET", "/assets/tutorial-play.mp4", headers={"Range": "bytes=-50"})
        r = conn.getresponse(); body = r.read()
        self.assertEqual(r.status, 206)
        self.assertEqual(len(body), 50)
        # 범위 밖 → 416
        conn.request("GET", "/assets/tutorial-play.mp4", headers={"Range": "bytes=999999999999-"})
        r = conn.getresponse(); r.read()
        self.assertEqual(r.status, 416)
        conn.close()

    def test_fleet_scenario_start_accepts_cranes_and_rejects_invalid(self):
        # Fleet-sizing map (FLEET_1): the start API must honor the player's
        # crane count + placement, and 400 a placement inside the footprint.
        status, body = self.call(
            "POST", "/api/game/session/start",
            {"scenario_id": "FLEET_1", "tier": "expert",
             "cranes": [{"x": 20, "y": 20}, {"x": 80, "y": 80}, {"x": 80, "y": 20}]},
        )
        self.assertEqual(status, 200)
        self.assertTrue(body["ok"])
        self.assertEqual(len(body["state"]["cranes"]), 3)

        status, body = self.call(
            "POST", "/api/game/session/start",
            {"scenario_id": "FLEET_1", "tier": "expert",
             "cranes": [{"x": 50, "y": 50}]},   # 현장 경계(제한구역) 안 → 400
        )
        self.assertEqual(status, 400)
        self.assertFalse(body["ok"])

    def test_submit_rejects_client_scorer_weights_over_http(self):
        scenario_id = self._first_scenario_id()
        _, started = self.call(
            "POST", "/api/game/session/start",
            {"scenario_id": scenario_id, "tier": "general"},
        )
        session_id = started["state"]["session_id"]
        status, body = self.call(
            "POST", "/api/game/session/submit",
            {"session_id": session_id, "scorer_weights": {"completion": 999}},
        )
        self.assertEqual(status, 400)
        self.assertIn("server-controlled", body["message"])

    def test_participant_listing_requires_admin(self):
        """참여자 목록은 실명·학번·전화번호를 반환하므로 admin 게이트 뒤에 있어야
        한다. 이 엔드포인트가 열리면 공개 배포에서 PII가 그대로 노출된다."""
        with patch.object(app.Handler, "_is_admin_request", lambda self: False):
            status, body = self.call("GET", "/api/admin/db/participants")
        self.assertEqual(status, 401)
        self.assertFalse(body["ok"])
        self.assertNotIn("participants", body)

        with patch.object(app.Handler, "_is_admin_request", lambda self: True), \
                patch("crane_db.storage.admin_research_participants", lambda **kw: []):
            status, body = self.call("GET", "/api/admin/db/participants")
        self.assertEqual(status, 200)
        self.assertTrue(body["ok"])
        self.assertEqual(body["participants"], [])

    def test_participant_signature_requires_admin(self):
        """자필 서명은 실명·학번과 같은 등급의 개인정보다. 목록과 별개의
        엔드포인트지만 같은 admin 게이트 뒤에 있어야 한다."""
        path = "/api/admin/db/participant-signature?participant_id=abc"
        with patch.object(app.Handler, "_is_admin_request", lambda self: False):
            status, body = self.call("GET", path)
        self.assertEqual(status, 401)
        self.assertFalse(body["ok"])
        self.assertNotIn("signature", body)

        # participant_id 없이 부르면 400 — 전체 서명을 훑는 경로를 만들지 않는다.
        with patch.object(app.Handler, "_is_admin_request", lambda self: True):
            status, body = self.call("GET", "/api/admin/db/participant-signature")
        self.assertEqual(status, 400)

        with patch.object(app.Handler, "_is_admin_request", lambda self: True), \
                patch("crane_db.storage.get_research_signature",
                      lambda pid: "data:image/png;base64,AAAA"):
            status, body = self.call("GET", path)
        self.assertEqual(status, 200)
        self.assertEqual(body["signature"], "data:image/png;base64,AAAA")

        with patch.object(app.Handler, "_is_admin_request", lambda self: True), \
                patch("crane_db.storage.get_research_signature", lambda pid: None):
            status, body = self.call("GET", path)
        self.assertEqual(status, 404)

    def test_research_signature_and_submit_routes_are_registered(self):
        """서명 보충과 제출 표시는 POST 전용 경로다. 라우팅이 빠지면 404가 되고
        참여자는 '저장 실패'만 보게 되므로 여기서 고정한다."""
        for path, storage_fn in (
            ("/api/game/research/signature", "update_research_signature"),
            ("/api/game/research/submit", "mark_research_submitted"),
        ):
            with self.subTest(path=path):
                shape = {"participation": {"has_signature": True}, "progress": {}}
                with patch.object(app.Handler, "_profile_user_id_or_401", lambda self: "user-1"), \
                        patch(f"crane_db.storage.{storage_fn}", lambda *a, **k: shape):
                    status, body = self.call("POST", path, {"signature": "x"})
                self.assertEqual(status, 200)
                self.assertTrue(body["ok"])
                self.assertIn("participation", body)

    def test_research_submit_rejects_incomplete_participation(self):
        """서버가 완료 여부를 확인한다 — 버튼을 숨기는 것만으로는 부족하다."""
        def _raise(*a, **k):
            raise ValueError("모든 시나리오를 완료한 뒤 제출할 수 있습니다.")
        with patch.object(app.Handler, "_profile_user_id_or_401", lambda self: "user-1"), \
                patch("crane_db.storage.mark_research_submitted", _raise):
            status, body = self.call("POST", "/api/game/research/submit", {})
        self.assertEqual(status, 400)
        self.assertFalse(body["ok"])
        self.assertIn("완료", body["message"])

    def test_unauthenticated_start_is_rejected(self):
        with patch.object(app.Handler, "_current_user", lambda self: None):
            status, body = self.call(
                "POST", "/api/game/session/start",
                {"scenario_id": "TUT_00", "tier": "general"},
            )
        self.assertEqual(status, 401)
        self.assertFalse(body["ok"])


if __name__ == "__main__":
    unittest.main()
