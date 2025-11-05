// @ts-nocheck
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  Loader2, 
  Send, 
  User, 
  AlignLeft, 
  Paperclip, 
  List, 
  UploadCloud,
  CheckCircle,
  FileText,
  Clock, // Added Clock for In Progress
  AlertCircle, // Added AlertCircle for Overdue
  AlertTriangle // Added AlertTriangle for Pending Review
} from 'lucide-react';

// Helper to format date
const formatDate = (dateString: string | null) => {
  if (!dateString) return 'N/A';
  return new Date(dateString).toLocaleString('en-US', {
    dateStyle: 'medium',
    timeStyle: 'short',
  });
};

// Helper to get status colors (copied logic from Dashboard page for consistency)
const getStatusProps = (status: string) => {
    switch (status) {
      case 'completed': return { icon: CheckCircle, color: 'text-green-500', bg: 'bg-green-100', label: 'Completed' };
      case 'in_progress': return { icon: Clock, color: 'text-blue-500', bg: 'bg-blue-100', label: 'In Progress' };
      case 'overdue': return { icon: AlertCircle, color: 'text-red-500', bg: 'bg-red-100', label: 'Overdue' };
      case 'pending': return { icon: List, color: 'text-yellow-600', bg: 'bg-yellow-100', label: 'Pending' }; 
      case 'pending_review': return { icon: AlertTriangle, color: 'text-purple-600', bg: 'bg-purple-100', label: 'Pending Review' }; 
      default: return { icon: List, color: 'text-gray-600', bg: 'bg-gray-100', label: status };
    }
};

// Panel component
interface EmployeeAssignmentPanelProps {
  assignment: any | null;
  onClose: () => void;
  onPostComment: (assignmentId: string, content: string) => void;
  onUpdateStatus: (assignmentId: string, newStatus: string) => void;
}

