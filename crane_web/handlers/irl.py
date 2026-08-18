"""Game IRL artifact route handlers (priors, cross-validate, A/B report, run).

Mixed into the concrete Handler in app.py. Every handler is admin-gated; the
delete uses the destructive gate. Methods use ``self`` for request state and
the admin-gate / JSON-body helpers the Handler provides. Path validation goes
through the shared crane_web.paths roots and the model_meta containment check.
"""
import urllib.parse

from crane_web.http_util import _send_json
from crane_web.paths import ROOT, AUTO_REWARD_RUN_ROOTS
from crane_web.model_meta import _is_relative_to


class GameIrlHandlerMixin:
    def _handle_game_irl_artifact_get(self, parsed):
        if not self._require_admin_access():
            return
        try:
            from crane_db.storage import load_irl_artifact
            qs = urllib.parse.parse_qs(parsed.query)
            path = qs.get('path', [None])[0]
            if not path:
                return _send_json(self, {'ok': False, 'message': 'path query param required'}, 400)
            doc = load_irl_artifact(path)
            if doc is None:
                return _send_json(self, {'ok': False, 'message': 'irl artifact not found'}, 404)
            return _send_json(self, {'ok': True, 'artifact': doc, 'path': path})
        except Exception as e:
            return _send_json(self, {'ok': False, 'message': str(e)}, 500)

    def _handle_game_irl_artifact_delete(self, parsed):
        if not self._require_admin_for_destructive():
            return
        try:
            from crane_db.storage import delete_irl_artifact
            qs = urllib.parse.parse_qs(parsed.query)
            path = qs.get('path', [None])[0]
            if not path:
                return _send_json(self, {'ok': False, 'message': 'path query param required'}, 400)
            ok = delete_irl_artifact(path)
            if not ok:
                return _send_json(self, {'ok': False, 'message': 'artifact not found or could not be deleted'}, 404)
            return _send_json(self, {'ok': True, 'path': path})
        except Exception as e:
            return _send_json(self, {'ok': False, 'message': str(e)}, 500)

    def _handle_game_irl_latest(self, parsed):
        if not self._require_admin_access():
            return
        try:
            from crane_db.storage import latest_irl_artifact, IRL_KIND_PRIOR
            entry = latest_irl_artifact(IRL_KIND_PRIOR)
            if entry is None:
                return _send_json(self, {'ok': True, 'prior': None})
            return _send_json(self, {
                'ok': True,
                'prior': entry['doc'],
                'path': entry['summary']['path'],
            })
        except Exception as e:
            return _send_json(self, {'ok': False, 'message': str(e)}, 500)

    def _handle_game_irl_cross_validate(self, parsed):
        """Cross-validation report: rescore an auto_reward run under IRL
        weights and compare against DEFAULT_WEIGHTS. Read-only — no training,
        no auto_reward_opt invocation."""
        if not self._require_admin_access():
            return
        try:
            from game_irl.cross_validate_irl import cross_validate, _load_irl_weights_from_doc
            from crane_db.storage import load_irl_artifact, save_irl_artifact, IRL_KIND_CROSS_VALIDATE
            qs = urllib.parse.parse_qs(parsed.query)
            prior_rel = qs.get('prior', [None])[0]
            run_rel = qs.get('run', [None])[0]
            if not prior_rel or not run_rel:
                return _send_json(self, {'ok': False, 'message': 'prior= and run= query params required'}, 400)
            # Prior ref may be a Postgres key or a relative file path.
            if prior_rel.startswith('pg:'):
                prior_doc = load_irl_artifact(prior_rel)
                if prior_doc is None:
                    return _send_json(self, {'ok': False, 'message': f'prior not found: {prior_rel}'}, 404)
                prior_for_cv = prior_doc
            else:
                prior_path = (ROOT / prior_rel).resolve()
                allowed_prior_root = (ROOT / 'irl_priors').resolve()
                try:
                    prior_path.relative_to(allowed_prior_root)
                except ValueError:
                    return _send_json(self, {'ok': False, 'message': 'file priors must live under irl_priors/'}, 400)
                if not prior_path.exists():
                    return _send_json(self, {'ok': False, 'message': f'prior file not found: {prior_rel}'}, 404)
                prior_for_cv = prior_path
            run_path = (ROOT / run_rel).resolve()
            allowed_roots = tuple(root.resolve() for root in AUTO_REWARD_RUN_ROOTS)
            if not any(_is_relative_to(run_path, root) for root in allowed_roots):
                return _send_json(self, {'ok': False, 'message': 'run dir must be under rl_trainer/auto_reward_runs/ or python_mappo/auto_reward_runs/'}, 400)
            if not run_path.exists():
                return _send_json(self, {'ok': False, 'message': f'auto_reward run dir not found: {run_rel}'}, 404)
            report = cross_validate(prior_for_cv, run_path)
            ref = save_irl_artifact(IRL_KIND_CROSS_VALIDATE, report,
                                     label=f"cross_validate:{prior_rel}_vs_{run_path.name}")
            return _send_json(self, {'ok': True, 'report': report, 'path': ref})
        except Exception as e:
            return _send_json(self, {'ok': False, 'message': str(e)}, 500)

    def _handle_game_irl_list(self, parsed):
        """List IRL prior artifacts (storage-routed: Postgres or file)."""
        if not self._require_admin_access():
            return
        try:
            from crane_db.storage import list_irl_artifacts, IRL_KIND_PRIOR
            priors = list_irl_artifacts(kind=IRL_KIND_PRIOR)
            return _send_json(self, {'ok': True, 'priors': priors})
        except Exception as e:
            return _send_json(self, {'ok': False, 'message': str(e)}, 500)

    def _handle_game_irl_ab_report(self, parsed):
        """Return either the latest ab_report or a freshly computed comparison
        between two auto_reward_runs subdirs (?baseline=...&with_prior=...)."""
        if not self._require_admin_access():
            return
        try:
            from game_irl.compare_irl_runs import compare
            from crane_db.storage import latest_irl_artifact, save_irl_artifact, IRL_KIND_AB_REPORT
            qs = urllib.parse.parse_qs(parsed.query)
            baseline_q = qs.get('baseline', [None])[0]
            with_prior_q = qs.get('with_prior', [None])[0]
            if baseline_q and with_prior_q:
                # Recompute on the fly. Paths are relative-to-ROOT for safety.
                base_path = (ROOT / baseline_q).resolve()
                wp_path = (ROOT / with_prior_q).resolve()
                allowed_roots = tuple(root.resolve() for root in AUTO_REWARD_RUN_ROOTS)
                if not all(any(_is_relative_to(p, root) for root in allowed_roots) for p in (base_path, wp_path)):
                    return _send_json(self, {'ok': False, 'message': 'paths must be under rl_trainer/auto_reward_runs/ or python_mappo/auto_reward_runs/'}, 400)
                report = compare(base_path, wp_path)
                ref = save_irl_artifact(IRL_KIND_AB_REPORT, report,
                                         label=f"ab_report:{base_path.name}_vs_{wp_path.name}")
                return _send_json(self, {'ok': True, 'report': report, 'path': ref, 'on_the_fly': True})
            entry = latest_irl_artifact(IRL_KIND_AB_REPORT)
            if entry is None:
                return _send_json(self, {'ok': True, 'report': None})
            return _send_json(self, {'ok': True, 'report': entry['doc'], 'path': entry['summary']['path']})
        except Exception as e:
            return _send_json(self, {'ok': False, 'message': str(e)}, 500)

    def _handle_game_irl_run(self):
        """Start a re-estimation run and return immediately.

        The fit takes minutes (see crane_web.irl_jobs), which no reverse proxy
        will hold a request open for, so this only ever starts the job — the
        browser polls /api/game/irl/run/status for the result.
        """
        if not self._require_admin_access():
            return
        try:
            from crane_web.irl_jobs import start_irl_job
            payload = self._read_json_payload() or {}
            params = {
                'tier': payload.get('tier') or None,
                'labeler': payload.get('labeler') or 'maxent',
                'bootstrap': int(payload.get('bootstrap') or 100),
                'l2': float(payload.get('l2') or 1.0),
                'n_samples': int(payload.get('samples') or payload.get('n_samples') or 200),
                'sample_seed': int(payload.get('sample_seed') or 0),
            }
            started, job = start_irl_job(params, owner_id=(self._current_user() or {}).get('id'))
            if not started:
                return _send_json(self, {
                    'ok': False,
                    'message': 'IRL 재추정이 이미 실행 중입니다.',
                    'job': job,
                }, 409)
            return _send_json(self, {'ok': True, 'job': job}, 202)
        except Exception as e:
            return _send_json(self, {'ok': False, 'message': str(e)}, 500)

    def _handle_game_irl_run_status(self):
        if not self._require_admin_access():
            return
        try:
            from crane_web.irl_jobs import irl_job_snapshot
            job = irl_job_snapshot()
            if job is None:
                return _send_json(self, {'ok': True, 'job': None})
            return _send_json(self, {'ok': True, 'job': job})
        except Exception as e:
            return _send_json(self, {'ok': False, 'message': str(e)}, 500)
