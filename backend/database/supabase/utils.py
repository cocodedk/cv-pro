"""Shared helpers for Supabase queries."""
import os


def get_user_id(explicit: str | None = None) -> str | None:
    """Return an explicit user id or a default from env, if set."""
    return explicit or os.getenv("SUPABASE_DEFAULT_USER_ID")


def require_user_id(explicit: str | None = None) -> str:
    """Require a user id when auth is not wired."""
    user_id = get_user_id(explicit)
    if not user_id:
        raise RuntimeError(
            "SUPABASE_DEFAULT_USER_ID must be set until auth is wired"
        )
    return user_id


def apply_user_scope(query, user_id: str | None):
    """Optionally scope a Supabase query to a user."""
    if user_id:
        return query.eq("user_id", user_id)
    return query
