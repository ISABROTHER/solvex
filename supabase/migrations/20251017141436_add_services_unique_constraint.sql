/*
  # Add Unique Constraint to Services Table

  1. Changes
    - Add unique constraint on title column for services table
    - This allows upsert operations using ON CONFLICT (title)
    
  2. Notes
    - Uses IF NOT EXISTS pattern to prevent errors if constraint already exists
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'services_title_unique'
  ) THEN
    ALTER TABLE services ADD CONSTRAINT services_title_unique UNIQUE (title);
  END IF;
END $$;