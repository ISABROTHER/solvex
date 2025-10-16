-- Job Positions and Applications System
-- Creates a comprehensive job management system for tracking open positions and job applications

-- Create job_positions table
CREATE TABLE IF NOT EXISTS job_positions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL,
  team_name text NOT NULL,
  team_image_url text,
  is_open boolean DEFAULT true,
  requirements text[],
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create job_applications table
CREATE TABLE IF NOT EXISTS job_applications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  job_position_id uuid REFERENCES job_positions(id) ON DELETE CASCADE,
  full_name text NOT NULL,
  email text NOT NULL,
  phone text NOT NULL,
  country_code text NOT NULL,
  cover_letter text,
  linkedin_url text,
  portfolio_url text,
  status text DEFAULT 'pending',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE job_positions ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_applications ENABLE ROW LEVEL SECURITY;

-- RLS Policies for job_positions
CREATE POLICY "Anyone can view open job positions"
  ON job_positions
  FOR SELECT
  USING (is_open = true);

CREATE POLICY "Authenticated users can view all job positions"
  ON job_positions
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert job positions"
  ON job_positions
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update job positions"
  ON job_positions
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete job positions"
  ON job_positions
  FOR DELETE
  TO authenticated
  USING (true);

-- RLS Policies for job_applications
CREATE POLICY "Anyone can submit job applications"
  ON job_applications
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Authenticated users can view all applications"
  ON job_applications
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can update applications"
  ON job_applications
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete applications"
  ON job_applications
  FOR DELETE
  TO authenticated
  USING (true);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_job_positions_team_name ON job_positions(team_name);
CREATE INDEX IF NOT EXISTS idx_job_positions_is_open ON job_positions(is_open);
CREATE INDEX IF NOT EXISTS idx_job_applications_position_id ON job_applications(job_position_id);
CREATE INDEX IF NOT EXISTS idx_job_applications_status ON job_applications(status);
CREATE INDEX IF NOT EXISTS idx_job_applications_created_at ON job_applications(created_at DESC);