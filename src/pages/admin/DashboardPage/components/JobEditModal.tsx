// src/pages/admin/DashboardPage/components/JobEditModal.tsx
// @ts-nocheck
import React, { useState, useEffect, useMemo } from 'react';
import { X, Save, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Select from 'react-select';
import { JobPosition, Team } from '../../../../lib/supabase/operations';

interface JobEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  job: JobPosition | null;
  teams: Team[];
  onSave: (job: Partial<JobPosition>) => Promise<void>;
  isSaving: boolean;
}

const customSelectStyles = {
    control: (provided, state) => ({ ...provided, minHeight: '42px', borderColor: state.isFocused ? '#FF5722' : '#D1D5DB', boxShadow: 'none', backgroundColor: '#F9FAFB' }),
    option: (provided, state) => ({ ...provided, backgroundColor: state.isSelected ? '#FF5722' : state.isFocused ? '#FF57221A' : 'white', color: state.isSelected ? 'white' : '#1F2937' }),
};

const JobEditModal: React.FC<JobEditModalProps> = ({ isOpen, onClose, job, teams, onSave, isSaving }) => {
  const [formData, setFormData] = useState<Partial<JobPosition>>({});
  const [errors, setErrors] = useState({});

  const isEditing = useMemo(() => !!(job && job.id), [job]);

  useEffect(() => {
    if (job) {
      setFormData({
        id: job.id,
        title: job.title || '',
        description: job.description || '',
        requirements: job.requirements || '',
        status: job.status || 'open',
        team_id: job.team_id || '',
        team_name: job.team_name || '',
      });
      setErrors({});
    } else {
      setFormData({
        title: '',
        description: '',
        requirements: '',
        status: 'open',
        team_id: '',
        team_name: '',
      });
      setErrors({});
    }
  }, [job]);

  const teamOptions = useMemo(() => teams.map(t => ({
    value: t.id,
    label: t.name,
    team_name: t.name,
  })), [teams]);

  const statusOptions = [
    { value: 'open', label: 'Open' },
    { value: 'closed', label: 'Closed' },
  ];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const handleSelectChange = (name, option) => {
    if (name === 'team_id' && option) {
      setFormData(prev => ({ 
          ...prev, 
          team_id: option.value,
          team_name: option.team_name, // Sync the team_name as a fallback
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: option.value }));
    }
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.title?.trim()) newErrors.title = "Title is required.";
    if (!formData.team_id) newErrors.team_id = "Team is required.";
    if (!formData.description?.trim()) newErrors.description = "Description is required.";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    
    // Pass the cleaned data to the parent handler
    await onSave(formData);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <motion.div className="absolute inset-0 bg-black/50" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} />
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl max-h-[90vh] overflow-hidden flex flex-col"
      >
        <div className="flex-shrink-0 p-6 flex justify-between items-center border-b">
          <h3 className="text-xl font-bold text-gray-900">{isEditing ? 'Edit Job Posting' : 'Create New Job Posting'}</h3>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-200"><X size={20} /></button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Position Title *</label>
                <input type="text" name="title" value={formData.title || ''} onChange={handleChange} className={`w-full px-3 py-2 border rounded-lg bg-gray-50 focus:ring-[#FF5722] ${errors.title ? 'border-red-500' : 'border-gray-300'}`} required/>
                {errors.title && <p className="text-xs text-red-500 mt-1">{errors.title}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Team *</label>
                <Select
                  name="team_id"
                  options={teamOptions}
                  styles={customSelectStyles}
                  value={teamOptions.find(t => t.value === formData.team_id)}
                  onChange={(option) => handleSelectChange('team_id', option)}
                  className={`mt-1 ${errors.team_id ? 'border-red-500 rounded-lg ring-1 ring-red-500' : ''}`}
                />
                {errors.team_id && <p className="text-xs text-red-500 mt-1">{errors.team_id}</p>}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <Select
                  name="status"
                  options={statusOptions}
                  styles={customSelectStyles}
                  value={statusOptions.find(s => s.value === formData.status)}
                  onChange={(option) => handleSelectChange('status', option)}
                  className="mt-1"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date Posted (Auto-filled on creation)</label>
                <input type="text" disabled value={job?.created_at ? new Date(job.created_at).toLocaleDateString() : 'N/A'} className="w-full px-3 py-2 border rounded-lg bg-gray-100 text-gray-500"/>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
              <textarea name="description" value={formData.description || ''} onChange={handleChange} rows={4} className={`w-full px-3 py-2 border rounded-lg bg-gray-50 focus:ring-[#FF5722] ${errors.description ? 'border-red-500' : 'border-gray-300'}`} required/>
              {errors.description && <p className="text-xs text-red-500 mt-1">{errors.description}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Requirements (Optional)</label>
              <textarea name="requirements" value={formData.requirements || ''} onChange={handleChange} rows={3} className="w-full px-3 py-2 border rounded-lg bg-gray-50 focus:ring-[#FF5722]"/>
            </div>

            {Object.keys(errors).length > 0 && (
              <div className="p-3 bg-red-100 border border-red-300 text-red-700 rounded-lg flex items-center gap-2 text-sm">
                <AlertCircle size={16} /> Please correct the errors above.
              </div>
            )}
          </form>
        </div>

        <div className="flex-shrink-0 p-6 border-t flex justify-end gap-3 bg-gray-50">
          <button onClick={onClose} disabled={isSaving} className="px-6 py-2 text-sm font-semibold text-gray-700 rounded-lg hover:bg-gray-100 disabled:opacity-50">
            Cancel
          </button>
          <button onClick={handleSubmit} disabled={isSaving} className="flex items-center gap-2 px-6 py-2 bg-[#FF5722] text-white font-semibold rounded-lg hover:bg-[#E64A19] disabled:opacity-50">
            {isSaving ? (
                <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Saving...
                </>
            ) : (
                <>
                    <Save size={16} />
                    {isEditing ? 'Save Changes' : 'Create Posting'}
                </>
            )}
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default JobEditModal;
