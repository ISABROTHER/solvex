// @ts-nocheck
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  Loader2, 
  AlertCircle, 
  Users, 
  User, 
  Paperclip, 
  Calendar,
  CheckCircle,
  List,
  Tag,
  AlignLeft,
  Flag,
  Send,
  UploadCloud,
  FileText,
  Clock,
  ThumbsUp,
  Edit3
} from 'lucide-react';
import { Profile } from '../tabs/EmployeesTab';
import { Assignment, Milestone } from '../tabs/AssignmentsTab'; // We'll export these types

// --- Reusable Components ---

const InfoRow: React.FC<{ icon: React.ElementType; label: string; value: React.ReactNode }> = ({
  icon: Icon,
  label,
  value
}) => (
  <div className="flex items-start gap-3">
    <Icon className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
    <div>
      <p className="text-sm text-gray-500">{label}</p>
      <div className="font-medium text-gray-900 break-words">{value}</div>
    </div>
  </div>
);

const AssigneeBadge: React.FC<{ user: Pick<Profile, 'first_name' | 'last_name' | 'avatar_url'> }> = ({ user }) => (
  <div className="flex items-center gap-2 p-2 rounded-lg bg-gray-100">
    <span className="w-6 h-6 rounded-full bg-gray-300 flex items-center justify-center">
      <User size={14} className="text-gray-600" />
    </span>
    <span className="text-sm font-medium">{user.first_name} {user.last_name}</span>
  </div>
);

const FileAttachment: React.FC<{ file: { file_name: string; file_url: string } }> = ({ file }) => (
  <a 
    href={file.file_url} 
    target="_blank" 
    rel="noopener noreferrer" 
    className="flex items-center gap-2 p-2 text-sm text-blue-600 hover:bg-blue-50 rounded-lg"
  >
    <Paperclip size={16} />
    <span className="truncate">{file.file_name}</span>
  </a>
);

// --- Main Panel ---

interface AssignmentDetailPanelProps {
  assignment: Assignment | null;
  onClose: () => void;
  // We'll add real functions for these later
  onUpdateStatus: (newStatus: string) => void;
  onPostComment: (comment: string) => void;
  onApproveDeliverable: (deliverableId: string) => void;
  onRequestEdits: (deliverableId: string, feedback: string) => void;
}

