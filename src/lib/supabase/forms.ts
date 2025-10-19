// src/lib/supabase/forms.ts
import { supabase } from './client';
import { Database } from './database.types';

// Define the structure for the data coming from the career application form
interface CareerApplicationData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  countryCode: string;
  coverLetter: string;
  portfolioUrl?: string;
  appliedRoles: string[]; // This is an array of job position IDs
}

// Define the type for the data coming from the request access form
interface AccessRequestData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  company?: string;
  reason?: string;
}

export const supabaseForms = {
  /**
   * Submits data from the Request Access form.
   */
  submitAccessRequest: async (data: AccessRequestData) => {
    // Note: The 'as any' casting is used here because of the dynamic nature of insert types in Supabase JSD
    const { error } = await (supabase
      .from('access_requests') as any) 
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
  // Placeholder for Contact Inquiry submission (connect to a 'contact_inquiries' table)
  console.log("Submitting contact inquiry (placeholder):", data);
  return { error: null };
};

/**
 * Submits a career application. Since a user can select multiple roles,
 * we handle this by creating one database record for every selected role ID.
 */
export const submitCareerApplication = async (data: CareerApplicationData) => {
  // 1. Fetch the corresponding job position titles and IDs for the selected roles
  const { data: jobPositions, error: fetchError } = await supabase
    .from('job_positions')
    .select('id, title')
    .in('id', data.appliedRoles);

  if (fetchError) {
    console.error("Error fetching job positions for application:", fetchError);
    return { error: fetchError.message };
  }

  if (!jobPositions || jobPositions.length === 0) {
    return { error: 'No valid job positions found for the selected roles.' };
  }
  
  // 2. Prepare multiple insert rows
  const applicationInserts: Database['public']['Tables']['job_applications']['Insert'][] = jobPositions.map(pos => ({
    full_name: `${data.firstName} ${data.lastName}`,
    email: data.email,
    phone: data.phone,
    country_code: data.countryCode,
    cover_letter: data.coverLetter,
    portfolio_url: data.portfolioUrl,
    job_position_id: pos.id,
    position_title: pos.title, // Store title redundantly for quick access
    status: 'pending',
  }));

  // 3. Perform the bulk insert
  const { error: insertError } = await supabase
    .from('job_applications')
    .insert(applicationInserts);

  if (insertError) {
    console.error("Error submitting career application:", insertError);
    return { error: insertError.message };
  }
  
  return { data: { submittedApplications: jobPositions.map(p => p.title) }, error: null };
};

export const submitRentalBooking = async (data: any) => {
  // Placeholder for Rental Booking submission (connect to a 'rental_bookings' table)
  console.log("Submitting rental booking (placeholder):", data);
  return { error: null };
};