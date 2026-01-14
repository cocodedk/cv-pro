"""Supabase client helpers."""
import os
from supabase import Client, create_client

_client: Client | None = None
_admin_client: Client | None = None


def _get_env(name: str) -> str:
    value = os.getenv(name)
    if not value:
        raise RuntimeError(f"Missing {name}")
    return value


def get_client() -> Client:
    """Return a cached anon Supabase client."""
    global _client
    if _client is None:
        _client = create_client(_get_env("SUPABASE_URL"), _get_env("SUPABASE_ANON_KEY"))
    return _client


def get_admin_client() -> Client:
    """Return a cached service role Supabase client."""
    global _admin_client
    if _admin_client is None:
        _admin_client = create_client(
            _get_env("SUPABASE_URL"), _get_env("SUPABASE_SERVICE_ROLE_KEY")
        )
    return _admin_client
