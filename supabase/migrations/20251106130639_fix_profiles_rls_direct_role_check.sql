/*
  # Fix Profiles RLS Policies for Admin Access

  1. Problem
    - Current policies use `auth_is_admin()` which checks JWT claims
    - JWT claims are not populated with the role from profiles table
    - This causes "Failed to load employee data" error for admins
  
  2. Solution
    - Drop old policies that depend on JWT claims
    - Create new policies that check the profiles table directly
    - Use a helper function that queries the profiles table for the current user's role
  
  3. Changes
    - Drop existing policies: `select_all_profiles_admin`, `update_all_profiles_admin`, `delete_profiles_admin`
    - Create new helper function: `current_user_is_admin()`
    - Create new policies with direct database lookup
  
  4. Security
    - Maintains same security model (only admins can see all profiles)
    - More reliable since it checks actual database role, not JWT claim
*/

-- Drop the old JWT-based helper function
DROP FUNCTION IF EXISTS auth_is_admin() CASCADE;
DROP FUNCTION IF EXISTS get_my_claim(text) CASCADE;

-- Create new helper function that checks profiles table directly
CREATE OR REPLACE FUNCTION current_user_is_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid()
    AND role = 'admin'
  );
$$;

-- Drop old admin policies
DROP POLICY IF EXISTS "select_all_profiles_admin" ON profiles;
DROP POLICY IF EXISTS "update_all_profiles_admin" ON profiles;
DROP POLICY IF EXISTS "delete_profiles_admin" ON profiles;

-- Create new admin policies using direct database lookup
CREATE POLICY "Admin can select all profiles"
  ON profiles FOR SELECT
  TO authenticated
  USING (current_user_is_admin());

CREATE POLICY "Admin can update all profiles"
  ON profiles FOR UPDATE
  TO authenticated
  USING (current_user_is_admin())
  WITH CHECK (current_user_is_admin());

CREATE POLICY "Admin can delete profiles"
  ON profiles FOR DELETE
  TO authenticated
  USING (current_user_is_admin());
