/*
  # Add Unique Constraint to Rental Gear

  1. Changes
    - Add unique constraint on name column for rental_gear
    - This allows upsert operations in SettingsTab
*/

-- Add unique constraint if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'unique_rental_gear_name'
  ) THEN
    ALTER TABLE rental_gear ADD CONSTRAINT unique_rental_gear_name UNIQUE (name);
  END IF;
END $$;