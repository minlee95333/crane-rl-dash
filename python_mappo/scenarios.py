"""Compatibility wrapper for :mod:`crane_core.scenarios`."""
from crane_core.scenarios import *  # noqa: F401,F403

if __name__ == "__main__":
    import runpy
    runpy.run_module("crane_core.scenarios", run_name="__main__")
