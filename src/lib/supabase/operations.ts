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

// Note: job_teams table doesn't exist - we use teams + job_positions instead

// --- TEAM MANAGEMENT OPERATIONS (LIVE) ---

/**
 * Fetches all teams for internal management.
 */
export const getTeams = async () => {
  return supabase
    .from('teams')
    .select('*') // Fetch all columns from the teams table
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
        teams ( name ) // FIX: Select 'name' from the joined 'teams' table
    `) 
    .order('full_name', { ascending: true });
};

// --- RENTAL EQUIPMENT OPERATIONS (LIVE) ---

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
    // Ensure features are correctly parsed as string array
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

/**
 * Fetches teams with their associated job positions
 * @deprecated Use getTeamsWithPositions instead - job_teams table doesn't exist
 */
export const getJobTeamsAndPositions = async () => {
  return getTeamsWithPositions();
};


export const updateJobPosition = async (id: string, updates: Partial<Database['public']['Tables']['job_positions']['Update']>) => {
  return supabase.from('job_positions').update(updates).eq('id', id);
};


// ============================================================
// COMPREHENSIVE DATA FETCHING FOR APPLICATIONS TAB
// ============================================================

/**
 * Types for Teams, Job Positions, and Applications
 */
export type Team = Database['public']['Tables']['teams']['Row'];
export type TeamInsert = Database['public']['Tables']['teams']['Insert'];
export type TeamUpdate = Database['public']['Tables']['teams']['Update'];

export type JobPosition = Database['public']['Tables']['job_positions']['Row'];
export type JobPositionInsert = Database['public']['Tables']['job_positions']['Insert'];
export type JobPositionUpdate = Database['public']['Tables']['job_positions']['Update'];

export type JobApplication = Database['public']['Tables']['job_applications']['Row'];
export type JobApplicationInsert = Database['public']['Tables']['job_applications']['Insert'];
export type JobApplicationUpdate = Database['public']['Tables']['job_applications']['Update'];

/**
 * TEAMS DATA FETCHING
 * Retrieves all teams from the database with proper error handling
 */

/**
 * Fetches all active teams (not soft-deleted)
 * Returns teams ordered by display_order and name
 *
 * @returns Promise with data array of teams and error object
 *
 * @example
 * const { data: teams, error } = await getAllTeams();
 * if (error) {
 *   console.error('Failed to fetch teams:', error);
 * } else {
 *   console.log('Teams:', teams);
 * }
 */
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

/**
 * Fetches a single team by ID
 *
 * @param id - Team UUID
 * @returns Promise with team data and error object
 */
export const getTeamById = async (id: string) => {
  try {
    const { data, error } = await supabase
      .from('teams')
      .select('*')
      .eq('id', id)
      .eq('is_deleted', false)
      .single();

    if (error) {
      console.error(`Error fetching team ${id}:`, error);
      return { data: null, error };
    }

    return { data, error: null };
  } catch (error) {
    console.error('Unexpected error fetching team:', error);
    return { data: null, error };
  }
};

/**
 * Fetches teams with their associated job positions
 * Useful for displaying team structure with open positions
 *
 * @returns Promise with teams including nested job_positions array
 */
export const getTeamsWithPositions = async () => {
  try {
    const { data, error } = await supabase
      .from('teams')
      .select(`
        *,
        job_positions (*)
      `)
      .eq('is_deleted', false)
      .order('display_order', { ascending: true });

    if (error) {
      console.error('Error fetching teams with positions:', error);
      return { data: null, error };
    }

    return { data: data || [], error: null };
  } catch (error) {
    console.error('Unexpected error fetching teams with positions:', error);
    return { data: null, error };
  }
};

/**
 * JOB POSITIONS DATA FETCHING
 * Retrieves job postings with various filters
 */

/**
 * Fetches all job positions (not soft-deleted)
 * Includes team information via join
 *
 * @returns Promise with job positions array and error object
 *
 * @example
 * const { data: positions, error } = await getAllJobPositions();
 * if (error) {
 *   console.error('Failed to fetch positions:', error);
 * } else {
 *   positions.forEach(pos => console.log(pos.title, pos.team_name));
 * }
 */
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

/**
 * Fetches only open/active job positions
 * Filters by status = 'open' and not deleted
 *
 * @returns Promise with active job positions
 */
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

/**
 * Fetches job positions for a specific team
 *
 * @param teamId - Team UUID
 * @returns Promise with job positions for the team
 */
export const getJobPositionsByTeam = async (teamId: string) => {
  try {
    const { data, error } = await supabase
      .from('job_positions')
      .select('*')
      .eq('team_id', teamId)
      .eq('is_deleted', false)
      .order('title', { ascending: true });

    if (error) {
      console.error(`Error fetching positions for team ${teamId}:`, error);
      return { data: null, error };
    }

    return { data: data || [], error: null };
  } catch (error) {
    console.error('Unexpected error fetching positions by team:', error);
    return { data: null, error };
  }
};

/**
 * Fetches a single job position by ID
 *
 * @param id - Job position UUID
 * @returns Promise with job position data
 */
export const getJobPositionById = async (id: string) => {
  try {
    const { data, error } = await supabase
      .from('job_positions')
      .select('*')
      .eq('id', id)
      .eq('is_deleted', false)
      .single();

    if (error) {
      console.error(`Error fetching job position ${id}:`, error);
      return { data: null, error };
    }

    return { data, error: null };
  } catch (error) {
    console.error('Unexpected error fetching job position:', error);
    return { data: null, error };
  }
};

/**
 * JOB APPLICATIONS DATA FETCHING
 * Retrieves submitted applications with joins and pagination
 */

/**
 * Fetches all job applications with related job position details
 * Includes JOIN with job_positions table to get position title and team
 *
 * @returns Promise with applications array including job details
 *
 * @example
 * const { data: applications, error } = await getAllJobApplications();
 * if (error) {
 *   console.error('Failed to fetch applications:', error);
 * } else {
 *   applications.forEach(app => {
 *     console.log(app.full_name, 'applied for', app.job_positions?.title);
 *   });
 * }
 */
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

/**
 * Fetches job applications with pagination support
 * Useful for large datasets to improve performance
 *
 * @param page - Page number (0-indexed)
 * @param pageSize - Number of items per page (default: 20)
 * @returns Promise with paginated applications and total count
 *
 * @example
 * const { data, error, count } = await getJobApplicationsPaginated(0, 10);
 * console.log(`Showing ${data.length} of ${count} total applications`);
 */
export const getJobApplicationsPaginated = async (page: number = 0, pageSize: number = 20) => {
  try {
    const from = page * pageSize;
    const to = from + pageSize - 1;

    const { data, error, count } = await supabase
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
      `, { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(from, to);

    if (error) {
      console.error('Error fetching paginated job applications:', error);
      return { data: null, error, count: 0 };
    }

    return { data: data || [], error: null, count: count || 0 };
  } catch (error) {
    console.error('Unexpected error fetching paginated applications:', error);
    return { data: null, error, count: 0 };
  }
};

