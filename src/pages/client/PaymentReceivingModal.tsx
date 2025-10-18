// src/pages/client/PaymentReceivingModal.tsx
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Banknote, AlertTriangle } from 'lucide-react'; // Example icons

interface PaymentReceivingModalProps {
  isOpen: boolean;
  onClose: () => void;
  clientName?: string; // Optional client name for personalization
}

const PaymentReceivingModal: React.FC<PaymentReceivingModalProps> = ({ isOpen, onClose, clientName }) => {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        aria-labelledby="payment-modal-title"
        role="dialog"
        aria-modal="true"
      >
        {/* Backdrop */}
        <motion.div
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose} // Close modal on backdrop click
        />

        {/* Modal Content */}
        <motion.div
          className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl flex flex-col max-h-[80vh]"
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ type: 'spring', duration: 0.4 }}
        >
          {/* Header */}
          <div className="flex-shrink-0 p-5 sm:p-6 flex justify-between items-center border-b border-gray-200">
            <h2 id="payment-modal-title" className="text-lg sm:text-xl font-bold text-gray-900 flex items-center gap-2">
              <Banknote size={20} className="text-[#FF5722]" />
              Your Payments
            </h2>
            <button
              onClick={onClose}
              className="p-2 rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#FF5722]"
              aria-label="Close payments modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto p-5 sm:p-6">
            <div className="text-center text-gray-600 space-y-4">
              <AlertTriangle size={40} className="mx-auto text-amber-500" />
              <h3 className="text-lg font-semibold text-gray-800">Payment Receiving Feature Coming Soon</h3>
              <p className="text-sm">
                This section will allow you to manage how you receive payments from SolveX Studios.
              </p>
              <p className="text-sm">
                Functionality like adding bank details, viewing payout history, and managing invoices will be available here in a future update.
              </p>
              <p className="text-xs bg-gray-100 p-3 rounded-md border border-gray-200">
                For immediate payment inquiries, please contact your account manager directly or use the support contact information.
              </p>
            </div>

            {/* Placeholder for future content */}
            {/*
            <div className="mt-6 space-y-4">
              <h4 className="font-medium text-gray-700">Recent Payouts</h4>
              <p className="text-sm text-gray-500">No recent payouts.</p>
              <button className="text-sm text-[#FF5722] hover:underline">Add Bank Account</button>
            </div>
            */}
          </div>

          {/* Footer (Optional) */}
          <div className="flex-shrink-0 p-4 bg-gray-50 border-t border-gray-200 text-right rounded-b-2xl">
            <button
              onClick={onClose}
              className="px-5 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#FF5722]"
            >
              Close
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default PaymentReceivingModal;