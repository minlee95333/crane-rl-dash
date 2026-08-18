"""Game-session route handlers (start / step / submit / … ).

Mixed into the concrete Handler in app.py. Methods use ``self`` for request
state and for helpers provided by the Handler / other mixins:
``_require_game_user``, ``_read_json_payload``, ``_resolve_game_scenario_access``
and ``_current_user``. The only cross-module dependency pulled in here is the
``_send_json`` response primitive.
"""
from crane_web.http_util import _send_internal_error, _send_json


class GameSessionHandlerMixin:
    def _handle_game_session_start(self):
        try:
            from game_irl.human_play import create_session
            user = self._require_game_user()
            if not user:
                return
            payload = self._read_json_payload()
            if payload is None:
                return _send_json(self, {'ok': False, 'message': 'invalid JSON'}, 400)
            scenario_id = payload.get('scenario_id') or payload.get('scenarioId')
            share_code = payload.get('share_code') or payload.get('shareCode') or ''
            tier = payload.get('tier') or 'general'
            nickname = user.get('display_name') or payload.get('nickname') or 'anon'
            role = payload.get('role') or user.get('role') or ''
            # Random-order variant — when requested, the player must lift in a
            # seeded-random order. Seed is the share_code when present (so a
            # shared link reproduces the same order), else the scenario_id.
            order_mode = bool(payload.get('order') or payload.get('order_mode'))
            order_seed = share_code or scenario_id
            # 클라이언트 자기 신고 플랫폼 (mobile/pc). 화이트리스트는 서버가 강제.
            client = payload.get('client') or ''
            # 장비 투입(crane_choice) 맵: 플레이어가 고른 대수·주차 위치.
            # 검증(대수 범위·부지 안·제한구역 밖)은 PlaySession이 수행하고,
            # crane_choice 없는 시나리오에 보내면 ValueError → 400.
            cranes = payload.get('cranes')
            research_requested = payload.get('research_mode') is True
            if not scenario_id:
                return _send_json(self, {'ok': False, 'message': 'scenario_id required'}, 400)
            if tier not in ('general', 'expert'):
                return _send_json(self, {'ok': False, 'message': 'tier must be general or expert'}, 400)
            _, err = self._resolve_game_scenario_access(scenario_id, share_code)
            if err:
                return _send_json(self, {'ok': False, 'message': err[0]}, err[1])
            research_context = None
            if research_requested:
                from crane_db.storage import resolve_research_session
                research_context = resolve_research_session(
                    str(user.get('id') or ''),
                    str(scenario_id),
                )
                # FLEET_1 is part of the frozen cross-device study sequence.
                # Use its versioned default fleet on both clients so PC's
                # placement editor does not create a device-specific condition.
                cranes = None
            sess = create_session(scenario_id, tier, nickname, role, user=user,
                                  order_mode=order_mode, order_seed=order_seed,
                                  client=client, cranes=cranes,
                                  research_context=research_context)
            return _send_json(self, {
                'ok': True,
                'state': sess.state(),
                'scenario': sess.scenario,
                'play_purpose': sess.play_purpose,
                'research': research_context,
            })
        except ValueError as e:
            return _send_json(self, {'ok': False, 'message': str(e)}, 400)
        except Exception as e:
            return _send_internal_error(self, e)

    def _resolve_session(self, payload):
        from game_irl.human_play import get_session
        user = self._current_user()
        if not user:
            return None, ('로그인이 필요합니다.', 401)
        if payload is None:
            return None, ('invalid JSON', 400)
        sid = payload.get('session_id') or payload.get('sessionId')
        if not sid:
            return None, ('session_id required', 400)
        sess = get_session(sid)
        if not sess:
            return None, ('session not found (재시작이 필요할 수 있음)', 404)
        if getattr(sess, 'user_id', None) and str(sess.user_id) != str(user.get('id')):
            return None, ('다른 사용자의 세션입니다.', 403)
        return sess, None

    def _handle_game_session_step(self):
        try:
            payload = self._read_json_payload()
            sess, err = self._resolve_session(payload)
            if err:
                return _send_json(self, {'ok': False, 'message': err[0]}, err[1])
            decisions = payload.get('decisions') or {}
            if not isinstance(decisions, dict):
                return _send_json(self, {'ok': False, 'message': 'decisions must be an object {crane_id: lift_id}'}, 400)
            state = sess.submit_step(decisions)
            # Behaviour telemetry (optional) — attached after the step is accepted
            # so it never affects decision replay. Best-effort: ignore if absent.
            sess.record_step_meta(payload.get('telemetry'))
            return _send_json(self, {'ok': True, 'state': state})
        except ValueError as e:
            return _send_json(self, {'ok': False, 'message': str(e)}, 400)
        except Exception as e:
            return _send_internal_error(self, e)

    def _handle_game_session_sweep_step(self):
        try:
            payload = self._read_json_payload()
            sess, err = self._resolve_session(payload)
            if err:
                return _send_json(self, {'ok': False, 'message': err[0]}, err[1])
            setups = payload.get('setups') or {}
            if not isinstance(setups, dict):
                return _send_json(self, {'ok': False, 'message': 'setups must be an object {crane_id: {setup_x, setup_y}}'}, 400)
            state = sess.submit_sweep_step(setups)
            sess.record_step_meta(payload.get('telemetry'))
            return _send_json(self, {'ok': True, 'state': state})
        except ValueError as e:
            return _send_json(self, {'ok': False, 'message': str(e)}, 400)
        except Exception as e:
            return _send_internal_error(self, e)

    def _handle_game_session_undo(self):
        try:
            payload = self._read_json_payload()
            sess, err = self._resolve_session(payload)
            if err:
                return _send_json(self, {'ok': False, 'message': err[0]}, err[1])
            return _send_json(self, {'ok': True, 'state': sess.undo()})
        except Exception as e:
            return _send_internal_error(self, e)

    def _handle_game_session_restart(self):
        try:
            payload = self._read_json_payload()
            sess, err = self._resolve_session(payload)
            if err:
                return _send_json(self, {'ok': False, 'message': err[0]}, err[1])
            return _send_json(self, {'ok': True, 'state': sess.restart()})
        except Exception as e:
            return _send_internal_error(self, e)

    def _handle_game_session_state(self):
        try:
            payload = self._read_json_payload()
            sess, err = self._resolve_session(payload)
            if err:
                return _send_json(self, {'ok': False, 'message': err[0]}, err[1])
            return _send_json(self, {'ok': True, 'state': sess.state()})
        except Exception as e:
            return _send_internal_error(self, e)

    def _handle_game_session_submit(self):
        try:
            from game_irl.human_play import drop_session
            payload = self._read_json_payload()
            sess, err = self._resolve_session(payload)
            if err:
                return _send_json(self, {'ok': False, 'message': err[0]}, err[1])
            if 'scorer_weights' in payload:
                return _send_json(
                    self,
                    {'ok': False, 'message': 'scorer_weights is server-controlled'},
                    400,
                )
            # Session-level behaviour summary + raw event stream (optional) before finalizing.
            sess.record_session_telemetry(payload.get('session_telemetry'))
            sess.record_events(payload.get('events'))
            doc, rel_path = sess.submit()
            drop_session(sess.session_id)
            response = {
                'ok': True,
                'path': rel_path,
                'meta': doc['meta'],
                'outcome': doc['outcome'],
                'scorer_snapshot': doc['scorer_snapshot'],
            }
            if doc['meta'].get('play_purpose') == 'research':
                from crane_db.storage import get_research_status
                response['research_status'] = get_research_status(
                    str(doc['meta'].get('user_id') or '')
                )
            return _send_json(self, response)
        except ValueError as e:
            return _send_json(self, {'ok': False, 'message': str(e)}, 400)
        except Exception as e:
            return _send_internal_error(self, e)

    def _handle_game_session_drop(self):
        try:
            from game_irl.human_play import drop_session
            payload = self._read_json_payload()
            sess, err = self._resolve_session(payload)
            if err:
                return _send_json(self, {'ok': False, 'message': err[0]}, err[1])
            drop_session(sess.session_id)
            return _send_json(self, {'ok': True})
        except Exception as e:
            return _send_internal_error(self, e)
