// @ts-nocheck
import React, { useEffect, useRef, useState } from 'react';
import { X, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import type { RentalItemDisplay } from '../lib/supabase/operations';
import RentalBookingForm from './forms/RentalBookingForm';

interface RentalDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  rental: RentalItemDisplay | null;
  anchorId: string | null;
}

const RentalDetailModal: React.FC<RentalDetailModalProps> = ({ isOpen, onClose, rental, anchorId }) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const [showBookingForm, setShowBookingForm] = useState(false);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!rental) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-end justify-center"
        >
          <motion.div
            className="absolute inset-0 bg-black/60"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />
          <motion.div
            ref={modalRef}
            layoutId={anchorId || undefined}
            className="relative w-full max-w-4xl bg-white rounded-t-2xl shadow-2xl flex flex-col h-[85vh]"
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: 'spring', stiffness: 400, damping: 40 }}
          >
            {/* --- STICKY HEADER --- */}
            <div className="flex-shrink-0 p-4 sm:p-6 flex justify-between items-center border-b border-gray-200 sticky top-0 bg-white/80 backdrop-blur-sm z-10">
              <div>
                <h3 className="text-lg sm:text-xl font-bold text-gray-900">{rental.title}</h3>
                <p className="text-sm text-gray-500">{rental.category}</p>
              </div>
              <motion.button 
                onClick={onClose} 
                className="p-2 rounded-full hover:bg-gray-200 transition-colors" 
                aria-label="Close modal"
                whileHover={{ scale: 1.1, rotate: 90 }}
              >
                <X className="w-5 h-5 text-gray-500" />
              </motion.button>
            </div>

            {/* --- SCROLLABLE CONTENT --- */}
            <div className="p-6 sm:p-8 overflow-y-auto flex-1">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Image & Video Section */}
                <div>
                  <div className="aspect-[16/10] overflow-hidden rounded-xl shadow-lg">
                    <iframe
                      src={rental.videoUrl || ''}
                      title={`${rental.title} product video`}
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      className="w-full h-full"
                    ></iframe>
                  </div>
                </div>
                {/* Details Section */}
                <div>
                  <h4 className="font-bold text-gray-800 mb-2">Key Features</h4>
                  <ul className="space-y-2">
                    {rental.features?.map((feature, index) => (
                      <li key={index} className="flex items-start">
                        <Check className="w-4 h-4 text-green-500 mr-2 mt-1 flex-shrink-0" />
                        <span className="text-gray-600 text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            {/* --- STICKY FOOTER --- */}
            <div className="flex-shrink-0 p-4 sm:p-6 border-t border-gray-200 mt-auto sticky bottom-0 bg-white/80 backdrop-blur-sm">
              <div className="flex justify-between items-center">
                <p className="text-2xl font-bold text-gray-900">GHS {rental.price}<span className="text-sm font-normal text-gray-500">/day</span></p>
                <motion.button
                  className="px-6 py-2 bg-[#FF5722] text-white font-semibold rounded-lg hover:bg-[#E64A19] disabled:opacity-50 transition-colors"
                  whileTap={{scale: 0.95}}
                  onClick={() => setShowBookingForm(true)}
                >
                  Rent Now
                </motion.button>
              </div>
            </div>
          </motion.div>
          
          {/* Rental Booking Form */}
          <RentalBookingForm
            isOpen={showBookingForm}
            onClose={() => setShowBookingForm(false)}
            equipment={rental}
          />
        </div>
      )}
    </AnimatePresence>
  );
};

export default RentalDetailModal;