/**
 * Fetches applications filtered by status
 *
 * @param status - Application status (pending, reviewing, interviewed, accepted, rejected)
 * @returns Promise with filtered applications
 */
export const getJobApplicationsByStatus = async (status: string) => {
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
      .eq('status', status)
      .order('created_at', { ascending: false });

    if (error) {
      console.error(`Error fetching applications with status ${status}:`, error);
      return { data: null, error };
    }

    return { data: data || [], error: null };
  } catch (error) {
    console.error('Unexpected error fetching applications by status:', error);
    return { data: null, error };
  }
};

/**
 * Fetches applications for a specific job position
 *
 * @param jobPositionId - Job position UUID
 * @returns Promise with applications for the position
 */
export const getApplicationsByJobPosition = async (jobPositionId: string) => {
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
      .eq('job_position_id', jobPositionId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error(`Error fetching applications for position ${jobPositionId}:`, error);
      return { data: null, error };
    }

    return { data: data || [], error: null };
  } catch (error) {
    console.error('Unexpected error fetching applications by position:', error);
    return { data: null, error };
  }
};

/**
 * Fetches a single application by ID
 *
 * @param id - Application UUID
 * @returns Promise with application details
 */
export const getJobApplicationById = async (id: string) => {
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
      .eq('id', id)
      .single();

    if (error) {
      console.error(`Error fetching application ${id}:`, error);
      return { data: null, error };
    }

    return { data, error: null };
  } catch (error) {
    console.error('Unexpected error fetching application:', error);
    return { data: null, error };
  }
};

