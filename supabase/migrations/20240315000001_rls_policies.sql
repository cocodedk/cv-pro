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

alter table user_profiles enable row level security;
alter table cv_profiles enable row level security;
alter table cvs enable row level security;
alter table cover_letters enable row level security;

drop policy if exists user_profiles_read_own on user_profiles;
create policy user_profiles_read_own
  on user_profiles for select
  using (auth.uid() = id or public.is_admin());

drop policy if exists user_profiles_update_own on user_profiles;
create policy user_profiles_update_own
  on user_profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

drop policy if exists user_profiles_admin_update on user_profiles;
create policy user_profiles_admin_update
  on user_profiles for update
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists cv_profiles_user_access on cv_profiles;
create policy cv_profiles_user_access
  on cv_profiles for all
  using (auth.uid() = user_id or public.is_admin())
  with check (auth.uid() = user_id or public.is_admin());

drop policy if exists cvs_user_access on cvs;
create policy cvs_user_access
  on cvs for all
  using (auth.uid() = user_id or public.is_admin())
  with check (auth.uid() = user_id or public.is_admin());

drop policy if exists cover_letters_user_access on cover_letters;
create policy cover_letters_user_access
  on cover_letters for all
  using (auth.uid() = user_id or public.is_admin())
  with check (auth.uid() = user_id or public.is_admin());

create index if not exists idx_cvs_user_id on cvs(user_id);
create index if not exists idx_cvs_updated_at on cvs(updated_at);
create index if not exists idx_cvs_person_name on cvs ((cv_data->'personal_info'->>'name'));
create index if not exists idx_cv_profiles_user_id on cv_profiles(user_id);
create index if not exists idx_cover_letters_user_id on cover_letters(user_id);
