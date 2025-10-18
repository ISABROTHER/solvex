// src/lib/supabase/operations.ts
// @ts-nocheck
import { supabase } from './client';
import type { Database } from './database.types';

// --- Type for Access Requests (ensure columns match your SQL) ---
export type AccessRequest = Database['public']['Tables']['access_requests']['Row'];
// Add Update type if needed, though status update is simple
// export type AccessRequestUpdate = Database['public']['Tables']['access_requests']['Update'];


// --- Existing functions (getRentalEquipment, services, jobs, etc.) ---
// ... keep all previously defined functions ...


// --- NEW Access Request Operations ---

/**
 * Fetches access requests, optionally filtering by status.
 */
export const getAccessRequests = async (status?: 'pending' | 'approved' | 'rejected') => {
  let query = supabase
    .from('access_requests')
    .select('*')
    .order('created_at', { ascending: true }); // Show oldest first

  if (status) {
    query = query.eq('status', status);
  }

  return query; // Returns { data, error }
};

/**
 * Updates the status of a specific access request.
 */
export const updateAccessRequestStatus = async (id: string, newStatus: 'approved' | 'rejected') => {
  return supabase
    .from('access_requests')
    .update({ status: newStatus, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select() // Return the updated row(s)
    .single(); // Expect only one row
};

/**
 * Invites a user via Supabase Auth Admin API.
 * ⚠️ SECURITY WARNING: Avoid calling admin functions directly from the client-side
 * in production. Use a Supabase Edge Function for security. This implementation
 * assumes the risks are understood or it's for development/internal tools.
 */
export const inviteUserByEmail = async (email: string) => {
   if (!supabase.auth.admin) {
       console.error("supabase.auth.admin is not available. Check Supabase client setup or move logic to Edge Function.");
       // Return an error structure consistent with Supabase client errors
       return { data: null, error: { message: "Admin Auth API not available on client." } };
   }
   try {
     // Use the admin API to invite
     const { data, error } = await supabase.auth.admin.inviteUserByEmail(email);

     // Handle specific "user already exists" error gracefully
     if (error && error.message?.includes('already registered')) {
        console.warn(`User ${email} already registered. Proceeding without sending new invite.`);
        // Return a specific indicator or fetch the existing user
        const { data: existingUserData, error: getUserError } = await supabase.auth.admin.listUsers({ email: email });
        if (getUserError || !existingUserData?.users?.length) {
            console.error("Failed to retrieve existing user after invite conflict:", getUserError);
            return { data: null, error: { message: `User exists but failed to retrieve: ${getUserError?.message}` }};
        }
        return { data: { user: existingUserData.users[0] }, error: null }; // Return existing user data
     }
     // Return regular success or other errors
     return { data, error };
   } catch (err: any) {
      console.error("Caught exception during inviteUserByEmail:", err);
      return { data: null, error: { message: err.message || "An unexpected error occurred during invite." } };
   }
};

/**
 * Creates or updates a profile entry for a user in the 'profiles' table.
 * Links the Supabase Auth user ID to application-specific data like role.
 */
export const createOrUpdateClientProfile = async (
    userId: string,
    firstName: string,
    lastName: string,
    email: string,
    phone: string,
    company?: string | null
) => {
    // Data to insert or update in the 'profiles' table
    const profileData = {
        id: userId,          // Must match the auth.users.id
        role: 'client',      // Assign the 'client' role
        first_name: firstName,
        last_name: lastName,
        email: email,        // Storing email redundantly can be useful
        phone: phone,
        company: company,
        updated_at: new Date().toISOString(), // Ensure updated_at is set
    };

    // Use upsert to handle both new profiles and existing ones
    // `onConflict: 'id'` tells Supabase to update if a profile with this ID already exists
    return supabase
        .from('profiles') // ** CHECK YOUR TABLE NAME **
        .upsert(profileData, { onConflict: 'id' })
        .select() // Return the created or updated profile row
        .single(); // Expect only one row
};

// --- Realtime listener for access requests ---
export const onAccessRequestsChange = (callback: (payload: any) => void) => {
  return supabase
    .channel('public:access_requests:admin') // Use a unique channel name
    .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'access_requests' },
        callback // Call the provided function when changes occur
     )
    .subscribe();
};

// ... (keep other existing functions) ...