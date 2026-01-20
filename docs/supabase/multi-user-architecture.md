# Multi-User Architecture

## Overview
The goal is to move to a multi-user platform with Supabase Auth and PostgreSQL. The backend remains the API gateway and scopes all data to the authenticated `user_id`.

## Schema (MVP)
```sql
create extension if not exists "pgcrypto";

create table user_profiles (
    id uuid primary key references auth.users(id) on delete cascade,
    email text unique,
    full_name text,
    avatar_url text,
    role text not null default 'user' check (role in ('user', 'admin')),
    is_active boolean not null default true,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

create table cv_profiles (
    id uuid primary key default gen_random_uuid(),
    user_id uuid not null references auth.users(id) on delete cascade,
    profile_data jsonb not null,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

create table cvs (
    id uuid primary key default gen_random_uuid(),
    user_id uuid not null references auth.users(id) on delete cascade,
    theme text not null default 'classic',
    layout text not null default 'classic-two-column',
    target_company text,
    target_role text,
    filename text,
    cv_data jsonb not null,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

create table cover_letters (
    id uuid primary key default gen_random_uuid(),
    user_id uuid not null references auth.users(id) on delete cascade,
    profile_id uuid references cv_profiles(id) on delete set null,
    cv_id uuid references cvs(id) on delete set null,
    job_description text not null,
    company_name text not null,
    hiring_manager_name text,
    company_address text,
    tone text not null default 'professional',
    cover_letter_html text not null,
    cover_letter_text text not null,
    highlights_used jsonb not null default '[]'::jsonb,
    selected_experiences jsonb not null default '[]'::jsonb,
    selected_skills jsonb not null default '[]'::jsonb,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

create or replace function set_updated_at()
returns trigger as $$
begin
    new.updated_at = now();
    return new;
end;
$$ language plpgsql;

create trigger set_user_profiles_updated_at
before update on user_profiles
for each row execute function set_updated_at();

create trigger set_cv_profiles_updated_at
before update on cv_profiles
for each row execute function set_updated_at();

create trigger set_cvs_updated_at
before update on cvs
for each row execute function set_updated_at();

create trigger set_cover_letters_updated_at
before update on cover_letters
for each row execute function set_updated_at();

create or replace function public.handle_new_user()
returns trigger as $$
begin
    insert into public.user_profiles (id, email, full_name)
    values (new.id, new.email, new.raw_user_meta_data->>'full_name');
    return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_user();
```

## JSON Shapes

`cv_data` and `profile_data` follow the existing API models:
```json
{
  "personal_info": {
    "name": "Jane Doe",
    "title": "Software Engineer",
    "email": "jane@example.com",
    "phone": "+1 555 000 0000",
    "address": {
      "street": "123 Main St",
      "city": "New York",
      "state": "NY",
      "zip": "10001",
      "country": "USA"
    },
    "linkedin": "https://linkedin.com/in/janedoe",
    "github": "https://github.com/janedoe",
    "website": "https://janedoe.dev",
    "summary": "Short summary",
    "photo": "data-uri-or-storage-path"
  },
  "experience": [
    {
      "title": "Senior Engineer",
      "company": "Example Co",
      "start_date": "2021-01",
      "end_date": "Present",
      "description": "Short HTML-supported description",
      "location": "Remote",
      "projects": [
        {
          "name": "Project X",
          "description": "Project description",
          "url": "https://example.com",
          "technologies": ["Python", "React"],
          "highlights": ["Did the thing", "Improved results"]
        }
      ]
    }
  ],
  "education": [
    {
      "degree": "BSc Computer Science",
      "institution": "University",
      "year": "2019",
      "field": "CS",
      "gpa": "3.8"
    }
  ],
  "skills": [
    {"name": "Python", "category": "Programming", "level": "Expert"}
  ]
}
```

## RLS Policies

Helper function:
```sql
create or replace function public.is_admin()
returns boolean
language sql
stable
as $$
  select exists (
    select 1 from public.user_profiles
    where id = auth.uid()
      and role = 'admin'
      and is_active = true
  );
$$;
```

Policies:
```sql
alter table user_profiles enable row level security;
alter table cv_profiles enable row level security;
alter table cvs enable row level security;
alter table cover_letters enable row level security;

create policy "user_profiles_read_own"
  on user_profiles for select
  using (auth.uid() = id or public.is_admin());

create policy "user_profiles_update_own"
  on user_profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

create policy "user_profiles_admin_update"
  on user_profiles for update
  using (public.is_admin())
  with check (public.is_admin());

create policy "cv_profiles_user_access"
  on cv_profiles for all
  using (auth.uid() = user_id or public.is_admin())
  with check (auth.uid() = user_id or public.is_admin());

create policy "cvs_user_access"
  on cvs for all
  using (auth.uid() = user_id or public.is_admin())
  with check (auth.uid() = user_id or public.is_admin());

create policy "cover_letters_user_access"
  on cover_letters for all
  using (auth.uid() = user_id or public.is_admin())
  with check (auth.uid() = user_id or public.is_admin());
```

## Indexes
```sql
create index idx_cvs_user_id on cvs(user_id);
create index idx_cvs_updated_at on cvs(updated_at);
create index idx_cvs_person_name on cvs ((cv_data->'personal_info'->>'name'));
create index idx_cv_profiles_user_id on cv_profiles(user_id);
create index idx_cover_letters_user_id on cover_letters(user_id);
```

## Notes
- If the backend uses the service role key, RLS is bypassed. Keep RLS anyway for defense-in-depth and direct client use.
- `user_profiles` is separate from `cv_profiles` to avoid name collisions with the existing API's `profile` concept.
