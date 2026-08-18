"""Compatibility wrapper for :mod:`game_irl.human_play`."""
from game_irl.human_play import *  # noqa: F401,F403

if __name__ == "__main__":
    import runpy
    runpy.run_module("game_irl.human_play", run_name="__main__")
