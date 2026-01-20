# Phase 01 - Project setup

Goal: make the Supabase project and envs ready for development.

Prereqs:
- A Supabase project (local or hosted).

Steps:
1. Decide local vs hosted and follow `docs/supabase/local-setup.md` or `docs/supabase/production-setup.md`.
2. Copy `.env.supabase.example` to `.env` and fill in Supabase + frontend values.
3. If the backend runs in Docker, set `SUPABASE_URL=http://host.docker.internal:54321`.
4. Start Supabase and the API (`npm run dev:full` or `supabase start` + backend).
5. Verify `curl http://localhost:8000/api/health` returns `provider=supabase` and `status=healthy`.

Exit criteria:
- Env vars exist for backend and frontend.
- Supabase project is reachable from the dev environment (health check passes).
