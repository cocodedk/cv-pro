# Phase 06 - Admin panel

Goal: enable admin-only user management and basic analytics.

Steps:
1. Add admin views/tables from `docs/supabase/admin-features.md` as migrations.
2. Implement backend admin endpoints for list users, update role, and deactivate users.
3. Add an admin UI page for user management and basic stats.
4. Log or audit admin actions (optional but recommended).

Exit criteria:
- Admin users can manage other users.
- Non-admin users cannot access admin endpoints or UI.
- Basic admin metrics are visible in the admin UI.
