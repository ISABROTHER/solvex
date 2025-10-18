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

// Add other form data interfaces as needed (e.g., ContactInquiryData)

export const supabaseForms = {
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
    return { error };
  },

  // Add other submission functions here, e.g.:
  // submitContactInquiry: async (data: ContactInquiryData) => { ... },
  // submitCareerApplication: async (data: CareerApplicationData) => { ... },
};