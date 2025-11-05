/*
  # Fix Assignment Members - Remove All Recursion

  ## Problem
  Any query to assignment_members FROM assignment_members policy causes recursion.

  ## Solution
  Use a security definer function that bypasses RLS to check membership.
  This breaks the recursion chain.

  ## Changes
  - Create helper function that checks membership without triggering RLS
  - Replace recursive policy with function call
*/

-- Drop existing policy
DROP POLICY IF EXISTS "employee_view_members" ON assignment_members;

-- Create helper function that bypasses RLS
CREATE OR REPLACE FUNCTION user_is_member_of_assignment(assignment_uuid uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
AS $$
DECLARE
  is_member boolean;
BEGIN
  -- This runs with SECURITY DEFINER so it bypasses RLS
  SELECT EXISTS (
    SELECT 1
    FROM assignment_members
    WHERE assignment_id = assignment_uuid
    AND employee_id = auth.uid()
    LIMIT 1
  ) INTO is_member;
  
  RETURN is_member;
END;
$$;

-- Create new policy using the function
CREATE POLICY "employee_view_members"
  ON assignment_members FOR SELECT
  TO authenticated
  USING (user_is_member_of_assignment(assignment_id));
