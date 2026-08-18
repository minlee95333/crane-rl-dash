"""Compatibility wrapper for :mod:`rl_trainer.evaluate`."""
from rl_trainer.evaluate import *  # noqa: F401,F403

if __name__ == "__main__":
    import runpy
    runpy.run_module("rl_trainer.evaluate", run_name="__main__")
