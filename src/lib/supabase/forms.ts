// src/lib/supabase/forms.ts
import { supabase } from './client';
import type { Database } from './database.types';

// Define the shape of the application data coming from the form
interface CareerApplicationData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  countryCode: string;
  coverLetter: string;
  portfolioUrl?: string;
  appliedRoles: string[]; // This should be an array of job_position IDs
}

interface AccessRequestData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  company?: string;
  reason?: string;
}

// Add other form data interfaces (Contact, Rental) if needed

export const supabaseForms = {
  /**
   * Submits data from the Request Access form.
   */
  submitAccessRequest: async (data: AccessRequestData) => {
    const { error } = await (supabase
      .from('access_requests') as any) // Cast as 'any' to avoid type issues if table isn't in generated types
      .insert({
        first_name: data.firstName,
        last_name: data.lastName,
        email: data.email,
        phone: data.phone,
        company_name: data.company,
        reason: data.reason,
        status: 'pending',
      });
    return { error };
  },

};

export const submitContactInquiry = async (data: any) => {
  console.warn('submitContactInquiry not implemented');
  return { error: null };
};

/**
 * Submits data from the Career Application form.
 * This now correctly points to the 'submitted_applications' table.
 */
export const submitCareerApplication = async (data: CareerApplicationData) => {
  // --- START OF FIX: Added try...catch block ---
  try {
    // We need to insert one row for EACH role the user applied for.
    const applications = data.appliedRoles.map(roleId => ({
      first_name: data.firstName, 
      last_name: data.lastName, 
      email: data.email,
      phone: data.phone,
      country_code: data.countryCode,
      cover_letter: data.coverLetter,
      portfolio_url: data.portfolioUrl,
      job_position_id: roleId, // Link to the job_positions table
      status: 'pending' as 'pending', // Default status
    }));

    // Use type from generated types for type safety
    type JobApplicationInsert = Database['public']['Tables']['submitted_applications']['Insert'];

    // Insert the array of application objects
    const { error } = await supabase
      .from('submitted_applications') 
      .insert(applications as JobApplicationInsert[]);

    if (error) {
      console.error('Supabase career application error:', error);
      throw error; // Throw the error to be caught below
    }

    return { error: null }; // Success
    
  } catch (err: any) {
    console.error('Critical error in submitCareerApplication:', err);
    // Ensure we always return an object with a .message property
    if (err && err.message) {
      return { error: err };
    }
    // If the error is not a standard error object, create one
    return { error: new Error(String(err) || 'Unknown error in forms.ts') };
  }
  // --- END OF FIX ---
};


export const submitRentalBooking = async (data: any) => {
  console.warn('submitRentalBooking not implemented');
  return { error: null };
};