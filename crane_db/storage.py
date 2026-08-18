"""File-backed storage for plays, sessions, auth and IRL artifacts.

Everything lives on local disk under the repo root — `human_plays/`,
`human_sessions/`, `human_preferences/`, `irl_priors/` and `auth_data/`.
There is no remote database and no network call anywhere in this module;
this build is local-only by construction.

External callers use the module-level functions and never see pathlib
directly. References returned by save_* / accepted by load_* are opaque
strings: the path of the JSON file relative to the repo root.

list_* returns summary dicts (keys include ``path`` for backward compat).
"""
from __future__ import annotations

import base64
import json
import hashlib
from contextlib import contextmanager, nullcontext
import os
import re
import secrets
import threading
import time
import uuid
from datetime import datetime, timedelta
from pathlib import Path
from typing import Any, Dict, Iterable, List, Optional


ROOT = Path(__file__).resolve().parent.parent
PLAYS_DIR = ROOT / "human_plays"
PREFERENCES_DIR = ROOT / "human_preferences"
SESSIONS_DIR = ROOT / "human_sessions"
IRL_DIR = ROOT / "irl_priors"
AUTH_DIR = ROOT / "auth_data"
AUTH_USERS_PATH = AUTH_DIR / "users.json"
AUTH_SESSIONS_PATH = AUTH_DIR / "sessions.json"
RESEARCH_PARTICIPATIONS_PATH = AUTH_DIR / "research_participations.json"
RESEARCH_PROGRESS_PATH = AUTH_DIR / "research_progress.json"

AUTH_SESSION_DAYS = int(os.environ.get("CRANE_AUTH_SESSION_DAYS", "30") or 30)

IRL_KIND_PRIOR = "prior"
IRL_KIND_CROSS_VALIDATE = "cross_validate"
IRL_KIND_AB_REPORT = "ab_report"
IRL_VALID_KINDS = (IRL_KIND_PRIOR, IRL_KIND_CROSS_VALIDATE, IRL_KIND_AB_REPORT)

# User-created scenarios. Cross-user sharing needs a shared server-side
# database, which this local-only build does not have — the API surface stays
# so the UI can render a clear "unavailable locally" message.
USER_SCEN_ID_PREFIX = "usr_"
USER_SCEN_SHARE_PREFIX = "shr_"
USER_SCEN_VISIBILITY_PUBLIC = "public"
USER_SCEN_VISIBILITY_PRIVATE = "private"
USER_SCEN_VALID_VISIBILITY = (USER_SCEN_VISIBILITY_PRIVATE, USER_SCEN_VISIBILITY_PUBLIC)
USER_SCEN_VALID_TIERS = ("tutorial", "standard", "expert", "custom")
USER_SCEN_PER_USER_LIMIT = 50
USER_SCEN_NAME_MAX = 80
USER_SCEN_DESC_MAX = 500
USER_SCEN_MAX_CRANES = 10
USER_SCEN_MAX_LIFTS = 100
USER_SCEN_MAX_RESTRICTED = 20

# File-mode artifact name → kind inference
_FILE_KIND_PREFIXES = {
    "irl_prior_": IRL_KIND_PRIOR,
    "cross_validate_": IRL_KIND_CROSS_VALIDATE,
    "ab_report_": IRL_KIND_AB_REPORT,
}

_auth_file_lock = threading.Lock()
_research_file_lock = threading.RLock()
# 표시이름에서 제거할 문자. `가-힣`은 완성형 음절만 덮으므로 호환 자모
# `ㄱ-ㅣ`(U+3131–U+3163)를 함께 허용해야 'ㄷㅎ'·'ㅋㅋ' 같은 표시 ID가 통째로
# 지워져 fallback으로 떨어지지 않는다. game_irl.human_play._NICK_CHARS와 동일.
_NICK_RE = re.compile(r"[^A-Za-z0-9가-힣ㄱ-ㅣ_-]")
_EMAIL_RE = re.compile(r"^[^@\s]+@[^@\s]+\.[^@\s]+$")
_PBKDF2_ITERATIONS = 260_000

# Role categories — frontend sends a composed string like
#   '일반인' | '대학생·3학년' | '대학생·석사' | '전문가·10년차'
# We persist both the raw string (for display) and structured columns for
# direct SQL aggregation. Anything that doesn't match the documented format
# (e.g. legacy free-text 'ex) 양중계획 8년차') is stored as role_kind='other'
# with grade/years NULL, so old rows still group cleanly.
ROLE_KIND_GENERAL = "general"
ROLE_KIND_STUDENT = "student"
ROLE_KIND_EXPERT  = "expert"
ROLE_KIND_OTHER   = "other"
_ROLE_EXPERT_YEARS_RE = re.compile(r"전문가·(\d{1,3})년차")
_ROLE_STUDENT_GRADE_RE = re.compile(r"대학생·(.+)$")


def _parse_role(role):
    """Return (kind, grade, years) parsed from the composed role string.
    None inputs / empty strings → (None, None, None) so the columns stay
    NULL rather than carrying a misleading 'other' classification."""
    text = str(role or "").strip()
    if not text:
        return (None, None, None)
    if text in ("해당 사항 없음", "일반인"):  # '일반인' kept for legacy accounts
        return (ROLE_KIND_GENERAL, None, None)
    m = _ROLE_STUDENT_GRADE_RE.match(text)
    if m:
        grade = m.group(1).strip()[:32] or None
        return (ROLE_KIND_STUDENT, grade, None)
    m = _ROLE_EXPERT_YEARS_RE.match(text)
    if m:
        try:
            years = max(0, min(60, int(m.group(1))))
        except ValueError:
            years = None
        return (ROLE_KIND_EXPERT, None, years)
    return (ROLE_KIND_OTHER, None, None)


def storage_kind() -> str:
    """Always 'file'. This build has no remote database."""
    return "file"


def _safe_segment(value: str, fallback: str = "unknown") -> str:
    """Filesystem-safe folder/name segment."""
    if not value:
        return fallback
    cleaned = _NICK_RE.sub("", str(value))
    return cleaned[:48] or fallback


# ----------------------------------------------------------------------
# Postgres connection

MIGRATIONS_DIR = Path(__file__).resolve().parent / "migrations"
# Arbitrary fixed key so concurrent app instances (e.g. rolling deploys)
# serialize migration runs and don't race the same DDL.
_MIGRATION_LOCK_KEY = 8123542109


# ----------------------------------------------------------------------
# Auth users + sessions

def _normalize_email(email: str) -> str:
    email = str(email or "").strip().lower()
    if not _EMAIL_RE.match(email):
        raise ValueError("올바른 이메일 주소를 입력하세요. 예: user@example.com")
    return email


def _display_name(raw: str, fallback: str = "user") -> str:
    cleaned = _safe_segment(str(raw or "").strip(), fallback=fallback)
    return cleaned[:24] or fallback


def _hash_password(password: str) -> str:
    if len(str(password or "")) < 6:
        raise ValueError("password must be at least 6 characters")
    salt = secrets.token_bytes(16)
    digest = hashlib.pbkdf2_hmac("sha256", password.encode("utf-8"), salt, _PBKDF2_ITERATIONS)
    return f"pbkdf2_sha256${_PBKDF2_ITERATIONS}${salt.hex()}${digest.hex()}"


def _verify_password(password: str, encoded: str) -> bool:
    try:
        alg, iter_s, salt_hex, digest_hex = str(encoded or "").split("$", 3)
        if alg != "pbkdf2_sha256":
            return False
        digest = hashlib.pbkdf2_hmac(
            "sha256",
            str(password or "").encode("utf-8"),
            bytes.fromhex(salt_hex),
            int(iter_s),
        )
        return secrets.compare_digest(digest.hex(), digest_hex)
    except Exception:
        return False


def _public_user(row_or_doc: Any) -> Dict:
    if isinstance(row_or_doc, dict):
        created = row_or_doc.get("created_at")
        role = row_or_doc.get("role") or ""
        # Prefer pre-parsed structured fields when present (DB row uses
        # _public_user via the tuple branch; file-fallback dicts go here).
        kind  = row_or_doc.get("role_kind")
        grade = row_or_doc.get("role_grade")
        years = row_or_doc.get("role_years")
        if kind is None and grade is None and years is None:
            kind, grade, years = _parse_role(role)
        return {
            "id": str(row_or_doc.get("id") or ""),
            "email": row_or_doc.get("email") or "",
            "display_name": row_or_doc.get("display_name") or "user",
            "role": role,
            "role_kind": kind,
            "role_grade": grade,
            "role_years": years,
            "created_at": created.isoformat() if isinstance(created, datetime) else created,
        }
    # Tuple form — produced by SELECT id, email, display_name, role, created_at[, role_kind, role_grade, role_years]
    if len(row_or_doc) >= 8:
        uid, email, display_name, role, created_at, kind, grade, years = row_or_doc[:8]
    else:
        uid, email, display_name, role, created_at = row_or_doc
        kind, grade, years = _parse_role(role)
    return {
        "id": str(uid),
        "email": email,
        "display_name": display_name,
        "role": role or "",
        "role_kind": kind,
        "role_grade": grade,
        "role_years": years,
        "created_at": created_at.isoformat() if isinstance(created_at, datetime) else created_at,
    }


def _read_auth_file(path: Path, fallback: Any) -> Any:
    try:
        if not path.exists():
            return fallback
        return json.loads(path.read_text(encoding="utf-8"))
    except Exception:
        return fallback


def _write_auth_file(path: Path, data: Any):
    AUTH_DIR.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(data, ensure_ascii=False, indent=2), encoding="utf-8")


def _token_hash(token: str) -> str:
    return hashlib.sha256(str(token or "").encode("utf-8")).hexdigest()


def create_user(email: str, password: str, display_name: str = "", role: str = "") -> Dict:
    email_n = _normalize_email(email)
    name = _display_name(display_name, fallback=email_n.split("@", 1)[0])
    role_s = str(role or "")[:80]
    role_kind, role_grade, role_years = _parse_role(role_s)
    password_hash = _hash_password(password)
    user_id = str(uuid.uuid4())
    with _auth_file_lock:
        users = _read_auth_file(AUTH_USERS_PATH, [])
        if any(str(u.get("email", "")).lower() == email_n for u in users):
            raise ValueError("이미 가입된 이메일입니다")
        doc = {
            "id": user_id,
            "email": email_n,
            "display_name": name,
            "role": role_s,
            "role_kind": role_kind,
            "role_grade": role_grade,
            "role_years": role_years,
            "password_hash": password_hash,
            "created_at": datetime.utcnow().isoformat(),
            "last_login_at": None,
        }
        users.append(doc)
        _write_auth_file(AUTH_USERS_PATH, users)
        return _public_user(doc)


def authenticate_user(email: str, password: str) -> Optional[Dict]:
    email_n = _normalize_email(email)
    with _auth_file_lock:
        users = _read_auth_file(AUTH_USERS_PATH, [])
        for u in users:
            if str(u.get("email", "")).lower() == email_n and _verify_password(password, u.get("password_hash", "")):
                u["last_login_at"] = datetime.utcnow().isoformat()
                _write_auth_file(AUTH_USERS_PATH, users)
                return _public_user(u)
    return None


