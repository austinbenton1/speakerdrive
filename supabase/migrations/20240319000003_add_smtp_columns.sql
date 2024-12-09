-- Add SMTP-related columns to profiles table
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS smtp_email VARCHAR(255),
ADD COLUMN IF NOT EXISTS smtp_password VARCHAR(255),
ADD COLUMN IF NOT EXISTS is_gmail_smtp BOOLEAN DEFAULT FALSE;

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_profiles_smtp_email ON profiles(smtp_email);
CREATE INDEX IF NOT EXISTS idx_profiles_is_gmail_smtp ON profiles(is_gmail_smtp);