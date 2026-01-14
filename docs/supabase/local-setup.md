# Local Supabase Setup

## Prerequisites
- Docker + Docker Compose
- Supabase CLI: `npm install -g supabase`

## One-time Initialization
1. Initialize Supabase in the repo root:
   ```bash
   supabase init
   ```
2. Add migrations in `supabase/migrations/` (see `multi-user-architecture.md`).
3. Optional: add seed data in `supabase/seed.sql`.

## Start Local Supabase
```bash
supabase start
```

The CLI prints the local URLs and keys.

## Local Endpoints
- API: `http://localhost:54321`
- Studio: `http://localhost:54323`
- Database: `postgresql://postgres:postgres@localhost:54322/postgres`

## Environment Variables

Backend running locally (no Docker):
```env
SUPABASE_URL=http://localhost:54321
SUPABASE_ANON_KEY=your-local-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-local-service-role-key
DATABASE_PROVIDER=supabase
SUPABASE_DEFAULT_USER_ID=your-test-user-id
```

Backend running in Docker (default `npm run dev:full`):
```env
SUPABASE_URL=http://host.docker.internal:54321
SUPABASE_ANON_KEY=your-local-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-local-service-role-key
DATABASE_PROVIDER=supabase
SUPABASE_DEFAULT_USER_ID=your-test-user-id
```

Add this to `docker-compose.yml` for Linux:
```yaml
services:
  app:
    extra_hosts:
      - "host.docker.internal:host-gateway"
```

On macOS/Windows, `host.docker.internal` usually works without `extra_hosts`.

## Migrations
```bash
# Reset database and apply migrations
supabase db reset

# Push current migrations (for local or staging)
supabase db push
```

## Type Generation (Frontend)
```bash
supabase gen types typescript --local > frontend/src/types/supabase.ts
```

## Stop Services
```bash
supabase stop
```

## Notes
- Keep the service role key server-only.
- If ports 54321-54323 are in use, update `supabase/config.toml`.
- `SUPABASE_DEFAULT_USER_ID` is a temporary fallback until auth is wired; use a user id from Supabase Auth.
