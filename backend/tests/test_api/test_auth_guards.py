"""Tests for Supabase auth guards."""
from types import SimpleNamespace
import pytest
from backend.app_helpers import auth as auth_helpers
from backend.app_helpers.routes import admin as admin_routes


class FakeTable:
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

    def execute(self):
        return SimpleNamespace(data=self._data, count=self.count)


class FakeAdminClient:
    """Minimal Supabase admin client stub."""

    def __init__(self, tables):
        self._tables = tables

    def table(self, name):
        return FakeTable(self._tables.get(name))


@pytest.fixture
def non_admin_mocks(monkeypatch):
    """Fixture that sets up mocks for a non-admin user."""
    user = SimpleNamespace(id="user-1", email="user@example.com")
    fake_client = SimpleNamespace(
        auth=SimpleNamespace(
            get_user=lambda _token: SimpleNamespace(user=user)
        )
    )
    fake_admin = FakeAdminClient(
        {"user_profiles": {"role": "user", "is_active": True}}
    )
    monkeypatch.setattr(auth_helpers, "get_client", lambda: fake_client)
    monkeypatch.setattr(auth_helpers, "get_admin_client", lambda: fake_admin)
    monkeypatch.setattr(admin_routes, "get_admin_client", lambda: fake_admin)
    return SimpleNamespace(user=user, fake_client=fake_client, fake_admin=fake_admin)


@pytest.fixture
def admin_mocks(monkeypatch):
    """Fixture that sets up mocks for an admin user."""
    user = SimpleNamespace(id="admin-1", email="admin@example.com")
    fake_client = SimpleNamespace(
        auth=SimpleNamespace(
            get_user=lambda _token: SimpleNamespace(user=user)
        )
    )
    fake_admin = FakeAdminClient(
        {
            "user_profiles": {"role": "admin", "is_active": True},
            "admin_users": [
                {
                    "id": "admin-1",
                    "email": "admin@example.com",
                    "full_name": None,
                    "role": "admin",
                    "is_active": True,
                    "created_at": "2024-01-01T00:00:00Z",
                    "cv_count": 1,
                    "last_cv_update": "2024-01-02T00:00:00Z",
                }
            ],
        }
    )
    monkeypatch.setattr(auth_helpers, "get_client", lambda: fake_client)
    monkeypatch.setattr(auth_helpers, "get_admin_client", lambda: fake_admin)
    monkeypatch.setattr(admin_routes, "get_admin_client", lambda: fake_admin)
    return SimpleNamespace(user=user, fake_client=fake_client, fake_admin=fake_admin)


@pytest.mark.asyncio
@pytest.mark.api
class TestAuthGuards:
    """Validate auth guard behavior when Supabase is enabled."""

    async def test_missing_token_returns_401(self, client, monkeypatch):
        monkeypatch.delenv("SUPABASE_DEFAULT_USER_ID", raising=False)
        response = await client.get("/api/cvs")
        assert response.status_code == 401

    async def test_invalid_token_returns_401(self, client, monkeypatch):
        def _raise(_token):
            raise RuntimeError("invalid")

        fake_client = SimpleNamespace(auth=SimpleNamespace(get_user=_raise))
        monkeypatch.setattr(auth_helpers, "get_client", lambda: fake_client)

        response = await client.get(
            "/api/cvs", headers={"Authorization": "Bearer invalid"}
        )
        assert response.status_code == 401

    async def test_admin_requires_admin_role(self, client, non_admin_mocks):
        response = await client.get(
            "/api/admin/users", headers={"Authorization": "Bearer ok"}
        )
        assert response.status_code == 403

    async def test_admin_search_requires_admin_role(self, client, non_admin_mocks):
        response = await client.get(
            "/api/admin/users/search",
            params={"q": "someone@example.com"},
            headers={"Authorization": "Bearer ok"},
        )
        assert response.status_code == 403

    async def test_admin_reset_password_requires_admin_role(self, client, non_admin_mocks):
        response = await client.put(
            "/api/admin/users/user-1/reset-password",
            json={"new_password": "new-password-123"},
            headers={"Authorization": "Bearer ok"},
        )
        assert response.status_code == 403

    async def test_admin_access_allows_users_view(self, client, admin_mocks):
        response = await client.get(
            "/api/admin/users", headers={"Authorization": "Bearer ok"}
        )
        assert response.status_code == 200
        assert response.json()["users"][0]["id"] == "admin-1"
