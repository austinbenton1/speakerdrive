-- First, drop any existing update policies to avoid conflicts
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Admins can update other profiles" ON profiles;

-- Create policy for users to update their own profile
CREATE POLICY "Users can update own profile"
ON profiles
FOR UPDATE
USING (
  -- User can only update their own profile
  id = auth.uid()
)
WITH CHECK (
  -- Ensure user can only update their own profile
  id = auth.uid()
  -- Allow updating metadata and profile data
  AND (
    services IS NOT NULL 
    OR industries IS NOT NULL 
    OR email_setup_completed IS NOT NULL 
    OR email_provider IS NOT NULL
  )
);

-- Create policy for admins to update all profiles
CREATE POLICY "Admins can update all profiles"
ON profiles
FOR UPDATE
USING (
  -- Check if the current user has Admin role
  EXISTS (
    SELECT 1 
    FROM profiles 
    WHERE id = auth.uid() 
    AND user_role = 'Admin'
  )
)
WITH CHECK (
  -- Verify admin role again in WITH CHECK
  EXISTS (
    SELECT 1 
    FROM profiles 
    WHERE id = auth.uid() 
    AND user_role = 'Admin'
  )
);