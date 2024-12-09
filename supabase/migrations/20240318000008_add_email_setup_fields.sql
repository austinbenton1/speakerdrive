-- Add email setup fields to profiles table
ALTER TABLE profiles 
  ADD COLUMN IF NOT EXISTS email_setup_completed BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS email_provider VARCHAR(50);