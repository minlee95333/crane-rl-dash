"""Regression: the boot-time persistence probe must tell the truth.

Dashboard-trained models land in TRAINER_DASHBOARD_RUNS. If that path ever sits
inside a container filesystem, every model is lost the next time the container
is replaced — the failure this probe exists to catch. The probe is
advisory (nothing in the request path reads it), so these tests pin the two
things that matter: it never raises, and it never claims persistence it hasn't
established.
"""
import os
import pathlib
import sys
from unittest import mock

import pytest

ROOT = pathlib.Path(__file__).resolve().parents[1]
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))

from crane_web.paths import TRAINER_DASHBOARD_RUNS, persistence_status  # noqa: E402


def test_reports_on_the_dashboard_runs_dir_by_default():
    info = persistence_status()
    assert info["path"] == str(TRAINER_DASHBOARD_RUNS)


def test_local_checkout_is_writable_but_not_persistent(tmp_path):
    """A plain directory on the app's own device is exactly the bad case."""
    info = persistence_status(tmp_path / "dashboard_runs")
    assert info["exists"] is True
    assert info["writable"] is True
    assert info["separate_device"] is False
    assert info["persistent"] is False
    assert "재배포" in info["detail"]


def test_creates_the_directory_when_missing(tmp_path):
    target = tmp_path / "nested" / "dashboard_runs"
    assert not target.exists()
    info = persistence_status(target)
    assert target.is_dir()
    assert info["exists"] is True


def test_leaves_no_probe_file_behind(tmp_path):
    target = tmp_path / "dashboard_runs"
    persistence_status(target)
    assert list(target.iterdir()) == [], "write probe was not cleaned up"


def test_separate_device_is_reported_as_persistent(tmp_path):
    """Simulate a mounted volume: the target sits on a different st_dev."""
    target = tmp_path / "dashboard_runs"
    target.mkdir()

    class _Dev:
        def __init__(self, dev):
            self.st_dev = dev

    def stat_side_effect(path, *a, **kw):
        return _Dev(999) if pathlib.Path(path) == target else _Dev(1)

    with mock.patch("crane_web.paths.os.stat", side_effect=stat_side_effect):
        info = persistence_status(target)
    assert info["separate_device"] is True
    assert info["persistent"] is True
    assert "재배포 후에도 유지" in info["detail"]


def test_unwritable_target_is_not_persistent(tmp_path):
    """A volume mounted root-owned under a non-root app must not read as OK."""
    target = tmp_path / "dashboard_runs"
    target.mkdir()
    with mock.patch(
        "pathlib.Path.write_text", side_effect=PermissionError("read-only volume")
    ):
        info = persistence_status(target)
    assert info["writable"] is False
    assert info["persistent"] is False
    assert "쓰기 불가" in info["detail"]


def test_never_raises_on_a_hopeless_path():
    """Boot must not die because the probe path is unusable."""
    bad = pathlib.Path("/proc/nonexistent-crane-probe/dashboard_runs")
    if os.name == "nt":
        bad = pathlib.Path("Z:/nonexistent-crane-probe/dashboard_runs")
    info = persistence_status(bad)  # must not raise
    assert info["persistent"] is False


@pytest.mark.parametrize("key", ["path", "exists", "writable", "separate_device", "persistent", "detail"])
def test_result_shape_is_stable(key, tmp_path):
    assert key in persistence_status(tmp_path / "dashboard_runs")
