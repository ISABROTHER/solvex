/*
  # Add status column to job_positions

  1. Changes
    - Add status column (open/closed) to job_positions table
    - Keep is_open for backward compatibility
    - Make description and requirements nullable for easier CRUD

  2. Notes
    - Status will be derived from is_open but provides better clarity
*/

-- Add status column if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'job_positions' AND column_name = 'status'
  ) THEN
    ALTER TABLE job_positions 
    ADD COLUMN status text DEFAULT 'open' CHECK (status IN ('open', 'closed'));
    
    -- Update status based on is_open
    UPDATE job_positions SET status = CASE WHEN is_open THEN 'open' ELSE 'closed' END;
  END IF;
END $$;

-- Make description nullable if it isn't already
ALTER TABLE job_positions ALTER COLUMN description DROP NOT NULL;

-- Make team_name nullable if it isn't already
ALTER TABLE job_positions ALTER COLUMN team_name DROP NOT NULL;

-- Change requirements from array to text for easier management
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'job_positions' 
    AND column_name = 'requirements'
    AND data_type = 'ARRAY'
  ) THEN
    ALTER TABLE job_positions DROP COLUMN requirements;
    ALTER TABLE job_positions ADD COLUMN requirements text;
  END IF;
END $$;
