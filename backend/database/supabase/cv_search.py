"""Supabase-backed CV search queries."""
from typing import Any, Dict, List, Optional
from backend.database.supabase.client import get_admin_client
from backend.database.supabase.utils import apply_user_scope, get_user_id


def _match_any(value: str, terms: List[str]) -> bool:
    return any(term in value for term in terms)


def _cv_matches(
    cv_data: Dict[str, Any],
    skills: List[str],
    experience_keywords: List[str],
    education_keywords: List[str],
) -> bool:
    if skills:
        for skill in cv_data.get("skills", []):
            name = str(skill.get("name", "")).lower()
            if _match_any(name, skills):
                return True
    if experience_keywords:
        for exp in cv_data.get("experience", []):
            text = " ".join(
                str(exp.get(key, ""))
                for key in ("title", "company", "description")
            ).lower()
            if _match_any(text, experience_keywords):
                return True
    if education_keywords:
        for edu in cv_data.get("education", []):
            text = " ".join(
                str(edu.get(key, ""))
                for key in ("degree", "institution", "field")
            ).lower()
            if _match_any(text, education_keywords):
                return True
    return False


def search_cvs(
    skills: Optional[List[str]] = None,
    experience_keywords: Optional[List[str]] = None,
    education_keywords: Optional[List[str]] = None,
) -> List[Dict[str, Any]]:
    if not any([skills, experience_keywords, education_keywords]):
        return []
    client = get_admin_client()
    user_id = get_user_id()
    query = client.table("cvs").select("id, created_at, cv_data").order(
        "created_at", desc=True
    )
    query = apply_user_scope(query, user_id)
    response = query.limit(500).execute()
    rows = response.data or []
    terms = [term.lower() for term in (skills or [])]
    exp_terms = [term.lower() for term in (experience_keywords or [])]
    edu_terms = [term.lower() for term in (education_keywords or [])]
    results = []
    for row in rows:
        cv_data = row.get("cv_data") or {}
        if _cv_matches(cv_data, terms, exp_terms, edu_terms):
            personal_info = cv_data.get("personal_info") or {}
            results.append(
                {
                    "cv_id": row.get("id"),
                    "created_at": row.get("created_at"),
                    "person_name": personal_info.get("name"),
                }
            )
    return results
