"""Session-wide test setup.

This build is local-only: `crane_db.storage` writes JSON files under the repo
root and opens no network connection, so there is no production database for
the suite to reach. The only thing left to do here is make this directory
importable before pytest finishes wiring sys.path for sibling helpers.
"""
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
