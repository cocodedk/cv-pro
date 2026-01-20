"""Admin routes for user management and stats."""
import logging
from fastapi import APIRouter, Depends, HTTPException, Query, Request
from pydantic import BaseModel
from slowapi import Limiter
from backend.app_helpers.auth import get_current_admin
from backend.database.supabase.client import get_admin_client

logger = logging.getLogger(__name__)


class UpdateUserRoleRequest(BaseModel):
    """Payload for updating a user's role."""

    role: str


def create_admin_router(limiter: Limiter) -> APIRouter:
    """Create admin router with user management endpoints."""
    router = APIRouter(dependencies=[Depends(get_current_admin)])

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
