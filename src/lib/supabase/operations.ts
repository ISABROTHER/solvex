// @ts-nocheck
import { supabase } from './client';
import type { Database } from './database.types';

export type JobPosition = Database['public']['Tables']['job_positions']['Row'];
export type JobPositionInsert = Database['public']['Tables']['job_positions']['Insert'];
export type JobPositionUpdate = Database['public']['Tables']['job_positions']['Update'];

export type JobApplication = Database['public']['Tables']['job_applications']['Row'];
export type JobApplicationInsert = Database['public']['Tables']['job_applications']['Insert'];

export type ServiceRequest = any;
export type ServiceRequestStatus = string;

/**
 * Job Positions Operations
 */

export const getAllJobPositions = async () => {
  return supabase
    .from('job_positions')
    .select('*')
    .order('team_name', { ascending: true })
    .order('title', { ascending: true });
};

export const getOpenJobPositions = async () => {
  return supabase
    .from('job_positions')
    .select('*')
    .eq('status', 'open')
    .eq('is_deleted', false)
    .order('team_name', { ascending: true })
    .order('title', { ascending: true });
};

export const getJobPositionById = async (id: string) => {
  return supabase
    .from('job_positions')
    .select('*')
    .eq('id', id)
    .maybeSingle();
};

export const createJobPosition = async (position: JobPositionInsert) => {
  const result = await supabase
    .from('job_positions')
    .insert(position as any)
    .select();

  if (result.data && result.data.length > 0) {
    return { data: result.data[0], error: result.error };
  }
  return result;
};

export const updateJobPosition = async (id: string, updates: JobPositionUpdate) => {
  const result = await supabase
    .from('job_positions')
    .update({ ...updates, updated_at: new Date().toISOString() } as any)
    .eq('id', id)
    .select();

  if (result.data && result.data.length > 0) {
    return { data: result.data[0], error: result.error };
  }
  return result;
};

export const deleteJobPosition = async (id: string) => {
  return supabase
    .from('job_positions')
    .delete()
    .eq('id', id);
};

export const softDeleteJobPosition = async (id: string) => {
  const result = await supabase
    .from('job_positions')
    .update({
      is_deleted: true,
      deleted_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    } as any)
    .eq('id', id)
    .select();

  if (result.data && result.data.length > 0) {
    return { data: result.data[0], error: result.error };
  }
  return result;
};

export const restoreJobPosition = async (id: string) => {
  const result = await supabase
    .from('job_positions')
    .update({
      is_deleted: false,
      deleted_at: null,
      updated_at: new Date().toISOString()
    } as any)
    .eq('id', id)
    .select();

  if (result.data && result.data.length > 0) {
    return { data: result.data[0], error: result.error };
  }
  return result;
};

/**
 * Teams Operations
 */
export const getAllTeams = async () => {
  return supabase
    .from('teams')
    .select('*')
    .order('display_order', { ascending: true })
    .order('name', { ascending: true });
};

export const getActiveTeams = async () => {
  return supabase
    .from('teams')
    .select('*')
    .eq('is_deleted', false)
    .order('display_order', { ascending: true })
    .order('name', { ascending: true });
};

export const createTeam = async (team: any) => {
  const result = await supabase
    .from('teams')
    .insert(team as any)
    .select();

  if (result.data && result.data.length > 0) {
    return { data: result.data[0], error: result.error };
  }
  return result;
};

export const updateTeam = async (id: string, updates: any) => {
  const result = await supabase
    .from('teams')
    .update({ ...updates, updated_at: new Date().toISOString() } as any)
    .eq('id', id)
    .select();

  if (result.data && result.data.length > 0) {
    return { data: result.data[0], error: result.error };
  }
  return result;
};

export const softDeleteTeam = async (id: string) => {
  const result = await supabase
    .from('teams')
    .update({
      is_deleted: true,
      deleted_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    } as any)
    .eq('id', id)
    .select();

  if (result.data && result.data.length > 0) {
    return { data: result.data[0], error: result.error };
  }
  return result;
};

export const restoreTeam = async (id: string) => {
  const result = await supabase
    .from('teams')
    .update({
      is_deleted: false,
      deleted_at: null,
      updated_at: new Date().toISOString()
    } as any)
    .eq('id', id)
    .select();

  if (result.data && result.data.length > 0) {
    return { data: result.data[0], error: result.error };
  }
  return result;
};

export const deleteTeam = async (id: string) => {
  return supabase
    .from('teams')
    .delete()
    .eq('id', id);
};

/**
 * Job Applications Operations
 */

export const getAllJobApplications = async () => {
  return supabase
    .from('job_applications')
    .select(`
      *,
      job_positions (
        id,
        title,
        team_name
      )
    `)
    .order('created_at', { ascending: false });
};

