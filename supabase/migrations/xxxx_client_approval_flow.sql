/*
  # Migration: Add Client Approval Flow

  ## Description
  This migration adds the necessary columns to the `profiles` table
  to support the new client sign-up and admin approval workflow.

  ## Changes
  1.  **Alter `profiles` table:**
      -   Add `approval_status` (text, default 'pending'). Stores 'pending', 'approved', 'denied'.
      -   Add `reason_for_access` (text, nullable). Stores the message from the pending page.
  2.  **Recreate `handle_new_user` function:**
      -   Updates the trigger function for new user sign-ups.
      -   It now explicitly sets `role` to `'client'` (if not provided).
      -   It now explicitly sets `approval_status` to `'pending'`.
*/

-- 1. Add new columns to the profiles table
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS approval_status TEXT DEFAULT 'pending' NOT NULL,
ADD COLUMN IF NOT EXISTS reason_for_access TEXT;

-- Add check constraint for the new status
ALTER TABLE public.profiles
DROP CONSTRAINT IF EXISTS profiles_approval_status_check,
ADD CONSTRAINT profiles_approval_status_check
CHECK (approval_status = ANY (ARRAY['pending'::text, 'approved'::text, 'denied'::text]));

-- 2. Recreate the handle_new_user function to set defaults
-- (This replaces the one from 20251104140728_fix_remaining_security_issues.sql)

DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;

CREATE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
BEGIN
  INSERT INTO public.profiles (
    id,
    role,
    email,
    first_name,
    last_name,
    approval_status -- Add new field
  )
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'role', 'client'), -- Default role is 'client'
    NEW.email,
    NEW.raw_user_meta_data->>'first_name',
    NEW.raw_user_meta_data->>'last_name',
    'pending' -- Default status is 'pending'
  );
  RETURN NEW;
END;
$$;

-- Re-apply the trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();