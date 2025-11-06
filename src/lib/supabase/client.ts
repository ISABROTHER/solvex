// src/lib/supabase/client.ts
import { createClient } from '@supabase/supabase-js';
import type { Database } from './database.types'; // Uses types generated from your DB schema

// Get Supabase credentials from environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Basic check to ensure variables are loaded
if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Supabase URL or Anon Key is missing. Check your .env file and ensure Vite server was restarted.');
  throw new Error('Supabase configuration is missing.');
}

// Initialize and export the Supabase client
// The '<Database>' part enables TypeScript type safety based on your schema
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);

console.log('Supabase client initialized:', supabase ? 'Success' : 'Failed'); // For debugging