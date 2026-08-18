from http.server import ThreadingHTTPServer, SimpleHTTPRequestHandler
from http.cookies import SimpleCookie
from collections import deque
from pathlib import Path
from typing import Any, Dict, List, Optional, Tuple
import os, sys, json, time, subprocess, threading, urllib.parse, urllib.request, urllib.error, hashlib, hmac, ipaddress, re, mimetypes
import yaml

from crane_web.paths import (
    ROOT,
    TRAINER_ROOT,
    LEGACY_MAPPO_ROOT,
    TRAINER_CONFIG_PATH,
    TRAINER_DASHBOARD_RUNS,
    TRAINER_AUTO_REWARD_RUNS,
    AUTO_REWARD_RUN_ROOTS,
)
os.chdir(ROOT)


def _load_dotenv():
    """Load KEY=VALUE pairs from .env (then .env.local) into os.environ.
    Existing env vars win — useful so the deploy platform's dashboard values
    keep taking precedence and the local .env doesn't accidentally override
    production.
    Minimal parser: no shell interpolation, no multi-line. Supports
    `#` comments, blank lines, optional `export ` prefix, and surrounding
    single/double quotes around the value."""
    for name in ('.env', '.env.local'):
        path = ROOT / name
        if not path.exists():
            continue
        try:
            text = path.read_text(encoding='utf-8')
        except OSError:
            continue
        for raw in text.splitlines():
            line = raw.strip()
            if not line or line.startswith('#'):
                continue
            if line.startswith('export '):
                line = line[7:].lstrip()
            if '=' not in line:
                continue
            k, _, v = line.partition('=')
            k = k.strip()
            v = v.strip()
            if (len(v) >= 2) and ((v[0] == v[-1] == '"') or (v[0] == v[-1] == "'")):
                v = v[1:-1]
            if not k or k in os.environ:
                continue
            os.environ[k] = v


_load_dotenv()


def _apply_local_research_preview_isolation() -> bool:
    """Keep draft-consent UI verification on the developer machine.

    The opt-in is accepted only when the HTTP server binds to a loopback
    address and public-game mode is off.
    """
    enabled = os.environ.get(
        'CRANE_RESEARCH_ALLOW_DRAFT_CONSENT', ''
    ).strip().lower() in ('1', 'true', 'yes', 'on')
    host = os.environ.get('HOST', '127.0.0.1').strip().lower()
    public_game = os.environ.get(
        'CRANE_PUBLIC_GAME', ''
    ).strip().lower() in ('1', 'true', 'yes', 'on')
    if not enabled or host not in ('127.0.0.1', 'localhost', '::1') or public_game:
        return False
    return True


LOCAL_RESEARCH_PREVIEW = _apply_local_research_preview_isolation()
WEB_ROOT = ROOT / 'web'
# crane-sim(독립 3D 시뮬 앱)의 빌드 산출물. 소스 병합이 아니라 컴파일된
# 정적 번들만 여기 호스팅한다 — `/sim/` 라우트로 서빙 (AGENTS.md: V2 코드 병합 금지).
# 갱신: crane-sim에서 `npm run build` 후 dist/ → 이 폴더로 복사 (scripts/update_sim.py).
SIM_ROOT = WEB_ROOT / 'sim'
# 정적 미디어(튜토리얼 영상 등). `/assets/` 라우트로 서빙 — 공개, 경로 탈출은
# ASSETS_ROOT 내부로 제한 (sim 라우트와 동일 패턴).
ASSETS_ROOT = WEB_ROOT / 'assets'
DASHBOARD_TOKEN = os.environ.get('CRANE_DASHBOARD_TOKEN', '').strip()
ALLOWED_STATIC_PATHS = {'/index.html', '/hub', '/hub/', '/trainer', '/trainer/', '/game', '/game/'}


def _positive_int_env(name: str, default: int) -> int:
    try:
        value = int(os.environ.get(name, str(default)))
    except (TypeError, ValueError):
        return default
    return value if value > 0 else default


MAX_JSON_BODY_BYTES = _positive_int_env('CRANE_MAX_JSON_BODY_BYTES', 1024 * 1024)
JSON_POST_PATHS = frozenset({
    '/api/auth/signup',
    '/api/auth/login',
    '/api/auth/logout',
    '/api/auth/resend',
    '/api/profile/migrate',
    '/api/plan/run',
    '/api/plan/cost',
    '/api/score-schedule',
    '/api/auto-reward/start',
    '/api/auto-reward/stop',
    '/api/train/start',
    '/api/train/stop',
    '/api/curriculum/start',
    '/api/models/label',
    '/api/game/scenarios/custom',
    '/api/game/session/start',
    '/api/game/session/step',
    '/api/game/session/sweep-step',
    '/api/game/session/undo',
    '/api/game/session/restart',
    '/api/game/session/state',
    '/api/game/session/submit',
    '/api/game/session/drop',
    '/api/game/research/participation',
    # 서명 보충은 본문(data URL)이 필수다. 제출 표시는 본문이 없다
    # (OPTIONAL_JSON_POST_PATHS 쪽에 둔다).
    '/api/game/research/signature',
    '/api/game/irl/run',
    '/api/game/baseline/run',
})
OPTIONAL_JSON_POST_PATHS = frozenset({
    '/api/auth/logout',
    '/api/auto-reward/stop',
    '/api/train/stop',
    '/api/game/irl/run',
    # 제출 표시는 쿠키의 사용자만으로 충분하다 — 본문이 없다.
    '/api/game/research/submit',
})
# Public-game mode: when CRANE_PUBLIC_GAME=1, /api/game/* paths bypass the
# token / loopback gate. Intended for public deployments where
# anyone can play and submit. Training / model / config endpoints stay gated
# so RL runs and stored credentials can't be triggered externally.
PUBLIC_GAME_MODE = os.environ.get('CRANE_PUBLIC_GAME', '').strip().lower() in ('1', 'true', 'yes', 'on')
PUBLIC_GAME_PREFIXES = ('/api/game/',)
PUBLIC_AUTH_PREFIXES = ('/api/auth/',)
# Admin escape hatch for hosted deployments. Set CRANE_ADMIN_EMAILS to a
# comma-separated allowlist; matching logged-in users count as
# admins (same access as loopback / dashboard token) so the operator can run
# training, list models, etc. from a browser without exposing a shared token.
ADMIN_EMAILS = frozenset(
    e.strip().lower()
    for e in os.environ.get('CRANE_ADMIN_EMAILS', '').split(',')
    if e.strip()
)
AUTH_COOKIE_NAME = 'crane_auth'
AUTH_REFRESH_COOKIE_NAME = 'crane_refresh'
AUTH_COOKIE_MAX_AGE = 60 * 60 * 24 * int(os.environ.get('CRANE_AUTH_SESSION_DAYS', '30') or 30)
from crane_web.config_helpers import (  # noqa: E402
    _apply_crane_types_to_cfg,
    _apply_lift_load_config_to_cfg,
    _apply_restricted_zones_to_cfg,
    _coerce_crane_types,
    _copy_model_plan_config,
    _read_yaml,
    _write_yaml,
)
from crane_web.model_meta import (  # noqa: E402
    _db_row_to_model_entry,
    _extract_model_meta,
    _label_mtime_ns,
    _list_models,
    _model_meta_to_db_patch,
    _resolve_model_path,
)
from crane_web.http_util import _send_json, _send_file  # noqa: E402
from crane_web.net_util import _host_name, _is_loopback_name, _is_loopback_client  # noqa: E402
from crane_web.jobs import (  # noqa: E402
    JOBS,
    JOBS_LOCK,
    PROGRESS_RETAIN,
    _job_response_snapshot,
    _running_job_snapshot,
    _reader,
    get_latest_job_id,
    set_latest_job_id,
    get_latest_auto_reward_job_id,
    set_latest_auto_reward_job_id,
)
from crane_web.scenarios_cache import (  # noqa: E402
    _get_public_scenarios_cached,
    _invalidate_public_scenarios_cache,
)
from crane_web.handlers.game_session import GameSessionHandlerMixin  # noqa: E402
from crane_web.handlers.auth import AuthProfileHandlerMixin  # noqa: E402
from crane_web.handlers.admin_db import AdminDbHandlerMixin  # noqa: E402
from crane_web.handlers.irl import GameIrlHandlerMixin  # noqa: E402
from crane_web.handlers.scenarios import ScenarioHandlerMixin  # noqa: E402
from crane_web.handlers.game_query import GameQueryHandlerMixin  # noqa: E402
from crane_web.handlers.model_admin import ModelAdminHandlerMixin  # noqa: E402
from crane_web.handlers.planning import PlanningHandlerMixin  # noqa: E402
from crane_web.handlers.training import TrainingHandlerMixin  # noqa: E402


