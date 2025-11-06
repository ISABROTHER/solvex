/**
 * Validation utilities for forms and user input
 */

import { FormValidationErrors } from "../types/form.types";

/**
 * Validates email format using regex
 * @param email - Email string to validate
 * @returns boolean indicating if email is valid
 */
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validates phone number format
 * @param phone - Phone number string to validate
 * @returns boolean indicating if phone number is valid
 */
export const isValidPhoneNumber = (phone: string): boolean => {
  const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
  return phoneRegex.test(phone.replace(/\s/g, ''));
};

/**
 * Counts words in a text string
 * @param text - Text to count words in
 * @returns number of words
 */
export const countWords = (text: string): number => {
  return text.trim().split(/\s+/).filter(Boolean).length;
};

/**
 * Validates application form data
 * @param formData - FormData object containing form fields
 * @param selectedRoles - Array of selected roles
 * @returns Object containing validation errors
 */
export const validateApplicationForm = (
  formData: FormData, 
  selectedRoles: any[]
): FormValidationErrors => {
  const errors: FormValidationErrors = {};
  
  const firstName = formData.get('firstName') as string;
  const surname = formData.get('surname') as string;
  const email = formData.get('email') as string;
  const phoneNumber = formData.get('phoneNumber') as string;
  const message = formData.get('coverLetter') as string;
  
  if (!firstName?.trim()) {
    errors.firstName = "First name is required.";
  }
  
  if (!surname?.trim()) {
    errors.surname = "Surname is required.";
  }
  
  if (!email?.trim()) {
    errors.email = "Email is required.";
  } else if (!isValidEmail(email)) {
    errors.email = "Please enter a valid email address.";
  }
  
  if (!phoneNumber?.trim()) {
    errors.phoneNumber = "Phone number is required.";
  } else if (!isValidPhoneNumber(phoneNumber)) {
    errors.phoneNumber = "Please enter a valid phone number.";
  }
  
  if (!message?.trim()) {
    errors.message = "Cover letter is required.";
  }
  
  if (selectedRoles.length === 0) {
    errors.roles = "Please select at least one role.";
  }
  
  return errors;
};

/**
 * Validates URL format
 * @param url - URL string to validate
 * @returns boolean indicating if URL is valid
 */
export const isValidUrl = (url: string): boolean => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};