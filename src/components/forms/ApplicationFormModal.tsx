import React, { useState, useEffect, useMemo } from 'react';
import { useForm, Controller, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Loader2 } from 'lucide-react';
import Select from 'react-select';
import CountryDropdown from './CountryDropdown'; // Ensure this path is correct
import { submitCareerApplication } from '../../lib/supabase/forms'; // Ensure this path is correct
import type { JobPosition } from '../../lib/supabase/operations'; // Import the type
import { countryCodes } from '../../data/forms/country-codes.data'; // Import country codes

// --- Zod Validation Schema ---
const phoneRegex = /^[0-9]{7,15}$/; // Simple regex for phone (7-15 digits)
const urlRegex = /^(https|http):\/\/[^\s$.?#].[^\s]*$/; // Basic URL validation

const applicationSchema = z.object({
  firstName: z.string().min(2, 'First name is required'),
  lastName: z.string().min(2, 'Last name is required'),
  email: z.string().email('Invalid email address'),
  countryCode: z.string().nonempty('Country code is required'),
  phone: z.string().regex(phoneRegex, 'Invalid phone number (digits only)'),
  appliedRoles: z.array(z.object({
    value: z.string(),
    label: z.string(),
  })).min(1, 'You must select at least one role'),
  coverLetter: z.string().min(50, 'Please write a cover letter (min 50 characters)'),
  portfolioUrl: z.string().url('Invalid URL (must include http:// or https://)').optional().or(z.literal('')),
});

type ApplicationFormData = z.infer<typeof applicationSchema>;

// Interface for the data we send to the Supabase function
interface CareerApplicationData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  countryCode: string;
  coverLetter: string;
  portfolioUrl?: string;
  appliedRoles: string[]; // Array of role IDs
}

// --- Component Props ---
interface ApplicationFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  roles: JobPosition[]; // Roles pre-selected by the user
  allAvailableRoles: JobPosition[]; // All jobs for the dropdown
  onSuccess: () => void;
}