# Bounded, in-memory rate limiting for abuse-prone public endpoints. Each bucket
# is keyed by client IP per category; entries live only in this process (a restart
# clears them, which is fine since these guard against bursts and brute force, not
# long campaigns). Loopback clients are exempt so local development and the test
# suite are never throttled. Configure as "EVENTS/WINDOW_SECONDS"; set EVENTS to 0
# to disable a category entirely.
def _rate_limit_env(name: str, default: str) -> Tuple[int, int]:
    raw = (os.environ.get(name, '') or '').strip() or default
    events_s, _, window_s = raw.partition('/')
    try:
        events = int(events_s)
        window = int(window_s) if window_s else 60
    except (TypeError, ValueError):
        d_events, _, d_window = default.partition('/')
        events, window = int(d_events), int(d_window or 60)
    return (events if events > 0 else 0), (window if window > 0 else 60)


class _RateLimiter:
    """Sliding-window counter: at most ``max_events`` per ``window`` seconds for
    each key. Thread-safe; expired timestamps and emptied buckets are pruned so
    memory stays bounded even with many distinct client IPs."""

    def __init__(self, max_events: int, window_seconds: int):
        self.max_events = max_events
        self.window = window_seconds
        self._lock = threading.Lock()
        self._hits: Dict[str, deque] = {}

    @property
    def enabled(self) -> bool:
        return self.max_events > 0 and self.window > 0

    def hit(self, key: str, now: Optional[float] = None) -> int:
        """Record an attempt for ``key``. Returns 0 when allowed, otherwise the
        integer seconds the caller should wait before retrying."""
        if not self.enabled:
            return 0
        now = time.time() if now is None else now
        cutoff = now - self.window
        with self._lock:
            dq = self._hits.get(key)
            if dq is None:
                dq = self._hits[key] = deque()
            while dq and dq[0] <= cutoff:
                dq.popleft()
            if len(dq) >= self.max_events:
                retry_after = int(dq[0] + self.window - now)
                return retry_after if retry_after > 0 else 1
            dq.append(now)
            if len(self._hits) > 1024:  # opportunistically drop emptied buckets
                for stale in [k for k, v in self._hits.items() if not v]:
                    del self._hits[stale]
            return 0


_AUTH_RATE_LIMITER = _RateLimiter(*_rate_limit_env('CRANE_RATE_LIMIT_AUTH', '20/60'))
_GAME_RATE_LIMITER = _RateLimiter(*_rate_limit_env('CRANE_RATE_LIMIT_GAME', '6/60'))
# Play submissions. A human needs roughly a minute per scenario, so a budget of
# 30 start/submit calls per minute leaves honest players (including restarts and
# quick abandons) far below the ceiling while stopping scripted flooding of the
# research dataset.
_PLAY_RATE_LIMITER = _RateLimiter(*_rate_limit_env('CRANE_RATE_LIMIT_PLAY', '30/60'))
# Outer ceiling for the same paths, keyed by IP. The per-player budget above is
# keyed by auth cookie so a lecture hall sharing one campus NAT does not share a
# budget; this bound stops someone rotating fake cookies to mint fresh buckets.
# Sized well above a full classroom (30 players x ~2 calls/min = 60).
_PLAY_IP_RATE_LIMITER = _RateLimiter(*_rate_limit_env('CRANE_RATE_LIMIT_PLAY_IP', '300/60'))
# Per-IP ceiling for signup/login, sized so a whole class arriving together is
# not throttled while a single address still cannot flood the auth backend.
_IDENTITY_RATE_LIMITER = _RateLimiter(*_rate_limit_env('CRANE_RATE_LIMIT_IDENTITY', '90/60'))
# Brute-force guard: attempts against ONE account from one address. Tighter
# than the old blanket per-IP budget, so single-account attacks are better
# protected than before even though the classroom is no longer blocked.
_LOGIN_ID_RATE_LIMITER = _RateLimiter(*_rate_limit_env('CRANE_RATE_LIMIT_LOGIN_ID', '10/60'))
# Identity endpoints whose budget is per-IP and tight: they are either rare
# (resend, enrolment) or their abuse is not shaped like a classroom burst.
RATE_LIMIT_AUTH_PATHS = frozenset({
    '/api/auth/resend',
    # Enrolment writes PII rows; treat it like the other identity endpoints.
    '/api/game/research/participation',
})
# Signup and login cannot be keyed by an auth cookie — the account does not
# exist or is not yet established. A classroom on one campus NAT therefore
# bursts through a tight per-IP budget: 30 students signing up at once had 10
# of them rejected with 429 under the old 20/60. Give these a ceiling sized for
# a full class, and guard brute force where it actually belongs — per targeted
# account, checked inside the login handler (_LOGIN_ID_RATE_LIMITER).
RATE_LIMIT_IDENTITY_PATHS = frozenset({
    '/api/auth/signup', '/api/auth/login',
})
RATE_LIMIT_GAME_PATHS = frozenset({
    '/api/game/irl/run', '/api/game/baseline/run',
})
# Deliberately excludes step / sweep-step / undo / state: those fire many times
# inside a single play, and throttling them would break an honest session
# mid-way — losing the very data the deployment exists to collect.
RATE_LIMIT_PLAY_PATHS = frozenset({
    '/api/game/session/start', '/api/game/session/submit',
})

# Behind a reverse proxy (nginx, Cloudflare, ...) every visitor shares one
# TCP peer address, so IP-keyed limits would collapse into a single global
# bucket: one abuser could lock out the whole cohort. Set CRANE_TRUST_PROXY=1
# only when such a proxy is actually in front of the app — otherwise a client
# can forge X-Forwarded-For and bypass the limiter at will.
TRUST_PROXY_HEADERS = os.environ.get('CRANE_TRUST_PROXY', '').strip().lower() in ('1', 'true', 'yes', 'on')
# How many proxies of our own sit in front of the app. A single CDN alone
# is one hop. Only this many entries from the right of X-Forwarded-For are
# trustworthy — everything further left is client-supplied text.
TRUST_PROXY_HOPS = _positive_int_env('CRANE_TRUST_PROXY_HOPS', 1)


