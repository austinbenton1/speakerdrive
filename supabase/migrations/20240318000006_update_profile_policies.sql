-- First, remove existing policies to avoid conflicts
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Allow profile creation during signup" ON profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Admins can create profiles" ON profiles;
DROP POLICY IF EXISTS "Admins can update profiles" ON profiles;
DROP POLICY IF EXISTS "Admins can delete profiles" ON profiles;

-- 1. Policies for regular users (self-management)
-- Allow users to view their own profile
CREATE POLICY "Users can view own profile"
    ON profiles FOR SELECT
    USING (auth.uid()::uuid = user_id);

-- Allow users to update their own profile
CREATE POLICY "Users can update own profile"
    ON profiles FOR UPDATE
    USING (auth.uid()::uuid = user_id)
    WITH CHECK (
        auth.uid()::uuid = user_id
        -- Prevent changing critical fields
        AND user_id = OLD.user_id
        AND email = OLD.email
        AND user_type = OLD.user_type
    );

-- Allow new user signup
CREATE POLICY "Allow profile creation during signup"
    ON profiles FOR INSERT
    WITH CHECK (
        -- New users can only insert their own profile
        auth.uid()::uuid = user_id
        -- Ensure required fields
        AND email IS NOT NULL
        AND password IS NOT NULL
        -- Default to Client role during signup
        AND user_type = 'Client'
        AND user_role = 'Owner'
    );

-- 2. Policies for Admin users
-- Allow admins to view other users' profiles (not their own)
CREATE POLICY "Admins can view other profiles"
    ON profiles FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.user_id = auth.uid()::uuid
            AND profiles.user_type = 'Admin'
        )
        -- Exclude admin's own profile
        AND user_id != auth.uid()::uuid
    );

-- Allow admins to update other users' profiles (not their own)
CREATE POLICY "Admins can update other profiles"
    ON profiles FOR UPDATE
    USING (
        -- Check if the current user is an admin
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.user_id = auth.uid()::uuid
            AND profiles.user_type = 'Admin'
        )
        -- Prevent updating their own profile through admin privileges
        AND user_id != auth.uid()::uuid
    )
    WITH CHECK (
        -- Verify admin status again in WITH CHECK
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.user_id = auth.uid()::uuid
            AND profiles.user_type = 'Admin'
        )
        -- Prevent updating their own profile
        AND user_id != auth.uid()::uuid
        -- Prevent changing user_id
        AND user_id = OLD.user_id
    );

-- Create indexes for better performance if not already exists
CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_profiles_user_type ON profiles(user_type);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);