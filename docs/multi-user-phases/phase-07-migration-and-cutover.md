# Phase 07 - Data migration and cutover

Goal: migrate legacy data to Supabase and complete cutover.

Steps:
1. Follow `docs/supabase/migration-guide.md` to export legacy data with `user_id` mapping.
2. Import data into Supabase tables and validate counts and samples.
3. Switch production env to Supabase-only configuration.
4. Remove or disable any remaining legacy infrastructure references.

Exit criteria:
- Data lives in Supabase and passes basic validation.
- Production runs on Supabase only.
- Documentation reflects the new system.
