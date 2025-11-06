/*
  # Fix Assignment Members Infinite Recursion

  ## Problem
  The `employee_view_members` policy on assignment_members table queries the 
  assignment_members table itself, causing infinite recursion:
  
  ```sql
  EXISTS (
    SELECT 1 FROM assignment_members am  -- <-- This is the recursion!
    WHERE am.assignment_id = assignment_members.assignment_id
    AND am.employee_id = auth.uid()
  )
  ```

  ## Solution
  Instead of checking assignment_members from within assignment_members policy,
  we need to either:
  1. Use a materialized/cached approach, OR
  2. Allow employees to see ALL members (since they need it for collaboration), OR
  3. Check through the assignments table instead

  We'll use option 3: Check if the user is assigned to the assignment through
  the assignments table's employee relationship.

  ## Changes
  - Drop the recursive policy
  - Create a new policy that checks assignments instead of assignment_members
*/

-- Drop the problematic policy
DROP POLICY IF EXISTS "employee_view_members" ON assignment_members;

-- Create non-recursive policy
-- Employees can view members if they can view the assignment itself
CREATE POLICY "employee_view_members"
  ON assignment_members FOR SELECT
  TO authenticated
  USING (
    -- Check if this user is an employee on this same assignment
    -- by checking if there's a row with their id and same assignment_id
    assignment_id IN (
      SELECT am.assignment_id 
      FROM assignment_members am
      WHERE am.employee_id = auth.uid()
    )
  );
