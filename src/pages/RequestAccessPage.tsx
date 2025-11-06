// src/pages/RequestAccessPage.tsx
import React, { useState, useEffect } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { supabaseForms } from '../lib/supabase/forms';
import { useToast } from '../contexts/ToastContext';
import { Loader2, Send, CheckCircle } from 'lucide-react'; // <-- Ensure CheckCircle is imported
import { Link } from 'react-router-dom';
import Alert from '../components/Alert'; // <-- Ensure Alert is imported

// Schema definition (remains the same)
const requestAccessSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(1, 'Phone number is required'),
  company: z.string().optional(),
  reason: z.string().min(10, 'Reason requires at least 10 characters').optional(),
});
type RequestAccessFormData = z.infer<typeof requestAccessSchema>;

// Component definition starts here
const RequestAccessPage: React.FC = () => {
    // Hooks and State
    const { addToast } = useToast();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [submittedFirstName, setSubmittedFirstName] = useState('');
    const [formError, setFormError] = useState<string | null>(null);

    const {
        register,
        handleSubmit,
        reset,
        watch,
        formState: { errors },
    } = useForm<RequestAccessFormData>({
        resolver: zodResolver(requestAccessSchema),
    });

    // Effect to clear error when typing
    const watchedFields = watch(["firstName", "lastName", "email", "phone"]);
    useEffect(() => {
        if (formError) setFormError(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [watchedFields]);

    // onSubmit handler function
    const onSubmit: SubmitHandler<RequestAccessFormData> = async (data) => {
        setIsSubmitting(true);
        setIsSuccess(false);
        setSubmittedFirstName('');
        setFormError(null);

        try {
            const { error } = await supabaseForms.submitAccessRequest(data);

            if (error) {
                if (error.code === '23505' || error.message?.includes('already exists')) {
                    setFormError(error.message || 'An access request with this email already exists.');
                } else {
                    console.error('Unhandled Supabase submit error:', error);
                    addToast({ type: 'error', title: 'Database Error', message: error.message || 'Could not submit request.' });
                }
            } else {
                addToast({ type: 'success', title: 'Request Sent!', message: 'We will review your request shortly.' });
                setSubmittedFirstName(data.firstName);
                reset();
                setIsSuccess(true);
            }
        } catch (err: any) {
            console.error('Client-side error during submission:', err);
            addToast({ type: 'error', title: 'Submission Error', message: err.message || 'An unexpected error occurred.' });
        } finally {
            setIsSubmitting(false);
        }
    }; // <-- End of onSubmit function

    // Conditional return for Success View
    if (isSuccess) {
        return ( // This return is correctly inside the component function
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
                <div className="max-w-md w-full text-center bg-white p-8 rounded-lg shadow-md">
                    <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
                    <h1 className="text-2xl font-bold text-green-600 mb-4">Request Received!</h1>
                    <p className="text-gray-600 mb-6">
                        Thanks, <span className="font-semibold">{submittedFirstName}</span>. We've got your request and will notify you via email once reviewed.
                    </p>
                    <Link to="/my-page" className="inline-block px-4 py-2 bg-[#FF5722] text-white font-semibold rounded-md hover:bg-[#E64A19] transition-colors">
                        Back to Login
                    </Link>
                </div>
            </div>
        );
    } // <-- End of if(isSuccess) block

    // Main return for the Form View
    return ( // This return is also correctly inside the component function
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
            <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-md">
                <h1 className="text-2xl font-bold text-center text-gray-800 mb-2">Request Client Access</h1>
                <p className="text-center text-gray-500 mb-6 text-sm">Fill out the form for portal access.</p>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">

                    {/* Alert component for formError */}
                    {formError && (
                        <Alert type="error" message={formError} className="my-4" />
                    )}

                    {/* Form Inputs */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">First Name <span className="text-red-600">*</span></label>
                            <input type="text" id="firstName" {...register('firstName')} className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#FF5722] focus:ring-[#FF5722] sm:text-sm ${errors.firstName ? 'border-red-500 ring-red-500' : ''}`} />
                            {errors.firstName && <p className="mt-1 text-xs text-red-600">{errors.firstName.message}</p>}
                        </div>
                        <div>
                            <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">Last Name <span className="text-red-600">*</span></label>
                            <input type="text" id="lastName" {...register('lastName')} className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#FF5722] focus:ring-[#FF5722] sm:text-sm ${errors.lastName ? 'border-red-500 ring-red-500' : ''}`} />
                            {errors.lastName && <p className="mt-1 text-xs text-red-600">{errors.lastName.message}</p>}
                        </div>
                    </div>
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email <span className="text-red-600">*</span></label>
                        <input type="email" id="email" {...register('email')} className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#FF5722] focus:ring-[#FF5722] sm:text-sm ${errors.email ? 'border-red-500 ring-red-500' : ''}`} />
                        {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email.message}</p>}
                    </div>
                    <div>
                        <label htmlFor="phone" className="block text-sm font-medium text-gray-700">Phone <span className="text-red-600">*</span></label>
                        <input type="tel" id="phone" {...register('phone')} className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#FF5722] focus:ring-[#FF5722] sm:text-sm ${errors.phone ? 'border-red-500 ring-red-500' : ''}`} />
                        {errors.phone && <p className="mt-1 text-xs text-red-600">{errors.phone.message}</p>}
                    </div>
                    <div>
                        <label htmlFor="company" className="block text-sm font-medium text-gray-700">Company <span className="text-gray-400">(Optional)</span></label>
                        <input type="text" id="company" {...register('company')} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#FF5722] focus:ring-[#FF5722] sm:text-sm" />
                    </div>
                    <div>
                        <label htmlFor="reason" className="block text-sm font-medium text-gray-700">Reason for Access <span className="text-gray-400">(Optional)</span></label>
                        <textarea id="reason" rows={3} {...register('reason')} className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#FF5722] focus:ring-[#FF5722] sm:text-sm ${errors.reason ? 'border-red-500 ring-red-500' : ''}`} placeholder="Briefly explain why..."></textarea>
                        {errors.reason && <p className="mt-1 text-xs text-red-600">{errors.reason.message}</p>}
                    </div>
                    <div className="pt-2">
                        <button type="submit" disabled={isSubmitting} className="w-full flex justify-center items-center gap-2 rounded-md bg-[#FF5722] px-3 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-[#E64A19] disabled:opacity-50">
                            {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                            {isSubmitting ? 'Submitting...' : 'Submit Request'}
                        </button>
                    </div>
                     <div className="text-center mt-4">
                        <Link to="/my-page" className="text-sm text-gray-600 hover:text-[#FF5722]">
                            Back to Login
                        </Link>
                    </div>
                </form>
            </div>
        </div>
    );

}; // <-- This curly brace closes the RequestAccessPage component function

export default RequestAccessPage;