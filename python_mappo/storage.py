"""Compatibility wrapper for :mod:`crane_db.storage`."""
from crane_db.storage import *  # noqa: F401,F403

if __name__ == "__main__":
    import runpy
    runpy.run_module("crane_db.storage", run_name="__main__")
