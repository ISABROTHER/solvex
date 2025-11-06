/*
  # Completely Fix Job Applications RLS

  1. Changes
    - Drop and recreate the table with proper RLS setup
    - Ensure anon role can insert without restrictions

  2. Security
    - Public can submit applications (no restrictions on insert)
    - Only authenticated users can view/update/delete
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Public can insert applications" ON job_applications;
DROP POLICY IF EXISTS "Authenticated can view applications" ON job_applications;
DROP POLICY IF EXISTS "Authenticated can update applications" ON job_applications;
DROP POLICY IF EXISTS "Authenticated can delete applications" ON job_applications;

-- Disable RLS temporarily
ALTER TABLE job_applications DISABLE ROW LEVEL SECURITY;

-- Grant explicit table permissions
GRANT USAGE ON SCHEMA public TO anon;
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT INSERT ON TABLE job_applications TO anon, authenticated;
GRANT SELECT, UPDATE, DELETE ON TABLE job_applications TO authenticated;

-- Re-enable RLS
ALTER TABLE job_applications ENABLE ROW LEVEL SECURITY;

-- Create permissive insert policy for ALL roles (no TO clause means all roles)
CREATE POLICY "Anyone can submit applications"
  ON job_applications
  FOR INSERT
  WITH CHECK (true);

-- Create select policy for authenticated users
CREATE POLICY "Authenticated users can view applications"
  ON job_applications
  FOR SELECT
  TO authenticated
  USING (true);

-- Create update policy for authenticated users
CREATE POLICY "Authenticated users can update applications"
  ON job_applications
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Create delete policy for authenticated users
CREATE POLICY "Authenticated users can delete applications"
  ON job_applications
  FOR DELETE
  TO authenticated
  USING (true);
