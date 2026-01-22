"""Supabase query exports."""
from backend.database.supabase.cv import (
    create_cv,
    delete_cv,
    get_cv_by_filename,
    get_cv_by_id,
    list_cvs,
    set_cv_filename,
    update_cv,
)
from backend.database.supabase.cv_search import search_cvs
from backend.database.supabase.profile import (
    delete_profile,
    delete_profile_by_updated_at,
    delete_default_profile,
    get_profile,
    get_profile_by_updated_at,
    get_default_profile,
    list_profiles,
    profile_exists_for_language,
    save_profile,
)
from backend.database.supabase.cover_letter import (
    create_cover_letter,
    delete_cover_letter,
    get_cover_letter_by_id,
    list_cover_letters,
)

create_profile = save_profile
update_profile = save_profile

__all__ = [
    "create_cv",
    "delete_cv",
    "get_cv_by_filename",
    "get_cv_by_id",
    "list_cvs",
    "search_cvs",
    "set_cv_filename",
    "update_cv",
    "create_cover_letter",
    "delete_cover_letter",
    "get_cover_letter_by_id",
    "list_cover_letters",
    "save_profile",
    "create_profile",
    "update_profile",
    "get_profile",
    "get_profile_by_updated_at",
    "get_default_profile",
    "list_profiles",
    "profile_exists_for_language",
    "delete_profile",
    "delete_profile_by_updated_at",
    "delete_default_profile",
]
