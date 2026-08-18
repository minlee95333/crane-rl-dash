"""Compatibility wrapper for :mod:`rl_trainer.train`."""
from rl_trainer.train import *  # noqa: F401,F403

if __name__ == "__main__":
    import runpy
    runpy.run_module("rl_trainer.train", run_name="__main__")
