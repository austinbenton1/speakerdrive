-- Add display_name column to profiles table if it doesn't exist
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS display_name TEXT;

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_profiles_display_name ON profiles(display_name);