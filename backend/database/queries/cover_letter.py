"""Cover letter creation queries."""
from backend.database.connection import Neo4jConnection
from backend.database.queries.create.cover_letter import create_cover_letter_node


def create_cover_letter(
    cover_letter_id: str,
    created_at: str,
    job_description: str,
    company_name: str,
    hiring_manager_name: str | None,
    company_address: str | None,
    tone: str,
    cover_letter_html: str,
    cover_letter_text: str,
    highlights_used: list[str],
    selected_experiences: list[str],
    selected_skills: list[str],
    user_id: str | None = None,
    profile_id: str | None = None,
    cv_id: str | None = None,
) -> str:
    driver = Neo4jConnection.get_driver()
    database = Neo4jConnection.get_database()
    with driver.session(database=database) as session:
        session.execute_write(
            create_cover_letter_node,
            cover_letter_id=cover_letter_id,
            created_at=created_at,
            job_description=job_description,
            company_name=company_name,
            hiring_manager_name=hiring_manager_name,
            company_address=company_address,
            tone=tone,
            cover_letter_html=cover_letter_html,
            cover_letter_text=cover_letter_text,
            highlights_used=highlights_used,
            selected_experiences=selected_experiences,
            selected_skills=selected_skills,
        )
    return cover_letter_id
