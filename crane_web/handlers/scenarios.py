"""Scenario listing and user-created-scenario CRUD route handlers.

Mixed into the concrete Handler in app.py. Methods use ``self`` for request
state and the helpers the Handler provides (_resolve_game_scenario_access,
_current_user, _require_game_user, _read_json_payload). Public-visibility
changes bust the shared crane_web.scenarios_cache so they propagate without
waiting out the TTL.
"""
import urllib.parse

from crane_web.http_util import _send_json
from crane_web.scenarios_cache import (
    _get_public_scenarios_cached,
    _invalidate_public_scenarios_cache,
)


class ScenarioHandlerMixin:
    def _handle_game_scenarios(self, parsed):
        try:
            from crane_core.scenarios import list_scenarios
            qs = urllib.parse.parse_qs(parsed.query)
            tier = qs.get('tier', [None])[0] or None
            scenario_id = qs.get('id', [None])[0] or None
            if scenario_id:
                share_code = qs.get('share', qs.get('share_code', ['']))[0] or ''
                scen, err = self._resolve_game_scenario_access(scenario_id, share_code)
                if err:
                    return _send_json(self, {'ok': False, 'message': err[0]}, err[1])
                return _send_json(self, {'ok': True, 'scenario': scen})
            # System scenarios from code + public user-created scenarios from
            # the TTL-cached helper (avoids a Postgres round-trip on every
            # page load — the public list rarely changes).
            scenarios = list_scenarios(tier=tier)
            publics = _get_public_scenarios_cached()
            for p in publics:
                if tier and p.get('tier') != tier:
                    continue
                scenarios.append({
                    'id': p['id'],
                    'tier': p.get('tier') or 'custom',
                    'tier_label': '커뮤니티',
                    'name': p['name'],
                    'description': p.get('description') or '',
                    'difficulty': p.get('difficulty') or 3,
                    'num_cranes': p.get('num_cranes', 0),
                    'num_lifts': p.get('num_lifts', 0),
                    'num_restricted': p.get('num_restricted', 0),
                    'walkthrough': False,
                    'custom': True,
                    'owner_display_name': p.get('owner_display_name') or '',
                    'updated_at': p.get('updated_at'),
                })
            return _send_json(self, {'ok': True, 'scenarios': scenarios})
        except Exception as e:
            return _send_json(self, {'ok': False, 'message': str(e)}, 500)

    # ------------------------------------------------------------------
    # User-created scenarios (CRUD + share-code lookup)

    def _handle_user_scenario_get(self, parsed):
        """GET /api/game/scenarios/custom

        Query modes:
          ?id=usr_xxx      → single scenario (owner OR public OR has share)
          ?share=shr_xxx   → lookup by share code (bypasses visibility check)
          ?mine=1          → list caller's own scenarios (login required)
          (no params)      → list public scenarios
        """
        try:
            from crane_db import storage as _storage
            qs = urllib.parse.parse_qs(parsed.query)
            share = (qs.get('share', [''])[0] or '').strip()
            scenario_id = (qs.get('id', [''])[0] or '').strip()
            mine = (qs.get('mine', [''])[0] or '').strip().lower() in ('1', 'true', 'yes', 'on')
            if share:
                scen = _storage.get_user_scenario_by_share_code(share)
                if not scen:
                    return _send_json(self, {'ok': False, 'message': '공유 코드로 시나리오를 찾을 수 없습니다.'}, 404)
                return _send_json(self, {'ok': True, 'scenario': scen})
            if scenario_id:
                scen = _storage.get_user_scenario(scenario_id)
                if not scen:
                    return _send_json(self, {'ok': False, 'message': 'scenario not found'}, 404)
                user = self._current_user()
                is_owner = bool(user and str(scen.get('owner_id')) == str(user.get('id') or ''))
                if scen.get('visibility') != 'public' and not is_owner:
                    return _send_json(self, {'ok': False, 'message': '비공개 시나리오입니다. 공유 코드가 필요합니다.'}, 403)
                return _send_json(self, {'ok': True, 'scenario': scen})
            if mine:
                user = self._require_game_user()
                if not user:
                    return
                rows = _storage.list_user_scenarios(owner_id=str(user.get('id')), with_layout=False)
                return _send_json(self, {'ok': True, 'scenarios': rows, 'count': len(rows)})
            rows = _storage.list_user_scenarios(visibility='public', with_layout=False)
            return _send_json(self, {'ok': True, 'scenarios': rows, 'count': len(rows)})
        except ValueError as e:
            return _send_json(self, {'ok': False, 'message': str(e)}, 400)
        except Exception as e:
            return _send_json(self, {'ok': False, 'message': str(e)}, 500)

    def _handle_user_scenario_post(self):
        try:
            from crane_db import storage as _storage
            user = self._require_game_user()
            if not user:
                return
            if not self._is_admin_request():
                return _send_json(self, {'ok': False, 'message': '관리자만 시나리오를 등록·수정·삭제할 수 있습니다.'}, 403)
            payload = self._read_json_payload()
            if payload is None:
                return _send_json(self, {'ok': False, 'message': 'invalid JSON'}, 400)
            # Admin-created sites are always public so every player can play them
            # immediately — override whatever visibility the payload requested.
            if isinstance(payload, dict):
                payload['visibility'] = 'public'
            scen = _storage.create_user_scenario(
                owner_id=str(user.get('id') or ''),
                owner_display_name=str(user.get('display_name') or user.get('email') or '')[:64],
                payload=payload,
            )
            if scen.get('visibility') == 'public':
                _invalidate_public_scenarios_cache()
            return _send_json(self, {'ok': True, 'scenario': scen}, 201)
        except ValueError as e:
            return _send_json(self, {'ok': False, 'message': str(e)}, 400)
        except Exception as e:
            return _send_json(self, {'ok': False, 'message': str(e)}, 500)

    def _handle_user_scenario_put(self, parsed):
        try:
            from crane_db import storage as _storage
            user = self._require_game_user()
            if not user:
                return
            if not self._is_admin_request():
                return _send_json(self, {'ok': False, 'message': '관리자만 시나리오를 등록·수정·삭제할 수 있습니다.'}, 403)
            qs = urllib.parse.parse_qs(parsed.query)
            scenario_id = (qs.get('id', [''])[0] or '').strip()
            if not scenario_id:
                return _send_json(self, {'ok': False, 'message': 'id query param required'}, 400)
            payload = self._read_json_payload()
            if payload is None:
                return _send_json(self, {'ok': False, 'message': 'invalid JSON'}, 400)
            updated = _storage.update_user_scenario(
                scenario_id=scenario_id,
                owner_id=str(user.get('id') or ''),
                payload=payload,
            )
            if not updated:
                return _send_json(self, {'ok': False, 'message': '시나리오를 찾을 수 없거나 권한이 없습니다.'}, 404)
            # Any update can change visibility, so bust unconditionally.
            _invalidate_public_scenarios_cache()
            return _send_json(self, {'ok': True, 'scenario': updated})
        except ValueError as e:
            return _send_json(self, {'ok': False, 'message': str(e)}, 400)
        except Exception as e:
            return _send_json(self, {'ok': False, 'message': str(e)}, 500)

    def _handle_user_scenario_delete(self, parsed):
        try:
            from crane_db import storage as _storage
            user = self._require_game_user()
            if not user:
                return
            if not self._is_admin_request():
                return _send_json(self, {'ok': False, 'message': '관리자만 시나리오를 등록·수정·삭제할 수 있습니다.'}, 403)
            qs = urllib.parse.parse_qs(parsed.query)
            scenario_id = (qs.get('id', [''])[0] or '').strip()
            if not scenario_id:
                return _send_json(self, {'ok': False, 'message': 'id query param required'}, 400)
            ok = _storage.delete_user_scenario(scenario_id=scenario_id,
                                               owner_id=str(user.get('id') or ''))
            if not ok:
                return _send_json(self, {'ok': False, 'message': '시나리오를 찾을 수 없거나 권한이 없습니다.'}, 404)
            _invalidate_public_scenarios_cache()
            return _send_json(self, {'ok': True})
        except Exception as e:
            return _send_json(self, {'ok': False, 'message': str(e)}, 500)
