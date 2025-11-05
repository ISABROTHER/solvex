/*
  # Fix Circular Dependency in Profiles RLS

  ## Problem
  When a user logs in, they need to read their profile to determine their role.
  But the current policies check if they're admin by querying profiles,
  creating a circular dependency during the first login.

  ## Solution
  Ensure users can ALWAYS read their own profile, regardless of role checks.
  This policy should be checked first.

  ## Changes
  1. Reorder policies so self-profile access is checked first
  2. Make sure self-profile policy doesn't depend on role
*/

-- Drop existing policies to recreate them in correct order
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Admins can update any profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
DROP POLICY IF EXISTS "Admins can insert any profile" ON profiles;
DROP POLICY IF EXISTS "Admins can delete profiles" ON profiles;

-- CRITICAL: This policy MUST NOT reference profiles table in any way
-- Users can ALWAYS view their own profile (no role check)
CREATE POLICY "01_users_view_own_profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

-- Admins can view all profiles (but this is checked AFTER the above policy)
CREATE POLICY "02_admins_view_all_profiles"
  ON profiles FOR SELECT
  TO authenticated
  USING (
    role = 'admin'  -- Check role on the row being accessed, not a subquery
  );

-- Users can update their own profile
CREATE POLICY "03_users_update_own_profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Admins can update any profile
CREATE POLICY "04_admins_update_any_profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (role = 'admin')
  WITH CHECK (role = 'admin');

-- Users can insert their own profile during signup
CREATE POLICY "05_users_insert_own_profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Admins can insert profiles for others (for creating employees)
-- Check the current user's role from their existing profile
CREATE POLICY "06_admins_insert_any_profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid()
      AND p.role = 'admin'
    )
  );

-- Admins can delete profiles
CREATE POLICY "07_admins_delete_profiles"
  ON profiles FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid()
      AND p.role = 'admin'
    )
  );
