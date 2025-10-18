// @ts-nocheck
// src/lib/supabase/operations.ts

// ... (Keep all existing imports and types at the top of the file) ...

// --- JOB APPLICATION OPERATIONS (LIVE) ---

/**
 * Fetches all career applications and joins position details.
 */
export const getCareerApplications = async () => {
  // Fetch all applications and join to job_positions to get the context (name, team, description)
  return supabase
    .from('career_applications')
    .select(`
        *,
        job_positions ( name, description, team_id )
    `)
    .order('created_at', { ascending: false }); // Sort newest first
};

/**
 * Updates the status of a specific job application.
 */
export const updateCareerApplicationStatus = async (id: string, newStatus: string) => {
  return supabase
    .from('career_applications')
    .update({ status: newStatus, updated_at: new Date().toISOString() })
    .eq('id', id);
};

// ... (Keep all other functions unchanged at the bottom of the file) ...