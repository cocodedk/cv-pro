"""Lifespan context manager for FastAPI application."""
import asyncio
import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI
from backend.database.connection import Neo4jConnection
from backend.database.provider import get_provider

logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Lifespan context manager for startup and shutdown."""
    # Startup
    logger.info("Starting up CV Generator API...")
    max_retries = 5
    retry_count = 0

    provider = get_provider()
    while retry_count < max_retries:
        if provider == "supabase":
            try:
                from backend.database.supabase.client import get_admin_client

                client = get_admin_client()
                client.table("user_profiles").select("id").limit(1).execute()
                logger.info("Successfully connected to Supabase database")
                break
            except Exception:
                pass
        else:
            if Neo4jConnection.verify_connectivity():
                logger.info("Successfully connected to Neo4j database")
                break

        retry_count += 1
        logger.warning(
            "Failed to connect to %s database (attempt %d/%d)",
            provider,
            retry_count,
            max_retries,
        )
        if retry_count < max_retries:
            await asyncio.sleep(2)

    if retry_count >= max_retries:
        logger.error("Failed to connect to %s database after multiple attempts", provider)
        raise RuntimeError(f"Failed to connect to {provider} database")

    yield

    # Shutdown
    if provider != "supabase":
        Neo4jConnection.close()
