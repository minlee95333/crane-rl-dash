"""Host-header parsing and loopback detection helpers.

Pure functions shared by the request Handler's admin gating and the auth
handlers' email-redirect logic. No app.py back-import (one-directional).
"""


def _host_name(host_header: str) -> str:
    host = (host_header or '').split(',', 1)[0].strip().lower()
    if host.startswith('['):
        end = host.find(']')
        return host[1:end] if end >= 0 else host.strip('[]')
    return host.split(':', 1)[0]


def _is_loopback_name(name: str) -> bool:
    return name in ('localhost', '127.0.0.1', '::1') or name.startswith('127.')


def _is_loopback_client(addr) -> bool:
    host = addr[0] if addr else ''
    return _is_loopback_name(str(host).lower())
