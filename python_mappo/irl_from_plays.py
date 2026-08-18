"""Compatibility wrapper for :mod:`game_irl.irl_from_plays`."""
from game_irl.irl_from_plays import *  # noqa: F401,F403

if __name__ == "__main__":
    import runpy
    runpy.run_module("game_irl.irl_from_plays", run_name="__main__")
