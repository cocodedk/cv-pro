"""Pytest fixtures and configuration."""
import pytest
import pytest_asyncio
import tempfile
import shutil
from pathlib import Path
from types import SimpleNamespace
from typing import Dict, Any
from httpx import AsyncClient, ASGITransport
from backend.app import app
from backend.app_helpers import auth as auth_helpers
from backend.app_helpers.routes import admin as admin_routes
from backend.app_helpers.routes import health as health_routes
from backend.app_helpers import lifespan as lifespan_module
from backend.database.supabase import client as supabase_client
from backend.database.supabase import cover_letter as supabase_cover_letter
from backend.database.supabase import cv as supabase_cv
from backend.database.supabase import cv_search as supabase_cv_search
from backend.database.supabase import profile as supabase_profile


def pytest_configure(config):
    """Register custom markers."""
    config.addinivalue_line("markers", "unit: Unit tests")
    config.addinivalue_line("markers", "integration: Integration tests")
    config.addinivalue_line("markers", "api: API endpoint tests")


class FakeSupabaseTable:
    """Lightweight Supabase table stub."""

    def __init__(self, data):
        self._data = data
        self.count = len(data) if isinstance(data, list) else None

    def select(self, *_args, **_kwargs):
        return self

    def eq(self, *_args, **_kwargs):
        return self

    def single(self):
        return self

    def order(self, *_args, **_kwargs):
        return self

    def range(self, *_args, **_kwargs):
        return self

    def limit(self, *_args, **_kwargs):
        return self

    def insert(self, *_args, **_kwargs):
        return self

    def update(self, *_args, **_kwargs):
        return self

    def delete(self, *_args, **_kwargs):
        return self

    def or_(self, *_args, **_kwargs):
        return self

    def execute(self):
        return SimpleNamespace(data=self._data, count=self.count)


class FakeSupabaseClient:
    """Minimal Supabase admin client stub."""

    def __init__(self, tables):
        self._tables = tables

    def table(self, name):
        return FakeSupabaseTable(self._tables.get(name, []))


def _should_skip_supabase_mock(request) -> bool:
    return request.node.fspath and request.node.fspath.basename == "test_supabase_env.py"


@pytest.fixture
def mock_supabase_client(monkeypatch, request):
    """Mock Supabase admin client for testing."""
    if _should_skip_supabase_mock(request):
        return None

    monkeypatch.setenv("SUPABASE_DEFAULT_USER_ID", "test-user")
    fake_client = FakeSupabaseClient({"user_profiles": [{"id": "test-user"}]})

    monkeypatch.setattr(supabase_client, "get_admin_client", lambda: fake_client)
    monkeypatch.setattr(lifespan_module, "get_admin_client", lambda: fake_client)
    monkeypatch.setattr(health_routes, "get_admin_client", lambda: fake_client)
    monkeypatch.setattr(auth_helpers, "get_admin_client", lambda: fake_client)
    monkeypatch.setattr(admin_routes, "get_admin_client", lambda: fake_client)
    monkeypatch.setattr(supabase_cv, "get_admin_client", lambda: fake_client)
    monkeypatch.setattr(supabase_cover_letter, "get_admin_client", lambda: fake_client)
    monkeypatch.setattr(supabase_profile, "get_admin_client", lambda: fake_client)
    monkeypatch.setattr(supabase_cv_search, "get_admin_client", lambda: fake_client)
    return fake_client


@pytest.fixture(autouse=True)
def _apply_supabase_defaults(mock_supabase_client):
    """Ensure Supabase defaults are set for tests."""
    yield


@pytest_asyncio.fixture
async def client():
    """FastAPI test client."""
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        yield ac


@pytest.fixture
def sample_cv_data() -> Dict[str, Any]:
    """Sample CV data for testing."""
    return {
        "personal_info": {
            "name": "John Doe",
            "email": "john.doe@example.com",
            "phone": "+1234567890",
            "address": {
                "street": "123 Main St",
                "city": "New York",
                "state": "NY",
                "zip": "10001",
                "country": "USA",
            },
            "linkedin": "https://linkedin.com/in/johndoe",
            "github": "https://github.com/johndoe",
            "summary": "Experienced software developer",
        },
        "experience": [
            {
                "title": "Senior Developer",
                "company": "Tech Corp",
                "start_date": "2020-01",
                "end_date": "2023-12",
                "description": "Led a small team delivering product features.",
                "location": "Remote",
                "projects": [
                    {
                        "name": "Internal Platform",
                        "description": "Unified services into a single developer platform.",
                        "technologies": ["FastAPI", "PostgreSQL", "React"],
                        "highlights": [
                            "Reduced onboarding time by standardizing templates and tooling.",
                            "Improved reliability with automated health checks and alerting.",
                        ],
                        "url": "https://example.com/platform",
                    }
                ],
            }
        ],
        "education": [
            {
                "degree": "BS Computer Science",
                "institution": "University of Technology",
                "year": "2018",
                "field": "Computer Science",
                "gpa": "3.8",
            }
        ],
        "skills": [
            {"name": "Python", "category": "Programming", "level": "Expert"},
            {"name": "React", "category": "Frontend", "level": "Advanced"},
        ],
        "theme": "classic",
    }


@pytest.fixture
def temp_output_dir():
    """Temporary directory for test file output."""
    temp_dir = tempfile.mkdtemp()
    yield Path(temp_dir)
    shutil.rmtree(temp_dir)


@pytest.fixture(scope="module")
def pdf_service():
    """PDF service instance for integration tests."""
    from backend.services.pdf_service import PDFService

    return PDFService(timeout=30)  # Shorter timeout for tests


@pytest.fixture
def sample_html_content():
    """Sample HTML content for testing."""
    return """
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <style>
            body { margin: 0; padding: 20px; font-family: Arial, sans-serif; }
            h1 { margin: 0 0 20px 0; }
            p { margin: 10px 0; }
        </style>
    </head>
    <body>
        <h1>Test CV</h1>
        <p>This is a test CV content.</p>
    </body>
    </html>
    """


@pytest.fixture
def long_html_content():
    """Long HTML content for testing (> 5000px height)."""
    parts = [
        """
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <style>
            body { margin: 0; padding: 20px; font-family: Arial, sans-serif; }
            .section { margin: 50px 0; min-height: 500px; }
        </style>
    </head>
    <body>
    """
    ]
    # Add many sections to create long content
    for i in range(15):
        parts.append(
            f'<div class="section"><h2>Section {i+1}</h2><p>Content for section {i+1}</p></div>'
        )
    parts.append(
        """
    </body>
    </html>
    """
    )
    return "".join(parts)
