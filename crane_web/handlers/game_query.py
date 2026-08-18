"""Game read endpoints: plays, leaderboard, heatmap, auto_reward run list,
heuristic baseline run.

Mixed into the concrete Handler in app.py. Methods use ``self`` for request
state and the helpers the Handler provides (_require_doc_owner_or_admin,
_require_game_user, _is_admin_request, _current_user, _require_admin_access,
_require_admin_for_destructive, _read_json_payload, _resolve_game_scenario_access).

The public-output sanitizers live here as module-level functions since only
these read handlers consume them.
"""
import hashlib
import urllib.parse
from typing import Dict, Optional

from crane_web.http_util import _send_json
from crane_web.paths import ROOT, AUTO_REWARD_RUN_ROOTS

_PUBLIC_PLAY_FIELDS = (
    'scenario_id',
    'tier',
    'nickname',
    'display_name',
    'submitted_at',
    'play_seconds',
    'undo_count',
    'makespan',
    'done',
    'total',
    'totalScore',
    'grade',
)


def _public_play_summary(play: Dict, current_user: Optional[Dict] = None) -> Dict:
    """Return the leaderboard-safe subset of a stored play summary."""
    play = play or {}
    out = {key: play.get(key) for key in _PUBLIC_PLAY_FIELDS}
    raw_user_id = str(play.get('user_id') or '').strip()
    display_name = str(play.get('display_name') or play.get('nickname') or '').strip()
    identity = f'user:{raw_user_id}' if raw_user_id else f'name:{display_name}'
    out['player_id'] = hashlib.sha256(identity.encode('utf-8')).hexdigest()[:20] if display_name or raw_user_id else ''

    current_user = current_user or {}
    current_user_id = str(current_user.get('id') or '').strip()
    current_name = str(current_user.get('display_name') or current_user.get('nickname') or '').strip()
    out['is_mine'] = bool(
        (raw_user_id and current_user_id and raw_user_id == current_user_id)
        or (not raw_user_id and current_name and current_name == display_name)
    )
    return out


def _public_leaderboard_entry(entry: Dict, current_user: Optional[Dict] = None) -> Dict:
    """Preserve aggregate statistics while sanitizing embedded recent plays."""
    out = dict(entry or {})
    out['recent'] = [
        _public_play_summary(play, current_user)
        for play in (out.get('recent') or [])
    ]
    return out


