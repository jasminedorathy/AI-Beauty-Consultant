"""
Tests for JWT creation, verification, and production-startup enforcement.
All tests run without a real database — jwt_handler is pure crypto logic.
"""

import os
import pytest


# ── Helpers ───────────────────────────────────────────────────────────────────

def _import_handler():
    """Import jwt_handler fresh (env vars already set by conftest)."""
    import importlib
    import app.auth.jwt_handler as mod
    return mod


# ── Access token round-trip ───────────────────────────────────────────────────

def test_create_and_verify_access_token():
    mod = _import_handler()
    token = mod.create_access_token({"sub": "user@example.com", "role": "user"})
    payload = mod.verify_access_token(token)
    assert payload is not None
    assert payload["sub"] == "user@example.com"
    assert payload["role"] == "user"
    assert payload["type"] == "access"


def test_expired_token_returns_none(monkeypatch):
    """A token with expiry in the past must be rejected."""
    from datetime import datetime, timedelta
    from jose import jwt as jose_jwt

    mod = _import_handler()
    # Craft a token that expired 10 minutes ago.
    payload = {
        "sub": "user@example.com",
        "type": "access",
        "exp": datetime.utcnow() - timedelta(minutes=10),
    }
    expired_token = jose_jwt.encode(payload, mod.SECRET_KEY, algorithm="HS256")
    assert mod.verify_access_token(expired_token) is None


def test_refresh_token_rejected_as_access_token():
    """A refresh token must NOT pass verify_access_token (type check)."""
    mod = _import_handler()
    refresh = mod.create_refresh_token({"sub": "user@example.com"})
    assert mod.verify_access_token(refresh) is None


def test_access_token_rejected_as_refresh_token():
    """An access token must NOT pass verify_refresh_token."""
    mod = _import_handler()
    access = mod.create_access_token({"sub": "user@example.com"})
    assert mod.verify_refresh_token(access) is None


def test_tampered_token_rejected():
    """Any change to the token body must cause verification to fail."""
    mod = _import_handler()
    token = mod.create_access_token({"sub": "user@example.com", "role": "user"})
    # Flip the last character.
    bad = token[:-1] + ("A" if token[-1] != "A" else "B")
    assert mod.verify_access_token(bad) is None


# ── Production startup enforcement ───────────────────────────────────────────

def test_weak_jwt_secret_raises_in_production():
    """jwt_handler must raise RuntimeError when loaded in production with a weak secret."""
    import importlib
    import sys

    # Save original env values.
    original_env = os.environ.get("ENVIRONMENT")
    original_secret = os.environ.get("JWT_SECRET")

    try:
        os.environ["ENVIRONMENT"] = "production"
        os.environ["JWT_SECRET"] = "weak"

        # Remove the cached module so it re-evaluates the secret check.
        sys.modules.pop("app.auth.jwt_handler", None)

        with pytest.raises(RuntimeError, match="JWT_SECRET"):
            import app.auth.jwt_handler  # noqa: F401
    finally:
        # Restore env and module state.
        if original_env is None:
            os.environ.pop("ENVIRONMENT", None)
        else:
            os.environ["ENVIRONMENT"] = original_env
        if original_secret is None:
            os.environ.pop("JWT_SECRET", None)
        else:
            os.environ["JWT_SECRET"] = original_secret
        sys.modules.pop("app.auth.jwt_handler", None)
