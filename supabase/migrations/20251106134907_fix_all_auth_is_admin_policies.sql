/*
  # Fix All Remaining auth_is_admin() Policies

  1. Problem
    - Multiple tables still use deleted `auth_is_admin()` function
    - This causes queries to fail when admin tries to access data
    - Affects: assignments, assignment_comments, assignment_events, assignment_milestones, 
      assignment_deliverables, and storage buckets
  
  2. Solution
    - Drop all old policies using `auth_is_admin()`
    - Create new policies using `current_user_is_admin()`
    - Also clean up duplicate profiles policies that were missed
  
  3. Changes
    - Assignment-related tables: 5 tables updated
    - Storage buckets: 3 buckets updated
    - Profiles: Remove old duplicate policies
  
  4. Security
    - Maintains admin access to all assignment and storage data
    - Uses reliable database lookup instead of JWT claims
*/

-- ============================================
-- CLEAN UP OLD PROFILES POLICIES (duplicates)
-- ============================================
DROP POLICY IF EXISTS "delete_profiles_admin" ON profiles;
DROP POLICY IF EXISTS "select_all_profiles_admin" ON profiles;
DROP POLICY IF EXISTS "update_all_profiles_admin" ON profiles;

-- ============================================
-- ASSIGNMENTS TABLE
-- ============================================
DROP POLICY IF EXISTS "admin_all_assignments" ON assignments;

CREATE POLICY "Admin can manage all assignments"
  ON assignments FOR ALL
  TO authenticated
  USING (current_user_is_admin())
  WITH CHECK (current_user_is_admin());

-- ============================================
-- ASSIGNMENT_COMMENTS TABLE
-- ============================================
DROP POLICY IF EXISTS "admin_all_comments" ON assignment_comments;

CREATE POLICY "Admin can manage all assignment comments"
  ON assignment_comments FOR ALL
  TO authenticated
  USING (current_user_is_admin())
  WITH CHECK (current_user_is_admin());

-- ============================================
-- ASSIGNMENT_EVENTS TABLE
-- ============================================
DROP POLICY IF EXISTS "admin_all_events" ON assignment_events;

CREATE POLICY "Admin can manage all assignment events"
  ON assignment_events FOR ALL
  TO authenticated
  USING (current_user_is_admin())
  WITH CHECK (current_user_is_admin());

-- ============================================
-- ASSIGNMENT_MILESTONES TABLE
-- ============================================
DROP POLICY IF EXISTS "admin_all_milestones" ON assignment_milestones;

CREATE POLICY "Admin can manage all assignment milestones"
  ON assignment_milestones FOR ALL
  TO authenticated
  USING (current_user_is_admin())
  WITH CHECK (current_user_is_admin());

-- ============================================
-- ASSIGNMENT_DELIVERABLES TABLE
-- ============================================
DROP POLICY IF EXISTS "admin_all_deliverables" ON assignment_deliverables;

CREATE POLICY "Admin can manage all assignment deliverables"
  ON assignment_deliverables FOR ALL
  TO authenticated
  USING (current_user_is_admin())
  WITH CHECK (current_user_is_admin());

-- ============================================
-- STORAGE: BRIEFS BUCKET
-- ============================================
DROP POLICY IF EXISTS "admin_all_briefs" ON storage.objects;

CREATE POLICY "Admin can manage all briefs in storage"
  ON storage.objects FOR ALL
  TO authenticated
  USING (bucket_id = 'briefs' AND current_user_is_admin())
  WITH CHECK (bucket_id = 'briefs' AND current_user_is_admin());

-- ============================================
-- STORAGE: DELIVERABLES BUCKET
-- ============================================
DROP POLICY IF EXISTS "admin_all_deliverables" ON storage.objects;

CREATE POLICY "Admin can manage all deliverables in storage"
  ON storage.objects FOR ALL
  TO authenticated
  USING (bucket_id = 'deliverables' AND current_user_is_admin())
  WITH CHECK (bucket_id = 'deliverables' AND current_user_is_admin());

-- ============================================
-- STORAGE: EMPLOYEE_DOCUMENTS BUCKET
-- ============================================
DROP POLICY IF EXISTS "admin_all_employee_documents" ON storage.objects;

CREATE POLICY "Admin can manage all employee documents in storage"
  ON storage.objects FOR ALL
  TO authenticated
  USING (bucket_id = 'employee_documents' AND current_user_is_admin())
  WITH CHECK (bucket_id = 'employee_documents' AND current_user_is_admin());
