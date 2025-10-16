// Career application form types
export interface CareerRole {
  name: string;
  description: string;
}

export interface CareerTeam {
  title: string;
  roles: CareerRole[];
}

// Form validation types
export interface FormValidationErrors {
  [key: string]: string;
}

export interface ApplicationFormState {
  submitting: boolean;
  succeeded: boolean;
  error: string;
}

// Country code type for phone number selection
export interface CountryCode {
  name: string;
  code: string;
  iso: string;
}