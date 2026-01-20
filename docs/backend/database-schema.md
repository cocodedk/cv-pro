# Database Schema

The CV Generator uses Supabase (PostgreSQL) with JSONB payloads for CV and profile data.

## Core Tables

- `user_profiles`: user metadata, roles, and activation status
- `cvs`: CV metadata + `cv_data` JSONB payload
- `cv_profiles`: profile metadata + `profile_data` JSONB payload
- `cover_letters`: generated cover letter records

## Admin Views

- `admin_users`: user list + CV counts (view)
- `daily_stats`: daily activity metrics (view)
- `theme_popularity`: theme usage metrics (view)

## Notes

- `cvs.cv_data` and `cv_profiles.profile_data` follow the shapes in `backend/models.py`.
- Row-level security (RLS) enforces user isolation based on `user_id`.
- See `docs/supabase/multi-user-architecture.md` for full schema + policies.
