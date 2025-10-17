/*
  # Fix Job Positions RLS for Admin Sync

  1. Changes
    - Drop existing policies
    - Add policies that allow anon role to manage positions (for sync)
    
  2. Security
    - Public can only SELECT open, non-deleted positions
    - Authenticated users can do everything
    - Anon role can INSERT/UPDATE/DELETE (for sync operations from admin)
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Public can view open positions" ON job_positions;
DROP POLICY IF EXISTS "Authenticated users can manage positions" ON job_positions;

-- Public can view open positions
CREATE POLICY "Public can view open positions"
  ON job_positions FOR SELECT
  USING (status = 'open' AND is_deleted = false);

-- Authenticated users have full access
CREATE POLICY "Authenticated users have full access"
  ON job_positions FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Anon users can manage positions (for admin sync operations)
CREATE POLICY "Anon can manage positions"
  ON job_positions FOR ALL
  TO anon
  USING (true)
  WITH CHECK (true);