// src/lib/supabase/operations.ts

// ... (omitting existing code for brevity)

/**
 * Creates a new job position
 */
export const createJobPosition = async (position: JobPositionInsert) => {
  return supabase
    .from('job_positions')
    .insert(position)
    .select(); // REMOVED .single()
};

/**
 * Updates a job position
 */
export const updateJobPosition = async (id: string, updates: JobPositionUpdate) => {
  return supabase
    .from('job_positions')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select(); // REMOVED .single()
};

// ... (rest of the file remains the same)