def create_auth_session(user_id: str) -> str:
    token = secrets.token_urlsafe(32)
    token_h = _token_hash(token)
    expires_at = datetime.utcnow() + timedelta(days=max(1, AUTH_SESSION_DAYS))
    with _auth_file_lock:
        sessions = _read_auth_file(AUTH_SESSIONS_PATH, {})
        now = time.time()
        sessions = {k: v for k, v in sessions.items() if float(v.get("expires_at", 0) or 0) > now}
        sessions[token_h] = {"user_id": user_id, "created_at": now, "expires_at": expires_at.timestamp()}
        _write_auth_file(AUTH_SESSIONS_PATH, sessions)
    return token


def load_auth_session(token: str) -> Optional[Dict]:
    if not token:
        return None
    token_h = _token_hash(token)
    with _auth_file_lock:
        sessions = _read_auth_file(AUTH_SESSIONS_PATH, {})
        sess = sessions.get(token_h)
        if not sess or float(sess.get("expires_at", 0) or 0) <= time.time():
            return None
        users = _read_auth_file(AUTH_USERS_PATH, [])
        for u in users:
            if str(u.get("id")) == str(sess.get("user_id")):
                return _public_user(u)
    return None


def delete_auth_session(token: str) -> bool:
    if not token:
        return False
    token_h = _token_hash(token)
    with _auth_file_lock:
        sessions = _read_auth_file(AUTH_SESSIONS_PATH, {})
        existed = token_h in sessions
        if existed:
            sessions.pop(token_h, None)
            _write_auth_file(AUTH_SESSIONS_PATH, sessions)
        return existed


# ----------------------------------------------------------------------
# User profile (formerly browser localStorage: nickname, flags, crane types)

_PROFILE_ALLOWED_FIELDS = ("nickname", "flags", "crane_types")


def _empty_profile() -> Dict:
    return {"nickname": None, "flags": {}, "crane_types": []}


def _normalize_profile_patch(patch: Dict) -> Dict:
    """Keep only known fields and coerce JSON-shaped ones to the right types,
    so callers can't accidentally widen the schema by POSTing extra keys."""
    out: Dict[str, Any] = {}
    if not isinstance(patch, dict):
        return out
    if "nickname" in patch:
        nick = patch.get("nickname")
        out["nickname"] = None if nick in (None, "") else str(nick)[:64]
    if "flags" in patch:
        flags = patch.get("flags")
        out["flags"] = flags if isinstance(flags, dict) else {}
    if "crane_types" in patch:
        ct = patch.get("crane_types")
        out["crane_types"] = ct if isinstance(ct, list) else []
    return out


def get_user_profile(user_id: str) -> Dict:
    """Return the stored profile or empty defaults. Never raises on missing row."""
    if not user_id:
        return _empty_profile()
    # File-mode dev: no server-side profile, client keeps using localStorage.
    return _empty_profile()

def upsert_user_profile(user_id: str, patch: Dict) -> Dict:
    """Patch the named fields on the profile row, inserting if needed.
    Unknown keys in `patch` are silently dropped. Returns the post-write row."""
    if not user_id:
        raise ValueError("user_id is required")
    fields = _normalize_profile_patch(patch)
    return _empty_profile()

def merge_user_profile_once(user_id: str, payload: Dict) -> Dict:
    """First-login migration of legacy localStorage values into user_profile.

    Idempotent and conservative: only fills fields that are currently empty
    on the server, so re-running the push from another browser (or after the
    user has already edited their profile server-side) never clobbers the
    canonical row. Empty-vs-set check:
      • nickname: NULL or empty string → fill
      • flags: missing keys are added, existing keys preserved
      • crane_types: empty list → replace; non-empty → keep server copy
    """
    if not user_id:
        raise ValueError("user_id is required")
    incoming = _normalize_profile_patch(payload)
    if not incoming:
        return get_user_profile(user_id)
    current = get_user_profile(user_id)
    merged: Dict[str, Any] = {}
    if "nickname" in incoming and not current.get("nickname"):
        merged["nickname"] = incoming["nickname"]
    if "flags" in incoming:
        cur_flags = dict(current.get("flags") or {})
        for k, v in (incoming["flags"] or {}).items():
            cur_flags.setdefault(k, v)
        merged["flags"] = cur_flags
    if "crane_types" in incoming and not (current.get("crane_types") or []):
        merged["crane_types"] = incoming["crane_types"]
    if not merged:
        return current
    return upsert_user_profile(user_id, merged)


# ----------------------------------------------------------------------
# Research participation + adventure progress

_RESEARCH_TEXT_LIMITS = {
    "full_name": 80,
    "university": 120,
    "college": 120,
    "department": 120,
    "student_number": 32,
    "grade": 32,
    "phone": 20,
    "email": 254,
}

# 000-0000-0000 (휴대전화) 및 10자리 유선·구형 번호(000-000-0000)를 허용한다.
# 클라이언트가 입력 중 하이픈을 자동으로 넣지만 서버도 동일 형식을 강제한다.
_RESEARCH_PHONE_RE = re.compile(r"^\d{2,3}-\d{3,4}-\d{4}$")
_RESEARCH_GRADES = (
    "1학년", "2학년", "3학년", "4학년", "5학년", "석사", "박사",
)

# 자필 서명 — 캔버스가 만든 PNG data URL만 받는다.
_RESEARCH_SIGNATURE_PREFIX = "data:image/png;base64,"
# 400x150 캔버스의 일반적인 서명이 3~15KB(base64 기준 4~20KB)다. 상한은 고해상도
# (devicePixelRatio 3) 기기의 촘촘한 서명까지 통과하도록 넉넉히 두되, 임의의 큰
# 이미지를 이 컬럼에 밀어 넣는 것은 막는다.
_RESEARCH_SIGNATURE_MAX = 400_000
# 빈 캔버스를 PNG로 인코딩하면 수백 바이트로 압축된다. 획이 하나라도 있으면 이
# 값을 넘으므로 "그리지 않고 제출"을 서버에서도 걸러낸다. 정밀한 공백 판정은
# 클라이언트가 알파 채널을 직접 검사해서 하고(빈 서명 제출 버튼 자체가 막힌다),
# 이 길이 검사는 API를 직접 호출하는 경로에 대한 방어선이다.
_RESEARCH_SIGNATURE_MIN = 700


def _normalize_research_signature(raw: Any) -> str:
    """서명 data URL을 검증해 그대로 돌려준다. 형식이 아니면 ValueError."""
    value = str(raw or "").strip()
    if not value:
        raise ValueError("동의서에 서명해 주세요.")
    if not value.startswith(_RESEARCH_SIGNATURE_PREFIX):
        raise ValueError("서명 형식이 올바르지 않습니다.")
    # 상한은 디코딩 전에 본다 — 거대한 페이로드를 base64로 풀어보기 전에 끊는다.
    if len(value) > _RESEARCH_SIGNATURE_MAX:
        raise ValueError("서명 이미지가 너무 큽니다. 다시 서명해 주세요.")
    payload = value[len(_RESEARCH_SIGNATURE_PREFIX):]
    try:
        decoded = base64.b64decode(payload, validate=True)
    except Exception:
        raise ValueError("서명 형식이 올바르지 않습니다.")
    # PNG 매직 넘버 — Content-Type만 믿지 않고 실제 바이트를 확인한다.
    if not decoded.startswith(b"\x89PNG\r\n\x1a\n"):
        raise ValueError("서명 형식이 올바르지 않습니다.")
    # 빈 캔버스 판정은 형식 검사를 통과한 뒤에 한다. 순서가 반대면 깨진 입력이
    # "서명이 비어 있다"는 엉뚱한 메시지를 받는다.
    if len(value) < _RESEARCH_SIGNATURE_MIN:
        raise ValueError("서명이 비어 있습니다. 서명란에 직접 서명해 주세요.")
    return value


def _research_config():
    from crane_web.research import (
        CONSENT_VERSION,
        STUDY_ID,
        STUDY_VERSION,
        scenario_sequence,
    )
    return STUDY_ID, STUDY_VERSION, CONSENT_VERSION, scenario_sequence()


def _normalize_research_profile(payload: Dict) -> Dict[str, Any]:
    if not isinstance(payload, dict):
        raise ValueError("참여자 정보를 입력하세요.")
    labels = {
        "full_name": "이름(실명)",
        "university": "대학교",
        "college": "단과대",
        "department": "전공",
        "student_number": "학번",
        "grade": "학년",
        "phone": "전화번호",
        "email": "이메일",
    }
    out: Dict[str, Any] = {}
    for key in _RESEARCH_TEXT_LIMITS:
        value = str(payload.get(key) or "").strip()
        if not value:
            raise ValueError(f"{labels[key]}을(를) 입력하세요.")
        out[key] = value[:_RESEARCH_TEXT_LIMITS[key]]
    if not _EMAIL_RE.match(out["email"].lower()):
        raise ValueError("올바른 이메일 주소를 입력하세요.")
    if out["grade"] not in _RESEARCH_GRADES:
        raise ValueError("학년을 목록에서 선택하세요.")
    # 클라이언트가 하이픈을 자동으로 넣지만, API를 직접 호출하는 경로도 있으므로
    # 숫자만 온 경우에는 서버에서 같은 규칙으로 정규화한 뒤 형식을 검사한다.
    phone = _format_research_phone(out["phone"])
    if not _RESEARCH_PHONE_RE.match(phone):
        raise ValueError("전화번호를 000-0000-0000 형식으로 입력하세요.")
    out["phone"] = phone
    # 서명은 _RESEARCH_TEXT_LIMITS 루프 밖에서 다룬다 — 길이 제한과 검증 규칙이
    # 텍스트 필드와 다르고, 응답에 실리는 profile에도 포함되면 안 되기 때문이다.
    out["signature"] = _normalize_research_signature(payload.get("signature"))
    return out


def _format_research_phone(raw: str) -> str:
    """전화번호에 하이픈을 넣는다 — web/index.html·game-mobile.html의
    formatPhoneInput과 **같은 규칙이어야 한다**.

    서울(02)은 지역번호가 두 자리라 2-3-4 / 2-4-4로 끊는다. 이 분기를 빼면
    클라이언트가 만든 '02-1234-5678'을 서버가 '021-234-5678'로 조용히
    바꿔 저장하고, '02-123-4567'은 형식 검사에서 거부된다."""
    digits = re.sub(r"\D", "", str(raw or ""))[:11]
    if digits.startswith("02"):
        if len(digits) < 3:
            return digits
        if len(digits) < 6:
            return f"{digits[:2]}-{digits[2:]}"
        if len(digits) < 10:
            return f"{digits[:2]}-{digits[2:5]}-{digits[5:]}"
        return f"{digits[:2]}-{digits[2:6]}-{digits[6:10]}"
    if len(digits) < 4:
        return digits
    if len(digits) < 8:
        return f"{digits[:3]}-{digits[3:]}"
    if len(digits) < 11:
        return f"{digits[:3]}-{digits[3:6]}-{digits[6:]}"
    return f"{digits[:3]}-{digits[3:7]}-{digits[7:11]}"


def _iso_value(value):
    return value.isoformat() if isinstance(value, datetime) else value


