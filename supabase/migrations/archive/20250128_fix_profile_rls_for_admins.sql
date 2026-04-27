-- Fix RLS policies to allow admins to see all profiles
-- This is much better than using service role client

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "profiles_select_own" ON profiles;
DROP POLICY IF EXISTS "profiles_select_admin_all" ON profiles;

-- Create new RLS policies for profiles table
-- 1. Users can see their own profile
CREATE POLICY "profiles_select_own" ON profiles
    FOR SELECT
    USING (auth.uid() = id);

-- 2. Admins can see all profiles
CREATE POLICY "profiles_select_admin_all" ON profiles
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM profiles admin_profile 
            WHERE admin_profile.id = auth.uid() 
            AND admin_profile.role = 'admin'
        )
    );

-- 3. Users can update their own profile
CREATE POLICY "profiles_update_own" ON profiles
    FOR UPDATE
    USING (auth.uid() = id);

-- 4. Admins can update any profile (for user management)
CREATE POLICY "profiles_update_admin_all" ON profiles
    FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM profiles admin_profile 
            WHERE admin_profile.id = auth.uid() 
            AND admin_profile.role = 'admin'
        )
    );

-- Make sure RLS is enabled
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;