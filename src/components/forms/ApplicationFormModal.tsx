import React, { useEffect, useState } from 'react';
import { X, CloudUpload as UploadCloud } from 'lucide-react';
import Select from 'react-select';
import ApplicationConfirmationPopup from './ApplicationConfirmationPopup';
import { countryCodesData } from '../../data/forms/country-codes.data';
import CountryDropdown from './CountryDropdown';
import { submitCareerApplication } from '../../lib/supabase/forms';
import { motion, AnimatePresence } from 'framer-motion';

// Types moved here for self-containment, as original file is removed
interface CareerRole { name: string; description: string; }
interface FormValidationErrors { [key: string]: string; }

interface ApplicationFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  availableRoles: CareerRole[];
  anchorId?: string | null;
}

const getDefaultCountry = () => countryCodesData.find(c => c.iso === 'GH');

const countWords = (text: string): number => {
  return text.trim().split(/\s+/).filter(Boolean).length;
};

const customSelectStyles = {
  control: (provided: any, state: { isFocused: any; }) => ({ ...provided, minHeight: '42px', height: 'auto', border: state.isFocused ? '1px solid #FF5722' : '1px solid #D1D5DB', borderRadius: '0.5rem', boxShadow: 'none', backgroundColor: '#F9FAFB', '&:hover': { borderColor: '#9CA3AF' }, }),
  option: (provided: any, state: { isSelected: any; isFocused: any; }) => ({ ...provided, backgroundColor: state.isSelected ? '#FF5722' : state.isFocused ? '#FF57221A' : 'white', color: state.isSelected ? 'white' : '#1F2937', '&:active': { backgroundColor: '#FF57223A' }, }),
  placeholder: (provided: any) => ({...provided, color: '#6B7280'}),
  menu: (provided: any) => ({...provided, zIndex: 9999 }),
  multiValue: (base: any) => ({ ...base, backgroundColor: 'rgba(255, 87, 34, 0.1)', borderRadius: '6px' }),
  multiValueLabel: (base: any) => ({ ...base, color: '#C10100', fontWeight: 500 }),
};

