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
import { Loader2, List, FileText, CheckCircle, Clock, Send, Eye, Download, AlertCircle, Inbox, User as UserIcon, Mail, Phone, MapPin, Calendar, Briefcase, Hash, DollarSign, Building, CreditCard, Edit2, Upload, FileSignature, AlertTriangle } from 'lucide-react';
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
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileForm, setProfileForm] = useState<any>({});

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

    // Set up Realtime listener for assignments - only refresh list on assignment_members changes
    const channel = supabase
      .channel(`employee_assignments:${user.id}`)
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'assignment_members', filter: `employee_id=eq.${user.id}` },
        async () => {
          // Only refresh assignments list, not full refetch
          const result = await getAssignmentsForEmployee(user.id);
          if (!result.error) setAssignments(result.data || []);
        }
      )
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'assignment_messages' },
        (payload) => {
          // If a message comes in for the currently selected assignment, refresh it silently
          if (selectedAssignment && payload.new.assignment_id === selectedAssignment.id) {
            handleAssignmentClick(selectedAssignment.id);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };

  }, [user, addToast]);

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
    setViewingPdf(null);
    setViewingPdfTitle(doc.document_name);
    try {
      const url = await createDocumentSignedUrl(doc);
      setViewingPdf(url);
    } catch (err: any) {
      addToast({ type: 'error', title: 'Could not load document' });
      setViewingPdfTitle('');
    }
  };

  const handleSignDocument = async (doc: EmployeeDocument, signedFile: File) => {
    if (!user) return;
    try {
      // Upload signed document to storage
      const filePath = `${user.id}/signed_${signedFile.name}`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('employee_documents')
        .upload(filePath, signedFile, { cacheControl: '3600', upsert: true });

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from('employee_documents')
        .getPublicUrl(uploadData.path);

      // Update document record
      const { error: updateError } = await supabase
        .from('employee_documents')
        .update({
          signed_storage_url: urlData.publicUrl,
          signed_at: new Date().toISOString(),
        })
        .eq('id', doc.id);

      if (updateError) throw updateError;

      addToast({ type: 'success', title: 'Document Signed!', message: 'Your signed document has been uploaded.' });

      // Refresh documents
      const result = await getEmployeeDocuments(user.id);
      if (!result.error) setDocuments(result.data || []);
    } catch (err: any) {
      addToast({ type: 'error', title: 'Signing Failed', message: err.message });
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

  // Loading skeleton
  const LoadingSkeleton = () => (
    <div className="flex h-screen bg-gray-100">
      <main className="flex-1 overflow-y-auto p-6 md:p-10">
        <div className="max-w-4xl mx-auto">
          <div className="h-8 bg-gray-300 rounded w-1/3 animate-pulse" />
          <div className="h-4 bg-gray-200 rounded w-2/3 mt-2 animate-pulse" />

          <section className="mt-8">
            <div className="h-6 bg-gray-300 rounded w-1/4 animate-pulse" />
            <div className="mt-4 space-y-3">
              {[1, 2, 3].map(i => (
                <div key={i} className="w-full p-4 bg-white rounded-lg shadow-sm">
                  <div className="h-5 bg-gray-300 rounded w-3/4 animate-pulse" />
                  <div className="h-4 bg-gray-200 rounded w-1/2 mt-2 animate-pulse" />
                </div>
              ))}
            </div>
          </section>
        </div>
      </main>
    </div>
  );

  if (loading) {
    return <LoadingSkeleton />;
  }
  
  if (error) {
    return <div className="flex h-screen items-center justify-center text-red-500">{error}</div>;
  }

  const handleEditProfile = () => {
    setProfileForm({
      first_name: profile?.first_name || '',
      last_name: profile?.last_name || '',
      phone: profile?.phone || '',
      home_address: profile?.home_address || '',
    });
    setIsEditingProfile(true);
  };

  const handleSaveProfile = async () => {
    if (!user) return;
    try {
      const { error } = await supabase
        .from('profiles')
        .update(profileForm)
        .eq('id', user.id);

      if (error) throw error;
      addToast({ type: 'success', title: 'Profile Updated!' });
      setIsEditingProfile(false);
      // Refresh will happen via AuthContext
      window.location.reload();
    } catch (err: any) {
      addToast({ type: 'error', title: 'Update Failed', message: err.message });
    }
  };

  const InfoRow = ({ icon: Icon, label, value }: { icon: any; label: string; value: string | null | undefined }) => (
    <div className="flex items-start gap-3">
      <Icon className="w-4 h-4 text-gray-400 flex-shrink-0 mt-1" />
      <div>
        <p className="text-xs text-gray-500">{label}</p>
        <p className="font-medium text-gray-900">{value || 'N/A'}</p>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-6 md:p-10">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Welcome, {profile?.first_name || 'Employee'}</h1>
              <p className="text-gray-600 mt-1">Here's what's on your plate. Let's get to work.</p>
            </div>
          </div>

          {/* Profile Section */}
          <section className="mb-8">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
                  <UserIcon className="text-gray-500" /> My Profile
                </h2>
                {!isEditingProfile && (
                  <button
                    onClick={handleEditProfile}
                    className="flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg border border-gray-300 hover:bg-gray-50"
                  >
                    <Edit2 size={16} /> Edit Profile
                  </button>
                )}
              </div>

              {isEditingProfile ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-700">First Name</label>
                      <input
                        type="text"
                        value={profileForm.first_name}
                        onChange={(e) => setProfileForm({ ...profileForm, first_name: e.target.value })}
                        className="mt-1 w-full px-3 py-2 rounded-lg border border-gray-300"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700">Last Name</label>
                      <input
                        type="text"
                        value={profileForm.last_name}
                        onChange={(e) => setProfileForm({ ...profileForm, last_name: e.target.value })}
                        className="mt-1 w-full px-3 py-2 rounded-lg border border-gray-300"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700">Phone</label>
                      <input
                        type="text"
                        value={profileForm.phone}
                        onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                        className="mt-1 w-full px-3 py-2 rounded-lg border border-gray-300"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700">Home Address</label>
                      <input
                        type="text"
                        value={profileForm.home_address}
                        onChange={(e) => setProfileForm({ ...profileForm, home_address: e.target.value })}
                        className="mt-1 w-full px-3 py-2 rounded-lg border border-gray-300"
                      />
                    </div>
                  </div>
                  <div className="flex gap-2 justify-end">
                    <button
                      onClick={() => setIsEditingProfile(false)}
                      className="px-4 py-2 text-sm font-semibold rounded-lg border border-gray-300 hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSaveProfile}
                      className="px-4 py-2 text-sm font-semibold rounded-lg bg-[#FF5722] text-white hover:bg-[#E64A19]"
                    >
                      Save Changes
                    </button>
                  </div>
                </div>
              ) : (
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 mb-3">Contact Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <InfoRow icon={Mail} label="Email" value={profile?.email} />
                    <InfoRow icon={Phone} label="Phone" value={profile?.phone} />
                    <InfoRow icon={MapPin} label="Address" value={profile?.home_address} />
                    <InfoRow icon={Calendar} label="Birth Date" value={profile?.birth_date ? formatDate(profile.birth_date) : null} />
                  </div>

                  <h3 className="text-sm font-semibold text-gray-700 mb-3 mt-6">Employment Details</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <InfoRow icon={Briefcase} label="Position" value={profile?.position} />
                    <InfoRow icon={Hash} label="Employee #" value={profile?.employee_number} />
                    <InfoRow icon={Calendar} label="Start Date" value={profile?.start_date ? formatDate(profile.start_date) : null} />
                  </div>
                </div>
              )}
            </div>
          </section>

          {/* Assignments Section */}
          <section>
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
              <div className="mt-4 space-y-3">
                {documents.map(doc => {
                  const needsSignature = doc.requires_signing && !doc.signed_at;
                  return (
                    <div key={doc.id} className={`p-4 bg-white rounded-lg shadow-sm border ${
                      needsSignature ? 'border-yellow-300' : 'border-gray-200'
                    }`}>
                      <div className="flex flex-col sm:flex-row justify-between items-start gap-3">
                        <div className="flex-1">
                          <p className="font-semibold text-gray-800">{doc.document_name}</p>
                          {needsSignature && (
                            <div className="flex items-center gap-1.5 text-xs text-yellow-600 font-medium mt-1">
                              <AlertTriangle size={14} /> Pending Signature - Action Required
                            </div>
                          )}
                          {doc.signed_at && (
                            <div className="flex items-center gap-1.5 text-xs text-green-600 font-medium mt-1">
                              <CheckCircle size={14} /> Signed on {formatDate(doc.signed_at)}
                            </div>
                          )}
                          {!doc.requires_signing && (
                            <span className="text-xs text-gray-500 mt-1 block">View Only</span>
                          )}
                        </div>
                        <div className="flex gap-2 flex-wrap">
                          <button
                            onClick={() => handleViewDocument(doc)}
                            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border border-gray-300 hover:bg-gray-100"
                          >
                            <Eye size={14} /> View
                          </button>
                          {needsSignature && (
                            <label className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-[#FF5722] text-white hover:bg-[#E64A19] cursor-pointer">
                              <FileSignature size={14} /> Sign Document
                              <input
                                type="file"
                                accept=".pdf"
                                onChange={(e) => {
                                  const file = e.target.files?.[0];
                                  if (file) handleSignDocument(doc, file);
                                }}
                                className="hidden"
                              />
                            </label>
                          )}
                          {doc.signed_at && doc.signed_storage_url && (
                            <a
                              href={doc.signed_storage_url}
                              download
                              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border border-green-300 text-green-700 bg-green-50 hover:bg-green-100"
                            >
                              <Download size={14} /> Download Signed
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
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