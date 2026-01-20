"""Supabase-backed profile queries."""
from typing import Any, Dict, Optional
from backend.database.supabase.client import get_admin_client
from backend.database.supabase.utils import apply_user_scope, require_user_id


def _build_profile_response(row: Dict[str, Any]) -> Dict[str, Any]:
    profile_data = row.get("profile_data") or {}
    profile_data["updated_at"] = row.get("updated_at")
    return profile_data


def save_profile(profile_data: Dict[str, Any]) -> bool:
    client = get_admin_client()
    user_id = require_user_id(profile_data.get("user_id"))
    existing = (
        client.table("cv_profiles")
        .select("id")
        .eq("user_id", user_id)
        .order("updated_at", desc=True)
        .limit(1)
        .execute()
    )
    if existing.data:
        profile_id = existing.data[0]["id"]
        response = (
            client.table("cv_profiles")
            .update({"profile_data": profile_data})
            .eq("id", profile_id)
            .execute()
        )
    else:
        response = (
            client.table("cv_profiles")
            .insert({"user_id": user_id, "profile_data": profile_data})
            .execute()
        )
    return bool(response.data)


def get_profile() -> Optional[Dict[str, Any]]:
    client = get_admin_client()
    user_id = require_user_id()
    query = client.table("cv_profiles").select("profile_data, updated_at")
    query = apply_user_scope(query, user_id)
    response = query.order("updated_at", desc=True).limit(1).execute()
    if not response.data:
        return None
    return _build_profile_response(response.data[0])


def list_profiles() -> list[Dict[str, Any]]:
    client = get_admin_client()
    user_id = require_user_id()
    query = client.table("cv_profiles").select("profile_data, updated_at")
    query = apply_user_scope(query, user_id)
    response = query.order("updated_at", desc=True).execute()
    profiles = []
    for row in response.data or []:
        personal_info = (row.get("profile_data") or {}).get("personal_info") or {}
        profiles.append(
            {
                "name": personal_info.get("name", "Unknown"),
                "updated_at": row.get("updated_at"),
            }
        )
    return profiles


def get_profile_by_updated_at(updated_at: str) -> Optional[Dict[str, Any]]:
    client = get_admin_client()
    user_id = require_user_id()
    query = (
        client.table("cv_profiles")
        .select("profile_data, updated_at")
        .eq("updated_at", updated_at)
        .limit(1)
    )
    query = apply_user_scope(query, user_id)
    response = query.execute()
    if not response.data:
        return None
    return _build_profile_response(response.data[0])


def delete_profile_by_updated_at(updated_at: str) -> bool:
    client = get_admin_client()
    user_id = require_user_id()
    query = client.table("cv_profiles").delete().eq("updated_at", updated_at)
    query = apply_user_scope(query, user_id)
    response = query.execute()
    return bool(response.data)


def delete_profile() -> bool:
    client = get_admin_client()
    user_id = require_user_id()
    query = client.table("cv_profiles").select("id").order("updated_at", desc=True)
    query = apply_user_scope(query, user_id)
    response = query.limit(1).execute()
    if not response.data:
        return False
    profile_id = response.data[0]["id"]
    response = client.table("cv_profiles").delete().eq("id", profile_id).execute()
    return bool(response.data)
