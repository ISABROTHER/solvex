/*
  # Fix Employee Documents RLS Policy for Admin Access

  1. Problem
    - employee_documents table still uses old `auth_is_admin()` function
    - This function was deleted in previous migration
    - Causes documents query to fail when viewing employee profiles
  
  2. Solution
    - Drop the old policy using `auth_is_admin()`
    - Create new policy using `current_user_is_admin()`
  
  3. Changes
    - Drop policy: `admin_all_documents`
    - Create new policy: `Admin can manage all employee documents`
  
  4. Security
    - Maintains admin access to all employee documents
    - Uses the new helper function that queries profiles table directly
*/

-- Drop old policy that uses deleted function
DROP POLICY IF EXISTS "admin_all_documents" ON employee_documents;

-- Create new admin policy using current_user_is_admin()
CREATE POLICY "Admin can manage all employee documents"
  ON employee_documents FOR ALL
  TO authenticated
  USING (current_user_is_admin())
  WITH CHECK (current_user_is_admin());
