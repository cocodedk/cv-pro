# Local Supabase Setup

## Prerequisites

- Docker & Docker Compose
- Supabase CLI: `npm install -g supabase`

## Quick Start

```bash
# Initialize Supabase in project
supabase init

# Start local Supabase stack
supabase start

# Access local dashboard
# URL: http://localhost:54323
# API URL: http://localhost:54321
# Anon Key: Available in terminal output
```

## Configuration

Local Supabase runs on:
- **Database**: `postgresql://postgres:postgres@localhost:54322/postgres`
- **API Gateway**: `http://localhost:54321`
- **Studio**: `http://localhost:54323`
- **Storage**: `http://localhost:54321/storage/v1`
- **Edge Functions**: `http://localhost:54321/functions/v1`

## Development Workflow

```bash
# View logs
supabase logs

# Reset database
supabase db reset

# Generate types
supabase gen types typescript --local > types/supabase.ts

# Stop services
supabase stop
```

## Environment Variables

```env
# Local configuration
SUPABASE_URL=http://localhost:54321
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## Migration from Neo4j

Local development uses Docker-based Supabase instead of Neo4j container.