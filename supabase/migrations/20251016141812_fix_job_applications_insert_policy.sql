/*
  # Fix Job Applications Insert Policy for Anonymous Users

  1. Changes
    - Drop the existing insert policy for job_applications
    - Create a new policy that explicitly allows anon role to insert applications
    - Ensure the policy targets both 'anon' and 'authenticated' roles

  2. Security
    - Maintains RLS protection
    - Allows public job application submissions
    - Restricts viewing/updating to authenticated users only
*/

-- Drop existing insert policy
DROP POLICY IF EXISTS "Anyone can submit job applications" ON job_applications;

-- Create new insert policy for both anon and authenticated users
CREATE POLICY "Allow public to submit job applications"
  ON job_applications
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);