/**
 * CREATE/UPDATE OPERATIONS
 */

/**
 * Creates a new team
 *
 * @param team - Team data to insert
 * @returns Promise with created team data
 */
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

/**
 * Updates an existing team
 *
 * @param id - Team UUID
 * @param updates - Partial team data to update
 * @returns Promise with updated team data
 */
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

/**
 * Soft deletes a team (sets is_deleted = true)
 *
 * @param id - Team UUID
 * @returns Promise with result
 */
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

/**
 * Creates a new job position
 *
 * @param position - Job position data to insert
 * @returns Promise with created position data
 */
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

/**
 * Soft deletes a job position
 *
 * @param id - Job position UUID
 * @returns Promise with result
 */
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

/**
 * Submits a new job application
 *
 * @param application - Application data to insert
 * @returns Promise with created application data
 */
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

/**
 * Updates an application's status
 *
 * @param id - Application UUID
 * @param status - New status value
 * @returns Promise with updated application
 */
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

/**
 * REAL-TIME SUBSCRIPTIONS
 * Subscribe to database changes for live updates
 */

/**
 * Subscribes to changes on teams table
 *
 * @param callback - Function to call when teams change
 * @returns Subscription channel
 */
export const onTeamsChange = (callback: () => void) => {
  return supabase
    .channel('teams_changes')
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'teams' },
      callback
    )
    .subscribe();
};

/**
 * Subscribes to changes on job_positions table
 *
 * @param callback - Function to call when positions change
 * @returns Subscription channel
 */
export const onJobPositionsChange = (callback: () => void) => {
  return supabase
    .channel('job_positions_changes')
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'job_positions' },
      callback
    )
    .subscribe();
};

/**
 * Subscribes to changes on job_applications table
 *
 * @param callback - Function to call when applications change
 * @returns Subscription channel
 */
export const onJobApplicationsChange = (callback: () => void) => {
  return supabase
    .channel('job_applications_changes')
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'job_applications' },
      callback
    )
    .subscribe();
};

/**
 * UTILITY FUNCTIONS
 */

/**
 * Gets application statistics
 * Returns count of applications by status
 *
 * @returns Promise with statistics object
 */
export const getApplicationStatistics = async () => {
  try {
    const { data, error } = await supabase
      .from('job_applications')
      .select('status');

    if (error) {
      console.error('Error fetching application statistics:', error);
      return {
        data: { total: 0, pending: 0, reviewing: 0, interviewed: 0, accepted: 0, rejected: 0 },
        error
      };
    }

    const stats = {
      total: data.length,
      pending: data.filter(app => app.status === 'pending').length,
      reviewing: data.filter(app => app.status === 'reviewing').length,
      interviewed: data.filter(app => app.status === 'interviewed').length,
      accepted: data.filter(app => app.status === 'accepted').length,
      rejected: data.filter(app => app.status === 'rejected').length,
    };

    return { data: stats, error: null };
  } catch (error) {
    console.error('Unexpected error fetching statistics:', error);
    return {
      data: { total: 0, pending: 0, reviewing: 0, interviewed: 0, accepted: 0, rejected: 0 },
      error
    };
  }
};

// Placeholder for backward compatibility
export const createMember = async (member: any) => {
  return { data: null, error: null };
};

/**
 * BACKWARD COMPATIBILITY ALIASES
 * Maintain compatibility with existing code
 */

/**
 * Alias for getAllJobPositions - returns only open positions
 * @deprecated Use getActiveJobPositions instead
 */
export const getOpenJobPositions = getActiveJobPositions;

/**
 * Alias for getAllTeams - returns active teams
 * @deprecated Use getAllTeams instead
 */
export const getActiveTeams = getAllTeams;

/**
 * Alias for createJobApplication
 * @deprecated Use createJobApplication instead
 */
export const submitJobApplication = createJobApplication;