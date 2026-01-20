# Legacy Data to Supabase Migration

## Goal
Migrate legacy data into Supabase/PostgreSQL while keeping the API and data shape stable.

## Data Model Mapping (MVP)

Legacy records map to PostgreSQL as follows:
- `CV` + `Person` + `Experience` + `Education` + `Skill` + `Project` -> `cvs` row with `cv_data` JSONB
- `Profile` + related nodes -> `cv_profiles` row with `profile_data` JSONB
- `CoverLetter` -> `cover_letters` row (columns mirror the model)
- Generated files -> local filesystem (future: Supabase Storage)

`cv_data` and `profile_data` follow the same structure as:
- `backend/models.py` (`CVData`, `ProfileData`)
- `backend/models_cover_letter.py` (`CoverLetterData` for cover letters)

## Backend Changes (High Level)
- Supabase client helpers and queries are now the only backend data layer
- Auth dependencies (`get_current_user`, `get_current_admin`) enforce user scoping

## Migration Steps

1. Build schema
   - Apply SQL from `multi-user-architecture.md` via Supabase migrations.

2. Export from legacy data store
   - Use a legacy checkout that still contains export helpers or export directly from the old database.
   - Export CVs, profiles, and cover letters to JSON with `user_id` set to the initial admin user.

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
   - Compare counts between the legacy store and Supabase.

5. Cutover
   - Deploy with Supabase-only configuration.
   - Remove any remaining legacy infra references in scripts and docs.
