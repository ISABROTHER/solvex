/*
  # Fix Job Positions RLS Policy Status Check

  ## Issue
  The RLS policy for job_positions checks for status = 'active'
  but the actual status values in the database are 'open' and 'closed'

  ## Changes
  - Update the "Public can view active job positions" policy
  - Change status check from 'active' to 'open'
  - Also update to check is_deleted instead of deleted_at for consistency
*/

-- Drop the existing policy
DROP POLICY IF EXISTS "Public can view active job positions" ON public.job_positions;

-- Recreate with correct status value
CREATE POLICY "Public can view active job positions"
  ON public.job_positions FOR SELECT
  TO public
  USING (
    status = 'open' 
    AND (is_deleted = false OR is_deleted IS NULL)
  );
