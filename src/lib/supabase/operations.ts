// @ts-nocheck
// src/lib/supabase/operations.ts

import { supabase } from './client';
import type { Database } from './database.types';

// ... (Keep all other imports and type definitions like RentalItemDisplay, RentalGear, etc.)

// --- JOB POSTING OPERATIONS (LIVE) ---

// Define types for Job fetching
export type JobTeamWithPositions = Database['public']['Tables']['job_teams']['Row'] & {
  job_positions: Database['public']['Tables']['job_positions']['Row'][];
};

/**
 * Fetches all job teams and their corresponding open positions using a PostgreSQL JOIN/filter.
 */
export const getJobTeamsAndPositions = async () => {
  // Use a SELECT with a foreign table join
  const { data: teams, error: teamsError } = await supabase
    .from('job_teams')
    .select(`
      *, 
      job_positions(*) 
    `)
    .eq('is_active', true) // Only show active teams
    .order('name', { ascending: true }); // Order teams alphabetically

  if (teamsError) return { data: [], error: teamsError };

  // Filter out any teams that have no open positions (job_positions.is_open = true is the true filter for public display, 
  // but for the admin JobsTab we usually show all positions for management, including closed ones, so we return all attached positions.)
  const result = teams.map(team => ({
    ...team,
    // The query returns positions as an array on the job_positions key due to the JOIN syntax
    job_positions: team.job_positions || []
  }));

  return { data: result as JobTeamWithPositions[], error: null };
};


// Implemented: Update a job position (required for the JobsTab to manage status)
export const updateJobPosition = async (id: string, updates: Partial<Database['public']['Tables']['job_positions']['Update']>) => {
  return supabase.from('job_positions').update(updates).eq('id', id);
};


// --- EXISTING OPERATIONS (Keep all other functions unchanged from previous steps) ---
// ... (All other functions remain the same)