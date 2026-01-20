# Admin Features

Administrative capabilities for managing users, analytics, and system configuration.

## Roles and Access Control
- Roles live in `user_profiles.role` (`user`, `admin`).
- Protect all admin routes with `get_current_admin`.

## User Management

Admin view:
```sql
create or replace view admin_users as
select
    up.id,
    up.email,
    up.full_name,
    up.role,
    up.is_active,
    up.created_at,
    count(c.id) as cv_count,
    max(c.updated_at) as last_cv_update
from user_profiles up
left join cvs c on c.user_id = up.id
group by up.id, up.email, up.full_name, up.role, up.is_active, up.created_at;
```

Admin API endpoints (examples):
```python
@app.get("/admin/users")
def get_users(current_user=Depends(get_current_admin)):
    return supabase.table('admin_users').select('*').execute()

@app.put("/admin/users/{user_id}/role")
def update_user_role(user_id: str, role: str, current_user=Depends(get_current_admin)):
    return supabase.table('user_profiles').update({'role': role}).eq('id', user_id).execute()

@app.put("/admin/users/{user_id}/deactivate")
def deactivate_user(user_id: str, current_user=Depends(get_current_admin)):
    return supabase.table('user_profiles').update({'is_active': False}).eq('id', user_id).execute()
```

## Analytics

Daily stats and theme usage:
```sql
create or replace view daily_stats as
select
    date(created_at) as date,
    count(distinct user_id) as active_users,
    count(*) as cvs_created,
    count(case when theme is not null then 1 end) as themed_cvs
from cvs
where created_at >= current_date - interval '30 days'
group by date(created_at)
order by date desc;

create or replace view theme_popularity as
select
    theme,
    count(*) as usage_count,
    count(distinct user_id) as unique_users
from cvs
where theme is not null
group by theme
order by usage_count desc;
```

## Moderation (Optional)

```sql
create table cv_moderation (
    id uuid primary key default gen_random_uuid(),
    cv_id uuid references cvs(id),
    moderator_id uuid references user_profiles(id),
    status text default 'pending' check (status in ('pending', 'approved', 'rejected')),
    feedback text,
    moderated_at timestamptz default now()
);
```

## System Configuration

```sql
create table system_config (
    key text primary key,
    value jsonb,
    updated_by uuid references user_profiles(id),
    updated_at timestamptz default now()
);
```

## Audit Logging

```sql
create table audit_log (
    id uuid primary key default gen_random_uuid(),
    user_id uuid references user_profiles(id),
    action text not null,
    table_name text,
    record_id uuid,
    old_values jsonb,
    new_values jsonb,
    ip_address inet,
    user_agent text,
    created_at timestamptz default now()
);
```

## Notes
- Admin endpoints must use the service role key or verified admin tokens.
- Avoid exposing admin views directly to the client without backend validation.