def _parse_forwarded_ips(header_value: str) -> List[str]:
    """Every syntactically valid address in an X-Forwarded-For list, in order."""
    out: List[str] = []
    for part in (header_value or '').split(','):
        candidate = part.strip()
        if candidate.startswith('[') and ']' in candidate:  # [::1]:port
            candidate = candidate[1:candidate.index(']')]
        elif candidate.count(':') == 1:  # ipv4:port
            candidate = candidate.split(':', 1)[0]
        try:
            out.append(str(ipaddress.ip_address(candidate)))
        except ValueError:
            continue
    return out


def _forwarded_client_ip(header_value: str, hops: int = None) -> str:
    """The client address as vouched for by our own trusted proxies.

    X-Forwarded-For grows left to right: each proxy APPENDS the address it
    received the request from. So the rightmost entry was written by the proxy
    closest to us and is the only one a client cannot forge; entries further
    left are whatever the client chose to send. With ``hops`` trusted proxies
    in front of the app, the address they collectively vouch for sits ``hops``
    from the right.

    Taking the leftmost entry — the usual first guess — is exactly wrong on a
    proxy that appends: a client sending
    ``X-Forwarded-For: 1.2.3.4`` would then pick its own forged value and could
    mint a fresh rate-limit bucket per request.
    """
    hops = TRUST_PROXY_HOPS if hops is None else hops
    chain = _parse_forwarded_ips(header_value)
    if not chain:
        return ''
    index = len(chain) - max(1, int(hops))
    return chain[index] if index >= 0 else chain[0]


_QUERY_PARAM_RE = re.compile(r'([?&])([^=&\s]+)=([^&\s]*)')


def _redact_token_query(value: str) -> str:
    """Redact token query values before request targets reach access logs.

    The browser consumes ``?token=...`` only as a one-time local bootstrap.
    SimpleHTTPRequestHandler otherwise logs the raw request line, including the
    credential. Decode the parameter *name* so encoded variants are covered
    while leaving unrelated query parameters unchanged for diagnostics.
    """
    def replace(match):
        try:
            key = urllib.parse.unquote_plus(match.group(2)).casefold()
        except Exception:
            key = ''
        if key != 'token':
            return match.group(0)
        return f'{match.group(1)}{match.group(2)}=[REDACTED]'

    return _QUERY_PARAM_RE.sub(replace, str(value or ''))

