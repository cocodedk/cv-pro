# Neo4j to Supabase Migration

## Goal
Replace Neo4j with Supabase/PostgreSQL while keeping the API and data shape stable.

## Data Model Mapping (MVP)

Neo4j nodes map to PostgreSQL as follows:
- `CV` + `Person` + `Experience` + `Education` + `Skill` + `Project` -> `cvs` row with `cv_data` JSONB
- `Profile` + related nodes -> `cv_profiles` row with `profile_data` JSONB
- `CoverLetter` -> `cover_letters` row (columns mirror the model)
- Generated files -> local filesystem (future: Supabase Storage)

`cv_data` and `profile_data` follow the same structure as:
- `backend/models.py` (`CVData`, `ProfileData`)
- `backend/models_cover_letter.py` (`CoverLetterData` for cover letters)

## Dependency Changes
- Add `supabase` (supabase-py)
- Optional: add `psycopg2-binary` for admin scripts
- Keep `neo4j` until cutover if dual-write is required

## Backend Changes (High Level)
- Replace `backend/database/connection.py` with Supabase client helpers
- Add new query modules under `backend/database/supabase/`
- Update routes to use a provider switch (`DATABASE_PROVIDER`)
- Add auth dependencies (`get_current_user`, `get_current_admin`)

## Migration Steps

1. Build schema
   - Apply SQL from `multi-user-architecture.md` via Supabase migrations.

2. Export from Neo4j
   - Use existing query helpers to fetch CVs, profiles, and cover letters:
     - `backend/database/queries/read.py`
     - `backend/database/queries/profile.py`
     - `backend/database/queries/read/cover_letter_get.py`
   - Export to JSON files with `user_id` set to the initial admin user.

3. Import into Supabase
   - Use the service role key to insert into:
     - `user_profiles`
     - `cv_profiles`
     - `cvs`
     - `cover_letters`

4. Verify
   - Spot-check API responses for:
     - `/api/cv/{id}`
     - `/api/profile`
     - `/api/cover-letters`
   - Compare counts between Neo4j and Supabase.

5. Cutover
   - Set `DATABASE_PROVIDER=supabase` in all environments.
   - Remove Neo4j containers and env vars.

## Rollback
- Keep Neo4j data and env vars during the first release.
- Switch `DATABASE_PROVIDER` back to `neo4j` to roll back.
