"""Health check routes."""
from fastapi import APIRouter, Depends
from backend.database.supabase.client import get_admin_client
from backend.services.cv_file_service import CVFileService
from backend.app_helpers.auth import get_current_admin


def create_health_router(cv_file_service: CVFileService) -> APIRouter:
    """Create health router with dependencies."""
    router = APIRouter()

    @router.get("/api/health")
    async def health_check():
        """Health check endpoint."""
        provider = "supabase"
        try:
            client = get_admin_client()
            client.table("user_profiles").select("id").limit(1).execute()
            db_connected = True
        except Exception:
            db_connected = False
        return {
            "status": "healthy" if db_connected else "unhealthy",
            "database": "connected" if db_connected else "disconnected",
            "provider": provider,
        }

    @router.post("/api/admin/cleanup-download-files")
    async def cleanup_download_files(
        max_age_hours: int = 24,
        _current_user=Depends(get_current_admin),
    ):
        """Clean up old download files (admin endpoint)."""
        try:
            cleaned_count = cv_file_service.cleanup_old_download_files(max_age_hours)
            return {
                "status": "success",
                "files_cleaned": cleaned_count,
                "max_age_hours": max_age_hours,
            }
        except Exception as e:
            return {
                "status": "error",
                "error": str(e),
            }

    return router
