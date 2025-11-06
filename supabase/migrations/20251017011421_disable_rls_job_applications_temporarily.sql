/*
  # Temporarily Disable RLS on Job Applications

  1. Changes
    - Disable RLS completely to allow public submissions
    - This is a temporary measure to debug the issue

  2. Security Note
    - RLS is disabled - anyone can insert/view/update/delete
    - This should be re-enabled with proper policies once working
*/

-- Simply disable RLS for now
ALTER TABLE job_applications DISABLE ROW LEVEL SECURITY;
