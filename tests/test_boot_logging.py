"""Regression: boot diagnostics must actually reach the deploy log.

Two separate defects shipped together in the persistence probe and both were
invisible in normal (TTY) local runs:

1. stdout is block-buffered when it is not a TTY -- which is exactly how a PaaS
   captures logs. The server never exits, so buffered lines were never written.
   The captured log then showed only the HTTP request line, because
   BaseHTTPRequestHandler logs that to stderr, while both boot prints (stdout)
   never appeared. Fixed with flush=True.

2. The message contained an em dash (U+2014). On a cp949 console that raises
   UnicodeEncodeError, which killed the process before serve_forever() -- the
   dashboard would not start at all on Windows.

These tests boot the real app.py with a pipe (non-TTY) on both streams, so they
reproduce the PaaS condition rather than the developer's terminal.
"""
import locale
import os
import pathlib
import socket
import subprocess
import sys
import time

import pytest

ROOT = pathlib.Path(__file__).resolve().parents[1]
BOOT_TIMEOUT_S = 45


def _free_port():
    with socket.socket() as s:
        s.bind(("127.0.0.1", 0))
        return s.getsockname()[1]


@pytest.fixture(scope="module")
def boot_output():
    """Start app.py with piped stdout/stderr and collect the first lines."""
    env = dict(os.environ)
    env["PORT"] = str(_free_port())
    env["HOST"] = "127.0.0.1"
    env.pop("PYTHONUNBUFFERED", None)  # the fix must not depend on this
    env.pop("PYTHONIOENCODING", None)  # nor on a UTF-8 console being forced

    # Decode with the same encoding the child writes in. Piped (non-TTY) Python
    # uses locale.getpreferredencoding(False) for stdout, so forcing utf-8 here
    # would mojibake the Korean verdict on a cp949 machine and fail the content
    # assertion for a reason that has nothing to do with the app.
    proc = subprocess.Popen(
        [sys.executable, "app.py"],   # deliberately no -u, matching a plain launch
        cwd=str(ROOT), env=env,
        # stdin must be pinned: under pytest's capture sys.stdin has no valid
        # OS handle, and inheriting it fails with WinError 6 on Windows.
        stdin=subprocess.DEVNULL,
        stdout=subprocess.PIPE, stderr=subprocess.STDOUT,
        text=True, encoding=locale.getpreferredencoding(False),
        errors="replace", bufsize=1,
    )
    lines, deadline = [], time.time() + BOOT_TIMEOUT_S
    try:
        while time.time() < deadline:
            if proc.poll() is not None:
                lines.extend((proc.stdout.read() or "").splitlines())
                break
            line = proc.stdout.readline()
            if line:
                lines.append(line.rstrip("\n"))
                if any("[persistence]" in l for l in lines):
                    break
            else:
                time.sleep(0.05)
        yield {"lines": lines, "exited_early": proc.poll() is not None,
               "returncode": proc.returncode}
    finally:
        if proc.poll() is None:
            proc.terminate()
            try:
                proc.wait(timeout=15)
            except subprocess.TimeoutExpired:
                proc.kill()


def test_server_survives_boot_diagnostics(boot_output):
    """The em-dash crash took the whole server down before serve_forever()."""
    assert not boot_output["exited_early"], (
        "app.py exited during boot:\n" + "\n".join(boot_output["lines"])
    )


def test_startup_banner_is_flushed(boot_output):
    joined = "\n".join(boot_output["lines"])
    assert "Crane RL dashboard running at" in joined, (
        "startup banner never reached a non-TTY stdout (missing flush):\n" + joined
    )


def test_persistence_line_is_flushed(boot_output):
    """The whole point of the probe: it has to show up in the deploy log."""
    joined = "\n".join(boot_output["lines"])
    assert "[persistence]" in joined, (
        "persistence diagnostic never reached a non-TTY stdout:\n" + joined
    )


def test_persistence_line_states_a_verdict(boot_output):
    line = next(l for l in boot_output["lines"] if "[persistence]" in l)
    assert ("볼륨 마운트 감지" in line) or ("볼륨 없음" in line) or ("쓰기 불가" in line) \
        or ("확인 실패" in line) or ("생성 실패" in line), \
        f"persistence line carries no verdict: {line!r}"


def test_boot_lines_survive_a_legacy_console_encoding():
    """cp949 (Windows Korean default) must be able to encode every boot string.

    Guards the exact regression: an em dash in the message raised
    UnicodeEncodeError on that console and aborted startup.
    """
    from crane_web.paths import persistence_status

    info = persistence_status()
    for text in (info["detail"], f"[persistence] {info['path']} - {info['detail']}"):
        try:
            text.encode("cp949")
        except UnicodeEncodeError as e:  # pragma: no cover - the failure we guard
            pytest.fail(f"boot text is not cp949-encodable ({e}): {text!r}")
