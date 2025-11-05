// @ts-nocheck
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  Save, 
  Loader2, 
  AlertCircle, 
  Users, 
  User, 
  Paperclip, 
  Plus, 
  Calendar,
  Trash2,
  List,
  Tag,
  AlignLeft,
  Flag
} from 'lucide-react';
import { Profile } from '../tabs/EmployeesTab'; // We'll get this from EmployeesTab

// --- Types (from your spec) ---
const CATEGORIES = ['Design', 'Content', 'Public Relations', 'Innovation Lab', 'Production', 'Client Project'];
const PRIORITIES = ['low', 'medium', 'high'];
const TASK_TYPES = ['individual', 'team'];

interface CreateAssignmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (assignmentData: any) => Promise<void>;
  isSaving: boolean;
  employees: Profile[]; // <-- ADD THIS PROP to receive the real employee list
}

const CreateAssignmentModal: React.FC<CreateAssignmentModalProps> = ({
  isOpen,
  onClose,
  onSave,
  isSaving,
  employees, // <-- DESTRUCTURE THE PROP
}) => {
  const [error, setError] = useState<string | null>(null);

  // --- State for all fields from your spec ---
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [description, setDescription] = useState('');
  const [attachments, setAttachments] = useState<File[]>([]);
  const [priority, setPriority] = useState(PRIORITIES[1]);
  const [taskType, setTaskType] = useState(TASK_TYPES[0]);
  const [startDate, setStartDate] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [milestones, setMilestones] = useState<{ title: string; due_date: string }[]>([]);
  const [newMilestone, setNewMilestone] = useState('');
  const [assignees, setAssignees] = useState<string[]>([]); // Array of employee IDs
  const [supervisorId, setSupervisorId] = useState<string | null>(null);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !description || assignees.length === 0) {
      setError('Title, Description, and at least one Assignee are required.');
      return;
    }
    
    // --- MOCKED SAVE ---
    // This is where we'll call the real Supabase function
    const mockData = {
      title, category, description, attachments, priority, taskType,
      startDate, dueDate, milestones, assignees, supervisorId
    };
    console.log("SAVING MOCK ASSIGNMENT:", mockData);
    await onSave(mockData);
    // --- END MOCKED ---
  };
  
  const addMilestone = () => {
    if (newMilestone.trim()) {
      setMilestones([...milestones, { title: newMilestone.trim(), due_date: '' }]);
      setNewMilestone('');
    }
  };
  
  const removeMilestone = (index: number) => {
    setMilestones(milestones.filter((_, i) => i !== index));
  };
  
  const handleAssigneeToggle = (id: string) => {
    setAssignees(prev => 
      prev.includes(id) ? prev.filter(aId => aId !== id) : [...prev, id]
    );
  };
  
  const handleAttachmentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setAttachments(prev => [...prev, ...Array.from(e.target.files)]);
    }
  };

  const removeAttachment = (index: number) => {
    setAttachments(attachments.filter((_, i) => i !== index));
  };

  if (!isOpen) return null;

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
          className="relative w-full max-w-3xl bg-white rounded-2xl shadow-2xl max-h-[90vh] overflow-hidden flex flex-col"
        >
          {/* Header */}
          <div className="flex-shrink-0 p-6 flex justify-between items-center border-b">
            <h3 className="text-xl font-bold text-gray-900">
              Create New Assignment
            </h3>
            <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-200">
              <X size={20} />
            </button>
          </div>

          {/* Form Content */}
          {/* --- FIX: Added id="assignment-form" --- */}
          <form id="assignment-form" onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
            {error && (
              <div className="p-3 bg-red-100 border border-red-300 text-red-700 rounded-lg flex items-center gap-2 text-sm">
                <AlertCircle size={16} /> {error}
              </div>
            )}
            
            {/* Title */}
            <div>
              <label className="text-sm font-semibold text-gray-700 flex items-center gap-2"><Tag size={16} /> Title *</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Client Brand Strategy Deck"
                className="mt-1 w-full px-3 py-2 rounded-lg border border-gray-300"
              />
            </div>
            
            {/* Category, Priority, Type */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-semibold text-gray-700 flex items-center gap-2"><List size={16} /> Category</label>
                <select value={category} onChange={(e) => setCategory(e.target.value)} className="mt-1 w-full px-3 py-2 rounded-lg border border-gray-300">
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="text-sm font-semibold text-gray-700 flex items-center gap-2"><Flag size={16} /> Priority</label>
                <select value={priority} onChange={(e) => setPriority(e.target.value)} className="mt-1 w-full px-3 py-2 rounded-lg border border-gray-300">
                  {PRIORITIES.map(p => <option key={p} value={p} className="capitalize">{p.charAt(0).toUpperCase() + p.slice(1)}</option>)}
                </select>
              </div>
              <div>
                <label className="text-sm font-semibold text-gray-700 flex items-center gap-2"><Users size={16} /> Task Type</label>
                <select value={taskType} onChange={(e) => setTaskType(e.target.value)} className="mt-1 w-full px-3 py-2 rounded-lg border border-gray-300">
                  {TASK_TYPES.map(t => <option key={t} value={t} className="capitalize">{t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
                </select>
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="text-sm font-semibold text-gray-700 flex items-center gap-2"><AlignLeft size={16} /> Detailed Description *</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Clear brief, objectives, tone, format, and target audience."
                rows={5}
                className="mt-1 w-full px-3 py-2 rounded-lg border border-gray-300"
              />
            </div>
            
            {/* Dates */}
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               <div>
                <label className="text-sm font-semibold text-gray-700 flex items-center gap-2"><Calendar size={16} /> Start Date</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="mt-1 w-full px-3 py-2 rounded-lg border border-gray-300"
                />
               </div>
               <div>
                <label className="text-sm font-semibold text-gray-700 flex items-center gap-2"><Calendar size={16} /> Due Date</label>
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="mt-1 w-full px-3 py-2 rounded-lg border border-gray-300"
                />
               </div>
            </div>
            
            {/* Assignees */}
            <div>
              <label className="text-sm font-semibold text-gray-700 flex items-center gap-2"><Users size={16} /> Assignees *</label>
              <div className="mt-2 p-2 border border-gray-300 rounded-lg max-h-40 overflow-y-auto space-y-2">
                {/* --- USE REAL EMPLOYEES PROP --- */}
                {employees.map(emp => (
                  <label key={emp.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-100 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={assignees.includes(emp.id)}
                      onChange={() => handleAssigneeToggle(emp.id)}
                      className="h-4 w-4 rounded text-[#FF5722] focus:ring-[#FF5722]"
                    />
                    <span className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                      <User size={16} className="text-gray-500" />
                    </span>
                    <div>
                      <p className="font-medium text-gray-800">{emp.first_name} {emp.last_name}</p>
                      <p className="text-xs text-gray-500">{emp.position}</p>
                    </div>
                  </label>
                ))}
              </div>
            </div>
            
            {/* Supervisor */}
            <div>
              <label className="text-sm font-semibold text-gray-700 flex items-center gap-2"><User size={16} /> Supervisor / Project Lead</label>
              <select value={supervisorId || ''} onChange={(e) => setSupervisorId(e.target.value || null)} className="mt-1 w-full px-3 py-2 rounded-lg border border-gray-300">
                <option value="">None</option>
                {/* --- USE REAL EMPLOYEES PROP --- */}
                {employees.map(emp => <option key={emp.id} value={emp.id}>{emp.first_name} {emp.last_name}</option>)}
              </select>
            </div>
            
            {/* Milestones / Subtasks */}
            <div>
              <label className="text-sm font-semibold text-gray-700 flex items-center gap-2"><CheckCircle size={16} /> Milestones / Subtasks</label>
              <div className="mt-2 space-y-2">
                {milestones.map((milestone, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <input
                      type="text"
                      value={milestone.title}
                      readOnly
                      className="w-full px-3 py-2 rounded-lg border border-gray-200 bg-gray-100"
                    />
                    <button type="button" onClick={() => removeMilestone(index)} className="p-2 text-red-500 hover:bg-red-100 rounded-full">
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={newMilestone}
                    onChange={(e) => setNewMilestone(e.target.value)}
                    placeholder="e.g., Draft due"
                    className="w-full px-3 py-2 rounded-lg border border-gray-300"
                  />
                  <button type="button" onClick={addMilestone} className="p-2 bg-gray-200 hover:bg-gray-300 rounded-full">
                    <Plus size={16} />
                  </button>
                </div>
              </div>
            </div>
            
            {/* Attachments */}
            <div>
              <label className="text-sm font-semibold text-gray-700 flex items-center gap-2"><Paperclip size={16} /> Attachments</label>
              <div className="mt-2 space-y-2">
                {attachments.map((file, index) => (
                    <div key={index} className="flex items-center justify-between p-2 rounded-lg bg-gray-100">
                      <p className="text-sm text-gray-700 truncate">{file.name}</p>
                       <button type="button" onClick={() => removeAttachment(index)} className="p-1 text-red-500 hover:bg-red-100 rounded-full">
                        <Trash2 size={16} />
                      </button>
                    </div>
                ))}
              </div>
              <input
                type="file"
                multiple
                onChange={handleAttachmentChange}
                className="mt-2 w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-[#FF5722]/10 file:text-[#FF5722] hover:file:bg-[#FF5722]/20"
              />
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
              form="assignment-form" // <-- FIX: Link button to form
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
                  Create Assignment
                </>
              )}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default CreateAssignmentModal;