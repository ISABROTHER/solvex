/*
  # Create Services Table

  ## Description
  This migration creates the services table for managing business services
  offered by SolveX Studios.

  ## Tables Created
  
  ### services
  Stores all service information including content, styling, and publication status.
  
  **Columns:**
  - `id` (text, primary key) - Unique identifier for each service
  - `title` (text, required) - Service title
  - `summary` (text) - Brief service summary for cards
  - `image_url` (text) - Service image URL
  - `title_color` (text) - CSS color class for title styling
  - `description` (text) - Full service description
  - `sub_services` (text array) - List of sub-services offered
  - `outcome` (text) - Expected outcome description
  - `status` (text) - Publication status: 'draft' or 'published'
  - `is_deleted` (boolean) - Soft delete flag
  - `deleted_at` (text) - Soft delete timestamp
  - `image_fit` (text) - CSS object-fit value for images
  - `image_position` (text) - CSS object-position value for images
  - `image_rotation` (text) - CSS rotation value for images
  - `created_at` (timestamptz) - Record creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp
  
  ## Security
  
  ### Row Level Security (RLS)
  - RLS is enabled on the services table
  - Public users can view published, non-deleted services
  - Authenticated admin users have full CRUD access
  
  ### Policies
  1. **Public Read Access** - Anyone can view published services
  2. **Admin Full Access** - Authenticated users can manage all services
  
  ## Notes
  - Uses text for ID to allow custom identifiers
  - Soft delete pattern implemented with is_deleted and deleted_at
  - Status constrained to 'draft' or 'published'
  - Image styling columns support flexible presentation
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

-- Create trigger to automatically update updated_at
DROP TRIGGER IF EXISTS update_services_updated_at ON services;
CREATE TRIGGER update_services_updated_at
  BEFORE UPDATE ON services
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE services ENABLE ROW LEVEL SECURITY;

-- Policy: Public users can view published, non-deleted services
CREATE POLICY "Public users can view published services"
  ON services
  FOR SELECT
  USING (status = 'published' AND is_deleted = false);

-- Policy: Authenticated users have full access to all services
CREATE POLICY "Authenticated users can manage all services"
  ON services
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);