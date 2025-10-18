// src/pages/client/PaymentReceivingModal.tsx
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Banknote, History, BuildingColumns } from 'lucide-react'; // Updated icons

interface PaymentReceivingModalProps {
  isOpen: boolean;
  onClose: () => void;
  clientName?: string;
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
              Payments from SolveX
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
            <div className="text-gray-700 space-y-4">
               {/* Placeholder Message */}
              <div className="text-center p-6 bg-amber-50 border border-amber-200 rounded-lg">
                <History size={32} className="mx-auto text-amber-500 mb-3" />
                 <h3 className="text-md font-semibold text-amber-800 mb-2">Payout Feature Coming Soon</h3>
                 <p className="text-sm text-amber-700">
                   This section will show payment history and allow you to manage how you receive funds (e.g., bank details) from SolveX Studios in the future.
                 </p>
              </div>

               {/* Example Future Content Structure */}
              <div className="mt-6 border-t pt-4">
                <h4 className="font-medium text-gray-500 text-sm mb-2">Example: Recent Payouts</h4>
                <p className="text-sm text-gray-500 italic">Payout history will appear here.</p>
                {/* Example Payout Item Structure */}
                {/*
                <div className="p-3 border rounded-md mt-2 bg-gray-50">
                   <div className="flex justify-between items-center">
                     <span className="font-medium text-gray-800">GHS 500.00 - Project Alpha</span>
                     <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">Completed</span>
                   </div>
                   <p className="text-xs text-gray-500 mt-1">Paid on: Oct 15, 2025</p>
                </div>
                 */}
              </div>
               <div className="mt-4 border-t pt-4">
                 <h4 className="font-medium text-gray-500 text-sm mb-2">Example: Receiving Details</h4>
                 <button className="text-sm text-[#FF5722] hover:underline flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed" disabled>
                   <BuildingColumns size={14}/> Manage Bank Account (Coming Soon)
                 </button>
                 {/* <p className="text-sm text-gray-600 mt-2">Bank: Example Bank | Account: **** **** **** 1234</p> */}
               </div>
               <p className="text-xs text-gray-500 mt-6 text-center">
                 For current payment inquiries, please contact your account manager.
               </p>
            </div>
          </div>

          {/* Footer */}
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