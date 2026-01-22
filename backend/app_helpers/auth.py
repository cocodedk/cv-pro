"""Auth helpers for Supabase-backed requests."""
from dataclasses import dataclass
import logging
import os
from fastapi import Depends, Header, HTTPException
from backend.database.supabase.client import get_admin_client, get_client
from backend.database.supabase.utils import set_user_id_context, reset_user_id_context

logger = logging.getLogger(__name__)


@dataclass(frozen=True)
class AuthUser:
    """Minimal auth user representation."""

    id: str
    email: str | None = None


def _should_allow_dev_fallback() -> bool:
    """Check if development auth fallback should be allowed."""
    allow_dev_fallback = os.getenv("ALLOW_DEV_AUTH_FALLBACK", "").lower() == "true"
    env = os.getenv("ENV", "").lower()
    node_env = os.getenv("NODE_ENV", "").lower()
    is_dev_env = env in ("development", "test") or node_env in ("development", "test")
    return allow_dev_fallback and is_dev_env


async def _handle_dev_fallback():
    """Handle development authentication fallback."""
    user_id = os.getenv("SUPABASE_DEFAULT_USER_ID")
    if not user_id:
        raise HTTPException(status_code=401, detail="Missing token")

    logger.warning(
        "Using development auth fallback for user_id=%s. This should not happen in production.",
        user_id
    )

    token = set_user_id_context(user_id)
    try:
        yield AuthUser(id=user_id)
    finally:
        reset_user_id_context(token)


async def _validate_token_and_get_user(token_value: str):
    """Validate token and extract user information."""
    client = get_client()
    try:
        response = client.auth.get_user(token_value)
    except Exception as exc:
        raise HTTPException(status_code=401, detail="Invalid token") from exc

    user = response.user if response else None
    user_id = getattr(user, "id", None)
    if not user_id:
        raise HTTPException(status_code=401, detail="Invalid token")

    token = set_user_id_context(user_id)
    try:
        yield AuthUser(id=user_id, email=getattr(user, "email", None))
    finally:
        reset_user_id_context(token)


async def get_current_user(
    authorization: str | None = Header(None),
) -> AuthUser:
    """Validate bearer token and return current user."""
    if not authorization or not authorization.startswith("Bearer "):
        if not _should_allow_dev_fallback():
            allow_dev_fallback = os.getenv("ALLOW_DEV_AUTH_FALLBACK", "").lower() == "true"
            if allow_dev_fallback:
                logger.error(
                    "Development auth fallback enabled outside dev/test; refusing request."
                )
            raise HTTPException(status_code=401, detail="Missing token")

        async for user in _handle_dev_fallback():
            yield user
        return

    token_value = authorization.replace("Bearer ", "", 1).strip()
    if not token_value:
        raise HTTPException(status_code=401, detail="Missing token")

    async for user in _validate_token_and_get_user(token_value):
        yield user


async def get_current_admin(
    current_user: AuthUser = Depends(get_current_user),
) -> AuthUser:
    """Ensure the current user has admin privileges."""
    admin_client = get_admin_client()
    response = (
        admin_client.table("user_profiles")
        .select("role, is_active")
        .eq("id", current_user.id)
        .single()
        .execute()
    )
    data = response.data or {}
    role = data.get("role")
    is_active = data.get("is_active")
    if role != "admin" or not is_active:
        raise HTTPException(status_code=403, detail="Admin access required")
    return current_user
