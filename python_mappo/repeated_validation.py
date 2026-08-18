"""Compatibility wrapper for :mod:`rl_trainer.repeated_validation`."""
from rl_trainer.repeated_validation import *  # noqa: F401,F403

if __name__ == "__main__":
    import runpy
    runpy.run_module("rl_trainer.repeated_validation", run_name="__main__")