class Handler(
    GameSessionHandlerMixin,
    AuthProfileHandlerMixin,
    AdminDbHandlerMixin,
    GameIrlHandlerMixin,
    ScenarioHandlerMixin,
    GameQueryHandlerMixin,
    ModelAdminHandlerMixin,
    PlanningHandlerMixin,
    TrainingHandlerMixin,
    SimpleHTTPRequestHandler,
):
    def end_headers(self):
        self.send_header('Cache-Control', 'no-store')
        self.send_header('Referrer-Policy', 'same-origin')
        self.send_header('X-Content-Type-Options', 'nosniff')
        super().end_headers()

    def log_message(self, format, *args):
        safe_args = tuple(
            _redact_token_query(arg) if isinstance(arg, str) else arg
            for arg in args
        )
        super().log_message(format, *safe_args)

    def _auth_cookie_secure(self):
        forced = os.environ.get('CRANE_AUTH_COOKIE_SECURE', '').strip().lower()
        if forced in ('1', 'true', 'yes', 'on'):
            return True
        proto = self.headers.get('X-Forwarded-Proto', '').split(',', 1)[0].strip().lower()
        return proto == 'https'

    def _auth_cookie_header(self, token: str, max_age: int = AUTH_COOKIE_MAX_AGE, name: str = AUTH_COOKIE_NAME):
        value = urllib.parse.quote(token or '', safe='')
        parts = [
            f'{name}={value}',
            'Path=/',
            f'Max-Age={int(max_age)}',
            'HttpOnly',
            'SameSite=Lax',
        ]
        if self._auth_cookie_secure():
            parts.append('Secure')
        return '; '.join(parts)

    def _auth_cookie_token(self, name: str = AUTH_COOKIE_NAME):
        raw = self.headers.get('Cookie', '')
        if not raw:
            return ''
        try:
            jar = SimpleCookie()
            jar.load(raw)
            morsel = jar.get(name)
            return urllib.parse.unquote(morsel.value) if morsel else ''
        except Exception:
            return ''

    def _auth_clear_cookie_headers(self):
        return [
            self._auth_cookie_header('', max_age=0, name=AUTH_COOKIE_NAME),
            self._auth_cookie_header('', max_age=0, name=AUTH_REFRESH_COOKIE_NAME),
        ]

    def _auth_session_cookie_headers(self, session):
        headers = []
        access_token = (session or {}).get('access_token')
        refresh_token = (session or {}).get('refresh_token')
        if access_token:
            headers.append(self._auth_cookie_header(
                access_token,
                max_age=min(AUTH_COOKIE_MAX_AGE, int((session or {}).get('expires_in') or 3600)),
                name=AUTH_COOKIE_NAME,
            ))
        if refresh_token:
            headers.append(self._auth_cookie_header(
                refresh_token,
                max_age=AUTH_COOKIE_MAX_AGE,
                name=AUTH_REFRESH_COOKIE_NAME,
            ))
        return headers

    def _queue_set_cookies(self, cookies):
        if not cookies:
            return
        pending = getattr(self, '_pending_extra_headers', {}) or {}
        existing = pending.get('Set-Cookie') or []
        if isinstance(existing, str):
            existing = [existing]
        pending['Set-Cookie'] = existing + list(cookies)
        self._pending_extra_headers = pending

    def _current_user(self):
        if hasattr(self, '_current_user_cache'):
            return self._current_user_cache
        token = self._auth_cookie_token()
        user = None
        if token:
            from crane_db.storage import load_auth_session
            user = load_auth_session(token)
        self._current_user_cache = user
        return user

    def _require_game_user(self):
        user = self._current_user()
        if user:
            return user
        _send_json(self, {'ok': False, 'message': '로그인이 필요합니다.'}, 401)
        return None

    def _is_admin_email_user(self):
        """True when the logged-in user's email is in CRANE_ADMIN_EMAILS.
        Falls back to False on any auth lookup error."""
        if not ADMIN_EMAILS:
            return False
        try:
            user = self._current_user()
        except Exception:
            return False
        if not user:
            return False
        email = (user.get('email') or '').strip().lower()
        return bool(email) and email in ADMIN_EMAILS

    def _require_api_access(self):
        path = urllib.parse.urlparse(self.path).path
        if any(path.startswith(p) for p in PUBLIC_AUTH_PREFIXES):
            return True
        # Public-game mode: /api/game/* bypasses auth so external players can
        # submit plays without a token. Everything else still goes through
        # the token / loopback gate.
        if PUBLIC_GAME_MODE:
            if any(path.startswith(p) for p in PUBLIC_GAME_PREFIXES):
                return True
        if DASHBOARD_TOKEN:
            supplied = self.headers.get('X-Crane-Token', '')
            auth = self.headers.get('Authorization', '')
            if not supplied and auth.lower().startswith('bearer '):
                supplied = auth[7:].strip()
            if hmac.compare_digest(supplied, DASHBOARD_TOKEN):
                return True
            # A configured token doesn't preclude admin-email login; let the
            # email allowlist through before falling out with a 401 below.
            if self._is_admin_email_user():
                return True
            _send_json(self, {'ok': False, 'message': 'valid X-Crane-Token required'}, 401)
            return False
        host = _host_name(self.headers.get('Host', ''))
        if (not host or _is_loopback_name(host)) and self._is_local_operator():
            return True
        if self._is_admin_email_user():
            return True
        _send_json(
            self,
            {'ok': False, 'message': 'API disabled for non-loopback hosts unless CRANE_DASHBOARD_TOKEN or CRANE_ADMIN_EMAILS is set'},
            401,
        )
        return False

    def do_HEAD(self):
        parsed = urllib.parse.urlparse(self.path)
        if parsed.path == '/sim' or parsed.path.startswith('/sim/'):
            return self._serve_sim(parsed, head_only=True)
        if parsed.path.startswith('/assets/'):
            return self._serve_asset(parsed, head_only=True)
        if parsed.path == '/favicon.ico':
            self.send_response(204)
            self.end_headers()
            return
        if parsed.path == '/':
            return _send_file(self, WEB_ROOT / 'promo.html', 'text/html; charset=utf-8', head_only=True)
        if parsed.path in ('/game/mobile', '/game/mobile/'):
            return _send_file(self, WEB_ROOT / 'game-mobile.html', 'text/html; charset=utf-8', head_only=True)
        if parsed.path in ALLOWED_STATIC_PATHS:
            return _send_file(self, WEB_ROOT / 'index.html', 'text/html; charset=utf-8', head_only=True)
        if parsed.path in ('/promo', '/promo/', '/promo.html'):
            return _send_file(self, WEB_ROOT / 'promo.html', 'text/html; charset=utf-8', head_only=True)
        if parsed.path.startswith('/api/'):
            return _send_json(
                self,
                {'ok': False, 'message': 'HEAD is not supported for API endpoints'},
                405,
                extra_headers={'Allow': 'GET, POST, PUT, DELETE'},
                head_only=True,
            )
        return _send_json(
            self,
            {'ok': False, 'message': 'static file access is restricted'},
            403,
            head_only=True,
        )

    def _serve_asset(self, parsed, head_only=False):
        """`web/assets/` 정적 미디어를 `/assets/` 아래로 서빙한다 (튜토리얼
        영상 등). 공개 라우트, 경로 탈출은 ASSETS_ROOT 내부로 제한.

        HTTP Range(단일 구간)를 지원한다 — <video> 재생에 필수적이다. 브라우저는
        moov 메타데이터를 얻으려고 파일 꼬리를 Range 로 요청하고, 시킹 때도
        구간 요청을 보낸다. 미지원(200 전체 응답)이면 25MB 영상은 전부 받기
        전까지 재생이 시작되지 않는다."""
        rel = parsed.path[len('/assets'):].lstrip('/')
        if not rel:
            return _send_json(self, {'ok': False, 'message': 'not found'}, 404, head_only=head_only)
        target = (ASSETS_ROOT / rel).resolve()
        try:
            target.relative_to(ASSETS_ROOT.resolve())
        except ValueError:
            return _send_json(self, {'ok': False, 'message': 'forbidden'}, 403, head_only=head_only)
        if not target.is_file():
            return _send_json(self, {'ok': False, 'message': 'not found'}, 404, head_only=head_only)
        ctype = mimetypes.guess_type(str(target))[0] or 'application/octet-stream'
        size = target.stat().st_size
        rng = self.headers.get('Range', '')
        m = re.match(r'bytes=(\d*)-(\d*)$', rng.strip()) if rng else None
        if m and (m.group(1) or m.group(2)):
            if m.group(1):
                start = int(m.group(1))
                end = min(int(m.group(2)), size - 1) if m.group(2) else size - 1
            else:  # suffix range: 마지막 N바이트 (moov 꼬리 요청이 이 형태)
                start = max(0, size - int(m.group(2)))
                end = size - 1
            if start >= size or start > end:
                self.send_response(416)
                self.send_header('Content-Range', f'bytes */{size}')
                self.end_headers()
                return
            with open(target, 'rb') as f:
                f.seek(start)
                chunk = f.read(end - start + 1)
            self.send_response(206)
            self.send_header('Content-Type', ctype)
            self.send_header('Content-Range', f'bytes {start}-{end}/{size}')
            self.send_header('Content-Length', str(len(chunk)))
            self.send_header('Accept-Ranges', 'bytes')
            self.end_headers()
            if not head_only:
                self.wfile.write(chunk)
            return
        # 전체 응답에도 Accept-Ranges 를 알려 브라우저가 구간 요청을 쓰게 한다.
        data = target.read_bytes()
        self.send_response(200)
        self.send_header('Content-Type', ctype)
        self.send_header('Content-Length', str(size))
        self.send_header('Accept-Ranges', 'bytes')
        self.end_headers()
        if not head_only:
            self.wfile.write(data)

    def _serve_sim(self, parsed, head_only=False):
        """crane-sim 빌드 번들을 `/sim/` 아래로 서빙한다. 공개 정적 라우트
        (인증 불필요, promo와 동일). 경로 탈출은 SIM_ROOT 내부로 제한."""
        rel = parsed.path[len('/sim'):].lstrip('/')
        if not rel:
            rel = 'index.html'
        target = (SIM_ROOT / rel).resolve()
        try:
            target.relative_to(SIM_ROOT.resolve())
        except ValueError:
            return _send_json(self, {'ok': False, 'message': 'forbidden'}, 403)
        if not target.is_file():
            return _send_json(self, {'ok': False, 'message': 'sim not found'}, 404)
        ctype = mimetypes.guess_type(str(target))[0] or 'application/octet-stream'
        if ctype.startswith('text/') or ctype in ('application/javascript', 'application/json'):
            ctype += '; charset=utf-8'
        return _send_file(self, target, ctype, head_only=head_only)

    def do_GET(self):
        parsed = urllib.parse.urlparse(self.path)
        if parsed.path == '/sim/__mtime':
            # crane-sim watch:dash 라이브리로드용. 빌드 산출물(index.html)의
            # 수정 시각을 돌려주고, 브라우저가 폴링해 바뀌면 새로고침한다.
            idx = SIM_ROOT / 'index.html'
            mtime = idx.stat().st_mtime if idx.is_file() else 0
            return _send_json(self, {'mtime': mtime})
        if parsed.path == '/sim' or parsed.path.startswith('/sim/'):
            return self._serve_sim(parsed)
        if parsed.path.startswith('/assets/'):
            return self._serve_asset(parsed)
        if parsed.path == '/favicon.ico':
            self.send_response(204)
            self.end_headers()
            return
        if parsed.path.startswith('/api/') and not self._require_api_access():
            return
        if parsed.path == '/api/auth/me':
            return self._handle_auth_me()
        if parsed.path == '/api/profile':
            return self._handle_profile_get()
        if parsed.path == '/api/config':
            cfg = _read_yaml(TRAINER_CONFIG_PATH)
            return _send_json(self, cfg)
        if parsed.path == '/api/auto-reward/status':
            return self._handle_auto_reward_status(parsed)
        if parsed.path == '/api/train/status':
            qs = urllib.parse.parse_qs(parsed.query)
            job_id = qs.get('jobId', [get_latest_job_id()])[0]
            if not job_id or job_id not in JOBS:
                return _send_json(self, {'ok': False, 'message': '학습 job이 없습니다.'}, 404)
            with JOBS_LOCK:
                src = JOBS[job_id]
                # Snapshot shared mutable structures while holding the lock so the
                # reader thread can't mutate them mid-serialization.
                log_snap = list(src['log'])
                progress_snap = list(src['progress'])
                progress_total = int(src.get('progressTotal', len(progress_snap)))
                latest_layout = src.get('latestLayout')
                job = {k: v for k, v in src.items() if k not in ('log', 'progress', 'process')}
            job['latestLayout'] = latest_layout
            job['logTail'] = log_snap[-80:]
            # Map the client's `since` (absolute lifetime count of entries it already has)
            # onto the bounded deque snapshot. progress_offset is how many entries fell off
            # the front; if the client is behind by more than the deque capacity it'll see a
            # gap, which is preferable to letting JOBS grow without bound on 1000-ep runs.
            since_abs = max(0, min(progress_total, int(qs.get('since', ['0'])[0] or 0)))
            progress_offset = progress_total - len(progress_snap)
            rel = max(0, since_abs - progress_offset)
            job['progress'] = progress_snap[rel:]
            job['progressTotal'] = progress_total
            return _send_json(self, {'ok': True, 'job': job})
        if parsed.path == '/api/models/list':
            # owner=me filters to the caller's own models; owner=<uuid> is
            # admin-only (the rglob also walks every user's outputs, so we
            # can't safely honor an arbitrary UUID for non-admin callers).
            qs = urllib.parse.parse_qs(parsed.query)
            owner = (qs.get('owner', [''])[0] or '').strip()
            owner_id = None
            if owner == 'me':
                user = self._current_user()
                if not user or not user.get('id'):
                    return _send_json(self, {'ok': False, 'message': '로그인이 필요합니다.'}, 401)
                owner_id = str(user.get('id'))
            elif owner:
                if not self._is_admin_request():
                    return _send_json(self, {'ok': False, 'message': '관리자만 다른 사용자 필터를 사용할 수 있습니다.'}, 403)
                owner_id = owner
            return _send_json(self, {'ok': True, 'models': _list_models(owner_id=owner_id)})
        if parsed.path == '/api/game/scenarios':
            return self._handle_game_scenarios(parsed)
        if parsed.path == '/api/game/scenarios/custom':
            return self._handle_user_scenario_get(parsed)
        if parsed.path == '/api/game/plays':
            return self._handle_game_plays(parsed)
        if parsed.path == '/api/game/leaderboard':
            return self._handle_game_leaderboard(parsed)
        if parsed.path == '/api/game/heatmap':
            return self._handle_game_heatmap(parsed)
        if parsed.path == '/api/game/research/status':
            return self._handle_research_status()
        if parsed.path == '/api/game/irl/run/status':
            return self._handle_game_irl_run_status()
        if parsed.path == '/api/game/irl/latest':
            return self._handle_game_irl_latest(parsed)
        if parsed.path == '/api/game/irl/ab-report':
            return self._handle_game_irl_ab_report(parsed)
        if parsed.path == '/api/game/irl/cross-validate':
            return self._handle_game_irl_cross_validate(parsed)
        if parsed.path == '/api/game/auto-reward/runs':
            return self._handle_game_auto_reward_runs(parsed)
        if parsed.path == '/api/game/irl/list':
            return self._handle_game_irl_list(parsed)
        if parsed.path == '/api/game/irl':
            return self._handle_game_irl_artifact_get(parsed)
        if parsed.path == '/api/admin/db/snapshot':
            return self._handle_admin_db_snapshot(parsed)
        if parsed.path == '/api/admin/db/users':
            return self._handle_admin_db_users(parsed)
        if parsed.path == '/api/admin/db/participants':
            return self._handle_admin_db_participants(parsed)
        if parsed.path == '/api/admin/db/participant-signature':
            return self._handle_admin_db_participant_signature(parsed)
        if parsed.path == '/api/admin/db/scenarios':
            return self._handle_admin_db_scenarios(parsed)
        if parsed.path == '/':
            return _send_file(self, WEB_ROOT / 'promo.html', 'text/html; charset=utf-8')
        # 모바일 전용 플레이 클라이언트 — 데스크톱 index.html과 완전히 별도 페이지.
        # 같은 게임 API(/api/game/*, /api/auth/*)를 재사용하는 모바일 우선 UI.
        if parsed.path in ('/game/mobile', '/game/mobile/'):
            return _send_file(self, WEB_ROOT / 'game-mobile.html', 'text/html; charset=utf-8')
        if parsed.path in ALLOWED_STATIC_PATHS:
            return _send_file(self, WEB_ROOT / 'index.html', 'text/html; charset=utf-8')
        # 홍보 랜딩 페이지 — 인증 불필요한 공개 정적 페이지 (3D 데모는 자체 구동)
        if parsed.path in ('/promo', '/promo/', '/promo.html'):
            return _send_file(self, WEB_ROOT / 'promo.html', 'text/html; charset=utf-8')
        if parsed.path.startswith('/api/'):
            return _send_json(self, {'ok': False, 'message': 'unknown endpoint'}, 404)
        return _send_json(self, {'ok': False, 'message': 'static file access is restricted'}, 403)

    def do_DELETE(self):
        parsed = urllib.parse.urlparse(self.path)
        if parsed.path.startswith('/api/') and not self._require_api_access():
            return
        if parsed.path == '/api/game/plays':
            return self._handle_game_play_delete(parsed)
        if parsed.path == '/api/game/irl':
            return self._handle_game_irl_artifact_delete(parsed)
        if parsed.path == '/api/game/scenarios/custom':
            return self._handle_user_scenario_delete(parsed)
        if parsed.path == '/api/game/research/participation':
            return self._handle_research_participation_delete()
        if parsed.path == '/api/admin/db/scenarios':
            return self._handle_admin_db_scenario_delete(parsed)
        if parsed.path == '/api/models':
            return self._handle_model_delete(parsed)
        if parsed.path.startswith('/api/'):
            return _send_json(self, {'ok': False, 'message': 'unknown endpoint'}, 404)
        return _send_json(self, {'ok': False, 'message': 'not found'}, 404)

    def do_PUT(self):
        parsed = urllib.parse.urlparse(self.path)
        if parsed.path.startswith('/api/') and not self._require_api_access():
            return
        if parsed.path == '/api/game/scenarios/custom':
            return self._handle_user_scenario_put(parsed)
        if parsed.path == '/api/admin/db/scenarios':
            return self._handle_admin_db_scenario_patch(parsed)
        if parsed.path == '/api/profile':
            return self._handle_profile_put()
        if parsed.path.startswith('/api/'):
            return _send_json(self, {'ok': False, 'message': 'unknown endpoint'}, 404)
        return _send_json(self, {'ok': False, 'message': 'not found'}, 404)

    def _is_local_operator(self) -> bool:
        """True only for a request made directly from this machine's console.

        A forwarded request reached us through a proxy, so a loopback peer is
        the proxy itself, not an operator. When we are configured to trust the
        forwarding header, such a request must never take the loopback admin
        path.
        """
        if _parse_forwarded_ips(self.headers.get('X-Forwarded-For') or ''):
            return False
        return _is_loopback_client(self.client_address)

    def _is_admin_request(self):
        if not PUBLIC_GAME_MODE:
            return True
        if DASHBOARD_TOKEN:
            supplied = self.headers.get('X-Crane-Token', '') or ''
            auth = self.headers.get('Authorization', '')
            if not supplied and auth.lower().startswith('bearer '):
                supplied = auth[7:].strip()
            if supplied and hmac.compare_digest(supplied, DASHBOARD_TOKEN):
                return True
        host = _host_name(self.headers.get('Host', ''))
        if (not host or _is_loopback_name(host)) and self._is_local_operator():
            return True
        # Admin-email login: a user whose email is in the allowlist
        # gets the same access as a loopback session or a valid dashboard token.
        if self._is_admin_email_user():
            return True
        return False

    def _require_admin_access(self, message='관리자 권한이 필요합니다 (admin token 또는 loopback).'):
        if self._is_admin_request():
            return True
        _send_json(self, {'ok': False, 'message': message}, 401)
        return False

    def _require_admin_for_destructive(self):
        """In PUBLIC_GAME_MODE, /api/game/* bypasses auth so external players can
        submit plays without a token. Destructive endpoints (DELETE) must still
        require an admin path (loopback or matching token); otherwise refuse.
        Returns True if the caller is allowed; sends a 401 + False otherwise."""
        if self._is_admin_request():
            return True
        _send_json(self, {'ok': False, 'message': '관리자 권한이 필요합니다 (admin token 또는 loopback).'}, 401)
        return False

    def _require_doc_owner_or_admin(self, doc, label='document'):
        if self._is_admin_request():
            return True
        user = self._current_user()
        if not user:
            _send_json(self, {'ok': False, 'message': '로그인이 필요합니다.'}, 401)
            return False
        meta = (doc or {}).get('meta') or {}
        owner_id = str(meta.get('user_id') or '')
        if owner_id and owner_id == str(user.get('id') or ''):
            return True
        _send_json(self, {'ok': False, 'message': f'다른 사용자의 {label}입니다.'}, 403)
        return False

    def _resolve_game_scenario_access(self, scenario_id, share_code=''):
        """Resolve a scenario while enforcing visibility for user-created IDs."""
        from crane_core.scenarios import get_scenario

        scenario_id = str(scenario_id or '').strip()
        if not scenario_id:
            return None, ('scenario_id required', 400)
        if not scenario_id.startswith('usr_'):
            scen = get_scenario(scenario_id)
            return (scen, None) if scen else (None, (f'unknown scenario: {scenario_id}', 404))

        from crane_db import storage as _storage
        custom = _storage.get_user_scenario(scenario_id)
        if not custom:
            return None, (f'unknown scenario: {scenario_id}', 404)
        user = self._current_user()
        is_owner = bool(user and str(custom.get('owner_id') or '') == str(user.get('id') or ''))
        supplied_share = str(share_code or '').strip()
        stored_share = str(custom.get('share_code') or '')
        has_share = bool(supplied_share and stored_share and hmac.compare_digest(supplied_share, stored_share))
        if custom.get('visibility') != 'public' and not is_owner and not has_share:
            return None, ('비공개 시나리오입니다. 공유 코드가 필요합니다.', 403)
        return _storage.user_scenario_to_play_format(custom), None

    def _prepare_json_payload(self, *, required: bool) -> bool:
        """Validate, bound, decode, and cache one JSON request body.

        BaseHTTPRequestHandler does not decode chunked requests. Reject unknown
        framing and oversized bodies before auth, DB, or job work starts. The
        cache lets legacy handler methods keep calling _read_json_payload()
        without reading the socket twice.
        """
        transfer_encoding = (self.headers.get('Transfer-Encoding') or '').strip()
        if transfer_encoding:
            self.close_connection = True
            _send_json(self, {'ok': False, 'message': 'unsupported Transfer-Encoding'}, 400)
            return False

        raw_length = self.headers.get('Content-Length')
        if raw_length is None or not str(raw_length).strip():
            if required:
                self.close_connection = True
                _send_json(self, {'ok': False, 'message': 'Content-Length header required'}, 411)
                return False
            self._json_payload = {}
            return True
        try:
            length = int(str(raw_length).strip())
        except (TypeError, ValueError):
            self.close_connection = True
            _send_json(self, {'ok': False, 'message': 'invalid Content-Length header'}, 400)
            return False
        if length < 0:
            self.close_connection = True
            _send_json(self, {'ok': False, 'message': 'invalid Content-Length header'}, 400)
            return False
        if length > MAX_JSON_BODY_BYTES:
            self.close_connection = True
            _send_json(self, {
                'ok': False,
                'message': f'JSON body exceeds {MAX_JSON_BODY_BYTES} byte limit',
                'maxBytes': MAX_JSON_BODY_BYTES,
            }, 413)
            return False
        if length == 0:
            if required:
                _send_json(self, {'ok': False, 'message': 'JSON request body required'}, 400)
                return False
            self._json_payload = {}
            return True

        raw = self.rfile.read(length)
        if len(raw) != length:
            self.close_connection = True
            _send_json(self, {'ok': False, 'message': 'incomplete request body'}, 400)
            return False
        try:
            payload = json.loads(raw.decode('utf-8'))
        except (UnicodeDecodeError, json.JSONDecodeError):
            _send_json(self, {'ok': False, 'message': 'invalid JSON'}, 400)
            return False
        if not isinstance(payload, dict):
            _send_json(self, {'ok': False, 'message': 'JSON body must be an object'}, 400)
            return False
        self._json_payload = payload
        return True

    def _rate_limit_client_key(self) -> str:
        """Identify the originating client for rate limiting.

        With CRANE_TRUST_PROXY the leftmost X-Forwarded-For hop is the real
        visitor; without it (or when the header is absent/garbage) fall back to
        the TCP peer, which is the only trustworthy value in a direct deploy.
        """
        peer = (self.client_address[0] if self.client_address else '') or 'unknown'
        if not TRUST_PROXY_HEADERS:
            return peer
        forwarded = _forwarded_client_ip(self.headers.get('X-Forwarded-For') or '')
        return forwarded or peer

    def _rate_limit_player_key(self) -> str:
        """Per-player rate-limit key: the auth cookie's hash, else the client IP.

        Keying play budgets by IP breaks the study's own deployment: a class of
        students on one campus NAT shares a single public address and would eat
        each other's budget. The session cookie separates them without
        validating the token here (validation is a network round-trip, and this
        runs before the request body is even read).
        """
        token = self._auth_cookie_token()
        if token:
            return 'sess:' + hashlib.sha256(token.encode('utf-8')).hexdigest()[:32]
        return 'ip:' + self._rate_limit_client_key()

    def _rate_limit_exempt(self) -> bool:
        """Only a request made directly from this machine's console is exempt.

        The loopback exemption exists for local development and the test suite.
        It must never fire for a proxied deployment: measured in practice, the
        edge reaches the app over loopback, so keying the exemption on the TCP
        peer alone silently disabled EVERY rate limit in production (120
        requests against a 30/60 budget all passed). A request carrying a
        forwarding header came through a proxy and is therefore never local,
        whether or not we are configured to trust that header's contents.
        """
        if not self._is_local_operator():
            return False
        return _is_loopback_name(str(self._rate_limit_client_key()).lower())

    def _emit_429(self, retry_after: int) -> bool:
        _send_json(self, {
            'ok': False,
            'message': f'요청이 너무 많습니다. {retry_after}초 후 다시 시도하세요.',
        }, 429, extra_headers={'Retry-After': str(retry_after)})
        return True

    def _play_rate_limited(self) -> bool:
        """Two layers guard session start/submit.

        A per-player budget keyed by the auth cookie, so a class of students on
        one campus NAT does not eat each other's allowance, inside a generous
        per-IP ceiling, so minting fresh cookies cannot bypass that budget.
        Both are charged and the tighter wait wins.
        """
        waits = [
            wait for limiter, key in (
                (_PLAY_RATE_LIMITER, f'play:{self._rate_limit_player_key()}'),
                (_PLAY_IP_RATE_LIMITER, f'play-ip:{self._rate_limit_client_key()}'),
            )
            if limiter.enabled
            for wait in (limiter.hit(key),) if wait
        ]
        return self._emit_429(min(waits)) if waits else False

    def _login_attempt_limited(self, email: str) -> bool:
        """Charge one login attempt against (client, target account).

        Called from the login handler because the email only exists once the
        body is parsed. Keyed by account so 30 classmates on one NAT never
        collide, while repeated guesses at a single account still stop.
        """
        if not _LOGIN_ID_RATE_LIMITER.enabled or self._rate_limit_exempt():
            return False
        target = hashlib.sha256(str(email or '').strip().lower().encode('utf-8')).hexdigest()[:16]
        retry_after = _LOGIN_ID_RATE_LIMITER.hit(
            f'login-id:{self._rate_limit_client_key()}:{target}')
        return self._emit_429(retry_after) if retry_after else False

    def _rate_limited(self, request_path: str) -> bool:
        """Return True (and emit a 429 with Retry-After) when a public,
        abuse-prone endpoint has exceeded its per-client budget. Checked before
        the body is read so floods can't force large reads. Loopback callers are
        never limited, keeping local development and tests unthrottled."""
        if request_path in RATE_LIMIT_AUTH_PATHS:
            limiter, bucket = _AUTH_RATE_LIMITER, 'auth'
        elif request_path in RATE_LIMIT_IDENTITY_PATHS:
            limiter, bucket = _IDENTITY_RATE_LIMITER, 'identity'
        elif request_path in RATE_LIMIT_GAME_PATHS:
            limiter, bucket = _GAME_RATE_LIMITER, 'game'
        elif request_path in RATE_LIMIT_PLAY_PATHS:
            limiter, bucket = _PLAY_RATE_LIMITER, 'play'
        else:
            return False
        if self._rate_limit_exempt():
            return False
        if bucket == 'play':
            return self._play_rate_limited()
        if not limiter.enabled:
            return False
        client = self._rate_limit_client_key()
        retry_after = limiter.hit(f'{bucket}:{client}')
        return self._emit_429(retry_after) if retry_after else False

    def do_POST(self):
        parsed = urllib.parse.urlparse(self.path)
        request_path = parsed.path
        if self._rate_limited(request_path):
            return
        if request_path in JSON_POST_PATHS and not self._prepare_json_payload(
            required=request_path not in OPTIONAL_JSON_POST_PATHS,
        ):
            return
        if request_path.startswith('/api/') and not self._require_api_access():
            return
        if request_path == '/api/auth/signup':
            return self._handle_auth_signup()
        if request_path == '/api/auth/login':
            return self._handle_auth_login()
        if request_path == '/api/auth/logout':
            return self._handle_auth_logout()
        if request_path == '/api/auth/resend':
            return self._handle_auth_resend()
        if request_path == '/api/profile/migrate':
            return self._handle_profile_migrate()
        if request_path == '/api/plan/run':
            return self._handle_plan_run()
        if request_path == '/api/plan/cost':
            return self._handle_plan_cost()
        if request_path == '/api/score-schedule':
            return self._handle_score_schedule()
        if request_path == '/api/auto-reward/start':
            return self._handle_auto_reward_start()
        if request_path == '/api/auto-reward/stop':
            return self._handle_auto_reward_stop()
        if request_path == '/api/train/stop':
            return self._handle_train_stop()
        if request_path == '/api/curriculum/start':
            return self._handle_curriculum_start()
        if request_path == '/api/models/label':
            return self._handle_model_label()
        if request_path == '/api/game/scenarios/custom':
            return self._handle_user_scenario_post()
        if request_path == '/api/game/session/start':
            return self._handle_game_session_start()
        if request_path == '/api/game/session/step':
            return self._handle_game_session_step()
        if request_path == '/api/game/session/sweep-step':
            return self._handle_game_session_sweep_step()
        if request_path == '/api/game/session/undo':
            return self._handle_game_session_undo()
        if request_path == '/api/game/session/restart':
            return self._handle_game_session_restart()
        if request_path == '/api/game/session/state':
            return self._handle_game_session_state()
        if request_path == '/api/game/session/submit':
            return self._handle_game_session_submit()
        if request_path == '/api/game/session/drop':
            return self._handle_game_session_drop()
        if request_path == '/api/game/research/participation':
            return self._handle_research_participation_post()
        if request_path == '/api/game/research/signature':
            return self._handle_research_signature_post()
        if request_path == '/api/game/research/submit':
            return self._handle_research_submit_post()
        if request_path == '/api/game/irl/run':
            return self._handle_game_irl_run()
        if request_path == '/api/game/baseline/run':
            return self._handle_game_baseline_run()
        if request_path != '/api/train/start':
            return _send_json(self, {'ok': False, 'message': 'unknown endpoint'}, 404)
        try:
            payload = self._read_json_payload()
            running = _running_job_snapshot()
            if running:
                return _send_json(self, {'ok': False, 'message': f"이미 실행 중인 job이 있습니다: {running.get('jobId')}", 'job': running}, 409)
            cfg = _read_yaml(TRAINER_CONFIG_PATH)
            for key in ['num_cranes','num_lifts','fixed_duration','setup_time','teardown_time','crane_radius','lift_setup_inner_fraction','lift_setup_area_rings','lift_setup_area_angles','candidate_k','max_steps','base_seed','seed_runs','seen_seed_start','seen_seed_count','validation_seed_start','validation_seed_count','unseen_seed_start','unseen_seed_count','site_width','site_height']:
                if key in payload and payload[key] not in (None, ''):
                    cfg[key] = int(payload[key]) if key not in ['fixed_duration','setup_time','teardown_time','crane_radius','lift_setup_inner_fraction','site_width','site_height'] else float(payload[key])
            _apply_lift_load_config_to_cfg(cfg, payload)
            cfg['train_episodes'] = int(payload.get('episodes') or cfg.get('train_episodes', 150))
            cfg.setdefault('reward', {})
            for key in ['r_single','r_all','r_same','p_idle','p_inter_soft','p_time','p_move']:
                if key in payload and payload[key] not in (None, ''):
                    cfg['reward'][key] = float(payload[key])
            _apply_crane_types_to_cfg(cfg, payload)
            _apply_restricted_zones_to_cfg(cfg, payload)
            cfg.setdefault('mappo', {})
            for key in ['gamma','gae_lambda','actor_lr','critic_lr','clip_eps','entropy_coef','value_coef','max_grad_norm','update_epochs','minibatch_size','hidden_dim','eps_start','eps_end']:
                if key in payload and payload[key] not in (None, ''):
                    cfg['mappo'][key] = int(payload[key]) if key in ['update_epochs','minibatch_size','hidden_dim'] else float(payload[key])
            if payload.get('anchor_layout'):
                al = payload['anchor_layout']
                cfg['anchor_layout'] = {
                    'cranes': al.get('cranes') or [],
                    'lifts': al.get('lifts') or [],
                    'restrictedZones': al.get('restrictedZones') or al.get('restricted_zones') or [],
                }
                if cfg['anchor_layout']['cranes']:
                    cfg['num_cranes'] = len(cfg['anchor_layout']['cranes'])
                if cfg['anchor_layout']['lifts']:
                    cfg['num_lifts'] = len(cfg['anchor_layout']['lifts'])
            if 'anchor_jitter' in payload and payload['anchor_jitter'] not in (None, ''):
                cfg['anchor_jitter'] = float(payload['anchor_jitter'])
            job_id = time.strftime('run_%Y%m%d_%H%M%S')
            outdir = TRAINER_DASHBOARD_RUNS / job_id
            outdir.mkdir(parents=True, exist_ok=True)
            cfg_path = outdir/'config.yaml'
            _write_yaml(cfg_path, cfg)
            cmd = [sys.executable,'-u','-m','rl_trainer.train','--config',str(cfg_path),'--episodes',str(cfg['train_episodes']),'--outdir',str(outdir),'--validation-start',str(cfg.get('validation_seed_start',201)),'--validation-count',str(cfg.get('validation_seed_count',20)),'--unseen-start',str(cfg.get('unseen_seed_start',301)),'--unseen-count',str(cfg.get('unseen_seed_count',30)),'--final-eval-max','1','--skip-final-checkpoint-eval']
            init_model = payload.get('initModelPath')
            if init_model:
                try:
                    init_path = _resolve_model_path(init_model)
                except FileNotFoundError as e:
                    return _send_json(self, {'ok': False, 'message': str(e)}, 404)
                except ValueError as e:
                    return _send_json(self, {'ok': False, 'message': str(e)}, 400)
                cmd += ['--init-model', str(init_path)]
            proc = subprocess.Popen(cmd, cwd=ROOT, stdout=subprocess.PIPE, stderr=subprocess.STDOUT, text=True, bufsize=1)
            result_path = outdir/'pytorch_mappo_validation_result.json'
            with JOBS_LOCK:
                JOBS[job_id] = {'jobId': job_id, 'running': True, 'exitCode': None, 'startedAt': time.time(), 'command': ' '.join(cmd), 'outdir': str(outdir.relative_to(ROOT)), 'resultPath': str(result_path.relative_to(ROOT)), 'resultExists': False, 'message': '학습 실행 중', 'log': deque(maxlen=300), 'progress': deque(maxlen=PROGRESS_RETAIN), 'progressTotal': 0, 'mode': 'train', 'process': proc, 'ownerId': (self._current_user() or {}).get('id')}
                set_latest_job_id(job_id)
                response = _job_response_snapshot(JOBS[job_id])
            threading.Thread(target=_reader, args=(job_id, proc), daemon=True).start()
            return _send_json(self, {'ok': True, 'job': response})
        except Exception as e:
            return _send_json(self, {'ok': False, 'message': str(e)}, 500)


    # ------------------------------------------------------------------
    # Game / human-play endpoints (Phase 1 of GAMIFICATION_BT_IRL_DESIGN.md)
    # ------------------------------------------------------------------

    def _read_json_payload(self):
        if hasattr(self, '_json_payload'):
            return self._json_payload
        # Direct handler calls in unit tests and JSON-bearing non-POST methods
        # do not pass through do_POST's preflight. Keep their legacy fallback
        # bounded as a second line of defense.
        try:
            n = int(self.headers.get('Content-Length', '0'))
            if n < 0 or n > MAX_JSON_BODY_BYTES:
                return None
            payload = json.loads(self.rfile.read(n).decode('utf-8') or '{}')
            return payload if isinstance(payload, dict) else None
        except (TypeError, ValueError, UnicodeDecodeError, json.JSONDecodeError):
            return None


