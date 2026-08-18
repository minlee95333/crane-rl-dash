"""Regression: every shipped model directory must name its sidecar config.yaml.

`crane_web/model_meta._extract_model_meta` reads exactly `<model dir>/config.yaml`.
Two baselines shipped their training config as `restricted_detour_train_config.yaml`,
so the dashboard could not show num_cranes / crane_radius / lift weights / rated
curve for them even after the import bug in [test_model_meta.py] was fixed.

This walks the committed model roots rather than asserting on a hard-coded list,
so a future baseline that lands with a differently-named sidecar fails here.
"""
import pathlib

import pytest

ROOT = pathlib.Path(__file__).resolve().parents[1]
MODEL_ROOTS = (ROOT / "python_mappo" / "baselines",)

# Sidecar names that are legitimately not the model's training config.
_UNRELATED_YAML = frozenset()


def _model_dirs():
    for base in MODEL_ROOTS:
        if not base.exists():
            continue
        for pt in base.rglob("pytorch_mappo_model.pt"):
            yield pt.parent


def test_model_roots_are_present():
    """Guard against the glob silently matching nothing."""
    dirs = list(_model_dirs())
    assert dirs, "no committed baseline model directories found"


@pytest.mark.parametrize("model_dir", list(_model_dirs()), ids=lambda d: d.name)
def test_sidecar_config_is_named_config_yaml(model_dir):
    yamls = {p.name for p in model_dir.glob("*.yaml")} - _UNRELATED_YAML
    if not yamls:
        pytest.skip(f"{model_dir.name} ships no sidecar config")
    assert "config.yaml" in yamls, (
        f"{model_dir.name} has {sorted(yamls)} but no config.yaml -- "
        "the dashboard reads only config.yaml, so its metadata would be blank"
    )


@pytest.mark.parametrize("model_dir", list(_model_dirs()), ids=lambda d: d.name)
def test_sidecar_yields_plan_metadata(model_dir):
    """The rename is only worth anything if extraction actually populates fields."""
    if not (model_dir / "config.yaml").exists():
        pytest.skip(f"{model_dir.name} ships no sidecar config")
    from crane_web.model_meta import _extract_model_meta

    meta = _extract_model_meta(model_dir / "pytorch_mappo_model.pt")
    assert meta.get("num_cranes"), f"{model_dir.name}: num_cranes not extracted"
    assert meta.get("crane_radius"), f"{model_dir.name}: crane_radius not extracted"
