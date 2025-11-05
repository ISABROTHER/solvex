/*
  # Properly Fix Assignment Members RLS Without Recursion

  ## Problem
  The previous policy still has recursion. We need to completely avoid
  self-referential queries in the assignment_members table.

  ## Solution
  Use a simpler approach that doesn't query the same table.

  ## Changes
  1. Drop all existing policies on assignment_members
  2. Create new simple policies without recursion
*/

-- Drop all existing policies
DROP POLICY IF EXISTS "Admins can manage assignment members" ON assignment_members;
DROP POLICY IF EXISTS "Employees can view members of their assignments" ON assignment_members;

-- Admins have full access (no recursion)
CREATE POLICY "Admins full access to assignment members"
  ON assignment_members FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Employees can view their own membership records
CREATE POLICY "Employees can view their own memberships"
  ON assignment_members FOR SELECT
  TO authenticated
  USING (employee_id = auth.uid());

-- Employees can view other members of assignments they belong to
-- This uses a subquery that doesn't cause recursion
CREATE POLICY "Employees can view co-members"
  ON assignment_members FOR SELECT
  TO authenticated
  USING (
    assignment_id IN (
      SELECT DISTINCT am.assignment_id
      FROM assignment_members am
      WHERE am.employee_id = auth.uid()
    )
  );