def _boot_print(message: str):
    """Emit one boot diagnostic that can never take the server down.

    A cp949 (Windows) console raises UnicodeEncodeError on characters the code
    page lacks, and because that fires inside print(), a plain try/except around
    the *caller* is not enough — the except branch usually re-prints the same
    text and raises again. Degrade to an escaped ASCII rendering instead of
    losing the line, and swallow anything left.
    """
    try:
        print(message, flush=True)
    except UnicodeEncodeError:
        try:
            encoding = getattr(sys.stdout, 'encoding', None) or 'ascii'
            print(message.encode(encoding, 'backslashreplace').decode(encoding),
                  flush=True)
        except Exception:
            pass
    except Exception:
        pass


if __name__ == '__main__':
    port = int(os.environ.get('PORT', '8000'))
    host = os.environ.get('HOST', '127.0.0.1')
    # flush=True on every boot line: stdout is block-buffered when it is not a
    # TTY (exactly how PaaS logs capture it), and this process never exits, so
    # an unflushed line is simply never seen. The HTTP request log appears
    # regardless only because BaseHTTPRequestHandler writes it to stderr.
    _boot_print(f'Crane RL dashboard running at http://{host}:{port}')
    # Surface model persistence at boot: on an ephemeral deploy a wrong (or
    # missing) volume mount is invisible until a redeploy wipes every model the
    # user trained. Print it once so the deploy log answers the question.
    # Diagnostics must never take the server down with them — a console that
    # cannot encode the message (e.g. cp949 on Windows) killed boot once, which
    # is why every line below goes through _boot_print.
    try:
        from crane_web.paths import persistence_status
        _p = persistence_status()
        _boot_print(f"[persistence] {_p['path']} - {_p['detail']}")
    except Exception as _e:
        _boot_print(f'[persistence] 상태 확인 실패: {_e!r}')
    # Public-deployment readiness. Both conditions are invisible at runtime but
    # decide whether rate limiting works at all and whether PII may be collected,
    # so the deploy log has to state them once.
    try:
        if PUBLIC_GAME_MODE and not TRUST_PROXY_HEADERS:
            _boot_print('[deploy] 경고: CRANE_PUBLIC_GAME=1 이지만 CRANE_TRUST_PROXY 가 '
                        '꺼져 있습니다. 리버스 프록시 뒤라면 모든 방문자가 '
                        '하나의 rate-limit 버킷을 공유합니다. 프록시 뒤 배포라면 '
                        'CRANE_TRUST_PROXY=1 로 설정하세요.')
        from crane_web import research as _research
        from crane_db.storage import storage_kind as _storage_kind
        _blocked = _research.enrollment_block_reason(_storage_kind())
        _boot_print(f"[deploy] 연구 동의서 상태={_research.CONSENT_STATUS}, "
                    f"저장소={_storage_kind()}, "
                    f"참여 모집={'열림' if _blocked is None else '차단'}"
                    + ('' if _blocked is None else f' ({_blocked})'))
    except Exception as _e:
        _boot_print(f'[deploy] 배포 점검 실패: {_e!r}')
    ThreadingHTTPServer((host, port), Handler).serve_forever()
