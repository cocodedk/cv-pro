"""Lifespan context manager for FastAPI application."""
import asyncio
import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI
from backend.database.supabase.client import get_admin_client

logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Lifespan context manager for startup and shutdown."""
    # Startup
    logger.info("Starting up CV Generator API...")
    max_retries = 5
    retry_count = 0

    while retry_count < max_retries:
        try:
            client = get_admin_client()
            client.table("user_profiles").select("id").limit(1).execute()
            logger.info("Successfully connected to Supabase database")
            break
        except Exception as e:
            logger.debug("Supabase connection attempt failed: %s", str(e), exc_info=True)

        retry_count += 1
        logger.warning(
            "Failed to connect to Supabase database (attempt %d/%d)",
            retry_count,
            max_retries,
        )
        if retry_count < max_retries:
            await asyncio.sleep(2)

    if retry_count >= max_retries:
        logger.error("Failed to connect to Supabase database after multiple attempts")
        raise RuntimeError("Failed to connect to Supabase database")

    yield
