#!/bin/bash
set -euo pipefail
cd "$(dirname "$0")/.."

DB_CONTAINER=$(docker ps --filter "name=supabase_db" --format "{{.Names}}" | head -n1)
STORAGE_CONTAINER=$(docker ps --filter "name=supabase_storage" --format "{{.Names}}" | head -n1)

if [ -z "$DB_CONTAINER" ] || [ -z "$STORAGE_CONTAINER" ]; then
  echo "Supabase containers missing. Starting Supabase..."
  npx --yes supabase start
  DB_CONTAINER=$(docker ps --filter "name=supabase_db" --format "{{.Names}}" | head -n1)
  STORAGE_CONTAINER=$(docker ps --filter "name=supabase_storage" --format "{{.Names}}" | head -n1)
fi

if [ -z "$DB_CONTAINER" ] || [ -z "$STORAGE_CONTAINER" ]; then
  echo "Supabase containers still missing; aborting."
  exit 1
fi

echo "Inspecting storage schema owner on ${DB_CONTAINER}..."
docker exec -i "$DB_CONTAINER" psql -U postgres -d postgres -c "SELECT nspname, nspowner::regrole FROM pg_namespace WHERE nspname='storage';"
docker exec -i "$DB_CONTAINER" psql -U postgres -d postgres -c "SELECT rolname, rolsuper FROM pg_roles WHERE rolname IN ('postgres','supabase_admin','supabase_storage_admin');"
docker exec -i "$DB_CONTAINER" psql -U postgres -d postgres -c "SELECT datname FROM pg_database;"
docker exec -i "$DB_CONTAINER" psql -U postgres -d postgres -c "SELECT schemaname, tablename, tableowner FROM pg_tables WHERE tablename='migrations';"
docker exec -i "$DB_CONTAINER" psql -U postgres -d postgres -c "SELECT conname, conrelid::regclass FROM pg_constraint WHERE conname='migrations_name_key';"

echo "Resetting Supabase storage schema on ${DB_CONTAINER}..."
docker exec -i "$DB_CONTAINER" env PGPASSWORD=postgres psql -h 127.0.0.1 -U supabase_storage_admin -d postgres -c "DROP TABLE IF EXISTS storage.migrations CASCADE;"
docker exec -i "$DB_CONTAINER" env PGPASSWORD=postgres psql -h 127.0.0.1 -U supabase_storage_admin -d postgres -c "DROP SCHEMA IF EXISTS storage CASCADE;"

echo "Restarting Supabase services..."
npx --yes supabase start

STORAGE_CONTAINER=$(docker ps -a --filter "name=supabase_storage" --format "{{.Names}}" | head -n1)
if [ -n "$STORAGE_CONTAINER" ]; then
  echo "Storage logs (tail):"
  docker logs "$STORAGE_CONTAINER" --tail 50
  echo "Storage container env (filtered):"
  docker inspect "$STORAGE_CONTAINER" --format '{{range .Config.Env}}{{println .}}{{end}}' | grep -E 'DATABASE_URL|DB_|POSTGRES|STORAGE' || true
fi
