import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { User, Mail, Phone, Building, MessageSquareText, Send, Loader2, Info } from 'lucide-react';
import { useToast } from '../contexts/ToastContext'; // Use relative path

const RequestAccessPage: React.FC = () => {
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        company: '',
        phone: '',
        reason: '' // Changed state key to 'reason' for clarity
    });
    const [isLoading, setIsLoading] = useState(false);
    const { addToast } = useToast();

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        console.log('Access Request Submitted:', formData);

        // --- TODO: Replace with your actual Supabase submission logic ---
        // Example:
        // try {
        //   const { error } = await supabase.from('client_access_requests').insert([formData]); // Ensure table exists
        //   if (error) throw error;
        //   addToast({ type: 'success', title: 'Request Sent', message: 'We'll review your request shortly.' });
        //   setFormData({ fullName: '', email: '', company: '', phone: '', reason: '' }); // Reset form
        // } catch (error) {
        //   console.error('Submission error:', error);
        //   addToast({ type: 'error', title: 'Submission Failed', message: error.message });
        // } finally {
        //   setIsLoading(false);
        // }
        // --- End of TODO ---

        // Simulate API call for now
        await new Promise(resolve => setTimeout(resolve, 1500));
        setIsLoading(false);
        addToast({
            type: 'success',
            title: 'Request Sent',
            message: 'Thank you! We have received your access request and will get back to you shortly.',
        });
        setFormData({ fullName: '', email: '', company: '', phone: '', reason: '' }); // Reset form
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-stone-50 to-orange-50 flex items-center justify-center px-4 py-12">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="max-w-5xl w-full bg-white rounded-2xl shadow-xl overflow-hidden md:grid md:grid-cols-5" // Changed to 5 columns
            >
                {/* Left Side: Form (3 columns) */}
                <div className="md:col-span-3 p-8 sm:p-10">
                    <div className="mb-8">
                         <img src="/Solvexstudios logo.png" alt="Solvex Logo" className="h-10 w-auto mb-4" />
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">Client Dashboard Access</h1>
                        <p className="text-gray-600">
                            Welcome! Please provide your details below to request access. We'll review it promptly.
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        {/* Full Name */}
                        <div className="relative group">
                            <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#FF5722]" size={20} />
                            <input
                                type="text"
                                name="fullName"
                                placeholder="Full Name *"
                                value={formData.fullName}
                                onChange={handleChange}
                                required
                                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF5722] focus:border-transparent transition duration-200 ease-in-out"
                            />
                        </div>
                        {/* Email */}
                        <div className="relative group">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#FF5722]" size={20} />
                            <input
                                type="email"
                                name="email"
                                placeholder="Email *"
                                value={formData.email}
                                onChange={handleChange}
                                required
                                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF5722] focus:border-transparent transition duration-200 ease-in-out"
                            />
                        </div>
                        {/* Company / Org and Phone */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                            <div className="relative group">
                                <Building className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#FF5722]" size={20} />
                                <input
                                    type="text"
                                    name="company"
                                    placeholder="Company / Org"
                                    value={formData.company}
                                    onChange={handleChange}
                                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF5722] focus:border-transparent transition duration-200 ease-in-out"
                                />
                            </div>
                            <div className="relative group">
                                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#FF5722]" size={20} />
                                <input
                                    type="tel"
                                    name="phone"
                                    placeholder="Phone"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF5722] focus:border-transparent transition duration-200 ease-in-out"
                                />
                            </div>
                        </div>
                        {/* Reason for access */}
                        <div className="relative group">
                             <label htmlFor="reason" className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
                                <MessageSquareText size={16} className="text-gray-500"/>
                                Reason for access / what you need *
                                <span className="relative ml-1 group/tooltip">
                                     <Info size={14} className="text-gray-400 cursor-help" />
                                     <span className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-48 p-2 bg-gray-700 text-white text-xs rounded opacity-0 group-hover/tooltip:opacity-100 transition-opacity pointer-events-none z-10">
                                         e.g., Project details, service needed, account check-in. This helps us approve your request faster!
                                     </span>
                                </span>
                             </label>
                            <textarea
                                id="reason" // Added id to link label
                                name="reason" // Changed name to match state key
                                placeholder="Briefly tell us why you need access..."
                                value={formData.reason}
                                onChange={handleChange}
                                rows={4}
                                required
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF5722] focus:border-transparent transition duration-200 ease-in-out resize-none" // Added resize-none
                            ></textarea>
                        </div>
                        {/* Submit Button */}
                        <div>
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full bg-[#FF5722] text-white font-bold py-3 px-6 rounded-lg hover:bg-[#E64A19] disabled:opacity-75 flex items-center justify-center gap-2 transition-all duration-300 transform hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#FF5722]"
                            >
                                {isLoading ? (
                                    <>
                                        <Loader2 className="animate-spin" size={20} />
                                        <span>Submitting Request...</span>
                                    </>
                                ) : (
                                    <>
                                        <Send size={20} />
                                        <span>Request Access</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>

                {/* Right Side: Image and Text (2 columns) */}
                <div className="md:col-span-2 relative hidden md:block"> {/* Hide on small screens */}
                    <img
                        // --- IMPORTANT: Replace with your actual image path in the /public folder ---
                        src="/client-access-image.jpg"
                        alt="Client Access Portal"
                        className="absolute inset-0 w-full h-full object-cover"
                    />
                     <div className="absolute inset-0 bg-gradient-to-t from-gray-900/60 to-transparent"></div> {/* Gradient overlay */}
                     <div className="relative h-full flex flex-col justify-end p-8 sm:p-10 text-white">
                         <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.3 }}
                         >
                            <h2 className="text-3xl font-semibold mb-3 leading-tight">Your Project Hub Awaits</h2>
                            <p className="text-gray-200 text-lg leading-relaxed">
                                Get direct access to manage your projects, track progress, and communicate seamlessly with the Solvex team. Request access today!
                            </p>
                         </motion.div>
                     </div>
                </div>
            </motion.div>
        </div>
    );
};

export default RequestAccessPage;