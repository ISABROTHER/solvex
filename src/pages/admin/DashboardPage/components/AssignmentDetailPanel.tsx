// @ts-nocheck
// src/pages/admin/DashboardPage/components/AssignmentDetailPanel.tsx
// NOTE: This is the new V2 version
import React, { useState, useMemo, useEffect } from 'react';
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
  Bell,
  Download,
  Check,
  RefreshCw,
} from 'lucide-react';
import { FullAssignment, AssignmentStatus } from '../../../../lib/supabase/operations';

interface AssignmentDetailPanelV2Props {
  assignment: FullAssignment | null;
  onClose: () => void;
  onUpdateStatus: (assignmentId: string, newStatus: AssignmentStatus, payload?: object) => void;
  onPostComment: (comment: string) => void;
  onUpdateMilestone: (milestoneId: string, newStatus: string) => void;
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
  { name: 'Activity', icon: Bell },
];

const AssignmentDetailPanelV2: React.FC<AssignmentDetailPanelV2Props> = ({
  assignment,
  onClose,
  onUpdateStatus,
  onPostComment,
  onUpdateMilestone,
  getSignedUrl,
  isLoading,
}) => {
  const [comment, setComment] = useState('');
  const [activeTab, setActiveTab] = useState('Overview');
  const [reworkReason, setReworkReason] = useState('');
  const [isRequestingChanges, setIsRequestingChanges] = useState(false);

  // Reset tab when assignment changes
  useEffect(() => {
    if (assignment) {
      setActiveTab('Overview');
      setIsRequestingChanges(false);
      setReworkReason('');
    }
  }, [assignment]);

  const handleCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (comment.trim()) {
      onPostComment(comment);
      setComment('');
    }
  };
  
  const handleRequestChanges = () => {
    if (!reworkReason.trim() || !assignment) return;
    onUpdateStatus(assignment.id, 'Changes_Requested', { reason: reworkReason });
    onPostComment(`Changes Requested: ${reworkReason}`);
    setIsRequestingChanges(false);
    setReworkReason('');
  };
  
  const handleApprove = () => {
    if (!assignment) return;
    onUpdateStatus(assignment.id, 'Approved');
  };

  const handleViewFile = async (bucket: 'briefs' | 'deliverables', path: string) => {
    try {
      const url = await getSignedUrl(bucket, path);
      window.open(url, '_blank');
    } catch (error) {
      console.error('Error getting signed URL', error);
    }
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
            
            <h3 className="text-lg font-semibold text-gray-900 mt-4">Milestones</h3>
            <div className="space-y-2">
              {assignment.milestones.length === 0 ? (
                 <p className="text-sm text-gray-500">No milestones for this task.</p>
              ) : (
                assignment.milestones.map(m => (
                  <div key={m.id} className="flex items-center gap-2 p-2 bg-gray-50 rounded-md">
                    <CheckCircle size={16} className={m.status === 'Done' ? 'text-green-500' : 'text-gray-300'} />
                    <span className={`flex-1 text-sm ${m.status === 'Done' ? 'text-gray-800 line-through' : 'text-gray-800'}`}>
                      {m.title}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        );
      case 'Deliverables':
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Deliverables</h3>
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
      case 'Activity':
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Activity Feed</h3>
            <div className="space-y-3">
              {assignment.events.map(e => (
                <div key={e.id} className="flex items-start gap-3">
                  <span className="text-xs text-gray-400 w-20 flex-shrink-0 mt-1">{formatDate(e.created_at)}</span>
                  <div className="flex-1 text-sm text-gray-600">
                    <span className="font-semibold text-gray-800">{e.actor?.first_name}</span> {e.type === 'StatusChanged' ? `changed status to ${e.payload.newStatus}` : e.type === 'FileUploaded' ? `uploaded ${e.payload.fileName}` : 'made an update.'}
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
              {/* Review Actions */}
              {assignment.status === 'Submitted' && !isRequestingChanges && (
                <div className="flex gap-3">
                  <button
                    onClick={() => setIsRequestingChanges(true)}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-white border border-gray-300 text-red-600 font-semibold rounded-lg hover:bg-red-50"
                  >
                    <RefreshCw size={16} />
                    Request Changes
                  </button>
                  <button
                    onClick={handleApprove}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700"
                  >
                    <Check size={16} />
                    Approve
                  </button>
                </div>
              )}
              
              {isRequestingChanges && (
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Reason for changes:</label>
                  <textarea
                    value={reworkReason}
                    onChange={(e) => setReworkReason(e.target.value)}
                    rows={3}
                    className="w-full p-2 border rounded-md"
                    placeholder="e.g., 'Please fix the contrast on the headline...'"
                  />
                  <div className="flex gap-2">
                    <button onClick={() => setIsRequestingChanges(false)} className="text-sm font-medium text-gray-600">Cancel</button>
                    <button 
                      onClick={handleRequestChanges}
                      disabled={!reworkReason.trim()}
                      className="px-3 py-1.5 bg-red-600 text-white text-sm font-semibold rounded-md disabled:opacity-50"
                    >
                      Submit Request
                    </button>
                  </div>
                </div>
              )}

              {/* Comment Box */}
              {activeTab !== 'Comments' && (
                <form onSubmit={handleCommentSubmit} className="flex gap-2">
                  <input
                    type="text"
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Add a comment..."
                    className="flex-1 w-full p-2 border rounded-md"
                  />
                  <button
                    type="submit"
                    disabled={!comment.trim()}
                    className="p-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
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

export default AssignmentDetailPanelV2;