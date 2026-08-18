"""Compatibility wrapper for :mod:`rl_trainer.auto_reward_opt`."""
from rl_trainer.auto_reward_opt import *  # noqa: F401,F403

if __name__ == "__main__":
    import runpy
    runpy.run_module("rl_trainer.auto_reward_opt", run_name="__main__")
