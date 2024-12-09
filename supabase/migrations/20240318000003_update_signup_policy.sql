-- Update the signup policy to allow setting online status and last_login
CREATE OR REPLACE POLICY "Allow signup"
    ON users FOR INSERT
    WITH CHECK (
        -- New users can only insert themselves
        auth.uid()::text = email
        -- Can only create non-admin users through signup
        AND user_type = 'Client'
        -- Ensure required fields are provided
        AND email IS NOT NULL
        AND password IS NOT NULL
        AND user_role = 'Owner'
        AND status = 'Active'
        -- Allow setting online status and last_login during signup
        AND online IN (0, 1)
        AND last_login IS NOT NULL
    );