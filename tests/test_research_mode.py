import base64
import copy
import json
import tempfile
import unittest
from pathlib import Path
from unittest.mock import patch

from crane_core.scenarios import SCENARIOS
from crane_db import storage
from crane_web.research import SCENARIO_SEQUENCE, STUDY_CONFIG, public_study_config

def make_signature_png(width: int = 240, height: int = 80) -> str:
    """검증을 통과하는 자필 서명 data URL을 만든다.

    캔버스가 만드는 것과 같은 PNG data URL이어야 한다 — 서버가 PNG 매직 넘버를
    확인하고(_normalize_research_signature) 빈 캔버스와 구분하려고 최소 길이를
    보므로, 상수 문자열 대신 실제로 압축되지 않는 픽셀을 그려 넣는다.
    """
    import struct
    import zlib

    rows = b"".join(
        b"\x00" + bytes((x * 7 + y * 13 + (x * y) % 11) % 256 for x in range(width * 3))
        for y in range(height)
    )

    def chunk(tag: bytes, data: bytes) -> bytes:
        return (
            struct.pack(">I", len(data))
            + tag
            + data
            + struct.pack(">I", zlib.crc32(tag + data) & 0xFFFFFFFF)
        )

    png = (
        b"\x89PNG\r\n\x1a\n"
        + chunk(b"IHDR", struct.pack(">IIBBBBB", width, height, 8, 2, 0, 0, 0))
        + chunk(b"IDAT", zlib.compress(rows, 6))
        + chunk(b"IEND", b"")
    )
    return "data:image/png;base64," + base64.b64encode(png).decode("ascii")


SIGNATURE = make_signature_png()
_RESEARCH_SIGNATURE_PREFIX = "data:image/png;base64,"

PROFILE = {
    "full_name": "홍길동",
    "signature": SIGNATURE,
    "university": "인천대학교",
    "college": "도시과학대학",
    "department": "도시건축학부",
    "student_number": "202012345",
    "grade": "3학년",
    "phone": "010-1234-5678",
    "email": "participant@example.com",
    "age_confirmed": True,
    "research_consent": True,
    "privacy_consent": True,
    "overseas_transfer_consent": True,
    "open_data_consent": False,
}


class ResearchStudyContractTests(unittest.TestCase):
    def test_frozen_sequence_matches_every_builtin_scenario_once(self):
        self.assertEqual(len(SCENARIO_SEQUENCE), len(set(SCENARIO_SEQUENCE)))
        self.assertEqual(set(SCENARIO_SEQUENCE), set(SCENARIOS))
        cfg = public_study_config()
        self.assertIn("만 19세 이상", cfg["eligibility"])
        self.assertEqual(cfg["retention_period"], "연구 종료 후 1년 뒤 파기")
        self.assertEqual(cfg["consent_status"], "approved")
        for key in ("records_access", "irb_notice"):
            with self.subTest(key=key):
                self.assertNotIn("IRB", cfg[key])
        # 목표 인원은 연구 운영 항목이라 참여자 응답에 실리지 않는다.
        # 화면에서만 감추면 개발자도구로 그대로 보이므로 payload에서 제외한다.
        self.assertNotIn("target_participants", cfg)
        self.assertEqual(STUDY_CONFIG["target_participants"], "총 30명")

