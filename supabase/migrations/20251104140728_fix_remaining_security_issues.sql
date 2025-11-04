/*
  # Fix Remaining Security Issues

  ## Overview
  This migration addresses the final security and performance issues:
  
  ## 1. Fix Profiles Admin Policy
  - The "Admins have full access" policy still uses `auth.uid()` in subquery
  - Update to use proper (SELECT auth.uid()) pattern
  
  ## 2. Remove Unused Indexes
  - Drop indexes that are not being used by queries
  - Reduces storage overhead and improves write performance
  
  ## 3. Fix Function Security
  - Update function search_path to be immutable
  - Prevents SQL injection through search_path manipulation
  
  ## Changes
  - Recreate profiles admin policy with optimized auth check
  - Drop 7 unused indexes
  - Update 3 functions with secure search_path
*/

-- ============================================================================
-- STEP 1: FIX PROFILES ADMIN POLICY
-- ============================================================================

-- Drop and recreate the admin policy with proper optimization
DROP POLICY IF EXISTS "Admins have full access" ON public.profiles;

CREATE POLICY "Admins have full access"
  ON public.profiles FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM profiles
      WHERE id = (SELECT auth.uid())
      AND role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM profiles
      WHERE id = (SELECT auth.uid())
      AND role = 'admin'
    )
  );

-- ============================================================================
-- STEP 2: DROP UNUSED INDEXES
-- ============================================================================

-- These indexes exist but are not being used by any queries
DROP INDEX IF EXISTS public.idx_rental_gear_availability;
DROP INDEX IF EXISTS public.idx_submitted_applications_position_id;
DROP INDEX IF EXISTS public.idx_submitted_applications_status;
DROP INDEX IF EXISTS public.idx_job_positions_team_name;
DROP INDEX IF EXISTS public.idx_job_positions_team_id;
DROP INDEX IF EXISTS public.idx_access_requests_email;
DROP INDEX IF EXISTS public.idx_access_requests_status;

-- ============================================================================
-- STEP 3: FIX FUNCTION SECURITY (IMMUTABLE SEARCH_PATH)
-- ============================================================================

-- Recreate trigger_set_timestamp with secure search_path
DROP FUNCTION IF EXISTS public.trigger_set_timestamp() CASCADE;

CREATE FUNCTION public.trigger_set_timestamp()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- Recreate handle_new_user with secure search_path
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;

CREATE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
BEGIN
  INSERT INTO public.profiles (id, role, email, first_name, last_name)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'role', 'client'),
    NEW.email,
    NEW.raw_user_meta_data->>'first_name',
    NEW.raw_user_meta_data->>'last_name'
  );
  RETURN NEW;
END;
$$;

-- Recreate update_updated_at_column with secure search_path
DROP FUNCTION IF EXISTS public.update_updated_at_column() CASCADE;

CREATE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- ============================================================================
-- STEP 4: RECREATE TRIGGERS AFTER FUNCTION CHANGES
-- ============================================================================

-- Recreate triggers that use these functions
DO $$
DECLARE
  r RECORD;
BEGIN
  -- Recreate update_updated_at triggers
  FOR r IN 
    SELECT tablename 
    FROM pg_tables 
    WHERE schemaname = 'public' 
    AND tablename IN ('services', 'rental_gear', 'teams', 'job_positions', 'submitted_applications', 'access_requests', 'profiles')
  LOOP
    EXECUTE format('DROP TRIGGER IF EXISTS update_updated_at ON public.%I', r.tablename);
    EXECUTE format('
      CREATE TRIGGER update_updated_at
      BEFORE UPDATE ON public.%I
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at_column()
    ', r.tablename);
  END LOOP;
  
  -- Recreate handle_new_user trigger
  DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
  CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();
END $$;
