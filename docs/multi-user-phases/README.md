# Multi-User Delivery Phases

These phases are small, independent milestones that lead to a multi-user app with an admin panel.

1. [Phase 01 - Project setup](phase-01-project-setup.md)
2. [Phase 02 - Schema and RLS](phase-02-schema-and-rls.md)
3. [Phase 03 - Backend data access](phase-03-backend-data-access.md)
4. [Phase 04 - Backend auth and user context](phase-04-backend-auth.md)
5. [Phase 05 - Frontend auth and session handling](phase-05-frontend-auth.md)
6. [Phase 06 - Admin panel](phase-06-admin-panel.md)
7. [Phase 07 - Data migration and cutover](phase-07-migration-and-cutover.md)

Notes:
- Phases assume the Supabase design docs in `docs/supabase`.

## Progress Tracker

Status legend: ✅ Complete | 🟡 In progress | ⚪ Not started

| Phase | Status | Notes |
| --- | --- | --- |
| Phase 01 - Project setup | ✅ Complete | Supabase env template + health check instructions added. |
| Phase 02 - Schema and RLS | ✅ Complete | Schema/RLS migrations and admin seed template in place. |
| Phase 03 - Backend data access | ✅ Complete | Supabase CRUD/search wired with user scoping. |
| Phase 04 - Backend auth and user context | ✅ Complete | Auth dependencies + route guards + admin guard in place. |
| Phase 05 - Frontend auth and session handling | ✅ Complete | Supabase auth UI + tokenized API requests + route guards. |
| Phase 06 - Admin panel | ✅ Complete | Admin views migration + endpoints + UI implemented. |
| Phase 07 - Data migration and cutover | ⚪ Not started | Legacy data migration not executed. |
