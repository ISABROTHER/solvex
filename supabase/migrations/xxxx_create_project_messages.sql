/*
  # Migration: Create Project Messages System

  ## Description
  This migration creates the `project_messages` table to
  enable real-time chat within each client project.

  ## Changes
  1.  **Create `project_messages` table**: Stores messages linked
      to a `client_projects` (project_id) and a `profiles` (sender_id).
  2.  **Enable RLS** on the table.
  3.  **Create RLS Policies**:
      - SELECT: Admins/Employees can see all. Clients can only see
        messages for projects they own.
      - INSERT: Admins/Employees can send all. Clients can only
        send messages to projects they own.
*/

-- 1. Create the `project_messages` table
CREATE TABLE IF NOT EXISTS public.project_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES public.client_projects(id) ON DELETE CASCADE NOT NULL,
  sender_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- 2. Enable RLS
ALTER TABLE public.project_messages ENABLE ROW LEVEL SECURITY;

-- 3. Helper function to check admin/employee status
-- (This is a safe read-only function)
CREATE OR REPLACE FUNCTION is_admin_or_employee(user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.profiles p
    WHERE p.id = user_id AND (p.role = 'admin' OR p.role = 'employee')
  );
$$;

-- 4. Create RLS Policies
DROP POLICY IF EXISTS "Allow admin/employee full access to project messages" ON public.project_messages;
CREATE POLICY "Allow admin/employee full access to project messages"
ON public.project_messages
FOR ALL
USING (is_admin_or_employee(auth.uid()))
WITH CHECK (is_admin_or_employee(auth.uid()));

DROP POLICY IF EXISTS "Allow client to view messages for their own projects" ON public.project_messages;
CREATE POLICY "Allow client to view messages for their own projects"
ON public.project_messages
FOR SELECT
USING (
  EXISTS (
    SELECT 1
    FROM public.client_projects cp
    WHERE cp.id = project_messages.project_id AND cp.client_id = auth.uid()
  )
);

DROP POLICY IF EXISTS "Allow client to send messages in their own projects" ON public.project_messages;
CREATE POLICY "Allow client to send messages in their own projects"
ON public.project_messages
FOR INSERT
WITH CHECK (
  sender_id = auth.uid() AND
  EXISTS (
    SELECT 1
    FROM public.client_projects cp
    WHERE cp.id = project_messages.project_id AND cp.client_id = auth.uid()
  )
);