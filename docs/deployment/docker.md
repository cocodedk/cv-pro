# Docker Setup

Docker configuration and setup for the CV Generator.

## Docker Compose Services

The application uses Docker Compose with the backend service. Supabase runs
separately via the Supabase CLI.

### Backend Service (`app`)

- **Image**: Built from `Dockerfile`
- **Container name**: `cv-pro-app`
- **Port**: 8000 (mapped to host)
- **Volumes**:
  - `./backend:/app/backend`: Backend code (for development)
  - `./backend/output:/app/backend/output`: Generated DOCX files
- **Environment variables**: From `.env` file or docker-compose.yml
  - Supabase: `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `SUPABASE_JWT_SECRET`
  - CORS: `CORS_ORIGINS`
  - AI (optional): `AI_ENABLED`, `AI_BASE_URL`, `AI_API_KEY`, `AI_MODEL`, `AI_TEMPERATURE`, `AI_REQUEST_TIMEOUT_S`
- **Depends on**: Supabase running locally or hosted (see `docs/supabase/local-setup.md`)

### Supabase (Local)

- **Start**: `supabase start`
- **Stop**: `supabase stop`
- **Ports**:
  - 54321: Supabase API
  - 54322: Postgres
  - 54323: Supabase Studio

## Dockerfile

Multi-stage build process:

1. **Base stage**: Python 3.11 with system dependencies
2. **Dependencies stage**: Install Python packages
3. **Frontend stage**: Build React frontend
4. **Final stage**: Combine backend and frontend

## Building Images

**Build all services**:
```bash
docker-compose build
```

**Build specific service**:
```bash
docker-compose build app
```

**Build without cache**:
```bash
docker-compose build --no-cache
```

## Running Containers

**Start in background**:
```bash
docker-compose up -d
```

**Start with logs**:
```bash
docker-compose up
```

**Stop containers**:
```bash
docker-compose down
```

**Stop and remove volumes** (⚠️ **WARNING: This deletes all database data**):
```bash
docker-compose down -v
```

## Data Persistence

Supabase local runs via the CLI and stores data in its own Docker volumes.

- **`supabase stop`**: Stops Supabase services but preserves data
- **`supabase db reset`**: Resets local data and reapplies migrations
- **Backups**: Use `supabase db dump` or `pg_dump`

## Container Management

**View containers**: `docker-compose ps`
**View logs**: `docker-compose logs -f app` (backend), `docker-compose logs -f` (all)
**Supabase status**: `supabase status`
**Execute commands**: `docker-compose exec app bash` (backend)

## Production Considerations

For production: use env vars for secrets, configure CORS, set up reverse proxy, use Docker secrets, configure health checks, set resource limits.

See [Production Deployment](production.md) for details.
