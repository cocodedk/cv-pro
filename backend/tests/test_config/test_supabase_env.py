"""Tests for Supabase environment configuration."""
import pytest
from backend.database.supabase import client as supabase_client


def reset_clients():
    supabase_client._client = None
    supabase_client._admin_client = None


def test_get_client_uses_anon_key(monkeypatch):
    reset_clients()
    monkeypatch.setenv("SUPABASE_URL", "https://example.supabase.co")
    monkeypatch.setenv("SUPABASE_ANON_KEY", "anon-key")

    created = {}

    def fake_create_client(url, key):
        created["args"] = (url, key)
        return "client"

    monkeypatch.setattr(supabase_client, "create_client", fake_create_client)
    client = supabase_client.get_client()

    assert client == "client"
    assert created["args"] == ("https://example.supabase.co", "anon-key")


def test_get_admin_client_uses_service_role_key(monkeypatch):
    reset_clients()
    monkeypatch.setenv("SUPABASE_URL", "https://example.supabase.co")
    monkeypatch.setenv("SUPABASE_SERVICE_ROLE_KEY", "service-key")

    created = {}

    def fake_create_client(url, key):
        created["args"] = (url, key)
        return "admin-client"

    monkeypatch.setattr(supabase_client, "create_client", fake_create_client)
    client = supabase_client.get_admin_client()

    assert client == "admin-client"
    assert created["args"] == ("https://example.supabase.co", "service-key")


def test_get_client_requires_supabase_url(monkeypatch):
    reset_clients()
    monkeypatch.delenv("SUPABASE_URL", raising=False)
    monkeypatch.setenv("SUPABASE_ANON_KEY", "anon-key")

    with pytest.raises(RuntimeError, match="Missing SUPABASE_URL"):
        supabase_client.get_client()
