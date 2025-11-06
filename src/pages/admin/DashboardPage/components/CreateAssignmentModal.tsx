// @ts-nocheck
// src/pages/admin/DashboardPage/components/CreateAssignmentModal.tsx
// NOTE: This is the new V2 version
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Loader2, X, Plus, Trash2, UploadCloud, Paperclip } from 'lucide-react';
import type { Profile } from '../../../../lib/supabase/operations';

interface CreateAssignmentModalV2Props {
  isOpen: boolean;
  onClose: () => void;
  onSave: (formData: any) => Promise<void>;
  isSaving: boolean;
  employees: Profile[];
}

const CreateAssignmentModalV2: React.FC<CreateAssignmentModalV2Props> = ({
  isOpen,
  onClose,
  onSave,
  isSaving,
  employees,
}) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    assignee_id: '',
    category: 'Graphic Design',
    priority: 'medium',
    due_date: '',
    acceptance_criteria: '',
  });
  const [milestones, setMilestones] = useState([{ title: '' }]);
  const [briefFile, setBriefFile] = useState<File | null>(null);

  useEffect(() => {
    if (isOpen) {
      // Reset form
      setFormData({
        title: '',
        description: '',
        assignee_id: '',
        category: 'Graphic Design',
        priority: 'medium',
        due_date: '',
        acceptance_criteria: '',
      });
      setMilestones([{ title: '' }]);
      setBriefFile(null);
    }
  }, [isOpen]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleMilestoneChange = (index: number, value: string) => {
    const newMilestones = [...milestones];
    newMilestones[index].title = value;
    setMilestones(newMilestones);
  };

  const addMilestone = () => {
    setMilestones([...milestones, { title: '' }]);
  };

  const removeMilestone = (index: number) => {
    if (milestones.length <= 1) return;
    setMilestones(milestones.filter((_, i) => i !== index));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setBriefFile(e.target.files ? e.target.files[0] : null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const fullData = {
      ...formData,
      milestones: milestones.filter(m => m.title.trim() !== ''),
      briefFile: briefFile,
    };
    onSave(fullData);
  };
  
  const isValid = formData.title && formData.assignee_id;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <motion.div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="relative w-full max-w-2xl bg-white rounded-lg shadow-2xl flex flex-col max-h-[90vh]"
      >
        <div className="flex-shrink-0 p-4 border-b flex justify-between items-center">
          <h3 className="text-lg font-semibold text-gray-900">Create New Task</h3>
          <button onClick={onClose} className="p-2 rounded-full text-gray-500 hover:bg-gray-100">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Title *</label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                className="mt-1 w-full p-2 border rounded-md"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Assign to *</label>
              <select
                name="assignee_id"
                value={formData.assignee_id}
                onChange={handleChange}
                className="mt-1 w-full p-2 border rounded-md"
                required
              >
                <option value="" disabled>Select employee...</option>
                {employees.map(emp => (
                  <option key={emp.id} value={emp.id}>
                    {emp.first_name} {emp.last_name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Description / Brief</label>
            <textarea
              name="description"
              rows={4}
              value={formData.description}
              onChange={handleChange}
              className="mt-1 w-full p-2 border rounded-md"
              placeholder="Provide a clear description of the task..."
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Category</label>
              <input
                type="text"
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="mt-1 w-full p-2 border rounded-md"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Priority</label>
              <select
                name="priority"
                value={formData.priority}
                onChange={handleChange}
                className="mt-1 w-full p-2 border rounded-md"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Due Date</label>
              <input
                type="date"
                name="due_date"
                value={formData.due_date}
                onChange={handleChange}
                className="mt-1 w-full p-2 border rounded-md"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">Upload Brief / Assets</label>
            <div className="mt-1 flex items-center gap-4">
              <label className="w-full flex cursor-pointer items-center gap-2 px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
                <UploadCloud size={16} className="text-gray-500" />
                {briefFile ? 'Change file' : 'Attach a file'}
                <input type="file" className="sr-only" onChange={handleFileChange} />
              </label>
            </div>
            {briefFile && (
              <div className="mt-2 flex items-center justify-between p-2 bg-gray-50 rounded-md">
                <span className="flex items-center gap-2 text-sm font-medium text-gray-700">
                  <Paperclip size={14} />
                  {briefFile.name}
                </span>
                <button type="button" onClick={() => setBriefFile(null)} className="p-1 rounded-full hover:bg-gray-200">
                  <X size={14} />
                </button>
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Acceptance Criteria</label>
            <textarea
              name="acceptance_criteria"
              rows={3}
              value={formData.acceptance_criteria}
              onChange={handleChange}
              className="mt-1 w-full p-2 border rounded-md"
              placeholder="List criteria for completion, e.g., '- Export in PNG & SVG', '- All text proofed'"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Milestones</label>
            <div className="space-y-2">
              {milestones.map((m, index) => (
                <div key={index} className="flex items-center gap-2">
                  <input
                    type="text"
                    value={m.title}
                    onChange={(e) => handleMilestoneChange(index, e.target.value)}
                    placeholder={`Milestone ${index + 1} (e.g., First Draft)`}
                    className="w-full p-2 border rounded-md"
                  />
                  <button
                    type="button"
                    onClick={() => removeMilestone(index)}
                    disabled={milestones.length <= 1}
                    className="p-2 text-gray-400 hover:text-red-600 disabled:opacity-50"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={addMilestone}
                className="flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-800"
              >
                <Plus size={16} />
                Add Milestone
              </button>
            </div>
          </div>
        </form>

        <div className="flex-shrink-0 p-4 border-t flex justify-end">
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isSaving || !isValid}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {isSaving ? <Loader2 size={16} className="animate-spin" /> : 'Create & Assign Task'}
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default CreateAssignmentModalV2;