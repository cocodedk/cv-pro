"""Tests for database provider selection."""
from backend.database.provider import get_provider, is_supabase


def test_get_provider_defaults_to_neo4j(monkeypatch):
    monkeypatch.delenv("DATABASE_PROVIDER", raising=False)
    assert get_provider() == "neo4j"


def test_is_supabase_true_when_set(monkeypatch):
    monkeypatch.setenv("DATABASE_PROVIDER", "supabase")
    assert get_provider() == "supabase"
    assert is_supabase() is True
