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
  return supabase.from('job_positions').update({ deleted_at: new Date().toISOString(), is_deleted: true }).eq('id', id).select().single();
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

// ============================================================================
// EMPLOYEE MANAGEMENT OPERATIONS
// ============================================================================

export type Profile = Database['public']['Tables']['profiles']['Row'];
export type ProfileInsert = Database['public']['Tables']['profiles']['Insert'];
export type ProfileUpdate = Database['public']['Tables']['profiles']['Update'];

/**
 * Fetches all employee profiles (role = 'employee')
 */
export const getAllEmployees = async () => {
  return supabase
    .from('profiles')
    .select('*')
    .eq('role', 'employee')
    .order('created_at', { ascending: false });
};

/**
 * Fetches a single employee profile by ID
 */
export const getEmployeeById = async (id: string) => {
  return supabase
    .from('profiles')
    .select('*')
    .eq('id', id)
    .eq('role', 'employee')
    .single();
};

/**
 * Creates a new employee profile
 */
export const createEmployee = async (employee: ProfileInsert) => {
  return supabase
    .from('profiles')
    .insert({ ...employee, role: 'employee' })
    .select()
    .single();
};

/**
 * Updates an existing employee profile
 */
export const updateEmployee = async (id: string, updates: ProfileUpdate) => {
  return supabase
    .from('profiles')
    .update(updates)
    .eq('id', id)
    .select()
    .single();
};

/**
 * Deletes an employee profile (hard delete)
 */
export const deleteEmployee = async (id: string) => {
  return supabase
    .from('profiles')
    .delete()
    .eq('id', id);
};

/**
 * Real-time subscription for employee profile changes
 */
export const onEmployeesChange = (callback: (payload: any) => void) => {
  const channel = supabase
    .channel('employees_changes')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'profiles',
        filter: 'role=eq.employee'
      },
      callback
    )
    .subscribe();
  return channel;
};

// ============================================================================
// EMPLOYEE DOCUMENTS OPERATIONS
// ============================================================================

export type EmployeeDocument = Database['public']['Tables']['employee_documents']['Row'];
export type EmployeeDocumentInsert = Database['public']['Tables']['employee_documents']['Insert'];

/**
 * Fetches all documents for a specific employee
 */
export const getEmployeeDocuments = async (profileId: string) => {
  return supabase
    .from('employee_documents')
    .select('*')
    .eq('profile_id', profileId)
    .order('created_at', { ascending: false });
};

/**
 * Creates a new document record
 */
export const createEmployeeDocument = async (document: EmployeeDocumentInsert) => {
  return supabase
    .from('employee_documents')
    .insert(document)
    .select()
    .single();
};

/**
 * Deletes a document record
 */
export const deleteEmployeeDocument = async (id: string) => {
  return supabase
    .from('employee_documents')
    .delete()
    .eq('id', id);
};

/**
 * Uploads a file to employee-documents storage bucket
 */
export const uploadEmployeeDocument = async (
  profileId: string,
  file: File,
  fileName: string
) => {
  const filePath = `${profileId}/${fileName}`;

  const { data, error } = await supabase.storage
    .from('employee-documents')
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: false
    });

  if (error) return { data: null, error };

  const { data: urlData } = supabase.storage
    .from('employee-documents')
    .getPublicUrl(filePath);

  return { data: { path: filePath, url: urlData.publicUrl }, error: null };
};

/**
 * Deletes a file from storage
 */
export const deleteEmployeeDocumentFile = async (path: string) => {
  return supabase.storage
    .from('employee-documents')
    .remove([path]);
};

/**
 * Real-time subscription for employee documents
 */
