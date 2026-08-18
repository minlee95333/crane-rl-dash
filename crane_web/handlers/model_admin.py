"""Model-registry admin route handlers: label a .pt and delete a .pt / DB row.

Mixed into the concrete Handler in app.py. Methods use ``self`` for request
state (_read_json_payload, headers, rfile). Path validation and the in-memory
meta cache come from crane_web.model_meta; storage writes are lazy-imported.
"""
import json
import time
import urllib.parse

from crane_web.http_util import _send_json
from crane_web.paths import ROOT
from crane_web.model_meta import (
    _MODEL_META_CACHE,
    _model_meta_to_db_patch,
    _validate_model_path,
)


class ModelAdminHandlerMixin:
    def _handle_model_label(self):
        try:
            payload = self._read_json_payload()
            # Path-only validation so labels can still be edited when the .pt is
            # gone (ephemeral-disk redeploy left a DB row but no file). If the
            # file is missing we further require an existing DB row before
            # accepting the update — otherwise a stray path could create an
            # orphan row.
            target = _validate_model_path(payload.get('path'))
            rel_path = target.relative_to(ROOT).as_posix()
            file_present = target.exists()
            db_row = None
            if not file_present:
                try:
                    from crane_db.storage import get_model
                    db_row = get_model(rel_path)
                except Exception:
                    db_row = None
                if db_row is None:
                    return _send_json(
                        self,
                        {'ok': False, 'message': f'model not found: {rel_path}'},
                        404,
                    )
            label_path = target.with_suffix('.label.json')
            name = str(payload.get('name', '') or '').strip()
            memo = str(payload.get('memo', '') or '').strip()
            if not name and not memo:
                if file_present and label_path.exists():
                    label_path.unlink()
                try:
                    from crane_db.storage import upsert_model
                    # Don't drop the DB row — keep training metadata, just clear
                    # the user-supplied label fields.
                    upsert_model(rel_path, {'name': None, 'memo': None})
                except Exception:
                    pass
                return _send_json(self, {'ok': True, 'cleared': True, 'file_present': file_present})
            data = {'name': name, 'memo': memo, 'updatedAt': int(time.time())}
            if file_present:
                with open(label_path, 'w', encoding='utf-8') as f:
                    json.dump(data, f, ensure_ascii=False, indent=2)
            # Mirror to the DB so the label + extracted training metadata
            # survive an ephemeral-disk redeploy. First-time labeling on a
            # present file also backfills hparams + metrics from the on-disk
            # sidecars; for missing files the existing DB row's metadata is
            # left intact (only name/memo change).
            try:
                from crane_db.storage import upsert_model
                if file_present:
                    patch = _model_meta_to_db_patch(target)
                else:
                    patch = {}
                patch['name'] = name or None
                patch['memo'] = memo or None
                upsert_model(rel_path, patch)
            except Exception:
                pass
            return _send_json(self, {'ok': True, 'label': data, 'file_present': file_present})
        except (ValueError, FileNotFoundError) as e:
            return _send_json(self, {'ok': False, 'message': str(e)}, 400)
        except Exception as e:
            return _send_json(self, {'ok': False, 'message': str(e)}, 500)

    def _handle_model_delete(self, parsed):
        """Two modes, each tied to a specific file-presence state:

          ?path=X                  → file must be ABSENT. Drops the DB row only
                                     (use to clean up rows whose .pt was wiped
                                     by an ephemeral-disk redeploy).
          ?path=X&include_file=1   → file must be PRESENT. Deletes the .pt, its
                                     .label.json sidecar, AND the DB row.

        Each mode 409s on the wrong state so the caller can't accidentally
        delete metadata for a file that still exists, or vice versa. Path
        validation: must be under rl_trainer/ or python_mappo/ with .pt suffix."""
        try:
            qs = urllib.parse.parse_qs(parsed.query)
            rel_in = (qs.get('path', [''])[0] or '').strip()
            include_file = (qs.get('include_file', ['0'])[0] or '0').lower() in ('1', 'true', 'yes', 'on')
            if not rel_in:
                # Allow JSON body for symmetry with the label endpoint.
                n = int(self.headers.get('Content-Length', '0') or 0)
                if n:
                    body = json.loads(self.rfile.read(n).decode('utf-8') or '{}')
                    rel_in = str(body.get('path') or '').strip()
                    if not include_file:
                        include_file = bool(body.get('include_file') or body.get('includeFile'))
            target = _validate_model_path(rel_in)
            rel_path = target.relative_to(ROOT).as_posix()
            file_exists = target.exists()
            from crane_db.storage import delete_model_db
            if include_file:
                if not file_exists:
                    return _send_json(
                        self,
                        {'ok': False, 'message': '파일이 이미 디스크에 없습니다. include_file 없이 호출해 DB 행만 삭제하세요.'},
                        409,
                    )
                # Delete the .pt first — if this fails we want to leave the DB
                # row intact so the user can retry rather than have a half-done
                # state with no record of the model.
                try:
                    target.unlink()
                except OSError as e:
                    return _send_json(self, {'ok': False, 'message': f'파일 삭제 실패: {e}'}, 500)
                try:
                    lp = target.with_suffix('.label.json')
                    if lp.exists():
                        lp.unlink()
                except Exception:
                    pass
                # Invalidate the in-memory model meta cache for this file so the
                # next /api/models/list doesn't return a stale entry.
                try:
                    _MODEL_META_CACHE.pop(str(target), None)
                except Exception:
                    pass
                delete_model_db(rel_path)  # row may not exist yet (legacy); harmless
                return _send_json(self, {'ok': True, 'deleted': rel_path, 'file_deleted': True})
            # DB-row-only path.
            if file_exists:
                return _send_json(
                    self,
                    {'ok': False, 'message': '파일이 디스크에 존재합니다. DB 행을 삭제해도 다음 조회 때 다시 인덱싱됩니다. 파일까지 지우려면 include_file=1 로 호출하세요.'},
                    409,
                )
            removed = delete_model_db(rel_path)
            if not removed:
                return _send_json(self, {'ok': False, 'message': f'no DB row for: {rel_path}'}, 404)
            # Sweep any orphan .label.json next to the (missing) .pt — best-effort.
            try:
                lp = target.with_suffix('.label.json')
                if lp.exists():
                    lp.unlink()
            except Exception:
                pass
            return _send_json(self, {'ok': True, 'deleted': rel_path, 'file_deleted': False})
        except (ValueError, FileNotFoundError) as e:
            return _send_json(self, {'ok': False, 'message': str(e)}, 400)
        except Exception as e:
            return _send_json(self, {'ok': False, 'message': str(e)}, 500)
