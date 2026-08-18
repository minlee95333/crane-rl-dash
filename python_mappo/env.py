"""Compatibility wrapper for :mod:`crane_core.env`."""
from crane_core.env import *  # noqa: F401,F403

if __name__ == "__main__":
    import runpy
    runpy.run_module("crane_core.env", run_name="__main__")
