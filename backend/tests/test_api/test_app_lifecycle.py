"""Tests for app lifecycle events."""
from types import SimpleNamespace
import pytest
from unittest.mock import patch
from backend.app import app


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


class TestAppLifespan:
    """Test app lifespan context manager."""

    @pytest.mark.asyncio
    async def test_lifespan_startup_success(self):
        """Test lifespan startup with successful connection."""
        with patch(
            "backend.app_helpers.lifespan.get_admin_client",
            return_value=FakeAdminClient(),
        ) as mock_client:
            async with app.router.lifespan_context(app):
                mock_client.assert_called()

    @pytest.mark.asyncio
    async def test_lifespan_startup_retry_success(self):
        """Test lifespan startup with retry logic."""
        side_effects = [
            RuntimeError("down"),
            RuntimeError("down"),
            FakeAdminClient(),
        ]
        with patch(
            "backend.app_helpers.lifespan.get_admin_client",
            side_effect=side_effects,
        ) as mock_client:
            with patch("time.sleep"):
                async with app.router.lifespan_context(app):
                    assert mock_client.call_count == 3

    @pytest.mark.asyncio
    async def test_lifespan_startup_max_retries_fails(self):
        """Test lifespan startup fails after max retries."""
        with patch(
            "backend.app_helpers.lifespan.get_admin_client",
            side_effect=RuntimeError("down"),
        ) as mock_client:
            with patch("time.sleep"):
                with pytest.raises(Exception, match="Failed to connect"):
                    async with app.router.lifespan_context(app):
                        pass
                assert mock_client.call_count == 5
