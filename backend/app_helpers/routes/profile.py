"""Profile-related routes."""
import logging
from fastapi import APIRouter, Depends, HTTPException, Request
from slowapi import Limiter
from backend.models import (
    ProfileData,
    ProfileResponse,
    ProfileListResponse,
    ProfileListItem,
    TranslateProfileRequest,
    TranslateProfileResponse,
)
from backend.database import queries
from backend.services.profile_translation import get_translation_service
from backend.app_helpers.auth import get_current_user

logger = logging.getLogger(__name__)

_DELETE_CONFIRM_HEADER = "x-confirm-delete-profile"


def _is_delete_confirmed(request: Request) -> bool:
    value = (request.headers.get(_DELETE_CONFIRM_HEADER) or "").strip().lower()
    return value in {"true", "1", "yes"}


def _log_profile_delete_request(
    request: Request, updated_at: str | None = None
) -> None:
    client_host = request.client.host if request.client else None
    logger.warning(
        "Profile delete requested path=%s updated_at=%s ip=%s origin=%r referer=%r ua=%r",
        request.url.path,
        updated_at,
        client_host,
        request.headers.get("origin"),
        request.headers.get("referer"),
        request.headers.get("user-agent"),
    )


def create_profile_router(limiter: Limiter, cv_file_service=None) -> APIRouter:  # noqa: C901
    """Create and return profile router with dependencies."""
    router = APIRouter(dependencies=[Depends(get_current_user)])

    @router.post("/api/profile", response_model=ProfileResponse)
    @limiter.limit("30/minute")
    async def save_profile_endpoint(request: Request, profile_data: ProfileData):
        """Save or update master profile."""
        try:
            profile_dict = profile_data.model_dump()
            success = queries.save_profile(profile_dict)
            if not success:
                raise HTTPException(status_code=500, detail="Failed to save profile")

            # Generate featured templates after profile save
            if cv_file_service:
                try:
                    cv_file_service.generate_featured_templates()
                    logger.info("Generated featured templates after profile save")
                except Exception as e:
                    logger.warning("Failed to generate featured templates after profile save", exc_info=e)

            return ProfileResponse(
                status="success", message="Profile saved successfully"
            )
        except HTTPException:
            raise
        except Exception as e:
            logger.error("Failed to save profile", exc_info=e)
            raise HTTPException(status_code=500, detail="Failed to save profile")

    @router.get("/api/profile")
    async def get_profile_endpoint(language: str = "en"):
        """Get profile for specified language (defaults to English)."""
        try:
            profile = queries.get_profile(language)
            if not profile:
                raise HTTPException(status_code=404, detail="Profile not found")
            return profile
        except HTTPException:
            raise
        except Exception as e:
            logger.error("Failed to get profile", exc_info=e)
            raise HTTPException(status_code=500, detail="Failed to get profile")

    @router.get("/api/profiles", response_model=ProfileListResponse)
    async def list_profiles_endpoint():
        """List all profiles with basic info."""
        try:
            profiles = queries.list_profiles()
            profile_items = [
                ProfileListItem(name=p["name"], updated_at=p["updated_at"])
                for p in profiles
            ]
            return ProfileListResponse(profiles=profile_items)
        except Exception as e:
            logger.error("Failed to list profiles", exc_info=e)
            raise HTTPException(status_code=500, detail="Failed to list profiles")

    @router.get("/api/profile/{updated_at}")
    async def get_profile_by_updated_at_endpoint(updated_at: str):
        """Get a specific profile by its updated_at timestamp."""
        try:
            profile = queries.get_profile_by_updated_at(updated_at)
            if not profile:
                raise HTTPException(status_code=404, detail="Profile not found")
            return profile
        except HTTPException:
            raise
        except Exception as e:
            logger.error("Failed to get profile by timestamp", exc_info=e)
            raise HTTPException(status_code=500, detail="Failed to get profile")

    @router.delete("/api/profile", response_model=ProfileResponse)
    async def delete_profile_endpoint(request: Request, language: str = "en"):
        """Delete profile for specified language (defaults to English)."""
        try:
            if not _is_delete_confirmed(request):
                raise HTTPException(
                    status_code=400,
                    detail=f"Missing header `{_DELETE_CONFIRM_HEADER}: true`",
                )
            _log_profile_delete_request(request)
            success = queries.delete_profile(language)
            if not success:
                raise HTTPException(status_code=404, detail="Profile not found")
            return ProfileResponse(
                status="success", message="Profile deleted successfully"
            )
        except HTTPException:
            raise
        except Exception as e:
            logger.error("Failed to delete profile", exc_info=e)
            raise HTTPException(status_code=500, detail="Failed to delete profile")

    @router.delete("/api/profile/{updated_at}", response_model=ProfileResponse)
    async def delete_profile_by_updated_at_endpoint(request: Request, updated_at: str):
        """Delete a specific profile by its updated_at timestamp."""
        try:
            if not _is_delete_confirmed(request):
                raise HTTPException(
                    status_code=400,
                    detail=f"Missing header `{_DELETE_CONFIRM_HEADER}: true`",
                )
            _log_profile_delete_request(request, updated_at=updated_at)
            success = queries.delete_profile_by_updated_at(updated_at)
            if not success:
                raise HTTPException(status_code=404, detail="Profile not found")
            return ProfileResponse(
                status="success", message="Profile deleted successfully"
            )
        except HTTPException:
            raise
        except Exception as e:
            logger.error("Failed to delete profile", exc_info=e)
            raise HTTPException(status_code=500, detail="Failed to delete profile")

    @router.post("/api/profile/translate", response_model=TranslateProfileResponse)
    @limiter.limit("10/minute")
    async def translate_profile_endpoint(request: Request, translate_request: TranslateProfileRequest):
        """Translate a profile to another language and save it as a new profile."""
        try:
            translation_service = get_translation_service()

            profile_dict = translate_request.profile_data.model_dump()
            source_language = profile_dict.get("language", "en")
            target_language = translate_request.target_language

            # Don't translate if source and target languages are the same
            if source_language == target_language:
                raise HTTPException(
                    status_code=400,
                    detail=f"Source and target languages are the same ({target_language})"
                )

            # Translate the profile
            translated_profile_dict = await translation_service.translate_profile(
                profile_dict, target_language, source_language
            )

            # Check if a profile already exists for the target language
            profile_exists = queries.profile_exists_for_language(target_language)
            action = "updated" if profile_exists else "created"

            # Save the translated profile (this will create or update based on language)
            success = queries.save_profile(translated_profile_dict)
            if not success:
                raise HTTPException(status_code=500, detail="Failed to save translated profile")

            # Convert back to ProfileData model for response
            translated_profile = ProfileData(**translated_profile_dict)

            return TranslateProfileResponse(
                status="success",
                translated_profile=translated_profile,
                message=f"Profile {action} in {target_language.upper()} successfully"
            )
        except ValueError as e:
            logger.error("Translation service not configured", exc_info=e)
            raise HTTPException(status_code=503, detail="AI translation service is not configured")
        except HTTPException:
            raise
        except Exception as e:
            logger.error("Failed to translate profile", exc_info=e)
            raise HTTPException(status_code=500, detail="Failed to translate profile")

    return router
