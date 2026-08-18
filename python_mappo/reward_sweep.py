"""Compatibility wrapper for :mod:`rl_trainer.reward_sweep`."""
from rl_trainer.reward_sweep import *  # noqa: F401,F403

if __name__ == "__main__":
    import runpy
    runpy.run_module("rl_trainer.reward_sweep", run_name="__main__")
