import logging
_log = logging.getLogger("beauty_api.payments")

"""
Razorpay Payment Routes — Full Integration
Handles: order creation, payment verification, refunds, payment history.
Works in demo mode when RAZORPAY_KEY_ID is not set.
"""
from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import Optional
import os
import hmac
import hashlib
import uuid
from datetime import datetime

from app.auth.jwt_handler import get_current_user
from app.mongodb.collections import slot_bookings_collection, salons_collection, db

router = APIRouter(prefix="/api/payments", tags=["Payments"])

RAZORPAY_KEY_ID     = os.getenv("RAZORPAY_KEY_ID", "")
RAZORPAY_KEY_SECRET = os.getenv("RAZORPAY_KEY_SECRET", "")

# Demo (no-Razorpay-keys) payment confirmation is only allowed when the app is
# explicitly NOT running in production. This closes the "free booking
# confirmation" gap: previously, simply omitting Razorpay keys in any
# environment (including a misconfigured production deploy) silently let
# every booking be confirmed for free. Set ENVIRONMENT=production (or
# APP_ENV=production) to disable demo payments outright, regardless of
# whether Razorpay keys are configured.
_ENVIRONMENT = (os.getenv("ENVIRONMENT") or os.getenv("APP_ENV") or "development").strip().lower()
DEMO_PAYMENTS_ALLOWED = _ENVIRONMENT not in ("production", "prod")

payments_collection = db["payments"]


def _find_owned_booking(booking_id: str, user_id: str):
    """Looks up a booking AND verifies it belongs to user_id. Returns None if
    the booking doesn't exist OR belongs to someone else — callers should
    treat both cases identically (404) so booking ownership can't be probed."""
    return slot_bookings_collection.find_one({
        "$or": [{"id": booking_id}, {"booking_ref": booking_id}],
        "user_id": user_id,
    })


def _canonical_booking_id(booking: dict) -> str:
    return booking.get("id") or booking.get("booking_ref")


def _find_booked_service(booking: dict) -> Optional[dict]:
    salon_id = booking.get("salon_id")
    service_name = (booking.get("service_name") or "").strip().lower()
    if not salon_id or not service_name:
        return None
    salon = salons_collection.find_one({"id": salon_id}, {"services_with_pricing": 1})
    for service in (salon or {}).get("services_with_pricing", []):
        if (service.get("name") or "").strip().lower() == service_name:
            return service
    return None


def _server_amount_for_booking(booking: dict) -> float:
    service = _find_booked_service(booking)
    amount = None
    if service and service.get("is_active", True):
        amount = service.get("price")
    if amount is None:
        amount = booking.get("amount", booking.get("price"))
    try:
        amount = round(float(amount), 2)
    except (TypeError, ValueError):
        amount = 0.0
    if amount <= 0:
        raise HTTPException(status_code=400, detail="Booking has no payable server-side amount.")
    return amount


def _to_paise(amount: float) -> int:
    return int(round(amount * 100))


# ── Schemas ───────────────────────────────────────────────────────────────────

class CreateOrderRequest(BaseModel):
    booking_id: str
    amount: Optional[float] = None  # ignored; server derives the payable amount
    currency: str = "INR"
    description: Optional[str] = None


class VerifyPaymentRequest(BaseModel):
    booking_id: str
    razorpay_order_id: str
    razorpay_payment_id: str
    razorpay_signature: str


class RefundRequest(BaseModel):
    booking_id: str
    reason: Optional[str] = "Customer requested"


# ── Endpoints ─────────────────────────────────────────────────────────────────

@router.get("/config")
async def get_payment_config():
    """Return Razorpay publishable key for the frontend."""
    return {
        "key_id": RAZORPAY_KEY_ID or "rzp_test_demo",
        "currency": "INR",
        "is_live": bool(RAZORPAY_KEY_ID and not RAZORPAY_KEY_ID.startswith("rzp_test")),
        "is_configured": bool(RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET),
    }


