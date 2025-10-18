// src/lib/supabase/forms.ts
import { supabase } from './client'; // Import the main client

interface AccessRequestData {
  name: string;
  email: string;
  company?: string;
  reason?: string;
}

export const supabaseForms = {
  submitAccessRequest: async (data: AccessRequestData) => {
    // Ensure 'access_requests' table exists in Supabase
    const { error } = await supabase
      .from('access_requests')
      .insert([
        {
          full_name: data.name,
          email: data.email,
          company_name: data.company,
          reason: data.reason,
          status: 'pending',
        },
      ]);
    return { error };
  },

  // Keep other form functions (submitContactInquiry, etc.) here
  // submitContactInquiry: async (...) => { ... }
  // submitCareerApplication: async (...) => { ... }
  // submitRentalBooking: async (...) => { ... }
};

// --- REMOVE any Supabase client creation code from this file ---