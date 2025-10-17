/*
  # Fix Job Positions Schema

  1. Actions
    - Drop incorrect job_positions table (with name column)
    - Drop job_teams table (not needed - we use teams table)
    - Recreate job_positions with correct schema matching the app
    
  2. New Schema
    - id (uuid, primary key)
    - title (text) - Position title
    - description (text) - Position description
    - team_name (text) - Team name (backward compatible)
    - team_id (uuid) - Foreign key to teams table
    - requirements (text) - Job requirements
    - status (text) - 'open' or 'closed'
    - is_deleted (boolean) - Soft delete flag
    - deleted_at (timestamptz) - When deleted
    - created_at, updated_at (timestamptz)
    
  3. Security
    - Enable RLS
    - Public can read open positions
    - Authenticated can manage all positions
*/

-- Drop the incorrect tables
DROP TABLE IF EXISTS job_positions CASCADE;
DROP TABLE IF EXISTS job_teams CASCADE;

-- Recreate job_positions with correct schema
CREATE TABLE job_positions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  team_name text NOT NULL,
  team_id uuid REFERENCES teams(id) ON DELETE SET NULL,
  requirements text,
  status text DEFAULT 'open' CHECK (status IN ('open', 'closed')),
  is_deleted boolean DEFAULT false,
  deleted_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Add unique constraint for upserts (team_name + title must be unique)
ALTER TABLE job_positions ADD CONSTRAINT unique_job_position UNIQUE (team_name, title);

-- Enable RLS
ALTER TABLE job_positions ENABLE ROW LEVEL SECURITY;

-- Public can view open, non-deleted positions
CREATE POLICY "Public can view open positions"
  ON job_positions FOR SELECT
  USING (status = 'open' AND is_deleted = false);

-- Authenticated users can do everything (for admin)
CREATE POLICY "Authenticated users can manage positions"
  ON job_positions FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Create indexes
CREATE INDEX idx_job_positions_team_name ON job_positions(team_name);
CREATE INDEX idx_job_positions_team_id ON job_positions(team_id);
CREATE INDEX idx_job_positions_status ON job_positions(status);
CREATE INDEX idx_job_positions_is_deleted ON job_positions(is_deleted);