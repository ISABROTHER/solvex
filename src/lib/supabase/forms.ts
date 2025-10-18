// src/lib/supabase/forms.ts
import { supabase } from './client';

interface AccessRequestData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  company?: string;
  reason?: string;
}

// Add other form data interfaces (Contact, Career, Rental) if needed

export const supabaseForms = {
  /**
   * Submits data from the Request Access form.
   */
  submitAccessRequest: async (data: AccessRequestData) => {
    const { error } = await supabase
      .from('access_requests')
      .insert([
        {
          first_name: data.firstName,
          last_name: data.lastName,
          email: data.email,
          phone: data.phone,
          company_name: data.company,
          reason: data.reason,
          status: 'pending',
        },
      ]);
    return { error }; // Returns { error: null } on success
  },

  // Add other form submission functions below...
  // submitContactInquiry: async (...) => { ... },
};