"""Admin routes for user management and stats."""
import logging
import os
from fastapi import APIRouter, Depends, HTTPException, Query, Request
from pydantic import BaseModel
from slowapi import Limiter
from backend.app_helpers.auth import get_admin_script_auth
from backend.database.supabase.client import get_admin_client

logger = logging.getLogger(__name__)


class UpdateUserRoleRequest(BaseModel):
    """Payload for updating a user's role."""

    role: str


class ResetPasswordRequest(BaseModel):
    """Payload for resetting a user's password."""

    new_password: str


def _search_user_by_email_or_id(query: str):
    """Search for a user by email or user ID using admin client."""
    from supabase import create_client

    # Use direct Supabase client with service role for auth access
    supabase_url = os.getenv("SUPABASE_URL")
    service_role_key = os.getenv("SUPABASE_SERVICE_ROLE_KEY")

    if not supabase_url or not service_role_key:
        raise HTTPException(status_code=500, detail="Supabase configuration missing")

    # Create admin client that can access auth schema
    admin_supabase = create_client(supabase_url, service_role_key)

    # First try to find by email
    try:
        response = admin_supabase.table("auth.users").select("id, email, created_at").eq("email", query).execute()
        if response.data:
            user = response.data[0]
            # Also get profile info
            profile_response = admin_supabase.table("user_profiles").select("role, is_active").eq("id", user["id"]).execute()
            profile = profile_response.data[0] if profile_response.data else None
            return {
                "user": {
                    **user,
                    "role": profile.get("role") if profile else "user",
                    "is_active": profile.get("is_active") if profile else True
                }
            }
    except Exception:
        pass  # Continue to user ID search

    # If not found by email, try by user ID
    try:
        response = admin_supabase.table("auth.users").select("id, email, created_at").eq("id", query).execute()
        if response.data:
            user = response.data[0]
            # Also get profile info
            profile_response = admin_supabase.table("user_profiles").select("role, is_active").eq("id", user["id"]).execute()
            profile = profile_response.data[0] if profile_response.data else None
            return {
                "user": {
                    **user,
                    "role": profile.get("role") if profile else "user",
                    "is_active": profile.get("is_active") if profile else True
                }
            }
    except Exception:
        pass

    raise HTTPException(status_code=404, detail="User not found")


def _reset_user_password(user_id: str, new_password: str):
    """Reset a user's password using Supabase admin API."""
    if len(new_password) < 6:
        raise HTTPException(
            status_code=422, detail="Password must be at least 6 characters long"
        )

    from supabase import create_client

    # Use direct Supabase client with service role for auth operations
    supabase_url = os.getenv("SUPABASE_URL")
    service_role_key = os.getenv("SUPABASE_SERVICE_ROLE_KEY")

    if not supabase_url or not service_role_key:
        raise HTTPException(status_code=500, detail="Supabase configuration missing")

    admin_supabase = create_client(supabase_url, service_role_key)

    try:
        # Use Supabase admin API to update user password
        response = admin_supabase.auth.admin.update_user_by_id(
            user_id, password=new_password
        )

        if not response.user:
            raise HTTPException(status_code=404, detail="User not found")

        logger.info("Admin reset password for user %s", user_id)
        return {"status": "success", "message": "Password reset successfully"}

    except Exception as e:
        logger.error("Failed to reset password for user %s: %s", user_id, str(e))
        raise HTTPException(
            status_code=500, detail="Failed to reset password"
        )


def create_admin_router(limiter: Limiter) -> APIRouter:  # noqa: C901
    """Create admin router with user management endpoints."""
    router = APIRouter()

    @router.get("/api/admin/users")
    @limiter.limit("30/minute")
    async def list_users(
        request: Request,
        limit: int = Query(50, ge=1, le=200),
        offset: int = Query(0, ge=0),
    ):
        client = get_admin_client()
        response = (
            client.table("admin_users")
            .select("*", count="exact")
            .order("created_at", desc=True)
            .range(offset, offset + limit - 1)
            .execute()
        )
        rows = response.data or []
        total = response.count if response.count is not None else len(rows)
        return {"users": rows, "total": total}

    @router.get("/api/admin/users/search")
    @limiter.limit("30/minute")
    async def search_users(
        request: Request,
        q: str = Query(..., min_length=1, description="Email or user ID to search for"),
        _auth: None = Depends(get_admin_script_auth),  # Script authentication
    ):
        """Search for users by email or user ID."""
        return _search_user_by_email_or_id(q)

    @router.put("/api/admin/users/{user_id}/role")
    @limiter.limit("30/minute")
    async def update_user_role(
        request: Request, user_id: str, payload: UpdateUserRoleRequest
    ):
        role = payload.role.lower()
        if role not in {"user", "admin"}:
            raise HTTPException(status_code=422, detail="Invalid role")
        client = get_admin_client()
        response = (
            client.table("user_profiles")
            .update({"role": role})
            .eq("id", user_id)
            .execute()
        )
        if not response.data:
            raise HTTPException(status_code=404, detail="User not found")
        logger.info("Admin updated role for user %s", user_id)
        return {"status": "success"}

    @router.put("/api/admin/users/{user_id}/deactivate")
    @limiter.limit("30/minute")
    async def deactivate_user(request: Request, user_id: str):
        client = get_admin_client()
        response = (
            client.table("user_profiles")
            .update({"is_active": False})
            .eq("id", user_id)
            .execute()
        )
        if not response.data:
            raise HTTPException(status_code=404, detail="User not found")
        logger.info("Admin deactivated user %s", user_id)
        return {"status": "success"}

    @router.put("/api/admin/users/{user_id}/reset-password")
    @limiter.limit("10/minute")
    async def reset_user_password(
        request: Request,
        user_id: str,
        payload: ResetPasswordRequest,
        _auth: None = Depends(get_admin_script_auth),  # Script authentication
    ):
        """Reset a user's password (admin only)."""
        return _reset_user_password(user_id, payload.new_password)

    @router.get("/api/admin/stats/daily")
    @limiter.limit("30/minute")
    async def get_daily_stats(request: Request, limit: int = Query(30, ge=1, le=90)):
        client = get_admin_client()
        response = (
            client.table("daily_stats")
            .select("*")
            .order("date", desc=True)
            .limit(limit)
            .execute()
        )
        return {"stats": response.data or []}

    @router.get("/api/admin/stats/themes")
    @limiter.limit("30/minute")
    async def get_theme_stats(request: Request):
        client = get_admin_client()
        response = (
            client.table("theme_popularity")
            .select("*")
            .order("usage_count", desc=True)
            .execute()
        )
        return {"themes": response.data or []}

    return router
