// src/pages/ContactPage.tsx

import React, { useState } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Mail, Phone, Clock, Send, Loader2, Link as LinkIcon, Instagram, Facebook, Twitter, Linkedin } from 'lucide-react';
import { COMPANY_INFO } from '../utils/constants'; // Import company info
import { useToast } from '../contexts/ToastContext';
import { supabaseForms } from '../lib/supabase/forms'; // Assuming this handles form submission

// --- Contact Form Schema (Simplified) ---
const contactSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  email: z.string().email('Invalid email address'),
  phone: z.string().optional(), // Optional phone number
  message: z.string().min(10, 'Message must be at least 10 characters'),
});
type ContactFormData = z.infer<typeof contactSchema>;

// --- Social Media Icon Mapping ---
const socialIconMap: { [key: string]: React.ElementType } = {
  Instagram: Instagram,
  Facebook: Facebook,
  Twitter: Twitter,
  LinkedIn: Linkedin,
  default: LinkIcon, // Fallback icon
};

const ContactPage: React.FC = () => {
  const { showToast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
  });

  const onSubmit: SubmitHandler<ContactFormData> = async (data) => {
    setIsSubmitting(true);
    try {
      // Use your Supabase function to submit the form data
      const { error } = await supabaseForms.submitContactForm(data);
      if (error) throw error;

      showToast('Message sent successfully!', 'success');
      reset(); // Clear the form
    } catch (error: any) {
      console.error('Failed to send message:', error);
      showToast(error.message || 'Failed to send message. Please try again.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
        <div className="mb-12 text-center">
          <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl">
            Get in Touch
          </h1>
          <p className="mt-4 text-lg leading-6 text-gray-500">
            We're here to help. Reach out via email, phone, or send us a message directly.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* --- Contact Info & Socials (Left Column) --- */}
          <div className="space-y-8 lg:col-span-1">
            {/* Email */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Mail size={20} className="text-[#FF5722]" /> Email
              </h2>
              <a href={`mailto:${COMPANY_INFO.EMAIL}`} className="mt-1 block text-base text-[#FF5722] hover:text-[#E64A19] hover:underline">
                {COMPANY_INFO.EMAIL}
              </a>
              <p className="mt-1 text-sm text-gray-500">We'll respond within 24 hours.</p>
            </div>

            {/* Phone */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Phone size={20} className="text-[#FF5722]" /> Phone
              </h2>
              <a href={`tel:${COMPANY_INFO.PHONE.replace(/\s/g, '')}`} className="mt-1 block text-base text-gray-800 hover:text-black">
                 {COMPANY_INFO.PHONE}
              </a>
              <p className="mt-1 text-sm text-gray-500 flex items-center gap-1">
                 <Clock size={14} /> Mon-Fri, 9AM-6PM GMT
              </p>
            </div>

            {/* Social Media Handles */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-2">
                Media Handles
              </h2>
              <div className="flex space-x-4">
                {COMPANY_INFO.SOCIAL_MEDIA.map((social) => {
                  const Icon = socialIconMap[social.platform] || socialIconMap.default;
                  return (
                    <a
                      key={social.platform}
                      href={social.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gray-500 hover:text-[#FF5722] transition-colors"
                      aria-label={social.platform}
                    >
                      <Icon size={24} />
                    </a>
                  );
                 })}
              </div>
            </div>
          </div>

          {/* --- Contact Form (Right Column) --- */}
          <div className="lg:col-span-2">
            <div className="bg-white p-6 sm:p-8 rounded-lg shadow border border-gray-100">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Send a Message</h2>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                {/* Name */}
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                    Name <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="text"
                    id="name"
                    {...register('name')}
                    className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#FF5722] focus:ring-[#FF5722] sm:text-sm ${errors.name ? 'border-red-500 ring-red-500' : ''}`}
                    placeholder="Your Full Name"
                  />
                  {errors.name && <p className="mt-1 text-xs text-red-600">{errors.name.message}</p>}
                </div>

                {/* Email */}
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                    Email <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="email"
                    id="email"
                    {...register('email')}
                    className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#FF5722] focus:ring-[#FF5722] sm:text-sm ${errors.email ? 'border-red-500 ring-red-500' : ''}`}
                    placeholder="you@example.com"
                  />
                  {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email.message}</p>}
                </div>

                {/* Phone (Optional) */}
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                    Phone <span className="text-gray-400">(Optional)</span>
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    {...register('phone')}
                    className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#FF5722] focus:ring-[#FF5722] sm:text-sm ${errors.phone ? 'border-red-500 ring-red-500' : ''}`}
                    placeholder="Your Phone Number"
                  />
                  {errors.phone && <p className="mt-1 text-xs text-red-600">{errors.phone.message}</p>}
                </div>

                {/* Message */}
                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-gray-700">
                    Message <span className="text-red-600">*</span>
                  </label>
                  <textarea
                    id="message"
                    rows={4}
                    {...register('message')}
                    className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#FF5722] focus:ring-[#FF5722] sm:text-sm ${errors.message ? 'border-red-500 ring-red-500' : ''}`}
                    placeholder="How can we help you?"
                  />
                  {errors.message && <p className="mt-1 text-xs text-red-600">{errors.message.message}</p>}
                </div>

                {/* Submit Button */}
                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex w-full justify-center items-center gap-2 rounded-md bg-[#FF5722] px-3 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-[#E64A19] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#FF5722] disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                    {isSubmitting ? 'Sending...' : 'Send Message'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;