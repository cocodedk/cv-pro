# Production Supabase Setup

## Prerequisites

- Supabase account at https://supabase.com
- Project created in Supabase dashboard

## Configuration

Production Supabase provides:
- **Database**: Managed PostgreSQL
- **API Gateway**: `https://your-project.supabase.co`
- **Studio**: `https://supabase.com/dashboard/project/your-project`
- **Storage**: `https://your-project.supabase.co/storage/v1`
- **Edge Functions**: `https://your-project.supabase.co/functions/v1`

## Environment Variables

```env
# Production configuration
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key-from-dashboard
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

## Security Setup

### Row Level Security (RLS)

Enable RLS on all tables:
```sql
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE cvs ENABLE ROW LEVEL SECURITY;
-- etc for all tables
```

### Policies

Create policies for authenticated users:
```sql
-- Example policy for profiles
CREATE POLICY "Users can view own profile"
ON profiles FOR SELECT
USING (auth.uid() = user_id);
```

## Database Schema

Apply migrations to production:
```bash
# Link project
supabase link --project-ref your-project-ref

# Push schema changes
supabase db push
```

## Migration from Neo4j

Production uses hosted Supabase instead of self-managed Neo4j instance.
