// @ts-nocheck
// src/pages/employee/EmployeeAssignmentPanel.tsx
// NOTE: This is the new V2 version
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Loader2,
  Send,
  Paperclip,
  User,
  AlertTriangle,
  CheckCircle,
  FileText,
  Clock,
  Eye,
  List,
  MessageCircle,
  UploadCloud,
  Check,
  RefreshCw,
  FileUp,
} from 'lucide-react';
import { FullAssignment, AssignmentStatus } from '../../lib/supabase/operations';

interface EmployeeAssignmentPanelV2Props {
  assignment: FullAssignment | null;
  onClose: () => void;
  onUpdateStatus: (assignmentId: string, newStatus: AssignmentStatus, payload?: object) => void;
  onPostComment: (comment: string) => void;
  onUpdateMilestone: (milestoneId: string, newStatus: string) => void;
  onUpdateProgress: (progress: number) => void;
  onUploadDeliverable: (file: File, label: string) => void;
  getSignedUrl: (bucket: 'deliverables' | 'briefs', filePath: string) => Promise<string>;
  isLoading: boolean;
}

const formatDate = (dateString: string | null) => {
  if (!dateString) return 'N/A';
  return new Date(dateString).toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const getStatusPill = (status: AssignmentStatus) => {
  switch (status) {
    case 'Draft': return 'bg-gray-100 text-gray-600';
    case 'Assigned': return 'bg-blue-100 text-blue-700';
    case 'In_Progress': return 'bg-yellow-100 text-yellow-700';
    case 'Submitted': return 'bg-purple-100 text-purple-700';
    case 'Changes_Requested': return 'bg-red-100 text-red-700';
    case 'Approved': return 'bg-green-100 text-green-700';
    case 'Closed': return 'bg-gray-100 text-gray-600';
    case 'Cancelled': return 'bg-red-100 text-red-700';
    default: return 'bg-gray-100 text-gray-600';
  }
};

const TABS = [
  { name: 'Overview', icon: List },
  { name: 'Deliverables', icon: FileText },
  { name: 'Comments', icon: MessageCircle },
];

const EmployeeAssignmentPanelV2: React.FC<EmployeeAssignmentPanelV2Props> = ({
  assignment,
  onClose,
  onUpdateStatus,
  onPostComment,
  onUpdateMilestone,
  onUpdateProgress,
  onUploadDeliverable,
  getSignedUrl,
  isLoading,
}) => {
  const [comment, setComment] = useState('');
  const [activeTab, setActiveTab] = useState('Overview');
  
  const [deliverableFile, setDeliverableFile] = useState<File | null>(null);
  const [deliverableLabel, setDeliverableLabel] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);

  // Reset tab when assignment changes
  useEffect(() => {
    if (assignment) {
      setActiveTab('Overview');
      setDeliverableFile(null);
      setDeliverableLabel('');
    }
  }, [assignment]);

  const handleCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (comment.trim()) {
      onPostComment(comment);
      setComment('');
    }
  };
  
  const handleMilestoneToggle = (milestone: Milestone) => {
    const newStatus = milestone.status === 'Done' ? 'In_Progress' : 'Done';
    onUpdateMilestone(milestone.id, newStatus);
  };
  
  const handleStartWork = () => {
    onUpdateStatus(assignment.id, 'In_Progress');
  };
  
  const handleSubmitForReview = () => {
    if (window.confirm('Are you sure you want to submit all deliverables for review?')) {
      onUpdateStatus(assignment.id, 'Submitted');
    }
  };

  const handleViewFile = async (bucket: 'briefs' | 'deliverables', path: string) => {
    try {
      const url = await getSignedUrl(bucket, path);
      window.open(url, '_blank');
    } catch (error) {
      console.error('Error getting signed URL', error);
    }
  };
  
  const handleUpload = async () => {
    if (!deliverableFile || !deliverableLabel.trim()) {
      alert('Please provide a label and select a file.');
      return;
    }
    setIsUploading(true);
    await onUploadDeliverable(deliverableFile, deliverableLabel);
    setDeliverableFile(null);
    setDeliverableLabel('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    setIsUploading(false);
  };

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex items-center justify-center h-full">
          <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
        </div>
      );
    }
    if (!assignment) return null;

    switch (activeTab) {
      case 'Overview':
        return (
          <div className="space-y-4">
            {assignment.status === 'Changes_Requested' && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <h4 className="font-semibold text-red-700 flex items-center gap-2"><AlertTriangle size={16} /> Changes Requested</h4>
                <p className="text-sm text-red-600 mt-1">
                  Your admin requested changes. Please see the comments and upload new deliverables.
                </p>
              </div>
            )}
            
            <h3 className="text-lg font-semibold text-gray-900">Task Overview</h3>
            <p className="text-sm text-gray-600 whitespace-pre-wrap">{assignment.description || 'No description provided.'}</p>
            
            {assignment.brief_url && (
              <button
                onClick={() => handleViewFile('briefs', assignment.brief_url.split('/briefs/')[1])}
                className="inline-flex items-center gap-2 text-sm font-medium text-blue-600 hover:underline"
              >
                <Paperclip size={14} />
                View Attached Brief
              </button>
            )}
            
            <h3 className="text-lg font-semibold text-gray-900 mt-4">Acceptance Criteria</h3>
            <p className="text-sm text-gray-600 whitespace-pre-wrap">{assignment.acceptance_criteria || 'No criteria listed.'}</p>
            
            <h3 className="text-lg font-semibold text-gray-900 mt-4">My Milestones</h3>
            <div className="space-y-2">
              {assignment.milestones.length === 0 ? (
                 <p className="text-sm text-gray-500">No milestones for this task.</p>
              ) : (
                assignment.milestones.map(m => (
                  <button 
                    key={m.id} 
                    onClick={() => handleMilestoneToggle(m)}
                    className="w-full flex items-center gap-3 p-3 bg-gray-50 rounded-lg border hover:bg-gray-100"
                  >
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center border-2 ${m.status === 'Done' ? 'bg-[#FF5722] border-[#FF5722]' : 'border-gray-300'}`}>
                      {m.status === 'Done' && <Check size={12} className="text-white" />}
                    </div>
                    <span className={`flex-1 text-sm text-left ${m.status === 'Done' ? 'text-gray-500 line-through' : 'text-gray-800'}`}>
                      {m.title}
                    </span>
                  </button>
                ))
              )}
            </div>
          </div>
        );
      case 'Deliverables':
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900">Upload Deliverables</h3>
            <div className="space-y-3 p-4 border border-gray-200 rounded-lg bg-gray-50">
              <div>
                <label className="block text-sm font-medium text-gray-700">File Label *</label>
                <input
                  type="text"
                  value={deliverableLabel}
                  onChange={(e) => setDeliverableLabel(e.target.value)}
                  placeholder="e.g., Social Post v1"
                  className="mt-1 w-full p-2 border rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">File *</label>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={(e) => setDeliverableFile(e.target.files ? e.target.files[0] : null)}
                  className="mt-1 w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-[#FF5722]/10 file:text-[#FF5722] hover:file:bg-[#FF5722]/20"
                />
              </div>
              <button
                onClick={handleUpload}
                disabled={isUploading || !deliverableFile || !deliverableLabel}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {isUploading ? <Loader2 size={16} className="animate-spin" /> : <FileUp size={16} />}
                {isUploading ? 'Uploading...' : 'Upload Deliverable'}
              </button>
            </div>
            
            <h3 className="text-lg font-semibold text-gray-900">Uploaded Files</h3>
            {assignment.deliverables.length === 0 ? (
              <p className="text-sm text-gray-500">No deliverables uploaded yet.</p>
            ) : (
              <div className="space-y-3">
                {assignment.deliverables.map(d => (
                  <div key={d.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border">
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-gray-800 truncate">{d.label} (v{d.file_version})</p>
                      <p className="text-xs text-gray-500">Uploaded {formatDate(d.created_at)}</p>
                    </div>
                    <button
                      onClick={() => handleViewFile('deliverables', d.file_path)}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-white border border-gray-300 hover:bg-gray-100"
                    >
                      <Eye size={14} /> View
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      case 'Comments':
        return (
          <div className="flex flex-col h-full">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Comments</h3>
            <div className="flex-1 space-y-4 overflow-y-auto pr-2">
              {assignment.comments.map(c => (
                <div key={c.id} className="flex items-start gap-3">
                  <span className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden flex-shrink-0">
                    {c.author?.avatar_url ? (
                      <img src={c.author.avatar_url} alt="avatar" className="w-full h-full object-cover" />
                    ) : (
                      <User size={16} className="text-gray-500" />
                    )}
                  </span>
                  <div className="flex-1 p-3 bg-gray-50 rounded-lg">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-semibold text-gray-800">{c.author?.first_name} {c.author?.last_name}</span>
                      <span className="text-xs text-gray-400">{formatDate(c.created_at)}</span>
                    </div>
                    <p className="text-sm text-gray-600 mt-1 whitespace-pre-wrap">{c.body}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <AnimatePresence>
      {assignment && (
        <div className="fixed inset-0 z-40 flex justify-end">
          <motion.div
            className="absolute inset-0 bg-black/50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            className="relative w-full max-w-xl h-full bg-white shadow-xl flex flex-col"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          >
            {/* Header */}
            <div className="flex-shrink-0 p-4 border-b">
              <div className="flex justify-between items-center mb-2">
                <h2 className="text-xl font-bold text-gray-900 truncate pr-10">{assignment.title}</h2>
                <button onClick={onClose} className="p-2 rounded-full text-gray-500 hover:bg-gray-100 absolute top-3 right-3">
                  <X size={20} />
                </button>
              </div>
              <div className="flex items-center gap-2">
                <span className={`px-3 py-1 text-sm font-semibold capitalize rounded-full ${getStatusPill(assignment.status)}`}>
                  {assignment.status.replace("_", " ")}
                </span>
                <span className="text-sm text-gray-500">Due: {formatDate(assignment.due_date)}</span>
              </div>
            </div>

            {/* Tabs */}
            <div className="flex-shrink-0 p-2 border-b">
              <nav className="flex space-x-2">
                {TABS.map(tab => (
                  <button
                    key={tab.name}
                    onClick={() => setActiveTab(tab.name)}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-md text-sm font-medium ${
                      activeTab === tab.name
                        ? 'bg-gray-100 text-gray-800'
                        : 'text-gray-500 hover:bg-gray-50 hover:text-gray-700'
                    }`}
                  >
                    <tab.icon size={16} />
                    {tab.name}
                  </button>
                ))}
              </nav>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6">
              {renderContent()}
            </div>

            {/* Footer / Actions */}
            <div className="flex-shrink-0 p-4 border-t bg-gray-50 space-y-4">
              {/* Employee Actions */}
              {assignment.status === 'Assigned' && (
                <button
                  onClick={handleStartWork}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-yellow-500 text-white font-semibold rounded-lg hover:bg-yellow-600"
                >
                  <Clock size={16} />
                  Start Work
                </button>
              )}
              
              {(assignment.status === 'In_Progress' || assignment.status === 'Changes_Requested') && (
                <button
                  onClick={handleSubmitForReview}
                  disabled={assignment.deliverables.length === 0}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-purple-600 text-white font-semibold rounded-lg hover:bg-purple-700 disabled:opacity-50"
                >
                  <CheckCircle size={16} />
                  Submit for Review
                </button>
              )}
              
              {assignment.status === 'Submitted' && (
                 <div className="w-full text-center px-4 py-2 bg-purple-100 text-purple-700 font-medium rounded-lg">
                  Waiting for Admin review...
                </div>
              )}
              
              {assignment.status === 'Approved' && (
                 <div className="w-full text-center px-4 py-2 bg-green-100 text-green-700 font-medium rounded-lg">
                  🎉 This task has been approved!
                </div>
              )}


              {/* Comment Box */}
              {activeTab !== 'Comments' && (
                <form onSubmit={handleCommentSubmit} className="flex gap-2">
                  <input
                    type="text"
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Add a comment or ask a question..."
                    className="flex-1 w-full p-2 border rounded-md"
                  />
                  <button
                    type="submit"
                    disabled={!comment.trim()}
                    className="p-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-7Git00 disabled:opacity-50"
                  >
                    <Send size={16} />
                  </button>
                </form>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default EmployeeAssignmentPanelV2;