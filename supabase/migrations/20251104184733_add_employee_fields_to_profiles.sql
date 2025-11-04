/*
  # Add Employee Profile Fields

  ## Changes
  
  1. Profiles Table Updates:
    - Add `employee_number` (text) - Unique employee identifier
    - Add `birth_date` (date) - Employee's date of birth
    - Add `national_id` (text) - National ID number
    - Add `position` (text) - Job position/title
    - Add `start_date` (date) - Employment start date
    - Add `end_date` (date) - Employment end date (nullable)
    - Add `home_address` (text) - Residential address
    - Add `salary` (numeric) - Employee salary
    - Add `payday` (text) - Payment schedule
    - Add `bank_account` (text) - Bank account number
    - Add `bank_name` (text) - Name of bank
  
  2. Security:
    - These fields are only visible to the profile owner and admins
*/

-- Add employee fields to profiles table
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'employee_number') THEN
    ALTER TABLE profiles ADD COLUMN employee_number text;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'birth_date') THEN
    ALTER TABLE profiles ADD COLUMN birth_date date;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'national_id') THEN
    ALTER TABLE profiles ADD COLUMN national_id text;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'position') THEN
    ALTER TABLE profiles ADD COLUMN position text;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'start_date') THEN
    ALTER TABLE profiles ADD COLUMN start_date date;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'end_date') THEN
    ALTER TABLE profiles ADD COLUMN end_date date;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'home_address') THEN
    ALTER TABLE profiles ADD COLUMN home_address text;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'salary') THEN
    ALTER TABLE profiles ADD COLUMN salary numeric(10, 2);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'payday') THEN
    ALTER TABLE profiles ADD COLUMN payday text;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'bank_account') THEN
    ALTER TABLE profiles ADD COLUMN bank_account text;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'bank_name') THEN
    ALTER TABLE profiles ADD COLUMN bank_name text;
  END IF;
END $$;

-- Create index on employee_number for lookup
CREATE INDEX IF NOT EXISTS profiles_employee_number_idx ON profiles(employee_number) WHERE employee_number IS NOT NULL;