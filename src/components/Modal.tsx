import React, { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import Select from 'react-select';
import SuccessAnimation from './animations/SuccessAnimation';
import { countryCodesData } from '../data/forms/country-codes.data';
import { CareerRole } from '../data/forms/career-roles.data';

// --- I HAVE RE-ENGINEERED THE STYLES FOR A TOP-TIER LOOK ---
const customSelectStyles = {
  control: (provided: any, state: { isFocused: any; }) => ({
    ...provided,
    minHeight: '42px',
    height: '42px',
    border: state.isFocused ? '1px solid #FF5722' : '1px solid #D1D5DB',
    borderRadius: '0.375rem',
    boxShadow: 'none',
    '&:hover': {
      borderColor: '#D1D5DB',
    },
    fontSize: '16px', // Prevents iOS zoom
    '@media (min-width: 640px)': {
      fontSize: '14px',
    },
  }),
  option: (provided: any, state: { isSelected: any; isFocused: any; }) => ({
    ...provided,
    display: 'flex',
    alignItems: 'center',
    paddingTop: '8px',
    paddingBottom: '8px',
    fontSize: '14px',
    backgroundColor: state.isSelected ? '#FF5722' : state.isFocused ? '#FF57221A' : 'white',
    color: state.isSelected ? 'white' : 'black',
  }),
  singleValue: (provided: any) => ({
    ...provided,
    display: 'flex',
    alignItems: 'center',
  }),
  multiValue: (provided: any) => ({ ...provided, backgroundColor: '#FF57221A' }),
  multiValueLabel: (provided: any) => ({ ...provided, color: '#C10100' }),
  input: (provided: any) => ({...provided, margin: '0px'}),
  valueContainer: (provided: any) => ({...provided, height: '40px', padding: '0 8px'}),
  indicatorsContainer: (provided: any) => ({...provided, height: '40px'}),
};

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  availableRoles: CareerRole[];
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, availableRoles }) => {
  const [formState, setFormState] = useState({ submitting: false, succeeded: false, error: '' });
  const [wordCount, setWordCount] = useState(0);
  const [showSuccessAnimation, setShowSuccessAnimation] = useState(false);
  
  const ghanaOption = countryCodesData.find(c => c.iso === 'GH');
  const [selectedCountry, setSelectedCountry] = useState<typeof ghanaOption>(ghanaOption);
  const [selectedRoles, setSelectedRoles] = useState<readonly CareerRole[]>([]);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    if (isOpen) {
      setFormState({ submitting: false, succeeded: false, error: '' });
      setShowSuccessAnimation(false);
      setWordCount(0);
      setSelectedCountry(ghanaOption);
      setSelectedRoles([]);
      setErrors({});
    }
  }, [isOpen]);

  const handleIntroChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    const words = event.target.value.trim().split(/\s+/).filter(Boolean);
    setWordCount(words.length);
  };

  const validateForm = (formData: FormData) => {
    const newErrors: { [key: string]: string } = {};
    if (!formData.get('firstName')) newErrors.firstName = "First name is required.";
    if (!formData.get('surname')) newErrors.surname = "Surname is required.";
    if (!formData.get('email')) newErrors.email = "Email is required.";
    if (!formData.get('phoneNumber')) newErrors.phoneNumber = "Phone number is required.";
    if (!formData.get('message')) newErrors.message = "Introduction is required.";
    if (selectedRoles.length === 0) newErrors.roles = "Please select at least one role.";
    return newErrors;
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const validationErrors = validateForm(formData);
    
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) {
      setFormState({ ...formState, error: 'Please fill out all required fields.' });
      return;
    }

    setFormState({ ...formState, submitting: true, error: '' });

    // Simulate form submission without backend
    try {
      // Simulate processing time
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setFormState({ submitting: false, succeeded: true, error: '' });
      setShowSuccessAnimation(true);

    } catch (error) {
      setFormState({ submitting: false, succeeded: false, error: 'An error occurred while submitting your application.' });
    }
  };

  const handleCloseAll = () => {
    setShowSuccessAnimation(false);
    onClose();
  };

  if (!isOpen) return null;

  const countryOptions = countryCodesData.map(country => ({ value: country.iso, label: country.name, ...country }));

  // --- THIS FUNCTION DEFINES THE NEW TWO-LINE LAYOUT IN THE DROPDOWN LIST ---
  const formatOptionLabel = ({ name, iso, code }: { name: string, iso: string, code: string }) => (
    <div className="flex items-center">
      <img src={`https://flagcdn.com/w20/${iso.toLowerCase()}.png`} alt={`${name} flag`} className="w-5 h-auto mr-3 flex-shrink-0" />
      <div>
        <div className="text-sm font-medium">{name}</div>
        <div className="text-xs text-gray-500">{code}</div>
      </div>
    </div>
  );
  
  // --- THIS FUNCTION KEEPS THE SELECTED VALUE AS FLAG-ONLY ---
  const formatSelectedValueLabel = ({ iso }: { iso: string }) => (
    <div className="flex items-center">
      <img src={`https://flagcdn.com/w20/${iso.toLowerCase()}.png`} alt={`flag`} className="w-5 h-auto mr-2" />
    </div>
  );

  return (
    <>
      <div 
        className={`fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 ${showSuccessAnimation ? 'opacity-0 pointer-events-none' : ''}`}
        aria-modal="true" role="dialog"
      >
        <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full relative h-[85vh] flex flex-col">
          <div className="flex-shrink-0 px-8 py-4 border-b border-gray-200 flex justify-between items-center">
            <div className="flex items-center gap-2"><img src="https://i.imgur.com/eioVNZq.png" alt="Logo" className="h-8" /><h3 className="text-lg font-semibold text-gray-800">Application Form</h3></div>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-800 transition-colors" aria-label="Close modal"><X className="w-6 h-6" /></button>
          </div>
          
          <div className="p-8 overflow-y-auto flex-1">
            <p className="text-sm text-gray-500 mb-6">Fill out the form below to submit your application. Only complete applications will be considered.</p>
            
            <form onSubmit={handleSubmit} noValidate className="space-y-4">
              <div>
                <label htmlFor="roles" className="block text-sm font-medium text-gray-700">Role(s) you are applying for*</label>
                <Select
                  isMulti
                  id="roles"
                  name="roles"
                  options={availableRoles.map(role => ({ value: role.name, label: role.name }))}
                  styles={{...customSelectStyles, control: (provided, state) => ({ ...customSelectStyles.control(provided, state), borderColor: errors.roles ? '#EF4444' : '#D1D5DB' })}}
                  className="mt-1"
                  placeholder="Select one or more roles..."
                  onChange={(options) => setSelectedRoles(options as readonly { value: string; label: string }[] as any)}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">First Name*</label>
                  <input type="text" name="firstName" id="firstName" className={`mt-1 w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-[#FF5722] focus:border-[#FF5722] ${errors.firstName ? 'border-red-500' : 'border-gray-300'}`} />
                </div>
                <div>
                  <label htmlFor="surname" className="block text-sm font-medium text-gray-700">Surname*</label>
                  <input type="text" name="surname" id="surname" className={`mt-1 w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-[#FF5722] focus:border-[#FF5722] ${errors.surname ? 'border-red-500' : 'border-gray-300'}`} />
                </div>
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email Address*</label>
                <input type="email" name="email" id="email" className={`mt-1 w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-[#FF5722] focus:border-[#FF5722] ${errors.email ? 'border-red-500' : 'border-gray-300'}`} />
              </div>
              
              <div>
                <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700">Phone Number*</label>
                <div className="mt-1 flex">
                  <div className="w-24"><Select options={countryOptions} styles={{...customSelectStyles, control: (provided, state) => ({ ...customSelectStyles.control(provided, state), borderRight: 0, borderTopRightRadius: 0, borderBottomRightRadius: 0, borderColor: errors.phoneNumber ? '#EF4444' : '#D1D5DB' })}} defaultValue={countryOptions.find(c => c.iso === 'GH')} formatOptionLabel={formatOptionLabel} onChange={(option) => setSelectedCountry(option)} /></div>
                  <input type="tel" name="phoneNumber" id="phoneNumber" className={`flex-1 min-w-0 block w-full px-3 py-2 border rounded-r-md shadow-sm focus:outline-none focus:ring-[#FF5722] focus:border-[#FF5722] ${errors.phoneNumber ? 'border-red-500' : 'border-gray-300'}`} />
                </div>
              </div>
              
              <div>
                <label htmlFor="message" className="block text-sm font-medium text-gray-700">Brief Introduction*</label>
                <textarea name="message" id="message" rows={4} maxLength={500} onChange={handleIntroChange} className={`mt-1 w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-[#FF5722] focus:border-[#FF5722] ${errors.message ? 'border-red-500' : 'border-gray-300'}`}></textarea>
                <p className={`text-xs mt-1 ${wordCount > 100 ? 'text-red-600' : 'text-gray-500'}`}>{wordCount}/100 words</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Samples of Work (optional)</label>
                <input type="url" name="portfolioUrl" id="portfolioUrl" placeholder="Add a link to your portfolio" className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#FF5722] focus:border-[#FF5722]" />
                <div className="flex items-center justify-center my-2"><span className="flex-grow border-t border-gray-200"></span><span className="mx-2 text-xs text-gray-500">OR</span><span className="flex-grow border-t border-gray-200"></span></div>
                <input type="file" name="portfolioFile" id="portfolioFile" className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-[#FF5722]/10 file:text-[#FF5722] hover:file:bg-[#FF5722]/20" />
              </div>

              {formState.error && <p className="text-sm text-red-600 text-center">{formState.error}</p>}

              <div className="pt-4">
                <button type="submit" disabled={formState.submitting} className="w-full bg-[#FF5722] hover:bg-[#E64A19] text-white font-bold py-3 px-4 rounded-lg transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed">
                  {formState.submitting ? 'Submitting...' : 'Submit Application'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
      <SuccessAnimation isOpen={showSuccessAnimation} onClose={handleCloseAll} />
    </>
  );
};
export default Modal;