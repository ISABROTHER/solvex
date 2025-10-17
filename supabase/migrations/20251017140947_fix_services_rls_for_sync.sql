/*
  # Fix Services RLS for Admin Sync

  1. Changes
    - Drop existing policies
    - Add policies that allow anon role to manage services (for sync)
    
  2. Security
    - Public can only SELECT published, non-deleted services
    - Authenticated users can do everything
    - Anon role can INSERT/UPDATE/DELETE (for sync operations from admin)
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Public users can view published services" ON services;
DROP POLICY IF EXISTS "Anyone can manage services" ON services;

-- Public can view published services
CREATE POLICY "Public can view published services"
  ON services FOR SELECT
  USING (status = 'published' AND is_deleted = false);

-- Authenticated users have full access
CREATE POLICY "Authenticated users have full access"
  ON services FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Anon users can manage services (for admin sync operations)
CREATE POLICY "Anon can manage services"
  ON services FOR ALL
  TO anon
  USING (true)
  WITH CHECK (true);