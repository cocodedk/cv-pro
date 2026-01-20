"""Supabase-backed CV queries."""
from typing import Any, Dict, Optional
from backend.database.supabase.client import get_admin_client
from backend.database.supabase.utils import apply_user_scope, require_user_id


def _build_cv_response(row: Dict[str, Any]) -> Dict[str, Any]:
    cv_data = row.get("cv_data") or {}
    personal_info = cv_data.get("personal_info") or {}
    return {
        "cv_id": row.get("id"),
        "created_at": row.get("created_at"),
        "updated_at": row.get("updated_at"),
        "filename": row.get("filename"),
        "theme": row.get("theme") or cv_data.get("theme", "classic"),
        "layout": row.get("layout") or cv_data.get("layout", "classic-two-column"),
        "target_company": row.get("target_company"),
        "target_role": row.get("target_role"),
        "personal_info": personal_info,
        "experience": cv_data.get("experience", []),
        "education": cv_data.get("education", []),
        "skills": cv_data.get("skills", []),
    }


def create_cv(cv_data: Dict[str, Any]) -> str:
    client = get_admin_client()
    user_id = require_user_id(cv_data.get("user_id"))
    payload = {
        "user_id": user_id,
        "theme": cv_data.get("theme", "classic"),
        "layout": cv_data.get("layout", "classic-two-column"),
        "target_company": cv_data.get("target_company"),
        "target_role": cv_data.get("target_role"),
        "cv_data": cv_data,
    }
    response = client.table("cvs").insert(payload).execute()
    row = (response.data or [None])[0]
    if not row:
        raise RuntimeError("Failed to insert CV")
    return row["id"]


def get_cv_by_id(cv_id: str) -> Optional[Dict[str, Any]]:
    client = get_admin_client()
    user_id = require_user_id()
    query = client.table("cvs").select("*").eq("id", cv_id).limit(1)
    query = apply_user_scope(query, user_id)
    response = query.execute()
    if not response.data:
        return None
    return _build_cv_response(response.data[0])


def get_cv_by_filename(filename: str) -> Optional[Dict[str, Any]]:
    client = get_admin_client()
    user_id = require_user_id()
    query = client.table("cvs").select("*").eq("filename", filename).limit(1)
    query = apply_user_scope(query, user_id)
    response = query.execute()
    if not response.data:
        return None
    return _build_cv_response(response.data[0])


def list_cvs(
    limit: int = 50, offset: int = 0, search: Optional[str] = None
) -> Dict[str, Any]:
    client = get_admin_client()
    user_id = require_user_id()
    query = client.table("cvs").select(
        "id, created_at, updated_at, filename, target_company, target_role, cv_data",
        count="exact",
    )
    query = apply_user_scope(query, user_id)
    if search:
        pattern = f"%{search}%"
        query = query.or_(
            "cv_data->personal_info->>name.ilike.{},"
            "cv_data->personal_info->>email.ilike.{}".format(pattern, pattern)
        )
    query = query.order("created_at", desc=True).range(offset, offset + limit - 1)
    response = query.execute()
    rows = response.data or []
    total = response.count if response.count is not None else len(rows)
    cvs = []
    for row in rows:
        cv_data = row.get("cv_data") or {}
        personal_info = cv_data.get("personal_info") or {}
        cvs.append(
            {
                "cv_id": row.get("id"),
                "created_at": row.get("created_at"),
                "updated_at": row.get("updated_at"),
                "person_name": personal_info.get("name"),
                "filename": row.get("filename"),
                "target_company": row.get("target_company"),
                "target_role": row.get("target_role"),
            }
        )
    return {"cvs": cvs, "total": total}


def update_cv(cv_id: str, cv_data: Dict[str, Any]) -> bool:
    client = get_admin_client()
    user_id = require_user_id()
    payload = {
        "theme": cv_data.get("theme", "classic"),
        "layout": cv_data.get("layout", "classic-two-column"),
        "target_company": cv_data.get("target_company"),
        "target_role": cv_data.get("target_role"),
        "cv_data": cv_data,
    }
    query = client.table("cvs").update(payload).eq("id", cv_id)
    query = apply_user_scope(query, user_id)
    response = query.execute()
    return bool(response.data)


def set_cv_filename(cv_id: str, filename: str) -> bool:
    client = get_admin_client()
    user_id = require_user_id()
    query = client.table("cvs").update({"filename": filename}).eq("id", cv_id)
    query = apply_user_scope(query, user_id)
    response = query.execute()
    return bool(response.data)


def delete_cv(cv_id: str) -> bool:
    client = get_admin_client()
    user_id = require_user_id()
    query = client.table("cvs").delete().eq("id", cv_id)
    query = apply_user_scope(query, user_id)
    response = query.execute()
    return bool(response.data)
