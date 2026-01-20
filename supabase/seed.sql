-- Optional seed actions after creating your first user in Supabase Auth.
-- Replace the email below with your admin user's email.
insert into public.user_profiles (id, email, role, is_active)
select id, email, 'admin', true
from auth.users
where email = 'bb@cocode.dk'
on conflict (id) do update
set role = 'admin',
    is_active = true;