@router.post("/create-order")
async def create_payment_order(
    req: CreateOrderRequest,
    current_user: dict = Depends(get_current_user)
):
    """Create a Razorpay order. Falls back to demo mode if keys not set."""
    # Validate booking exists AND belongs to the requesting user — otherwise
    # a user could create a payment order against someone else's booking.
    booking = _find_owned_booking(req.booking_id, current_user.get("sub"))
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")

    amount = _server_amount_for_booking(booking)
    amount_paise = _to_paise(amount)  # Razorpay works in paise
    currency = (req.currency or "INR").upper()
    booking_id = _canonical_booking_id(booking)

    # ── Demo Mode (no API keys) ───────────────────────────────────────────────
    if not RAZORPAY_KEY_ID or not RAZORPAY_KEY_SECRET:
        if not DEMO_PAYMENTS_ALLOWED:
            raise HTTPException(
                status_code=503,
                detail="Payment service not configured. Demo payments are disabled in production."
            )
        demo_order_id = f"order_demo_{uuid.uuid4().hex[:12]}"
        # Record pending payment
        payments_collection.insert_one({
            "id": str(uuid.uuid4()),
            "booking_id": booking_id,
            "user_id": current_user.get("sub"),
            "razorpay_order_id": demo_order_id,
            "amount": amount,
            "amount_paise": amount_paise,
            "currency": currency,
            "status": "created",
            "mode": "demo",
            "created_at": datetime.utcnow().isoformat()
        })
        return {
            "order_id": demo_order_id,
            "amount": amount_paise,
            "currency": currency,
            "key": "rzp_test_demo",
            "booking_id": booking_id,
            "is_demo": True,
            "description": req.description or f"Salon booking #{req.booking_id[:8].upper()}",
            "prefill": {
                "name": booking.get("customer_name", ""),
                "email": current_user.get("sub", ""),
            },
            "message": "Demo mode: Add RAZORPAY_KEY_ID to .env for real payments"
        }

    # ── Real Razorpay ─────────────────────────────────────────────────────────
    try:
        import razorpay
        client = razorpay.Client(auth=(RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET))
        order = client.order.create({
            "amount": amount_paise,
            "currency": currency,
            "receipt": booking_id[:40],
            "notes": {
                "booking_id": booking_id,
                "user": current_user.get("sub"),
                "description": req.description or "Salon booking"
            }
        })
        # Record in DB
        payments_collection.insert_one({
            "id": str(uuid.uuid4()),
            "booking_id": booking_id,
            "user_id": current_user.get("sub"),
            "razorpay_order_id": order["id"],
            "amount": amount,
            "amount_paise": amount_paise,
            "currency": currency,
            "status": "created",
            "mode": "live",
            "created_at": datetime.utcnow().isoformat()
        })
        return {
            "order_id": order["id"],
            "amount": order["amount"],
            "currency": order["currency"],
            "key": RAZORPAY_KEY_ID,
            "booking_id": booking_id,
            "is_demo": False,
            "description": req.description or "Salon Booking",
            "prefill": {
                "name": booking.get("customer_name", ""),
                "email": current_user.get("sub", ""),
            }
        }
    except ImportError:
        raise HTTPException(
            status_code=503,
            detail="Razorpay not installed. Run: pip install razorpay"
        )
    except Exception as e:
        _log.exception("Payment order creation error")
        raise HTTPException(status_code=500, detail="Payment service encountered an error. Please try again.")


