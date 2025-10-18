// src/lib/supabase/client.ts
import { createClient } from '@supabase/supabase-js'; 
import type { Database } from './database.types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// --- ADD THESE DEBUG LINES ---
console.log('VITE_SUPABASE_URL loaded:', supabaseUrl);
console.log('VITE_SUPABASE_ANON_KEY loaded:', supabaseAnonKey);
// --- END DEBUG LINES ---

// Check if variables are loaded
if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Supabase URL or Anon Key is missing. Check your .env file.');
  // Throw an error to prevent the app from trying to use a null client
  throw new Error('Supabase configuration is missing. Check environment variables.');
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);

console.log('Supabase client initialized:', supabase ? 'Success' : 'Failed');