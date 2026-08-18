"""Auth and profile route handlers (signup / login / logout / resend, /api/profile*).

Mixed into the concrete Handler in app.py. Methods use ``self`` for request
state and for cookie/session helpers the Handler provides: ``_current_user``,
``_read_json_payload``, ``_auth_cookie_header``, ``_auth_cookie_token``,
``_auth_session_cookie_headers`` and ``_auth_clear_cookie_headers``.

The auth-only module state (public base URL, resend throttle) lives here rather
than in app.py since nothing else references it.
"""
import os

from crane_web.http_util import _send_internal_error, _send_json
from crane_web.net_util import _host_name, _is_loopback_name
PUBLIC_BASE_URL = (
    os.environ.get('PUBLIC_BASE_URL', '').strip().rstrip('/')
)


class AuthProfileHandlerMixin:
    def _handle_auth_me(self):
        try:
            user = self._current_user()
            return _send_json(self, {
                'ok': True,
                'user': user,
                # Whether this request would pass the admin gate (loopback /
                # dashboard token / CRANE_ADMIN_EMAILS). Drives client-side
                # visibility of the "고급 설정" toggle; real enforcement still
                # happens per-endpoint via _is_admin_request.
                'is_admin': self._is_admin_request(),
                'auth_provider': 'local',
            })
        except Exception as e:
            return _send_internal_error(self, e)

    def _profile_user_id_or_401(self):
        """Resolve the current user's id or send 401. Used by all /api/profile* routes."""
        user = self._current_user()
        if not user or not user.get('id'):
            _send_json(self, {'ok': False, 'message': '로그인이 필요합니다.'}, 401)
            return None
        return str(user['id'])

    def _handle_profile_get(self):
        try:
            user_id = self._profile_user_id_or_401()
            if user_id is None:
                return
            from crane_db.storage import get_user_profile
            return _send_json(self, {'ok': True, 'profile': get_user_profile(user_id)})
        except Exception as e:
            return _send_internal_error(self, e)

    def _handle_profile_put(self):
        try:
            user_id = self._profile_user_id_or_401()
            if user_id is None:
                return
            payload = self._read_json_payload()
            if payload is None:
                return _send_json(self, {'ok': False, 'message': 'invalid JSON'}, 400)
            from crane_db.storage import upsert_user_profile
            profile = upsert_user_profile(user_id, payload)
            return _send_json(self, {'ok': True, 'profile': profile})
        except ValueError as e:
            return _send_json(self, {'ok': False, 'message': str(e)}, 400)
        except Exception as e:
            return _send_internal_error(self, e)

    def _handle_profile_migrate(self):
        try:
            user_id = self._profile_user_id_or_401()
            if user_id is None:
                return
            payload = self._read_json_payload()
            if payload is None:
                return _send_json(self, {'ok': False, 'message': 'invalid JSON'}, 400)
            from crane_db.storage import merge_user_profile_once
            profile = merge_user_profile_once(user_id, payload)
            return _send_json(self, {'ok': True, 'profile': profile})
        except ValueError as e:
            return _send_json(self, {'ok': False, 'message': str(e)}, 400)
        except Exception as e:
            return _send_internal_error(self, e)

    def _handle_research_status(self):
        try:
            user_id = self._profile_user_id_or_401()
            if user_id is None:
                return
            from crane_db.storage import get_research_status
            from crane_web.research import public_study_config
            return _send_json(self, {
                'ok': True,
                'study': public_study_config(),
                **get_research_status(user_id),
            })
        except Exception as e:
            return _send_internal_error(self, e)

    def _handle_research_participation_post(self):
        try:
            user_id = self._profile_user_id_or_401()
            if user_id is None:
                return
            payload = self._read_json_payload()
            if payload is None:
                return _send_json(self, {'ok': False, 'message': 'invalid JSON'}, 400)
            from crane_db.storage import upsert_research_participation
            from crane_web import research as research_cfg
            from crane_web.research import public_study_config
            # Enrolment collects email and a display name. Refuse before any PII is stored
            # while the consent form is still a draft (IRB not yet approved).
            from crane_db.storage import storage_kind
            blocked = research_cfg.enrollment_block_reason(storage_kind())
            if blocked:
                return _send_json(self, {
                    'ok': False,
                    'message': blocked,
                    'study': public_study_config(),
                }, 403)
            return _send_json(self, {
                'ok': True,
                'study': public_study_config(),
                **upsert_research_participation(user_id, payload),
            }, 201)
        except ValueError as e:
            return _send_json(self, {'ok': False, 'message': str(e)}, 400)
        except Exception as e:
            return _send_internal_error(self, e)

    def _handle_research_signature_post(self):
        """이미 동의한 참여자의 서명만 보충한다 (재동의 없이).

        서명란은 동의서 v2 이후에 생겼다. 그 전에 동의하고 진행 중인 참여자에게
        재동의를 요구하면 실험이 멈추므로, 나머지 동의는 유지하고 서명만 받는다.
        """
        try:
            payload = self._read_json_payload()
            if payload is None:
                return
            user_id = self._profile_user_id_or_401()
            if user_id is None:
                return
            from crane_db.storage import update_research_signature
            from crane_web.research import public_study_config
            return _send_json(self, {
                'ok': True,
                'study': public_study_config(),
                **update_research_signature(user_id, payload.get('signature')),
            })
        except ValueError as e:
            return _send_json(self, {'ok': False, 'message': str(e)}, 400)
        except Exception as e:
            return _send_internal_error(self, e)

    def _handle_research_submit_post(self):
        """참여자가 '실험 데이터 제출'을 누른 시각을 기록한다."""
        try:
            user_id = self._profile_user_id_or_401()
            if user_id is None:
                return
            from crane_db.storage import mark_research_submitted
            from crane_web.research import public_study_config
            return _send_json(self, {
                'ok': True,
                'study': public_study_config(),
                **mark_research_submitted(user_id),
            })
        except ValueError as e:
            return _send_json(self, {'ok': False, 'message': str(e)}, 400)
        except Exception as e:
            return _send_internal_error(self, e)

    def _handle_research_participation_delete(self):
        try:
            user_id = self._profile_user_id_or_401()
            if user_id is None:
                return
            from crane_db.storage import withdraw_research_participation
            from crane_web.research import public_study_config
            return _send_json(self, {
                'ok': True,
                'study': public_study_config(),
                **withdraw_research_participation(user_id),
            })
        except ValueError as e:
            return _send_json(self, {'ok': False, 'message': str(e)}, 400)
        except Exception as e:
            return _send_internal_error(self, e)

    def _request_base_url(self):
        """Derive a base URL for links the server hands back to the client.
        Order: PUBLIC_BASE_URL env → scheme://Host header. Returns None when
        only a loopback host is available."""
        if PUBLIC_BASE_URL:
            return PUBLIC_BASE_URL
        host = (self.headers.get('Host') or '').strip()
        if not host:
            return None
        name = _host_name(host)
        if _is_loopback_name(name):
            return None
        proto = (self.headers.get('X-Forwarded-Proto') or '').split(',')[0].strip().lower()
        if proto not in ('http', 'https'):
            proto = 'https'
        return f'{proto}://{host}'

    def _handle_auth_signup(self):
        try:
            payload = self._read_json_payload()
            if payload is None:
                return _send_json(self, {'ok': False, 'message': 'invalid JSON'}, 400)
            email = payload.get('email') or ''
            password = payload.get('password') or ''
            display_name = payload.get('display_name') or payload.get('displayName') or payload.get('nickname') or ''
            role = payload.get('role') or ''
            role_kind  = (payload.get('role_kind')  or None) or None
            role_grade = (payload.get('role_grade') or None) or None
            role_years_raw = payload.get('role_years')
            try:
                role_years = int(role_years_raw) if role_years_raw not in (None, '') else None
            except (TypeError, ValueError):
                role_years = None
            # Demographic survey fields (age band, gender, education, prior
            # construction experience, sim familiarity, privacy consent). Stored
            # in the local user record alongside the role_* trio.
            sim_familiarity_raw = payload.get('sim_familiarity')
            try:
                sim_familiarity = int(sim_familiarity_raw) if sim_familiarity_raw not in (None, '') else None
            except (TypeError, ValueError):
                sim_familiarity = None
            survey = {
                'full_name':        (str(payload.get('full_name') or '').strip()[:40] or None),
                'phone':            (str(payload.get('phone') or '').strip()[:20] or None),
                'age_band':         (payload.get('age_band') or None) or None,
                'gender':           (payload.get('gender') or None) or None,
                'education':        (payload.get('education') or None) or None,
                'construction_exp': (payload.get('construction_exp') or None) or None,
                'sim_familiarity':  sim_familiarity,
                'privacy_consent':  bool(payload.get('privacy_consent')),
                # Free-text expert specialty (only set for the expert track).
                'expert_field':     (str(payload.get('expert_field') or '').strip()[:60] or None),
            }
            from crane_db.storage import create_auth_session, create_user
            user = create_user(email, password, display_name=display_name, role=role)
            token = create_auth_session(user['id'])
            return _send_json(
                self,
                {'ok': True, 'user': user, 'auth_provider': 'local'},
                extra_headers={'Set-Cookie': self._auth_cookie_header(token)},
            )
        except ValueError as e:
            return _send_json(self, {'ok': False, 'message': str(e)}, 400)
        except Exception as e:
            return _send_internal_error(self, e)

    def _handle_auth_login(self):
        try:
            payload = self._read_json_payload()
            if payload is None:
                return _send_json(self, {'ok': False, 'message': 'invalid JSON'}, 400)
            # Brute-force guard, per targeted account. Runs after body parse
            # because that is where the email first becomes known.
            if self._login_attempt_limited(payload.get('email') or ''):
                return
            from crane_db.storage import authenticate_user, create_auth_session
            user = authenticate_user(payload.get('email') or '', payload.get('password') or '')
            if not user:
                return _send_json(self, {'ok': False, 'message': '이메일 또는 비밀번호가 올바르지 않습니다.'}, 401)
            token = create_auth_session(user['id'])
            return _send_json(
                self,
                {'ok': True, 'user': user, 'auth_provider': 'local'},
                extra_headers={'Set-Cookie': self._auth_cookie_header(token)},
            )
        except ValueError as e:
            return _send_json(self, {'ok': False, 'message': str(e)}, 400)
        except Exception as e:
            return _send_internal_error(self, e)

    def _handle_auth_logout(self):
        try:
            token = self._auth_cookie_token()
            if token:
                from crane_db.storage import delete_auth_session
                delete_auth_session(token)
            return _send_json(self, {'ok': True}, extra_headers={'Set-Cookie': self._auth_clear_cookie_headers()})
        except Exception as e:
            return _send_internal_error(self, e)

    def _handle_auth_resend(self):
        try:
            payload = self._read_json_payload()
            if payload is None:
                return _send_json(self, {'ok': False, 'message': 'invalid JSON'}, 400)
            email = str(payload.get('email') or '').strip().lower()
            if not email or '@' not in email:
                return _send_json(self, {'ok': False, 'message': '이메일을 입력하세요.'}, 400)
            # 로컬 전용 빌드에는 메일 발송 경로가 없다. 계정은 가입 즉시
            # 사용 가능하므로 확인 메일 자체가 필요 없다.
            return _send_json(self, {
                'ok': False,
                'message': '로컬 전용 빌드입니다. 이메일 확인 없이 바로 로그인할 수 있습니다.',
            }, 400)
        except Exception as e:
            return _send_internal_error(self, e)