export const submitJobApplication = async (application: JobApplicationInsert) => {
  const result = await supabase
    .from('job_applications')
    .insert(application as any)
    .select();

  if (result.data && result.data.length > 0) {
    return { data: result.data[0], error: result.error };
  }
  return result;
};

export const updateJobApplicationStatus = async (id: string, status: string) => {
  const result = await supabase
    .from('job_applications')
    .update({ status, updated_at: new Date().toISOString() } as any)
    .eq('id', id)
    .select();

  if (result.data && result.data.length > 0) {
    return { data: result.data[0], error: result.error };
  }
  return result;
};

export const onJobApplicationsChange = (callback: () => void) => {
  return supabase
    .channel('job_applications_changes')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'job_applications'
      },
      callback
    )
    .subscribe();
};

/**
 * Team Members Operations
 */

export const createMember = async (member: any) => {
  // TODO: Implement when members table is created
  console.log('Creating member:', member);
  return { data: null, error: null };
};

/**
 * Service Requests Operations
 */

export const listClientsWithStats = async () => {
  // TODO: Implement when service requests are ready
  return { data: [], error: null };
};

export const listServiceRequests = async () => {
  // TODO: Implement when service requests are ready
  return { data: [], error: null };
};

export const updateServiceRequestStatus = async (id: string, status: ServiceRequestStatus) => {
  // TODO: Implement when service requests are ready
  return { data: null, error: null };
};

/**
 * Services Operations
 */

export type Service = Database['public']['Tables']['services']['Row'];

export const getServices = async () => {
  return supabase
    .from('services')
    .select('*')
    .eq('is_deleted', false)
    .order('created_at', { ascending: false });
};

export const createService = async (service: any) => {
  const result = await supabase
    .from('services')
    .insert(service as any)
    .select();

  if (result.data && result.data.length > 0) {
    return { data: result.data[0], error: result.error };
  }
  return result;
};

export const updateService = async (id: string, updates: any) => {
  const result = await supabase
    .from('services')
    .update({ ...updates, updated_at: new Date().toISOString() } as any)
    .eq('id', id)
    .select();

  if (result.data && result.data.length > 0) {
    return { data: result.data[0], error: result.error };
  }
  return result;
};

export const softDeleteService = async (id: string) => {
  const result = await supabase
    .from('services')
    .update({
      is_deleted: true,
      deleted_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    } as any)
    .eq('id', id)
    .select();

  if (result.data && result.data.length > 0) {
    return { data: result.data[0], error: result.error };
  }
  return result;
};

export const restoreService = async (id: string) => {
  const result = await supabase
    .from('services')
    .update({
      is_deleted: false,
      deleted_at: null,
      updated_at: new Date().toISOString()
    } as any)
    .eq('id', id)
    .select();

  if (result.data && result.data.length > 0) {
    return { data: result.data[0], error: result.error };
  }
  return result;
};

export const getDeletedServices = async () => {
  return supabase
    .from('services')
    .select('*')
    .eq('is_deleted', true)
    .order('deleted_at', { ascending: false });
};

export const onServicesChange = (callback: () => void) => {
  return supabase
    .channel('services_changes')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'services'
      },
      callback
    )
    .subscribe();
};

/**
 * Rental Equipment Operations
 */

export type RentalItemDisplay = Database['public']['Tables']['rental_gear']['Row'];

export const getRentalEquipment = async () => {
  return supabase
    .from('rental_gear')
    .select('*')
    .eq('is_available', true)
    .order('created_at', { ascending: false });
};

export const onJobPositionsChange = (callback: () => void) => {
  return supabase
    .channel('job_positions_changes')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'job_positions'
      },
      callback
    )
    .subscribe();
};

export const getAllRentalEquipment = async () => {
  return supabase
    .from('rental_gear')
    .select('*')
    .order('created_at', { ascending: false });
};

export const updateRentalEquipment = async (id: string, updates: any) => {
  const result = await supabase
    .from('rental_gear')
    .update({ ...updates, updated_at: new Date().toISOString() } as any)
    .eq('id', id)
    .select();

  if (result.data && result.data.length > 0) {
    return { data: result.data[0], error: result.error };
  }
  return result;
};

export const onRentalGearChange = (callback: () => void) => {
  return supabase
    .channel('rental_gear_changes')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'rental_gear'
      },
      callback
    )
    .subscribe();
};

export const createRentalEquipment = async (equipment: any) => {
  const result = await supabase
    .from('rental_gear')
    .insert(equipment as any)
    .select();

  if (result.data && result.data.length > 0) {
    return { data: result.data[0], error: result.error };
  }
  return result;
};

export const deleteRentalEquipment = async (id: string) => {
  return supabase
    .from('rental_gear')
    .delete()
    .eq('id', id);
};

export type RentalGear = Database['public']['Tables']['rental_gear']['Row'];