const ApplicationFormModal: React.FC<ApplicationFormModalProps> = ({
  isOpen,
  onClose,
  roles,
  allAvailableRoles,
  onSuccess,
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // --- Form Persistence (Optional but recommended) ---
  const persistenceKey = 'careerApplicationForm';

  // --- Map Roles for React-Select ---
  const roleOptions = useMemo(() => {
    return allAvailableRoles.map(role => ({
      value: role.id,
      label: `${role.title} (${role.team_name || 'General'})`
    }));
  }, [allAvailableRoles]);

  const defaultSelectedRoles = useMemo(() => {
    return roleOptions.filter(option => roles.some(role => role.id === option.value));
  }, [roles, roleOptions]);
  
  // Find default country code (e.g., Ghana "+233")
  const defaultCountryCode = countryCodes.find(c => c.code === "GH")?.dial_code || "+233";

  // --- React-Hook-Form Initialization ---
  const {
    control,
    handleSubmit,
    register,
    reset,
    watch,
    formState: { errors },
  } = useForm<ApplicationFormData>({
    resolver: zodResolver(applicationSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      countryCode: defaultCountryCode,
      phone: '',
      appliedRoles: defaultSelectedRoles,
      coverLetter: '',
      portfolioUrl: '',
    },
  });
  
  // --- Load from LocalStorage ---
   useEffect(() => {
    const savedData = localStorage.getItem(persistenceKey);
    if (savedData) {
      try {
        const parsedData = JSON.parse(savedData);
        // Ensure appliedRoles is in the { value, label } format
        if (parsedData.appliedRoles && parsedData.appliedRoles.length > 0 && typeof parsedData.appliedRoles[0] === 'string') {
           parsedData.appliedRoles = parsedData.appliedRoles.map(roleId => 
             roleOptions.find(opt => opt.value === roleId)
           ).filter(Boolean); // Filter out any roles that no longer exist
        }
        reset(parsedData);
      } catch (e) {
        console.error("Failed to parse saved form data", e);
        localStorage.removeItem(persistenceKey);
      }
    } else {
        // If no saved data, set default roles
        reset({
            ...applicationSchema.partial().default(),
            countryCode: defaultCountryCode,
            appliedRoles: defaultSelectedRoles
        });
    }
  }, [reset, roleOptions, defaultSelectedRoles, persistenceKey, defaultCountryCode]);
  
  // --- Save to LocalStorage ---
  const watchedValues = watch();
  useEffect(() => {
    localStorage.setItem(persistenceKey, JSON.stringify(watchedValues));
  }, [watchedValues, persistenceKey]);
  
  // --- Reset form on close/success ---
  useEffect(() => {
    if (isOpen) {
      // When modal opens, ensure default roles are set
      reset({ ...watchedValues, appliedRoles: defaultSelectedRoles });
    }
  }, [isOpen, defaultSelectedRoles, reset]);


  // --- Form Submission Handler ---
  const onSubmit: SubmitHandler<ApplicationFormData> = async (data) => {
    setIsSubmitting(true);
    setError(null);
    
    // Map form data to the shape expected by the API
    const formData: CareerApplicationData = {
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      phone: data.phone,
      countryCode: data.countryCode, // This is just the string value, e.g. "+1"
      coverLetter: data.coverLetter,
      portfolioUrl: data.portfolioUrl || undefined,
      appliedRoles: data.appliedRoles.map(role => role.value) // Array of role IDs
    };

    try {
      const { error: submitError } = await submitCareerApplication(formData);
      
      if (submitError) {
        throw submitError;
      }
      
      // Clear form persistence on success
      if (persistenceKey) {
        localStorage.removeItem(persistenceKey);
      }
      reset(); // Reset form fields
      onSuccess();
      
    } catch (err: any) {
      console.error('Application submission error:', err);
      
      // --- THIS IS THE FIX ---
      // We must set the error *message* (a string), not the whole error object.
      setError(err.message || 'An unknown error occurred. Please try again.');
      // --- END OF FIX ---
      
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/50"
            onClick={onClose}
          />
          
          {/* Modal Panel */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="relative bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col"
          >
            {/* Header */}
            <div className="flex-shrink-0 p-6 flex justify-between items-center border-b">
              <h2 className="text-xl font-bold text-gray-800">Apply Now</h2>
              <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100 transition-colors">
                <X size={20} />
              </button>
            </div>
            
            {/* Form */}
            <form onSubmit={handleSubmit(onSubmit)} className="flex-1 overflow-y-auto p-6 space-y-5">
              
              {/* Personal Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700">First Name</label>
                  <input {...register('firstName')} className={`mt-1 w-full p-2 border rounded-md ${errors.firstName ? 'border-red-500' : 'border-gray-300'}`} />
                  {errors.firstName && <p className="text-xs text-red-600 mt-1">{errors.firstName.message}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Last Name</label>
                  <input {...register('lastName')} className={`mt-1 w-full p-2 border rounded-md ${errors.lastName ? 'border-red-500' : 'border-gray-300'}`} />
                  {errors.lastName && <p className="text-xs text-red-600 mt-1">{errors.lastName.message}</p>}
                </div>
              </div>

              {/* Contact Info */}
              <div>
                <label className="block text-sm font-medium text-gray-700">Email Address</label>
                <input type="email" {...register('email')} className={`mt-1 w-full p-2 border rounded-md ${errors.email ? 'border-red-500' : 'border-gray-300'}`} />
                {errors.email && <p className="text-xs text-red-600 mt-1">{errors.email.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Phone Number</label>
                <div className="flex mt-1">
                  <Controller
                    name="countryCode"
                    control={control}
                    rules={{ required: true }}
                    render={({ field }) => (
                      <CountryDropdown
                        value={field.value}
                        onChange={field.onChange}
                      />
                    )}
                  />
                  <input
                    type="tel"
                    {...register('phone')}
                    placeholder="e.g. 244123456"
                    className={`flex-1 w-full p-2 border rounded-r-md ${errors.phone ? 'border-red-500' : 'border-gray-300'}`}
                  />
                </div>
                 {(errors.countryCode || errors.phone) && <p className="text-xs text-red-600 mt-1">{errors.phone?.message || errors.countryCode?.message}</p>}
              </div>

              {/* Roles */}
              <div>
                <label className="block text-sm font-medium text-gray-700">Applying for</label>
                 <Controller
                  name="appliedRoles"
                  control={control}
                  rules={{ required: 'You must select at least one role.' }}
                  render={({ field }) => (
                    <Select
                      {...field}
                      isMulti
                      options={roleOptions}
                      className={`mt-1 ${errors.appliedRoles ? 'react-select-error' : ''}`}
                      classNamePrefix="react-select"
                      placeholder="Select roles..."
                    />
                  )}
                />
                {errors.appliedRoles && <p className="text-xs text-red-600 mt-1">{errors.appliedRoles.message}</p>}
              </div>

              {/* Portfolio */}
              <div>
                <label className="block text-sm font-medium text-gray-700">Portfolio/Website URL (Optional)</label>
                <input {...register('portfolioUrl')} placeholder="https://..." className={`mt-1 w-full p-2 border rounded-md ${errors.portfolioUrl ? 'border-red-500' : 'border-gray-300'}`} />
                {errors.portfolioUrl && <p className="text-xs text-red-600 mt-1">{errors.portfolioUrl.message}</p>}
              </div>
              
              {/* Cover Letter */}
              <div>
                <label className="block text-sm font-medium text-gray-700">Cover Letter</label>
                <textarea
                  {...register('coverLetter')}
                  rows={6}
                  className={`mt-1 w-full p-2 border rounded-md ${errors.coverLetter ? 'border-red-500' : 'border-gray-300'}`}
                  placeholder="Tell us why you're a great fit for this role..."
                />
                {errors.coverLetter && <p className="text-xs text-red-600 mt-1">{errors.coverLetter.message}</p>}
              </div>
              
              {/* General Error Message */}
              {error && (
                <div className="mt-4 p-3 bg-red-100 border border-red-300 text-red-700 rounded-lg text-sm">
                  <strong>Error:</strong> {error}
                </div>
              )}

            </form>
            
            {/* Footer / Submit Button */}
            <div className="flex-shrink-0 p-6 border-t flex justify-end bg-gray-50">
              <button
                type="submit"
                onClick={handleSubmit(onSubmit)}
                disabled={isSubmitting}
                className="w-full md:w-auto px-8 py-3 bg-[#FF5722] text-white font-semibold rounded-lg shadow-md hover:bg-[#E64A19] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  'Submit Application'
                )}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default ApplicationFormModal;