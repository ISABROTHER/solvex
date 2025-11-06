// src/pages/CartPage.tsx

import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import { Trash2, ShoppingCart, Plus, Minus, Loader as Loader2 } from 'lucide-react';
import { initializePayment } from '../lib/supabase/payment';
import type { CartItem } from '../contexts/CartContext';

// Reusable component for the quantity stepper
const QuantityStepper: React.FC<{ item: CartItem }> = ({ item }) => {
  const { updateQuantity } = useCart();
  return (
    <div className="flex items-center border border-gray-200 rounded-md">
      <button onClick={() => updateQuantity(item.title, item.quantity - 1)} className="p-1.5 text-gray-500 hover:text-black"><Minus size={14} /></button>
      <span className="px-3 text-sm font-medium">{item.quantity}</span>
      <button onClick={() => updateQuantity(item.title, item.quantity + 1)} className="p-1.5 text-gray-500 hover:text-black"><Plus size={14} /></button>
    </div>
  );
};

const CartPage: React.FC = () => {
  const { cartItems, removeFromCart, cartCount, cartTotal, clearCart } = useCart();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    pickupDate: '',
    returnDate: '',
  });

  const [errors, setErrors] = useState<Partial<typeof formData>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Persist form data on page leave/reload
  useEffect(() => {
    const savedState = localStorage.getItem('cartFormState');
    if (savedState) {
      setFormData(JSON.parse(savedState));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('cartFormState', JSON.stringify(formData));
  }, [formData]);

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

  // Check if form is complete for button activation
  const isFormComplete = formData.name.trim() && 
                        formData.email.trim() && 
                        formData.phone.trim() && 
                        formData.pickupDate && 
                        formData.returnDate;

  const handleCheckout = async () => {
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    
    try {
      // Initialize payment through secure backend
      const paymentData = await initializePayment({
        customerData: {
          name: formData.name,
          email: formData.email,
          phone: formData.phone
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
        navigate(`/success?ref=${reference.reference}`);
      };

      const onClose = () => {
        setIsSubmitting(false);
      };
      
      initializePaystackPayment({ onSuccess, onClose });
      
    } catch (error) {
      console.error('Payment initialization failed:', error);
      setIsSubmitting(true);
      // Show error to user
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen py-12 md:py-20">
      <div className="container mx-auto px-6">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-8">Your Cart</h1>
        
        {cartCount === 0 ? (
          <div className="text-center bg-white p-12 rounded-lg shadow-md">
            <ShoppingCart className="w-16 h-16 mx-auto text-gray-300" />
            <h2 className="mt-4 text-2xl font-semibold text-gray-800">Your cart is empty</h2>
            <p className="mt-2 text-gray-500">Looks like you haven't added any equipment yet.</p>
            <Link to="/rentals" className="mt-6 inline-block bg-[#FF5722] text-white font-bold py-3 px-6 rounded-lg hover:bg-[#E64A19] transition-colors">
              Browse Rentals
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 bg-white rounded-lg shadow-md p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Items ({cartCount})</h2>
                <button onClick={clearCart} className="text-sm text-gray-500 hover:text-red-600 font-semibold">Clear all</button>
              </div>
              <div className="space-y-4">
                {cartItems.map((item) => (
                  <div key={item.title} className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b pb-4 last:border-b-0">
                    <div className="flex items-center gap-4 mb-4 sm:mb-0">
                      <img src={item.images[0]} alt={item.title} className="w-20 h-20 object-contain rounded-md bg-gray-100" />
                      <div>
                        <h3 className="font-semibold text-gray-800">{item.title}</h3>
                        <p className="text-sm text-gray-500">GHS {item.price}/day</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 w-full sm:w-auto justify-between">
                      <QuantityStepper item={item} />
                      <p className="font-semibold text-gray-800 w-24 text-right">GHS {(item.price * item.quantity).toFixed(2)}</p>
                      <button onClick={() => removeFromCart(item.title)} className="p-2 text-gray-400 hover:text-red-500 transition-colors">
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Checkout Form */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-md p-6 sticky top-24">
                <h2 className="text-xl font-semibold mb-4">Checkout Details</h2>
                
                <div className="space-y-4 mb-6">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
                    <input 
                      type="text" 
                      name="name" 
                      id="name"
                      value={formData.name} 
                      onChange={handleChange} 
                      required 
                      className={`w-full px-3 py-2 border rounded-lg bg-gray-50 focus:ring-2 focus:ring-[#FF5722] focus:border-[#FF5722] ${errors.name ? 'border-red-500' : 'border-gray-300'}`} 
                      placeholder="Enter your full name"
                    />
                    {errors.name && <p className="text-xs text-red-600 mt-1">{errors.name}</p>}
                  </div>

                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                    <input 
                      type="email" 
                      name="email" 
                      id="email"
                      value={formData.email} 
                      onChange={handleChange} 
                      required 
                      className={`w-full px-3 py-2 border rounded-lg bg-gray-50 focus:ring-2 focus:ring-[#FF5722] focus:border-[#FF5722] ${errors.email ? 'border-red-500' : 'border-gray-300'}`} 
                      placeholder="Enter your email"
                    />
                    {errors.email && <p className="text-xs text-red-600 mt-1">{errors.email}</p>}
                  </div>

                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">Phone *</label>
                    <input 
                      type="tel" 
                      name="phone" 
                      id="phone"
                      value={formData.phone} 
                      onChange={handleChange} 
                      required 
                      className={`w-full px-3 py-2 border rounded-lg bg-gray-50 focus:ring-2 focus:ring-[#FF5722] focus:border-[#FF5722] ${errors.phone ? 'border-red-500' : 'border-gray-300'}`} 
                      placeholder="Enter your phone number"
                    />
                    {errors.phone && <p className="text-xs text-red-600 mt-1">{errors.phone}</p>}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="pickupDate" className="block text-sm font-medium text-gray-700 mb-1">Pickup Date *</label>
                      <input 
                        type="date" 
                        name="pickupDate" 
                        id="pickupDate"
                        value={formData.pickupDate} 
                        onChange={handleChange} 
                        required 
                        min={new Date().toISOString().split("T")[0]} 
                        className={`w-full px-3 py-2 border rounded-lg bg-gray-50 focus:ring-2 focus:ring-[#FF5722] focus:border-[#FF5722] ${errors.pickupDate ? 'border-red-500' : 'border-gray-300'}`} 
                      />
                      {errors.pickupDate && <p className="text-xs text-red-600 mt-1">{errors.pickupDate}</p>}
                    </div>
                    <div>
                      <label htmlFor="returnDate" className="block text-sm font-medium text-gray-700 mb-1">Return Date *</label>
                      <input 
                        type="date" 
                        name="returnDate" 
                        id="returnDate"
                        value={formData.returnDate} 
                        onChange={handleChange} 
                        required 
                        min={formData.pickupDate || new Date().toISOString().split("T")[0]} 
                        className={`w-full px-3 py-2 border rounded-lg bg-gray-50 focus:ring-2 focus:ring-[#FF5722] focus:border-[#FF5722] ${errors.returnDate ? 'border-red-500' : 'border-gray-300'}`} 
                      />
                      {errors.returnDate && <p className="text-xs text-red-600 mt-1">{errors.returnDate}</p>}
                    </div>
                  </div>
                </div>
                
                <div className="border-t pt-4">
                  <div className="flex justify-between font-bold text-xl mb-4">
                    <span>Total</span>
                    <span>GHS {cartTotal.toFixed(2)}</span>
                  </div>
                  <button
                    onClick={handleCheckout}
                    disabled={!isFormComplete || isSubmitting}
                    className={`w-full font-semibold py-3 px-6 rounded-lg transition-colors flex items-center justify-center ${
                      isFormComplete && !isSubmitting
                        ? 'bg-[#FF5722] text-white hover:bg-[#E64A19] cursor-pointer'
                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    }`}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin mr-2" />
                        Processing...
                      </>
                    ) : (
                      'Proceed to Pay'
                    )}
                  </button>
                  {!isFormComplete && (
                    <p className="text-xs text-gray-500 mt-2 text-center">
                      Please fill in all required fields to proceed
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CartPage;