"""Tests for POST /api/cover-letters endpoint."""

import pytest
from unittest.mock import patch


@pytest.mark.asyncio
@pytest.mark.api
class TestSaveCoverLetter:
    """Test POST /api/cover-letters endpoint."""

    async def test_save_cover_letter_success(self, client, mock_supabase_client):
        """Test successful cover letter saving."""
        cover_letter_response = {
            "cover_letter_html": "<p>Test letter</p>",
            "cover_letter_text": "Test letter",
            "highlights_used": [],
            "selected_experiences": [],
            "selected_skills": ["Python"]
        }
        request_data = {
            "job_description": "We need a Python developer.",
            "company_name": "Tech Corp",
            "tone": "professional"
        }

        with patch(
            "backend.app_helpers.routes.cover_letter.endpoints.queries.create_cover_letter",
            return_value="test-cover-letter-id",
        ):
            response = await client.post(
                "/api/cover-letters",
                json={
                    "cover_letter_response": cover_letter_response,
                    "request_data": request_data
                },
            )

        assert response.status_code == 200
        data = response.json()
        assert "cover_letter_id" in data
        assert data["status"] == "success"

    async def test_save_cover_letter_validation_error(self, client, mock_supabase_client):
        """Test save cover letter with invalid data."""
        response = await client.post(
            "/api/cover-letters",
            json={
                "cover_letter_response": {},  # Missing required fields
                "request_data": {}  # Missing required fields
            },
        )
        assert response.status_code == 422

    async def test_save_cover_letter_database_error(self, client, mock_supabase_client):
        """Test save cover letter with database error."""
        cover_letter_response = {
            "cover_letter_html": "<p>Test letter</p>",
            "cover_letter_text": "Test letter",
            "highlights_used": [],
            "selected_experiences": [],
            "selected_skills": ["Python"]
        }
        request_data = {
            "job_description": "We need a Python developer.",
            "company_name": "Tech Corp",
            "tone": "professional"
        }

        with patch(
            "backend.app_helpers.routes.cover_letter.endpoints.queries.create_cover_letter",
            side_effect=Exception("Database connection failed"),
        ):
            response = await client.post(
                "/api/cover-letters",
                json={
                    "cover_letter_response": cover_letter_response,
                    "request_data": request_data
                },
            )

            assert response.status_code == 500
            data = response.json()
            assert "Failed to save cover letter" in data["detail"]
