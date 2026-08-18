"""Compatibility wrapper for :mod:`crane_core.scorer`."""
from crane_core.scorer import *  # noqa: F401,F403

if __name__ == "__main__":
    import runpy
    runpy.run_module("crane_core.scorer", run_name="__main__")
