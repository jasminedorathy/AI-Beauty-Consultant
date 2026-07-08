import os


PRODUCTION_NAMES = {"production", "prod"}


def environment_name() -> str:
    return (os.getenv("ENVIRONMENT") or os.getenv("APP_ENV") or "development").strip().lower()


def is_production() -> bool:
    return environment_name() in PRODUCTION_NAMES


def require_production_settings() -> None:
    """Fail fast when a production deploy is missing security-critical config."""
    if not is_production():
        return

    required = {
        "JWT_SECRET": "signing access and refresh tokens",
        "MONGO_URI": "connecting to the production MongoDB cluster",
        "MONGODB_DB_NAME": "selecting the production database",
        "FRONTEND_URL": "locking credentialed CORS to the frontend",
        "RAZORPAY_KEY_ID": "creating live payment orders",
        "RAZORPAY_KEY_SECRET": "verifying live payment signatures",
        "SMTP_SERVER": "sending OTP email",
        "SMTP_EMAIL": "authenticating SMTP delivery",
        "SMTP_PASSWORD": "authenticating SMTP delivery",
        "REDIS_URL": "shared production rate limiting",
    }
    missing = [name for name in required if not os.getenv(name)]
    if missing:
        details = ", ".join(f"{name} ({required[name]})" for name in missing)
        raise RuntimeError(f"Missing required production environment variables: {details}")

    if len(os.getenv("JWT_SECRET", "")) < 32:
        raise RuntimeError("JWT_SECRET must be at least 32 characters in production.")
