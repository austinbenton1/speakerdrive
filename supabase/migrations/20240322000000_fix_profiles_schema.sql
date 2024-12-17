-- Add missing columns to profiles table
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS user_role VARCHAR(50),
ADD COLUMN IF NOT EXISTS services TEXT[],
ADD COLUMN IF NOT EXISTS industries TEXT[];

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_profiles_user_role ON profiles(user_role);

-- Set default values for existing rows
UPDATE profiles 
SET user_role = 'Member' 
WHERE user_role IS NULL;