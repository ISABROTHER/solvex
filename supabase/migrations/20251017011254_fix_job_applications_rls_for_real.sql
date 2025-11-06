/*
  # Fix Job Applications RLS Completely

  1. Changes
    - Disable RLS temporarily
    - Drop all existing policies
    - Recreate table permissions
    - Re-enable RLS with correct policies
    - Grant necessary permissions to anon role

  2. Security
    - Allows anon users to insert job applications
    - Only authenticated users can view/update/delete
*/

-- Temporarily disable RLS
ALTER TABLE job_applications DISABLE ROW LEVEL SECURITY;

-- Drop all existing policies
DROP POLICY IF EXISTS "Allow public to submit job applications" ON job_applications;
DROP POLICY IF EXISTS "Authenticated users can view all applications" ON job_applications;
DROP POLICY IF EXISTS "Authenticated users can update applications" ON job_applications;
DROP POLICY IF EXISTS "Authenticated users can delete applications" ON job_applications;

-- Grant basic permissions
GRANT INSERT ON job_applications TO anon;
GRANT INSERT ON job_applications TO authenticated;
GRANT ALL ON job_applications TO authenticated;

-- Re-enable RLS
ALTER TABLE job_applications ENABLE ROW LEVEL SECURITY;

-- Create insert policy for public (anon + authenticated)
CREATE POLICY "Public can insert applications"
  ON job_applications
  FOR INSERT
  WITH CHECK (true);

-- Create select policy for authenticated only
CREATE POLICY "Authenticated can view applications"
  ON job_applications
  FOR SELECT
  TO authenticated
  USING (true);

-- Create update policy for authenticated only
CREATE POLICY "Authenticated can update applications"
  ON job_applications
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Create delete policy for authenticated only
CREATE POLICY "Authenticated can delete applications"
  ON job_applications
  FOR DELETE
  TO authenticated
  USING (true);
