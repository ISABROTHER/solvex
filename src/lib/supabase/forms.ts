import { submitJobApplication } from './operations';

export const submitCareerApplication = async (data: {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  countryCode: string;
  coverLetter: string;
  portfolioUrl?: string;
  appliedRoles: string[];
}) => {
  try {
    const applications = [];
    const errors = [];

    for (const positionId of data.appliedRoles) {
      const result = await submitJobApplication({
        job_position_id: positionId,
        full_name: `${data.firstName} ${data.lastName}`,
        email: data.email,
        phone: data.phone,
        country_code: data.countryCode,
        cover_letter: data.coverLetter,
        portfolio_url: data.portfolioUrl || null,
        linkedin_url: null,
        status: 'pending'
      });

      if (result.error) {
        errors.push(result.error.message);
      } else {
        applications.push(result.data);
      }
    }

    if (errors.length > 0) {
      return { data: null, success: false, error: errors[0] };
    }

    return { data: applications, success: true, error: null };
  } catch (error) {
    return { data: null, success: false, error: error instanceof Error ? error.message : 'Failed to submit application' };
  }
};

export const submitRentalBooking = async (data: any) => {
  console.warn('Database not configured. Form submission disabled.');
  return { data: null, success: false, error: 'Database not configured' };
};

export const submitContactInquiry = async (data: any) => {
  console.warn('Database not configured. Form submission disabled.');
  return { data: null, success: false, error: 'Database not configured' };
};
