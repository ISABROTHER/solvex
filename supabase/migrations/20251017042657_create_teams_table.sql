/*
  # Create Teams Management Table

  1. New Tables
    - `teams`
      - `id` (uuid, primary key)
      - `name` (text, unique) - Team name
      - `description` (text) - Team description
      - `image_url` (text) - Team image
      - `display_order` (integer) - Order to display teams
      - `is_deleted` (boolean) - Soft delete flag
      - `deleted_at` (timestamptz) - When deleted
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
    
  2. Changes to job_positions
    - Add `team_id` (uuid) - Foreign key to teams table
    - Keep `team_name` for backward compatibility
    
  3. Security
    - Enable RLS on `teams` table
    - Add policy for public read access (non-deleted teams)
    - Add policy for authenticated admin write access
*/

-- Create teams table
CREATE TABLE IF NOT EXISTS teams (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  description text DEFAULT '',
  image_url text DEFAULT '',
  display_order integer DEFAULT 0,
  is_deleted boolean DEFAULT false,
  deleted_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Add team_id to job_positions if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'job_positions' AND column_name = 'team_id'
  ) THEN
    ALTER TABLE job_positions ADD COLUMN team_id uuid REFERENCES teams(id) ON DELETE SET NULL;
  END IF;
END $$;

-- Enable RLS
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;

-- Public can view non-deleted teams
CREATE POLICY "Public can view active teams"
  ON teams FOR SELECT
  USING (is_deleted = false);

-- Authenticated users can do everything (for admin)
CREATE POLICY "Authenticated users can manage teams"
  ON teams FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_teams_display_order ON teams(display_order);
CREATE INDEX IF NOT EXISTS idx_teams_is_deleted ON teams(is_deleted);
CREATE INDEX IF NOT EXISTS idx_job_positions_team_id ON job_positions(team_id);