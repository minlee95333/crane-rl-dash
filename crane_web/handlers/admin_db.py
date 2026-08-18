"""Admin database inspection / scenario-moderation route handlers.

Mixed into the concrete Handler in app.py. Every handler gates on
``self._require_admin_access()`` first; scenario mutations bust the shared
public-scenarios cache. Methods use ``self`` for request state and the
admin-gate / JSON-body helpers the Handler provides.
"""
import time
import urllib.parse

from crane_web.http_util import _send_json
from crane_web.scenarios_cache import _invalidate_public_scenarios_cache


class AdminDbHandlerMixin:
    def _handle_admin_db_snapshot(self, parsed):
        if not self._require_admin_access():
            return
        try:
            from crane_db import storage as _storage
            qs = urllib.parse.parse_qs(parsed.query)
            feed_limit = int((qs.get('feed', ['20'])[0] or '20'))
            counts = _storage.admin_db_counts()
            feed = _storage.admin_recent_activity(limit=max(1, min(100, feed_limit)))
            return _send_json(self, {
                'ok': True,
                'storage_kind': _storage.storage_kind(),
                'counts': counts,
                'feed': feed,
                'server_ts': int(time.time() * 1000),
            })
        except Exception as e:
            return _send_json(self, {'ok': False, 'message': str(e)}, 500)

    def _handle_admin_db_users(self, parsed):
        if not self._require_admin_access():
            return
        try:
            from crane_db import storage as _storage
            qs = urllib.parse.parse_qs(parsed.query)
            limit = int((qs.get('limit', ['50'])[0] or '50'))
            search = (qs.get('search', [''])[0] or '').strip()
            rows = _storage.admin_auth_users(limit=limit, search=search)
            return _send_json(self, {'ok': True, 'users': rows})
        except Exception as e:
            return _send_json(self, {'ok': False, 'message': str(e)}, 500)

    def _handle_admin_db_participants(self, parsed):
        """연구 참여자 목록. 실명·학번·전화번호를 반환하므로 admin 게이트 필수."""
        if not self._require_admin_access():
            return
        try:
            from crane_db import storage as _storage
            qs = urllib.parse.parse_qs(parsed.query)
            limit = int((qs.get('limit', ['200'])[0] or '200'))
            search = (qs.get('search', [''])[0] or '').strip()
            rows = _storage.admin_research_participants(limit=limit, search=search)
            return _send_json(self, {'ok': True, 'participants': rows})
        except Exception as e:
            return _send_json(self, {'ok': False, 'message': str(e)}, 500)

    def _handle_admin_db_participant_signature(self, parsed):
        """참여자 한 명의 자필 서명 이미지. 목록과 분리해 필요할 때만 가져온다."""
        if not self._require_admin_access():
            return
        try:
            from crane_db import storage as _storage
            qs = urllib.parse.parse_qs(parsed.query)
            participant_id = (qs.get('participant_id', [''])[0] or '').strip()
            if not participant_id:
                return _send_json(self, {'ok': False, 'message': 'participant_id가 필요합니다.'}, 400)
            signature = _storage.get_research_signature(participant_id)
            if not signature:
                return _send_json(self, {'ok': False, 'message': '이 참여자에게는 저장된 서명이 없습니다.'}, 404)
            return _send_json(self, {'ok': True, 'signature': signature})
        except Exception as e:
            return _send_json(self, {'ok': False, 'message': str(e)}, 500)

    def _handle_admin_db_scenarios(self, parsed):
        if not self._require_admin_access():
            return
        try:
            from crane_db import storage as _storage
            qs = urllib.parse.parse_qs(parsed.query)
            limit = int((qs.get('limit', ['200'])[0] or '200'))
            search = (qs.get('search', [''])[0] or '').strip()
            rows = _storage.admin_list_all_user_scenarios(limit=limit, search=search)
            return _send_json(self, {'ok': True, 'scenarios': rows})
        except Exception as e:
            return _send_json(self, {'ok': False, 'message': str(e)}, 500)

    def _handle_admin_db_scenario_patch(self, parsed):
        if not self._require_admin_access():
            return
        try:
            from crane_db import storage as _storage
            qs = urllib.parse.parse_qs(parsed.query)
            scenario_id = (qs.get('id', [''])[0] or '').strip()
            if not scenario_id:
                return _send_json(self, {'ok': False, 'message': 'id query param required'}, 400)
            payload = self._read_json_payload() or {}
            patch = {
                k: payload[k]
                for k in ('name', 'description', 'visibility', 'tier', 'difficulty')
                if k in payload
            }
            if not patch:
                return _send_json(self, {'ok': False, 'message': '수정할 필드가 없습니다.'}, 400)
            updated = _storage.admin_update_user_scenario(scenario_id, **patch)
            if not updated:
                return _send_json(self, {'ok': False, 'message': '시나리오를 찾을 수 없습니다.'}, 404)
            _invalidate_public_scenarios_cache()
            return _send_json(self, {'ok': True, 'scenario': updated})
        except ValueError as e:
            return _send_json(self, {'ok': False, 'message': str(e)}, 400)
        except Exception as e:
            return _send_json(self, {'ok': False, 'message': str(e)}, 500)

    def _handle_admin_db_scenario_delete(self, parsed):
        if not self._require_admin_access():
            return
        try:
            from crane_db import storage as _storage
            qs = urllib.parse.parse_qs(parsed.query)
            scenario_id = (qs.get('id', [''])[0] or '').strip()
            if not scenario_id:
                return _send_json(self, {'ok': False, 'message': 'id query param required'}, 400)
            ok = _storage.admin_delete_user_scenario(scenario_id)
            if not ok:
                return _send_json(self, {'ok': False, 'message': '시나리오를 찾을 수 없습니다.'}, 404)
            _invalidate_public_scenarios_cache()
            return _send_json(self, {'ok': True})
        except Exception as e:
            return _send_json(self, {'ok': False, 'message': str(e)}, 500)
