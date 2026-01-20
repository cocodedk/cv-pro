create extension if not exists "pgcrypto";

create table if not exists user_profiles (
    id uuid primary key references auth.users(id) on delete cascade,
    email text unique,
    full_name text,
    avatar_url text,
    role text not null default 'user' check (role in ('user', 'admin')),
    is_active boolean not null default true,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

create table if not exists cv_profiles (
    id uuid primary key default gen_random_uuid(),
    user_id uuid not null references auth.users(id) on delete cascade,
    profile_data jsonb not null,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

create table if not exists cvs (
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

create table if not exists cover_letters (
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

drop trigger if exists set_user_profiles_updated_at on user_profiles;
create trigger set_user_profiles_updated_at
before update on user_profiles
for each row execute function set_updated_at();

drop trigger if exists set_cv_profiles_updated_at on cv_profiles;
create trigger set_cv_profiles_updated_at
before update on cv_profiles
for each row execute function set_updated_at();

drop trigger if exists set_cvs_updated_at on cvs;
create trigger set_cvs_updated_at
before update on cvs
for each row execute function set_updated_at();

drop trigger if exists set_cover_letters_updated_at on cover_letters;
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

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_user();
