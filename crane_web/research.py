"""Versioned research-study contract used by the game API and both clients.

The JSON file is the source of truth so a running study's scenario order and
consent text do not silently change when scenarios or UI code are edited.
"""
from __future__ import annotations

import copy
import json
import os
from pathlib import Path
from typing import Any, Dict, List, Optional


_CONFIG_PATH = Path(__file__).with_name("research_study_v1.json")


def _load_config() -> Dict[str, Any]:
    raw = json.loads(_CONFIG_PATH.read_text(encoding="utf-8"))
    required = (
        "study_id",
        "study_version",
        "consent_version",
        "name",
        "scenario_sequence",
    )
    missing = [key for key in required if not raw.get(key)]
    if missing:
        raise RuntimeError(f"research study config missing: {', '.join(missing)}")
    sequence = raw.get("scenario_sequence")
    if not isinstance(sequence, list) or not sequence:
        raise RuntimeError("research study scenario_sequence must be a non-empty list")
    normalized = [str(value or "").strip() for value in sequence]
    if any(not value for value in normalized) or len(set(normalized)) != len(normalized):
        raise RuntimeError("research study scenario_sequence contains empty or duplicate ids")
    raw["scenario_sequence"] = normalized
    return raw


STUDY_CONFIG = _load_config()
STUDY_ID = str(STUDY_CONFIG["study_id"])
STUDY_VERSION = str(STUDY_CONFIG["study_version"])
CONSENT_VERSION = str(STUDY_CONFIG["consent_version"])
SCENARIO_SEQUENCE = tuple(STUDY_CONFIG["scenario_sequence"])


CONSENT_STATUS = str(STUDY_CONFIG.get("consent_status") or "draft").strip().lower()
# Escape hatch for UI and end-to-end verification of a not-yet-approved
# consent form.  Never opens a non-loopback or CRANE_PUBLIC_GAME server.
_DRAFT_PREVIEW_REQUESTED = os.environ.get(
    "CRANE_RESEARCH_ALLOW_DRAFT_CONSENT", ""
).strip().lower() in ("1", "true", "yes", "on")


# Mirrors app.PUBLIC_GAME_MODE's variable. Read here rather than imported so the
# crane_web -> app dependency stays one-directional (see crane_web/__init__.py).
PUBLIC_DEPLOYMENT = os.environ.get("CRANE_PUBLIC_GAME", "").strip().lower() in (
    "1", "true", "yes", "on",
)
_SERVER_HOST = os.environ.get("HOST", "127.0.0.1").strip().lower()
_LOOPBACK_BIND = _SERVER_HOST in ("127.0.0.1", "localhost", "::1")
ALLOW_DRAFT_CONSENT = (
    _DRAFT_PREVIEW_REQUESTED and _LOOPBACK_BIND and not PUBLIC_DEPLOYMENT
)


def local_draft_preview_active() -> bool:
    """Return the fail-closed runtime gate for draft-consent verification."""
    return bool(
        ALLOW_DRAFT_CONSENT and _LOOPBACK_BIND and not PUBLIC_DEPLOYMENT
    )


def research_enrollment_open(storage_kind: str = "") -> bool:
    """True when new participants may consent and register for the study."""
    return enrollment_block_reason(storage_kind) is None


def enrollment_block_reason(storage_kind: str = "") -> Optional[str]:
    """User-facing reason enrolment is closed, or None when it is open.

    ``storage_kind`` is injected by the caller (``crane_db.storage.storage_kind``)
    rather than imported, keeping this module free of a storage dependency.
    """
    if CONSENT_STATUS != "approved" and not local_draft_preview_active():
        return (
            "연구 참여 모집이 아직 열리지 않았습니다. "
            "동의서가 승인되면 실험 모드를 이용할 수 있습니다."
        )
    # Enrolment stores an email and a display name as plaintext JSON on the
    # local filesystem — acceptable for a machine you control, never for a
    # public deployment. This build has no server-side database, so a public
    # bind must refuse enrolment outright rather than collect identifiers.
    if PUBLIC_DEPLOYMENT and storage_kind == "file":
        return (
            "연구 데이터 저장소가 준비되지 않아 참여 등록을 받을 수 없습니다. "
            "잠시 후 다시 시도해 주세요."
        )
    return None


# 참여자에게 보이지 않는 연구 운영 항목. 파일에는 연구 기록으로 남기되
# 클라이언트 응답에서는 제외한다 — 화면에서만 감추면 개발자도구·API 응답으로
# 그대로 노출되기 때문이다.
_INTERNAL_STUDY_KEYS = ("target_participants",)


def public_study_config() -> Dict[str, Any]:
    """Return a detached copy safe to include in an authenticated response."""
    cfg = copy.deepcopy(STUDY_CONFIG)
    for key in _INTERNAL_STUDY_KEYS:
        cfg.pop(key, None)
    # Derived, not stored: the client uses it to hide the enrolment entry point
    # so a participant never fills the PII form only to be rejected on submit.
    from crane_db.storage import storage_kind
    reason = enrollment_block_reason(storage_kind())
    cfg["enrollment_open"] = reason is None
    cfg["enrollment_blocked_reason"] = reason
    cfg["local_draft_preview"] = (
        CONSENT_STATUS != "approved"
        and local_draft_preview_active()
        and reason is None
    )
    return cfg


def scenario_sequence() -> List[str]:
    return list(SCENARIO_SEQUENCE)


def scenario_order(scenario_id: str) -> int:
    """Return the zero-based frozen study order, or -1 when not in the study."""
    try:
        return SCENARIO_SEQUENCE.index(str(scenario_id or ""))
    except ValueError:
        return -1
