// src/pages/client/NewRequestPage.tsx

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useClientMock } from './useClientMock'; // Assuming mock hook manages adding requests
import { useToast } from '../../contexts/ToastContext';
import { Send, Loader2 } from 'lucide-react';
import { SERVICES_DATA } from '../../data/business/services.data'; // Import services data

// Define the form schema using Zod
const requestSchema = z.object({
  serviceType: z.string().min(1, 'Please select or enter a service type.'),
  customServiceType: z.string().optional(),
  projectTitle: z.string().min(3, 'Project title must be at least 3 characters.'),
  brief: z.string().min(10, 'Brief must be at least 10 characters.'),
  timeline: z.string().min(1, 'Please provide an estimated timeline.'),
});

type RequestFormData = z.infer<typeof requestSchema>;

const NewRequestPage: React.FC = () => {
  const navigate = useNavigate();
  const { addRequest } = useClientMock();
  const { showToast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showCustomService, setShowCustomService] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<RequestFormData>({
    resolver: zodResolver(requestSchema),
    defaultValues: {
      serviceType: '',
      customServiceType: '',
      projectTitle: '',
      brief: '',
      timeline: '',
    },
  });

  const selectedServiceType = watch('serviceType');

  // Handle showing/hiding the custom service input
  React.useEffect(() => {
    if (selectedServiceType === 'Other') {
      setShowCustomService(true);
    } else {
      setShowCustomService(false);
      setValue('customServiceType', ''); // Clear custom input if 'Other' is deselected
    }
  }, [selectedServiceType, setValue]);

  const onSubmit: SubmitHandler<RequestFormData> = async (data) => {
    setIsSubmitting(true);
    // Use custom service type if 'Other' is selected and custom input is filled
    const finalServiceType = data.serviceType === 'Other' && data.customServiceType
        ? data.customServiceType
        : data.serviceType;

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));

    try {
        // Adapt the data structure to what addRequest expects if necessary
        const addedRequest = addRequest({
            serviceType: finalServiceType,
            projectTitle: data.projectTitle,
            brief: data.brief,
            timeline: data.timeline,
            // Assume other fields like status, createdAt, etc., are handled by addRequest
        });
        console.log('Request submitted:', addedRequest);
        showToast('Request submitted successfully!', 'success');
        navigate('/client/requests'); // Navigate to requests list after success
    } catch (error) {
        console.error('Failed to submit request:', error);
        showToast('Failed to submit request. Please try again.', 'error');
    } finally {
        setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">New Service Request</h1>
        {/* --- Added Instructional Text --- */}
        <p className="mt-1 text-sm text-gray-600 mb-6">
          Select a service from the list, or type your own if it’s not listed. Then fill in your project title, brief, and timeline. Click Submit to send your request.
        </p>
        {/* --- End Instructional Text --- */}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 bg-white p-6 sm:p-8 rounded-lg shadow border border-gray-100">
          {/* Service Type Dropdown */}
          <div>
            <label htmlFor="serviceType" className="block text-sm font-medium leading-6 text-gray-900">
              Service Type <span className="text-red-600">*</span>
            </label>
            <select
              id="serviceType"
              {...register('serviceType')}
              className={`mt-2 block w-full rounded-md border-0 py-2 pl-3 pr-10 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-[#FF5722] sm:text-sm sm:leading-6 ${errors.serviceType ? 'ring-red-500' : ''}`}
            >
              <option value="" disabled>Select a service...</option>
              {SERVICES_DATA.map((service) => (
                <option key={service.id} value={service.title}>{service.title}</option>
              ))}
              <option value="Other">Other (Please specify)</option>
            </select>
            {errors.serviceType && <p className="mt-1 text-xs text-red-600">{errors.serviceType.message}</p>}
          </div>

          {/* Custom Service Type Input (Conditional) */}
          {showCustomService && (
            <div>
              <label htmlFor="customServiceType" className="block text-sm font-medium leading-6 text-gray-900">
                Custom Service Type <span className="text-red-600">*</span>
              </label>
              <input
                type="text"
                id="customServiceType"
                {...register('customServiceType')}
                className={`mt-2 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-[#FF5722] sm:text-sm sm:leading-6 ${errors.customServiceType ? 'ring-red-500' : ''}`}
                placeholder="e.g., Custom Software Development"
              />
               {/* Conditionally validate custom input if 'Other' is selected */}
               {selectedServiceType === 'Other' && errors.serviceType && !watch('customServiceType') && (
                   <p className="mt-1 text-xs text-red-600">Please specify the service type.</p>
               )}
               {errors.customServiceType && <p className="mt-1 text-xs text-red-600">{errors.customServiceType.message}</p>}
            </div>
          )}

          {/* Project Title */}
          <div>
            <label htmlFor="projectTitle" className="block text-sm font-medium leading-6 text-gray-900">
              Project Title <span className="text-red-600">*</span>
            </label>
            <input
              type="text"
              id="projectTitle"
              {...register('projectTitle')}
              className={`mt-2 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-[#FF5722] sm:text-sm sm:leading-6 ${errors.projectTitle ? 'ring-red-500' : ''}`}
              placeholder="e.g., Q4 Marketing Campaign"
            />
            {errors.projectTitle && <p className="mt-1 text-xs text-red-600">{errors.projectTitle.message}</p>}
          </div>

          {/* Brief */}
          <div>
            <label htmlFor="brief" className="block text-sm font-medium leading-6 text-gray-900">
              Brief / Description <span className="text-red-600">*</span>
            </label>
            <textarea
              id="brief"
              rows={4}
              {...register('brief')}
              className={`mt-2 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-[#FF5722] sm:text-sm sm:leading-6 ${errors.brief ? 'ring-red-500' : ''}`}
              placeholder="Describe the project requirements, goals, target audience, etc."
            />
            {errors.brief && <p className="mt-1 text-xs text-red-600">{errors.brief.message}</p>}
          </div>

          {/* Timeline */}
          <div>
            <label htmlFor="timeline" className="block text-sm font-medium leading-6 text-gray-900">
              Estimated Timeline <span className="text-red-600">*</span>
            </label>
            <input
              type="text"
              id="timeline"
              {...register('timeline')}
              className={`mt-2 block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-[#FF5722] sm:text-sm sm:leading-6 ${errors.timeline ? 'ring-red-500' : ''}`}
              placeholder="e.g., 2 Weeks, End of Month, Flexible"
            />
            {errors.timeline && <p className="mt-1 text-xs text-red-600">{errors.timeline.message}</p>}
          </div>

          {/* Submit Button */}
          <div className="pt-4">
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex w-full justify-center items-center gap-2 rounded-md bg-[#FF5722] px-3 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-[#E64A19] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#FF5722] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                 <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                 <Send className="h-4 w-4" />
              )}
              {isSubmitting ? 'Submitting...' : 'Submit Request'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NewRequestPage;