@router.post("/verify")
async def verify_payment(
    req: VerifyPaymentRequest,
    current_user: dict = Depends(get_current_user)
):
    """Verify Razorpay payment signature and mark booking as paid."""

    # Ownership check up front: a booking must belong to the requesting user
    # before any payment/booking state can be changed below, in either the
    # demo or real-signature path.
    owned_booking = _find_owned_booking(req.booking_id, current_user.get("sub"))
    if not owned_booking:
        raise HTTPException(status_code=404, detail="Booking not found")
    booking_id = _canonical_booking_id(owned_booking)
    expected_amount = _server_amount_for_booking(owned_booking)
    expected_paise = _to_paise(expected_amount)
    user_id = current_user.get("sub")
    pending_payment = payments_collection.find_one({
        "booking_id": booking_id,
        "user_id": user_id,
        "razorpay_order_id": req.razorpay_order_id,
        "status": "created",
    })
    if not pending_payment:
        raise HTTPException(status_code=400, detail="No pending payment record found for this booking and order.")
    recorded_paise = int(pending_payment.get("amount_paise") or _to_paise(float(pending_payment.get("amount", 0))))
    if recorded_paise != expected_paise:
        raise HTTPException(status_code=400, detail="Payment amount no longer matches the booking total.")

    # ── Demo Mode ─────────────────────────────────────────────────────────────
    if req.razorpay_order_id.startswith("order_demo_"):
        if not DEMO_PAYMENTS_ALLOWED:
            raise HTTPException(
                status_code=503,
                detail="Demo payments are disabled in production."
            )
        slot_bookings_collection.update_one(
            {"id": booking_id, "user_id": user_id, "payment_status": {"$ne": "paid"}},
            {"$set": {
                "status": "confirmed",
                "payment_status": "paid",
                "payment_id": req.razorpay_payment_id or "demo_pay_" + uuid.uuid4().hex[:8],
                "razorpay_order_id": req.razorpay_order_id,
                "paid_at": datetime.utcnow().isoformat(),
            }}
        )
        payments_collection.update_one(
            {"_id": pending_payment["_id"], "status": "created"},
            {"$set": {
                "status": "paid",
                "razorpay_payment_id": req.razorpay_payment_id,
                "paid_at": datetime.utcnow().isoformat(),
            }}
        )
        return {
            "status": "success",
            "message": "Booking confirmed! (Demo payment recorded)",
            "booking_id": booking_id,
            "mode": "demo"
        }

    # ── Real Signature Verification ───────────────────────────────────────────
    if not RAZORPAY_KEY_SECRET:
        raise HTTPException(status_code=503, detail="Payment service not configured")

    expected_signature = hmac.new(
        RAZORPAY_KEY_SECRET.encode(),
        f"{req.razorpay_order_id}|{req.razorpay_payment_id}".encode(),
        hashlib.sha256
    ).hexdigest()

    if not hmac.compare_digest(expected_signature, req.razorpay_signature):
        raise HTTPException(status_code=400, detail="Payment verification failed - invalid signature")

    try:
        import razorpay
        client = razorpay.Client(auth=(RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET))
        payment = client.payment.fetch(req.razorpay_payment_id)
        if payment.get("order_id") != req.razorpay_order_id:
            raise HTTPException(status_code=400, detail="Payment does not belong to this order.")
        if int(payment.get("amount", 0)) != expected_paise:
            raise HTTPException(status_code=400, detail="Payment amount does not match the booking total.")
        if (payment.get("currency") or "").upper() != (pending_payment.get("currency") or "INR").upper():
            raise HTTPException(status_code=400, detail="Payment currency does not match the order.")
        if payment.get("status") not in ("authorized", "captured"):
            raise HTTPException(status_code=400, detail="Payment has not been authorized or captured.")
    except HTTPException:
        raise
    except Exception:
        _log.exception("Razorpay payment fetch failed during verification")
        raise HTTPException(status_code=503, detail="Payment provider verification failed. Please try again.")

    payment_update = payments_collection.update_one(
        {"_id": pending_payment["_id"], "status": "created"},
        {"$set": {
            "status": "paid",
            "razorpay_payment_id": req.razorpay_payment_id,
            "provider_status": payment.get("status"),
            "paid_at": datetime.utcnow().isoformat()
        }}
    )
    if payment_update.matched_count == 0:
        raise HTTPException(status_code=409, detail="Payment was already processed.")

    # Mark booking as paid and confirmed (scoped to this user's booking only)
    slot_bookings_collection.update_one(
        {"id": booking_id, "user_id": user_id},
        {"$set": {
            "status": "confirmed",
            "payment_status": "paid",
            "payment_id": req.razorpay_payment_id,
            "razorpay_order_id": req.razorpay_order_id,
            "razorpay_signature": req.razorpay_signature,
            "paid_at": datetime.utcnow().isoformat(),
        }}
    )
    return {
        "status": "success",
        "message": "Payment verified and booking confirmed!",
        "booking_id": booking_id,
        "payment_id": req.razorpay_payment_id,
    }


@router.post("/refund")
async def request_refund(
    req: RefundRequest,
    current_user: dict = Depends(get_current_user)
):
    """Initiate a refund for a paid booking."""
    booking = slot_bookings_collection.find_one({
        "$or": [{"id": req.booking_id}, {"booking_ref": req.booking_id}],
        "user_id": current_user.get("sub"),
        "payment_status": "paid"
    })
    if not booking:
        raise HTTPException(status_code=404, detail="Paid booking not found")

    payment_id = booking.get("payment_id", "")
    if payment_id.startswith("demo_") or payment_id == "mock_payment":
        # Demo refund
        slot_bookings_collection.update_one(
            {"$or": [{"id": req.booking_id}, {"booking_ref": req.booking_id}], "user_id": current_user.get("sub")},
            {"$set": {"payment_status": "refunded", "status": "cancelled"}}
        )
        return {"status": "success", "message": "Refund processed (Demo mode)", "booking_id": req.booking_id}

    if not RAZORPAY_KEY_SECRET:
        raise HTTPException(status_code=503, detail="Payment service not configured for refunds")

    try:
        import razorpay
        client = razorpay.Client(auth=(RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET))
        refund = client.payment.refund(payment_id, {
            "notes": {"reason": req.reason, "booking_id": req.booking_id}
        })
        slot_bookings_collection.update_one(
            {"$or": [{"id": req.booking_id}, {"booking_ref": req.booking_id}], "user_id": current_user.get("sub")},
            {"$set": {
                "payment_status": "refunded",
                "status": "cancelled",
                "refund_id": refund.get("id"),
                "refunded_at": datetime.utcnow().isoformat()
            }}
        )
        return {
            "status": "success",
            "message": "Refund initiated successfully",
            "refund_id": refund.get("id"),
            "booking_id": req.booking_id
        }
    except Exception as e:
        _log.exception("Refund processing error")
        raise HTTPException(status_code=500, detail="Refund service encountered an error. Please try again.")


@router.get("/my-history")
async def my_payment_history(current_user: dict = Depends(get_current_user)):
    """Get user's payment history."""
    bookings = list(slot_bookings_collection.find(
        {"user_id": current_user.get("sub"), "payment_status": {"$in": ["paid", "refunded"]}}
    ).sort("paid_at", -1).limit(20))
    for b in bookings:
        b.pop("_id", None)
    return {"payments": bookings, "total": len(bookings)}
