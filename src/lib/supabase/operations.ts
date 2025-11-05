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
  const channel = supabase
    .channel('access_requests_changes')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'access_requests' }, callback)
    .subscribe();
  return channel;
};

// --- START: NEW ASSIGNMENT FUNCTIONS ---

// Helper to get full profile data for assignees
const getProfilesForAssignment = async (assignmentId: string) => {
  const { data, error } = await supabase
    .from('assignment_members')
    .select('profile:profiles!inner(id, first_name, last_name, avatar_url)')
    .eq('assignment_id', assignmentId);
  if (error) return [];
  return data.map(item => item.profile);
};

// Helper to get comments for an assignment
const getCommentsForAssignment = async (assignmentId: string) => {
   const { data, error } = await supabase
    .from('assignment_messages')
    .select(`
      id, 
      content, 
      created_at,
      profile:profiles!sender_id(first_name, last_name, avatar_url)
    `)
    .eq('assignment_id', assignmentId)
    .order('created_at', { ascending: true });
  if (error) return [];
  return data;
}

// 1. GET ALL ASSIGNMENTS FOR A SPECIFIC EMPLOYEE
export const getAssignmentsForEmployee = async (employeeId: string) => {
  const { data, error } = await supabase
    .from('assignment_members')
    .select('assignment:assignments!inner(*)')
    .eq('employee_id', employeeId);

  if (error) throw error;
  if (!data) return { data: [], error: null };

  // This is the "polyfill" to fix the white screen.
  // We fetch real data, then add the empty fields the component expects.
  const fullAssignments = await Promise.all(
    data.map(async (item) => {
      const assignment = item.assignment;
      // Fetch real assignees and comments
      const [assignees, comments] = await Promise.all([
        getProfilesForAssignment(assignment.id),
        getCommentsForAssignment(assignment.id)
      ]);
      
      return {
        ...assignment,
        description: assignment.instructions, // Map instructions to description
        // Add all the missing fields that the UI component expects
        milestones: [],
        attachments: [],
        deliverables: [],
        supervisor: null,
        category: 'Admin Task',
        priority: 'medium',
        // Add the real data we fetched
        assignees: assignees,
        comments: comments,
      };
    })
  );
  
  return { data: fullAssignments, error: null };
};

// 2. GET FULL DETAILS FOR ONE ASSIGNMENT (used when clicking)
export const getFullAssignmentDetails = async (assignmentId: string) => {
  const { data: assignment, error } = await supabase
    .from('assignments')
    .select('*')
    .eq('id', assignmentId)
    .single();
    
  if (error) throw error;

  // Fetch real assignees and comments
  const [assignees, comments] = await Promise.all([
    getProfilesForAssignment(assignmentId),
    getCommentsForAssignment(assignmentId)
  ]);

  // Polyfill missing fields to prevent white screen
  const fullAssignment = {
    ...assignment,
    description: assignment.instructions,
    milestones: [],
    attachments: [],
    deliverables: [],
    supervisor: null,
    category: 'Admin Task',
    priority: 'medium',
    assignees: assignees,
    comments: comments,
  };

  return { data: fullAssignment, error: null };
};

// 3. CREATE A NEW ASSIGNMENT
export const createAssignment = async (formData: any, adminId: string) => {
  const { data: newAssignment, error } = await supabase
    .from('assignments')
    .insert({
      title: formData.title,
      instructions: formData.description, // Map description to instructions
      due_date: formData.dueDate || null,
      status: 'pending',
      created_by: adminId,
    })
    .select()
    .single();

  if (error) return { error };

  // Add members
  const memberInserts = formData.assignees.map((employeeId: string) => ({
    assignment_id: newAssignment.id,
    employee_id: employeeId,
  }));

  const { error: memberError } = await supabase
    .from('assignment_members')
    .insert(memberInserts);

  if (memberError) return { error: memberError };
  
  return { data: newAssignment, error: null };
};

// 4. UPDATE ASSIGNMENT STATUS
export const updateAssignmentStatus = async (assignmentId: string, status: string) => {
  return supabase
    .from('assignments')
    .update({ status: status })
    .eq('id', assignmentId);
};

// 5. POST A COMMENT
export const postAssignmentComment = async (assignmentId: string, senderId: string, content: string) => {
  return supabase
    .from('assignment_messages')
    .insert({
      assignment_id: assignmentId,
      sender_id: senderId,
      content: content,
    });
};

// --- END: NEW ASSIGNMENT FUNCTIONS ---

// --- START: EMPLOYEE DOCUMENT FUNCTIONS ---
export type EmployeeDocument = Database['public']['Tables']['employee_documents']['Row'];

/**
 * Fetches all documents for a specific employee.
 */
export const getEmployeeDocuments = async (profileId: string) => {
  return supabase
    .from('employee_documents')
    .select('*')
    .eq('profile_id', profileId)
    .order('created_at', { ascending: false });
};

