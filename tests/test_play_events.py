import http.client
import json
import tempfile
import threading
import unittest
from http.server import ThreadingHTTPServer
from pathlib import Path
from unittest.mock import patch

import app
from crane_db import storage
from game_irl import human_play


class RawEventSanitizationTests(unittest.TestCase):
    def test_non_list_input_is_rejected(self):
        self.assertEqual(human_play._sanitize_events(None), [])
        self.assertEqual(human_play._sanitize_events({"type": "submit"}), [])

    def test_values_are_clamped_truncated_and_flattened(self):
        events = human_play._sanitize_events([{
            "t": -50,
            "type": "x" * 60,
            "flag": True,
            "large": 2_000_000_000,
            "small": -2_000_000_000,
            "ratio": 1.23456,
            "nan": float("nan"),
            "infinity": float("inf"),
            "label": "가" * 130,
            "nested": {"secret": "drop"},
            "items": [1, 2, 3],
            "nothing": None,
        }])

        self.assertEqual(len(events), 1)
        event = events[0]
        self.assertEqual(event["t"], 0)
        self.assertEqual(event["type"], "x" * 40)
        self.assertIs(event["flag"], True)
        self.assertEqual(event["large"], 1_000_000_000)
        self.assertEqual(event["small"], -1_000_000_000)
        self.assertEqual(event["ratio"], 1.235)
        self.assertEqual(event["nan"], 0.0)
        self.assertEqual(event["infinity"], 0.0)
        self.assertEqual(event["label"], "가" * 120)
        self.assertNotIn("nested", event)
        self.assertNotIn("items", event)
        self.assertNotIn("nothing", event)

    def test_event_and_field_counts_are_capped(self):
        many_events = [
            {"t": i, "type": "pointer"}
            for i in range(human_play._EVENTS_MAX + 5)
        ]
        events = human_play._sanitize_events(many_events)

        self.assertEqual(len(events), human_play._EVENTS_MAX)
        self.assertEqual(events[-1]["t"], human_play._EVENTS_MAX - 1)

        payload = {
            "t": 1,
            "type": "assign",
            **{f"field_{i:02d}": i for i in range(human_play._EVENT_FIELDS_MAX + 5)},
        }
        [event] = human_play._sanitize_events([payload])
        payload_fields = [key for key in event if key not in ("t", "type")]

        self.assertEqual(len(payload_fields), human_play._EVENT_FIELDS_MAX)
        self.assertIn("field_15", event)
        self.assertNotIn("field_16", event)


class RawEventPersistenceTests(unittest.TestCase):
    def test_submit_persists_sanitized_events_under_behavior(self):
        session = human_play.PlaySession(
            "D1_1",
            "general",
            "tester",
            user={"id": "test-user", "display_name": "tester"},
        )
        session.record_events([
            {
                "t": 321.8,
                "type": "assign",
                "crane": "C1",
                "lift": "L1",
                "nested": {"drop": True},
            },
            "invalid-event",
        ])

        with (
            patch.object(human_play._storage, "save_play", return_value="mock:play") as save_play,
            patch.object(human_play._storage, "delete_game_session"),
        ):
            doc, ref = session.submit()

        self.assertEqual(ref, "mock:play")
        self.assertEqual(doc["behavior"]["events"], [{
            "t": 321,
            "type": "assign",
            "crane": "C1",
            "lift": "L1",
        }])
        save_play.assert_called_once_with(doc)

    def test_submit_keeps_empty_event_list_for_older_clients(self):
        session = human_play.PlaySession(
            "D1_1",
            "general",
            "tester",
            user={"id": "test-user", "display_name": "tester"},
        )

        with (
            patch.object(human_play._storage, "save_play", return_value="mock:play"),
            patch.object(human_play._storage, "delete_game_session"),
        ):
            doc, _ = session.submit()

        self.assertEqual(doc["behavior"]["events"], [])


