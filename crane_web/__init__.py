"""Web/server support modules extracted from app.py.

Cohesive, low-coupling helper groups live here so app.py can stay focused on
the HTTP Handler and server bootstrap. Importing from this package must not
import app.py back (keep the dependency one-directional).
"""