def _research_status_shape(participation: Optional[Dict],
                           progress: Optional[Dict]) -> Dict:
    (
        configured_study_id,
        configured_study_version,
        consent_version,
        configured_sequence,
    ) = _research_config()
    participation = dict(participation or {})
    progress = dict(progress or {})
    sequence = (
        progress.get("scenario_sequence")
        or participation.get("scenario_sequence")
        or configured_sequence
    )
    sequence = [str(value) for value in sequence if value]
    unlocked_index = int(progress.get("unlocked_index") or 0)
    if sequence:
        unlocked_index = max(0, min(unlocked_index, len(sequence) - 1))
    completed = [
        str(value) for value in (progress.get("completed_scenarios") or [])
        if str(value) in sequence
    ]
    active = bool(
        participation.get("active")
        and participation.get("consent_version") == consent_version
    )
    public_participation = None
    if participation:
        public_participation = {
            "participant_id": str(participation.get("participant_id") or ""),
            "study_id": participation.get("study_id") or configured_study_id,
            "study_version": (
                participation.get("study_version") or configured_study_version
            ),
            "consent_version": participation.get("consent_version") or consent_version,
            "active": active,
            "consented_at": _iso_value(participation.get("consented_at")),
            "withdrawn_at": _iso_value(participation.get("withdrawn_at")),
            "profile": {
                key: participation.get(key) or ""
                for key in _RESEARCH_TEXT_LIMITS
            },
            "open_data_consent": bool(participation.get("open_data_consent")),
            # 서명 이미지 자체는 참여자에게도 돌려주지 않는다 — 재동의 때는
            # 프리필하지 않고 새로 서명받는 것이 동의 취득 절차에 맞다.
            "has_signature": bool(
                participation.get("has_signature")
                or participation.get("signature")
            ),
            # 제출 시각 — 클라이언트는 완료 안내에서 버튼을 이미 눌렀는지
            # 판단하는 데만 쓴다.
            "submitted_at": _iso_value(participation.get("submitted_at")),
        }
    return {
        "participation": public_participation,
        "progress": {
            "study_id": (
                progress.get("study_id")
                or participation.get("study_id")
                or configured_study_id
            ),
            "study_version": (
                progress.get("study_version")
                or participation.get("study_version")
                or configured_study_version
            ),
            "scenario_sequence": sequence,
            "unlocked_index": unlocked_index,
            "unlocked_scenario_id": (
                sequence[unlocked_index] if active and sequence else None
            ),
            "completed_scenarios": completed,
            "completed_count": len(completed),
            "total_count": len(sequence),
        },
    }


def get_research_status(user_id: str) -> Dict:
    """Return the current study participation and server-backed progression."""
    if not user_id:
        return _research_status_shape(None, None)
    study_id, study_version, _, _ = _research_config()
    with _research_file_lock:
        participations = _read_auth_file(RESEARCH_PARTICIPATIONS_PATH, {})
        progresses = _read_auth_file(RESEARCH_PROGRESS_PATH, {})
        key = f"{user_id}|{study_id}|{study_version}"
        participation = (
            participations.get(key) if isinstance(participations, dict) else None
        )
        participant_id = str((participation or {}).get("participant_id") or "")
        progress = (
            progresses.get(participant_id)
            if isinstance(progresses, dict) and participant_id else None
        )
        return _research_status_shape(participation, progress)


def upsert_research_participation(user_id: str, payload: Dict) -> Dict:
    """Create or renew the current adult-participant research consent."""
    if not user_id:
        raise ValueError("user_id is required")
    required_consents = (
        ("age_confirmed", "만 19세 이상임을 확인해야 참여할 수 있습니다."),
        ("research_consent", "연구 참여에 동의해야 합니다."),
        ("privacy_consent", "개인정보 수집·이용에 동의해야 합니다."),
        ("overseas_transfer_consent", "개인정보 저장 위치 확인에 동의해야 합니다."),
    )
    for key, message in required_consents:
        if payload.get(key) is not True:
            raise ValueError(message)
    profile = _normalize_research_profile(payload)
    open_data_consent = payload.get("open_data_consent") is True
    study_id, study_version, consent_version, sequence = _research_config()
    with _research_file_lock:
        participations = _read_auth_file(RESEARCH_PARTICIPATIONS_PATH, {})
        progresses = _read_auth_file(RESEARCH_PROGRESS_PATH, {})
        if not isinstance(participations, dict):
            participations = {}
        if not isinstance(progresses, dict):
            progresses = {}
        key = f"{user_id}|{study_id}|{study_version}"
        old = participations.get(key) or {}
        participant_id = str(old.get("participant_id") or uuid.uuid4())
        participations[key] = {
            "participant_id": participant_id,
            "user_id": str(user_id),
            "study_id": study_id,
            "study_version": study_version,
            "consent_version": consent_version,
            **profile,
            "age_confirmed": True,
            "research_consent": True,
            "privacy_consent": True,
            "overseas_transfer_consent": True,
            "open_data_consent": open_data_consent,
            "scenario_sequence": list(sequence),
            "active": True,
            "consented_at": datetime.now().astimezone().isoformat(),
            "withdrawn_at": None,
        }
        progresses.setdefault(participant_id, {
            "participant_id": participant_id,
            "user_id": str(user_id),
            "study_id": study_id,
            "study_version": study_version,
            "scenario_sequence": list(sequence),
            "unlocked_index": 0,
            "completed_scenarios": [],
        })
        _write_auth_file(RESEARCH_PARTICIPATIONS_PATH, participations)
        _write_auth_file(RESEARCH_PROGRESS_PATH, progresses)
    return get_research_status(user_id)


def withdraw_research_participation(user_id: str) -> Dict:
    """Stop future research sessions while preserving already submitted data."""
    if not user_id:
        raise ValueError("user_id is required")
    study_id, study_version, _, _ = _research_config()
    with _research_file_lock:
        participations = _read_auth_file(RESEARCH_PARTICIPATIONS_PATH, {})
        if isinstance(participations, dict):
            key = f"{user_id}|{study_id}|{study_version}"
            row = participations.get(key)
            if row:
                row["active"] = False
                row["withdrawn_at"] = datetime.now().astimezone().isoformat()
                participations[key] = row
                _write_auth_file(RESEARCH_PARTICIPATIONS_PATH, participations)
    return get_research_status(user_id)


def update_research_signature(user_id: str, signature: Any) -> Dict:
    """이미 동의한 참여자의 자필 서명만 채운다.

    서명란은 동의서 v2 이후에 추가됐다. 그 전에 동의하고 실험을 진행 중인
    참여자에게 재동의(consent_version 상향)를 요구하면 진행이 통째로 멈추므로,
    나머지 동의 내용은 그대로 두고 서명만 보충받는다.

    이미 서명이 있으면 덮어쓰지 않고 현재 상태를 그대로 돌려준다 — 서명은 한
    번만 받는다는 계약이고, 재요청이 기존 서명을 갈아치우면 안 된다.
    """
    if not user_id:
        raise ValueError("user_id is required")
    status = get_research_status(user_id)
    participation = status.get("participation") or {}
    if not participation.get("active"):
        raise ValueError("실험 참여 동의가 필요합니다.")
    if participation.get("has_signature"):
        return status
    value = _normalize_research_signature(signature)
    study_id, study_version, _, _ = _research_config()
    with _research_file_lock:
        participations = _read_auth_file(RESEARCH_PARTICIPATIONS_PATH, {})
        if isinstance(participations, dict):
            key = f"{user_id}|{study_id}|{study_version}"
            row = participations.get(key)
            if row and not row.get("signature"):
                row["signature"] = value
                participations[key] = row
                _write_auth_file(RESEARCH_PARTICIPATIONS_PATH, participations)
    return get_research_status(user_id)


def mark_research_submitted(user_id: str) -> Dict:
    """참여자가 '실험 데이터 제출'을 누른 시각을 기록한다.

    플레이 자체는 판마다 이미 저장돼 있다. 이 표시는 데이터가 아니라 참여자의
    의사 — "여기까지가 내 최종 제출"이라는 선언 — 이라서 별도 컬럼에 남긴다.
    처음 누른 시각을 보존한다(재클릭이 시각을 갱신하지 않는다).
    """
    if not user_id:
        raise ValueError("user_id is required")
    status = get_research_status(user_id)
    participation = status.get("participation") or {}
    if not participation.get("active"):
        raise ValueError("실험 참여 동의가 필요합니다.")
    progress = status.get("progress") or {}
    total = int(progress.get("total_count") or 0)
    completed = int(progress.get("completed_count") or 0)
    if not total or completed < total:
        raise ValueError("모든 시나리오를 완료한 뒤 제출할 수 있습니다.")
    study_id, study_version, _, _ = _research_config()
    with _research_file_lock:
        participations = _read_auth_file(RESEARCH_PARTICIPATIONS_PATH, {})
        if isinstance(participations, dict):
            key = f"{user_id}|{study_id}|{study_version}"
            row = participations.get(key)
            if row and not row.get("submitted_at"):
                row["submitted_at"] = datetime.now().astimezone().isoformat()
                participations[key] = row
                _write_auth_file(RESEARCH_PARTICIPATIONS_PATH, participations)
    return get_research_status(user_id)


def resolve_research_session(user_id: str, scenario_id: str) -> Dict:
    """Validate consent + adventure lock and return immutable session metadata."""
    status = get_research_status(user_id)
    participation = status.get("participation") or {}
    progress = status.get("progress") or {}
    if not participation.get("active"):
        raise ValueError("실험 참여 동의가 필요합니다.")
    sequence = list(progress.get("scenario_sequence") or [])
    if scenario_id not in sequence:
        raise ValueError("이 시나리오는 현재 실험 순서에 포함되지 않습니다.")
    order = sequence.index(scenario_id)
    unlocked_index = int(progress.get("unlocked_index") or 0)
    if order > unlocked_index:
        raise ValueError("앞 단계의 모든 양중을 완료하고 제출해야 시작할 수 있습니다.")
    return {
        "play_purpose": "research",
        "participant_id": participation.get("participant_id"),
        "study_id": participation.get("study_id"),
        "study_version": participation.get("study_version"),
        "consent_version": participation.get("consent_version"),
        "consented_at": participation.get("consented_at"),
        "scenario_order": order,
        "scenario_sequence": sequence,
    }


# ----------------------------------------------------------------------
# Models metadata (formerly scattered .label.json / config.yaml sidecars)

_MODEL_PATCH_TEXT_FIELDS = ("kind", "name", "memo")
_MODEL_PATCH_INT_FIELDS = ("size_bytes",)
_MODEL_PATCH_TS_FIELDS = ("file_mtime",)
_MODEL_PATCH_JSON_FIELDS = ("hparams", "metrics")
_MODEL_PATCH_UUID_FIELDS = ("owner_id",)


def _normalize_model_patch(patch: Dict) -> Dict[str, Any]:
    out: Dict[str, Any] = {}
    if not isinstance(patch, dict):
        return out
    for k in _MODEL_PATCH_TEXT_FIELDS:
        if k in patch:
            v = patch.get(k)
            out[k] = None if v in (None, "") else str(v)
    for k in _MODEL_PATCH_INT_FIELDS:
        if k in patch:
            v = patch.get(k)
            try:
                out[k] = None if v in (None, "") else int(v)
            except (TypeError, ValueError):
                out[k] = None
    for k in _MODEL_PATCH_TS_FIELDS:
        if k in patch:
            v = patch.get(k)
            out[k] = v  # caller passes datetime/None
    for k in _MODEL_PATCH_JSON_FIELDS:
        if k in patch:
            v = patch.get(k)
            out[k] = v if isinstance(v, dict) else {}
    for k in _MODEL_PATCH_UUID_FIELDS:
        if k in patch:
            v = patch.get(k)
            out[k] = None if v in (None, "") else str(v)
    return out


