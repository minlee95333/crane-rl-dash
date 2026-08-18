"""Per-domain request-handler mixins extracted from app.py.

Each module here defines a ``*HandlerMixin`` whose methods are the route
handlers for one domain. The concrete ``Handler`` in app.py composes them via
multiple inheritance, so the mixins keep using ``self`` for the request state
and shared helpers (cookies, ``_read_json_payload``, ``_require_admin_access``,
``_current_user`` …) that the concrete Handler / base class provides at runtime.

As with the rest of crane_web, importing from here must not import app.py back.
"""