class GameQueryHandlerMixin:
    def _handle_game_plays(self, parsed):
        try:
            from game_irl.human_play import list_plays, load_play
            qs = urllib.parse.parse_qs(parsed.query)
            path = qs.get('path', [None])[0]
            if path:
                doc = load_play(path)
                if doc is None:
                    return _send_json(self, {'ok': False, 'message': 'play not found'}, 404)
                if not self._require_doc_owner_or_admin(doc, 'play'):
                    return
                return _send_json(self, {'ok': True, 'play': doc})
            scenario_id = qs.get('scenario', [None])[0] or None
            tier = qs.get('tier', [None])[0] or None
            is_admin = self._is_admin_request()
            requested_purpose = qs.get('purpose', [None])[0] or None
            play_purpose = requested_purpose if is_admin else 'general'
            if play_purpose not in (None, 'general', 'research', 'legacy'):
                return _send_json(
                    self,
                    {'ok': False, 'message': 'purpose must be general, research, or legacy'},
                    400,
                )
            mine = (qs.get('mine', [''])[0] or '').strip().lower() in ('1', 'true', 'yes', 'on')
            user_id = None
            if mine:
                user = self._require_game_user()
                if not user:
                    return
                user_id = user['id']
            plays = list_plays(
                scenario_id=scenario_id,
                tier=tier,
                user_id=user_id,
                play_purpose=play_purpose,
            )
            if not is_admin:
                current_user = user if mine else self._current_user()
                plays = [_public_play_summary(play, current_user) for play in plays]
            return _send_json(self, {'ok': True, 'plays': plays, 'count': len(plays)})
        except Exception as e:
            return _send_json(self, {'ok': False, 'message': str(e)}, 500)

    def _handle_game_play_delete(self, parsed):
        if not self._require_admin_for_destructive():
            return
        try:
            from game_irl.human_play import delete_play
            qs = urllib.parse.parse_qs(parsed.query)
            path = qs.get('path', [None])[0]
            if not path:
                return _send_json(self, {'ok': False, 'message': 'path query param required'}, 400)
            ok = delete_play(path)
            if not ok:
                return _send_json(self, {'ok': False, 'message': 'play not found or could not be deleted'}, 404)
            return _send_json(self, {'ok': True, 'path': path})
        except Exception as e:
            return _send_json(self, {'ok': False, 'message': str(e)}, 500)

    def _handle_game_auto_reward_runs(self, parsed):
        """List auto_reward_runs subdirs so the cross-validation panel can
        present a dropdown of available runs."""
        if not self._require_admin_access():
            return
        try:
            runs = []
            for ar_root in AUTO_REWARD_RUN_ROOTS:
                if not ar_root.exists():
                    continue
                for d in sorted(ar_root.iterdir()):
                    if not d.is_dir():
                        continue
                    n_trials = len(list(d.glob('trial_*')))
                    if n_trials == 0:
                        continue
                    runs.append({
                        'path': str(d.relative_to(ROOT)),
                        'name': d.name,
                        'n_trials': n_trials,
                    })
            return _send_json(self, {'ok': True, 'runs': runs})
        except Exception as e:
            return _send_json(self, {'ok': False, 'message': str(e)}, 500)

    def _handle_game_baseline_run(self):
        """Run an AI heuristic baseline on a fixed scenario so the user can
        inspect a replay ghost (visualization only; not an IRL input).
        This endpoint does not collect explicit preference labels."""
        try:
            from crane_core.env import CraneSchedulingEnv
            from crane_core.scorer import score_schedule, DEFAULT_WEIGHTS
            payload = self._read_json_payload() or {}
            scenario_id = payload.get('scenario_id')
            share_code = payload.get('share_code') or payload.get('shareCode') or ''
            policy = payload.get('policy') or 'nearest'
            if policy not in ('nearest', 'random', 'radiusPriority'):
                return _send_json(self, {'ok': False, 'message': f'unsupported policy: {policy}'}, 400)
            scen, err = self._resolve_game_scenario_access(scenario_id, share_code)
            if err:
                return _send_json(self, {'ok': False, 'message': err[0]}, err[1])
            cfg = dict(scen['config'])
            nL = len(scen['layout']['lifts'])
            cfg['num_cranes'] = len(scen['layout']['cranes'])
            cfg['num_lifts'] = nL
            cfg['candidate_k'] = max(int(cfg.get('candidate_k', nL)), nL)
            env = CraneSchedulingEnv(cfg)
            result = env.run_policy_layout(
                policy,
                scen['layout']['cranes'],
                scen['layout']['lifts'],
                restricted_zones=scen['layout'].get('restrictedZones') or [],
            )
            score = score_schedule(result, params={
                'fixed_duration': cfg.get('fixed_duration'),
                'setup_time': cfg.get('setup_time'),
                'teardown_time': cfg.get('teardown_time'),
                'num_cranes': cfg['num_cranes'],
                'num_lifts': cfg['num_lifts'],
            }, weights=dict(DEFAULT_WEIGHTS))
            return _send_json(self, {
                'ok': True,
                'policy': policy,
                'outcome': {
                    'events': result.get('events') or [],
                    'makespan': result.get('makespan'),
                    'done': result.get('done'),
                    'total': result.get('total'),
                    'softInter': result.get('softInter'),
                    'restrictedExecuted': result.get('restrictedExecuted'),
                    'cranes': result.get('cranes'),
                    'lifts': result.get('lifts'),
                },
                'score': score,
            })
        except Exception as e:
            return _send_json(self, {'ok': False, 'message': str(e)}, 500)

    def _handle_game_leaderboard(self, parsed):
        try:
            from game_irl.human_play import summary_by_scenario
            qs = urllib.parse.parse_qs(parsed.query)
            tier = qs.get('tier', [None])[0] or None
            mine = (qs.get('mine', [''])[0] or '').strip().lower() in ('1', 'true', 'yes', 'on')
            user_id = None
            if mine:
                user = self._require_game_user()
                if not user:
                    return
                user_id = user['id']
            # 리더보드는 제출 목적을 가리지 않는다 — 실험 플레이도 같은 순위에
            # 들어간다. 다만 어느 기록이 실험인지는 밖으로 드러나지 않아야 하므로
            # 목적 필드를 응답에 싣지 않는다: _PUBLIC_PLAY_FIELDS 가 allowlist라
            # play_purpose·participant_id 는 애초에 통과하지 못한다.
            entries = summary_by_scenario(
                tier=tier,
                user_id=user_id,
                play_purpose=None,
            )
            if not self._is_admin_request():
                current_user = user if mine else self._current_user()
                entries = [
                    _public_leaderboard_entry(entry, current_user)
                    for entry in entries
                ]
            return _send_json(self, {'ok': True, 'leaderboard': entries})
        except Exception as e:
            return _send_json(self, {'ok': False, 'message': str(e)}, 500)

    def _handle_game_heatmap(self, parsed):
        """Aggregate movement segments + setup points across submitted plays
        of one scenario. Anonymous (no user fields) — drives the 3D replay's
        ground heatmap overlay. Capped to the most recent 200 plays."""
        try:
            from crane_db import storage as _storage
            qs = urllib.parse.parse_qs(parsed.query)
            scenario_id = (qs.get('scenario_id', [''])[0] or '').strip()
            if not scenario_id:
                return _send_json(self, {'ok': False, 'message': 'scenario_id required'}, 400)
            share_code = (
                qs.get('share_code', [''])[0]
                or qs.get('share', [''])[0]
                or ''
            ).strip()
            _, err = self._resolve_game_scenario_access(scenario_id, share_code)
            if err:
                return _send_json(self, {'ok': False, 'message': err[0]}, err[1])
            plays = _storage.list_plays(
                scenario_id=scenario_id,
                play_purpose='general',
            )[:200]
            segments = []
            points = []
            for summary in plays:
                ref = summary.get('path')
                doc = _storage.load_play(ref) if ref else None
                if not doc:
                    continue
                for ev in (doc.get('outcome') or {}).get('events') or []:
                    path = ev.get('movePath') or []
                    pts = []
                    for p in path:
                        if isinstance(p, (list, tuple)) and len(p) >= 2:
                            pts.append((float(p[0]), float(p[1])))
                        elif isinstance(p, dict):
                            pts.append((float(p.get('x', 0)), float(p.get('y', 0))))
                    if len(pts) < 2 and ev.get('fromX') is not None:
                        pts = [(float(ev.get('fromX', 0)), float(ev.get('fromY', 0))),
                               (float(ev.get('toX', 0)), float(ev.get('toY', 0)))]
                    for a, b in zip(pts, pts[1:]):
                        if abs(a[0] - b[0]) < 1e-6 and abs(a[1] - b[1]) < 1e-6:
                            continue
                        segments.append([round(a[0], 1), round(a[1], 1),
                                         round(b[0], 1), round(b[1], 1)])
                    if pts:
                        points.append([round(pts[-1][0], 1), round(pts[-1][1], 1)])
            return _send_json(self, {
                'ok': True,
                'scenario_id': scenario_id,
                'n_plays': len(plays),
                'segments': segments[:20000],
                'points': points[:5000],
            })
        except Exception as e:
            return _send_json(self, {'ok': False, 'message': str(e)}, 500)
