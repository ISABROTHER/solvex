/*
  # Update RLS Policies for Dashboard Access

  ## Description
  Updates RLS policies to allow anon key access for admin dashboard operations.
  This enables the dashboard to update data without requiring user authentication.

  ## Changes
  
  ### rental_gear Table
  - Drop existing authenticated-only policies
  - Add new policies that allow public role (anon key) to perform CRUD operations
  
  ### services Table
  - Drop existing authenticated-only policy
  - Add new policy that allows public role (anon key) to perform all operations
  
  ## Security Note
  In production, you should implement proper authentication and restrict these
  policies to authenticated admin users only.
*/

-- Drop existing restrictive policies for rental_gear
DROP POLICY IF EXISTS "Authenticated users can create rental gear" ON rental_gear;
DROP POLICY IF EXISTS "Authenticated users can update rental gear" ON rental_gear;
DROP POLICY IF EXISTS "Authenticated users can delete rental gear" ON rental_gear;

-- Create new policies that allow anon key access for rental_gear
CREATE POLICY "Anyone can create rental gear"
  ON rental_gear
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can update rental gear"
  ON rental_gear
  FOR UPDATE
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Anyone can delete rental gear"
  ON rental_gear
  FOR DELETE
  USING (true);

-- Drop existing restrictive policy for services
DROP POLICY IF EXISTS "Authenticated users can manage all services" ON services;

-- Create new policy that allows anon key access for services
CREATE POLICY "Anyone can manage services"
  ON services
  FOR ALL
  USING (true)
  WITH CHECK (true);