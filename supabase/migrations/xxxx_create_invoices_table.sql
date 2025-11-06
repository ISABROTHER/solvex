/*
  # Migration: Create Invoices System

  ## Description
  This migration creates the `invoices` table to store
  billing information for clients.

  ## Changes
  1.  **Create `invoices` table**: Stores invoice details linked
      to a client (`client_id`) and a project (`project_id`).
  2.  **Enable RLS** on the table.
  3.  **Create RLS Policies**:
      - SELECT: Clients can only see their own invoices.
      - ALL: Admins/Employees have full access.
*/

-- 1. Create the `invoices` table
CREATE TABLE IF NOT EXISTS public.invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  project_id UUID REFERENCES public.client_projects(id) ON DELETE SET NULL,
  invoice_number TEXT NOT NULL UNIQUE,
  amount NUMERIC(10, 2) NOT NULL,
  status TEXT DEFAULT 'pending' NOT NULL CHECK (status = ANY (ARRAY['pending'::text, 'paid'::text, 'overdue'::text, 'cancelled'::text])),
  due_date DATE,
  pdf_url TEXT, -- Stores a link to the invoice PDF in storage
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- 2. Enable RLS
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;

-- 3. Create RLS Policies
DROP POLICY IF EXISTS "Allow admin/employee full access to invoices" ON public.invoices;
CREATE POLICY "Allow admin/employee full access to invoices"
ON public.invoices
FOR ALL
USING (is_admin_or_employee(auth.uid()))
WITH CHECK (is_admin_or_employee(auth.uid()));

DROP POLICY IF EXISTS "Allow client to view their own invoices" ON public.invoices;
CREATE POLICY "Allow client to view their own invoices"
ON public.invoices
FOR SELECT
USING (client_id = auth.uid());