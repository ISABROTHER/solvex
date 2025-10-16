// @ts-nocheck
// src/components/forms/RentalBookingForm.tsx

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Calendar, User, Mail, Phone, Building, FileText, Loader as Loader2 } from 'lucide-react';
import { PaystackButton } from 'react-paystack';
import { RentalEquipment } from '../../types/business.types';
import { submitRentalBooking } from '../../lib/supabase/forms';
import { countryCodesData } from '../../data/forms/country-codes.data';

// --- Styles to make the Country Dropdown show ONLY the flag ---
const countrySelectStyles = {
  control: (provided: any, state: { isFocused: any; }) => ({
    ...provided,
    minHeight: '42px', height: '42px',
    border: state.isFocused ? '1px solid #FF5722' : '1px solid #D1D5DB',
    borderRadius: '0.5rem',
    boxShadow: 'none',
    backgroundColor: '#F9FAFB',
    padding: 0,
    minWidth: '70px', // Set a minimum width
    width: '70px', // Set a fixed width
  }),
  valueContainer: (provided: any) => ({
    ...provided,
    padding: '0 0 0 8px', // Adjust padding for the flag
  }),
  singleValue: (provided: any) => ({
    ...provided,
    margin: 0,
  }),
  indicatorsContainer: (provided: any) => ({
    ...provided,
    padding: '0 4px 0 0',
  }),
  option: (provided: any, state: { isSelected: any; isFocused: any; }) => ({
    ...provided,
    display: 'flex',
    alignItems: 'center',
    backgroundColor: state.isSelected ? '#FF5722' : state.isFocused ? '#FF57221A' : 'white',
    color: state.isSelected ? 'white' : '#1F2937',
    '&:active': {
      backgroundColor: '#FF57223A',
    },
  }),
  menu: (provided: any) => ({ ...provided, zIndex: 9999, width: '280px' }),
};

const CustomOption = ({ innerProps, label, data }: any) => (
  <div {...innerProps} className="flex items-center p-2">
    <img src={`https://flagcdn.com/w20/${data.iso.toLowerCase()}.png`} alt={`${data.name} flag`} className="w-5 mr-2" />
    <span>{label}</span>
  </div>
);

const CustomSingleValue = ({ data }: any) => (
  <div className="flex items-center">
    <img src={`https://flagcdn.com/w20/${data.iso.toLowerCase()}.png`} alt={`${data.name} flag`} className="w-5" />
  </div>
);

interface RentalBookingFormProps {
  isOpen: boolean;
  onClose: () => void;
  equipment: RentalEquipment | null;
}

