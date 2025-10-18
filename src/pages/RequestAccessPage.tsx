// src/pages/RequestAccessPage.tsx
import React, { useState } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { supabaseForms } from '../lib/supabase/forms'; // Ensure correct import
import { useToast } from '../contexts/ToastContext';
import { Loader2, Send } from 'lucide-react';
import { Link } from 'react-router-dom';

// Schema matching the form and SQL table requirements
const requestAccessSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(1, 'Phone number is required'), // Required phone
  company: z.string().optional(),
  reason: z.string().min(10, 'Reason requires at least 10 characters').optional(),
});
type RequestAccessFormData = z.infer<typeof requestAccessSchema>;

const RequestAccessPage: React.FC = () => {
    const { addToast } = useToast();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [submittedFirstName, setSubmittedFirstName] = useState('');

    const { register, handleSubmit, reset, formState: { errors } } = useForm<RequestAccessFormData>({
        resolver: zodResolver(requestAccessSchema),
    });

    const onSubmit: SubmitHandler<RequestAccessFormData> = async (data) => {
        setIsSubmitting(true);
        setIsSuccess(false);
        setSubmittedFirstName('');
        try {
            // Call the actual Supabase submission function
            const { error } = await supabaseForms.submitAccessRequest(data);
            if (error) {
                if (error.code === '23505') { // Handle unique email error
                     addToast({ type: 'error', title: 'Email already submitted', message: 'An access request with this email exists.' });
                } else {
                    console.error('Supabase submit error:', error);
                    throw new Error(error.message || 'Database error occurred.');
                }
            } else {
                addToast({ type: 'success', title: 'Request Sent!', message: 'We will review your request shortly.' });
                setSubmittedFirstName(data.firstName); // Store name for success message
                reset(); // Clear the form fields
                setIsSuccess(true); // Show the success view
            }
        } catch (err: any) {
            console.error('Failed to submit access request:', err);
            addToast({ type: 'error', title: 'Submission Error', message: err.message || 'Please try again.' });
        } finally {
            setIsSubmitting(false);
        }
    };

    // Success View
    if (isSuccess) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
                <div className="max-w-md w-full text-center bg-white p-8 rounded-lg shadow-md">
                    <h1 className="text-2xl font-bold text-green-600 mb-4">Request Received!</h1>
                    <p className="text-gray-600 mb-6">
                        Thanks, <span className="font-semibold">{submittedFirstName}</span>. We've got your request and will notify you via email once reviewed.
                    </p>
                    <Link to="/my-page" className="text-[#FF5722] hover:underline font-medium">
                        Back to Login
                    </Link>
                </div>
            </div>
        );
    }

    // Form View
    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
            <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-md">
                <h1 className="text-2xl font-bold text-center text-gray-800 mb-2">Request Client Access</h1>
                <p className="text-center text-gray-500 mb-6 text-sm">Fill out the form for portal access.</p>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    {/* First Name & Last Name */}
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
                    {/* Email */}
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email <span className="text-red-600">*</span></label>
                        <input type="email" id="email" {...register('email')} className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#FF5722] focus:ring-[#FF5722] sm:text-sm ${errors.email ? 'border-red-500 ring-red-500' : ''}`} />
                        {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email.message}</p>}
                    </div>
                    {/* Phone */}
                    <div>
                        <label htmlFor="phone" className="block text-sm font-medium text-gray-700">Phone <span className="text-red-600">*</span></label>
                        <input type="tel" id="phone" {...register('phone')} className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#FF5722] focus:ring-[#FF5722] sm:text-sm ${errors.phone ? 'border-red-500 ring-red-500' : ''}`} />
                        {errors.phone && <p className="mt-1 text-xs text-red-600">{errors.phone.message}</p>}
                    </div>
                    {/* Company */}
                    <div>
                        <label htmlFor="company" className="block text-sm font-medium text-gray-700">Company <span className="text-gray-400">(Optional)</span></label>
                        <input type="text" id="company" {...register('company')} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#FF5722] focus:ring-[#FF5722] sm:text-sm" />
                    </div>
                    {/* Reason */}
                    <div>
                        <label htmlFor="reason" className="block text-sm font-medium text-gray-700">Reason for Access <span className="text-gray-400">(Optional)</span></label>
                        <textarea id="reason" rows={3} {...register('reason')} className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#FF5722] focus:ring-[#FF5722] sm:text-sm ${errors.reason ? 'border-red-500 ring-red-500' : ''}`} placeholder="Briefly explain why..."></textarea>
                        {errors.reason && <p className="mt-1 text-xs text-red-600">{errors.reason.message}</p>}
                    </div>
                    {/* Submit Button */}
                    <div className="pt-2">
                        <button type="submit" disabled={isSubmitting} className="w-full flex justify-center items-center gap-2 rounded-md bg-[#FF5722] px-3 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-[#E64A19] disabled:opacity-50">
                            {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                            {isSubmitting ? 'Submitting...' : 'Submit Request'}
                        </button>
                    </div>
                     {/* Back to Login Link */}
                     <div className="text-center mt-4">
                        <Link to="/my-page" className="text-sm text-gray-600 hover:text-[#FF5722]">
                            Back to Login
                        </Link>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default RequestAccessPage;