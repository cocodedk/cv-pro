"""Supabase-backed cover letter queries."""
from typing import Any, Dict, Optional
from backend.database.supabase.client import get_admin_client
from backend.database.supabase.utils import apply_user_scope, get_user_id, require_user_id


def create_cover_letter(
    cover_letter_id: str,
    created_at: str,
    job_description: str,
    company_name: str,
    hiring_manager_name: Optional[str],
    company_address: Optional[str],
    tone: str,
    cover_letter_html: str,
    cover_letter_text: str,
    highlights_used: list[str],
    selected_experiences: list[str],
    selected_skills: list[str],
    user_id: Optional[str] = None,
    profile_id: Optional[str] = None,
    cv_id: Optional[str] = None,
) -> str:
    client = get_admin_client()
    owner_id = require_user_id(user_id)
    payload = {
        "id": cover_letter_id,
        "user_id": owner_id,
        "profile_id": profile_id,
        "cv_id": cv_id,
        "job_description": job_description,
        "company_name": company_name,
        "hiring_manager_name": hiring_manager_name,
        "company_address": company_address,
        "tone": tone,
        "cover_letter_html": cover_letter_html,
        "cover_letter_text": cover_letter_text,
        "highlights_used": highlights_used,
        "selected_experiences": selected_experiences,
        "selected_skills": selected_skills,
        "created_at": created_at,
    }
    response = client.table("cover_letters").insert(payload).execute()
    row = (response.data or [None])[0]
    if not row:
        raise RuntimeError("Failed to insert cover letter")
    return row["id"]


def list_cover_letters(
    limit: int = 50, offset: int = 0, search: Optional[str] = None
) -> Dict[str, Any]:
    client = get_admin_client()
    user_id = get_user_id()
    query = client.table("cover_letters").select(
        "id, created_at, updated_at, company_name, hiring_manager_name, tone",
        count="exact",
    )
    query = apply_user_scope(query, user_id)
    if search:
        pattern = f"%{search}%"
        query = query.or_(
            "company_name.ilike.{},job_description.ilike.{}".format(
                pattern, pattern
            )
        )
    query = query.order("created_at", desc=True).range(offset, offset + limit - 1)
    response = query.execute()
    rows = response.data or []
    total = response.count if response.count is not None else len(rows)
    cover_letters = []
    for row in rows:
        cover_letters.append(
            {
                "cover_letter_id": row.get("id"),
                "created_at": row.get("created_at"),
                "updated_at": row.get("updated_at"),
                "company_name": row.get("company_name"),
                "hiring_manager_name": row.get("hiring_manager_name"),
                "tone": row.get("tone"),
            }
        )
    return {"cover_letters": cover_letters, "total": total}


def get_cover_letter_by_id(cover_letter_id: str) -> Optional[Dict[str, Any]]:
    client = get_admin_client()
    user_id = get_user_id()
    query = (
        client.table("cover_letters").select("*").eq("id", cover_letter_id).limit(1)
    )
    query = apply_user_scope(query, user_id)
    response = query.execute()
    if not response.data:
        return None
    row = response.data[0]
    return {
        "cover_letter_id": row.get("id"),
        "created_at": row.get("created_at"),
        "updated_at": row.get("updated_at"),
        "job_description": row.get("job_description"),
        "company_name": row.get("company_name"),
        "hiring_manager_name": row.get("hiring_manager_name"),
        "company_address": row.get("company_address"),
        "tone": row.get("tone"),
        "cover_letter_html": row.get("cover_letter_html"),
        "cover_letter_text": row.get("cover_letter_text"),
        "highlights_used": row.get("highlights_used", []),
        "selected_experiences": row.get("selected_experiences", []),
        "selected_skills": row.get("selected_skills", []),
    }


def delete_cover_letter(cover_letter_id: str) -> bool:
    client = get_admin_client()
    user_id = get_user_id()
    query = client.table("cover_letters").delete().eq("id", cover_letter_id)
    query = apply_user_scope(query, user_id)
    response = query.execute()
    return bool(response.data)
