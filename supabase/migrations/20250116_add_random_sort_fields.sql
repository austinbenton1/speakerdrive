-- Add random sort fields to profiles table
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS random_lead_sort jsonb,
ADD COLUMN IF NOT EXISTS random_lead_sort_date timestamp with time zone;
