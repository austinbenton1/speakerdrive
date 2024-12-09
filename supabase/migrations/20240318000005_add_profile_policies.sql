-- First, ensure RLS is enabled
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Remove any existing policies to avoid conflicts
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Allow profile creation during signup" ON profiles;

-- 1. Policies for regular users (self-management)
-- Allow users to view their own profile
CREATE POLICY "Users can view own profile"
    ON profiles FOR SELECT
    USING (auth.uid() = auth_id);

-- Allow users to update their own profile
CREATE POLICY "Users can update own profile"
    ON profiles FOR UPDATE
    USING (auth.uid() = auth_id)
    WITH CHECK (
        auth.uid() = auth_id
        -- Prevent changing critical fields
        AND auth_id = OLD.auth_id
        AND email = OLD.email
        AND user_type = OLD.user_type
    );

-- Allow new user signup
CREATE POLICY "Allow profile creation during signup"
    ON profiles FOR INSERT
    WITH CHECK (
        -- New users can only insert their own profile
        auth.uid() = auth_id
        -- Ensure required fields
        AND email IS NOT NULL
        AND password IS NOT NULL
        -- Default to Client role during signup
        AND (user_type = 'Client' OR user_type IS NULL)
        AND (user_role = 'Owner' OR user_role IS NULL)
    );

-- 2. Policies for Admin users
-- Allow admins to view all profiles
CREATE POLICY "Admins can view all profiles"
    ON profiles FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.auth_id = auth.uid()
            AND profiles.user_type = 'Admin'
        )
    );

-- Allow admins to create new profiles
CREATE POLICY "Admins can create profiles"
    ON profiles FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.auth_id = auth.uid()
            AND profiles.user_type = 'Admin'
        )
    );

-- Allow admins to update any profile
CREATE POLICY "Admins can update profiles"
    ON profiles FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.auth_id = auth.uid()
            AND profiles.user_type = 'Admin'
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.auth_id = auth.uid()
            AND profiles.user_type = 'Admin'
        )
    );

-- Allow admins to delete profiles
CREATE POLICY "Admins can delete profiles"
    ON profiles FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.auth_id = auth.uid()
            AND profiles.user_type = 'Admin'
        )
    );

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_profiles_auth_id ON profiles(auth_id);
CREATE INDEX IF NOT EXISTS idx_profiles_user_type ON profiles(user_type);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);