def upsert_model(rel_path: str, patch: Dict) -> Optional[Dict]:
    """Insert or update a models row keyed by rel_path. Unknown keys are
    silently dropped. Returns the post-write row or None when DB is unset.
    Designed to be called both from the label endpoint (partial patch) and
    from the training-completion hook (full metadata)."""
    if not rel_path:
        raise ValueError("rel_path is required")
    return None

_MODEL_SELECT_COLS = (
    "rel_path, owner_id, kind, name, memo, size_bytes, file_mtime, "
    "hparams, metrics, created_at, updated_at"
)


def get_model(rel_path: str) -> Optional[Dict]:
    if not rel_path:
        return None
    return None

def list_models_db(owner_id: Optional[str] = None) -> List[Dict]:
    """Return all model rows newest-first. owner_id filter is opt-in — the
    dashboard's model manager currently shows everyone's models, so the
    caller decides."""
    return []

def delete_model_db(rel_path: str) -> bool:
    """Drop the metadata row. Returns True if a row existed."""
    if not rel_path:
        return False
    return False

# ----------------------------------------------------------------------
# Auto-reward study runs

_ARR_TEXT_FIELDS = ("status", "irl_prior_ref")
_ARR_INT_FIELDS = ("n_trials", "episodes", "best_trial")
_ARR_FLOAT_FIELDS = ("best_score",)
_ARR_JSON_FIELDS = ("best_reward", "layout", "search_space", "score_weights")
_ARR_UUID_FIELDS = ("owner_id",)
_ARR_TS_FIELDS = ("finished_at",)


def _normalize_arr_patch(patch: Dict) -> Dict[str, Any]:
    out: Dict[str, Any] = {}
    if not isinstance(patch, dict):
        return out
    for k in _ARR_TEXT_FIELDS:
        if k in patch:
            v = patch.get(k)
            out[k] = None if v in (None, "") else str(v)
    for k in _ARR_INT_FIELDS:
        if k in patch:
            v = patch.get(k)
            try:
                out[k] = None if v in (None, "") else int(v)
            except (TypeError, ValueError):
                out[k] = None
    for k in _ARR_FLOAT_FIELDS:
        if k in patch:
            v = patch.get(k)
            try:
                out[k] = None if v in (None, "") else float(v)
            except (TypeError, ValueError):
                out[k] = None
    for k in _ARR_JSON_FIELDS:
        if k in patch:
            v = patch.get(k)
            # Allow null (no result yet) vs dict/list (write the JSON).
            out[k] = v if isinstance(v, (dict, list)) else None
    for k in _ARR_UUID_FIELDS:
        if k in patch:
            v = patch.get(k)
            out[k] = None if v in (None, "") else str(v)
    for k in _ARR_TS_FIELDS:
        if k in patch:
            out[k] = patch.get(k)  # caller passes datetime/None
    return out


def upsert_auto_reward_run(job_id: str, patch: Dict) -> Optional[Dict]:
    """Insert or update a study row keyed by job_id. Called once at /start
    (with the inputs) and again from the reader thread at completion (with
    best_reward / status / finished_at)."""
    if not job_id:
        raise ValueError("job_id is required")
    return None

_ARR_SELECT_COLS = (
    "job_id, owner_id, status, n_trials, episodes, best_score, best_trial, "
    "best_reward, irl_prior_ref, layout, search_space, score_weights, "
    "started_at, finished_at"
)


def get_auto_reward_run(job_id: str) -> Optional[Dict]:
    if not job_id:
        return None
    return None

def list_auto_reward_runs_db(owner_id: Optional[str] = None, limit: int = 100) -> List[Dict]:
    return []

# ----------------------------------------------------------------------
# Plays

def save_play(doc: Dict) -> str:
    """Persist a play doc to disk. Returns an opaque reference accepted by
    load_play."""
    # Parse role text into structured (kind, grade, years) and embed into
    # doc.meta so file-mode reads see the same fields as the DB columns.
    meta = doc.setdefault("meta", {})
    role_kind, role_grade, role_years = _parse_role(meta.get("role"))
    meta["role_kind"]  = role_kind
    meta["role_grade"] = role_grade
    meta["role_years"] = role_years
    purpose = str(meta.get("play_purpose") or "legacy").strip().lower()
    if purpose not in ("general", "research", "legacy"):
        raise ValueError("play_purpose must be general, research, or legacy")
    meta["play_purpose"] = purpose
    # File fallback — preserve the previous layout exactly.
    meta = doc.get("meta") or {}
    if purpose == "research":
        with _research_file_lock:
            status = get_research_status(str(meta.get("user_id") or ""))
            participation = status.get("participation") or {}
            progress = status.get("progress") or {}
            if (
                not participation.get("active")
                or str(participation.get("participant_id") or "")
                != str(meta.get("participant_id") or "")
            ):
                raise ValueError("유효한 실험 참여 동의를 확인할 수 없습니다.")
            sequence = list(progress.get("scenario_sequence") or [])
            scenario_id = str(meta.get("scenario_id") or "")
            if scenario_id not in sequence:
                raise ValueError("이 시나리오는 현재 실험 순서에 포함되지 않습니다.")
            scenario_order = sequence.index(scenario_id)
            if scenario_order > int(progress.get("unlocked_index") or 0):
                raise ValueError("잠긴 실험 시나리오는 제출할 수 없습니다.")
            meta["scenario_order"] = scenario_order
            meta["study_id"] = participation.get("study_id")
            meta["study_version"] = participation.get("study_version")
            meta["consent_version"] = participation.get("consent_version")
            previous = list_plays(
                scenario_id=scenario_id,
                user_id=str(meta.get("user_id") or ""),
                play_purpose="research",
            )
            meta["attempt_no"] = len(previous) + 1
    elif purpose == "general":
        # Postgres 경로와 같은 규칙 — 일반 플레이 전용 회차 (연구와 분리).
        owner_id = str(meta.get("user_id") or "")
        scenario_id = str(meta.get("scenario_id") or "")
        if owner_id and scenario_id:
            previous = list_plays(
                scenario_id=scenario_id,
                user_id=owner_id,
                play_purpose="general",
            )
            meta["attempt_no"] = len(previous) + 1
    safe_scen = _safe_segment(meta.get("scenario_id"))
    safe_tier = _safe_segment(meta.get("tier"))
    safe_nick = _safe_segment(meta.get("nickname"), fallback="anon")
    dirpath = PLAYS_DIR / safe_scen / safe_tier
    dirpath.mkdir(parents=True, exist_ok=True)
    stamp = time.strftime("%Y%m%d-%H%M%S", time.localtime())
    path = dirpath / f"{stamp}_{safe_nick}_{uuid.uuid4().hex[:10]}.json"
    path.write_text(json.dumps(doc, ensure_ascii=False, indent=2), encoding="utf-8")
    if purpose == "research":
        with _research_file_lock:
            progresses = _read_auth_file(RESEARCH_PROGRESS_PATH, {})
            participant_id = str(meta.get("participant_id") or "")
            progress = progresses.get(participant_id) if isinstance(progresses, dict) else None
            outcome = doc.get("outcome") or {}
            is_complete = (
                int(outcome.get("total") or 0) > 0
                and int(outcome.get("done") or 0) >= int(outcome.get("total") or 0)
            )
            if progress and is_complete:
                sequence = list(progress.get("scenario_sequence") or [])
                scenario_id = str(meta.get("scenario_id") or "")
                order = sequence.index(scenario_id)
                completed = list(progress.get("completed_scenarios") or [])
                if scenario_id not in completed:
                    completed.append(scenario_id)
                unlocked = int(progress.get("unlocked_index") or 0)
                if order == unlocked and sequence:
                    unlocked = min(unlocked + 1, len(sequence) - 1)
                progress["unlocked_index"] = unlocked
                progress["completed_scenarios"] = completed
                progress["updated_at"] = datetime.now().astimezone().isoformat()
                progresses[participant_id] = progress
                _write_auth_file(RESEARCH_PROGRESS_PATH, progresses)
    return str(path.relative_to(ROOT))


def _behavior_summary(doc: Dict) -> Dict:
    """Roll a play doc's behaviour log up to a few list-view metrics. Returns
    Nones when the play predates the behaviour-log feature so the table can show
    '-' rather than 0."""
    b = doc.get("behavior") if isinstance(doc.get("behavior"), dict) else None
    if not b:
        return {"think_ms": None, "interactions": None, "mode_switches": None}
    steps = b.get("steps") if isinstance(b.get("steps"), list) else []
    sess = b.get("session") if isinstance(b.get("session"), dict) else {}
    think_ms = sum(int(s.get("dt_ms") or 0) for s in steps if isinstance(s, dict))
    inter = sess.get("pointer_events")
    if inter is None:
        inter = sum(int(s.get("interactions") or 0) for s in steps if isinstance(s, dict))
    return {
        "think_ms": think_ms,
        "interactions": int(inter or 0),
        "mode_switches": int(sess.get("mode_switches") or 0),
    }


_PLAY_SUMMARY_SELECT = """
    p.id,
    p.user_id,
    p.scenario_id,
    p.tier,
    p.nickname,
    p.submitted_at,
    COALESCE(NULLIF(p.role, ''), p.doc #>> '{meta,role}') AS role,
    p.role_kind,
    p.role_grade,
    p.role_years,
    p.play_purpose,
    p.participant_id,
    p.study_id,
    p.study_version,
    p.consent_version,
    p.scenario_order,
    p.attempt_no,
    p.doc #>> '{meta,user_id}' AS meta_user_id,
    p.doc #>> '{meta,display_name}' AS display_name,
    p.doc #>> '{meta,client}' AS client,
    p.doc #> '{meta,play_seconds}' AS play_seconds,
    p.doc #> '{meta,undo_count}' AS undo_count,
    p.doc #> '{outcome,makespan}' AS makespan,
    p.doc #> '{outcome,done}' AS done,
    p.doc #> '{outcome,total}' AS total,
    p.doc #> '{scorer_snapshot,totalScore}' AS total_score,
    p.doc #>> '{scorer_snapshot,grade}' AS grade,
    CASE
        WHEN jsonb_typeof(p.doc -> 'behavior') = 'object'
             AND p.doc -> 'behavior' <> '{}'::jsonb
        THEN COALESCE((
            SELECT SUM(
                CASE
                    WHEN jsonb_typeof(step -> 'dt_ms') = 'number'
                    THEN (step ->> 'dt_ms')::numeric::bigint
                    ELSE 0
                END
            )
            FROM jsonb_array_elements(
                CASE
                    WHEN jsonb_typeof(p.doc #> '{behavior,steps}') = 'array'
                    THEN p.doc #> '{behavior,steps}'
                    ELSE '[]'::jsonb
                END
            ) AS step
        ), 0)
        ELSE NULL
    END AS think_ms,
    CASE
        WHEN jsonb_typeof(p.doc -> 'behavior') = 'object'
             AND p.doc -> 'behavior' <> '{}'::jsonb
        THEN COALESCE(
            CASE
                WHEN jsonb_typeof(p.doc #> '{behavior,session,pointer_events}') = 'number'
                THEN (p.doc #>> '{behavior,session,pointer_events}')::numeric::bigint
                ELSE NULL
            END,
            (
                SELECT COALESCE(SUM(
                    CASE
                        WHEN jsonb_typeof(step -> 'interactions') = 'number'
                        THEN (step ->> 'interactions')::numeric::bigint
                        ELSE 0
                    END
                ), 0)
                FROM jsonb_array_elements(
                    CASE
                        WHEN jsonb_typeof(p.doc #> '{behavior,steps}') = 'array'
                        THEN p.doc #> '{behavior,steps}'
                        ELSE '[]'::jsonb
                    END
                ) AS step
            )
        )
        ELSE NULL
    END AS interactions,
    CASE
        WHEN jsonb_typeof(p.doc -> 'behavior') = 'object'
             AND p.doc -> 'behavior' <> '{}'::jsonb
        THEN CASE
            WHEN jsonb_typeof(p.doc #> '{behavior,session,mode_switches}') = 'number'
            THEN (p.doc #>> '{behavior,session,mode_switches}')::numeric::bigint
            ELSE 0
        END
        ELSE NULL
    END AS mode_switches
"""


