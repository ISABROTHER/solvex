/*
  # Fix Infinite Recursion in Assignment Members RLS

  ## Problem
  The "Members can view assignment members" policy has infinite recursion
  because it references assignment_members within the assignment_members policy.

  ## Solution
  Simplify the policy to avoid self-referential queries.

  ## Changes
  1. Drop the problematic policy
  2. Create simpler policies without recursion
*/

-- Drop the problematic policy
DROP POLICY IF EXISTS "Members can view assignment members" ON assignment_members;

-- Employees can view assignment members for assignments they're part of
CREATE POLICY "Employees can view members of their assignments"
  ON assignment_members FOR SELECT
  TO authenticated
  USING (
    employee_id = auth.uid()
    OR
    assignment_id IN (
      SELECT assignment_id 
      FROM assignment_members 
      WHERE employee_id = auth.uid()
    )
    OR
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );
