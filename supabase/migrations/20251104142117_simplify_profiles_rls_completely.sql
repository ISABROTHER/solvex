/*
  # Completely Simplify Profiles RLS

  ## Issue
  Still experiencing infinite recursion despite previous fixes
  
  ## Solution
  - Drop ALL existing policies
  - Disable RLS temporarily to test
  - Create the absolute simplest policies possible
  - Use SECURITY DEFINER function to check admin status safely

  ## Changes
  1. Create a safe function to check if user is admin
  2. Drop all existing policies
  3. Create minimal, simple policies
*/

-- Create a SECURITY DEFINER function that safely checks admin status
-- This prevents recursion by executing with elevated privileges
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT COALESCE(
    (auth.jwt()->>'app_metadata')::jsonb->>'role' = 'admin',
    false
  );
$$;

-- Drop ALL existing profiles policies
DROP POLICY IF EXISTS "Admins delete profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins insert profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins read all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins update all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users delete own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users read own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users update own profile" ON public.profiles;

-- Create simple SELECT policy
CREATE POLICY "profiles_select_policy"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (
    auth.uid() = id OR is_admin()
  );

-- Create simple INSERT policy
CREATE POLICY "profiles_insert_policy"
  ON public.profiles FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = id OR is_admin()
  );

-- Create simple UPDATE policy
CREATE POLICY "profiles_update_policy"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (
    auth.uid() = id OR is_admin()
  )
  WITH CHECK (
    auth.uid() = id OR is_admin()
  );

-- Create simple DELETE policy
CREATE POLICY "profiles_delete_policy"
  ON public.profiles FOR DELETE
  TO authenticated
  USING (
    auth.uid() = id OR is_admin()
  );
