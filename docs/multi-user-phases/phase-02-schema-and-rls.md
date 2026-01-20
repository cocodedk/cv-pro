# Phase 02 - Schema and RLS

Goal: create the multi-user schema and enforce row-level security.

Steps:
1. Add migrations based on `docs/supabase/multi-user-architecture.md` into `supabase/migrations/`.
2. Apply migrations with the Supabase CLI.
3. Enable RLS and apply policies from `docs/supabase/multi-user-architecture.md`.
4. Update `supabase/seed.sql` with your admin user's email and run it after the auth user exists (local: `supabase db reset`).

Exit criteria:
- Tables exist with `user_id` columns and update triggers.
- RLS is enabled on all user data tables.
- An admin user is available for admin panel access.
