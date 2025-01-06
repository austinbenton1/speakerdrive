-- Drop existing constraints and columns to avoid conflicts
ALTER TABLE profiles
DROP CONSTRAINT IF EXISTS profiles_pkey CASCADE,
DROP CONSTRAINT IF EXISTS profiles_auth_id_key CASCADE,
DROP CONSTRAINT IF EXISTS profiles_user_id_key CASCADE;

-- Recreate profiles table with correct schema
CREATE TABLE IF NOT EXISTS profiles_new (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  email text,
  display_name text,
  avatar_url text,
  user_type text DEFAULT 'Client',
  user_role text DEFAULT 'Owner',
  services text[],
  industries text[],
  quick_start_guide_tip boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Copy data if old table exists
INSERT INTO profiles_new (
  id, user_id, email, display_name, avatar_url, user_type, user_role, 
  services, industries, quick_start_guide_tip, created_at, updated_at
)
SELECT 
  COALESCE(id, uuid_generate_v4()),
  COALESCE(user_id, auth.uid()),
  email,
  display_name,
  avatar_url,
  user_type,
  user_role,
  services,
  industries,
  quick_start_guide_tip,
  COALESCE(created_at, now()),
  COALESCE(updated_at, now())
FROM profiles
ON CONFLICT DO NOTHING;

-- Drop old table and rename new one
DROP TABLE IF EXISTS profiles;
ALTER TABLE profiles_new RENAME TO profiles;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_user_type ON profiles(user_type);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view own profile"
ON profiles FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can update own profile"
ON profiles FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile"
ON profiles FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Add updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE profiles;