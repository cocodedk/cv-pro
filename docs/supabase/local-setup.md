# Local Supabase Setup

## Prerequisites
- Docker + Docker Compose
- Supabase CLI: Install locally in the project with `npm install supabase --save-dev` and run via `npx supabase`, or for macOS/Linux use Homebrew: `brew install supabase/tap/supabase`

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

Copy `.env.supabase.example` to `.env` and replace placeholders with values from `supabase start`.

Backend running locally (no Docker):
```env
SUPABASE_URL=http://localhost:54321
SUPABASE_ANON_KEY=your-local-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-local-service-role-key
# Optional fallback for local scripts
SUPABASE_DEFAULT_USER_ID=your-test-user-id
```

Backend running in Docker (default `npm run dev:full`):
```env
SUPABASE_URL=http://host.docker.internal:54321
SUPABASE_ANON_KEY=your-local-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-local-service-role-key
# Optional fallback for local scripts
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

Frontend running locally (Vite):
```env
VITE_API_BASE_URL=http://localhost:8000
VITE_SUPABASE_URL=http://localhost:54321
VITE_SUPABASE_ANON_KEY=your-local-anon-key
VITE_AUTH_ENABLED=true
```

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
- `SUPABASE_DEFAULT_USER_ID` is optional for local scripts; normal requests use auth tokens.
