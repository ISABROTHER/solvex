/*
  # Create Services Table

  ## Description
  This migration creates the services table for managing business services.

  ## Tables Created
  
  ### services
  Stores all service information including content, styling, and publication status.
  
  **Columns:**
  - `id` (text, primary key) - Unique identifier
  - `title` (text, required) - Service title
  - `summary` (text) - Brief service summary for cards
  - `image_url` (text) - Service image URL
  - `title_color` (text) - CSS color class for title styling
  - `description` (text) - Full service description
  - `sub_services` (text array) - List of sub-services
  - `outcome` (text) - Expected outcome description
  - `status` (text) - Publication status: 'draft' or 'published'
  - `is_deleted` (boolean) - Soft delete flag
  - `deleted_at` (text) - Soft delete timestamp
  - `image_fit` (text) - CSS object-fit value
  - `image_position` (text) - CSS object-position value
  - `image_rotation` (text) - CSS rotation value
  - `created_at` (timestamptz) - Creation timestamp
  - `updated_at` (timestamptz) - Update timestamp
  
  ## Security
  - Public users can view published, non-deleted services
  - Authenticated admin users have full CRUD access
*/

CREATE TABLE IF NOT EXISTS services (
  id text PRIMARY KEY DEFAULT gen_random_uuid()::text,
  title text NOT NULL,
  summary text,
  image_url text,
  title_color text DEFAULT 'text-gray-800',
  description text,
  sub_services text[],
  outcome text,
  status text DEFAULT 'draft' CHECK (status IN ('draft', 'published')),
  is_deleted boolean DEFAULT false NOT NULL,
  deleted_at text,
  image_fit text DEFAULT 'cover',
  image_position text DEFAULT 'center',
  image_rotation text DEFAULT '0',
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_services_updated_at ON services;
CREATE TRIGGER update_services_updated_at
  BEFORE UPDATE ON services
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

ALTER TABLE services ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public users can view published services"
  ON services
  FOR SELECT
  USING (status = 'published' AND is_deleted = false);

CREATE POLICY "Authenticated users can manage all services"
  ON services
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);