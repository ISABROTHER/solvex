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
    const position = data.appliedRoles[0];

    const result = await submitJobApplication({
      job_position_id: position,
      full_name: `${data.firstName} ${data.lastName}`,
      email: data.email,
      phone: data.phone,
      country_code: data.countryCode,
      cover_letter: data.coverLetter,
      portfolio_url: data.portfolioUrl,
      linkedin_url: null,
      status: 'pending'
    });

    if (result.error) {
      return { data: null, success: false, error: result.error.message };
    }

    return { data: result.data, success: true, error: null };
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
