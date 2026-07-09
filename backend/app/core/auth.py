import os
import time
import logging
import threading

import requests
from jose import jwt
from fastapi import Header, HTTPException
from dotenv import load_dotenv

load_dotenv()

logger = logging.getLogger(__name__)

JWKS_URL = os.getenv("CLERK_JWKS_URL")

# ── JWKS Cache ──────────────────────────────────────────────────────
# Keys are cached in memory with a 1-hour TTL.
# A threading.Lock with double-checked locking prevents cache stampede:
# only one thread refreshes while others wait briefly and reuse the result.

_jwks_cache = None
_jwks_cache_time = 0.0
_jwks_lock = threading.Lock()

JWKS_CACHE_TTL = 3600  # 1 hour in seconds
JWKS_REQUEST_TIMEOUT = 5  # seconds


def _is_cache_valid() -> bool:
    """Check if the cached JWKS keys are still within their TTL."""
    return _jwks_cache is not None and (time.monotonic() - _jwks_cache_time) < JWKS_CACHE_TTL


def get_jwks() -> dict:
    """
    Fetch Clerk JWKS keys with in-memory caching and stampede protection.

    - Returns cached keys if within TTL (fast path, no lock).
    - On expiry, acquires a lock so only one thread refreshes.
    - Falls back to stale cache if Clerk is temporarily unreachable.
    - Returns HTTP 503 if no cached keys exist and Clerk is unavailable.
    """
    global _jwks_cache, _jwks_cache_time

    # Fast path: return cached keys without acquiring the lock
    if _is_cache_valid():
        return _jwks_cache

    # Slow path: acquire lock to refresh
    with _jwks_lock:
        # Double-check: another thread may have refreshed while we waited
        if _is_cache_valid():
            return _jwks_cache

        try:
            response = requests.get(JWKS_URL, timeout=JWKS_REQUEST_TIMEOUT)
            response.raise_for_status()
            _jwks_cache = response.json()
            _jwks_cache_time = time.monotonic()
            logger.info("JWKS cache refreshed successfully")
        except Exception:
            logger.exception("Failed to refresh JWKS")
            # Graceful degradation: serve stale keys if available
            if _jwks_cache is not None:
                logger.info("Falling back to stale JWKS cache")
                return _jwks_cache
            raise HTTPException(
                status_code=503,
                detail="Authentication service unavailable",
            )

    return _jwks_cache


async def verify_clerk_token(authorization: str = Header(None)) -> dict:
    """
    FastAPI dependency that extracts and verifies a Clerk JWT from
    the Authorization header. Returns the decoded payload on success.
    """
    if not authorization:
        raise HTTPException(status_code=401, detail="Authorization header missing")

    try:
        token = authorization.split(" ")[1]
    except IndexError:
        raise HTTPException(status_code=401, detail="Invalid Authorization header")

    jwks = get_jwks()

    try:
        payload = jwt.decode(
            token,
            jwks,
            algorithms=["RS256"],
            options={"verify_aud": False},
        )
        return payload
    except Exception:
        logger.exception("JWT verification failed")
        raise HTTPException(status_code=401, detail="Invalid token")