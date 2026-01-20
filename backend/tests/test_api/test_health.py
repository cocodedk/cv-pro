"""Tests for health check endpoint."""
from types import SimpleNamespace
import pytest
from unittest.mock import patch


class FakeAdminClient:
    """Minimal Supabase admin client stub."""

    def table(self, _name):
        return self

    def select(self, *_args, **_kwargs):
        return self

    def limit(self, *_args, **_kwargs):
        return self

    def execute(self):
        return SimpleNamespace(data=[{"id": "test-user"}])


@pytest.mark.asyncio
@pytest.mark.api
class TestHealthEndpoint:
    """Test health check endpoint."""

    async def test_health_check_connected(self, client):
        """Test health check when database is connected."""
        with patch(
            "backend.app_helpers.routes.health.get_admin_client",
            return_value=FakeAdminClient(),
        ):
            response = await client.get("/api/health")
            assert response.status_code == 200
            data = response.json()
            assert data["status"] == "healthy"
            assert data["database"] == "connected"

    async def test_health_check_disconnected(self, client):
        """Test health check when database is disconnected."""
        with patch(
            "backend.app_helpers.routes.health.get_admin_client",
            side_effect=RuntimeError("offline"),
        ):
            response = await client.get("/api/health")
            assert response.status_code == 200
            data = response.json()
            assert data["status"] == "unhealthy"
            assert data["database"] == "disconnected"