def list_plays(scenario_id: Optional[str] = None, tier: Optional[str] = None,
               user_id: Optional[str] = None,
               play_purpose: Optional[str] = None) -> List[Dict]:
    # File fallback
    out_f: List[Dict] = []
    if not PLAYS_DIR.exists():
        return out_f
    for scen_dir in sorted(PLAYS_DIR.iterdir()):
        if not scen_dir.is_dir():
            continue
        if scenario_id and scen_dir.name != scenario_id:
            continue
        for tier_dir in sorted(scen_dir.iterdir()):
            if not tier_dir.is_dir():
                continue
            if tier and tier_dir.name != tier:
                continue
            for f in sorted(tier_dir.glob("*.json")):
                try:
                    doc = json.loads(f.read_text(encoding="utf-8"))
                except Exception:
                    continue
                meta = doc.get("meta") or {}
                if user_id and str(meta.get("user_id") or "") != str(user_id):
                    continue
                purpose = meta.get("play_purpose") or "legacy"
                if play_purpose and purpose != play_purpose:
                    continue
                outcome = doc.get("outcome") or {}
                snap = doc.get("scorer_snapshot") or {}
                # Older files may not have the structured role embedded yet;
                # parse on the fly so file-mode listings match DB-mode shape.
                rk = meta.get("role_kind"); rg = meta.get("role_grade"); ry = meta.get("role_years")
                if rk is None and rg is None and ry is None:
                    rk, rg, ry = _parse_role(meta.get("role"))
                out_f.append({
                    "path": str(f.relative_to(ROOT)),
                    "user_id": meta.get("user_id"),
                    "scenario_id": meta.get("scenario_id"),
                    "tier": meta.get("tier"),
                    "nickname": meta.get("nickname"),
                    "display_name": meta.get("display_name") or meta.get("nickname"),
                    "role": meta.get("role"),
                    "role_kind": rk,
                    "role_grade": rg,
                    "role_years": ry,
                    "client": meta.get("client") or "unknown",
                    "play_purpose": purpose,
                    "participant_id": meta.get("participant_id"),
                    "study_id": meta.get("study_id"),
                    "study_version": meta.get("study_version"),
                    "consent_version": meta.get("consent_version"),
                    "scenario_order": meta.get("scenario_order"),
                    "attempt_no": meta.get("attempt_no"),
                    "submitted_at": meta.get("submitted_at"),
                    "play_seconds": meta.get("play_seconds"),
                    "undo_count": meta.get("undo_count"),
                    "makespan": outcome.get("makespan"),
                    "done": outcome.get("done"),
                    "total": outcome.get("total"),
                    "totalScore": snap.get("totalScore"),
                    "grade": snap.get("grade"),
                    **_behavior_summary(doc),
                })
    return out_f


def load_plays(refs: Iterable[str]) -> Dict[str, Optional[Dict]]:
    """Load many play docs at once, keyed by the ref that was asked for.

    Reads are local file reads, so this is just a de-duplicating loop over
    `load_play`. Refs that do not resolve map to None, so a caller can tell
    "missing" from "not asked for" without a second pass.
    """
    out: Dict[str, Optional[Dict]] = {}
    for ref in refs:
        if not ref or ref in out:
            continue
        out[ref] = load_play(ref)
    return out


def load_play(ref: str) -> Optional[Dict]:
    """Load the full play doc. `ref` is whatever save_play returned (or what
    list_plays surfaces in the `path` field)."""
    if not ref:
        return None
    # File ref
    target = (ROOT / ref).resolve()
    try:
        target.relative_to(PLAYS_DIR.resolve())
    except ValueError:
        return None
    if not target.exists():
        return None
    try:
        return json.loads(target.read_text(encoding="utf-8"))
    except Exception:
        return None


def delete_play(ref: str) -> bool:
    """Delete a single play by opaque ref. Returns True if a row/file was
    removed, False if not found. Same sandboxing as load_play — file refs
    must resolve under PLAYS_DIR, anything outside is refused."""
    if not ref:
        return False
    target = (ROOT / ref).resolve()
    try:
        target.relative_to(PLAYS_DIR.resolve())
    except ValueError:
        return False
    if not target.exists() or not target.is_file():
        return False
    try:
        target.unlink()
        return True
    except Exception:
        return False


# ----------------------------------------------------------------------
# Game sessions — in-flight human-play state (decisions only; env rebuilt
# from scenario on hydration). Survives server restarts and redeploys.

def save_game_session(doc: Dict) -> None:
    """Insert-or-update a session row keyed on session_id. The doc carries
    user_steps + undo_count + display_name + role + _last_step_events; meta
    columns (scenario_id, tier, ...) are mirrored for indexing."""
    session_id = str(doc.get("session_id") or "").strip()
    if not session_id:
        raise ValueError("doc.session_id required")
    user_id = doc.get("user_id") or None
    scenario_id = doc.get("scenario_id") or "unknown"
    tier = doc.get("tier") or "unknown"
    nickname = doc.get("nickname") or "anon"
    role = doc.get("role") or ""
    play_purpose = doc.get("play_purpose") or "general"
    participant_id = doc.get("participant_id") or None
    study_id = doc.get("study_id") or None
    started_at = float(doc.get("started_at") or time.time())
    last_active_at = float(doc.get("last_active_at") or started_at)
    # File fallback — one JSON per session, keyed by session_id.
    SESSIONS_DIR.mkdir(parents=True, exist_ok=True)
    path = SESSIONS_DIR / f"{_safe_segment(session_id)}.json"
    path.write_text(json.dumps(doc, ensure_ascii=False, indent=2), encoding="utf-8")


def load_game_session(session_id: str) -> Optional[Dict]:
    if not session_id:
        return None
    path = SESSIONS_DIR / f"{_safe_segment(session_id)}.json"
    if not path.exists():
        return None
    try:
        return json.loads(path.read_text(encoding="utf-8"))
    except (OSError, json.JSONDecodeError):
        return None


def delete_game_session(session_id: str) -> bool:
    if not session_id:
        return False
    path = SESSIONS_DIR / f"{_safe_segment(session_id)}.json"
    if not path.exists():
        return False
    try:
        path.unlink()
        return True
    except OSError:
        return False


def purge_expired_game_sessions(cutoff_ts: float) -> int:
    """Drop sessions whose last_active_at is older than cutoff_ts (epoch
    seconds). Best-effort cleanup so old rows don't accumulate indefinitely."""
    if not SESSIONS_DIR.exists():
        return 0
    removed = 0
    for path in SESSIONS_DIR.glob("*.json"):
        try:
            doc = json.loads(path.read_text(encoding="utf-8"))
        except (OSError, json.JSONDecodeError):
            continue
        if float(doc.get("last_active_at") or 0) < float(cutoff_ts):
            try:
                path.unlink()
                removed += 1
            except OSError:
                pass
    return removed


# ----------------------------------------------------------------------
# Preferences

def save_preference(doc: Dict) -> str:
    """Persist a preference doc. `doc` must already include the standard
    keys ({meta, chosen, ai_baseline, human_play_path, reason}). Returns an
    opaque reference."""
    meta = doc.setdefault("meta", {})
    role_kind, role_grade, role_years = _parse_role(meta.get("role"))
    meta["role_kind"]  = role_kind
    meta["role_grade"] = role_grade
    meta["role_years"] = role_years
    # File fallback
    meta = doc.get("meta") or {}
    safe_scen = _safe_segment(meta.get("scenario_id"))
    safe_tier = _safe_segment(meta.get("tier"))
    safe_nick = _safe_segment(meta.get("nickname"), fallback="anon")
    dirpath = PREFERENCES_DIR / safe_scen / safe_tier
    dirpath.mkdir(parents=True, exist_ok=True)
    stamp = time.strftime("%Y%m%d-%H%M%S", time.localtime())
    path = dirpath / f"{stamp}_{safe_nick}_{uuid.uuid4().hex[:10]}.json"
    path.write_text(json.dumps(doc, ensure_ascii=False, indent=2), encoding="utf-8")
    return str(path.relative_to(ROOT))


def list_preferences(scenario_id: Optional[str] = None, tier: Optional[str] = None,
                     user_id: Optional[str] = None) -> List[Dict]:
    # File fallback
    out_f: List[Dict] = []
    if not PREFERENCES_DIR.exists():
        return out_f
    for scen_dir in sorted(PREFERENCES_DIR.iterdir()):
        if not scen_dir.is_dir():
            continue
        if scenario_id and scen_dir.name != scenario_id:
            continue
        for tier_dir in sorted(scen_dir.iterdir()):
            if not tier_dir.is_dir():
                continue
            if tier and tier_dir.name != tier:
                continue
            for f in sorted(tier_dir.glob("*.json")):
                try:
                    doc = json.loads(f.read_text(encoding="utf-8"))
                except Exception:
                    continue
                meta = doc.get("meta") or {}
                if user_id and str(meta.get("user_id") or "") != str(user_id):
                    continue
                rk = meta.get("role_kind"); rg = meta.get("role_grade"); ry = meta.get("role_years")
                if rk is None and rg is None and ry is None:
                    rk, rg, ry = _parse_role(meta.get("role"))
                out_f.append({
                    "path": str(f.relative_to(ROOT)),
                    "user_id": meta.get("user_id"),
                    "scenario_id": meta.get("scenario_id"),
                    "tier": meta.get("tier"),
                    "nickname": meta.get("nickname"),
                    "display_name": meta.get("display_name") or meta.get("nickname"),
                    "role": meta.get("role"),
                    "role_kind": rk,
                    "role_grade": rg,
                    "role_years": ry,
                    "chosen": doc.get("chosen"),
                    "reason": doc.get("reason"),
                    "ts": meta.get("ts"),
                })
    return out_f


def load_preference(ref: str) -> Optional[Dict]:
    if not ref:
        return None
    # File ref
    target = (ROOT / ref).resolve()
    try:
        target.relative_to(PREFERENCES_DIR.resolve())
    except ValueError:
        return None
    if not target.exists():
        return None
    try:
        return json.loads(target.read_text(encoding="utf-8"))
    except Exception:
        return None


def delete_preference(ref: str) -> bool:
    """Delete a single explicit-preference doc by opaque ref. File refs are
    sandboxed under PREFERENCES_DIR. Returns True on success."""
    if not ref:
        return False
    target = (ROOT / ref).resolve()
    try:
        target.relative_to(PREFERENCES_DIR.resolve())
    except ValueError:
        return False
    if not target.exists() or not target.is_file():
        return False
    try:
        target.unlink()
        return True
    except Exception:
        return False


# ----------------------------------------------------------------------
# Summaries