const ApplicationFormModal: React.FC<ApplicationFormModalProps> = ({ isOpen, onClose, availableRoles, anchorId }) => {
  const [formData, setFormData] = useState({ firstName: '', surname: '', email: '', phone: '', coverLetter: '', portfolioUrl: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [wordCount, setWordCount] = useState(0);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [submittedData, setSubmittedData] = useState<any>(null);
  const [selectedCountry, setSelectedCountry] = useState(getDefaultCountry()!);
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
  const [errors, setErrors] = useState<FormValidationErrors>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (name === 'coverLetter') setWordCount(countWords(value));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isSubmitting) return;

    const validationErrors: FormValidationErrors = {};
    if (!formData.firstName.trim()) validationErrors.firstName = "First name is required.";
    if (!formData.surname.trim()) validationErrors.surname = "Surname is required.";
    if (!formData.email.trim()) validationErrors.email = "Email is required.";
    if (!formData.phone.trim()) validationErrors.phone = "Phone number is required.";
    if (!formData.coverLetter.trim()) validationErrors.coverLetter = "Cover letter is required.";
    if (selectedRoles.length === 0) validationErrors.roles = "Please select at least one role.";
    
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) {
      setError('Please fill out all required fields correctly.');
      return;
    }

    setIsSubmitting(true);
    setError('');
    
    try {
      const { error: submitError } = await submitCareerApplication({
        firstName: formData.firstName,
        lastName: formData.surname,
        email: formData.email,
        phone: formData.phone,
        countryCode: selectedCountry.code,
        coverLetter: formData.coverLetter,
        portfolioUrl: formData.portfolioUrl || undefined,
        appliedRoles: selectedRoles,
      });

      if (submitError) throw submitError;
      
      setSubmittedData({ firstName: formData.firstName, appliedRoles: selectedRoles });
      setShowConfirmation(true);
      // Reset form on successful submission
      setFormData({ firstName: '', surname: '', email: '', phone: '', coverLetter: '', portfolioUrl: '' });
      setSelectedRoles([]);
      setWordCount(0);
      setErrors({});
      
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to submit application. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <div role="dialog" aria-modal="true" className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <motion.div className="absolute inset-0 bg-black/50" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} />
            <motion.div
              layoutId={anchorId || undefined}
              className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl flex flex-col h-[85vh]"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
            >
              <div className="flex-shrink-0 p-6 flex justify-between items-center border-b">
                <h3 className="text-xl font-bold text-gray-900">Application Form</h3>
                <motion.button onClick={onClose} className="p-2 rounded-full hover:bg-gray-200"><X size={20} /></motion.button>
              </div>
              <div className="p-6 md:p-8 overflow-y-auto flex-1">
                <form onSubmit={handleSubmit} noValidate className="space-y-6">
                  <div>
                    <label htmlFor="roles" className="block text-sm font-medium text-gray-700 mb-1">Role(s) you are applying for*</label>
                    <Select
                      isMulti id="roles" name="roles"
                      options={availableRoles.map(r => ({ value: r.name, label: r.name }))}
                      styles={{...customSelectStyles, control: (base, state) => ({ ...customSelectStyles.control(base, state), borderColor: errors.roles ? '#EF4444' : '#D1D5DB' })}}
                      placeholder="Select one or more roles..."
                      onChange={(options) => setSelectedRoles((options || []).map(o => o.value))}
                      value={selectedRoles.map(r => ({ value: r, label: r }))}
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">First Name*</label>
                      <input type="text" name="firstName" id="firstName" value={formData.firstName} onChange={handleChange} className={`w-full px-3 py-2 border rounded-lg bg-gray-50 ${errors.firstName ? 'border-red-500' : 'border-gray-300'}`} />
                    </div>
                    <div>
                      <label htmlFor="surname" className="block text-sm font-medium text-gray-700 mb-1">Surname*</label>
                      <input type="text" name="surname" id="surname" value={formData.surname} onChange={handleChange} className={`w-full px-3 py-2 border rounded-lg bg-gray-50 ${errors.surname ? 'border-red-500' : 'border-gray-300'}`} />
                    </div>
                  </div>
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email*</label>
                    <input type="email" name="email" id="email" value={formData.email} onChange={handleChange} className={`w-full px-3 py-2 border rounded-lg bg-gray-50 ${errors.email ? 'border-red-500' : 'border-gray-300'}`} />
                  </div>
                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">Phone Number*</label>
                    <div className="flex">
                      <CountryDropdown countries={countryCodesData} selectedCountry={selectedCountry} onSelect={setSelectedCountry} className="mr-[-1px]" />
                      <input type="tel" name="phone" id="phone" value={formData.phone} onChange={handleChange} className={`flex-1 min-w-0 px-3 py-2 border rounded-r-lg bg-gray-50 ${errors.phone ? 'border-red-500' : 'border-gray-300'}`} />
                    </div>
                  </div>
                  <div>
                    <label htmlFor="coverLetter" className="block text-sm font-medium text-gray-700 mb-1">Cover Letter* (max 100 words)</label>
                    <textarea name="coverLetter" id="coverLetter" rows={4} value={formData.coverLetter} onChange={handleChange} className={`w-full px-3 py-2 border rounded-lg bg-gray-50 resize-none ${errors.coverLetter ? 'border-red-500' : 'border-gray-300'}`} />
                    <div className="flex justify-between items-center mt-1"><span className={`text-xs ${wordCount > 100 ? 'text-red-500' : 'text-gray-500'}`}>{wordCount}/100 words</span></div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Portfolio Link (optional)</label>
                    <input type="url" name="portfolioUrl" id="portfolioUrl" value={formData.portfolioUrl} onChange={handleChange} placeholder="https://yourportfolio.com" className="w-full px-3 py-2 border rounded-lg bg-gray-50" />
                  </div>
                  {error && <div className="text-red-600 text-sm text-center bg-red-100 p-3 rounded-lg">{error}</div>}
                  <div className="flex justify-end space-x-4 pt-4">
                    <motion.button type="button" onClick={onClose} className="px-6 py-2 text-sm font-semibold text-gray-700 rounded-lg hover:bg-gray-100" whileTap={{scale: 0.95}}>Cancel</motion.button>
                    <motion.button type="submit" disabled={isSubmitting} className="px-6 py-2 bg-[#FF5722] text-white font-semibold rounded-lg hover:bg-[#E64A19] disabled:opacity-50" whileTap={{scale: 0.95}}>{isSubmitting ? 'Submitting...' : 'Submit Application'}</motion.button>
                  </div>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      <ApplicationConfirmationPopup isOpen={showConfirmation} onClose={() => { setShowConfirmation(false); onClose(); }} applicationData={submittedData} />
    </>
  );
};

export default ApplicationFormModal;