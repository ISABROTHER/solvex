// src/lib/supabase/operations.ts
// @ts-nocheck
import { supabase } from './client';
import type { Database } from './database.types';

// --- Types for Access Requests ---
export type AccessRequest = Database['public']['Tables']['access_requests']['Row'];
export type AccessRequestUpdate = Database['public']['Tables']['access_requests']['Update'];

// ... (keep existing functions like getRentalEquipment, getAllRentalEquipment, etc.) ...

// --- Access Request Operations ---

/**
 * Fetches all access requests (consider filtering by 'pending' in production)
 */
export const getAccessRequests = async () => {
  return supabase
    .from('access_requests')
    .select('*')
    // Optionally filter for only pending requests initially:
    // .eq('status', 'pending')
    .order('created_at', { ascending: true });
};

/**
 * Updates the status of an access request.
 */
export const updateAccessRequestStatus = async (id: string, newStatus: 'approved' | 'rejected') => {
  return supabase
    .from('access_requests')
    .update({ status: newStatus, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select() // Return the updated row
    .single(); // Expect only one row
};

/**
 * Invites a new user via email (Requires SERVICE_ROLE_KEY setup or admin privileges)
 * IMPORTANT: Calling admin functions directly from the client-side is generally
 * discouraged for security reasons. Ideally, this would be handled by a Supabase Edge Function.
 * For now, this assumes the client has sufficient privilege OR you understand the security implications.
 */
export const inviteUserByEmail = async (email: string) => {
   // Check if admin API is available (it might not be in a standard browser environment)
   if (!supabase.auth.admin) {
       console.error("supabase.auth.admin is not available. Ensure you are using the client appropriately or move this logic to a backend function.");
       return { data: null, error: { message: "Admin Auth API not available." } };
   }
   try {
     const { data, error } = await supabase.auth.admin.inviteUserByEmail(email);
     if (error) {
         console.error("Error inviting user:", error.message);
         // Handle specific errors, e.g., user already exists
         if (error.message.includes('already registered')) {
            // Decide how to handle existing users - maybe just approve request without invite?
            return { data: { user: null, /* indication of existing user */ }, error: null };
         }
     }
     return { data, error };
   } catch (err) {
      console.error("Caught exception during invite:", err);
      return { data: null, error: { message: err.message || "An unexpected error occurred during invite." } };
   }
};

/**
 * Creates a profile entry for a user (linking auth user to role and details)
 * Assumes a 'profiles' table exists with 'id' (matching auth.users.id) and 'role' columns.
 */
export const createClientProfile = async (userId: string, firstName: string, lastName: string, email: string, phone: string, company?: string | null) => {
    // Check if profile exists first to avoid errors (optional but good practice)
    const { data: existingProfile, error: checkError } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', userId)
        .maybeSingle();

    if (checkError) {
        console.error("Error checking for existing profile:", checkError);
        return { data: null, error: checkError };
    }
    if (existingProfile) {
        console.log(`Profile for user ${userId} already exists.`);
        // Optionally update the profile here if needed
        return { data: existingProfile, error: null };
    }

    // Create new profile
    return supabase
        .from('profiles') // ** MAKE SURE 'profiles' TABLE EXISTS **
        .insert({
            id: userId,          // Link to auth.users table
            role: 'client',      // Assign the client role
            first_name: firstName,
            last_name: lastName,
            email: email,        // Storing email here might be redundant but can be useful
            phone: phone,
            company: company,
        })
        .select()
        .single();
};


// --- Add listener for access request changes ---
export const onAccessRequestsChange = (callback: () => void) => {
  return supabase
    .channel('public:access_requests')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'access_requests' }, callback)
    .subscribe();
};

// ... (keep other existing functions) ...