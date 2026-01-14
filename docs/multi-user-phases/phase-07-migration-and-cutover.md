# Phase 07 - Data migration and cutover

Goal: migrate data to Supabase and remove Neo4j dependencies.

Steps:
1. Follow `docs/supabase/migration-guide.md` to export Neo4j data with `user_id` mapping.
2. Import data into Supabase tables and validate counts and samples.
3. Switch production env to `DATABASE_PROVIDER=supabase`.
4. Remove or disable Neo4j infrastructure and update docs/scripts.

Exit criteria:
- Data lives in Supabase and passes basic validation.
- Production runs without Neo4j.
- Documentation reflects the new system.
