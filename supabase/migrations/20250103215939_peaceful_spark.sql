-- Drop existing constraints and columns to avoid conflicts
ALTER TABLE profiles
DROP CONSTRAINT IF EXISTS profiles_pkey CASCADE,
DROP CONSTRAINT IF EXISTS profiles_auth_id_key CASCADE;

-- Recreate profiles table with correct schema
ALTER TABLE profiles
DROP COLUMN IF EXISTS id CASCADE,
ADD COLUMN id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
ALTER COLUMN email DROP NOT NULL,
ALTER COLUMN password DROP NOT NULL;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);

-- Update RLS policies
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;

CREATE POLICY "Users can view own profile"
ON profiles FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can update own profile"
ON profiles FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile"
ON profiles FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Add realtime replication
ALTER PUBLICATION supabase_realtime ADD TABLE profiles;