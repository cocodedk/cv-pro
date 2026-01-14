# Supabase Documentation

Supabase migration documentation for replacing Neo4j with PostgreSQL.

## Overview

This migration moves from Neo4j graph database to Supabase (PostgreSQL) for improved performance, maintainability, and feature set.

## Documents

- **[Local Setup](local-setup.md)** - Running Supabase locally for development
- **[Production Setup](production-setup.md)** - Production Supabase configuration
- **[Environment Switching](environment-switching.md)** - Intelligent dev/prod environment detection
- **[Migration Guide](migration-guide.md)** - Neo4j to Supabase migration details

## Key Benefits

- **Better Performance**: SQL queries for typical CRUD operations
- **Easier Scaling**: PostgreSQL horizontal scaling
- **Rich Features**: Authentication, real-time, file storage
- **Type Safety**: Generated TypeScript types
- **Developer Experience**: Standard SQL and familiar patterns

## Migration Status

- ✅ **Planning**: Complete (see `docs/database/supabase-migration-plan.md`)
- ⏳ **Implementation**: Ready to start
- 🔄 **Testing**: Not started
- 🚀 **Production**: Not deployed

## Quick Start

### Development
```bash
supabase start  # Start local Supabase
npm run dev:full  # Start app with auto-detection
```

### Production
```bash
# Set production environment variables
export SUPABASE_URL=https://your-project.supabase.co
export SUPABASE_ANON_KEY=your-key
npm run build && npm start
```

## Architecture

### Current
```
App → Neo4j (Graph DB)
```

### Future
```
App → Supabase (PostgreSQL + Auth + Storage + Edge Functions)
```

See [Migration Guide](migration-guide.md) for detailed code changes.