export const onEmployeeDocumentsChange = (profileId: string, callback: (payload: any) => void) => {
  const channel = supabase
    .channel(`employee_documents_${profileId}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'employee_documents',
        filter: `profile_id=eq.${profileId}`
      },
      callback
    )
    .subscribe();
  return channel;
};

// ============================================================================
// ASSIGNMENTS OPERATIONS
// ============================================================================

export type Assignment = Database['public']['Tables']['assignments']['Row'];
export type AssignmentInsert = Database['public']['Tables']['assignments']['Insert'];
export type AssignmentUpdate = Database['public']['Tables']['assignments']['Update'];
export type AssignmentMember = Database['public']['Tables']['assignment_members']['Row'];
export type AssignmentMessage = Database['public']['Tables']['assignment_messages']['Row'];

/**
 * Fetches all assignments (for admin)
 */
export const getAllAssignments = async () => {
  return supabase
    .from('assignments')
    .select(`
      *,
      assignment_members(
        id,
        employee_id
      )
    `)
    .order('created_at', { ascending: false });
};

/**
 * Fetches assignments for a specific employee
 */
export const getEmployeeAssignments = async (employeeId: string) => {
  return supabase
    .from('assignments')
    .select(`
      *,
      assignment_members!inner(
        id,
        employee_id
      )
    `)
    .eq('assignment_members.employee_id', employeeId)
    .order('created_at', { ascending: false });
};

/**
 * Creates a new assignment
 */
export const createAssignment = async (
  assignment: Omit<AssignmentInsert, 'created_by'>,
  employeeIds: string[]
) => {
  const { data: user } = await supabase.auth.getUser();
  if (!user.user) throw new Error('User not authenticated');

  const { data: assignmentData, error: assignmentError } = await supabase
    .from('assignments')
    .insert({ ...assignment, created_by: user.user.id })
    .select()
    .single();

  if (assignmentError) return { data: null, error: assignmentError };

  const members = employeeIds.map(empId => ({
    assignment_id: assignmentData.id,
    employee_id: empId
  }));

  const { error: membersError } = await supabase
    .from('assignment_members')
    .insert(members);

  if (membersError) return { data: null, error: membersError };

  return { data: assignmentData, error: null };
};

/**
 * Updates an assignment
 */
export const updateAssignment = async (id: string, updates: AssignmentUpdate) => {
  return supabase
    .from('assignments')
    .update(updates)
    .eq('id', id)
    .select()
    .single();
};

/**
 * Deletes an assignment
 */
export const deleteAssignment = async (id: string) => {
  return supabase
    .from('assignments')
    .delete()
    .eq('id', id);
};

/**
 * Fetches messages for an assignment
 */
export const getAssignmentMessages = async (assignmentId: string) => {
  return supabase
    .from('assignment_messages')
    .select('*')
    .eq('assignment_id', assignmentId)
    .order('created_at', { ascending: true });
};

/**
 * Sends a message in an assignment
 */
export const sendAssignmentMessage = async (
  assignmentId: string,
  content: string
) => {
  const { data: user } = await supabase.auth.getUser();
  if (!user.user) throw new Error('User not authenticated');

  return supabase
    .from('assignment_messages')
    .insert({
      assignment_id: assignmentId,
      sender_id: user.user.id,
      content
    })
    .select()
    .single();
};

/**
 * Real-time subscription for assignments
 */
export const onAssignmentsChange = (callback: (payload: any) => void) => {
  const channel = supabase
    .channel('assignments_changes')
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'assignments' },
      callback
    )
    .subscribe();
  return channel;
};

/**
 * Real-time subscription for assignment messages
 */
export const onAssignmentMessagesChange = (
  assignmentId: string,
  callback: (payload: any) => void
) => {
  const channel = supabase
    .channel(`assignment_messages_${assignmentId}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'assignment_messages',
        filter: `assignment_id=eq.${assignmentId}`
      },
      callback
    )
    .subscribe();
  return channel;
};

/**
 * Real-time subscription for assignment members
 */
export const onAssignmentMembersChange = (callback: (payload: any) => void) => {
  const channel = supabase
    .channel('assignment_members_changes')
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'assignment_members' },
      callback
    )
    .subscribe();
  return channel;
};