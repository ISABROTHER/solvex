// @ts-nocheck
// src/lib/supabase/operations.ts

import { supabase } from './client';
import type { Database } from './database.types';

// Define the shape of data the public frontend expects (RentalsPage)
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


// --- REAL-TIME SERVICE OPERATIONS (Unchanged from last step but kept here for context) ---

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


// --- CLIENT/ADMIN REQUEST & USER OPERATIONS (Implementing existing stubs) ---

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

// --- JOB POSITIONS AND APPLICATIONS OPERATIONS ---

export type JobPosition = Database['public']['Tables']['job_positions']['Row'];
export type JobPositionInsert = Database['public']['Tables']['job_positions']['Insert'];
export type JobPositionUpdate = Database['public']['Tables']['job_positions']['Update'];
export type JobApplication = Database['public']['Tables']['job_applications']['Row'];
export type JobApplicationInsert = Database['public']['Tables']['job_applications']['Insert'];
export type JobApplicationUpdate = Database['public']['Tables']['job_applications']['Update'];

/**
 * Fetches all open job positions (for public careers page)
 */
export const getOpenJobPositions = async () => {
  const { data, error } = await supabase
    .from('job_positions')
    .select('*')
    .eq('is_open', true)
    .order('team_name', { ascending: true })
    .order('title', { ascending: true });

  return { data: data || [], error };
};

/**
 * Fetches all job positions (for admin dashboard)
 */
export const getAllJobPositions = async () => {
  const { data, error } = await supabase
    .from('job_positions')
    .select('*')
    .order('team_name', { ascending: true })
    .order('title', { ascending: true });

  return { data: data || [], error };
};

/**
 * Creates a new job position
 */
export const createJobPosition = async (position: JobPositionInsert) => {
  return supabase
    .from('job_positions')
    .insert(position)
    .select()
    .single();
};

/**
 * Updates a job position
 */
export const updateJobPosition = async (id: string, updates: JobPositionUpdate) => {
  return supabase
    .from('job_positions')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();
};

/**
 * Deletes a job position
 */
export const deleteJobPosition = async (id: string) => {
  return supabase
    .from('job_positions')
    .delete()
    .eq('id', id);
};

/**
 * Submits a job application
 */
export const submitJobApplication = async (application: JobApplicationInsert) => {
  return supabase
    .from('job_applications')
    .insert(application)
    .select()
    .single();
};

/**
 * Fetches all job applications (for admin dashboard)
 */
export const getAllJobApplications = async () => {
  const { data, error } = await supabase
    .from('job_applications')
    .select(`
      *,
      job_positions (
        title,
        team_name
      )
    `)
    .order('created_at', { ascending: false });

  return { data: data || [], error };
};

/**
 * Fetches applications for a specific job position
 */
export const getApplicationsByPosition = async (positionId: string) => {
  const { data, error } = await supabase
    .from('job_applications')
    .select('*')
    .eq('job_position_id', positionId)
    .order('created_at', { ascending: false });

  return { data: data || [], error };
};

/**
 * Updates a job application status
 */
export const updateJobApplicationStatus = async (id: string, status: string) => {
  return supabase
    .from('job_applications')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();
};

/**
 * Deletes a job application
 */
export const deleteJobApplication = async (id: string) => {
  return supabase
    .from('job_applications')
    .delete()
    .eq('id', id);
};

/**
 * Real-time subscription for job positions changes
 */
export const onJobPositionsChange = (callback: () => void) => {
  return supabase
    .channel('public:job_positions')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'job_positions' }, callback)
    .subscribe();
};

/**
 * Real-time subscription for job applications changes
 */
export const onJobApplicationsChange = (callback: () => void) => {
  return supabase
    .channel('public:job_applications')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'job_applications' }, callback)
    .subscribe();
};

export const createMember = async (...args: any[]) => ({ data: null, error: null });
export const getTeams = async () => ({ data: [], error: null });
export const getMembers = async () => ({ data: [], error: null });

export type ServiceRequestStatus =
  | "requested"
  | "confirmed"
  | "in_progress"
  | "completed"
  | "cancelled"
  | "pending";