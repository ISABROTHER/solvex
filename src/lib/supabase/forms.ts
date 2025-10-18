import { submitJobApplication } from './operations'; // This now points to createJobApplication which uses the correct table

export const submitCareerApplication = async (data: {
  firstName: string;
  lastName: string; 
  email: string;
  phone: string;
  countryCode: string;
  coverLetter: string;
  portfolioUrl?: string;
  appliedRoles: string[]; // These should be job_position_id values
}) => {
  try {
    const applications = [];
    const errors = [];

    for (const positionId of data.appliedRoles) {
      // submitJobApplication is now an alias for createJobApplication
      const result = await submitJobApplication({
        job_position_id: positionId,
        full_name: `${data.firstName} ${data.lastName}`,
        email: data.email,
        phone: data.phone,
        country_code: data.countryCode,
        cover_letter: data.coverLetter,
        portfolio_url: data.portfolioUrl || null,
        // Assuming your new table doesn't have linkedin_url by default
        // linkedin_url: null,
        status: 'pending'
      });

      if (result.error) {
        // Log the specific Supabase error for debugging
        console.error(`Error submitting for position ${positionId}:`, result.error);
        errors.push(`Failed for position ID ${positionId}: ${result.error.message}`);
      } else {
        applications.push(result.data);
      }
    }

    if (errors.length > 0) {
      // Return the first error encountered
      return { data: null, success: false, error: errors[0] };
    }

    // Return the array of successfully created application data
    return { data: applications, success: true, error: null };
  } catch (error) {
    console.error("Unexpected error in submitCareerApplication:", error);
    return { data: null, success: false, error: error instanceof Error ? error.message : 'Failed to submit application due to an unexpected issue.' };
  }
};

// Keep other functions as they are
export const submitRentalBooking = async (data: any) => {
  console.warn('Database not configured. Form submission disabled.');
  return { data: null, success: false, error: 'Database not configured' };
};

export const submitContactInquiry = async (data: any) => {
  console.warn('Database not configured. Form submission disabled.');
  return { data: null, success: false, error: 'Database not configured' };
};

export const supabaseForms = {
  submitAccessRequest: async (data: any) => {
    console.warn('Database not configured. Form submission disabled.');
    return { data: null, error: { code: 'DB_NOT_CONFIGURED', message: 'Database not configured' } };
  }
};