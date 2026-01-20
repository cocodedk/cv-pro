-- Migration: Add searchable metadata columns for GDPR-compliant search
-- Date: 2026-01-20
-- Purpose: Enable search functionality while keeping personal data encrypted

-- Add searchable metadata columns to cvs table
ALTER TABLE cvs ADD COLUMN IF NOT EXISTS search_person_name TEXT;
ALTER TABLE cvs ADD COLUMN IF NOT EXISTS search_target_role TEXT;
ALTER TABLE cvs ADD COLUMN IF NOT EXISTS search_location TEXT;
ALTER TABLE cvs ADD COLUMN IF NOT EXISTS search_company_names TEXT[];
ALTER TABLE cvs ADD COLUMN IF NOT EXISTS search_skills TEXT[];
ALTER TABLE cvs ADD COLUMN IF NOT EXISTS search_last_updated timestamptz;

-- Create indexes for efficient searching
CREATE INDEX IF NOT EXISTS idx_search_person_name ON cvs(search_person_name);
CREATE INDEX IF NOT EXISTS idx_search_target_role ON cvs(search_target_role);
CREATE INDEX IF NOT EXISTS idx_search_location ON cvs(search_location);
CREATE INDEX IF NOT EXISTS idx_search_company_names ON cvs USING GIN(search_company_names);
CREATE INDEX IF NOT EXISTS idx_search_skills ON cvs USING GIN(search_skills);
CREATE INDEX IF NOT EXISTS idx_search_last_updated ON cvs(search_last_updated);

-- Add comments for documentation
COMMENT ON COLUMN cvs.search_person_name IS 'Searchable person name (not encrypted, GDPR-compliant)';
COMMENT ON COLUMN cvs.search_target_role IS 'Searchable target role (not encrypted)';
COMMENT ON COLUMN cvs.search_location IS 'Searchable location preference (not encrypted)';
COMMENT ON COLUMN cvs.search_company_names IS 'Searchable company names from experience (aggregated, not encrypted)';
COMMENT ON COLUMN cvs.search_skills IS 'Searchable skills list (not encrypted)';
COMMENT ON COLUMN cvs.search_last_updated IS 'Last updated timestamp for search results ordering';

-- Update existing RLS policies to include search metadata access
-- Note: These policies already exist from previous migration, just documenting the intent
