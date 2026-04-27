-- Fix profiles table RLS policies for user creation

-- First, let's see what policies exist
SELECT schemaname, tablename, policyname, cmd, roles, qual, with_check
FROM pg_policies 
WHERE tablename = 'profiles' AND schemaname = 'public';

-- Drop all existing policies on profiles table
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Enable read access for all users" ON profiles;
DROP POLICY IF EXISTS "Enable insert for all users" ON profiles;
DROP POLICY IF EXISTS "Enable update for all users" ON profiles;

-- Create new policies that allow service role to work properly

-- Allow authenticated users to read all profiles (needed for lookups)
CREATE POLICY "Allow authenticated users to read profiles" ON profiles
  FOR SELECT
  TO authenticated
  USING (true);

-- Allow service role to insert profiles (for user creation)
CREATE POLICY "Allow service role to insert profiles" ON profiles
  FOR INSERT
  TO service_role
  WITH CHECK (true);

-- Allow users to update their own profile
CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Allow service role full access (bypass for admin operations)
CREATE POLICY "Service role has full access" ON profiles
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Grant necessary permissions
GRANT SELECT, INSERT, UPDATE ON profiles TO service_role;
GRANT SELECT ON profiles TO authenticated;