"""Compatibility wrapper for :mod:`rl_trainer.fair_compare`."""
from rl_trainer.fair_compare import *  # noqa: F401,F403

if __name__ == "__main__":
    import runpy
    runpy.run_module("rl_trainer.fair_compare", run_name="__main__")