class ResearchFileStorageTests(unittest.TestCase):
    def setUp(self):
        self.tmp = tempfile.TemporaryDirectory()
        root = Path(self.tmp.name)
        auth = root / "auth_data"
        self.plays = root / "human_plays"
        self.patchers = [
            patch.object(storage, "ROOT", root),
            patch.object(storage, "AUTH_DIR", auth),
            patch.object(storage, "PLAYS_DIR", self.plays),
            patch.object(storage, "RESEARCH_PARTICIPATIONS_PATH", auth / "research_participations.json"),
            patch.object(storage, "RESEARCH_PROGRESS_PATH", auth / "research_progress.json"),
        ]
        for item in self.patchers:
            item.start()
        self.user_id = "a511e06e-8e66-448d-9cb2-381dcf42e4c2"

    def tearDown(self):
        for item in reversed(self.patchers):
            item.stop()
        self.tmp.cleanup()

    def _register(self):
        return storage.upsert_research_participation(self.user_id, PROFILE)

    def _play_doc(self, context, scenario_id, done, total):
        return {
            "meta": {
                "scenario_id": scenario_id,
                "tier": "general",
                "nickname": "researcher",
                "role": "대학생·3학년",
                "user_id": self.user_id,
                **context,
            },
            "outcome": {"done": done, "total": total, "makespan": 10},
            "scorer_snapshot": {"totalScore": 80, "grade": "B"},
        }

    def test_registration_is_separate_and_locked_progress_is_server_validated(self):
        status = self._register()
        self.assertTrue(status["participation"]["active"])
        profile = status["participation"]["profile"]
        self.assertEqual(profile["full_name"], "홍길동")
        self.assertEqual(profile["student_number"], "202012345")
        self.assertEqual(profile["phone"], "010-1234-5678")
        self.assertFalse(status["participation"]["open_data_consent"])

        first = SCENARIO_SEQUENCE[0]
        context = storage.resolve_research_session(self.user_id, first)
        self.assertEqual(context["play_purpose"], "research")
        self.assertEqual(context["scenario_order"], 0)
        with self.assertRaisesRegex(ValueError, "앞 단계"):
            storage.resolve_research_session(self.user_id, SCENARIO_SEQUENCE[1])

    def test_only_full_submitted_play_unlocks_and_every_attempt_is_saved(self):
        self._register()
        first, second = SCENARIO_SEQUENCE[:2]
        context = storage.resolve_research_session(self.user_id, first)

        partial_ref = storage.save_play(self._play_doc(context, first, 1, 2))
        after_partial = storage.get_research_status(self.user_id)
        self.assertEqual(after_partial["progress"]["unlocked_index"], 0)

        full_doc = self._play_doc(context, first, 2, 2)
        full_ref = storage.save_play(full_doc)
        after_full = storage.get_research_status(self.user_id)
        self.assertEqual(after_full["progress"]["unlocked_index"], 1)
        self.assertIn(first, after_full["progress"]["completed_scenarios"])
        self.assertEqual(storage.resolve_research_session(self.user_id, second)["scenario_order"], 1)

        self.assertNotEqual(partial_ref, full_ref)
        self.assertEqual(len(list(self.plays.rglob("*.json"))), 2)
        saved = json.loads((storage.ROOT / full_ref).read_text(encoding="utf-8"))
        self.assertEqual(saved["meta"]["play_purpose"], "research")
        self.assertEqual(saved["meta"]["attempt_no"], 2)
        for pii_key in ("display_name", "email"):
            self.assertNotIn(pii_key, saved["meta"])
        self.assertEqual(saved["meta"]["role_kind"], "student")
        self.assertEqual(saved["meta"]["role_grade"], "3학년")

    def _general_play_doc(self, scenario_id, done=2, total=2):
        return {
            "meta": {
                "scenario_id": scenario_id,
                "tier": "general",
                "nickname": "researcher",
                "role": "대학생·3학년",
                "user_id": self.user_id,
                "play_purpose": "general",
            },
            "outcome": {"done": done, "total": total, "makespan": 10},
            "scorer_snapshot": {"totalScore": 80, "grade": "B"},
        }

    def _saved_meta(self, ref):
        return json.loads((storage.ROOT / ref).read_text(encoding="utf-8"))["meta"]

    def test_general_and_research_attempt_counters_are_independent(self):
        """같은 사용자가 같은 시나리오를 두 목적으로 풀면 회차가 각각 매겨진다.

        일반 플레이를 아무리 반복해도 실험 회차는 오르지 않아야 하고, 그 반대도
        같아야 한다. 두 카운터가 섞이면 반복 학습 효과 분석이 오염된다."""
        self._register()
        first = SCENARIO_SEQUENCE[0]

        # 일반 플레이 2회 — 자체 회차 1, 2
        g1 = self._saved_meta(storage.save_play(self._general_play_doc(first)))
        g2 = self._saved_meta(storage.save_play(self._general_play_doc(first)))
        self.assertEqual((g1["play_purpose"], g1["attempt_no"]), ("general", 1))
        self.assertEqual((g2["play_purpose"], g2["attempt_no"]), ("general", 2))

        # 연구 플레이 — 일반 2회는 무시하고 1부터 시작해야 한다
        ctx = storage.resolve_research_session(self.user_id, first)
        r1 = self._saved_meta(storage.save_play(self._play_doc(ctx, first, 1, 2)))
        self.assertEqual((r1["play_purpose"], r1["attempt_no"]), ("research", 1))

        # 연구 플레이 이후의 일반 플레이는 3이어야 한다 (연구가 끼어들지 않음)
        g3 = self._saved_meta(storage.save_play(self._general_play_doc(first)))
        self.assertEqual(g3["attempt_no"], 3)

        # 두 번째 연구 플레이도 일반 3회와 무관하게 2
        r2 = self._saved_meta(storage.save_play(self._play_doc(ctx, first, 1, 2)))
        self.assertEqual(r2["attempt_no"], 2)

    def test_general_attempt_counter_is_per_scenario(self):
        """회차는 시나리오별로 독립이다 — 다른 시나리오를 푼다고 오르지 않는다."""
        first, second = SCENARIO_SEQUENCE[:2]
        a = self._saved_meta(storage.save_play(self._general_play_doc(first)))
        b = self._saved_meta(storage.save_play(self._general_play_doc(second)))
        c = self._saved_meta(storage.save_play(self._general_play_doc(first)))
        self.assertEqual(a["attempt_no"], 1)
        self.assertEqual(b["attempt_no"], 1)
        self.assertEqual(c["attempt_no"], 2)

    def test_withdrawal_blocks_future_research_sessions_but_keeps_plays(self):
        self._register()
        first = SCENARIO_SEQUENCE[0]
        context = storage.resolve_research_session(self.user_id, first)
        storage.save_play(self._play_doc(context, first, 1, 2))
        storage.withdraw_research_participation(self.user_id)

        with self.assertRaisesRegex(ValueError, "동의"):
            storage.resolve_research_session(self.user_id, first)
        self.assertEqual(len(list(self.plays.rglob("*.json"))), 1)

    def test_admin_participant_listing_joins_progress_and_play_counts(self):
        """관리자 참여자 목록은 PII + 진행도 + 실제 제출 건수를 함께 준다.

        동의만 하고 한 판도 안 푼 참여자를 관리자가 구분할 수 있어야 하고,
        철회한 참여자도 목록에서 사라지면 안 된다 (제출 데이터는 남으므로)."""
        self._register()
        first = SCENARIO_SEQUENCE[0]
        context = storage.resolve_research_session(self.user_id, first)
        storage.save_play(self._play_doc(context, first, 2, 2))
        # 일반 플레이는 실험 제출 건수에 포함되면 안 된다.
        storage.save_play(self._general_play_doc(first))

        rows = storage.admin_research_participants()
        self.assertEqual(len(rows), 1)
        row = rows[0]
        self.assertEqual(row["full_name"], "홍길동")
        self.assertEqual(row["student_number"], "202012345")
        self.assertEqual(row["phone"], "010-1234-5678")
        self.assertEqual(row["email"], "participant@example.com")
        self.assertTrue(row["active"])
        self.assertEqual(row["play_count"], 1, "research 플레이만 센다")
        self.assertEqual(row["completed_count"], 1)
        self.assertEqual(row["total_count"], len(SCENARIO_SEQUENCE))

        # 검색은 이름·학번·소속·전화·이메일을 훑는다.
        self.assertEqual(len(storage.admin_research_participants(search="202012345")), 1)
        self.assertEqual(len(storage.admin_research_participants(search="인천대")), 1)
        self.assertEqual(len(storage.admin_research_participants(search="없는사람")), 0)

        # 철회해도 목록에는 남되 상태만 바뀐다.
        storage.withdraw_research_participation(self.user_id)
        withdrawn = storage.admin_research_participants()
        self.assertEqual(len(withdrawn), 1)
        self.assertFalse(withdrawn[0]["active"])

    def test_signature_is_validated_as_a_png_data_url(self):
        """서명은 캔버스가 만든 PNG data URL만 받는다.

        이 컬럼은 API를 직접 호출해도 채울 수 있으므로, 클라이언트 검증만 믿지
        않고 형식(PNG 매직 넘버)·크기 상한·빈 캔버스 하한을 서버가 강제한다."""
        cases = {
            "": "서명해",
            "   ": "서명해",
            "not-a-data-url": "형식",
            # data URL 껍데기만 맞고 내용이 PNG가 아닌 경우
            "data:image/png;base64," + base64.b64encode(b"x" * 2000).decode(): "형식",
            # base64로 디코딩되지 않는 문자열
            "data:image/png;base64,!!!not-base64!!!": "형식",
            # JPEG를 PNG로 위장 (매직 넘버 불일치)
            "data:image/jpeg;base64," + base64.b64encode(b"\xff\xd8\xff" * 400).decode(): "형식",
        }
        for raw, expected in cases.items():
            bad = copy.deepcopy(PROFILE)
            bad["signature"] = raw
            with self.subTest(signature=raw[:32]):
                with self.assertRaises(ValueError) as ctx:
                    storage.upsert_research_participation(self.user_id, bad)
                self.assertIn(expected, str(ctx.exception))

        # 빈 캔버스는 PNG로 인코딩해도 수백 바이트로 압축된다 — 그리지 않고
        # 제출한 경우를 서버에서도 걸러야 한다.
        blank = make_signature_png(4, 4)
        self.assertLess(len(blank), storage._RESEARCH_SIGNATURE_MIN)
        bad = copy.deepcopy(PROFILE)
        bad["signature"] = blank
        with self.assertRaisesRegex(ValueError, "비어"):
            storage.upsert_research_participation(self.user_id, bad)

        # 상한 초과 — 디코딩 전에 길이로 끊으므로 내용이 PNG인지와 무관하게
        # 거부된다 (거대 페이로드를 풀어보지 않는 것이 이 검사의 목적).
        bad["signature"] = _RESEARCH_SIGNATURE_PREFIX + "A" * (
            storage._RESEARCH_SIGNATURE_MAX + 1
        )
        with self.assertRaisesRegex(ValueError, "너무 큽니다"):
            storage.upsert_research_participation(self.user_id, bad)

    def test_signature_is_stored_but_never_returned_to_the_participant(self):
        """서명은 저장하되 참여 상태 응답에는 싣지 않는다.

        상태 조회는 페이지 로드마다 도는 경로라 수 KB를 매번 실어 보낼 이유가
        없고, 재동의 때 이전 서명을 프리필하면 동의 취득 절차가 아니게 된다.
        관리자만 participant_id로 한 건씩 가져온다."""
        status = self._register()
        participation = status["participation"]
        self.assertTrue(participation["has_signature"])
        self.assertNotIn("signature", participation)
        self.assertNotIn("signature", participation["profile"])

        participant_id = participation["participant_id"]
        self.assertEqual(storage.get_research_signature(participant_id), SIGNATURE)
        self.assertIsNone(storage.get_research_signature("없는-participant-id"))
        self.assertIsNone(storage.get_research_signature(""))

        # 관리자 목록도 여부만 준다 — 원본은 별도 조회로만.
        row = storage.admin_research_participants()[0]
        self.assertTrue(row["has_signature"])
        self.assertNotIn("signature", row)

    def _register_without_signature(self):
        """서명란이 생기기 전에 동의한 참여자를 재현한다."""
        self._register()
        with storage._research_file_lock:
            rows = storage._read_auth_file(storage.RESEARCH_PARTICIPATIONS_PATH, {})
            for key, row in rows.items():
                row["signature"] = ""
                rows[key] = row
            storage._write_auth_file(storage.RESEARCH_PARTICIPATIONS_PATH, rows)

    def test_signature_can_be_topped_up_without_reconsenting(self):
        """서명란이 생기기 전에 동의한 참여자는 서명만 보충받는다.

        consent_version을 올려 재동의를 요구하면 진행 중인 참여자가 전부
        비활성화되어 실험이 멈춘다. 나머지 동의 내용은 그대로 두고 서명만
        채우는 경로가 필요한 이유다."""
        self._register_without_signature()
        status = storage.get_research_status(self.user_id)
        self.assertTrue(status["participation"]["active"], "동의는 그대로 유효하다")
        self.assertFalse(status["participation"]["has_signature"])

        after = storage.update_research_signature(self.user_id, SIGNATURE)
        self.assertTrue(after["participation"]["has_signature"])
        participant_id = after["participation"]["participant_id"]
        self.assertEqual(storage.get_research_signature(participant_id), SIGNATURE)
        # 재동의가 아니므로 참여 정보와 진행도는 보존된다.
        self.assertEqual(after["participation"]["consented_at"],
                         status["participation"]["consented_at"])
        self.assertEqual(after["progress"]["unlocked_index"],
                         status["progress"]["unlocked_index"])

        # 두 번째 호출은 기존 서명을 덮어쓰지 않는다 — 서명은 한 번만 받는다.
        other = make_signature_png(200, 60)
        self.assertNotEqual(other, SIGNATURE)
        storage.update_research_signature(self.user_id, other)
        self.assertEqual(storage.get_research_signature(participant_id), SIGNATURE)

        # 형식 검증은 최초 등록과 같은 규칙을 쓴다.
        self._register_without_signature()
        with self.assertRaisesRegex(ValueError, "형식"):
            storage.update_research_signature(self.user_id, "not-a-png")

    def test_signature_topup_requires_an_active_participation(self):
        with self.assertRaisesRegex(ValueError, "동의"):
            storage.update_research_signature(self.user_id, SIGNATURE)
        self._register_without_signature()
        storage.withdraw_research_participation(self.user_id)
        with self.assertRaisesRegex(ValueError, "동의"):
            storage.update_research_signature(self.user_id, SIGNATURE)

    def test_submission_is_recorded_only_after_every_scenario_is_complete(self):
        """'실험 데이터 제출'은 데이터가 아니라 참여자의 의사를 기록한다.

        끝까지 풀었지만 제출하지 않은 사람과 제출을 마친 사람을 연구자가
        구분할 수 있어야 하므로 completed_count로는 대체되지 않는다."""
        self._register()
        status = storage.get_research_status(self.user_id)
        self.assertIsNone(status["participation"]["submitted_at"])

        # 아직 다 풀지 않았으면 거부한다.
        with self.assertRaisesRegex(ValueError, "완료한 뒤"):
            storage.mark_research_submitted(self.user_id)

        # 전 시나리오를 완료시킨다.
        for scenario_id in SCENARIO_SEQUENCE:
            context = storage.resolve_research_session(self.user_id, scenario_id)
            storage.save_play(self._play_doc(context, scenario_id, 2, 2))
        done = storage.get_research_status(self.user_id)
        self.assertEqual(done["progress"]["completed_count"], len(SCENARIO_SEQUENCE))

        after = storage.mark_research_submitted(self.user_id)
        first = after["participation"]["submitted_at"]
        self.assertTrue(first)

        # 다시 눌러도 최초 시각을 보존한다.
        again = storage.mark_research_submitted(self.user_id)
        self.assertEqual(again["participation"]["submitted_at"], first)

        # 관리자 목록에서 제출자를 가려낼 수 있다.
        row = storage.admin_research_participants()[0]
        self.assertEqual(row["submitted_at"], first)

    def test_required_consents_and_profile_fields_are_validated(self):
        required = (
            "full_name", "signature", "university", "college", "department",
            "student_number", "grade", "phone", "email", "age_confirmed",
            "research_consent", "privacy_consent", "overseas_transfer_consent",
        )
        for key in required:
            bad = copy.deepcopy(PROFILE)
            bad[key] = False if key.endswith(("confirmed", "consent")) else ""
            with self.subTest(key=key), self.assertRaises(ValueError):
                storage.upsert_research_participation(self.user_id, bad)

    def test_phone_is_normalised_to_the_hyphenated_form(self):
        """클라이언트가 자동 하이픈을 넣지만 API 직접 호출도 있으므로
        서버가 같은 규칙으로 정규화하고, 자릿수가 안 맞으면 거부해야 한다."""
        cases = {
            "01012345678": "010-1234-5678",
            "010 1234 5678": "010-1234-5678",
            "0311234567": "031-123-4567",
            # 서울(02)은 지역번호가 두 자리다. 서버가 3자리로 끊으면
            # 클라이언트가 만든 '02-1234-5678'이 '021-234-5678'로 조용히
            # 변조되어 저장되고, '02-123-4567'은 거부된다.
            "02-1234-5678": "02-1234-5678",
            "0212345678": "02-1234-5678",
            "02-123-4567": "02-123-4567",
            "021234567": "02-123-4567",
        }
        for raw, expected in cases.items():
            with self.subTest(raw=raw):
                status = storage.upsert_research_participation(
                    self.user_id, dict(PROFILE, phone=raw)
                )
                self.assertEqual(
                    status["participation"]["profile"]["phone"], expected
                )
        for bad in ("0101234", "abc-defg-hijk"):
            with self.subTest(bad=bad), self.assertRaises(ValueError):
                storage.upsert_research_participation(
                    self.user_id, dict(PROFILE, phone=bad)
                )

    def test_grade_must_come_from_the_fixed_list(self):
        with self.assertRaises(ValueError):
            storage.upsert_research_participation(
                self.user_id, dict(PROFILE, grade="6학년")
            )

    def test_open_data_consent_is_optional_and_recorded(self):
        status = self._register()
        self.assertFalse(status["participation"]["open_data_consent"])
        payload = dict(PROFILE, open_data_consent=True)
        status = storage.upsert_research_participation(self.user_id, payload)
        self.assertTrue(status["participation"]["open_data_consent"])

    def test_consent_version_change_invalidates_old_active_participation(self):
        self._register()
        key = f"{self.user_id}|crane-scheduling-study|v1"
        rows = json.loads(storage.RESEARCH_PARTICIPATIONS_PATH.read_text(encoding="utf-8"))
        rows[key]["consent_version"] = "superseded-draft"
        storage.RESEARCH_PARTICIPATIONS_PATH.write_text(
            json.dumps(rows, ensure_ascii=False), encoding="utf-8"
        )
        self.assertFalse(storage.get_research_status(self.user_id)["participation"]["active"])


if __name__ == "__main__":
    unittest.main()
