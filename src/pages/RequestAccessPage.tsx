// src/pages/RequestAccessPage.tsx
// (Showing relevant parts, assuming imports and schema are correct)

import React, { useState } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { supabaseForms } from '../lib/supabase/forms'; // Ensure this is the correct path
import { useToast } from '../contexts/ToastContext';
import { Loader2, Send } from 'lucide-react';
import { Link } from 'react-router-dom'; // Added Link for navigation

const requestAccessSchema = z.object({
  name: z.string().min(2, 'Full name is required'),
  email: z.string().email('Invalid email address'),
  company: z.string().optional(),
  reason: z.string().min(10, 'Please provide a brief reason (min 10 characters)').optional(),
});
type RequestAccessFormData = z.infer<typeof requestAccessSchema>;


const RequestAccessPage: React.FC = () => {
    const { showToast } = useToast();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false); // State to show success message
    const {
        register,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm<RequestAccessFormData>({
        resolver: zodResolver(requestAccessSchema),
    });

    const onSubmit: SubmitHandler<RequestAccessFormData> = async (data) => {
        setIsSubmitting(true);
        setIsSuccess(false); // Reset success state
        try {
            // Call the Supabase function to insert data
            const { error } = await supabaseForms.submitAccessRequest(data);
            if (error) {
                // Check for unique constraint violation (email already exists)
                if (error.code === '23505') { // PostgreSQL unique violation code
                     showToast('An access request with this email already exists.', 'error');
                } else {
                    throw error; // Throw other errors
                }
            } else {
                showToast('Access request submitted successfully! We will review it shortly.', 'success');
                reset(); // Clear form on success
                setIsSuccess(true); // Show success message UI
            }
        } catch (error: any) {
            console.error('Failed to submit access request:', error);
            showToast(error.message || 'Failed to submit request. Please try again.', 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

    // If successfully submitted, show a confirmation message instead of the form
    if (isSuccess) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
                <div className="max-w-md w-full text-center bg-white p-8 rounded-lg shadow-md">
                    <h1 className="text-2xl font-bold text-green-600 mb-4">Request Sent!</h1>
                    <p className="text-gray-600 mb-6">Thank you for your request. We have received your information and will review it. You'll be notified via email once a decision is made.</p>
                    <Link to="/" className="text-[#FF5722] hover:underline font-medium">
                        Return to Home Page
                    </Link>
                </div>
            </div>
        );
    }

    // Otherwise, show the form
    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
            <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-md">
                <h1 className="text-2xl font-bold text-center text-gray-800 mb-2">Request Client Access</h1>
                <p className="text-center text-gray-500 mb-6 text-sm">Fill out the form below to request access to the SolveX client portal.</p>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    {/* Name */}
                    <div>
                        <label htmlFor="name" className="block text-sm font-medium text-gray-700">Full Name <span className="text-red-600">*</span></label>
                        <input type="text" id="name" {...register('name')} className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#FF5722] focus:ring-[#FF5722] sm:text-sm ${errors.name ? 'border-red-500 ring-red-500' : ''}`} />
                        {errors.name && <p className="mt-1 text-xs text-red-600">{errors.name.message}</p>}
                    </div>
                    {/* Email */}
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email <span className="text-red-600">*</span></label>
                        <input type="email" id="email" {...register('email')} className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#FF5722] focus:ring-[#FF5722] sm:text-sm ${errors.email ? 'border-red-500 ring-red-500' : ''}`} />
                        {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email.message}</p>}
                    </div>
                    {/* Company */}
                    <div>
                        <label htmlFor="company" className="block text-sm font-medium text-gray-700">Company <span className="text-gray-400">(Optional)</span></label>
                        <input type="text" id="company" {...register('company')} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#FF5722] focus:ring-[#FF5722] sm:text-sm" />
                    </div>
                    {/* Reason */}
                    <div>
                        <label htmlFor="reason" className="block text-sm font-medium text-gray-700">Reason for Access <span className="text-gray-400">(Optional)</span></label>
                        <textarea id="reason" rows={3} {...register('reason')} className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#FF5722] focus:ring-[#FF5722] sm:text-sm ${errors.reason ? 'border-red-500 ring-red-500' : ''}`} placeholder="Briefly explain why you need access..."></textarea>
                        {errors.reason && <p className="mt-1 text-xs text-red-600">{errors.reason.message}</p>}
                    </div>
                    {/* Submit */}
                    <div className="pt-2">
                        <button type="submit" disabled={isSubmitting} className="w-full flex justify-center items-center gap-2 rounded-md bg-[#FF5722] px-3 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-[#E64A19] disabled:opacity-50">
                            {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                            {isSubmitting ? 'Submitting...' : 'Submit Request'}
                        </button>
                    </div>
                     {/* Back Link */}
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