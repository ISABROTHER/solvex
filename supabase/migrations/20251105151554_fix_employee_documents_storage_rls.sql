/*
  # Fix Employee Documents Storage RLS Policies

  ## Problem
  1. Storage bucket policies are blocking uploads
  2. Multiple policies with wrong bucket names (employee-documents vs employee_documents)
  3. Policies use non-existent get_my_claim() function
  4. No INSERT policy for storage uploads
  5. Queries to profiles table causing issues

  ## Solution
  1. Drop all existing storage policies for employee_documents
  2. Create simple, clean policies using auth_is_admin() function
  3. Allow admins to INSERT, SELECT, UPDATE, DELETE in storage
  4. Allow employees to SELECT their own files

  ## Storage Path Structure
  Files are stored as: bucket/user_id/filename.pdf
  Example: employee_documents/70253918-093f-427d-b0ff-d57226060d9d/Employment_Contract_Unsigned.pdf

  ## Security Model
  - Admins can do everything
  - Employees can only view files in their folder (folder name = their user id)
*/

-- Drop all existing policies on storage.objects for employee_documents bucket
DROP POLICY IF EXISTS "Admins and owner can view documents" ON storage.objects;
DROP POLICY IF EXISTS "Admins can manage all storage documents" ON storage.objects;
DROP POLICY IF EXISTS "Admins can manage employee documents" ON storage.objects;
DROP POLICY IF EXISTS "Employees can view their own documents" ON storage.objects;
DROP POLICY IF EXISTS "Employees can view their own storage documents" ON storage.objects;

-- Create clean storage policies

-- 1. Admins can INSERT files (upload)
CREATE POLICY "admin_insert_employee_documents"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'employee_documents'
    AND auth_is_admin()
  );

-- 2. Admins can SELECT files (view/download)
CREATE POLICY "admin_select_employee_documents"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'employee_documents'
    AND auth_is_admin()
  );

-- 3. Admins can UPDATE files (replace)
CREATE POLICY "admin_update_employee_documents"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'employee_documents'
    AND auth_is_admin()
  )
  WITH CHECK (
    bucket_id = 'employee_documents'
    AND auth_is_admin()
  );

-- 4. Admins can DELETE files
CREATE POLICY "admin_delete_employee_documents"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'employee_documents'
    AND auth_is_admin()
  );

-- 5. Employees can view their own files
-- Files are stored in folders named by user ID: employee_documents/{user_id}/file.pdf
CREATE POLICY "employee_view_own_documents"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'employee_documents'
    AND (storage.foldername(name))[1] = (auth.uid())::text
  );
