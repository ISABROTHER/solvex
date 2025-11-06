// src/pages/SuccessPage.tsx

import React from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle } from 'lucide-react';

const SuccessPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const ref = searchParams.get('ref');

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-white p-8 md:p-12 rounded-2xl shadow-xl text-center max-w-lg w-full"
      >
        <CheckCircle className="w-16 h-16 mx-auto text-green-500 mb-6" />
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Payment Successful!</h1>
        <p className="text-gray-600 mb-6">
          Thank you for your order. Your rental booking is confirmed. We've sent a confirmation email with your rental details.
        </p>
        {ref && (
          <div className="bg-gray-100 rounded-lg p-3 text-sm text-gray-700 mb-8">
            <p>Your reference code is: <strong className="font-mono text-gray-900">{ref}</strong></p>
          </div>
        )}
        <Link
          to="/rentals"
          className="inline-block bg-[#FF5722] text-white font-bold py-3 px-8 rounded-lg hover:bg-[#E64A19] transition-colors"
        >
          Continue Browsing
        </Link>
      </motion.div>
    </div>
  );
};

export default SuccessPage;