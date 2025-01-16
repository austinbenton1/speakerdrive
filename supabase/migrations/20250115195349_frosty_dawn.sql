@@ .. @@
 -- Create new profiles table with correct schema
 CREATE TABLE profiles (
   id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
-  auth_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
+  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
   email text,
   display_name text,
   avatar_url text,
@@ .. @@
 -- Create RLS policies
 CREATE POLICY "Users can view own profile"
 ON profiles FOR SELECT
-USING (auth.uid() = auth_id);
+USING (auth.uid() = user_id);
 
 CREATE POLICY "Users can update own profile"
 ON profiles FOR UPDATE
-USING (auth.uid() = auth_id)
-WITH CHECK (auth.uid() = auth_id);
+USING (auth.uid() = user_id)
+WITH CHECK (auth.uid() = user_id);
 
 CREATE POLICY "Allow profile creation during signup"
 ON profiles FOR INSERT
-WITH CHECK (auth.uid() = auth_id);
+WITH CHECK (auth.uid() = user_id);
 
 -- Add admin policies
 CREATE POLICY "Admins can view all profiles"
@@ .. @@
   EXISTS (
     SELECT 1 FROM profiles
-    WHERE profiles.auth_id = auth.uid()
+    WHERE profiles.user_id = auth.uid()
     AND profiles.user_type = 'Admin'
   )
 );