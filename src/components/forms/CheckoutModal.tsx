import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Loader as Loader2 } from 'lucide-react';
import { useCart } from '../../contexts/CartContext';
import { useNavigate } from 'react-router-dom';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const CheckoutModal: React.FC<CheckoutModalProps> = ({ isOpen, onClose }) => {
  const { cartItems, cartTotal, clearCart } = useCart();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    pickupDate: '',
    returnDate: '',
    notes: '',
  });

  const [errors, setErrors] = useState<Partial<typeof formData>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const savedState = localStorage.getItem('checkoutFormState');
      if (savedState) {
        setFormData(JSON.parse(savedState));
      }
    } else {
      localStorage.setItem('checkoutFormState', JSON.stringify(formData));
    }
  }, [isOpen]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name as keyof typeof errors]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const validateForm = () => {
    const newErrors: Partial<typeof formData> = {};
    if (!formData.name.trim()) newErrors.name = 'Full name is required.';
    if (!formData.email.trim()) newErrors.email = 'Email is required.';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) newErrors.email = 'Invalid email address.';
    if (!formData.phone.trim()) newErrors.phone = 'Phone number is required.';
    if (!formData.pickupDate) newErrors.pickupDate = 'Pickup date is required.';
    if (!formData.returnDate) newErrors.returnDate = 'Return date is required.';
    if (new Date(formData.pickupDate) > new Date(formData.returnDate)) {
      newErrors.returnDate = 'Return date must be after pickup date.';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      console.warn('Payment not configured. Connect your payment provider first.');
      alert('Payment system not configured. Please connect your payment provider.');
      setIsSubmitting(false);
    } catch (error) {
      console.error('Payment initialization failed:', error);
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
          <motion.div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl flex flex-col h-auto max-h-[90vh]"
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', duration: 0.4 }}
            role="dialog"
            aria-modal="true"
          >
            <div className="flex-shrink-0 p-6 flex justify-between items-center border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">Your Details</h2>
              <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100 transition-colors" aria-label="Close modal">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <div className="p-6 overflow-y-auto">
              <form onSubmit={handleSubmit} className="space-y-4">
                {Object.keys(errors).length > 0 && (
                  <div className="p-3 bg-red-50 text-red-700 border border-red-200 rounded-lg text-sm">
                    Please fix the errors below.
                  </div>
                )}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
                        <input type="text" name="name" value={formData.name} onChange={handleChange} required className={`w-full px-3 py-2 border rounded-lg bg-gray-50 focus:ring-2 focus:ring-[#FF5722] focus:border-[#FF5722] ${errors.name ? 'border-red-500' : 'border-gray-300'}`} />
                        {errors.name && <p className="text-xs text-red-600 mt-1">{errors.name}</p>}
                    </div>
                    <div>
                        <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">Phone *</label>
                        <input type="tel" name="phone" value={formData.phone} onChange={handleChange} required className={`w-full px-3 py-2 border rounded-lg bg-gray-50 focus:ring-2 focus:ring-[#FF5722] focus:border-[#FF5722] ${errors.phone ? 'border-red-500' : 'border-gray-300'}`} />
                        {errors.phone && <p className="text-xs text-red-600 mt-1">{errors.phone}</p>}
                    </div>
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                  <input type="email" name="email" value={formData.email} onChange={handleChange} required className={`w-full px-3 py-2 border rounded-lg bg-gray-50 focus:ring-2 focus:ring-[#FF5722] focus:border-[#FF5722] ${errors.email ? 'border-red-500' : 'border-gray-300'}`} />
                  {errors.email && <p className="text-xs text-red-600 mt-1">{errors.email}</p>}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label htmlFor="pickupDate" className="block text-sm font-medium text-gray-700 mb-1">Pickup Date *</label>
                        <input type="date" name="pickupDate" value={formData.pickupDate} onChange={handleChange} required min={new Date().toISOString().split("T")[0]} className={`w-full px-3 py-2 border rounded-lg bg-gray-50 ${errors.pickupDate ? 'border-red-500' : 'border-gray-300'}`} />
                        {errors.pickupDate && <p className="text-xs text-red-600 mt-1">{errors.pickupDate}</p>}
                    </div>
                    <div>
                        <label htmlFor="returnDate" className="block text-sm font-medium text-gray-700 mb-1">Return Date *</label>
                        <input type="date" name="returnDate" value={formData.returnDate} onChange={handleChange} required min={formData.pickupDate || new Date().toISOString().split("T")[0]} className={`w-full px-3 py-2 border rounded-lg bg-gray-50 ${errors.returnDate ? 'border-red-500' : 'border-gray-300'}`} />
                        {errors.returnDate && <p className="text-xs text-red-600 mt-1">{errors.returnDate}</p>}
                    </div>
                </div>

                <div>
                  <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">Notes (Optional)</label>
                  <textarea name="notes" value={formData.notes} onChange={handleChange} rows={3} className="w-full px-3 py-2 border rounded-lg bg-gray-50 border-gray-300" placeholder="Any special requests or details..."></textarea>
                </div>

                 <div className="pt-4 border-t border-gray-200">
                    <div className="flex justify-between font-bold text-lg mb-4">
                      <span>Total</span>
                      <span>GHS {cartTotal.toFixed(2)}</span>
                    </div>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full bg-[#FF5722] text-white font-semibold py-3 px-6 rounded-lg hover:bg-[#E64A19] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        `Pay GHS ${cartTotal.toFixed(2)}`
                      )}
                    </button>
                  </div>
              </form>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default CheckoutModal;
