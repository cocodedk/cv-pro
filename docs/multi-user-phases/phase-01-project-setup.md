# Phase 01 - Project setup

Goal: make the Supabase project and envs ready for development.

Prereqs:
- A Supabase project (local or hosted).

Steps:
1. Decide local vs hosted and follow `docs/supabase/local-setup.md` or `docs/supabase/production-setup.md`.
2. Add backend env vars: `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `SUPABASE_JWT_SECRET`, `DATABASE_PROVIDER=supabase`.
3. Add frontend env vars: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `VITE_API_BASE_URL`.
4. Verify the backend can reach Supabase (health check or simple client call).

Exit criteria:
- Env vars exist for backend and frontend.
- Supabase project is reachable from the dev environment.
