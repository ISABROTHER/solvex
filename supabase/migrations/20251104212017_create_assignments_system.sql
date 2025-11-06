/*
  # Assignment System for Admin-Employee Communication

  ## Overview
  Creates a comprehensive assignment system where admins can create project assignments,
  assign them to multiple employees, and communicate through threaded messages.

  ## New Tables

  ### `assignments`
  - `id` (uuid, primary key)
  - `title` (text, required) - Assignment title
  - `instructions` (text, required) - Detailed instructions
  - `status` (text, default 'pending') - One of: pending, in_progress, completed
  - `due_date` (timestamptz, nullable) - Optional deadline
  - `created_by` (uuid, foreign key to profiles) - Admin who created it
  - `created_at` (timestamptz, auto)
  - `updated_at` (timestamptz, auto)

  ### `assignment_members`
  Join table linking assignments to employee profiles
  - `id` (uuid, primary key)
  - `assignment_id` (uuid, foreign key to assignments)
  - `employee_id` (uuid, foreign key to profiles)
  - `created_at` (timestamptz, auto)

  ### `assignment_messages`
  Chat messages within an assignment
  - `id` (uuid, primary key)
  - `assignment_id` (uuid, foreign key to assignments)
  - `sender_id` (uuid, foreign key to profiles)
  - `content` (text, required)
  - `created_at` (timestamptz, auto)

  ## Security
  - RLS enabled on all tables
  - Admins have full access
  - Employees can only view assignments they're assigned to
  - Employees can update assignment status and post messages
  - Everyone can read messages in assignments they're part of
*/

-- Create assignments table
CREATE TABLE IF NOT EXISTS assignments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  instructions text NOT NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed')),
  due_date timestamptz,
  created_by uuid REFERENCES profiles(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Create assignment_members join table
CREATE TABLE IF NOT EXISTS assignment_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  assignment_id uuid NOT NULL REFERENCES assignments(id) ON DELETE CASCADE,
  employee_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(assignment_id, employee_id)
);

-- Create assignment_messages table
CREATE TABLE IF NOT EXISTS assignment_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  assignment_id uuid NOT NULL REFERENCES assignments(id) ON DELETE CASCADE,
  sender_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  content text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE assignment_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE assignment_messages ENABLE ROW LEVEL SECURITY;

-- RLS Policies for assignments

-- Admins can do everything
CREATE POLICY "Admins have full access to assignments"
  ON assignments FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Employees can view assignments they're assigned to
CREATE POLICY "Employees can view their assignments"
  ON assignments FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM assignment_members
      WHERE assignment_members.assignment_id = assignments.id
      AND assignment_members.employee_id = auth.uid()
    )
  );

-- Employees can update status of their assignments
CREATE POLICY "Employees can update their assignment status"
  ON assignments FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM assignment_members
      WHERE assignment_members.assignment_id = assignments.id
      AND assignment_members.employee_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM assignment_members
      WHERE assignment_members.assignment_id = assignments.id
      AND assignment_members.employee_id = auth.uid()
    )
  );

-- RLS Policies for assignment_members

-- Admins can manage all members
CREATE POLICY "Admins can manage assignment members"
  ON assignment_members FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Everyone can view members of assignments they're part of
CREATE POLICY "Members can view assignment members"
  ON assignment_members FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM assignment_members am
      WHERE am.assignment_id = assignment_members.assignment_id
      AND am.employee_id = auth.uid()
    )
    OR
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- RLS Policies for assignment_messages

-- Admins and assigned members can view messages
CREATE POLICY "View messages in assigned assignments"
  ON assignment_messages FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM assignment_members
      WHERE assignment_members.assignment_id = assignment_messages.assignment_id
      AND assignment_members.employee_id = auth.uid()
    )
    OR
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Admins and assigned members can post messages
CREATE POLICY "Post messages in assigned assignments"
  ON assignment_messages FOR INSERT
  TO authenticated
  WITH CHECK (
    (
      EXISTS (
        SELECT 1 FROM assignment_members
        WHERE assignment_members.assignment_id = assignment_messages.assignment_id
        AND assignment_members.employee_id = auth.uid()
      )
      OR
      EXISTS (
        SELECT 1 FROM profiles
        WHERE profiles.id = auth.uid()
        AND profiles.role = 'admin'
      )
    )
    AND sender_id = auth.uid()
  );

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_assignments_created_by ON assignments(created_by);
CREATE INDEX IF NOT EXISTS idx_assignments_status ON assignments(status);
CREATE INDEX IF NOT EXISTS idx_assignment_members_assignment_id ON assignment_members(assignment_id);
CREATE INDEX IF NOT EXISTS idx_assignment_members_employee_id ON assignment_members(employee_id);
CREATE INDEX IF NOT EXISTS idx_assignment_messages_assignment_id ON assignment_messages(assignment_id);
CREATE INDEX IF NOT EXISTS idx_assignment_messages_created_at ON assignment_messages(created_at DESC);

-- Create updated_at trigger for assignments
CREATE OR REPLACE FUNCTION update_assignments_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER assignments_updated_at
  BEFORE UPDATE ON assignments
  FOR EACH ROW
  EXECUTE FUNCTION update_assignments_updated_at();
