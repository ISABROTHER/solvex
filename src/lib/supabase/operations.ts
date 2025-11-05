// src/lib/supabase/operations.ts
// @ts-nocheck
import { supabase } from './client';
import type { Database } from './database.types';

// --- START: NEW FUNCTION ---

/**
 * Fetches all essential data for the employee dashboard in one go.
 */
export const getEmployeeDashboardData = async (userId: string) => {
  const [profileRes, assignmentsRes, documentsRes] = await Promise.all([
    supabase.from('profiles').select('*').eq('id', userId).single(),
    getAssignmentsForEmployee(userId),
    getEmployeeDocuments(userId)
  ]);

  if (profileRes.error) throw profileRes.error;
  if (assignmentsRes.error) throw assignmentsRes.error;
  if (documentsRes.error) throw documentsRes.error;

  return {
    profile: profileRes.data,
    assignments: assignmentsRes.data,
    documents: documentsRes.data,
  };
};

// --- END: NEW FUNCTION ---


// --- Type for Access Requests (ensure columns match your SQL) ---
export type AccessRequest = Database['public']['Tables']['access_requests']['Row'];
// ... (keep all other existing functions) ...
// ... getAccessRequests, updateAccessRequestStatus, inviteUserByEmail, etc ...

// --- START: ASSIGNMENT FUNCTIONS ---
// ... (keep all existing assignment functions) ...
// ... getProfilesForAssignment, getCommentsForAssignment, getAssignmentsForEmployee, etc ...

// --- START: EMPLOYEE DOCUMENT FUNCTIONS ---
// ... (keep all existing document functions) ...
// ... getEmployeeDocuments, uploadEmployeeDocument, deleteEmployeeDocument, etc ...

// --- (keep all other functions for services, jobs, teams, etc.) ---