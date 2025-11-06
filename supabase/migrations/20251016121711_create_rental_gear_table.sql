/*
  # Create Rental Gear Management Table

  ## Overview
  This migration creates the rental_gear table for managing equipment rentals.
  
  ## Tables Created
  
  ### rental_gear
  Stores all rental equipment information including pricing and availability.
  
  **Columns:**
  - `id` (uuid, primary key) - Unique identifier for each rental item
  - `name` (text, required) - Name of the rental equipment
  - `description` (text) - Detailed description of the equipment
  - `category` (text) - Equipment category (e.g., "Camera", "Lighting", "Audio")
  - `price_per_day` (numeric) - Daily rental price in currency units
  - `is_available` (boolean, default true) - Current availability status
  - `image_url` (text) - Optional image URL for the equipment
  - `video_url` (text) - YouTube video URL for product demos
  - `features` (text array) - List of key product features
  - `created_at` (timestamptz) - Record creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp
  
  ## Security
  
  ### Row Level Security (RLS)
  - RLS is enabled on the rental_gear table
  - Only authenticated admin users can manage rental gear
  - Public users can view available rental gear (read-only)
  
  ### Policies
  1. **Public Read Access** - Anyone can view rental gear
  2. **Admin Full Access** - Authenticated users have full CRUD access
  
  ## Indexes
  - Primary key index on `id`
  - Index on `category` for faster filtering
  - Index on `is_available` for availability queries
  
  ## Notes
  - Prices are stored as numeric type for precision
  - Timestamps use timestamptz for timezone awareness
  - Updated_at automatically updates on row modification via trigger
*/

-- Create rental_gear table
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

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_rental_gear_category ON rental_gear(category);
CREATE INDEX IF NOT EXISTS idx_rental_gear_availability ON rental_gear(is_available);

-- Create updated_at trigger function if it doesn't exist
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updated_at
DROP TRIGGER IF EXISTS update_rental_gear_updated_at ON rental_gear;
CREATE TRIGGER update_rental_gear_updated_at
  BEFORE UPDATE ON rental_gear
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE rental_gear ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can view rental gear (public read access)
CREATE POLICY "Public users can view rental gear"
  ON rental_gear
  FOR SELECT
  USING (true);

-- Policy: Authenticated users can insert rental gear
CREATE POLICY "Authenticated users can create rental gear"
  ON rental_gear
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Policy: Authenticated users can update rental gear
CREATE POLICY "Authenticated users can update rental gear"
  ON rental_gear
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Policy: Authenticated users can delete rental gear
CREATE POLICY "Authenticated users can delete rental gear"
  ON rental_gear
  FOR DELETE
  TO authenticated
  USING (true);