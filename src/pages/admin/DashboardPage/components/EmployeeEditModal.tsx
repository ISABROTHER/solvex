// @ts-nocheck
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Save, Loader2, AlertCircle } from 'lucide-react';
import { Profile } from '../tabs/EmployeesTab'; // Assuming type is exported from EmployeesTab

interface EmployeeEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  employee: Partial<Profile> | null; // Can be partial for creation
  onSave: (updatedProfile: Partial<Profile>, password?: string) => Promise<void>; // Add password for creation
  isSaving: boolean;
}

// Reusable input field component
const InputField = ({ label, name, value, onChange, placeholder = '', type = 'text' }) => (
  <div>
    <label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-1">
      {label}
    </label>
    <input
      type={type}
      id={name}
      name={name}
      value={value || ''}
      onChange={onChange}
      placeholder={placeholder}
      className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 focus:ring-2 focus:ring-[#FF5722] focus:border-[#FF5722]"
    />
  </div>
);

const EmployeeEditModal: React.FC<EmployeeEditModalProps> = ({
  isOpen,
  onClose,
  employee,
  onSave,
  isSaving,
}) => {
  const [formData, setFormData] = React.useState<Partial<Profile> | null>(null);
  const [password, setPassword] = React.useState<string>(''); // State for new employee password
  const [error, setError] = React.useState<string | null>(null);
  
  // Determine if this is "Create" or "Edit" mode
  const isCreating = !employee?.id;

  React.useEffect(() => {
    if (employee) {
      setFormData(employee);
    } else {
      // It's a new employee, start with an empty form
      setFormData({}); 
    }
    setPassword('');
    setError(null);
  }, [employee, isOpen]); // Reset form when modal opens or employee changes

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target;
    
    let processedValue: string | number | null = value;
    if (type === 'number') {
      processedValue = value === '' ? null : parseFloat(value);
    } else if (type === 'date') {
        processedValue = value === '' ? null : value;
    }

    setFormData(prev => (prev ? { ...prev, [name]: processedValue } : { [name]: processedValue }));
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData) return;

    if (isCreating) {
      if (!formData.email || !password) {
        setError('Email and password are required to create a new employee.');
        return;
      }
    }

    if (!formData.first_name || !formData.last_name || !formData.position) {
      setError('First name, last name, and position are required.');
      return;
    }

    await onSave(formData, isCreating ? password : undefined);
    // Don't close here, let onSave (in parent) handle it on success
  };

  if (!isOpen || !formData) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <motion.div
          className="absolute inset-0 bg-black/60"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        />
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl max-h-[90vh] overflow-hidden flex flex-col"
        >
          {/* Header */}
          <div className="flex-shrink-0 p-6 flex justify-between items-center border-b">
            <h3 className="text-xl font-bold text-gray-900">
              {isCreating ? "Add New Employee" : `Edit ${formData.first_name || ''} ${formData.last_name || ''}`}
            </h3>
            <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-200">
              <X size={20} />
            </button>
          </div>

          {/* Form Content */}
          <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
            {error && (
              <div className="p-3 bg-red-100 border border-red-300 text-red-700 rounded-lg flex items-center gap-2 text-sm">
                <AlertCircle size={16} /> {error}
              </div>
            )}
            
            {/* --- Authentication Fields (Create Mode Only) --- */}
            {isCreating && (
              <>
                <h4 className="font-semibold text-gray-800 border-b pb-2">Authentication</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <InputField label="Email *" name="email" value={formData.email} onChange={handleChange} type="email" placeholder="employee@solvex.com" />
                    <InputField label="Password *" name="password" value={password} onChange={(e) => setPassword(e.target.value)} type="password" placeholder="Min. 6 characters" />
                </div>
              </>
            )}
            
            <h4 className="font-semibold text-gray-800 border-b pb-2">Personal Details</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <InputField label="First Name *" name="first_name" value={formData.first_name} onChange={handleChange} />
              <InputField label="Last Name *" name="last_name" value={formData.last_name} onChange={handleChange} />
            </div>
            
            {!isCreating && (
                 <InputField label="Email (Read-only)" name="email" value={formData.email} onChange={() => {}} />
            )}
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <InputField label="Phone" name="phone" value={formData.phone} onChange={handleChange} placeholder="+233..." />
              <InputField label="Birth Date" name="birth_date" value={formData.birth_date} onChange={handleChange} type="date" />
            </div>
            <InputField label="Home Address" name="home_address" value={formData.home_address} onChange={handleChange} placeholder="Street, City" />
             <InputField label="National ID" name="national_id" value={formData.national_id} onChange={handleChange} placeholder="GHA-..." />

            <h4 className="font-semibold text-gray-800 border-b pb-2 pt-4">Employment Details</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <InputField label="Position *" name="position" value={formData.position} onChange={handleChange} placeholder="e.g., Graphic Designer" />
              <InputField label="Employee Number" name="employee_number" value={formData.employee_number} onChange={handleChange} placeholder="EMP-001" />
            </div>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <InputField label="Start Date" name="start_date" value={formData.start_date} onChange={handleChange} type="date" />
              <InputField label="End Date (Optional)" name="end_date" value={formData.end_date} onChange={handleChange} type="date" />
            </div>

            <h4 className="font-semibold text-gray-800 border-b pb-2 pt-4">Financial Details</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <InputField label="Salary (GHS)" name="salary" value={formData.salary} onChange={handleChange} type="number" placeholder="e.g., 3000.00" />
              <InputField label="Payday" name="payday" value={formData.payday} onChange={handleChange} placeholder="e.g., 28th of month" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <InputField label="Bank Name" name="bank_name" value={formData.bank_name} onChange={handleChange} placeholder="e.g., GCB Bank" />
              <InputField label="Bank Account" name="bank_account" value={formData.bank_account} onChange={handleChange} placeholder="Account Number" />
            </div>
          </form>

          {/* Footer */}
          <div className="flex-shrink-0 p-6 border-t flex justify-end gap-3 bg-gray-50">
            <button
              type="button"
              onClick={onClose}
              disabled={isSaving}
              className="px-6 py-2 text-sm font-semibold text-gray-700 rounded-lg hover:bg-gray-100 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              onClick={handleSubmit}
              disabled={isSaving}
              className="flex items-center gap-2 px-6 py-2 bg-[#FF5722] text-white font-semibold rounded-lg hover:bg-[#E64A19] disabled:opacity-50"
            >
              {isSaving ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save size={16} />
                  {isCreating ? "Create Employee" : "Save Changes"}
                </>
              )}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default EmployeeEditModal;