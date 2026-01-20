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


async def get_current_user(
    authorization: str | None = Header(None),
) -> AuthUser:
    """Validate bearer token and return current user."""
    if not authorization or not authorization.startswith("Bearer "):
        # Only allow dev fallback in non-production environments
        allow_dev_fallback = os.getenv("ALLOW_DEV_AUTH_FALLBACK", "").lower() == "true"
        env = os.getenv("ENV", "").lower()
        node_env = os.getenv("NODE_ENV", "").lower()
        is_dev_env = env in ("development", "test") or node_env in ("development", "test")

        if not (allow_dev_fallback or is_dev_env):
            raise HTTPException(status_code=401, detail="Missing token")

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
        return

    token_value = authorization.replace("Bearer ", "", 1).strip()
    if not token_value:
        raise HTTPException(status_code=401, detail="Missing token")

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
