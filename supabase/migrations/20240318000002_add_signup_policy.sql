-- Allow new users to insert themselves during signup
CREATE POLICY "Allow signup"
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
    );

-- Allow users to update their own data
CREATE POLICY "Users can update own data"
    ON users FOR UPDATE
    USING (auth.uid()::text = email)
    WITH CHECK (
        -- Cannot change email or user_type through updates
        auth.uid()::text = email
        AND (user_type IS NULL OR user_type = OLD.user_type)
    );

-- Allow users to update their own online status and last_login
CREATE POLICY "Users can update own status"
    ON users FOR UPDATE
    USING (auth.uid()::text = email)
    WITH CHECK (
        auth.uid()::text = email
        AND (
            (online IS NOT NULL AND last_login IS NOT NULL)
            OR
            (online IS NULL AND last_login IS NULL)
        )
    );