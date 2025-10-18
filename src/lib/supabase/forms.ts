// src/lib/supabase/forms.ts
// Reverted: Contains client initialization (incorrect location)
// Reverted: Does NOT contain submitAccessRequest function

import { createClient } from '@supabase/supabase-js';
import type { Database } from './database.types'; // Assuming you generated types

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Check if variables are loaded
if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Supabase URL or Anon Key is missing. Check your .env file.');
  throw new Error('Supabase configuration is missing. Check environment variables.');
}

// Reverted: Client initialization was here
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);

console.log('Supabase client initialized (in forms.ts - incorrect):', supabase ? 'Success' : 'Failed');

// Reverted: No specific form submission logic was defined here yet
export const supabaseForms = {
    // submitAccessRequest was added later, so it's removed in this revert.
    // Keep other form functions if they existed before, e.g.:
    // submitContactInquiry: async (...) => { ... }
    // submitCareerApplication: async (...) => { ... }
};