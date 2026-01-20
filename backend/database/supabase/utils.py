"""Shared helpers for Supabase queries."""
import os
from contextvars import ContextVar, Token

_USER_ID_CONTEXT: ContextVar[str | None] = ContextVar(
    "supabase_user_id", default=None
)


def set_user_id_context(user_id: str | None) -> Token:
    """Set the request-scoped user id context."""
    return _USER_ID_CONTEXT.set(user_id)


def reset_user_id_context(token: Token) -> None:
    """Reset the request-scoped user id context."""
    _USER_ID_CONTEXT.reset(token)


def get_user_id(explicit: str | None = None) -> str | None:
    """Return an explicit user id or a request-scoped default."""
    return explicit or _USER_ID_CONTEXT.get() or os.getenv("SUPABASE_DEFAULT_USER_ID")


def require_user_id(explicit: str | None = None) -> str:
    """Require a user id when using Supabase."""
    user_id = get_user_id(explicit)
    if not user_id:
        raise RuntimeError(
            "SUPABASE_DEFAULT_USER_ID must be set or provide a user id"
        )
    return user_id


def apply_user_scope(query, user_id: str | None):
    """Optionally scope a Supabase query to a user."""
    if user_id:
        return query.eq("user_id", user_id)
    return query
