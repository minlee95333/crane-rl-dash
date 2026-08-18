"""Compatibility wrapper for :mod:`game_irl.compare_irl_runs`."""
from game_irl.compare_irl_runs import *  # noqa: F401,F403

if __name__ == "__main__":
    import runpy
    runpy.run_module("game_irl.compare_irl_runs", run_name="__main__")