const RentalBookingForm: React.FC<RentalBookingFormProps> = ({ isOpen, onClose, equipment }) => {
  const [formData, setFormData] = useState({
    customerName: '', email: '', phone: '', company: '',
    rentalStartDate: '', rentalEndDate: '', projectDescription: '', deliveryAddress: '', specialRequirements: ''
  });
  const [errors, setErrors] = useState<any>({});
  const [country, setCountry] = useState(countryCodesData.find(c => c.iso === 'GH'));
  const [deliveryOption, setDeliveryOption] = useState('pickup');
  const [insuranceRequired, setInsuranceRequired] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // This is the important change to reset the form state
  useEffect(() => {
    if (!isOpen) {
      // Reset form when modal closes
      setShowPayment(false);
      setFormData({
        customerName: '', email: '', phone: '', company: '',
        rentalStartDate: '', rentalEndDate: '', projectDescription: '', deliveryAddress: '', specialRequirements: ''
      });
      setErrors({});
    }
  }, [isOpen]);

  const deliveryCosts = { pickup: 0, standard: 50, express: 120 };

  const calculateDays = () => {
    if (formData.rentalStartDate && formData.rentalEndDate) {
      const start = new Date(formData.rentalStartDate);
      const end = new Date(formData.rentalEndDate);
      if (start > end) return 0;
      const diffTime = Math.abs(end.getTime() - start.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
      return diffDays;
    }
    return 0;
  };
  
  const calculateSubtotal = () => {
      const days = calculateDays();
      const price = equipment?.price || 0;
      return days * price;
  }

  const calculateTotal = () => {
    const subtotal = calculateSubtotal();
    const deliveryCost = deliveryCosts[deliveryOption as keyof typeof deliveryCosts] || 0;
    return subtotal + deliveryCost;
  };

  const paystackConfig = {
    reference: `rental_${new Date().getTime()}`,
    email: formData.email,
    amount: Math.round(calculateTotal() * 100),
    publicKey: 'pk_test_0384219b0cda58507d42d42605bf6844211579cb',
  };
  
  const handlePaymentSuccess = async (reference: any) => {
    setIsSubmitting(true);
    const bookingData = {
        ...formData,
        equipmentName: equipment?.title || 'N/A',
        dailyRate: equipment?.price || 0,
        deliveryRequired: deliveryOption !== 'pickup',
        pickupRequired: deliveryOption === 'pickup',
        insuranceRequired: insuranceRequired,
    };
    const { error } = await submitRentalBooking(bookingData);
    if (!error) {
        setShowSuccess(true);
    } else {
        setErrors({ form: 'There was an issue saving your booking. Please contact support.' });
    }
    setIsSubmitting(false);
  };

  const handlePaymentClose = () => {
    setErrors({ form: 'Payment was cancelled. Please try again.' });
  };
  
  const handleSuccessClose = () => {
      setShowSuccess(false);
      onClose();
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: undefined }));
  };

  const validateAndProceed = () => {
    const newErrors: any = {};
    if (!formData.customerName) newErrors.customerName = 'Full name is required.';
    if (!formData.email) newErrors.email = 'Email is required.';
    if (!formData.phone) newErrors.phone = 'Phone is required.';
    if (!formData.rentalStartDate) newErrors.rentalStartDate = 'Start date is required.';
    if (!formData.rentalEndDate) newErrors.rentalEndDate = 'End date is required.';
    if (calculateDays() <= 0) newErrors.rentalEndDate = 'End date must be after start date.';
    if (deliveryOption !== 'pickup' && !formData.deliveryAddress) newErrors.deliveryAddress = 'Delivery address is required.';
    
    setErrors(newErrors);
    if (Object.keys(newErrors).length === 0) {
      setShowPayment(true);
    }
  };

  if (!equipment) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
          <motion.div 
            className="absolute inset-0 bg-black/60" 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }} 
            onClick={onClose} 
          />
          
          <motion.div
            className="relative bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Book Equipment</h2>
                <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-lg mb-6">
                <h3 className="font-semibold text-gray-900">{equipment.title}</h3>
                <p className="text-sm text-gray-600">GHS {equipment.price}/day</p>
              </div>

              <form className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      <User className="w-4 h-4 inline mr-1" />
                      Full Name *
                    </label>
                    <input
                      type="text"
                      name="customerName"
                      value={formData.customerName}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF5722] focus:border-[#FF5722]"
                    />
                    {errors.customerName && <p className="text-xs text-red-600 mt-1">{errors.customerName}</p>}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      <Mail className="w-4 h-4 inline mr-1" />
                      Email *
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF5722] focus:border-[#FF5722]"
                    />
                    {errors.email && <p className="text-xs text-red-600 mt-1">{errors.email}</p>}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      <Phone className="w-4 h-4 inline mr-1" />
                      Phone *
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF5722] focus:border-[#FF5722]"
                    />
                    {errors.phone && <p className="text-xs text-red-600 mt-1">{errors.phone}</p>}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      <Building className="w-4 h-4 inline mr-1" />
                      Company (Optional)
                    </label>
                    <input
                      type="text"
                      name="company"
                      value={formData.company}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF5722] focus:border-[#FF5722]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      <Calendar className="w-4 h-4 inline mr-1" />
                      Start Date *
                    </label>
                    <input
                      type="date"
                      name="rentalStartDate"
                      value={formData.rentalStartDate}
                      onChange={handleChange}
                      min={new Date().toISOString().split('T')[0]}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF5722] focus:border-[#FF5722]"
                    />
                    {errors.rentalStartDate && <p className="text-xs text-red-600 mt-1">{errors.rentalStartDate}</p>}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      <Calendar className="w-4 h-4 inline mr-1" />
                      End Date *
                    </label>
                    <input
                      type="date"
                      name="rentalEndDate"
                      value={formData.rentalEndDate}
                      onChange={handleChange}
                      min={formData.rentalStartDate || new Date().toISOString().split('T')[0]}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF5722] focus:border-[#FF5722]"
                    />
                    {errors.rentalEndDate && <p className="text-xs text-red-600 mt-1">{errors.rentalEndDate}</p>}
                  </div>
                </div>

                {calculateDays() > 0 && (
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <p className="text-sm text-blue-800">
                      Rental Duration: {calculateDays()} days • Subtotal: GHS {calculateSubtotal().toFixed(2)}
                    </p>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    <FileText className="w-4 h-4 inline mr-1" />
                    Project Description (Optional)
                  </label>
                  <textarea
                    name="projectDescription"
                    value={formData.projectDescription}
                    onChange={handleChange}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF5722] focus:border-[#FF5722]"
                    placeholder="Tell us about your project..."
                  />
                </div>

                {errors.form && (
                  <div className="text-red-600 text-sm bg-red-50 p-3 rounded-lg">
                    {errors.form}
                  </div>
                )}

                <div className="flex justify-end space-x-4 pt-4">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-6 py-2 text-sm font-semibold text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    Cancel
                  </button>
                  
                  {!showPayment ? (
                    <button
                      type="button"
                      onClick={validateAndProceed}
                      className="px-6 py-2 bg-[#FF5722] text-white font-semibold rounded-lg hover:bg-[#E64A19] transition-colors"
                    >
                      Continue to Payment
                    </button>
                  ) : (
                    <PaystackButton
                      {...paystackConfig}
                      text={`Pay GHS ${calculateTotal().toFixed(2)}`}
                      onSuccess={handlePaymentSuccess}
                      onClose={handlePaymentClose}
                      className="px-6 py-2 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors"
                    />
                  )}
                </div>
              </form>
            </div>
          </motion.div>

        </div>
      )}
    </AnimatePresence>
  );
};

export default RentalBookingForm;