class _RecordingPostgresCursor:
    def __init__(self, connection):
        self.connection = connection
        self.rowcount = 1
        self.last_sql = ""

    def __enter__(self):
        return self

    def __exit__(self, exc_type, exc, tb):
        return False

    def execute(self, sql, params=None):
        self.last_sql = sql
        self.connection.queries.append((sql, params))

    def fetchone(self):
        if "INSERT INTO plays" in self.last_sql:
            return (77,)
        # 실제 Postgres에서 COUNT(*)는 언제나 한 행을 돌려준다. 일반 플레이의
        # 회차(attempt_no) 계산이 이 경로를 타므로 더블도 같게 행동해야 한다.
        if "SELECT count(*)" in self.last_sql:
            return (0,)
        return None


class HttpEventPersistenceIntegrationTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.server = ThreadingHTTPServer(("127.0.0.1", 0), app.Handler)
        cls.thread = threading.Thread(target=cls.server.serve_forever, daemon=True)
        cls.thread.start()
        cls.port = cls.server.server_address[1]
        cls.user_patch = patch.object(
            app.Handler,
            "_current_user",
            lambda self: {
                "id": "http-event-test-user",
                "display_name": "http-event-tester",
                "role": "",
            },
        )
        cls.user_patch.start()

    @classmethod
    def tearDownClass(cls):
        cls.user_patch.stop()
        cls.server.shutdown()
        cls.server.server_close()
        cls.thread.join(timeout=2)

    def _call(self, method, path, body=None):
        conn = http.client.HTTPConnection("127.0.0.1", self.port, timeout=10)
        data = json.dumps(body).encode("utf-8") if body is not None else None
        headers = {"Content-Type": "application/json"} if data is not None else {}
        conn.request(method, path, body=data, headers=headers)
        response = conn.getresponse()
        raw = response.read()
        conn.close()
        return response.status, json.loads(raw.decode("utf-8")) if raw else {}

    def _start_session(self):
        status, body = self._call(
            "POST",
            "/api/game/session/start",
            {"scenario_id": "D1_1", "tier": "general"},
        )
        self.assertEqual(status, 200, body)
        self.assertTrue(body["ok"])
        return body["state"]["session_id"]

    def test_http_submit_writes_sanitized_events_to_file(self):
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            plays_dir = root / "human_plays"
            sessions_dir = root / "human_sessions"
            with (
                patch.object(storage, "ROOT", root),
                patch.object(storage, "PLAYS_DIR", plays_dir),
                patch.object(storage, "SESSIONS_DIR", sessions_dir),
            ):
                session_id = self._start_session()
                status, body = self._call(
                    "POST",
                    "/api/game/session/submit",
                    {
                        "session_id": session_id,
                        "session_telemetry": {"pointer_events": 4},
                        "events": [
                            {
                                "t": 123.9,
                                "type": "assign",
                                "crane": "C1",
                                "lift": "L1",
                                "nested": {"drop": True},
                            },
                            "invalid-event",
                        ],
                    },
                )

                self.assertEqual(status, 200, body)
                saved_path = root / body["path"]
                saved_doc = json.loads(saved_path.read_text(encoding="utf-8"))

        self.assertEqual(saved_doc["behavior"]["session"]["pointer_events"], 4)
        self.assertEqual(saved_doc["behavior"]["events"], [{
            "t": 123,
            "type": "assign",
            "crane": "C1",
            "lift": "L1",
        }])

    def test_http_submit_without_events_keeps_older_client_compatible(self):
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            with (
                patch.object(storage, "ROOT", root),
                patch.object(storage, "PLAYS_DIR", root / "human_plays"),
                patch.object(storage, "SESSIONS_DIR", root / "human_sessions"),
            ):
                session_id = self._start_session()
                status, body = self._call(
                    "POST",
                    "/api/game/session/submit",
                    {"session_id": session_id},
                )
                self.assertEqual(status, 200, body)
                saved_doc = json.loads(
                    (root / body["path"]).read_text(encoding="utf-8")
                )

        self.assertEqual(saved_doc["behavior"]["events"], [])

if __name__ == "__main__":
    unittest.main()
