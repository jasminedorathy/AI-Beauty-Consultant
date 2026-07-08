"""
Tests for payment security invariants (CR-02).

Verifies that:
  - The server always derives the payable amount from the booking / service.
  - Booking ownership is enforced before creating or verifying an order.
  - Demo payments are blocked in production mode.
"""

import os
import pytest
from unittest.mock import MagicMock, patch


# ── Helpers ───────────────────────────────────────────────────────────────────

def _import_routes():
    from app.api import payment_routes
    return payment_routes


# ── Server-side amount derivation ─────────────────────────────────────────────

def test_server_amount_derived_from_service_price():
    pr = _import_routes()
    booking = {"salon_id": "salon1", "service_name": "haircut", "amount": 999}
    fake_salon = {"services_with_pricing": [{"name": "haircut", "price": 250.0, "is_active": True}]}

    with patch.object(pr.salons_collection, "find_one", return_value=fake_salon):
        amount = pr._server_amount_for_booking(booking)
    # Must use service price (250), not client-supplied amount (999).
    assert amount == 250.0


def test_server_amount_falls_back_to_booking_price_when_service_missing():
    pr = _import_routes()
    booking = {"salon_id": "salon1", "service_name": "unknown-service", "amount": 150.0}
    fake_salon = {"services_with_pricing": []}

    with patch.object(pr.salons_collection, "find_one", return_value=fake_salon):
        amount = pr._server_amount_for_booking(booking)
    assert amount == 150.0


def test_server_amount_raises_when_no_payable_amount():
    from fastapi import HTTPException
    pr = _import_routes()
    booking = {"salon_id": "s", "service_name": "x", "amount": 0}
    fake_salon = {"services_with_pricing": []}

    with patch.object(pr.salons_collection, "find_one", return_value=fake_salon):
        with pytest.raises(HTTPException) as exc_info:
            pr._server_amount_for_booking(booking)
    assert exc_info.value.status_code == 400


# ── Booking ownership ─────────────────────────────────────────────────────────

def test_find_owned_booking_returns_none_for_other_user():
    pr = _import_routes()
    # Simulates a booking that belongs to "alice" being queried by "eve".
    with patch.object(pr.slot_bookings_collection, "find_one", return_value=None):
        result = pr._find_owned_booking("booking123", "eve@example.com")
    assert result is None


def test_find_owned_booking_returns_booking_for_owner():
    pr = _import_routes()
    fake_booking = {"id": "booking123", "user_id": "alice@example.com", "amount": 200}
    with patch.object(pr.slot_bookings_collection, "find_one", return_value=fake_booking):
        result = pr._find_owned_booking("booking123", "alice@example.com")
    assert result == fake_booking


# ── Demo payment guard ────────────────────────────────────────────────────────

def test_demo_payments_disallowed_in_production():
    """When ENVIRONMENT=production, DEMO_PAYMENTS_ALLOWED must be False."""
    import importlib
    original_env = os.environ.get("ENVIRONMENT")
    try:
        os.environ["ENVIRONMENT"] = "production"
        pr = _import_routes()
        importlib.reload(pr)  # re-execute module code with updated env
        assert pr.DEMO_PAYMENTS_ALLOWED is False
    finally:
        if original_env is None:
            os.environ.pop("ENVIRONMENT", None)
        else:
            os.environ["ENVIRONMENT"] = original_env
        importlib.reload(pr)  # restore to test-environment state


def test_demo_payments_allowed_in_development():
    """Demo payments must remain usable in non-production environments."""
    import importlib
    original_env = os.environ.get("ENVIRONMENT")
    try:
        os.environ["ENVIRONMENT"] = "development"
        pr = _import_routes()
        importlib.reload(pr)
        assert pr.DEMO_PAYMENTS_ALLOWED is True
    finally:
        if original_env is None:
            os.environ.pop("ENVIRONMENT", None)
        else:
            os.environ["ENVIRONMENT"] = original_env
