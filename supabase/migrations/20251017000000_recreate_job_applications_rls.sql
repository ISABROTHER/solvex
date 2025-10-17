-- New Migration: 20251017000000_recreate_job_applications_rls.sql

-- Ensure RLS is enabled on the table
ALTER TABLE job_applications ENABLE ROW LEVEL SECURITY;

-- 1. Drop all existing RLS policies on job_applications for a clean start
-- We drop all known names to ensure no old policies remain active
DROP POLICY IF EXISTS "Anyone can submit job applications" ON job_applications;
DROP POLICY IF EXISTS "Allow public to submit job applications" ON job_applications; 
DROP POLICY IF EXISTS "Authenticated users can view all applications" ON job_applications;
DROP POLICY IF EXISTS "Authenticated users can update applications" ON job_applications;
DROP POLICY IF EXISTS "Authenticated users can delete applications" ON job_applications;

-- 2. Policy: Allow anonymous and authenticated users to insert (Submit Application)
-- This explicitly grants INSERT access to the 'anon' role (public website visitors)
CREATE POLICY "Allow public to submit job applications"
  ON job_applications
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- 3. Policy: Allow authenticated users (Admin) to view all applications
CREATE POLICY "Authenticated users can view all applications"
  ON job_applications
  FOR SELECT
  TO authenticated
  USING (true);

-- 4. Policy: Allow authenticated users (Admin) to update applications
CREATE POLICY "Authenticated users can update applications"
  ON job_applications
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- 5. Policy: Allow authenticated users (Admin) to delete applications
CREATE POLICY "Authenticated users can delete applications"
  ON job_applications
  FOR DELETE
  TO authenticated
  USING (true);

-- End of migration