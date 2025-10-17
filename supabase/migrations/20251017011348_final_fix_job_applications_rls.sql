/*
  # Final Fix for Job Applications RLS

  1. Changes
    - Completely disable and re-enable RLS with the simplest possible policy
    - Use PERMISSIVE policy that allows all inserts

  2. Security
    - Public submissions allowed
    - Viewing restricted to authenticated users
*/

-- Disable RLS
ALTER TABLE job_applications DISABLE ROW LEVEL SECURITY;

-- Drop ALL policies
DO $$ 
DECLARE
    r RECORD;
BEGIN
    FOR r IN 
        SELECT policyname 
        FROM pg_policies 
        WHERE tablename = 'job_applications'
    LOOP
        EXECUTE 'DROP POLICY IF EXISTS ' || quote_ident(r.policyname) || ' ON job_applications';
    END LOOP;
END $$;

-- Enable RLS
ALTER TABLE job_applications ENABLE ROW LEVEL SECURITY;

-- Create the most permissive insert policy possible
CREATE POLICY "allow_all_inserts"
  ON job_applications
  AS PERMISSIVE
  FOR INSERT
  TO public
  WITH CHECK (true);

-- Authenticated users can view
CREATE POLICY "allow_authenticated_select"
  ON job_applications
  AS PERMISSIVE
  FOR SELECT
  TO authenticated
  USING (true);

-- Authenticated users can update
CREATE POLICY "allow_authenticated_update"
  ON job_applications
  AS PERMISSIVE
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Authenticated users can delete
CREATE POLICY "allow_authenticated_delete"
  ON job_applications
  AS PERMISSIVE
  FOR DELETE
  TO authenticated
  USING (true);
