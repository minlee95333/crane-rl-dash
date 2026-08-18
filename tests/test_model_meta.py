"""Regression: model metadata must be extracted from the config.yaml sidecar.

`crane_web/model_meta.py` was extracted out of app.py in 183bce6 (2026-06-20)
without carrying over the `_read_yaml` / `_copy_model_plan_config` imports it
uses. Both calls sit inside `try: ... except Exception: pass`, so the resulting
AttributeError was swallowed and the whole config.yaml block silently produced
nothing. Every model in the dashboard therefore reported "정격곡선 없음" and
lost num_cranes / crane_radius / lift-weight / site-size, even when its
config.yaml (and its .pt) carried a full rated-load curve.

The planning path reads the config embedded in the .pt, not this sidecar, so
the defect was display-only -- which is exactly why it went unnoticed. These
tests pin the extraction itself rather than the label text.
"""
import pathlib
import sys

import pytest

ROOT = pathlib.Path(__file__).resolve().parents[1]
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))

yaml = pytest.importorskip("yaml", reason="pyyaml is required for model metadata")

from crane_web.model_meta import _extract_model_meta, _model_meta_to_db_patch  # noqa: E402

# A trimmed but structurally faithful copy of what /api/train/start writes into
# a run directory: plan config plus a rated-load curve.
SIDECAR_CONFIG = {
    "num_cranes": 3,
    "num_lifts": 24,
    "candidate_k": 5,
    "crane_radius": 18.0,
    "fixed_duration": 25.0,
    "setup_time": 10.0,
    "train_episodes": 150,
    "site_width": 100.0,
    "site_height": 100.0,
    "lift_weight_min_t": 5.0,
    "lift_weight_max_t": 30.0,
    "default_lift_weight_t": 15.0,
    "crane_capacity_curve": [
        {"radius": 3.0, "capacityT": 50.0},
        {"radius": 8.0, "capacityT": 32.0},
        {"radius": 18.0, "capacityT": 10.0},
    ],
}

VALIDATION_RESULT = {
    "trainEpisodes": 150,
    "elapsedSec": 42.0,
    "trainSummary": {"best": {"makespan": 291.51}, "modelStats": {"craneType": "50t"}},
    "validation": {"mappo": {"makespan": 328.93}},
    "unseen": {"mappo": {"makespan": 336.74}},
}


@pytest.fixture
def run_dir(tmp_path):
    """A model directory shaped like rl_trainer/dashboard_runs/run_*/."""
    import json

    d = tmp_path / "run_20260720_120000"
    d.mkdir()
    with open(d / "config.yaml", "w", encoding="utf-8") as f:
        yaml.safe_dump(SIDECAR_CONFIG, f, allow_unicode=True)
    with open(d / "pytorch_mappo_validation_result.json", "w", encoding="utf-8") as f:
        json.dump(VALIDATION_RESULT, f)
    pt = d / "pytorch_mappo_model.pt"
    pt.write_bytes(b"")  # never loaded: metadata comes from the sidecars
    return pt


def test_helpers_are_actually_imported():
    """The names the config block calls must resolve at module scope.

    Guards the exact failure mode: they were referenced but never imported, and
    the surrounding `except Exception` hid it.
    """
    import crane_web.model_meta as mm

    for name in ("_read_yaml", "_copy_model_plan_config"):
        assert hasattr(mm, name), f"model_meta must import {name}"


def test_rated_load_curve_is_extracted(run_dir):
    """The dashboard label reads meta['crane_capacity_curve'] -- it must survive."""
    meta = _extract_model_meta(run_dir)
    curve = meta.get("crane_capacity_curve")
    assert isinstance(curve, list) and curve, (
        "crane_capacity_curve missing -> the UI would wrongly show '정격곡선 없음'"
    )
    assert len(curve) == len(SIDECAR_CONFIG["crane_capacity_curve"])


def test_plan_config_fields_are_extracted(run_dir):
    """num_cranes / crane_radius / lift weights all vanished with the same bug."""
    meta = _extract_model_meta(run_dir)
    assert meta.get("num_cranes") == 3
    assert meta.get("num_lifts") == 24
    assert meta.get("crane_radius") == 18.0
    assert meta.get("candidate_k") == 5
    assert meta.get("lift_weight_min_t") == 5.0
    assert meta.get("lift_weight_max_t") == 30.0
    assert meta.get("site_width") == 100.0


def test_validation_metrics_still_extracted(run_dir):
    """The metrics block was never broken -- keep it that way."""
    meta = _extract_model_meta(run_dir)
    assert meta.get("kind") == "single"
    assert meta.get("trainEpisodes") == 150
    assert meta.get("bestMakespan") == 291.51
    assert meta.get("validationMakespan") == 328.93
    assert meta.get("unseenMakespan") == 336.74


def test_db_patch_carries_the_plan_config(run_dir):
    """Empty hparams was the DB-side symptom: nothing survived a redeploy."""
    patch = _model_meta_to_db_patch(run_dir)
    hparams = patch.get("hparams") or {}
    assert "crane_capacity_curve" in hparams
    assert hparams.get("num_cranes") == 3
    assert hparams.get("crane_radius") == 18.0
    metrics = patch.get("metrics") or {}
    assert metrics.get("bestMakespan") == 291.51


def test_missing_sidecar_stays_graceful(tmp_path):
    """A .pt with no config.yaml must yield empty metadata, not raise."""
    pt = tmp_path / "pytorch_mappo_model.pt"
    pt.write_bytes(b"")
    meta = _extract_model_meta(pt)
    assert meta.get("crane_capacity_curve") is None
    assert meta.get("num_cranes") is None


def test_malformed_sidecar_stays_graceful(tmp_path):
    """Unparseable YAML must not break the model list for every other model."""
    pt = tmp_path / "pytorch_mappo_model.pt"
    pt.write_bytes(b"")
    (tmp_path / "config.yaml").write_text("num_cranes: [unclosed\n", encoding="utf-8")
    meta = _extract_model_meta(pt)  # must not raise
    assert meta.get("num_cranes") is None
