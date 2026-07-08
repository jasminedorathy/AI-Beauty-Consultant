"""
image_storage.py — Private biometric image storage abstraction.

Two backends, selected by environment variables:

  Cloudinary (preferred for production)
    Set: CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET
    Images are uploaded as type="private" (not publicly accessible).
    Access is via short-lived signed URLs generated on demand.
    Lifecycle: call delete_image() when a user's history record is removed.

  Base64-in-MongoDB (fallback / dev/test only)
    No extra env vars needed. Images are stored inline in the analysis doc.
    WARNING: MongoDB's 16 MB BSON limit can be hit for large inputs.
    Not recommended for production; a startup warning is logged.

Storage key format:
  Cloudinary   — "cloudinary:<public_id>"
  Base64       — "b64:<base64_jpeg_bytes>"   (no data-URI prefix)
"""

import base64
import logging
import os
import time

_log = logging.getLogger("beauty_api.image_storage")

_ENVIRONMENT = (os.getenv("ENVIRONMENT") or os.getenv("APP_ENV") or "development").strip().lower()
_IS_PRODUCTION = _ENVIRONMENT in ("production", "prod")

_CLOUDINARY_CONFIGURED = bool(
    os.getenv("CLOUDINARY_CLOUD_NAME")
    and os.getenv("CLOUDINARY_API_KEY")
    and os.getenv("CLOUDINARY_API_SECRET")
)

if _IS_PRODUCTION and not _CLOUDINARY_CONFIGURED:
    _log.warning(
        "Biometric images will be stored as Base64 inside MongoDB documents. "
        "This risks hitting MongoDB's 16 MB document limit for large scans and "
        "makes history queries expensive. "
        "Set CLOUDINARY_CLOUD_NAME / CLOUDINARY_API_KEY / CLOUDINARY_API_SECRET "
        "to enable private Cloudinary object storage."
    )


# ── Public API ────────────────────────────────────────────────────────────────

def store_image(image_bytes: bytes, owner_email: str, suffix: str = "") -> str:
    """
    Persist *image_bytes* and return a storage key.

    Parameters
    ----------
    image_bytes : JPEG-encoded image bytes (use cv2.imencode before calling).
    owner_email : user identifier used to scope Cloudinary folder / tags.
    suffix      : short label distinguishing raw vs annotated images.

    Returns
    -------
    A storage key string:
      "cloudinary:<public_id>"  — when Cloudinary is configured.
      "b64:<base64>"            — otherwise (base64 of the JPEG bytes).
    """
    if _CLOUDINARY_CONFIGURED:
        return _store_cloudinary(image_bytes, owner_email, suffix)
    return "b64:" + base64.b64encode(image_bytes).decode("ascii")


def get_image_url(storage_key: str, ttl_seconds: int = 600) -> str:
    """
    Resolve a storage key to a short-lived viewable URL (or data URI for base64
    fallback).  Default TTL is 10 minutes — long enough to match job expiry.
    """
    if not storage_key:
        return ""
    if storage_key.startswith("cloudinary:"):
        return _cloudinary_signed_url(storage_key[len("cloudinary:"):], ttl_seconds)
    if storage_key.startswith("b64:"):
        return "data:image/jpeg;base64," + storage_key[4:]
    # Legacy — old records stored the full data URI directly.
    if storage_key.startswith("data:image"):
        return storage_key
    return storage_key


def delete_image(storage_key: str) -> None:
    """Delete an image from its backend store. No-op for base64 keys."""
    if storage_key and storage_key.startswith("cloudinary:"):
        _delete_cloudinary(storage_key[len("cloudinary:"):])


# ── Cloudinary helpers ────────────────────────────────────────────────────────

def _cloudinary_config():
    import cloudinary  # type: ignore
    cloudinary.config(
        cloud_name=os.getenv("CLOUDINARY_CLOUD_NAME"),
        api_key=os.getenv("CLOUDINARY_API_KEY"),
        api_secret=os.getenv("CLOUDINARY_API_SECRET"),
        secure=True,
    )
    return cloudinary


def _store_cloudinary(image_bytes: bytes, owner_email: str, suffix: str) -> str:
    cld = _cloudinary_config()
    import cloudinary.uploader  # type: ignore

    folder = "beauty-biometric/" + owner_email.replace("@", "_at_").replace(".", "_")
    unique = os.urandom(8).hex()
    public_id = f"{folder}/{suffix}_{unique}" if suffix else f"{folder}/{unique}"

    result = cld.uploader.upload(
        image_bytes,
        public_id=public_id,
        type="private",
        resource_type="image",
        overwrite=False,
        tags=[owner_email, "biometric"],
        # Server-side encryption at rest is enabled by default on Cloudinary.
    )
    return "cloudinary:" + result["public_id"]


def _cloudinary_signed_url(public_id: str, ttl_seconds: int) -> str:
    cld = _cloudinary_config()
    import cloudinary.utils  # type: ignore

    expiry = int(time.time()) + ttl_seconds
    url, _ = cld.utils.cloudinary_url(
        public_id,
        type="private",
        sign_url=True,
        expires_at=expiry,
        resource_type="image",
        format="jpg",
    )
    return url


def _delete_cloudinary(public_id: str) -> None:
    try:
        cld = _cloudinary_config()
        import cloudinary.uploader  # type: ignore
        cld.uploader.destroy(public_id, type="private", resource_type="image")
        _log.info("Deleted Cloudinary asset: %s", public_id)
    except Exception:
        _log.warning("Failed to delete Cloudinary asset: %s", public_id, exc_info=True)
