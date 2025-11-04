/*
  # Add Employee Role and Tasks Table

  ## Changes
  
  1. Profiles Table Updates:
    - Update role check constraint to include 'employee' role
    - Existing roles: 'admin', 'client', 'employee'
  
  2. New Tasks Table:
    - `id` (uuid, primary key)
    - `title` (text, required) - Task name
    - `description` (text) - Task details
    - `status` (text) - pending, in_progress, completed
    - `priority` (text) - low, medium, high
    - `assigned_to` (uuid) - References profiles.id
    - `assigned_by` (uuid) - References profiles.id
    - `deadline` (timestamptz) - Task due date
    - `created_at` (timestamptz)
    - `updated_at` (timestamptz)
  
  3. Security:
    - Enable RLS on tasks table
    - Users can view tasks assigned to them
    - Admins can manage all tasks
*/

-- Update profiles table role constraint to include 'employee'
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'profiles_role_check'
  ) THEN
    ALTER TABLE profiles DROP CONSTRAINT profiles_role_check;
  END IF;
END $$;

ALTER TABLE profiles 
  ADD CONSTRAINT profiles_role_check 
  CHECK (role = ANY (ARRAY['admin'::text, 'client'::text, 'employee'::text]));

-- Create tasks table
CREATE TABLE IF NOT EXISTS tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  status text DEFAULT 'pending' CHECK (status = ANY (ARRAY['pending'::text, 'in_progress'::text, 'completed'::text])),
  priority text DEFAULT 'medium' CHECK (priority = ANY (ARRAY['low'::text, 'medium'::text, 'high'::text])),
  assigned_to uuid REFERENCES profiles(id) ON DELETE CASCADE,
  assigned_by uuid REFERENCES profiles(id) ON DELETE SET NULL,
  deadline timestamptz,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- Enable RLS
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

-- Employees can view their own tasks
CREATE POLICY "Users can view their assigned tasks"
  ON tasks FOR SELECT
  TO authenticated
  USING (assigned_to = auth.uid());

-- Admins can view all tasks
CREATE POLICY "Admins can view all tasks"
  ON tasks FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Admins can insert tasks
CREATE POLICY "Admins can create tasks"
  ON tasks FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Admins can update tasks
CREATE POLICY "Admins can update tasks"
  ON tasks FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Employees can update status of their own tasks
CREATE POLICY "Users can update their task status"
  ON tasks FOR UPDATE
  TO authenticated
  USING (assigned_to = auth.uid())
  WITH CHECK (assigned_to = auth.uid());

-- Admins can delete tasks
CREATE POLICY "Admins can delete tasks"
  ON tasks FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Create index for performance
CREATE INDEX IF NOT EXISTS tasks_assigned_to_idx ON tasks(assigned_to);
CREATE INDEX IF NOT EXISTS tasks_status_idx ON tasks(status);