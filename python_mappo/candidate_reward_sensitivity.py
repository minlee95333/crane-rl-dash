"""Compatibility wrapper for :mod:`rl_trainer.candidate_reward_sensitivity`."""
from rl_trainer.candidate_reward_sensitivity import *  # noqa: F401,F403

if __name__ == "__main__":
    import runpy
    runpy.run_module("rl_trainer.candidate_reward_sensitivity", run_name="__main__")
