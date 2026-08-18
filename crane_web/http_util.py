"""Shared HTTP response primitives extracted from app.py.

Pure helpers that write a JSON or file response onto a
BaseHTTPRequestHandler. No app.py or module-global coupling, so both
app.py and crane_web route mixins can import them without a cycle.
"""
import json
import sys
import traceback
import uuid
from pathlib import Path


def _send_internal_error(handler, exc, message='서버 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.'):
    """Answer an unexpected exception without leaking its text to the client.

    Public deployments serve strangers. A raw ``str(exc)`` from a library or the
    filesystem carries DB hostnames, ports, SQL and absolute paths. Log the full
    traceback server-side under a short id and hand the client only that id, so
    a participant's bug report can still be matched to the log line.
    """
    error_id = uuid.uuid4().hex[:12]
    print(f'[error {error_id}] {type(exc).__name__}: {exc}', file=sys.stderr)
    traceback.print_exception(type(exc), exc, exc.__traceback__, file=sys.stderr)
    return _send_json(handler, {'ok': False, 'message': message, 'errorId': error_id}, 500)


def _send_json(handler, obj, status=200, extra_headers=None, head_only=False):
    data = json.dumps(obj, ensure_ascii=False, indent=2).encode('utf-8')
    handler.send_response(status)
    handler.send_header('Content-Type', 'application/json; charset=utf-8')
    handler.send_header('Content-Length', str(len(data)))
    for headers in (getattr(handler, '_pending_extra_headers', None), extra_headers):
        for k, v in (headers or {}).items():
            if isinstance(v, (list, tuple)):
                for item in v:
                    handler.send_header(k, str(item))
            else:
                handler.send_header(k, str(v))
    handler._pending_extra_headers = {}
    handler.end_headers()
    if not head_only:
        handler.wfile.write(data)


def _send_file(handler, path: Path, content_type: str, head_only=False):
    data = path.read_bytes()
    handler.send_response(200)
    handler.send_header('Content-Type', content_type)
    handler.send_header('Content-Length', str(len(data)))
    handler.end_headers()
    if not head_only:
        handler.wfile.write(data)
