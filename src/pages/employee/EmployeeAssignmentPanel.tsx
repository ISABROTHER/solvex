// @ts-nocheck
import React, { useState, useEffect } from 'react'; // <-- Added useEffect
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
  Clock,
  AlertCircle,
  AlertTriangle,
  Calendar,
} from 'lucide-react';

// Helper to format date
const formatDate = (dateString: string | null) => {
  if (!dateString) return 'N/A';
  return new Date(dateString).toLocaleString('en-US', {
    dateStyle: 'medium',
    timeStyle: 'short',
  });
};

// Helper to get status colors (for consistent theming with Dashboard)
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
  
  // NEW STATE: Manages the 1-10 progress value. We assume a mapping from status or a default.
  const [completionValue, setCompletionValue] = useState(1); 
  
  // Reset states when a new assignment is opened
  useEffect(() => {
    if (assignment) {
        setNewComment('');
        // Simple mapping for UI default: 10 if completed/review, 5 if in progress, 1 otherwise.
        if (assignment.status === 'completed' || assignment.status === 'pending_review') {
            setCompletionValue(10);
        } else if (assignment.status === 'in_progress') {
            // NOTE: In a real app, this should fetch the actual percentage from the assignment object
            setCompletionValue(5); 
        } else {
            setCompletionValue(1);
        }
    }
  }, [assignment]);


  const handlePostComment = () => {
    if (!newComment.trim() || !assignment) return;
    onPostComment(assignment.id, newComment.trim());
    setNewComment('');
  };
  
  // NEW HANDLER: Updates percentage and potentially the string status
  const handleUpdateCompletion = (value: number) => {
    if (!assignment) return;
    setCompletionValue(value);
    
    // Auto-set status to 'in_progress' if employee starts tracking progress from pending/overdue
    if (value > 1 && assignment.status !== 'in_progress' && assignment.status !== 'completed' && assignment.status !== 'pending_review') {
        // This keeps the string status in line with the work being done.
        onUpdateStatus(assignment.id, 'in_progress');
    }
    
    // NOTE: In a complete application, this would call a new API function 
    // to persist the percentage: onUpdatePercentage(assignment.id, value);
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
            <div className="h-40 bg-gray-100 rounded-xl"></div>
            <div className="h-20 bg-gray-100 rounded-xl"></div>
            <div className="h-40 bg-gray-100 rounded-xl"></div>
          </div>
        </div>
      );
    }
    
    const statusProps = getStatusProps(assignment.status);
    const isProgressDisabled = assignment.status === 'completed' || assignment.status === 'pending_review';

    // Show full details
    return (
      <>
        {/* Themed Header & Metadata Group */}
        <div className="flex-shrink-0 p-6 border-b bg-white">
          
          <h3 className="text-3xl font-extrabold text-gray-900">{assignment.title}</h3>

          {/* Consolidated Metadata */}
          <div className="flex flex-wrap items-center gap-4 mt-2">
            {/* Status Badge */}
            <span className={`flex items-center text-xs font-bold gap-1.5 px-3 py-1.5 rounded-full ${statusProps.bg} ${statusProps.color}`}>
              <statusProps.icon size={16} /> {statusProps.label}
            </span>
            
            {/* Due Date */}
            <p className="text-sm font-medium text-gray-600 flex items-center gap-1">
                <Calendar size={14} className='text-gray-400' />
                Due: <span className="font-bold text-[#FF5722]">{formatDate(assignment.due_date)}</span>
            </p>

            {/* Category */}
            <p className="text-sm font-medium text-gray-600 hidden sm:block">
                Category: <span className="font-medium text-gray-700">{assignment.category}</span>
            </p>
          </div>
        </div>
        
        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-gray-50">
          
          {/* --- 1. Primary Action Group (Progress & Review Submission) --- */}
          <div className="space-y-4">
              {/* Progress Tracker Card */}
              <div className="p-4 bg-white rounded-xl border border-gray-200 shadow-sm">
                <h4 className="text-lg font-bold text-gray-800 flex items-center gap-2 mb-3"><Clock size={18} className="text-[#FF5722]" /> Progress Tracker</h4>
                
                {/* Progress Selector */}
                <label htmlFor="completion-select" className="text-sm font-semibold text-gray-700 block mb-2">Completion Value (1-10)</label>
                <div className="flex items-center gap-4">
                  <select
                    id="completion-select"
                    value={completionValue}
                    onChange={(e) => handleUpdateCompletion(parseInt(e.target.value))}
                    className="flex-1 px-3 py-2 rounded-lg border border-gray-300 shadow-sm focus:border-[#FF5722] focus:ring focus:ring-[#FF5722]/50"
                    disabled={isProgressDisabled}
                  >
                    {[...Array(10)].map((_, i) => (
                      <option key={i + 1} value={i + 1}>{i + 1} ({i * 10 + 10}%)</option>
                    ))}
                  </select>
                  
                  {/* Submit for Review Button */}
                  <button
                    onClick={() => onUpdateStatus(assignment.id, 'pending_review')}
                    disabled={isProgressDisabled}
                    className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors shadow-md disabled:bg-gray-400"
                  >
                    <CheckCircle size={18} /> Submit for Review
                  </button>
                </div>
                
                {/* Status messages */}
                {assignment.status === 'pending_review' && (
                  <p className="text-xs text-purple-600 mt-2">The task is currently awaiting final approval from the admin.</p>
                )}
                {assignment.status === 'completed' && (
                    <p className="text-xs text-green-600 mt-2">This task is complete and finalized.</p>
                )}
                
              </div>
              
              {/* Deliverables (Your Uploads) Card */}
              <div className="p-4 bg-white rounded-xl border border-gray-200 shadow-sm">
                <h4 className="text-lg font-bold text-gray-800 flex items-center gap-2 mb-3"><UploadCloud size={18} className="text-[#FF5722]" /> Submit Deliverables</h4>
                <div className="mt-2 p-6 border-2 border-dashed border-gray-300 rounded-xl text-center bg-gray-50">
                  <UploadCloud size={32} className="mx-auto text-gray-400 mb-2" />
                  <p className="text-sm text-gray-600">Drag and drop files here, or <span className="text-[#FF5722] font-semibold cursor-pointer">browse</span>.</p>
                  <p className="text-xs text-gray-500 mt-1">File upload not implemented yet.</p>
                </div>
              </div>
          </div>
          
          {/* --- 2. Description Card --- */}
          <div className="p-4 bg-white rounded-xl border border-gray-200 shadow-sm">
            <h4 className="text-lg font-bold text-gray-800 flex items-center gap-2 mb-3"><AlignLeft size={18} className="text-[#FF5722]" /> Assignment Description</h4>
            <div className="text-sm text-gray-700 mt-2 p-3 bg-gray-50 rounded-lg whitespace-pre-wrap border border-gray-100">
                {assignment.description}
            </div>
          </div>
          
          {/* --- 3. Attachments from Admin Card --- */}
          {assignment.attachments?.length > 0 && (
            <div className="p-4 bg-white rounded-xl border border-gray-200 shadow-sm">
              <h4 className="text-lg font-bold text-gray-800 flex items-center gap-2 mb-3"><Paperclip size={18} className="text-[#FF5722]" /> Admin Attachments (Reference Files)</h4>
              <div className="space-y-2">
                {assignment.attachments.map(file => (
                  <a key={file.file_name} href={file.file_url} target="_blank" rel="noopener noreferrer" className="p-3 bg-gray-50 rounded-lg flex items-center gap-3 text-sm text-blue-600 hover:bg-blue-100 transition-colors shadow-sm border border-gray-200">
                    <FileText size={18} className="text-blue-500 flex-shrink-0" /> 
                    <span className="truncate font-medium">{file.file_name}</span>
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* --- 4. Comments/Activity Card --- */}
          <div className="p-4 bg-white rounded-xl border border-gray-200 shadow-sm">
            <h4 className="text-lg font-bold text-gray-800 flex items-center gap-2 mb-4"><List size={18} className="text-[#FF5722]" /> Activity Feed</h4>
            <div className="space-y-4">
              
              {/* Comment List */}
              {assignment.comments?.length === 0 ? (
                <p className="text-sm text-gray-500 text-center py-4">No comments yet. Start the conversation!</p>
              ) : (
                assignment.comments.slice().reverse().map(comment => (
                  <div key={comment.id} className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl shadow-sm border border-gray-100">
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

              {/* New Comment Form (Cleaned up) */}
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
          {/* Close Button (positioned outside the main header) */}
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