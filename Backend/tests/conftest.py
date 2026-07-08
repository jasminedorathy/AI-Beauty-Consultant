"""
Shared fixtures and environment setup for the test suite.

All env vars are set BEFORE any app module is imported so startup
validation code (JWT_SECRET length check, ENVIRONMENT guards) sees
the test values.
"""

import os
import sys

# Bootstrap test environment before any app import.
os.environ.setdefault("JWT_SECRET", "test-secret-key-at-least-32-characters-long!!!")
os.environ.setdefault("ENVIRONMENT", "test")
os.environ.setdefault("MONGO_URI", "mongodb://localhost:27017")
os.environ.setdefault("MONGODB_DB_NAME", "beauty_test")
# Disable Redis so the rate-limiter falls back to in-memory (no Redis needed in CI).
os.environ.setdefault("REDIS_RATE_LIMIT_ENABLED", "false")
os.environ.setdefault("REQUIRE_REDIS_RATE_LIMIT", "false")
# Disable Cloudinary so image_storage uses the base64 fallback.
os.environ.pop("CLOUDINARY_CLOUD_NAME", None)
os.environ.pop("CLOUDINARY_API_KEY", None)
os.environ.pop("CLOUDINARY_API_SECRET", None)

import pytest
