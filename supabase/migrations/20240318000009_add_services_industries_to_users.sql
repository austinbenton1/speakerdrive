-- Add services and industries columns to users table
ALTER TABLE users 
  ADD COLUMN IF NOT EXISTS services JSONB,
  ADD COLUMN IF NOT EXISTS industries JSONB,
  ADD COLUMN IF NOT EXISTS email_setup_completed BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS email_provider VARCHAR(50);