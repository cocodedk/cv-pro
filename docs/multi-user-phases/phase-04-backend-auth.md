# Phase 04 - Backend auth and user context

Goal: authenticate requests and propagate `user_id` to the data layer.

Steps:
1. Add auth dependencies from `docs/supabase/auth-integration.md` to validate bearer tokens.
2. Protect all user data routes with `get_current_user`.
3. Wire `user_id` into query calls via `get_user_id` or request context.
4. Add admin guard using `get_current_admin` for admin endpoints.
5. Add auth tests for missing token, invalid token, and admin access.

Exit criteria:
- Requests without a token return 401.
- Authenticated users only access their own data.
- Admin-only endpoints are enforced.