def _summarize_play_rows(plays: List[Dict]) -> List[Dict]:
    """Preserve the file-storage leaderboard contract."""
    import statistics

    buckets: Dict[tuple, List[Dict]] = {}
    for p in plays:
        key = (p.get("scenario_id") or "unknown", p.get("tier") or "unknown")
        buckets.setdefault(key, []).append(p)
    out: List[Dict] = []
    for (scen, tr), bucket in buckets.items():
        scores = [p["totalScore"] for p in bucket if isinstance(p.get("totalScore"), (int, float))]
        scores.sort()
        makespans = [p["makespan"] for p in bucket if isinstance(p.get("makespan"), (int, float))]
        completion = sum(1 for p in bucket if p.get("done") == p.get("total")) / max(1, len(bucket))
        grade_dist: Dict[str, int] = {}
        for p in bucket:
            g = p.get("grade") or "?"
            grade_dist[g] = grade_dist.get(g, 0) + 1
        out.append({
            "scenario_id": scen,
            "tier": tr,
            "n_plays": len(bucket),
            "completion_rate": round(completion, 3),
            "score_min": round(min(scores), 2) if scores else None,
            "score_max": round(max(scores), 2) if scores else None,
            "score_avg": round(sum(scores) / len(scores), 2) if scores else None,
            "score_median": round(statistics.median(scores), 2) if scores else None,
            "makespan_avg": round(sum(makespans) / len(makespans), 2) if makespans else None,
            "grade_dist": grade_dist,
            "recent": sorted(bucket, key=lambda p: p.get("submitted_at") or "", reverse=True)[:5],
            "score_histogram": _histogram(scores, bins=10, lo=0, hi=100),
        })
    out.sort(key=lambda s: (s["scenario_id"], s["tier"]))
    return out


def summary_by_scenario(tier: Optional[str] = None, user_id: Optional[str] = None,
                        play_purpose: Optional[str] = "general") -> List[Dict]:
    """Aggregate per-(scenario, tier) stats for the leaderboard view."""
    return _summarize_play_rows(list_plays(
        tier=tier,
        user_id=user_id,
        play_purpose=play_purpose,
    ))


# ----------------------------------------------------------------------
# IRL artifacts (prior / cross_validate / ab_report)

def _kind_from_filename(name: str) -> str:
    for prefix, kind in _FILE_KIND_PREFIXES.items():
        if name.startswith(prefix):
            return kind
    return "unknown"


def _file_prefix_for_kind(kind: str) -> str:
    for prefix, k in _FILE_KIND_PREFIXES.items():
        if k == kind:
            return prefix
    raise ValueError(f"unknown irl artifact kind: {kind}")


def save_irl_artifact(kind: str, doc: Dict, label: Optional[str] = None) -> str:
    """Persist an IRL artifact (prior / cross_validate / ab_report). Returns
    an opaque reference."""
    if kind not in IRL_VALID_KINDS:
        raise ValueError(f"kind must be one of {IRL_VALID_KINDS}, got {kind!r}")
    # File fallback
    IRL_DIR.mkdir(parents=True, exist_ok=True)
    stamp = time.strftime("%Y%m%d_%H%M%S", time.localtime())
    prefix = _file_prefix_for_kind(kind)
    path = IRL_DIR / f"{prefix}{stamp}_{uuid.uuid4().hex[:10]}.json"
    path.write_text(json.dumps(doc, ensure_ascii=False, indent=2), encoding="utf-8")
    return str(path.relative_to(ROOT))


def list_irl_artifacts(kind: Optional[str] = None) -> List[Dict]:
    """List IRL artifact summaries newest-first. Optionally filter by kind."""
    if kind is not None and kind not in IRL_VALID_KINDS:
        raise ValueError(f"kind must be one of {IRL_VALID_KINDS}, got {kind!r}")
    # File fallback
    out_f: List[Dict] = []
    if not IRL_DIR.exists():
        return out_f
    for f in sorted(IRL_DIR.glob("*.json"), reverse=True):
        file_kind = _kind_from_filename(f.name)
        if kind and file_kind != kind:
            continue
        st = f.stat()
        out_f.append({
            "path": str(f.relative_to(ROOT)),
            "name": f.name,
            "kind": file_kind,
            "label": None,
            "created_at": datetime.fromtimestamp(st.st_mtime).isoformat(),
            "mtime": st.st_mtime,
        })
    return out_f


def load_irl_artifact(ref: str) -> Optional[Dict]:
    """Load the full IRL artifact doc by opaque ref."""
    if not ref:
        return None
    # File ref
    target = (ROOT / ref).resolve()
    try:
        target.relative_to(IRL_DIR.resolve())
    except ValueError:
        return None
    if not target.exists():
        return None
    try:
        return json.loads(target.read_text(encoding="utf-8"))
    except Exception:
        return None


def delete_irl_artifact(ref: str) -> bool:
    """Delete a single IRL artifact (prior / cross_validate / ab_report) by
    opaque ref. File refs are sandboxed under IRL_DIR. Returns True on success."""
    if not ref:
        return False
    target = (ROOT / ref).resolve()
    try:
        target.relative_to(IRL_DIR.resolve())
    except ValueError:
        return False
    if not target.exists() or not target.is_file():
        return False
    try:
        target.unlink()
        return True
    except Exception:
        return False


def latest_irl_artifact(kind: str) -> Optional[Dict]:
    """Return (summary, doc) for the most recent artifact of `kind`, or None."""
    artifacts = list_irl_artifacts(kind=kind)
    if not artifacts:
        return None
    top = artifacts[0]
    doc = load_irl_artifact(top["path"])
    if doc is None:
        return None
    return {"summary": top, "doc": doc}


# ----------------------------------------------------------------------
# User-created scenarios (shareable layouts)

def _user_scen_db_or_raise():
    raise RuntimeError(
        "사용자 제작 시나리오는 여러 사용자가 공유하는 서버 데이터베이스가 "
        "있어야 동작합니다. 이 빌드는 로컬 전용이라 지원하지 않습니다."
    )

def _coerce_float(value, *, field: str, lo: Optional[float] = None,
                  hi: Optional[float] = None) -> float:
    try:
        f = float(value)
    except (TypeError, ValueError):
        raise ValueError(f"{field} must be a number (got {value!r})")
    if f != f:  # NaN
        raise ValueError(f"{field} must be finite (got NaN)")
    if lo is not None and f < lo:
        raise ValueError(f"{field} must be ≥ {lo} (got {f})")
    if hi is not None and f > hi:
        raise ValueError(f"{field} must be ≤ {hi} (got {f})")
    return f


def _coerce_int(value, *, field: str, lo: Optional[int] = None,
                hi: Optional[int] = None) -> int:
    try:
        i = int(value)
    except (TypeError, ValueError):
        raise ValueError(f"{field} must be an integer (got {value!r})")
    if lo is not None and i < lo:
        raise ValueError(f"{field} must be ≥ {lo} (got {i})")
    if hi is not None and i > hi:
        raise ValueError(f"{field} must be ≤ {hi} (got {i})")
    return i


def _validate_user_scenario_layout(layout: Any, config: Dict) -> Dict:
    """Validate + normalize layout. Mirrors the structural assumptions
    CraneSchedulingEnv makes (cranes/lifts/restrictedZones lists). Coordinates
    are bounded by the site_width/height from config."""
    if not isinstance(layout, dict):
        raise ValueError("layout must be an object")
    cranes_in = layout.get("cranes") or []
    lifts_in = layout.get("lifts") or []
    zones_in = layout.get("restrictedZones") or []
    if not isinstance(cranes_in, list) or not isinstance(lifts_in, list) or not isinstance(zones_in, list):
        raise ValueError("layout.cranes / lifts / restrictedZones must each be arrays")
    if len(cranes_in) < 1 or len(cranes_in) > USER_SCEN_MAX_CRANES:
        raise ValueError(f"크레인은 1~{USER_SCEN_MAX_CRANES}대여야 합니다 (현재 {len(cranes_in)}대)")
    if len(lifts_in) < 1 or len(lifts_in) > USER_SCEN_MAX_LIFTS:
        raise ValueError(f"양중은 1~{USER_SCEN_MAX_LIFTS}개여야 합니다 (현재 {len(lifts_in)}개)")
    if len(zones_in) > USER_SCEN_MAX_RESTRICTED:
        raise ValueError(f"제한구역은 최대 {USER_SCEN_MAX_RESTRICTED}개입니다 (현재 {len(zones_in)}개)")
    site_w = float(config.get("site_width") or 100.0)
    site_h = float(config.get("site_height") or 100.0)
    cranes_out: List[Dict] = []
    for i, c in enumerate(cranes_in):
        if not isinstance(c, dict):
            raise ValueError(f"crane[{i}] must be an object")
        cx = _coerce_float(c.get("x"), field=f"crane[{i}].x", lo=0, hi=site_w)
        cy = _coerce_float(c.get("y"), field=f"crane[{i}].y", lo=0, hi=site_h)
        out = {"x": cx, "y": cy}
        if "setup_x" in c and c["setup_x"] is not None:
            out["setup_x"] = _coerce_float(c["setup_x"], field=f"crane[{i}].setup_x", lo=0, hi=site_w)
        if "setup_y" in c and c["setup_y"] is not None:
            out["setup_y"] = _coerce_float(c["setup_y"], field=f"crane[{i}].setup_y", lo=0, hi=site_h)
        # 2.5D: boom length (m); 0 = 2D mode
        boom_raw = c.get("boom_len") if c.get("boom_len") is not None else c.get("boomLen")
        if boom_raw is not None:
            out["boom_len"] = _coerce_float(boom_raw, field=f"crane[{i}].boom_len", lo=0, hi=500)
        cranes_out.append(out)
    lifts_out: List[Dict] = []
    lift_ids = set()
    for i, l in enumerate(lifts_in):
        if not isinstance(l, dict):
            raise ValueError(f"lift[{i}] must be an object")
        lx = _coerce_float(l.get("x"), field=f"lift[{i}].x", lo=0, hi=site_w)
        ly = _coerce_float(l.get("y"), field=f"lift[{i}].y", lo=0, hi=site_h)
        weight = _coerce_float(l.get("weight") if l.get("weight") is not None else 10.0,
                               field=f"lift[{i}].weight", lo=0, hi=200)
        lift_id = str(l.get("id") or f"L{i+1}")[:32]
        if lift_id in lift_ids:
            raise ValueError(f"lift id must be unique (duplicate: {lift_id})")
        lift_ids.add(lift_id)
        out = {"id": lift_id, "x": lx, "y": ly, "weight": weight}
        # 2.5D placement height (optional; default 0 = ground level). Accepts `z`/
        # `height`, and `z_to`/`zTo` for back-compat with older from→to data.
        z_raw = next((l.get(k) for k in ("z", "height", "z_to", "zTo") if l.get(k) is not None), None)
        if z_raw is not None:
            out["z"] = _coerce_float(z_raw, field=f"lift[{i}].z", lo=0, hi=200)
        lifts_out.append(out)
    zones_out: List[Dict] = []
    for i, z in enumerate(zones_in):
        if not isinstance(z, dict):
            raise ValueError(f"restrictedZones[{i}] must be an object")
        zx = _coerce_float(z.get("x"), field=f"restrictedZones[{i}].x", lo=0, hi=site_w)
        zy = _coerce_float(z.get("y"), field=f"restrictedZones[{i}].y", lo=0, hi=site_h)
        zw = _coerce_float(z.get("w"), field=f"restrictedZones[{i}].w", lo=0.5, hi=site_w)
        zh = _coerce_float(z.get("h"), field=f"restrictedZones[{i}].h", lo=0.5, hi=site_h)
        if zx + zw > site_w or zy + zh > site_h:
            raise ValueError(f"restrictedZones[{i}] must stay inside the site bounds")
        zones_out.append({"x": zx, "y": zy, "w": zw, "h": zh})
    return {"cranes": cranes_out, "lifts": lifts_out, "restrictedZones": zones_out}


