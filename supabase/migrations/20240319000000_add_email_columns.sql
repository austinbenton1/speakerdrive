-- Add email provider and setup columns to profiles table
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS email_provider VARCHAR(50),
ADD COLUMN IF NOT EXISTS email_setup_completed BOOLEAN DEFAULT FALSE;