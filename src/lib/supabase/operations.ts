// @ts-nocheck
// src/lib/supabase/operations.ts

import { supabase } from './client';
import type { Database } from './database.types';

// Define the shape of data the public frontend expects
export type RentalItemDisplay = {
  id: string;
  title: string;          
  subtitle: string | null; 
  category: string | null; 
  price: number;          
  images: string[] | null; 
  features: string[] | null; 
  videoUrl: string | null; 
  status: 'Available' | 'Unavailable' | 'Retired';
};

// Original table types (for internal Admin use)
export type RentalGear = Database['public']['Tables']['rental_gear']['Row'];
export type RentalGearInsert = Database['public']['Tables']['rental_gear']['Insert'];
export type RentalGearUpdate = Database['public']['Tables']['rental_gear']['Update'];
export type Service = Database['public']['Tables']['services']['Row'];
export type ServiceInsert = Database['public']['Tables']['services']['Insert'];
export type ServiceUpdate = Database['public']['Tables']['services']['Update'];

// --- TEAM MANAGEMENT OPERATIONS (LIVE) ---

/**
 * Fetches all teams for internal management.
 */
export const getTeams = async () => {
  return supabase
    .from('teams')
    .select('*') 
    .order('name', { ascending: true });
};


/**
 * Fetches all members and joins their associated team name.
 */
export const getMembers = async () => {
  return supabase
    .from('members')
    .select(`
        *,
        teams ( name )
    `) 
    .order('full_name', { ascending: true });
};

// Placeholder for member creation (used by ApplicationsTab when accepting a job)
export const createMember = async (member: Partial<Database['public']['Tables']['members']['Insert']>) => {
    return supabase.from('members').insert(member).select().single();
};

// --- RENTAL EQUIPMENT OPERATIONS ---

/**
 * Fetches only available rental items and maps them to the public display format.
 */
export const getRentalEquipment = async () => {
  const { data, error } = await supabase
    .from('rental_gear')
    .select(`
      id,
      name,           
      description,
      category,
      price_per_day,
      is_available,
      image_url,
      video_url,
      features
    `)
    .eq('is_available', true) 
    .order('category', { ascending: true })
    .order('name', { ascending: true });

  if (error) return { data: [], error };

  // Manually map to the expected frontend format (RentalItemDisplay)
  const mappedData = data.map(item => ({
    id: item.id,
    title: item.name,                     
    subtitle: item.description,           
    category: item.category,
    price: item.price_per_day,            
    images: item.image_url ? [item.image_url] : [''], 
    features: Array.isArray(item.features) ? item.features : (item.features ? [item.features] : []), 
    videoUrl: item.video_url,              
    status: item.is_available ? 'Available' : 'Unavailable', 
  }));
  
  return { data: mappedData, error: null };
};

/**
 * Fetches ALL equipment for the admin dashboard (no availability filter).
 */
export const getAllRentalEquipment = async () => {
  return supabase.from('rental_gear').select('*').order('name', { ascending: true });
};


/**
 * Updates a piece of rental equipment (Admin CRUD)
 */
export const updateRentalEquipment = async (id: string, updates: Partial<RentalGearUpdate>) => {
  return supabase.from('rental_gear').update(updates).eq('id', id);
};

/**
 * Deletes a piece of rental equipment (Admin CRUD)
 */
export const deleteRentalEquipment = async (id: string) => {
  return supabase.from('rental_gear').delete().eq('id', id);
};

/**
 * Subscribes to real-time changes on the rental_gear table.
 */
export const onRentalGearChange = (callback: () => void) => {
  return supabase
    .channel('public:rental_gear')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'rental_gear' }, callback)
    .subscribe();
};


// --- REAL-TIME SERVICE OPERATIONS ---
export const getServices = async () => supabase.from('services').select('*').eq('is_deleted', false).order('title', { ascending: true });

export const getDeletedServices = async () => supabase.from('services').select('*').eq('is_deleted', true);

export const createService = async (service: ServiceInsert) => supabase.from('services').insert(service).select().single();

export const updateService = async (id: string, service: ServiceUpdate) => supabase.from('services').update(service).eq('id', id).select().single();

export const softDeleteService = async (id: string) => {
  return supabase
    .from('services')
    .update({ is_deleted: true, deleted_at: new Date().toISOString() })
    .eq('id', id);
};

export const restoreService = async (id: string) => {
  return supabase
    .from('services')
    .update({ is_deleted: false, deleted_at: null })
    .eq('id', id);
};

