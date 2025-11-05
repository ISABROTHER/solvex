// @ts-nocheck
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../features/auth/AuthProvider';
import { supabase } from '../../lib/supabase/client';
import {
  getAssignmentsForEmployee,
  getFullAssignmentDetails,
  getEmployeeDocuments,
  createDocumentSignedUrl,
  updateAssignmentStatus,
  postAssignmentComment,
  EmployeeDocument
} from '../../lib/supabase/operations';
import { Loader2, List, FileText, CheckCircle, Clock, Send, Eye, Download, AlertCircle, Inbox } from 'lucide-react';
import { useToast } from '../../contexts/ToastContext';
import EmployeeAssignmentPanel from './EmployeeAssignmentPanel';

// Helper to format date
const formatDate = (dateString: string | null) => {
  if (!dateString) return 'N/A';
  return new Date(dateString).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
};

// --- PDF Viewer (Copied from Admin Dashboard) ---
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

const PdfViewerModal: React.FC<{ pdfUrl: string; title: string; onClose: () => void }> = ({ pdfUrl, title, onClose }) => (
  <AnimatePresence>
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" aria-labelledby="pdf-title" role="dialog" aria-modal="true">
      <motion.div
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="relative w-full max-w-4xl h-[90vh] bg-gray-800 rounded-lg shadow-2xl flex flex-col"
      >
        <div className="flex-shrink-0 p-3 flex justify-between items-center border-b border-gray-700">
          <h3 id="pdf-title" className="text-white font-semibold truncate pl-2">{title}</h3>
          <button onClick={onClose} className="p-2 rounded-full text-gray-400 hover:bg-gray-700 hover:text-white" aria-label="Close document viewer">
            <X size={20} />
          </button>
        </div>
        <div className="flex-1 p-2">
           <iframe 
            src={`https://docs.google.com/gview?url=${encodeURIComponent(pdfUrl)}&embedded=true`} 
            className="w-full h-full border-0 rounded-b-lg" 
            title="PDF Viewer" 
          />
        </div>
      </motion.div>
    </div>
  </AnimatePresence>
);

