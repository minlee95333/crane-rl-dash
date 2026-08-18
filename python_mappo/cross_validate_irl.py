"""Compatibility wrapper for :mod:`game_irl.cross_validate_irl`."""
from game_irl.cross_validate_irl import *  # noqa: F401,F403

if __name__ == "__main__":
    import runpy
    runpy.run_module("game_irl.cross_validate_irl", run_name="__main__")