/**
 * Uploads a document for an employee.
 */
export const uploadEmployeeDocument = async (
  profileId: string,
  fileName: string,
  requiresSigning: boolean,
  file: File
) => {
  // 1. Upload the file to storage
  const filePath = `${profileId}/${file.name}`;
  const { data: storageData, error: storageError } = await supabase.storage
    .from('employee_documents')
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: true, // Overwrite if exists
    });

  if (storageError) throw storageError;

  // 2. Get the public URL
  const { data: urlData } = supabase.storage
    .from('employee_documents')
    .getPublicUrl(storageData.path);
  
  const publicUrl = urlData.publicUrl;

  // 3. Insert the record into the database table
  const { data: dbData, error: dbError } = await supabase
    .from('employee_documents')
    .insert({
      profile_id: profileId,
      document_name: fileName,
      storage_url: publicUrl, // Store the public URL
      requires_signing: requiresSigning,
    })
    .select()
    .single();

  if (dbError) throw dbError;
  return dbData;
};

/**
 * Deletes an employee document from both storage and database.
 */
export const deleteEmployeeDocument = async (doc: EmployeeDocument) => {
  // 1. Delete from storage
  // Extract the file path from the URL
  const urlParts = doc.storage_url.split('/');
  const filePath = `${doc.profile_id}/${urlParts[urlParts.length - 1]}`;

  const { error: storageError } = await supabase.storage
    .from('employee_documents')
    .remove([filePath]);

  if (storageError && storageError.message !== 'The resource was not found') {
    console.warn("Storage delete error:", storageError.message);
  }
  
  // Also try to delete signed doc if it exists
  if(doc.signed_storage_url) {
     const signedUrlParts = doc.signed_storage_url.split('/');
     const signedFilePath = `${doc.profile_id}/${signedUrlParts[signedUrlParts.length - 1]}`;
     await supabase.storage.from('employee_documents').remove([signedFilePath]);
  }

  // 2. Delete from database
  const { error: dbError } = await supabase
    .from('employee_documents')
    .delete()
    .eq('id', doc.id);

  if (dbError) throw dbError;
  return true;
};

/**
 * Generates a signed URL for viewing a private document.
 * NOTE: This is how employees will view docs. Admins can use public URLs
 * if policies are set, but signed URLs are safer.
 */
export const createDocumentSignedUrl = async (doc: EmployeeDocument) => {
  const urlParts = doc.storage_url.split('/');
  const filePath = `${doc.profile_id}/${urlParts[urlParts.length - 1]}`;

  const { data, error } = await supabase.storage
    .from('employee_documents')
    .createSignedUrl(filePath, 60); // URL expires in 60 seconds
  
  if (error) throw error;
  return data.signedUrl;
};

// --- END: EMPLOYEE DOCUMENT FUNCTIONS ---


export type Service = Database['public']['Tables']['services']['Row'];

export const getServices = async () => {
  return supabase.from('services').select('*').is('deleted_at', null).order('title');
};

export const createService = async (service: Omit<Service, 'id' | 'created_at' | 'updated_at' | 'deleted_at'>) => {
  return supabase.from('services').insert(service).select().single();
};

export const updateService = async (id: string, updates: Partial<Service>) => {
  return supabase.from('services').update(updates).eq('id', id).select().single();
};

export const softDeleteService = async (id: string) => {
  return supabase.from('services').update({ deleted_at: new Date().toISOString() }).eq('id', id).select().single();
};

export const restoreService = async (id: string) => {
  return supabase.from('services').update({ deleted_at: null }).eq('id', id).select().single();
};

export const permanentDeleteService = async (id: string) => {
  return supabase.from('services').delete().eq('id', id);
};

export const getDeletedServices = async () => {
  return supabase.from('services').select('*').not('deleted_at', 'is', null).order('deleted_at', { ascending: false });
};

export const onServicesChange = (callback: (payload: any) => void) => {
  const channel = supabase
    .channel('services_changes')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'services' }, callback)
    .subscribe();
  return channel;
};

export type CareerApplication = Database['public']['Tables']['submitted_applications']['Row'];

/**
 * Fetches applications from 'submitted_applications' and joins 'job_positions' data.
 */
export const getCareerApplications = async (status?: string) => {
  let query = supabase
    .from('submitted_applications') // <-- USES YOUR TABLE
    .select(`
      id,
      first_name, 
      last_name, 
      email,
      phone,
      country_code,
      job_position_id,
      position_title,
      cover_letter,
      portfolio_url,
      status,
      created_at,
      updated_at,
      job_position:job_positions (
        title,
        description,
        team_name,
        team_id
      )
    `)
    .order('created_at', { ascending: false });
    
  if (status) query = query.eq('status', status);
  return query;
};

