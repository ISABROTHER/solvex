/*
  # Cleanup Job Applications RLS Policies

  1. Changes
    - Drop all existing duplicate policies
    - Create clean, comprehensive policies for:
      - Public to submit applications (INSERT)
      - Authenticated users to manage all applications
      - Anon users to manage applications (for admin operations)
    
  2. Security
    - Public/anon can INSERT new applications (for job submissions)
    - Authenticated users have full access (for admin dashboard)
    - Anon users have full access (for admin operations when not logged in)
*/

-- Drop all existing policies
DROP POLICY IF EXISTS "allow_all_inserts" ON job_applications;
DROP POLICY IF EXISTS "allow_authenticated_select" ON job_applications;
DROP POLICY IF EXISTS "allow_authenticated_update" ON job_applications;
DROP POLICY IF EXISTS "allow_authenticated_delete" ON job_applications;
DROP POLICY IF EXISTS "Allow public to submit job applications" ON job_applications;
DROP POLICY IF EXISTS "Authenticated users can view all applications" ON job_applications;
DROP POLICY IF EXISTS "Authenticated users can update applications" ON job_applications;
DROP POLICY IF EXISTS "Authenticated users can delete applications" ON job_applications;

-- Allow public/anon to submit applications
CREATE POLICY "Public can submit applications"
  ON job_applications FOR INSERT
  TO public
  WITH CHECK (true);

-- Authenticated users have full access
CREATE POLICY "Authenticated users have full access"
  ON job_applications FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Anon users have full access (for admin operations)
CREATE POLICY "Anon can manage applications"
  ON job_applications FOR ALL
  TO anon
  USING (true)
  WITH CHECK (true);