def _validate_user_scenario_config(config_in: Any) -> Dict:
    if not isinstance(config_in, dict):
        raise ValueError("config must be an object")

    def value_or_default(key: str, default):
        value = config_in.get(key)
        return default if value is None or value == "" else value

    site_w = _coerce_float(value_or_default("site_width", 100.0), field="config.site_width", lo=20, hi=500)
    site_h = _coerce_float(value_or_default("site_height", 100.0), field="config.site_height", lo=20, hi=500)
    cfg = {
        "fixed_duration": _coerce_float(value_or_default("fixed_duration", 25.0),
                                        field="config.fixed_duration", lo=1, hi=200),
        "setup_time":     _coerce_float(value_or_default("setup_time", 10.0),
                                        field="config.setup_time", lo=0, hi=120),
        "teardown_time":  _coerce_float(value_or_default("teardown_time", 5.0),
                                        field="config.teardown_time", lo=0, hi=120),
        "crane_radius":   _coerce_float(value_or_default("crane_radius", 18.0),
                                        field="config.crane_radius", lo=3, hi=80),
        "site_width":  site_w,
        "site_height": site_h,
        "candidate_k": 999,  # human play: unrestricted
        "max_steps":   _coerce_int(value_or_default("max_steps", 220),
                                   field="config.max_steps", lo=20, hi=1000),
        "lift_weight_min_t": _coerce_float(value_or_default("lift_weight_min_t", 0.0),
                                           field="config.lift_weight_min_t", lo=0, hi=200),
        "lift_weight_max_t": _coerce_float(value_or_default("lift_weight_max_t", 50.0),
                                           field="config.lift_weight_max_t", lo=0, hi=200),
        "default_lift_weight_t": _coerce_float(value_or_default("default_lift_weight_t", 10.0),
                                               field="config.default_lift_weight_t", lo=0, hi=200),
        # 2.5D height parameters
        "crane_boom_len": _coerce_float(value_or_default("crane_boom_len", 0.0),
                                        field="config.crane_boom_len", lo=0, hi=500),
        "lift_z_min": _coerce_float(value_or_default("lift_z_min", 0.0),
                                    field="config.lift_z_min", lo=0, hi=300),
        "lift_z_max": _coerce_float(value_or_default("lift_z_max", 0.0),
                                    field="config.lift_z_max", lo=0, hi=300),
    }
    curve = config_in.get("crane_capacity_curve")
    if isinstance(curve, list) and curve:
        out_curve: List[List[float]] = []
        for i, pt in enumerate(curve):
            if not isinstance(pt, (list, tuple)) or len(pt) != 2:
                raise ValueError(f"crane_capacity_curve[{i}] must be [radius, capacity]")
            r = _coerce_float(pt[0], field=f"crane_capacity_curve[{i}].radius", lo=0, hi=100)
            c = _coerce_float(pt[1], field=f"crane_capacity_curve[{i}].capacity", lo=0, hi=200)
            out_curve.append([r, c])
        cfg["crane_capacity_curve"] = out_curve
    # 2D rated-load chart (boom-length × radius): list of {boom_len, curve}.
    chart = config_in.get("crane_capacity_chart")
    if isinstance(chart, list) and chart:
        out_chart: List[Dict] = []
        for i, entry in enumerate(chart):
            if not isinstance(entry, dict):
                raise ValueError(f"crane_capacity_chart[{i}] must be an object {{boom_len, curve}}")
            bl = _coerce_float(entry.get("boom_len", entry.get("boomLen")),
                               field=f"crane_capacity_chart[{i}].boom_len", lo=1, hi=500)
            curve_in = entry.get("curve") or entry.get("points")
            if not isinstance(curve_in, list) or not curve_in:
                raise ValueError(f"crane_capacity_chart[{i}].curve must be a non-empty array")
            out_pts: List[List[float]] = []
            for j, pt in enumerate(curve_in):
                if not isinstance(pt, (list, tuple)) or len(pt) != 2:
                    raise ValueError(f"crane_capacity_chart[{i}].curve[{j}] must be [radius, capacity]")
                r = _coerce_float(pt[0], field=f"crane_capacity_chart[{i}].curve[{j}].radius", lo=0, hi=100)
                c = _coerce_float(pt[1], field=f"crane_capacity_chart[{i}].curve[{j}].capacity", lo=0, hi=200)
                out_pts.append([r, c])
            out_chart.append({"boom_len": bl, "curve": out_pts})
        cfg["crane_capacity_chart"] = out_chart
    return cfg


def _validate_user_scenario_payload(payload: Any) -> Dict:
    if not isinstance(payload, dict):
        raise ValueError("payload must be an object")
    name = str(payload.get("name") or "").strip()
    if not name:
        raise ValueError("이름(name)은 필수입니다")
    if len(name) > USER_SCEN_NAME_MAX:
        raise ValueError(f"이름은 최대 {USER_SCEN_NAME_MAX}자입니다")
    description = str(payload.get("description") or "").strip()
    if len(description) > USER_SCEN_DESC_MAX:
        raise ValueError(f"설명은 최대 {USER_SCEN_DESC_MAX}자입니다")
    tier = str(payload.get("tier") or "custom").strip().lower()
    if tier not in USER_SCEN_VALID_TIERS:
        raise ValueError(f"tier must be one of {USER_SCEN_VALID_TIERS}")
    difficulty = _coerce_int(payload.get("difficulty") or 3, field="difficulty", lo=1, hi=5)
    visibility = str(payload.get("visibility") or "private").strip().lower()
    if visibility not in USER_SCEN_VALID_VISIBILITY:
        raise ValueError(f"visibility must be one of {USER_SCEN_VALID_VISIBILITY}")
    config = _validate_user_scenario_config(payload.get("config") or {})
    layout = _validate_user_scenario_layout(payload.get("layout") or {}, config)
    return {
        "name": name,
        "description": description,
        "tier": tier,
        "difficulty": difficulty,
        "visibility": visibility,
        "layout": layout,
        "config": config,
    }


def _new_user_scenario_id() -> str:
    return USER_SCEN_ID_PREFIX + uuid.uuid4().hex[:12]


def _new_share_code() -> str:
    return USER_SCEN_SHARE_PREFIX + str(uuid.uuid4())


def _row_to_user_scenario(row, *, with_layout: bool = True) -> Dict:
    (sid, owner_id, name, description, tier, difficulty, visibility, share_code,
     layout, config, owner_display_name, created_at, updated_at) = row
    if isinstance(layout, str):
        layout = json.loads(layout)
    if isinstance(config, str):
        config = json.loads(config)
    out = {
        "id": sid,
        "owner_id": owner_id,
        "owner_display_name": owner_display_name or "",
        "name": name,
        "description": description or "",
        "tier": tier,
        "difficulty": difficulty,
        "visibility": visibility,
        "share_code": share_code,
        "num_cranes": len((layout or {}).get("cranes") or []),
        "num_lifts": len((layout or {}).get("lifts") or []),
        "num_restricted": len((layout or {}).get("restrictedZones") or []),
        "created_at": created_at.isoformat() if isinstance(created_at, datetime) else created_at,
        "updated_at": updated_at.isoformat() if isinstance(updated_at, datetime) else updated_at,
    }
    if with_layout:
        out["layout"] = layout
        out["config"] = config
    return out


def create_user_scenario(owner_id: str, owner_display_name: str, payload: Dict) -> Dict:
    """Insert a new user scenario. Raises ValueError on validation failure or
    quota exceeded."""
    if not owner_id:
        raise ValueError("owner_id required")
    clean = _validate_user_scenario_payload(payload)
    conn = _user_scen_db_or_raise()
    with conn.cursor() as cur:
        cur.execute("SELECT COUNT(*) FROM user_scenarios WHERE owner_id = %s", (owner_id,))
        (count,) = cur.fetchone()
        if count >= USER_SCEN_PER_USER_LIMIT:
            raise ValueError(f"한 계정당 최대 {USER_SCEN_PER_USER_LIMIT}개까지 만들 수 있습니다 (현재 {count}개)")
        sid = _new_user_scenario_id()
        share_code = _new_share_code()
        cur.execute(
            "INSERT INTO user_scenarios "
            "(id, owner_id, name, description, tier, difficulty, visibility, share_code, "
            " layout, config, owner_display_name) "
            "VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s::jsonb, %s::jsonb, %s) "
            "RETURNING id, owner_id, name, description, tier, difficulty, visibility, share_code, "
            "          layout, config, owner_display_name, created_at, updated_at",
            (sid, owner_id, clean["name"], clean["description"], clean["tier"],
             clean["difficulty"], clean["visibility"], share_code,
             json.dumps(clean["layout"], ensure_ascii=False),
             json.dumps(clean["config"], ensure_ascii=False),
             str(owner_display_name or "")[:64]),
        )
        return _row_to_user_scenario(cur.fetchone())


def update_user_scenario(scenario_id: str, owner_id: str, payload: Dict) -> Optional[Dict]:
    """Update fields on a user scenario the caller owns. Returns updated row
    or None if not found / not owner."""
    if not scenario_id or not owner_id:
        raise ValueError("scenario_id and owner_id required")
    clean = _validate_user_scenario_payload(payload)
    conn = _user_scen_db_or_raise()
    with conn.cursor() as cur:
        cur.execute(
            "UPDATE user_scenarios SET "
            "  name=%s, description=%s, tier=%s, difficulty=%s, visibility=%s, "
            "  layout=%s::jsonb, config=%s::jsonb, updated_at=now() "
            "WHERE id=%s AND owner_id=%s "
            "RETURNING id, owner_id, name, description, tier, difficulty, visibility, share_code, "
            "          layout, config, owner_display_name, created_at, updated_at",
            (clean["name"], clean["description"], clean["tier"], clean["difficulty"],
             clean["visibility"],
             json.dumps(clean["layout"], ensure_ascii=False),
             json.dumps(clean["config"], ensure_ascii=False),
             scenario_id, owner_id),
        )
        row = cur.fetchone()
        return _row_to_user_scenario(row) if row else None


def delete_user_scenario(scenario_id: str, owner_id: str) -> bool:
    if not scenario_id or not owner_id:
        return False
    conn = _user_scen_db_or_raise()
    with conn.cursor() as cur:
        cur.execute("DELETE FROM user_scenarios WHERE id=%s AND owner_id=%s",
                    (scenario_id, owner_id))
        return cur.rowcount > 0


def get_user_scenario(scenario_id: str) -> Optional[Dict]:
    """Look up a single user scenario by id. No access control here — callers
    enforce owner / visibility / share-code checks."""
    if not scenario_id:
        return None
    conn = _user_scen_db_or_raise()
    with conn.cursor() as cur:
        cur.execute(
            "SELECT id, owner_id, name, description, tier, difficulty, visibility, share_code, "
            "       layout, config, owner_display_name, created_at, updated_at "
            "FROM user_scenarios WHERE id=%s",
            (scenario_id,),
        )
        row = cur.fetchone()
        return _row_to_user_scenario(row) if row else None


