"""Compatibility wrapper for :mod:`rl_trainer.experiments`."""
from rl_trainer.experiments import *  # noqa: F401,F403

if __name__ == "__main__":
    import runpy
    runpy.run_module("rl_trainer.experiments", run_name="__main__")