const EmployeeAssignmentPanel: React.FC<EmployeeAssignmentPanelProps> = ({
  assignment,
  onClose,
  onPostComment,
  onUpdateStatus,
}) => {
  const [newComment, setNewComment] = useState('');

  const handlePostComment = () => {
    if (!newComment.trim() || !assignment) return;
    onPostComment(assignment.id, newComment.trim());
    setNewComment('');
  };

  const renderContent = () => {
    if (!assignment) return null;

    // Show loading skeleton
    if (assignment.loading) {
      return (
        <div className="p-8 space-y-8 animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/4"></div>
          <div className="h-10 bg-gray-300 rounded w-full"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          <div className="mt-8 space-y-4">
            <div className="h-40 bg-gray-100 rounded-lg"></div>
            <div className="h-20 bg-gray-100 rounded-lg"></div>
            <div className="h-40 bg-gray-100 rounded-lg"></div>
          </div>
        </div>
      );
    }
    
    const statusProps = getStatusProps(assignment.status);

    // Show full details
    return (
      <>
        {/* Themed Header */}
        <div className="flex-shrink-0 p-6 border-b bg-gray-50">
          <div className="flex items-center justify-between">
            {/* Status Badge */}
            <span className={`flex items-center text-xs font-bold gap-1.5 px-3 py-1.5 rounded-full ${statusProps.bg} ${statusProps.color}`}>
              <statusProps.icon size={16} /> {statusProps.label}
            </span>
             {/* Due Date */}
            <p className="text-sm font-medium text-gray-500">
                Due: <span className="font-bold text-[#FF5722]">{formatDate(assignment.due_date)}</span>
            </p>
          </div>

          <h3 className="text-3xl font-extrabold text-gray-900 mt-3">{assignment.title}</h3>
          <p className="text-sm text-gray-600 mt-1">Category: <span className="font-medium text-gray-700">{assignment.category}</span></p>
        </div>
        
        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-white">
          
          {/* Status Updater Card */}
          <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
            <label htmlFor="status-select" className="text-sm font-bold text-gray-700 block mb-2">Change Status</label>
            <div className="flex items-center gap-4">
                <select
                    id="status-select"
                    value={assignment.status}
                    onChange={(e) => onUpdateStatus(assignment.id, e.target.value)}
                    className="flex-1 px-3 py-2 rounded-lg border border-gray-300 shadow-sm focus:border-[#FF5722] focus:ring focus:ring-[#FF5722]/50"
                >
                <option value="pending">Pending</option>
                <option value="in_progress">In Progress</option>
                <option value="pending_review">Pending Review</option>
                <option value="completed">Completed</option>
                {assignment.status === 'overdue' && <option value="overdue">Overdue</option>}
                </select>
                <button
                    onClick={() => onUpdateStatus(assignment.id, assignment.status === 'completed' ? 'pending_review' : 'completed')}
                    className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors shadow-md"
                >
                    <CheckCircle size={18} /> Mark Done
                </button>
            </div>
            {assignment.status === 'pending_review' && (
              <p className="text-xs text-purple-600 mt-2">The task is awaiting final approval from the admin.</p>
            )}
          </div>
          
          {/* Description Card */}
          <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
            <h4 className="font-extrabold text-gray-800 flex items-center gap-2 mb-2"><AlignLeft size={18} className="text-[#FF5722]" /> Assignment Description</h4>
            <div className="text-sm text-gray-700 mt-2 p-3 bg-white rounded-lg whitespace-pre-wrap border border-gray-200">
                {assignment.description}
            </div>
          </div>
          
          {/* Attachments from Admin Card */}
          {assignment.attachments?.length > 0 && (
            <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
              <h4 className="font-extrabold text-gray-800 flex items-center gap-2 mb-3"><Paperclip size={18} className="text-[#FF5722]" /> Admin Attachments</h4>
              <div className="space-y-2">
                {assignment.attachments.map(file => (
                  <a key={file.file_name} href={file.file_url} target="_blank" rel="noopener noreferrer" className="p-3 bg-white rounded-lg flex items-center gap-3 text-sm text-blue-600 hover:bg-blue-50 transition-colors shadow-sm border border-gray-200">
                    <FileText size={18} className="text-blue-500 flex-shrink-0" /> 
                    <span className="truncate font-medium">{file.file_name}</span>
                  </a>
                ))}
              </div>
            </div>
          )}
          
          {/* Deliverables (Your Uploads) Card */}
          <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
            <h4 className="font-extrabold text-gray-800 flex items-center gap-2 mb-3"><UploadCloud size={18} className="text-[#FF5722]" /> Submit Deliverables</h4>
            <div className="mt-2 p-6 border-2 border-dashed border-gray-300 rounded-xl text-center bg-white">
              <UploadCloud size={32} className="mx-auto text-gray-400 mb-2" />
              <p className="text-sm text-gray-600">Drag and drop files here, or <span className="text-[#FF5722] font-semibold cursor-pointer">browse</span>.</p>
              <p className="text-xs text-gray-500 mt-1">File upload not implemented yet.</p>
            </div>
          </div>

          {/* Comments/Activity Card */}
          <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
            <h4 className="font-extrabold text-gray-800 flex items-center gap-2 mb-4"><List size={18} className="text-[#FF5722]" /> Activity Feed</h4>
            <div className="space-y-4">
              
              {/* Comment List */}
              {assignment.comments?.length === 0 ? (
                <p className="text-sm text-gray-500 text-center py-4">No comments yet. Start the conversation!</p>
              ) : (
                assignment.comments.slice().reverse().map(comment => (
                  <div key={comment.id} className="flex items-start gap-3 p-3 bg-white rounded-xl shadow-sm border border-gray-100">
                    <span className="w-8 h-8 rounded-full bg-gray-200 flex-shrink-0 flex items-center justify-center border">
                      <User size={16} className="text-gray-500" />
                    </span>
                    <div className="flex-1">
                      <p className="text-xs font-bold text-gray-800">
                        {comment.profile?.first_name} {comment.profile?.last_name || 'Admin'}
                        <span className="text-xs text-gray-400 font-normal ml-3">{formatDate(comment.created_at)}</span>
                      </p>
                      <p className="text-sm text-gray-700 mt-1 whitespace-pre-wrap">{comment.content}</p>
                    </div>
                  </div>
                ))
              )}

              {/* New Comment Form (Moved to the bottom for context) */}
              <div className="pt-4 border-t border-gray-200">
                <div className="flex items-end gap-3">
                    <span className="w-8 h-8 rounded-full bg-gray-200 flex-shrink-0 flex items-center justify-center border">
                        <User size={16} className="text-gray-500" />
                    </span>
                    <div className="flex-1 relative">
                        <textarea
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            placeholder="Add a comment or ask a question..."
                            rows={3}
                            className="w-full p-3 rounded-xl border border-gray-300 focus:border-[#FF5722] focus:ring-1 focus:ring-[#FF5722] resize-none"
                        />
                        <button 
                            onClick={handlePostComment}
                            disabled={!newComment.trim()}
                            className="absolute right-2 bottom-2 p-2 rounded-full bg-[#FF5722] text-white hover:bg-[#E64A19] disabled:bg-gray-400 transition-colors"
                        >
                            <Send size={16} />
                        </button>
                    </div>
                </div>
              </div>
            </div>
          </div>
          
        </div>
      </>
    );
  };
  
  return (
    <AnimatePresence>
      {assignment && (
        <motion.div
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          className="fixed right-0 top-0 bottom-0 w-full max-w-lg bg-white shadow-2xl flex flex-col z-40 border-l"
        >
          {/* Close Button (moved to outside the header for cleaner look) */}
          <button onClick={onClose} className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-200 z-50 text-gray-700">
            <X size={24} />
          </button>
          
          {renderContent()}
          
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default EmployeeAssignmentPanel;