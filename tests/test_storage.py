import unittest
import copy
import tempfile
from concurrent.futures import ThreadPoolExecutor
from datetime import datetime, timezone
from pathlib import Path
from unittest.mock import patch

from crane_db import storage


class UserScenarioValidationTests(unittest.TestCase):
    def test_zero_values_are_not_replaced_by_defaults(self):
        cfg = storage._validate_user_scenario_config({
            "setup_time": 0,
            "teardown_time": 0,
            "lift_weight_min_t": 0,
            "lift_weight_max_t": 0,
            "default_lift_weight_t": 0,
        })

        self.assertEqual(cfg["setup_time"], 0)
        self.assertEqual(cfg["teardown_time"], 0)
        self.assertEqual(cfg["lift_weight_min_t"], 0)
        self.assertEqual(cfg["lift_weight_max_t"], 0)
        self.assertEqual(cfg["default_lift_weight_t"], 0)

    def test_duplicate_lift_ids_are_rejected(self):
        with self.assertRaisesRegex(ValueError, "lift id must be unique"):
            storage._validate_user_scenario_layout({
                "cranes": [{"x": 10, "y": 10}],
                "lifts": [
                    {"id": "L1", "x": 20, "y": 20, "weight": 10},
                    {"id": "L1", "x": 30, "y": 30, "weight": 10},
                ],
                "restrictedZones": [],
            }, {"site_width": 100, "site_height": 100})

    def test_restricted_zone_must_fit_inside_site(self):
        with self.assertRaisesRegex(ValueError, "must stay inside"):
            storage._validate_user_scenario_layout({
                "cranes": [{"x": 10, "y": 10}],
                "lifts": [{"id": "L1", "x": 20, "y": 20, "weight": 10}],
                "restrictedZones": [{"x": 90, "y": 90, "w": 20, "h": 20}],
            }, {"site_width": 100, "site_height": 100})


class SummaryTests(unittest.TestCase):
    def test_even_score_count_uses_statistical_median(self):
        plays = [
            {
                "scenario_id": "S1", "tier": "general", "totalScore": 10,
                "makespan": 20, "done": 1, "total": 1, "grade": "C",
                "submitted_at": "2026-01-01T00:00:00Z",
            },
            {
                "scenario_id": "S1", "tier": "general", "totalScore": 20,
                "makespan": 10, "done": 1, "total": 1, "grade": "B",
                "submitted_at": "2026-01-02T00:00:00Z",
            },
        ]
        with (
            patch.object(storage, "list_plays", return_value=plays),
        ):
            summary = storage.summary_by_scenario()

        self.assertEqual(summary[0]["score_median"], 15)


class FileStorageConcurrencyTests(unittest.TestCase):
    def test_concurrent_play_saves_use_unique_files(self):
        base_doc = {
            "meta": {
                "scenario_id": "S1",
                "tier": "general",
                "nickname": "tester",
                "role": "",
            },
            "outcome": {},
            "scorer_snapshot": {},
        }
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            plays = root / "human_plays"
            with (
                patch.object(storage, "ROOT", root),
                patch.object(storage, "PLAYS_DIR", plays),
            ):
                with ThreadPoolExecutor(max_workers=8) as pool:
                    refs = list(pool.map(
                        lambda _: storage.save_play(copy.deepcopy(base_doc)),
                        range(24),
                    ))

            self.assertEqual(len(refs), len(set(refs)))
            self.assertEqual(len(list(plays.rglob("*.json"))), 24)


class _FakeCursor:
    def __init__(self, conn):
        self.conn = conn
        self.rows = []

    def __enter__(self):
        return self

    def __exit__(self, exc_type, exc, tb):
        return False

    def execute(self, sql, params=None):
        self.conn.queries.append(sql)
        if "FROM plays" in sql:
            self.rows = [
                (1, "S1", "general", "tester", datetime.now(timezone.utc), 88.5, "A"),
            ]
        else:
            self.rows = []

    def fetchall(self):
        return self.rows


class _FakeConnection:
    def __init__(self):
        self.queries = []

    def cursor(self):
        return _FakeCursor(self)


class _FakePlayDocCursor:
    """Cursor that serves `SELECT id, doc FROM plays WHERE id = ANY(...)`."""

    def __init__(self, conn):
        self.conn = conn
        self.rows = []

    def __enter__(self):
        return self

    def __exit__(self, exc_type, exc, tb):
        return False

    def execute(self, sql, params=None):
        self.conn.queries.append((sql, params))
        if "SELECT id, doc FROM plays" in sql:
            wanted = set(params[0])
            self.rows = [
                (pid, {"meta": {"play_id": pid}})
                for pid in self.conn.available
                if pid in wanted
            ]
        else:
            self.rows = []

    def fetchall(self):
        return self.rows


class LoadPlaysBatchTests(unittest.TestCase):
    """Regression: the IRL fit loaded every play with its own round trip.

    829 research plays x one `SELECT doc FROM plays WHERE id = %s` each measured
    159 s of pure network wait against the remote pooler, which is most of why
    the dashboard's re-estimation request never returned a response.
    """

    def test_file_refs_still_resolve_and_stay_sandboxed(self):
        with tempfile.TemporaryDirectory() as tmp:
            plays_dir = Path(tmp) / "human_plays" / "S1" / "standard"
            plays_dir.mkdir(parents=True)
            play_file = plays_dir / "p1.json"
            play_file.write_text('{"meta": {"scenario_id": "S1"}}', encoding="utf-8")
            rel = play_file.relative_to(tmp).as_posix()

            with patch.object(storage, "ROOT", Path(tmp)), \
                 patch.object(storage, "PLAYS_DIR", Path(tmp) / "human_plays"):
                docs = storage.load_plays([rel, "../outside.json"])

            self.assertEqual(docs[rel], {"meta": {"scenario_id": "S1"}})
            self.assertIsNone(docs["../outside.json"])


if __name__ == "__main__":
    unittest.main()
