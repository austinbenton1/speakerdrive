-- Add services and industries columns to profiles table
ALTER TABLE profiles 
  ADD COLUMN IF NOT EXISTS services JSONB,
  ADD COLUMN IF NOT EXISTS industries JSONB;