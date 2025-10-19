// src/lib/supabase/operations.ts
// @ts-nocheck
import { supabase } from './client';
import type { Database } from './database.types';

// --- Type Definitions ---
export type AccessRequest = Database['public']['Tables']['access_requests']['Row'];
export type Profile = Database['public']['Tables']['profiles']['Row'];
export type RentalItemDisplay = { /* ... as defined before ... */ };

// --- ADD MISSING TYPES ---
export type JobPosition = Database['public']['Tables']['job_positions']['Row'];
export type Team = Database['public']['Tables']['teams']['Row']; // Assuming you have a 'teams' table
export type Service = Database['public']['Tables']['services']['Row'];
export type CareerApplication = Database['public']['Tables']['job_applications']['Row'];
export type CareerApplicationStatus = 'pending' | 'reviewed' | 'interviewing' | 'rejected' | 'hired'; // Example statuses

// ... (keep existing functions: getRentalEquipment, Access Request Operations, etc.) ...


// --- ADD MISSING JOB POSITION / CAREERS OPERATIONS ---

/**
 * Fetches all non-deleted job positions marked as 'open'.
 */
export const getOpenJobPositions = async () => {
  return supabase
    .from('job_positions')
    .select('*')
    .eq('status', 'open') // Assuming an 'open' status
    .eq('is_deleted', false) // Assuming soft delete column
    .order('created_at', { ascending: false });
};

/**
 * Fetches all active teams (adjust table/columns if needed).
 */
export const getActiveTeams = async () => {
   // Assuming a 'teams' table exists
  return supabase
    .from('teams')
    .select('*')
    // Add filtering if needed, e.g., .eq('is_active', true)
    .order('name', { ascending: true });
};


// --- ADD MISSING CAREER APPLICATION OPERATIONS ---

/**
 * Fetches all career applications.
 */
export const getCareerApplications = async () => {
  // Join with job_positions if you need the position title
  return supabase
    .from('job_applications')
    .select(`
      *,
      job_positions ( title )
    `)
    .order('created_at', { ascending: false });
};

/**
 * Updates the status of a career application.
 */
export const updateCareerApplicationStatus = async (applicationId: string, newStatus: CareerApplicationStatus) => {
  return supabase
    .from('job_applications')
    .update({ status: newStatus, updated_at: new Date().toISOString() })
    .eq('id', applicationId)
    .select()
    .single();
};


// --- ADD MISSING SERVICES OPERATIONS ---

/**
 * Fetches all non-deleted services.
 */
export const getServices = async () => {
  return supabase
    .from('services')
    .select('*')
    .eq('is_deleted', false) // Assuming soft delete
    .order('name', { ascending: true });
};

/**
 * Fetches services marked as deleted.
 */
export const getDeletedServices = async () => {
    return supabase
        .from('services')
        .select('*')
        .eq('is_deleted', true)
        .order('name', { ascending: true });
};

/**
 * Creates a new service.
 * `serviceData` should match the columns in your 'services' table, excluding 'id', 'created_at', 'updated_at', 'is_deleted'.
 */
export const createService = async (serviceData: Omit<Service, 'id' | 'created_at' | 'updated_at' | 'is_deleted'>) => {
    return supabase
        .from('services')
        .insert({ ...serviceData, is_deleted: false }) // Ensure is_deleted is false on create
        .select()
        .single();
};

/**
 * Updates an existing service.
 * `serviceData` should include the fields to update.
 */
export const updateService = async (serviceId: string, serviceData: Partial<Omit<Service, 'id' | 'created_at' | 'is_deleted'>>) => {
    return supabase
        .from('services')
        .update({ ...serviceData, updated_at: new Date().toISOString() })
        .eq('id', serviceId)
        .select()
        .single();
};

/**
 * Soft deletes a service by setting is_deleted to true.
 */
export const softDeleteService = async (serviceId: string) => {
    return supabase
        .from('services')
        .update({ is_deleted: true, updated_at: new Date().toISOString() })
        .eq('id', serviceId)
        .select()
        .single();
};

/**
 * Restores a soft-deleted service by setting is_deleted to false.
 */
export const restoreService = async (serviceId: string) => {
     return supabase
        .from('services')
        .update({ is_deleted: false, updated_at: new Date().toISOString() })
        .eq('id', serviceId)
        .select()
        .single();
};


// --- Realtime listener for services ---
export const onServicesChange = (callback: (payload: any) => void) => {
  return supabase
    .channel('public:services:admin') // Unique channel name
    .on('postgres_changes', { event: '*', schema: 'public', table: 'services' }, callback)
    .subscribe();
};


// ... (keep other existing functions like listClientsWithStats, listServiceRequests, etc.) ...