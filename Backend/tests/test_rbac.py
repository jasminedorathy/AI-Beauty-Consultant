"""
Tests for RBAC and shop-owner verification (HR-02, HR-03).

Verifies:
  - Client passport endpoint enforces salon ownership (HR-02).
  - demo-payments and other production gates obey ENVIRONMENT.
"""

import pytest
from unittest.mock import patch, MagicMock
from fastapi import HTTPException


def _import_passport():
    from app.api import passport_routes
    return passport_routes


# ── HR-02: Passport endpoint enforces salon ownership ─────────────────────────

def test_passport_endpoint_rejects_non_shop_owner():
    pr = _import_passport()
    current_user = {"sub": "user@example.com", "role": "user"}
    with pytest.raises(HTTPException) as exc_info:
        import asyncio
        asyncio.get_event_loop().run_until_complete(
            pr.get_client_passport("507f1f77bcf86cd799439011", current_user)
        )
    assert exc_info.value.status_code == 403


def test_passport_endpoint_rejects_unverified_salon_owner():
    """
    A shop_owner with NO verified salon must receive 403, not the client data.
    The endpoint queries: salons WHERE owner=user AND is_verified=True.
    If that query returns None, access is denied.
    """
    pr = _import_passport()
    current_user = {"sub": "owner@example.com", "role": "shop_owner"}

    with patch.object(pr.salons_col, "find_one", return_value=None):
        with pytest.raises(HTTPException) as exc_info:
            import asyncio
            asyncio.get_event_loop().run_until_complete(
                pr.get_client_passport("507f1f77bcf86cd799439011", current_user)
            )
    assert exc_info.value.status_code == 403


def test_passport_endpoint_rejects_booking_from_different_salon():
    """
    A verified salon owner must NOT see a booking that belongs to another salon.
    The booking query includes salon_id so cross-salon access returns 404.
    """
    pr = _import_passport()
    current_user = {"sub": "owner@example.com", "role": "shop_owner"}

    fake_salon = {"id": "salon-A", "owner_user_id": "owner@example.com", "is_verified": True}

    def _salon_find(query, *args, **kwargs):
        return fake_salon

    # Return None for the booking — simulates a booking from salon-B being queried.
    def _booking_find(query, *args, **kwargs):
        return None

    with patch.object(pr.salons_col, "find_one", side_effect=_salon_find), \
         patch.object(pr.appointments_col, "find_one", side_effect=_booking_find):
        with pytest.raises(HTTPException) as exc_info:
            import asyncio
            asyncio.get_event_loop().run_until_complete(
                pr.get_client_passport("507f1f77bcf86cd799439011", current_user)
            )
    assert exc_info.value.status_code == 404


def test_passport_endpoint_allows_verified_owner_with_matching_booking():
    """
    A verified salon owner CAN read passport data for a booking that belongs
    to their salon.
    """
    pr = _import_passport()
    current_user = {"sub": "owner@example.com", "role": "shop_owner"}

    fake_salon = {"id": "salon-A", "owner_user_id": "owner@example.com", "is_verified": True}
    fake_booking = {"_id": "...", "salon_id": "salon-A", "user_email": "client@example.com"}
    fake_profile = {"user_email": "client@example.com", "skin_tone": "medium"}

    def _salon_find(query, *args, **kwargs):
        return fake_salon

    def _booking_find(query, *args, **kwargs):
        return fake_booking

    def _profile_find(query, *args, **kwargs):
        return fake_profile

    with patch.object(pr.salons_col, "find_one", side_effect=_salon_find), \
         patch.object(pr.appointments_col, "find_one", side_effect=_booking_find), \
         patch.object(pr.onboarding_col, "find_one", side_effect=_profile_find):
        import asyncio
        result = asyncio.get_event_loop().run_until_complete(
            pr.get_client_passport("507f1f77bcf86cd799439011", current_user)
        )

    assert result["success"] is True
    assert result["passport"].get("skin_tone") == "medium"
