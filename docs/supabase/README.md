# Supabase Documentation

This folder documents the Supabase (PostgreSQL) setup and the multi-user platform architecture.

## Current State
- Backend: FastAPI with Supabase-only data access
- Frontend: React app calling `/api/*` via axios with Supabase tokens
- Auth: Supabase Auth (backend validates bearer tokens)
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
5. Migrate existing data and cut over

## Non-goals (MVP)
- Real-time subscriptions
- Fully normalized analytics schema
- Storage migration for generated files

## Status
- Documentation: up to date for Supabase-only workflows
- Implementation: phases 01-06 complete (schema, auth, admin UI)
- Remaining: phase 07 data migration + cutover
