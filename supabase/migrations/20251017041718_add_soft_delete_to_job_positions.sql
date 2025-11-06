/*
  # Add Soft Delete to Job Positions

  1. Changes
    - Add `is_deleted` boolean column (default false)
    - Add `deleted_at` timestamp column (nullable)
    
  2. Purpose
    - Enable soft delete functionality
    - Allow positions to be hidden from public view without permanent deletion
    - Allow restore functionality for accidentally deleted positions
*/

-- Add soft delete columns if they don't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'job_positions' AND column_name = 'is_deleted'
  ) THEN
    ALTER TABLE job_positions ADD COLUMN is_deleted boolean DEFAULT false;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'job_positions' AND column_name = 'deleted_at'
  ) THEN
    ALTER TABLE job_positions ADD COLUMN deleted_at timestamptz;
  END IF;
END $$;