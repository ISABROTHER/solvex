import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { User, Mail, Phone, Building, MessageSquare, Send, Loader2 } from 'lucide-react';
import { useToast } from '@/contexts/ToastContext';

// The 'servicesData' and 'Select' imports are no longer needed and have been removed.

const RequestAccessPage: React.FC = () => {
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        phone: '',
        company: '',
        message: ''
        // The 'servicesOfInterest' field has been removed from the state.
    });
    const [isLoading, setIsLoading] = useState(false);
    const { addToast } = useToast();

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    // The 'handleMultiSelectChange' function is no longer needed and has been removed.

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        // Placeholder for form submission logic.
        // In a real app, you would send this data to your backend or Supabase.
        console.log('Form submitted:', formData);

        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1500));

        setIsLoading(false);
        addToast({
            type: 'success',
            title: 'Request Sent',
            message: 'Thank you! We have received your access request and will get back to you shortly.',
        });

        // Reset form
        setFormData({
            fullName: '',
            email: '',
            phone: '',
            company: '',
            message: ''
        });
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center px-4 sm:px-6 lg:px-8 py-12">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="max-w-4xl w-full mx-auto"
            >
                <div className="bg-white rounded-2xl shadow-lg overflow-hidden md:grid md:grid-cols-2">
                    <div className="p-8 sm:p-10">
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">Request Client Access</h1>
                        <p className="text-gray-600 mb-8">
                            Fill out the form to request access to your client dashboard where you can manage projects, view updates, and communicate with our team.
                        </p>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="relative">
                                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                                <input
                                    type="text"
                                    name="fullName"
                                    placeholder="Full Name"
                                    value={formData.fullName}
                                    onChange={handleChange}
                                    required
                                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF5722] focus:border-transparent transition"
                                />
                            </div>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                                <input
                                    type="email"
                                    name="email"
                                    placeholder="Email Address"
                                    value={formData.email}
                                    onChange={handleChange}
                                    required
                                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF5722] focus:border-transparent transition"
                                />
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                <div className="relative">
                                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                                    <input
                                        type="tel"
                                        name="phone"
                                        placeholder="Phone Number"
                                        value={formData.phone}
                                        onChange={handleChange}
                                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF5722] focus:border-transparent transition"
                                    />
                                </div>
                                <div className="relative">
                                    <Building className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                                    <input
                                        type="text"
                                        name="company"
                                        placeholder="Company (Optional)"
                                        value={formData.company}
                                        onChange={handleChange}
                                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF5722] focus:border-transparent transition"
                                    />
                                </div>
                            </div>

                            {/* "Services of interest" field has been removed from here. */}
                            
                            <div className="relative">
                                <MessageSquare className="absolute left-3 top-4 text-gray-400" size={20} />
                                <textarea
                                    name="message"
                                    placeholder="Briefly describe your project or reason for access..."
                                    value={formData.message}
                                    onChange={handleChange}
                                    rows={4}
                                    required
                                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF5722] focus:border-transparent transition"
                                ></textarea>
                            </div>
                            <div>
                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="w-full bg-[#FF5722] text-white font-bold py-3 px-6 rounded-lg hover:bg-[#E64A19] disabled:opacity-75 flex items-center justify-center gap-2 transition-all duration-300 transform hover:scale-105"
                                >
                                    {isLoading ? (
                                        <>
                                            <Loader2 className="animate-spin" size={20} />
                                            <span>Submitting...</span>
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
                    <div className="bg-gray-800 p-8 sm:p-10 flex flex-col justify-center items-center text-center">
                        <motion.img 
                            src="/Solvexstudios logo.png" 
                            alt="Solvex S-Logo" 
                            className="w-24 h-24 mb-6"
                            initial={{ opacity: 0, scale: 0.5 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.5, delay: 0.2 }}
                        />
                        <h2 className="text-2xl font-bold text-white mb-3">Unlock Your Dashboard</h2>
                        <p className="text-gray-300">
                            Once approved, you'll gain access to a personalized dashboard to track project progress, manage invoices, and communicate directly with our team.
                        </p>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default RequestAccessPage;