def get_user_scenario_by_share_code(share_code: str) -> Optional[Dict]:
    if not share_code:
        return None
    conn = _user_scen_db_or_raise()
    with conn.cursor() as cur:
        cur.execute(
            "SELECT id, owner_id, name, description, tier, difficulty, visibility, share_code, "
            "       layout, config, owner_display_name, created_at, updated_at "
            "FROM user_scenarios WHERE share_code=%s",
            (share_code,),
        )
        row = cur.fetchone()
        return _row_to_user_scenario(row) if row else None


def list_user_scenarios(
    *, owner_id: Optional[str] = None, visibility: Optional[str] = None,
    with_layout: bool = False, limit: int = 200,
) -> List[Dict]:
    """List user scenarios. Pass owner_id to filter to one user; pass
    visibility='public' to scope to public ones. Layout is omitted by default
    to keep payload small — pass with_layout=True for the session-start
    resolver / share-code lookup."""
    conn = _user_scen_db_or_raise()
    sql = ("SELECT id, owner_id, name, description, tier, difficulty, visibility, share_code, "
           "       layout, config, owner_display_name, created_at, updated_at "
           "FROM user_scenarios")
    params: List[Any] = []
    wheres = []
    if owner_id:
        wheres.append("owner_id = %s"); params.append(owner_id)
    if visibility:
        if visibility not in USER_SCEN_VALID_VISIBILITY:
            raise ValueError(f"visibility must be one of {USER_SCEN_VALID_VISIBILITY}")
        wheres.append("visibility = %s"); params.append(visibility)
    if wheres:
        sql += " WHERE " + " AND ".join(wheres)
    sql += " ORDER BY updated_at DESC LIMIT %s"
    params.append(max(1, min(500, int(limit or 200))))
    out: List[Dict] = []
    with conn.cursor() as cur:
        cur.execute(sql, params)
        for row in cur.fetchall():
            out.append(_row_to_user_scenario(row, with_layout=with_layout))
    return out


def user_scenario_to_play_format(custom: Dict) -> Dict:
    """Convert a user_scenarios row into the dict shape that
    python_mappo.scenarios.SCENARIOS uses (the human_play session reads
    layout/config off this directly)."""
    return {
        "id": custom["id"],
        "tier": custom.get("tier") or "custom",
        "name": custom["name"],
        "description": custom.get("description") or "",
        "difficulty": int(custom.get("difficulty") or 3),
        "layout": custom["layout"],
        "config": custom["config"],
    }


# ----------------------------------------------------------------------
# Admin live-monitor helpers — used by /api/admin/db/* endpoints in app.py.
# All of these are read-mostly aggregates over the existing tables so the
# Crane Hub's "실시간 모니터" panel can poll a single snapshot endpoint
# instead of fanning out to every per-table API.

def _iso(dt):
    if dt is None:
        return None
    return dt.isoformat() if isinstance(dt, datetime) else str(dt)


def admin_db_counts() -> Dict:
    """Row counts for the tables the live panel watches. Each value is
    {'count': N, 'ok': bool, 'error': str|None} so the UI can render the
    metric. This build has no database, so the panel is told so once."""
    return {
        "ok": False,
        "error": "로컬 전용 빌드입니다. 데이터베이스 없이 파일에 저장합니다.",
        "tables": {},
    }

def admin_auth_users(limit: int = 50, search: str = "") -> List[Dict]:
    """Always []. Auth users live in the local file store in this build;
    the admin panel reads them through the participants view instead."""
    return []

def admin_research_participants(limit: int = 200, search: str = "") -> List[Dict]:
    """연구 참여 등록 목록 (관리자 전용).

    `research_participations`는 실명·학번·전화번호를 담고 있어 RLS + REVOKE로
    클라이언트 직접 접근이 막혀 있다(0002_research_play_mode.sql:45,51,54).
    이 함수는 서버 연결로만 읽으며, 호출부는 반드시 `_require_admin_access()`를
    통과해야 한다.

    진행도(research_progress)와 실제 제출 건수(plays)를 함께 붙여, 동의만 하고
    플레이하지 않은 참여자를 관리자가 구분할 수 있게 한다.
    """
    limit = max(1, min(500, int(limit or 200)))
    search = (search or "").strip()
    # 파일 폴백 — 로컬 개발용. 운영에서는 research.py:97이 file 스토리지일 때
    # 참여 등록 자체를 막으므로 이 경로에 실데이터가 쌓이지 않는다.
    with _research_file_lock:
        participations = _read_auth_file(RESEARCH_PARTICIPATIONS_PATH, {})
        progresses = _read_auth_file(RESEARCH_PROGRESS_PATH, {})
    if not isinstance(participations, dict):
        return []
    if not isinstance(progresses, dict):
        progresses = {}
    play_counts: Dict[str, int] = {}
    for play in list_plays(play_purpose="research"):
        key = str(play.get("participant_id") or "")
        if key:
            play_counts[key] = play_counts.get(key, 0) + 1
    needle = search.lower()
    out = []
    for row in participations.values():
        if not isinstance(row, dict):
            continue
        if needle and not any(
            needle in str(row.get(k) or "").lower()
            for k in ("full_name", "email", "student_number",
                      "university", "college", "department", "phone")
        ):
            continue
        pid = str(row.get("participant_id") or "")
        progress = progresses.get(pid) or {}
        sequence = [str(v) for v in (
            progress.get("scenario_sequence") or row.get("scenario_sequence") or []
        )]
        completed = [
            str(v) for v in (progress.get("completed_scenarios") or [])
            if str(v) in sequence
        ]
        out.append({
            "participant_id": pid,
            "user_id": str(row.get("user_id") or ""),
            **{
                key: str(row.get(key) or "")
                for key in _RESEARCH_TEXT_LIMITS
            },
            "consent_version": str(row.get("consent_version") or ""),
            "study_id": str(row.get("study_id") or ""),
            "study_version": str(row.get("study_version") or ""),
            "active": bool(row.get("active")),
            "open_data_consent": bool(row.get("open_data_consent")),
            "consented_at": row.get("consented_at") or "",
            "withdrawn_at": row.get("withdrawn_at") or "",
            "submitted_at": row.get("submitted_at") or "",
            "has_signature": bool(row.get("signature")),
            "unlocked_index": int(progress.get("unlocked_index") or 0),
            "completed_count": len(completed),
            "total_count": len(sequence),
            "play_count": play_counts.get(pid, 0),
        })
    out.sort(key=lambda r: str(r.get("consented_at") or ""), reverse=True)
    return out[:limit]


def get_research_signature(participant_id: str) -> Optional[str]:
    """한 참여자의 서명 data URL. 없으면 None (관리자 전용 — 호출부가 게이트).

    목록 API와 분리한 이유는 크기다. 서명은 건당 수 KB이고 목록은 최대 500명을
    돌려줄 수 있어, 표를 열 때마다 모든 서명을 끌어오면 pooler 왕복이 무거워진다.
    """
    pid = str(participant_id or "").strip()
    if not pid:
        return None
    with _research_file_lock:
        participations = _read_auth_file(RESEARCH_PARTICIPATIONS_PATH, {})
    if not isinstance(participations, dict):
        return None
    for row in participations.values():
        if isinstance(row, dict) and str(row.get("participant_id") or "") == pid:
            return row.get("signature") or None
    return None


def admin_recent_activity(limit: int = 20) -> List[Dict]:
    """Combined feed across plays / preferences / user_scenarios sorted
    by timestamp DESC. Each row is annotated with 'kind' so the UI can
    badge it. Bounded by `limit` per type then merged."""
    return []

def admin_list_all_user_scenarios(*, search: str = "", limit: int = 200) -> List[Dict]:
    """All user scenarios regardless of visibility / owner. Lightweight —
    omits layout/config to keep the payload small for the admin table."""
    conn = _user_scen_db_or_raise()
    limit = max(1, min(500, int(limit or 200)))
    params: List[Any] = []
    where = ""
    if search:
        where = (" WHERE name ILIKE %s OR description ILIKE %s OR "
                 "       owner_display_name ILIKE %s OR id ILIKE %s ")
        like = f"%{search}%"
        params.extend([like, like, like, like])
    params.append(limit)
    sql = (
        "SELECT id, owner_id, name, description, tier, difficulty, visibility, share_code, "
        "       layout, config, owner_display_name, created_at, updated_at "
        "FROM user_scenarios" + where +
        " ORDER BY updated_at DESC LIMIT %s"
    )
    out: List[Dict] = []
    with conn.cursor() as cur:
        cur.execute(sql, params)
        for row in cur.fetchall():
            out.append(_row_to_user_scenario(row, with_layout=False))
    return out


def admin_update_user_scenario(scenario_id: str, *, name: Optional[str] = None,
                               description: Optional[str] = None,
                               visibility: Optional[str] = None,
                               tier: Optional[str] = None,
                               difficulty: Optional[int] = None) -> Optional[Dict]:
    """Admin patch — no owner check. Only the listed metadata fields can
    be edited; layout/config require the full validate-rewrite path
    (use update_user_scenario for that)."""
    if not scenario_id:
        return None
    conn = _user_scen_db_or_raise()
    sets: List[str] = []
    params: List[Any] = []
    if name is not None:
        nm = str(name).strip()[:USER_SCEN_NAME_MAX]
        if not nm:
            raise ValueError("name required")
        sets.append("name=%s"); params.append(nm)
    if description is not None:
        sets.append("description=%s"); params.append(str(description).strip()[:USER_SCEN_DESC_MAX])
    if visibility is not None:
        if visibility not in USER_SCEN_VALID_VISIBILITY:
            raise ValueError(f"visibility must be one of {USER_SCEN_VALID_VISIBILITY}")
        sets.append("visibility=%s"); params.append(visibility)
    if tier is not None:
        if tier not in USER_SCEN_VALID_TIERS:
            raise ValueError(f"tier must be one of {USER_SCEN_VALID_TIERS}")
        sets.append("tier=%s"); params.append(tier)
    if difficulty is not None:
        d = int(difficulty)
        if d < 1 or d > 5:
            raise ValueError("difficulty must be 1..5")
        sets.append("difficulty=%s"); params.append(d)
    if not sets:
        return get_user_scenario(scenario_id)
    sets.append("updated_at=now()")
    params.append(scenario_id)
    sql = (
        "UPDATE user_scenarios SET " + ", ".join(sets) +
        " WHERE id=%s "
        "RETURNING id, owner_id, name, description, tier, difficulty, visibility, share_code, "
        "          layout, config, owner_display_name, created_at, updated_at"
    )
    with conn.cursor() as cur:
        cur.execute(sql, params)
        row = cur.fetchone()
        return _row_to_user_scenario(row, with_layout=False) if row else None


def admin_delete_user_scenario(scenario_id: str) -> bool:
    """Admin delete — no owner check."""
    if not scenario_id:
        return False
    conn = _user_scen_db_or_raise()
    with conn.cursor() as cur:
        cur.execute("DELETE FROM user_scenarios WHERE id=%s", (scenario_id,))
        return cur.rowcount > 0


# ----------------------------------------------------------------------
# Internal helpers

def _histogram(values, bins: int = 10, lo: float = 0, hi: float = 100) -> List[int]:
    if not values:
        return [0] * bins
    out = [0] * bins
    step = (hi - lo) / max(1, bins)
    for v in values:
        idx = int((v - lo) / step) if step else 0
        idx = max(0, min(bins - 1, idx))
        out[idx] += 1
    return out
