-- Add Admin CRUD policies for companies table
CREATE POLICY "Admins can insert companies"
    ON companies FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM users
            WHERE users.email = auth.uid()::text
            AND users.user_type = 'Admin'
        )
    );

CREATE POLICY "Admins can update companies"
    ON companies FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM users
            WHERE users.email = auth.uid()::text
            AND users.user_type = 'Admin'
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM users
            WHERE users.email = auth.uid()::text
            AND users.user_type = 'Admin'
        )
    );

CREATE POLICY "Admins can delete companies"
    ON companies FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM users
            WHERE users.email = auth.uid()::text
            AND users.user_type = 'Admin'
        )
    );

-- Add Admin CRUD policies for users table
CREATE POLICY "Admins can insert users"
    ON users FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM users
            WHERE users.email = auth.uid()::text
            AND users.user_type = 'Admin'
        )
    );

CREATE POLICY "Admins can update users"
    ON users FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM users
            WHERE users.email = auth.uid()::text
            AND users.user_type = 'Admin'
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM users
            WHERE users.email = auth.uid()::text
            AND users.user_type = 'Admin'
        )
    );

CREATE POLICY "Admins can delete users"
    ON users FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM users
            WHERE users.email = auth.uid()::text
            AND users.user_type = 'Admin'
        )
    );

-- Add Admin CRUD policies for password_reset_tokens table
CREATE POLICY "Admins can manage password reset tokens"
    ON password_reset_tokens FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM users
            WHERE users.email = auth.uid()::text
            AND users.user_type = 'Admin'
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM users
            WHERE users.email = auth.uid()::text
            AND users.user_type = 'Admin'
        )
    );