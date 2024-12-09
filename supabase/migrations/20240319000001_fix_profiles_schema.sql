-- Drop existing columns if they exist
ALTER TABLE profiles 
DROP COLUMN IF EXISTS email_provider,
DROP COLUMN IF EXISTS email_setup_completed;

-- Add columns with correct schema
ALTER TABLE profiles 
ADD COLUMN email_provider VARCHAR(50),
ADD COLUMN email_setup_completed BOOLEAN DEFAULT FALSE;

-- Update existing rows
UPDATE profiles 
SET email_setup_completed = FALSE 
WHERE email_setup_completed IS NULL;