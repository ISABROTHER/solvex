// src/contexts/CartDrawer.tsx

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import { X, ArrowLeft, Plus, Minus, Loader as Loader2, ShoppingCart } from 'lucide-react';
import { initializePayment } from '../lib/supabase/payment';

const QuantityStepper: React.FC<{ item: any }> = ({ item }) => {
  const { updateQuantity } = useCart();
  return (
    <div className="flex items-center border border-gray-200 rounded-md">
      <button onClick={() => updateQuantity(item.title, item.quantity - 1)} className="p-1.5 text-gray-500 hover:text-black"><Minus size={14} /></button>
      <span className="px-3 text-sm font-medium">{item.quantity}</span>
      <button onClick={() => updateQuantity(item.title, item.quantity + 1)} className="p-1.5 text-gray-500 hover:text-black"><Plus size={14} /></button>
    </div>
  );
};

const CartDrawer: React.FC = () => {
  const { isCartOpen, closeCart, cartItems, cartTotal, clearCart, cartCount } = useCart();
  const navigate = useNavigate();
  const drawerRef = useRef<HTMLDivElement>(null);
  
  const [view, setView] = useState<'summary' | 'checkout'>('summary');
  const [formData, setFormData] = useState({
    name: '', email: '', phone: '', pickupDate: '', returnDate: '',
  });
  const [errors, setErrors] = useState<Partial<typeof formData>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isCartOpen) {
      const savedState = localStorage.getItem('cartFormState');
      if (savedState) {
        setFormData(JSON.parse(savedState));
      }
    }
  }, [isCartOpen]);

  useEffect(() => {
    localStorage.setItem('cartFormState', JSON.stringify(formData));
  }, [formData]);

  useEffect(() => {
    if (!isCartOpen || cartCount === 0) {
      setView('summary');
    }
  }, [isCartOpen, cartCount]);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name as keyof typeof errors]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const validateForm = () => {
    const newErrors: Partial<typeof formData> = {};
    if (!formData.name.trim()) newErrors.name = 'Full name is required.';
    if (!formData.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) newErrors.email = 'A valid email is required.';
    if (!formData.phone.trim()) newErrors.phone = 'Phone number is required.';
    if (!formData.pickupDate) newErrors.pickupDate = 'Pickup date is required.';
    if (!formData.returnDate) newErrors.returnDate = 'Return date is required.';
    if (new Date(formData.pickupDate) > new Date(formData.returnDate)) {
      newErrors.returnDate = 'Return date must be after pickup date.';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleFinalPayment = async () => {
    if (validateForm()) {
      setIsSubmitting(true);
      
      try {
        // Initialize payment through secure backend
        const paymentData = await initializePayment({
          customerData: {
            name: formData.name,
            email: formData.email,
            phone: formData.phone,
            notes: ''
          },
          cartItems: cartItems.map(item => ({
            title: item.title,
            quantity: item.quantity,
            price: item.price
          })),
          pickupDate: formData.pickupDate,
          returnDate: formData.returnDate
        });

        // Use the secure payment config from backend
        const { usePaystackPayment } = await import('react-paystack');
        const initializePaystackPayment = usePaystackPayment(paymentData.paymentConfig);
        
        const onSuccess = (reference: any) => {
          setIsSubmitting(false);
          clearCart();
          localStorage.removeItem('cartFormState');
          closeCart();
          navigate(`/success?ref=${reference.reference}`);
        };

        const onClose = () => setIsSubmitting(false);
        
        initializePaystackPayment({ onSuccess, onClose });
        
      } catch (error) {
        console.error('Payment initialization failed:', error);
        setIsSubmitting(false);
        // Show error to user
      }
    }
  };

  return (
    <AnimatePresence>
      {isCartOpen && (
        <div className="fixed inset-0 z-50" aria-modal="true" role="dialog">
          <motion.div
            className="absolute inset-0 bg-black/50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeCart}
          />
          <motion.div
            ref={drawerRef}
            tabIndex={-1}
            className="absolute bg-white w-full max-w-md h-full right-0 flex flex-col shadow-2xl"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 400, damping: 40 }}
          >
            {/* Header */}
            <div className="flex items-center p-4 border-b flex-shrink-0">
              {view === 'checkout' && (
                <button onClick={() => setView('summary')} className="p-2 rounded-full hover:bg-gray-100 mr-2">
                  <ArrowLeft size={20} />
                </button>
              )}
              <h2 className="text-lg font-bold">
                {view === 'summary' ? 'Your Cart' : 'Your Details'}
              </h2>
              <button onClick={closeCart} className="p-2 rounded-full hover:bg-gray-100 ml-auto"><X /></button>
            </div>

            {/* Content */}
            <div className="flex-grow overflow-y-auto p-4">
              <AnimatePresence mode="wait">
                {view === 'summary' ? (
                  <motion.div key="summary" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                    {cartItems.length > 0 ? (
                      cartItems.map(item => (
                        <div key={item.title} className="flex gap-4 py-4 border-b last:border-b-0">
                          <img src={item.images[0]} alt={item.title} className="w-20 h-20 object-contain rounded-md bg-gray-100" />
                          <div className="flex-grow">
                            <p className="font-semibold">{item.title}</p>
                            <p className="text-sm text-gray-500">GHS {item.price}/day</p>
                          </div>
                          <div className="flex flex-col items-end justify-between">
                            <p className="font-bold">GHS {(item.price * item.quantity).toFixed(2)}</p>
                            <QuantityStepper item={item} />
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-20 flex flex-col items-center">
                         <ShoppingCart className="w-12 h-12 text-gray-300 mb-4" />
                        <p className="text-gray-500">Your cart is empty.</p>
                      </div>
                    )}
                  </motion.div>
                ) : (
                  <motion.div key="checkout" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
                      <input type="text" name="name" value={formData.name} onChange={handleChange} className={`w-full px-3 py-2 border rounded-lg bg-gray-50 ${errors.name ? 'border-red-500' : 'border-gray-300'}`} />
                      {errors.name && <p className="text-xs text-red-600 mt-1">{errors.name}</p>}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                      <input type="email" name="email" value={formData.email} onChange={handleChange} className={`w-full px-3 py-2 border rounded-lg bg-gray-50 ${errors.email ? 'border-red-500' : 'border-gray-300'}`} />
                      {errors.email && <p className="text-xs text-red-600 mt-1">{errors.email}</p>}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Phone *</label>
                      <input type="tel" name="phone" value={formData.phone} onChange={handleChange} className={`w-full px-3 py-2 border rounded-lg bg-gray-50 ${errors.phone ? 'border-red-500' : 'border-gray-300'}`} />
                      {errors.phone && <p className="text-xs text-red-600 mt-1">{errors.phone}</p>}
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Pickup Date *</label>
                        <input type="date" name="pickupDate" value={formData.pickupDate} onChange={handleChange} min={new Date().toISOString().split("T")[0]} className={`w-full px-3 py-2 border rounded-lg bg-gray-50 ${errors.pickupDate ? 'border-red-500' : 'border-gray-300'}`} />
                        {errors.pickupDate && <p className="text-xs text-red-600 mt-1">{errors.pickupDate}</p>}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Return Date *</label>
                        <input type="date" name="returnDate" value={formData.returnDate} onChange={handleChange} min={formData.pickupDate || new Date().toISOString().split("T")[0]} className={`w-full px-3 py-2 border rounded-lg bg-gray-50 ${errors.returnDate ? 'border-red-500' : 'border-gray-300'}`} />
                        {errors.returnDate && <p className="text-xs text-red-600 mt-1">{errors.returnDate}</p>}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            
            {/* Footer */}
            {cartItems.length > 0 && (
              <div className="p-4 border-t flex-shrink-0 bg-white">
                <div className="flex justify-between font-bold text-lg mb-4">
                  <span>{view === 'summary' ? 'Subtotal' : 'Total'}</span>
                  <span>GHS {cartTotal.toFixed(2)}</span>
                </div>
                {view === 'summary' ? (
                  <button
                    onClick={() => setView('checkout')}
                    className="w-full bg-[#FF5722] text-white font-semibold py-3 px-6 rounded-lg hover:bg-[#E64A19] transition-colors"
                  >
                    Proceed to Checkout
                  </button>
                ) : (
                  <button
                    onClick={handleFinalPayment}
                    disabled={isSubmitting}
                    className="w-full bg-green-600 text-white font-semibold py-3 px-6 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center justify-center"
                  >
                    {isSubmitting ? <Loader2 className="animate-spin" /> : `Pay GHS ${cartTotal.toFixed(2)}`}
                  </button>
                )}
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default CartDrawer;