export const onServicesChange = (callback: (payload: any) => void) => {
  return supabase
    .channel('public:services')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'services' }, callback)
    .subscribe();
};


// --- JOB POSTING OPERATIONS (Fixed join fields) ---

export const getJobTeamsAndPositions = async () => {
  const { data: teams, error: teamsError } = await supabase
    .from('job_teams')
    .select(`
      *, 
      job_positions(*) 
    `)
    .eq('is_active', true) 
    .order('name', { ascending: true });

  if (teamsError) return { data: [], error: teamsError };

  const result = teams.map(team => ({
    ...team,
    job_positions: team.job_positions || []
  }));

  return { data: result, error: null };
};

// --- CAREER APPLICATION OPERATIONS (FIXED QUERY) ---

/**
 * Fetches all career applications and joins position details.
 */
export const getCareerApplications = async () => {
  return supabase
    .from('job_applications')
    .select(`
        *,
        job_positions ( id, title, team_name, team_id, status )
    `)
    .order('created_at', { ascending: false });
};

/**
 * Updates the status of a specific job application.
 */
export const updateCareerApplicationStatus = async (id: string, newStatus: string) => {
  return supabase
    .from('job_applications')
    .update({ status: newStatus, updated_at: new Date().toISOString() })
    .eq('id', id);
};

// --- CLIENT/ADMIN REQUEST & USER OPERATIONS ---

export const getOrCreateClientForUser = async (userId: string, email?: string, fullName?: string) => {
    if (!userId) return { data: null, error: null };
    const upsertData = {
        id: userId,
        full_name: fullName,
        email: email,
        tier: 'Regular',
        is_active: true,
    };
    const { error: upsertError } = await supabase
        .from('clients')
        .upsert(upsertData, { onConflict: 'id' });
    if (upsertError) return { data: null, error: upsertError };
    const { data: clientData, error: fetchError } = await supabase
        .from('clients')
        .select('*')
        .eq('id', userId)
        .single();
    if (fetchError) return { data: null, error: fetchError };
    return { data: clientData, error: null };
};

export const createServiceRequest = async (payload: Database['public']['Tables']['service_requests']['Insert']) => {
  const { data, error } = await supabase
    .from('service_requests')
    .insert([payload])
    .select()
    .single();

  if (error) return { data: null, error };
  return { data, error: null };
};

export const listMyServiceRequests = async (clientId: string) => {
  const { data, error } = await supabase
    .from('service_requests')
    .select(`*, clients (full_name, email)`) 
    .eq('client_id', clientId)
    .order('created_at', { ascending: false });

  if (error) return { data: [], error };
  return { data, error: null };
};

export const listClientsWithStats = async (...args: any[]) => ({ data: [], error: null });

export const listServiceRequests = async () => {
  const { data, error } = await supabase
    .from('service_requests')
    .select(`*, clients (full_name, email)`) 
    .order('requested_at', { ascending: false });

  if (error) return { data: [], error };
  return { data, error: null };
};

export const updateServiceRequestStatus = async (id: string, newStatus: ServiceRequestStatus) => {
  return supabase.from('service_requests').update({ status: newStatus, updated_at: new Date().toISOString() }).eq('id', id);
};

export type ServiceRequestStatus =
  | "requested"
  | "confirmed"
  | "in_progress"
  | "completed"
  | "cancelled"
  | "pending";

export type Team = Database['public']['Tables']['teams']['Row'];
export type TeamInsert = Database['public']['Tables']['teams']['Insert'];
export type TeamUpdate = Database['public']['Tables']['teams']['Update'];

export type JobPosition = Database['public']['Tables']['job_positions']['Row'];
export type JobPositionInsert = Database['public']['Tables']['job_positions']['Insert'];
export type JobPositionUpdate = Database['public']['Tables']['job_positions']['Update'];

export type JobApplication = Database['public']['Tables']['job_applications']['Row'];
export type JobApplicationInsert = Database['public']['Tables']['job_applications']['Insert'];
export type JobApplicationUpdate = Database['public']['Tables']['job_applications']['Update'];

export const getAllTeams = async () => {
  try {
    const { data, error } = await supabase
      .from('teams')
      .select('*')
      .eq('is_deleted', false)
      .order('display_order', { ascending: true })
      .order('name', { ascending: true });

    if (error) {
      console.error('Error fetching teams:', error);
      return { data: null, error };
    }

    return { data: data || [], error: null };
  } catch (error) {
    console.error('Unexpected error fetching teams:', error);
    return { data: null, error };
  }
};

