/*
  # Complete RLS Rebuild - No Recursion

  ## Problem
  Multiple duplicate policies and recursive function calls causing infinite recursion

  ## Solution
  1. Drop EVERY policy on all affected tables
  2. Drop the recursive get_my_role() function
  3. Create ONE simple helper function that's recursion-safe
  4. Create minimal, clean policies

  ## New Policy Structure
  - ONE admin policy per operation type
  - ONE user policy per operation type
  - No duplicates, no recursion
*/

-- ==========================================
-- STEP 1: DROP ALL POLICIES
-- ==========================================

-- Profiles - drop all
DROP POLICY IF EXISTS "Admins can delete profiles" ON profiles;
DROP POLICY IF EXISTS "Admins can insert any profile" ON profiles;
DROP POLICY IF EXISTS "Admins can manage all profiles" ON profiles;
DROP POLICY IF EXISTS "Admins can update any profile" ON profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Authenticated users can read their own profile" ON profiles;
DROP POLICY IF EXISTS "Enable DELETE for admins" ON profiles;
DROP POLICY IF EXISTS "Enable INSERT for users based on role" ON profiles;
DROP POLICY IF EXISTS "Enable SELECT for users based on role" ON profiles;
DROP POLICY IF EXISTS "Enable UPDATE for users based on role" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;

-- Assignments - drop all
DROP POLICY IF EXISTS "Admins can manage all assignments" ON assignments;
DROP POLICY IF EXISTS "Admins have full access to assignments" ON assignments;
DROP POLICY IF EXISTS "Admins full access to assignments" ON assignments;
DROP POLICY IF EXISTS "Employees can update their assignment status" ON assignments;
DROP POLICY IF EXISTS "Employees can view their assignments" ON assignments;
DROP POLICY IF EXISTS "Employees can view their own assignments" ON assignments;

-- Assignment Members - drop all
DROP POLICY IF EXISTS "Admins can manage all assignment members" ON assignment_members;
DROP POLICY IF EXISTS "Admins full access to assignment members" ON assignment_members;
DROP POLICY IF EXISTS "Admins can manage assignment members" ON assignment_members;
DROP POLICY IF EXISTS "Members can view assignment members" ON assignment_members;
DROP POLICY IF EXISTS "Employees can view their own membership" ON assignment_members;
DROP POLICY IF EXISTS "Employees can view their own memberships" ON assignment_members;

-- Assignment Messages - drop all
DROP POLICY IF EXISTS "Admins can manage all messages" ON assignment_messages;
DROP POLICY IF EXISTS "Admins full access to assignment messages" ON assignment_messages;
DROP POLICY IF EXISTS "Employees can manage messages in their assignments" ON assignment_messages;
DROP POLICY IF EXISTS "Post messages in assigned assignments" ON assignment_messages;
DROP POLICY IF EXISTS "View messages in assigned assignments" ON assignment_messages;

-- ==========================================
-- STEP 2: DROP OLD FUNCTION
-- ==========================================

DROP FUNCTION IF EXISTS get_my_role() CASCADE;

-- ==========================================
-- STEP 3: CREATE SAFE HELPER FUNCTION
-- ==========================================

CREATE OR REPLACE FUNCTION auth_is_admin()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
AS $$
DECLARE
  user_role text;
BEGIN
  SELECT role INTO user_role
  FROM profiles
  WHERE id = auth.uid()
  LIMIT 1;
  
  RETURN user_role = 'admin';
END;
$$;

-- ==========================================
-- STEP 4: CREATE CLEAN POLICIES
-- ==========================================

-- PROFILES TABLE
-- Users can read their own profile
CREATE POLICY "select_own_profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (id = auth.uid());

-- Admins can read all profiles
CREATE POLICY "select_all_profiles_admin"
  ON profiles FOR SELECT
  TO authenticated
  USING (auth_is_admin());

-- Users can insert their own profile (during signup)
CREATE POLICY "insert_own_profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (id = auth.uid());

-- Users can update their own profile
CREATE POLICY "update_own_profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

-- Admins can update any profile
CREATE POLICY "update_all_profiles_admin"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth_is_admin())
  WITH CHECK (auth_is_admin());

-- Admins can delete profiles
CREATE POLICY "delete_profiles_admin"
  ON profiles FOR DELETE
  TO authenticated
  USING (auth_is_admin());

-- ASSIGNMENTS TABLE
-- Admins have full access
CREATE POLICY "admin_all_assignments"
  ON assignments FOR ALL
  TO authenticated
  USING (auth_is_admin())
  WITH CHECK (auth_is_admin());

-- Employees can view their assignments
CREATE POLICY "employee_view_assignments"
  ON assignments FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM assignment_members
      WHERE assignment_members.assignment_id = assignments.id
      AND assignment_members.employee_id = auth.uid()
    )
  );

-- Employees can update status on their assignments
CREATE POLICY "employee_update_status"
  ON assignments FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM assignment_members
      WHERE assignment_members.assignment_id = assignments.id
      AND assignment_members.employee_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM assignment_members
      WHERE assignment_members.assignment_id = assignments.id
      AND assignment_members.employee_id = auth.uid()
    )
  );

-- ASSIGNMENT_MEMBERS TABLE
-- Admins have full access
CREATE POLICY "admin_all_members"
  ON assignment_members FOR ALL
  TO authenticated
  USING (auth_is_admin())
  WITH CHECK (auth_is_admin());

-- Employees can view members of their assignments
CREATE POLICY "employee_view_members"
  ON assignment_members FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM assignment_members am
      WHERE am.assignment_id = assignment_members.assignment_id
      AND am.employee_id = auth.uid()
    )
  );

-- ASSIGNMENT_MESSAGES TABLE
-- Admins have full access
CREATE POLICY "admin_all_messages"
  ON assignment_messages FOR ALL
  TO authenticated
  USING (auth_is_admin())
  WITH CHECK (auth_is_admin());

-- Employees can view messages in their assignments
CREATE POLICY "employee_view_messages"
  ON assignment_messages FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM assignment_members
      WHERE assignment_members.assignment_id = assignment_messages.assignment_id
      AND assignment_members.employee_id = auth.uid()
    )
  );

-- Employees can post messages in their assignments
CREATE POLICY "employee_post_messages"
  ON assignment_messages FOR INSERT
  TO authenticated
  WITH CHECK (
    sender_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM assignment_members
      WHERE assignment_members.assignment_id = assignment_messages.assignment_id
      AND assignment_members.employee_id = auth.uid()
    )
  );
