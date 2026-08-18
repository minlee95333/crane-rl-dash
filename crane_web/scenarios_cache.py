"""In-process cache of the public custom-scenarios list.

Shared by the game-scenarios read path and by the user/admin scenario
mutation handlers (which bust the cache so public-visibility changes
propagate without waiting out the TTL). Self-contained: only stdlib plus a
lazy crane_db.storage import, so handler modules can import it without an
app.py back-import.
"""
import threading
import time

_PUBLIC_SCENARIOS_CACHE_TTL = 30  # seconds
_public_scenarios_cache = {'data': None, 'expires_at': 0.0}
_public_scenarios_cache_lock = threading.Lock()


def _get_public_scenarios_cached():
    """Return the public custom-scenarios list from the in-process cache.
    Refreshes from Postgres when the cache is empty or stale (TTL controlled
    by _PUBLIC_SCENARIOS_CACHE_TTL). Network errors degrade to an empty list
    so the page still renders the system scenarios."""
    now = time.time()
    with _public_scenarios_cache_lock:
        if (_public_scenarios_cache['data'] is not None
                and _public_scenarios_cache['expires_at'] > now):
            return _public_scenarios_cache['data']
    # Outside the lock so a slow DB call doesn't block other callers.
    try:
        from crane_db import storage as _storage
        data = _storage.list_user_scenarios(visibility='public', with_layout=False)
    except Exception:
        data = []
    with _public_scenarios_cache_lock:
        _public_scenarios_cache['data'] = data
        _public_scenarios_cache['expires_at'] = time.time() + _PUBLIC_SCENARIOS_CACHE_TTL
    return data


def _invalidate_public_scenarios_cache():
    """Bust the cache after a user creates / updates / deletes a scenario so
    public-visibility changes propagate without a 30 s wait."""
    with _public_scenarios_cache_lock:
        _public_scenarios_cache['data'] = None
        _public_scenarios_cache['expires_at'] = 0.0
