-- Final RLS setup for profiles table

-- First, clean up any existing policies
DROP POLICY IF EXISTS "Allow authenticated users to read profiles" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Service role has full access" ON profiles;
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles;
DROP POLICY IF EXISTS "Enable read access for all users" ON profiles;
DROP POLICY IF EXISTS "Enable insert for all users" ON profiles;
DROP POLICY IF EXISTS "Enable update for all users" ON profiles;

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- 1. SELECT Policy: Everyone can read profiles (needed for role checks, user lookups)
CREATE POLICY "Anyone can read profiles" ON profiles
  FOR SELECT
  TO authenticated, anon
  USING (true);

-- 2. INSERT Policy: Only service role and users can insert their own profile
CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- 3. UPDATE Policy: Users can only update their own profile
CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- 4. DELETE Policy: Only admins can delete profiles
CREATE POLICY "Admins can delete profiles" ON profiles
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- 5. Service Role Override: Service role can do anything (for admin operations)
CREATE POLICY "Service role has full access" ON profiles
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Grant proper permissions
GRANT SELECT ON profiles TO anon, authenticated;
GRANT INSERT, UPDATE ON profiles TO authenticated;
GRANT ALL ON profiles TO service_role;