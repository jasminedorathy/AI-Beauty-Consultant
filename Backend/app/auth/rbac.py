"""
Role-Based Access Control (RBAC) System
Manages permissions for Normal vs Premium users
"""
from fastapi import HTTPException, status, Depends
from app.mongodb.user_collection import user_collection
from app.api.routes import get_current_user
from datetime import datetime
from typing import List, Optional


# Feature definitions
PREMIUM_FEATURES = {
    "unlimited_analysis": "Unlimited face analysis per month",
    "advanced_tips": "AI-powered personalized tips",
    "history_unlimited": "Unlimited history storage",
    "export_pdf": "Export analysis as PDF",
    "priority_support": "Priority customer support",
    "beta_features": "Access to beta features",
    "custom_reports": "Custom beauty reports",
    "progress_tracking": "Advanced progress tracking",
    "product_recommendations": "Premium product recommendations",
    "consultation_booking": "Book professional consultations"
}

NORMAL_FEATURES = {
    "basic_analysis": "Basic face analysis (10/month)",
    "basic_tips": "Standard beauty tips",
    "history_limited": "30-day history storage",
    "basic_support": "Standard support"
}

# Usage limits
NORMAL_USER_LIMITS = {
    "analysis_per_month": 10,
    "history_days": 30,
    "tips_count": 3
}

PREMIUM_USER_LIMITS = {
    "analysis_per_month": -1,  # Unlimited
    "history_days": -1,  # Unlimited
    "tips_count": 7
}


def get_user_role(user_email: str) -> dict:
    """
    Get user role and subscription info from database
    """
    user = user_collection.find_one({"email": user_email})
    
    if not user:
        # Default to normal user
        return {
            "role": "normal",
            "subscription_start": None,
            "subscription_end": None,
            "features": list(NORMAL_FEATURES.keys()),
            "limits": NORMAL_USER_LIMITS
        }
    
    role = user.get("role", "normal")
    subscription_end = user.get("subscription_end")
    
    # Check if premium subscription is still valid
    if role == "premium" and subscription_end:
        if isinstance(subscription_end, datetime) and subscription_end < datetime.utcnow():
            # Subscription expired, downgrade to normal
            role = "normal"
            user_collection.update_one(
                {"email": user_email},
                {"$set": {"role": "normal"}}
            )
    
    # Return role info
    if role == "premium":
        return {
            "role": "premium",
            "subscription_start": user.get("subscription_start"),
            "subscription_end": subscription_end,
            "features": list(PREMIUM_FEATURES.keys()),
            "limits": PREMIUM_USER_LIMITS
        }
    else:
        return {
            "role": "normal",
            "subscription_start": None,
            "subscription_end": None,
            "features": list(NORMAL_FEATURES.keys()),
            "limits": NORMAL_USER_LIMITS
        }


def check_feature_access(user_email: str, feature: str) -> bool:
    """
    Check if user has access to a specific feature
    """
    user_role_info = get_user_role(user_email)
    return feature in user_role_info["features"]


def require_premium(current_user: dict = Depends(get_current_user)):
    """
    Dependency to require premium access
    Usage: @router.get("/premium-endpoint", dependencies=[Depends(require_premium)])
    """
    user_email = current_user.get("sub")
    user_role_info = get_user_role(user_email)
    
    if user_role_info["role"] != "premium":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail={
                "error": "Premium subscription required",
                "message": "This feature is only available for premium users. Upgrade to unlock!",
                "upgrade_url": "/upgrade"
            }
        )
    
    return current_user


def check_usage_limit(user_email: str, limit_type: str) -> dict:
    """
    Check if user has reached their usage limit
    Returns: {"allowed": bool, "current": int, "limit": int, "message": str}
    """
    user_role_info = get_user_role(user_email)
    limits = user_role_info["limits"]
    
    # Get current usage from database
    user = user_collection.find_one({"email": user_email})
    
    if limit_type == "analysis_per_month":
        current_count = user.get("analysis_count_this_month", 0) if user else 0
        limit = limits["analysis_per_month"]
        
        if limit == -1:  # Unlimited
            return {
                "allowed": True,
                "current": current_count,
                "limit": -1,
                "message": "Unlimited (Premium)"
            }
        
        if current_count >= limit:
            return {
                "allowed": False,
                "current": current_count,
                "limit": limit,
                "message": f"Monthly limit reached ({current_count}/{limit}). Upgrade to Premium for unlimited analysis!"
            }
        
        return {
            "allowed": True,
            "current": current_count,
            "limit": limit,
            "message": f"{current_count}/{limit} analyses used this month"
        }
    
    return {"allowed": True, "current": 0, "limit": -1, "message": "OK"}


def increment_usage(user_email: str, usage_type: str):
    """
    Increment usage counter for a user
    """
    if usage_type == "analysis":
        user_collection.update_one(
            {"email": user_email},
            {
                "$inc": {"analysis_count_this_month": 1, "analysis_count_total": 1},
                "$set": {"last_analysis": datetime.utcnow()}
            },
            upsert=True
        )


def upgrade_to_premium(user_email: str, duration_days: int = 30) -> dict:
    """
    Upgrade user to premium
    """
    from datetime import timedelta
    
    start_date = datetime.utcnow()
    end_date = start_date + timedelta(days=duration_days)
    
    user_collection.update_one(
        {"email": user_email},
        {
            "$set": {
                "role": "premium",
                "subscription_start": start_date,
                "subscription_end": end_date,
                "premium_features": list(PREMIUM_FEATURES.keys())
            }
        },
        upsert=True
    )
    
    return {
        "success": True,
        "role": "premium",
        "subscription_start": start_date,
        "subscription_end": end_date,
        "message": f"Successfully upgraded to Premium for {duration_days} days!"
    }


def get_user_stats(user_email: str) -> dict:
    """
    Get user statistics and role info
    """
    user = user_collection.find_one({"email": user_email})
    role_info = get_user_role(user_email)
    
    if not user:
        return {
            "role": "normal",
            "analysis_count_total": 0,
            "analysis_count_this_month": 0,
            "features": role_info["features"],
            "limits": role_info["limits"]
        }
    
    return {
        "role": role_info["role"],
        "subscription_end": role_info.get("subscription_end"),
        "analysis_count_total": user.get("analysis_count_total", 0),
        "analysis_count_this_month": user.get("analysis_count_this_month", 0),
        "last_analysis": user.get("last_analysis"),
        "created_at": user.get("created_at"),
        "features": role_info["features"],
        "limits": role_info["limits"],
        "premium_features": PREMIUM_FEATURES if role_info["role"] == "premium" else {},
        "available_upgrades": PREMIUM_FEATURES if role_info["role"] == "normal" else {}
    }


def downgrade_from_premium(user_email: str) -> dict:
    """
    Downgrade user back to normal role
    """
    user_collection.update_one(
        {"email": user_email},
        {
            "$set": {
                "role": "normal",
                "subscription_end": datetime.utcnow() # Mark as expired now
            },
            "$unset": {
                "premium_features": ""
            }
        }
    )
    
    return {
        "success": True,
        "role": "normal",
        "message": "Subscription cancelled. You are now a normal user."
    }
