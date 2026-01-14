# Environment Switching

This repo will support running either Neo4j or Supabase during the migration period.

## Configuration Contract

Backend environment variables:
- `DATABASE_PROVIDER=neo4j|supabase`
- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `SUPABASE_JWT_SECRET` (for verifying access tokens)
- `NEO4J_*` (keep until cutover)

Frontend environment variables:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `VITE_API_BASE_URL`
- `VITE_AUTH_ENABLED=true|false` (optional feature flag)

## Backend Provider Selection

Add a provider switch and keep the API surface stable.

Example (`backend/database/provider.py`):
```python
import os
from backend.database import queries as neo4j_queries
from backend.database.supabase import queries as supabase_queries


def get_queries():
    provider = os.getenv("DATABASE_PROVIDER", "neo4j")
    if provider == "supabase":
        return supabase_queries
    return neo4j_queries
```

Update routes to use `get_queries()` instead of importing Neo4j queries directly.

## Supabase Client Creation

Example (`backend/database/supabase_client.py`):
```python
import os
from supabase import create_client

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_ANON_KEY = os.getenv("SUPABASE_ANON_KEY")
SUPABASE_SERVICE_ROLE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")


def get_admin_client():
    return create_client(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
```

## Docker Compose (Local)

When backend runs in Docker and Supabase runs via CLI on the host:
```yaml
services:
  app:
    environment:
      - DATABASE_PROVIDER=supabase
      - SUPABASE_URL=http://host.docker.internal:54321
    extra_hosts:
      - "host.docker.internal:host-gateway"
```

## Cutover Plan
1. Run both providers behind `DATABASE_PROVIDER`.
2. Migrate data and verify.
3. Switch `DATABASE_PROVIDER` to `supabase` in all environments.
4. Remove Neo4j containers and env vars.
