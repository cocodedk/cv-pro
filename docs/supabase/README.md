# Supabase Documentation

This folder defines the migration from Neo4j to Supabase (PostgreSQL) and the work to turn CV Pro into a multi-user platform.

## Current State
- Backend: FastAPI with Neo4j queries under `backend/database/queries`
- Frontend: React app calling `/api/*` via axios
- Auth: none
- File storage: local filesystem (`backend/output`, `frontend/public`)

## Target State (MVP)
- Supabase Auth for sign-in/out and user management
- PostgreSQL for CVs, profiles, and cover letters
- Backend remains the API gateway; frontend attaches Supabase access tokens to `/api/*`
- User isolation via `user_id` columns and RLS policies
- File generation remains local for now; move to Supabase Storage later

## Docs Map
- Local setup: `local-setup.md`
- Production setup: `production-setup.md`
- Environment switching: `environment-switching.md`
- Migration guide: `migration-guide.md`
- Multi-user architecture: `multi-user-architecture.md`
- Auth integration: `auth-integration.md`
- User management: `user-management.md`
- Admin features: `admin-features.md`

## Implementation Order (MVP)
1. Create Supabase schema and migrations
2. Add Supabase client + data access layer in the backend
3. Add auth middleware and protect API routes
4. Add frontend auth flow + attach access tokens to axios
5. Migrate existing Neo4j data
6. Remove Neo4j infrastructure and update dev scripts

## Non-goals (MVP)
- Real-time subscriptions
- Fully normalized analytics schema
- Storage migration for generated files

## Status
- Planning: complete (see `docs/database/supabase-migration-plan.md`)
- Documentation: updated and ready for implementation
- Implementation: not started
