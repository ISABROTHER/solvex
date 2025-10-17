// @ts-nocheck
import { supabase } from './client';
import type { Database } from './database.types';

/**
 * Job Positions Operations
 */

export type JobPosition = {
  id: string;
  title: string;
  description: string;
  team_name: string;
  team_id: string | null;
  requirements: string | null;
  status: string;
  is_deleted: boolean;
  deleted_at: string | null;
  created_at: string;
  updated_at: string;
};

export type JobPositionInsert = {
  title: string;
  description?: string | null;
  team_name: string;
  team_id?: string | null;
  requirements?: string | null;
  status?: string;
};

export type JobPositionUpdate = Partial<JobPositionInsert>;

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

export type JobApplication = Database['public']['Tables']['job_applications']['Row'];
export type JobApplicationInsert = Database['public']['Tables']['job_applications']['Insert'];

export const getAllJobApplications = async () => {
  return supabase
    .from('job_applications')
    .select(`
      *,
      job_positions(*)
    `)
    .order('created_at', { ascending: false });
};

export const createJobApplication = async (application: JobApplicationInsert) => {
  return supabase
    .from('job_applications')
    .insert(application as any)
    .select();
};

export const submitJobApplication = async (application: JobApplicationInsert) => {
  return createJobApplication(application);
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

export const getDeletedServices = async () => {
  return supabase
    .from('services')
    .select('*')
    .eq('is_deleted', true)
    .order('deleted_at', { ascending: false });
};

export const createService = async (service: any) => {
  return supabase
    .from('services')
    .insert(service as any)
    .select();
};

export const updateService = async (id: string, updates: any) => {
  return supabase
    .from('services')
    .update({ ...updates, updated_at: new Date().toISOString() } as any)
    .eq('id', id)
    .select();
};

export const softDeleteService = async (id: string) => {
  return supabase
    .from('services')
    .update({
      is_deleted: true,
      deleted_at: new Date().toISOString()
    } as any)
    .eq('id', id)
    .select();
};

export const restoreService = async (id: string) => {
  return supabase
    .from('services')
    .update({
      is_deleted: false,
      deleted_at: null
    } as any)
    .eq('id', id)
    .select();
};

/**
 * Rental Equipment Operations
 */

export type RentalItemDisplay = {
  id: string;
  title: string;
  subtitle: string;
  images: string[];
  status: string;
  price: number;
  category: string;
  description: string;
  features: string[];
  videoUrl?: string;
};

export const getRentalEquipment = async () => {
  const result = await supabase
    .from('rental_gear')
    .select('*')
    .eq('is_available', true)
    .order('created_at', { ascending: false });

  if (result.data) {
    const transformed = result.data.map((item: any) => ({
      id: item.id,
      title: item.name,
      subtitle: item.category,
      images: item.image_url ? [item.image_url] : [],
      status: item.is_available ? 'Available' : 'Unavailable',
      price: parseFloat(item.price_per_day) || 0,
      category: item.category,
      description: item.description || '',
      features: item.features || [],
      videoUrl: item.video_url
    }));
    return { ...result, data: transformed };
  }

  return result;
};

/**
 * Realtime Subscriptions
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

export const onServicesChange = (callback: () => void) => {
  return supabase
    .channel('services_changes')
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'services' },
      callback
    )
    .subscribe();
};

// Legacy support
export type ServiceRequest = any;
export type ServiceRequestStatus = string;

// Stub functions for legacy tabs (to be implemented later if needed)
export const listClientsWithStats = async () => {
  return { data: [], error: null };
};

export const listServiceRequests = async () => {
  return { data: [], error: null };
};

export const updateServiceRequestStatus = async (id: string, status: string) => {
  return { data: null, error: null };
};

export const getAllRentalEquipment = async () => {
  return getRentalEquipment();
};

export const onRentalGearChange = (callback: () => void) => {
  return supabase
    .channel('rental_gear_changes')
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'rental_gear' },
      callback
    )
    .subscribe();
};

export const updateRentalEquipment = async (id: string, updates: any) => {
  return supabase
    .from('rental_gear')
    .update(updates as any)
    .eq('id', id)
    .select();
};

export const deleteRentalEquipment = async (id: string) => {
  return supabase
    .from('rental_gear')
    .delete()
    .eq('id', id);
};

export const createRentalEquipment = async (equipment: any) => {
  return supabase
    .from('rental_gear')
    .insert(equipment as any)
    .select();
};

export const updateJobApplicationStatus = async (id: string, status: string) => {
  return supabase
    .from('job_applications')
    .update({ status } as any)
    .eq('id', id)
    .select();
};

export const createMember = async (member: any) => {
  return { data: null, error: null };
};
