/**
 * Form persistence utilities for saving and loading form state
 * Uses localStorage for client-side persistence
 */

const FORM_STATE_KEY = 'solvex_application_form_state';

export interface FormState {
  firstName?: string;
  surname?: string;
  email?: string;
  phone?: string;
  coverLetter?: string;
  portfolioUrl?: string;
  selectedRoles?: any[];
  selectedCountry?: any;
  uploadedFiles?: string[];
}

/**
 * Save form state to localStorage
 */
export const saveFormState = (formState: FormState): void => {
  try {
    localStorage.setItem(FORM_STATE_KEY, JSON.stringify(formState));
  } catch (error) {
    console.warn('Failed to save form state:', error);
  }
};

/**
 * Load form state from localStorage
 */
export const loadFormState = (): FormState | null => {
  try {
    const saved = localStorage.getItem(FORM_STATE_KEY);
    return saved ? JSON.parse(saved) : null;
  } catch (error) {
    console.warn('Failed to load form state:', error);
    return null;
  }
};

/**
 * Clear form state from localStorage
 */
export const clearFormState = (): void => {
  try {
    localStorage.removeItem(FORM_STATE_KEY);
  } catch (error) {
    console.warn('Failed to clear form state:', error);
  }
};