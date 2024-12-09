-- Add email provider and setup columns to profiles table
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS email_provider VARCHAR(50),
ADD COLUMN IF NOT EXISTS email_setup_completed BOOLEAN DEFAULT FALSE;

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_profiles_email_provider ON profiles(email_provider);

-- Update existing rows to have default values
UPDATE profiles 
SET email_setup_completed = FALSE 
WHERE email_setup_completed IS NULL;