/**
 * Updates an application's status in 'submitted_applications'.
 */
export const updateCareerApplicationStatus = async (id: string, status: string) => {
  return supabase
    .from('submitted_applications') // <-- USES YOUR TABLE
    .update({ status })
    .eq('id', id)
    .select()
    .single();
};

export type JobPosition = Database['public']['Tables']['job_positions']['Row'];

/**
 * Fetches all *open* job positions. (For public careers page)
 */
export const getOpenJobPositions = async () => {
  return supabase
    .from('job_positions')
    .select('*')
    .eq('status', 'open')
    .is('deleted_at', null)
    .order('title');
};

/**
 * Fetches all *active* (not deleted) teams. (For public careers page)
 */
export const getActiveTeams = async () => {
  return supabase
    .from('teams')
    .select('*')
    .is('deleted_at', null) // Use 'is' or 'neq' depending on your 'is_deleted' column
    .neq('is_deleted', true)
    .order('name');
};

// Mapped type for rental equipment display in the UI
export interface RentalItemDisplay {
  id: string;
  title: string;
  subtitle: string | null;
  category: string | null;
  price: number;
  images: string[] | null;
  features: string[] | null;
  videoUrl: string | null;
  status: string;
}

// Maps database rental_gear row to RentalItemDisplay format
const mapRentalGearToDisplay = (gear: RentalGear): RentalItemDisplay => {
  return {
    id: gear.id,
    title: gear.name,
    subtitle: gear.description,
    category: gear.category,
    price: gear.price_per_day,
    images: gear.image_url ? [gear.image_url] : null,
    features: gear.features,
    videoUrl: gear.video_url,
    status: gear.is_available ? 'Available' : 'Unavailable'
  };
};

export const getRentalEquipment = async () => {
  const result = await supabase.from('rental_gear').select('*').order('name');

  if (result.error) {
    return { data: null, error: result.error };
  }

  const mappedData = result.data?.map(mapRentalGearToDisplay) || [];
  return { data: mappedData, error: null };
};

/**
 * Fetches all *active* teams for the admin panel.
 */
export const getAllTeams = async () => {
  // Only select teams that are NOT soft-deleted.
  return supabase
    .from('teams')
    .select('*')
    .neq('is_deleted', true) // Keep this filter
    .order('name');
};

export const getMembers = async (teamId?: string) => {
  let query = supabase.from('members').select('*');
  if (teamId) query = query.eq('team_id', teamId);
  return query.order('created_at');
};

export type Team = Database['public']['Tables']['teams']['Row'];

export const createTeam = async (team: Omit<Team, 'id' | 'created_at' | 'updated_at'>) => {
  return supabase.from('teams').insert(team).select().single();
};

export const updateTeam = async (id: string, updates: Partial<Team>) => {
  return supabase.from('teams').update(updates).eq('id', id).select().single();
};

export const deleteTeam = async (id: string) => {
  return supabase.from('teams').update({ deleted_at: new Date().toISOString(), is_deleted: true }).eq('id', id).select().single();
};

export type RentalGear = Database['public']['Tables']['rental_gear']['Row'];

export const getAllRentalEquipment = async () => {
  return supabase.from('rental_gear').select('*').order('name');
};

export const updateRentalEquipment = async (id: string, updates: Partial<RentalGear>) => {
  return supabase.from('rental_gear').update(updates).eq('id', id).select().single();
};

export const deleteRentalEquipment = async (id: string) => {
  return supabase.from('rental_gear').delete().eq('id', id);
};

export const onRentalGearChange = (callback: (payload: any) => void) => {
  const channel = supabase
    .channel('rental_gear_changes')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'rental_gear' }, callback)
    .subscribe();
  return channel;
};

/**
 * Fetches *all* job positions for the admin panel.
 */
export const getAllJobPositions = async () => {
  return supabase.from('job_positions').select('*').order('title');
};

export const createJobPosition = async (job: Omit<JobPosition, 'id' | 'created_at' | 'updated_at'>) => {
  return supabase.from('job_positions').insert(job).select().single();
};

export const updateJobPosition = async (id: string, updates: Partial<JobPosition>) => {
  return supabase.from('job_positions').update(updates).eq('id', id).select().single();
};

export const deleteJobPosition = async (id: string) => {
  // --- MODIFICATION: Changed from .update() to .delete() ---
  return supabase.from('job_positions').delete().eq('id', id);
};

export const getDeletedTeams = async () => {
  return supabase
    .from('teams')
    .select('*')
    .eq('is_deleted', true) // Only get deleted ones
    .order('deleted_at', { ascending: false });
};

export const restoreTeam = async (id: string) => {
  return supabase
    .from('teams')
    .update({ is_deleted: false, deleted_at: null })
    .eq('id', id)
    .select()
    .single();
};