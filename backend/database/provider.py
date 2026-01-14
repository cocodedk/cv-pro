"""Database provider helpers."""
import os


def get_provider() -> str:
    return os.getenv("DATABASE_PROVIDER", "neo4j").lower()


def is_supabase() -> bool:
    return get_provider() == "supabase"