// --- Main Employee Dashboard Page ---
const EmployeeDashboardPage: React.FC = () => {
  const { user, profile } = useAuth();
  const { addToast } = useToast();

  const [assignments, setAssignments] = useState<any[]>([]);
  const [documents, setDocuments] = useState<EmployeeDocument[]>([]);
  const [selectedAssignment, setSelectedAssignment] = useState<any | null>(null);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [viewingPdf, setViewingPdf] = useState<string | null>(null);
  const [viewingPdfTitle, setViewingPdfTitle] = useState<string>('');

  useEffect(() => {
    if (!user) return;

    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const [assignmentResult, documentResult] = await Promise.all([
          getAssignmentsForEmployee(user.id),
          getEmployeeDocuments(user.id)
        ]);

        if (assignmentResult.error) throw assignmentResult.error;
        if (documentResult.error) throw documentResult.error;

        setAssignments(assignmentResult.data || []);
        setDocuments(documentResult.data || []);

      } catch (err: any) {
        setError(err.message || 'Failed to fetch data.');
        addToast({ type: 'error', title: 'Loading Failed', message: err.message });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    
    // Set up Realtime listener for assignments
    const channel = supabase
      .channel(`employee_assignments:${user.id}`)
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'assignment_members', filter: `employee_id=eq.${user.id}` },
        fetchData
      )
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'assignment_messages' },
        (payload) => {
          // If a message comes in for the currently selected assignment, refresh it
          if (selectedAssignment && payload.new.assignment_id === selectedAssignment.id) {
            handleAssignmentClick(selectedAssignment.id);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };

  }, [user, addToast, selectedAssignment]);

  const handleAssignmentClick = async (assignmentId: string) => {
    if (selectedAssignment?.id === assignmentId) {
      setSelectedAssignment(null); // Toggle off
      return;
    }
    
    // Show loading skeleton in panel
    setSelectedAssignment({ id: assignmentId, loading: true }); 
    try {
      const { data, error } = await getFullAssignmentDetails(assignmentId);
      if (error) throw error;
      setSelectedAssignment(data);
    } catch (err: any) {
      addToast({ type: 'error', title: 'Error', message: 'Could not load assignment details.' });
      setSelectedAssignment(null);
    }
  };

  const handleUpdateStatus = async (assignmentId: string, status: string) => {
    // Optimistic update
    setAssignments(prev => 
      prev.map(a => a.id === assignmentId ? { ...a, status: status } : a)
    );
    if (selectedAssignment?.id === assignmentId) {
      setSelectedAssignment(prev => prev ? { ...prev, status: status } : null);
    }
    
    const { error } = await updateAssignmentStatus(assignmentId, status);
    if (error) {
      addToast({ type: 'error', title: 'Update Failed', message: error.message });
      // Revert (or just wait for realtime to refetch)
    } else {
      addToast({ type: 'success', title: 'Status Updated!' });
    }
  };

  const handlePostComment = async (assignmentId: string, content: string) => {
    if (!user) return;
    const { error } = await postAssignmentComment(assignmentId, user.id, content);
    if (error) {
      addToast({ type: 'error', title: 'Comment Failed', message: error.message });
    }
    // No success toast, realtime will handle the refresh
  };

  const handleViewDocument = async (doc: EmployeeDocument) => {
    setViewingPdf(null); // Show loading
    setViewingPdfTitle(doc.document_name);
    try {
      // Use a secure, expiring signed URL
      const url = await createDocumentSignedUrl(doc);
      setViewingPdf(url);
    } catch (err: any) {
      addToast({ type: 'error', title: 'Could not load document' });
      setViewingPdfTitle('');
    }
  };
  
  const getStatusProps = (status: string) => {
    switch (status) {
      case 'completed': return { icon: CheckCircle, color: 'text-green-500', label: 'Completed' };
      case 'in_progress': return { icon: Clock, color: 'text-blue-500', label: 'In Progress' };
      case 'overdue': return { icon: AlertCircle, color: 'text-red-500', label: 'Overdue' };
      default: return { icon: List, color: 'text-yellow-500', label: status };
    }
  };

  if (loading) {
    return <div className="flex h-screen items-center justify-center"><Loader2 className="w-12 h-12 animate-spin text-[#FF5722]" /></div>;
  }
  
  if (error) {
    return <div className="flex h-screen items-center justify-center text-red-500">{error}</div>;
  }

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-6 md:p-10">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900">Welcome, {profile?.first_name || 'Employee'}</h1>
          <p className="text-gray-600 mt-1">Here's what's on your plate. Let's get to work.</p>

          {/* Assignments Section */}
          <section className="mt-8">
            <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
              <List className="text-gray-500" /> My Assignments
            </h2>
            {assignments.length === 0 ? (
               <div className="text-center p-10 bg-white rounded-lg shadow-sm mt-4">
                  <Inbox size={48} className="mx-auto text-gray-300" />
                  <h3 className="mt-4 font-semibold text-gray-700">All caught up!</h3>
                  <p className="text-sm text-gray-500">You have no active assignments.</p>
                </div>
            ) : (
              <div className="mt-4 space-y-3">
                {assignments.map(assignment => {
                  const { icon: Icon, color, label } = getStatusProps(assignment.status);
                  return (
                    <button
                      key={assignment.id}
                      onClick={() => handleAssignmentClick(assignment.id)}
                      className={`w-full p-4 bg-white rounded-lg shadow-sm text-left transition-all ${
                        selectedAssignment?.id === assignment.id ? 'ring-2 ring-[#FF5722]' : 'hover:shadow-md'
                      }`}
                    >
                      <div className="flex justify-between items-center">
                        <span className="font-semibold text-gray-800">{assignment.title}</span>
                        <span className={`flex items-center text-xs font-medium gap-1.5 ${color}`}>
                          <Icon size={14} /> {label}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500 mt-1">Due: {formatDate(assignment.due_date)}</p>
                    </button>
                  );
                })}
              </div>
            )}
          </section>

          {/* Documents Section */}
          <section className="mt-8">
            <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
              <FileText className="text-gray-500" /> My Documents
            </h2>
            {documents.length === 0 ? (
               <div className="text-center p-10 bg-white rounded-lg shadow-sm mt-4">
                  <FileText size={48} className="mx-auto text-gray-300" />
                  <h3 className="mt-4 font-semibold text-gray-700">No Documents</h3>
                  <p className="text-sm text-gray-500">Your admin hasn't uploaded any documents for you yet.</p>
                </div>
            ) : (
              <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
                {documents.map(doc => (
                  <div key={doc.id} className="p-4 bg-white rounded-lg shadow-sm flex justify-between items-center">
                    <div>
                      <p className="font-semibold text-gray-800">{doc.document_name}</p>
                      {doc.requires_signing && !doc.signed_at && (
                        <span className="text-xs text-yellow-600 font-medium">Pending Signature</span>
                      )}
                      {doc.signed_at && (
                        <span className="text-xs text-green-600 font-medium">Signed</span>
                      )}
                    </div>
                    <button 
                      onClick={() => handleViewDocument(doc)}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border border-gray-300 hover:bg-gray-100"
                    >
                      <Eye size={14} /> View
                    </button>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      </main>

      {/* Assignment Detail Panel */}
      <EmployeeAssignmentPanel
        assignment={selectedAssignment}
        onClose={() => setSelectedAssignment(null)}
        onPostComment={handlePostComment}
        onUpdateStatus={handleUpdateStatus}
      />
      
      {/* PDF Viewer Modal */}
      <AnimatePresence>
        {viewingPdf && <PdfViewerModal pdfUrl={viewingPdf} title={viewingPdfTitle} onClose={() => setViewingPdf(null)} />}
      </AnimatePresence>
    </div>
  );
};

export default EmployeeDashboardPage;