const AssignmentDetailPanel: React.FC<AssignmentDetailPanelProps> = ({
  assignment,
  onClose,
  onUpdateStatus,
  onPostComment,
  onApproveDeliverable,
  onRequestEdits,
}) => {
  const [newComment, setNewComment] = useState('');
  
  const handlePostComment = () => {
    if (newComment.trim()) {
      onPostComment(newComment.trim());
      setNewComment('');
    }
  };
  
  // --- Calculate Progress (Point #2) ---
  const progress = useMemo(() => {
    if (!assignment || assignment.milestones.length === 0) return 0;
    const completed = assignment.milestones.filter(m => m.completed).length;
    return Math.round((completed / assignment.milestones.length) * 100);
  }, [assignment]);
  
  return (
    <AnimatePresence>
      {assignment && (
        <div className="fixed inset-0 z-40">
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 bg-black/50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          
          {/* Panel */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="absolute right-0 top-0 bottom-0 w-full max-w-2xl bg-white shadow-2xl flex flex-col"
          >
            {/* Header */}
            <div className="flex-shrink-0 p-5 flex justify-between items-center border-b">
              <div>
                <span className="px-3 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-700">{assignment.category}</span>
                <h3 className="text-2xl font-bold text-gray-900 mt-1">{assignment.title}</h3>
              </div>
              <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-200">
                <X size={24} />
              </button>
            </div>
            
            {/* Content */}
            <div className="flex-1 overflow-y-auto">
              {/* Main Details (Point #1, #2, #3) */}
              <div className="p-6 border-b">
                <h4 className="text-lg font-semibold text-gray-800 mb-4">Details</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <InfoRow icon={Flag} label="Priority" value={<span className="capitalize font-semibold">{assignment.priority}</span>} />
                  <InfoRow icon={Tag} label="Status" value={
                    <select 
                      value={assignment.status} 
                      onChange={(e) => onUpdateStatus(e.target.value)}
                      className="p-1 rounded-lg border border-gray-300"
                    >
                      <option value="Assigned">Assigned</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Pending Review">Pending Review</option>
                      <option value="Completed">Completed</option>
                      <option value="Overdue">Overdue</option>
                    </select>
                  } />
                  <InfoRow icon={Calendar} label="Start Date" value={assignment.start_date || 'N/A'} />
                  <InfoRow icon={Calendar} label="Due Date" value={<span className="font-semibold text-red-600">{assignment.due_date || 'N/A'}</span>} />
                  <InfoRow icon={Users} label="Assignees" value={
                    <div className="flex flex-wrap gap-2">
                      {assignment.assignees.map(user => <AssigneeBadge key={user.id} user={user} />)}
                    </div>
                  } />
                  {assignment.supervisor && (
                    <InfoRow icon={User} label="Supervisor" value={<AssigneeBadge user={assignment.supervisor} />} />
                  )}
                </div>
                <div className="mt-6">
                  <InfoRow icon={AlignLeft} label="Description" value={<p className="whitespace-pre-wrap">{assignment.description}</p>} />
                </div>
                {assignment.attachments.length > 0 && (
                  <div className="mt-6">
                    <InfoRow icon={Paperclip} label="Attachments" value={
                      <div className="flex flex-col gap-1">
                        {assignment.attachments.map(file => <FileAttachment key={file.id} file={file} />)}
                      </div>
                    } />
                  </div>
                )}
              </div>
              
              {/* Milestones & Progress (Point #2) */}
              <div className="p-6 border-b">
                <h4 className="text-lg font-semibold text-gray-800 mb-4">Progress & Milestones</h4>
                {/* Progress Bar */}
                <div>
                  <div className="flex justify-between text-sm font-medium mb-1">
                    <span>Overall Progress</span>
                    <span className="text-[#FF5722]">{progress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div className="bg-[#FF5722] h-2.5 rounded-full" style={{ width: `${progress}%` }}></div>
                  </div>
                </div>
                {/* Milestone List */}
                <div className="mt-4 space-y-3">
                  {assignment.milestones.length === 0 ? (
                    <p className="text-sm text-gray-500">No milestones for this assignment.</p>
                  ) : (
                    assignment.milestones.map(milestone => (
                      <div key={milestone.id} className={`flex items-center gap-3 ${milestone.completed ? 'opacity-60' : ''}`}>
                        <CheckCircle size={20} className={milestone.completed ? 'text-green-500' : 'text-gray-300'} />
                        <div className="flex-1">
                          <p className={`font-medium ${milestone.completed ? 'line-through' : ''}`}>{milestone.title}</p>
                          {milestone.due_date && <p className="text-xs text-gray-500">Due: {milestone.due_date}</p>}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
              
              {/* Deliverables (Point #5) */}
              <div className="p-6 border-b">
                <h4 className="text-lg font-semibold text-gray-800 mb-4">Deliverables</h4>
                {assignment.deliverables.length === 0 ? (
                  <div className="text-center p-4 border-2 border-dashed rounded-lg">
                    <p className="text-sm text-gray-500">No deliverables submitted yet.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {assignment.deliverables.map(file => (
                      <div key={file.id} className="p-3 rounded-lg border border-gray-200">
                        <div className="flex items-center justify-between">
                          <span className="flex items-center gap-2 font-medium">
                            <FileText size={16} className="text-blue-600" />
                            {file.file_name}
                          </span>
                          <span className="text-xs text-gray-500">v1</span>
                        </div>
                        <div className="flex gap-2 mt-3">
                          <button 
                            onClick={() => onApproveDeliverable(file.id)}
                            className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-green-100 text-green-700 hover:bg-green-200"
                          >
                            <ThumbsUp size={14} /> Approve
                          </button>
                          <button
                            onClick={() => onRequestEdits(file.id, 'Needs more work')}
                            className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-yellow-100 text-yellow-700 hover:bg-yellow-200"
                          >
                            <Edit3 size={14} /> Request Edits
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              
              {/* Comments (Point #4) */}
              <div className="p-6">
                <h4 className="text-lg font-semibold text-gray-800 mb-4">Comments & Feedback</h4>
                {/* Comment List */}
                <div className="space-y-4 max-h-60 overflow-y-auto pr-2">
                  {assignment.comments.length === 0 ? (
                     <p className="text-sm text-gray-500">No comments yet.</p>
                  ) : (
                    assignment.comments.map(comment => (
                      <div key={comment.id} className="flex items-start gap-3">
                        <span className="w-8 h-8 rounded-full bg-gray-200 flex-shrink-0 flex items-center justify-center">
                          <User size={16} className="text-gray-500" />
                        </span>
                        <div>
                          <p className="text-sm font-semibold">
                            {comment.profile.first_name} {comment.profile.last_name}
                            <span className="text-xs text-gray-400 font-normal ml-2">{comment.created_at}</span>
                          </p>
                          <p className="text-sm text-gray-700">{comment.content}</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
                
                {/* New Comment Form */}
                <div className="mt-4 flex items-start gap-3">
                  <span className="w-8 h-8 rounded-full bg-gray-200 flex-shrink-0 flex items-center justify-center">
                    <User size={16} className="text-gray-500" />
                  </span>
                  <div className="flex-1 relative">
                    <textarea
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      placeholder="Add a comment or feedback... (@name to tag)"
                      rows={3}
                      className="w-full p-3 pr-12 rounded-lg border border-gray-300"
                    />
                    <button 
                      onClick={handlePostComment}
                      className="absolute right-3 top-3 p-2 rounded-full bg-[#FF5722] text-white hover:bg-[#E64A19]"
                    >
                      <Send size={16} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
            
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default AssignmentDetailPanel;