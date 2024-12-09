-- Add SMTP host and port columns to profiles table
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS smtp_host VARCHAR(255),
ADD COLUMN IF NOT EXISTS smtp_port VARCHAR(10);

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_profiles_smtp_host ON profiles(smtp_host);