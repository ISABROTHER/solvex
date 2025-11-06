/*
  # Create Rental Gear Table

  ## Description
  Creates rental_gear table for managing equipment rentals.
  
  ## Tables Created
  
  ### rental_gear
  Stores all rental equipment information.
  
  **Columns:**
  - `id` (uuid, primary key) - Unique identifier
  - `name` (text, required) - Equipment name
  - `description` (text) - Description
  - `category` (text) - Category
  - `price_per_day` (numeric) - Daily rental price
  - `is_available` (boolean, default true) - Availability
  - `image_url` (text) - Image URL
  - `video_url` (text) - YouTube video URL
  - `features` (text array) - Key features list
  - `created_at` (timestamptz) - Creation timestamp
  - `updated_at` (timestamptz) - Update timestamp
  
  ## Security
  - Public users can view all rental gear
  - Authenticated users have full CRUD access
*/

CREATE TABLE IF NOT EXISTS rental_gear (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  category text,
  price_per_day numeric(10, 2) NOT NULL CHECK (price_per_day >= 0),
  is_available boolean DEFAULT true NOT NULL,
  image_url text,
  video_url text,
  features text[],
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_rental_gear_category ON rental_gear(category);
CREATE INDEX IF NOT EXISTS idx_rental_gear_availability ON rental_gear(is_available);

DROP TRIGGER IF EXISTS update_rental_gear_updated_at ON rental_gear;
CREATE TRIGGER update_rental_gear_updated_at
  BEFORE UPDATE ON rental_gear
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

ALTER TABLE rental_gear ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public users can view rental gear"
  ON rental_gear
  FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can create rental gear"
  ON rental_gear
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update rental gear"
  ON rental_gear
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete rental gear"
  ON rental_gear
  FOR DELETE
  TO authenticated
  USING (true);