export const getAllJobPositions = async () => {
  try {
    const { data, error } = await supabase
      .from('job_positions')
      .select('*')
      .eq('is_deleted', false)
      .order('team_name', { ascending: true })
      .order('title', { ascending: true });

    if (error) {
      console.error('Error fetching job positions:', error);
      return { data: null, error };
    }

    return { data: data || [], error: null };
  } catch (error) {
    console.error('Unexpected error fetching job positions:', error);
    return { data: null, error };
  }
};

export const getActiveJobPositions = async () => {
  try {
    const { data, error } = await supabase
      .from('job_positions')
      .select('*')
      .eq('is_deleted', false)
      .eq('status', 'open')
      .order('team_name', { ascending: true })
      .order('title', { ascending: true });

    if (error) {
      console.error('Error fetching active job positions:', error);
      return { data: null, error };
    }

    return { data: data || [], error: null };
  } catch (error) {
    console.error('Unexpected error fetching active job positions:', error);
    return { data: null, error };
  }
};

export const getAllJobApplications = async () => {
  try {
    const { data, error } = await supabase
      .from('job_applications')
      .select(`
        *,
        job_positions (
          id,
          title,
          team_name,
          team_id,
          status
        )
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching job applications:', error);
      return { data: null, error };
    }

    return { data: data || [], error: null };
  } catch (error) {
    console.error('Unexpected error fetching job applications:', error);
    return { data: null, error };
  }
};

export const createTeam = async (team: TeamInsert) => {
  try {
    const { data, error } = await supabase
      .from('teams')
      .insert(team)
      .select()
      .single();

    if (error) {
      console.error('Error creating team:', error);
      return { data: null, error };
    }

    return { data, error: null };
  } catch (error) {
    console.error('Unexpected error creating team:', error);
    return { data: null, error };
  }
};

export const updateTeam = async (id: string, updates: TeamUpdate) => {
  try {
    const { data, error } = await supabase
      .from('teams')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating team:', error);
      return { data: null, error };
    }

    return { data, error: null };
  } catch (error) {
    console.error('Unexpected error updating team:', error);
    return { data: null, error };
  }
};

export const deleteTeam = async (id: string) => {
  try {
    const { data, error } = await supabase
      .from('teams')
      .update({
        is_deleted: true,
        deleted_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error deleting team:', error);
      return { data: null, error };
    }

    return { data, error: null };
  } catch (error) {
    console.error('Unexpected error deleting team:', error);
    return { data: null, error };
  }
};

export const createJobPosition = async (position: JobPositionInsert) => {
  try {
    const { data, error } = await supabase
      .from('job_positions')
      .insert(position)
      .select()
      .single();

    if (error) {
      console.error('Error creating job position:', error);
      return { data: null, error };
    }

    return { data, error: null };
  } catch (error) {
    console.error('Unexpected error creating job position:', error);
    return { data: null, error };
  }
};

export const updateJobPosition = async (id: string, updates: JobPositionUpdate) => {
  try {
    const { data, error } = await supabase
      .from('job_positions')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating job position:', error);
      return { data: null, error };
    }

    return { data, error: null };
  } catch (error) {
    console.error('Unexpected error updating job position:', error);
    return { data: null, error };
  }
};

export const deleteJobPosition = async (id: string) => {
  try {
    const { data, error } = await supabase
      .from('job_positions')
      .update({
        is_deleted: true,
        deleted_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error deleting job position:', error);
      return { data: null, error };
    }

    return { data, error: null };
  } catch (error) {
    console.error('Unexpected error deleting job position:', error);
    return { data: null, error };
  }
};

export const createJobApplication = async (application: JobApplicationInsert) => {
  try {
    const { data, error } = await supabase
      .from('job_applications')
      .insert(application)
      .select()
      .single();

    if (error) {
      console.error('Error creating job application:', error);
      return { data: null, error };
    }

    return { data, error: null };
  } catch (error) {
    console.error('Unexpected error creating job application:', error);
    return { data: null, error };
  }
};

export const updateJobApplicationStatus = async (id: string, status: string) => {
  try {
    const { data, error } = await supabase
      .from('job_applications')
      .update({
        status,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating application status:', error);
      return { data: null, error };
    }

    return { data, error: null };
  } catch (error) {
    console.error('Unexpected error updating application status:', error);
    return { data: null, error };
  }
};

export const getOpenJobPositions = getActiveJobPositions;
export const getActiveTeams = getAllTeams;
export const submitJobApplication = createJobApplication;