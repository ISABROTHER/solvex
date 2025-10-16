import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Send, CheckCircle } from 'lucide-react';
import { businessServicesData } from '../data/business/services.data';

const RequestAccessPage: React.FC = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    // This is where you would call a function to save the request to your database.
    // For now, we'll simulate a successful submission.
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSuccess(true);
    }, 1500);
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center bg-white p-12 rounded-lg shadow-md max-w-lg"
        >
          <CheckCircle className="w-12 h-12 mx-auto text-green-500 mb-4" />
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Request Sent!</h1>
          <p className="text-gray-600 mb-6">
            Thank you. Our team will review your request and you'll receive an email if your access is approved.
          </p>
          <button
            onClick={() => navigate('/my-page')}
            className="font-semibold text-[#FF5722] hover:underline"
          >
            Back to Login
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        <Link to="/my-page" className="flex items-center gap-2 text-sm font-semibold text-gray-600 hover:text-black mb-4">
          <ArrowLeft size={16} />
          Back to Login
        </Link>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-8 rounded-lg shadow-md"
        >
          <form onSubmit={handleSubmit} className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-800">Request Client Access</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Full Name*</label>
                <input type="text" name="fullName" required className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Email*</label>
                <input type="email" name="email" required className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm" />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               <div>
                <label className="block text-sm font-medium text-gray-700">Company / Org</label>
                <input type="text" name="company" className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm" />
              </div>
               <div>
                <label className="block text-sm font-medium text-gray-700">Phone</label>
                <input type="tel" name="phone" className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Reason for access / what you need*</label>
              <textarea name="reason" rows={3} required className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm" />
            </div>
             <div>
              <label className="block text-sm font-medium text-gray-700">Services of interest</label>
              <select multiple name="services" className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm h-32">
                  {businessServicesData.map(service => (
                      <option key={service.title} value={service.title}>{service.title}</option>
                  ))}
              </select>
            </div>
            <button type="submit" disabled={isSubmitting} className="w-full bg-[#FF5722] text-white font-bold py-3 px-4 rounded-md hover:bg-[#E64A19] transition-colors disabled:bg-gray-400 flex items-center justify-center gap-2">
              <Send size={16} />
              {isSubmitting ? 'Submitting...' : 'Request Access'}
            </button>
          </form>
        </motion.div>
      </div>
    </div>
  );
};

export default RequestAccessPage;