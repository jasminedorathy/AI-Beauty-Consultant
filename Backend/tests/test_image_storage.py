"""
Tests for private biometric image storage (MR-04 / finding #6).

Verifies the storage abstraction without any real Cloudinary credentials.
"""

import os
import base64
import pytest


def _import_storage():
    from app.utils import image_storage
    return image_storage


# ── Base64 fallback (no Cloudinary configured) ────────────────────────────────

def test_store_returns_b64_key_without_cloudinary():
    storage = _import_storage()
    img_bytes = b"\xff\xd8\xff" + b"\x00" * 100  # fake JPEG header
    key = storage.store_image(img_bytes, "user@example.com", "raw")
    assert key.startswith("b64:")
    # Key must not contain the data-URI prefix — that's added by get_image_url.
    assert not key.startswith("b64:data:")


def test_get_image_url_converts_b64_key_to_data_uri():
    storage = _import_storage()
    img_bytes = b"\xff\xd8\xff" + b"\x00" * 50
    key = storage.store_image(img_bytes, "user@example.com", "annotated")
    url = storage.get_image_url(key)
    assert url.startswith("data:image/jpeg;base64,")
    # Round-trip: decode the base64 portion and compare to original bytes.
    b64_part = url.split(",", 1)[1]
    assert base64.b64decode(b64_part) == img_bytes


def test_get_image_url_handles_legacy_data_uri():
    """Old DB records stored full data URIs — get_image_url must pass them through."""
    storage = _import_storage()
    legacy = "data:image/jpeg;base64," + base64.b64encode(b"fake").decode()
    assert storage.get_image_url(legacy) == legacy


def test_delete_image_noop_for_b64_key():
    """delete_image must not raise for base64 keys (nothing to delete remotely)."""
    storage = _import_storage()
    storage.delete_image("b64:AAAA")  # should not raise


def test_delete_image_noop_for_none():
    storage = _import_storage()
    storage.delete_image(None)  # should not raise
    storage.delete_image("")    # should not raise


# ── Production warning check ──────────────────────────────────────────────────

def test_production_without_cloudinary_logs_warning(caplog):
    import importlib
    import sys
    import logging

    original_env = os.environ.get("ENVIRONMENT")
    try:
        os.environ["ENVIRONMENT"] = "production"
        sys.modules.pop("app.utils.image_storage", None)

        with caplog.at_level(logging.WARNING, logger="beauty_api.image_storage"):
            import app.utils.image_storage  # noqa: F401

        assert any("Base64" in r.message or "Cloudinary" in r.message for r in caplog.records)
    finally:
        if original_env is None:
            os.environ.pop("ENVIRONMENT", None)
        else:
            os.environ["ENVIRONMENT"] = original_env
        sys.modules.pop("app.utils.image_storage", None)
