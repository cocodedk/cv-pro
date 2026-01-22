-- Add language support to profiles for multi-language profiles
alter table cv_profiles
add column language text not null default 'en';

-- Create unique constraint to ensure one profile per user per language
-- First, we need to handle existing duplicate records (if any)
-- We'll keep the most recent one and delete older duplicates
with ranked_profiles as (
    select ctid,
           row_number() over (
               partition by user_id, language
               order by updated_at desc nulls last, ctid
           ) as rn
    from cv_profiles
)
delete from cv_profiles
where ctid in (
    select ctid from ranked_profiles where rn > 1
);

-- Add unique constraint
alter table cv_profiles
add constraint cv_profiles_user_language_unique unique (user_id, language);

-- Note: Queries filtering by user_id will use the composite unique index on (user_id, language)
