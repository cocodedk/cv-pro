# Phase 03 - Backend data access

Goal: make the Supabase data layer the default backend implementation.

Steps:
1. Confirm Supabase client setup in `backend/database/supabase/client.py` reads env vars correctly.
2. Implement or complete Supabase CRUD and search in `backend/database/supabase/`.
3. Enforce `user_id` scoping with `apply_user_scope` and `require_user_id` for all queries.
4. Ensure `backend/database/queries/__init__.py` exports Supabase queries.
5. Add tests for Supabase query paths (mocked or integration).

Exit criteria:
- Supabase queries execute without errors.
- CRUD + list/search work for a single user in dev.
