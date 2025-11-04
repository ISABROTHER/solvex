// src/lib/supabase/operations.ts
// @ts-nocheck
import { supabase } from './client';
import type { Database } from './database.types';

// --- Type Aliases (for convenience) ---
export type Profile = Database['public']['Tables']['profiles']['Row'];
export type Task = Database['public']['Tables']['tasks']['Row'];
export type AccessRequest = Database['public']['Tables']['access_requests']['Row'];
export type Service = Database['public']['Tables']['services']['Row'];
export type CareerApplication = Database['public']['Tables']['submitted_applications']['Row'];
export type JobPosition = Database['public']['Tables']['job_positions']['Row'];
export type Team = Database['public']['Tables']['teams']['Row'];
export type RentalGear = Database['public']['Tables']['rental_gear']['Row'];

/**
 * Fetches the full profile for the currently authenticated user.
 */
export const getAuthedUserProfile = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { data: null, error: { message: "Not authenticated" } };

  return supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();
};

/**
 * Fetches all tasks assigned to the currently authenticated user.
 */
export const getMyTasks = async () => {
   const { data: { user } } = await supabase.auth.getUser();
   if (!user) return { data: null, error: { message: "Not authenticated" } };
  
  return supabase
    .from('tasks')
    .select('*')
    .eq('assigned_to', user.id)
    .order('deadline', { ascending: true, nullsFirst: false });
};

/**
 * Updates the avatar URL for the authenticated user.
 */
export const updateProfileAvatar = async (avatarUrl: string) => {
   const { data: { user } } = await supabase.auth.getUser();
   if (!user) return { data: null, error: { message: "Not authenticated" } };

  return supabase
    .from('profiles')
    .update({ avatar_url: avatarUrl, updated_at: new Date().toISOString() })
    .eq('id', user.id)
    .select()
    .single();
};

/**
 * Updates a specific task's status.
 * (Assumes RLS policy allows 'assigned_to' user to update status)
 */
export const updateTaskStatus = async (taskId: string, newStatus: 'pending' | 'in_progress' | 'done') => {
  return supabase
    .from('tasks')
    .update({ status: newStatus })
    .eq('id', taskId)
    .select()
    .single();
};


// --- EXISTING Access Request Operations ---

export const getAccessRequests = async (status?: 'pending' | 'approved' | 'rejected') => {
  let query = supabase
    .from('access_requests')
    .select('*')
    .order('created_at', { ascending: true }); 
  if (status) query = query.eq('status', status);
  return query;
};

export const updateAccessRequestStatus = async (id: string, newStatus: 'approved' | 'rejected') => {
  return supabase
    .from('access_requests')
    .update({ status: newStatus, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select() 
    .single(); 
};

export const inviteUserByEmail = async (email: string) => {
   if (!supabase.auth.admin) {
       console.error("supabase.auth.admin is not available.");
       return { data: null, error: { message: "Admin Auth API not available on client." } };
   }
   try {
     const { data, error } = await supabase.auth.admin.inviteUserByEmail(email);
     if (error && error.message?.includes('already registered')) {
        console.warn(`User ${email} already registered.`);
        const { data: existingUserData, error: getUserError } = await supabase.auth.admin.listUsers({ email: email });
        if (getUserError || !existingUserData?.users?.length) {
            console.error("Failed to retrieve existing user after invite conflict:", getUserError);
            return { data: null, error: { message: `User exists but failed to retrieve: ${getUserError?.message}` }};
        }
        return { data: { user: existingUserData.users[0] }, error: null }; 
     }
     return { data, error };
   } catch (err: any) {
      console.error("Caught exception during inviteUserByEmail:", err);
      return { data: null, error: { message: err.message || "An unexpected error occurred during invite." } };
   }
};

/**
 * Creates or updates a profile entry for a user.
 * MODIFIED: Now uses 'full_name' to match new 'profiles' schema.
 */
export const createOrUpdateClientProfile = async (
    userId: string,
    firstName: string,
    lastName: string,
    email: string,
    phone: string,
    company?: string | null
) => {
    const profileData = {
        id: userId,
        role: 'client',
        full_name: `${firstName} ${lastName}`, // Combine to full_name
        email: email, 
        phone: phone,
        company: company,
        updated_at: new Date().toISOString(),
    };

    return supabase
        .from('profiles')
        .upsert(profileData, { onConflict: 'id' })
        .select() 
        .single();
};

export const onAccessRequestsChange = (callback: (payload: any) => void) => {
  const channel = supabase
    .channel('access_requests_changes')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'access_requests' }, callback)
    .subscribe();
  return channel;
};

// --- EXISTING Service Operations ---

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

// --- EXISTING Career/Job Operations ---

export const getCareerApplications = async (status?: string) => {
  let query = supabase
    .from('submitted_applications') 
    .select(`*, job_position:job_positions (title, description, team_name, team_id)`)
    .order('created_at', { ascending: false });
  if (status) query = query.eq('status', status);
  return query;
};
export const updateCareerApplicationStatus = async (id: string, status: string) => {
  return supabase.from('submitted_applications').update({ status }).eq('id', id).select().single();
};
export const getOpenJobPositions = async () => {
  return supabase.from('job_positions').select('*').eq('status', 'open').is('deleted_at', null).order('title');
};
export const getActiveTeams = async () => {
  return supabase.from('teams').select('*').is('deleted_at', null).neq('is_deleted', true).order('name');
};

// --- EXISTING Rental Operations ---

export const getRentalEquipment = async () => {
  // ... (existing code) ...
};
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

// --- EXISTING Admin/Team Operations ---

export const getAllTeams = async () => {
  return supabase.from('teams').select('*').neq('is_deleted', true).order('name');
};
export const getDeletedTeams = async () => {
  return supabase.from('teams').select('*').eq('is_deleted', true).order('deleted_at', { ascending: false });
};
export const restoreTeam = async (id: string) => {
  return supabase.from('teams').update({ is_deleted: false, deleted_at: null }).eq('id', id).select().single();
};
export const getMembers = async (teamId?: string) => {
  let query = supabase.from('members').select('*');
  if (teamId) query = query.eq('team_id', teamId);
  return query.order('created_at');
};
export const createTeam = async (team: Omit<Team, 'id' | 'created_at' | 'updated_at'>) => {
  return supabase.from('teams').insert(team).select().single();
};
export const updateTeam = async (id: string, updates: Partial<Team>) => {
  return supabase.from('teams').update(updates).eq('id', id).select().single();
};
export const deleteTeam = async (id: string) => {
  return supabase.from('teams').update({ deleted_at: new Date().toISOString(), is_deleted: true }).eq('id', id).select().single();
};
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