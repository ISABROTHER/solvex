// src/lib/supabase/forms.ts
import { supabase } from './client'; // Import the initialized client

interface AccessRequestData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  company?: string;
  reason?: string;
}

// Add interfaces for other forms as needed

export const supabaseForms = {
  /**
   * Submits data from the Request Access form to the Supabase table.
   */
  submitAccessRequest: async (data: AccessRequestData) => {
    const { error } = await supabase
      .from('access_requests') // Corresponds to the SQL table name
      .insert([
        {
          first_name: data.firstName, // Map frontend field to DB column
          last_name: data.lastName,   // Map frontend field to DB column
          email: data.email,
          phone: data.phone,
          company_name: data.company,
          reason: data.reason,
          status: 'pending', // Default status for new requests
        },
      ]);
    return { error }; // Return error object (null on success) 
  },

  // Keep placeholders or implementations for other forms:
  // submitContactInquiry: async (...) => { ... },
  // submitCareerApplication: async (...) => { ... },
  // submitRentalBooking: async (...) => { ... },
};