# -*- coding: utf-8 -*-
"""Steel-frame erection scenario — a realistic 3-storey steel-frame site.

Self-contained feature package so it stays easy to manage:
  * ``members``  — member model + erection-precedence mechanics (topo sort, seq)
  * ``generate`` — the 3-storey map generator (geometry + precedence policy)
  * ``SPEC``     — the built scenario spec, registered by crane_core.scenarios

The public scenario API (``crane_core.scenarios``) is untouched; it simply pulls
``SPEC`` in and registers it alongside the generated standard maps.
"""
from __future__ import annotations

from crane_core.steelframe.generate import build_spec

SPEC = build_spec()

__all__ = ["SPEC", "build_spec"]
