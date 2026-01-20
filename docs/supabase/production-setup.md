# Production Supabase Setup

## Prerequisites
- Supabase account and project created in the dashboard
- Supabase CLI installed and linked to the project

## Project Configuration
1. In the Supabase dashboard:
   - Set `Site URL` and allowed redirect URLs for auth callbacks.
   - Configure email templates and SMTP (optional).
   - Enable OAuth providers (optional).
2. In this repo:
   ```bash
   supabase link --project-ref your-project-ref
   supabase db push
   ```

## Environment Variables (Backend)
```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
SUPABASE_JWT_SECRET=your-jwt-secret-from-dashboard
```

## Environment Variables (Frontend)
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_API_BASE_URL=https://api.yourdomain.com
```

## RLS and Policies
- Enable RLS on all tables.
- Apply policies from `multi-user-architecture.md`.

## Storage (Optional, Later Phase)
Create buckets if you want to store generated files or avatars:
- `cv-files`
- `cv-showcase`
- `avatars`

Add per-user policies for read/write access.

## Operational Notes
- Keep the service role key server-only.
- Rotate keys periodically and store secrets in your deployment system.
- Monitor auth logs and database usage in the Supabase dashboard.
