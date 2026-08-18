"""Compatibility wrapper for :mod:`rl_trainer.curriculum`."""
from rl_trainer.curriculum import *  # noqa: F401,F403

if __name__ == "__main__":
    import runpy
    runpy.run_module("rl_trainer.curriculum", run_name="__main__")
