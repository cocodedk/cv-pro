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
