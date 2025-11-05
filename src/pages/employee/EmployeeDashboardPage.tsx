// @ts-nocheck
import React, { useState, useEffect, useMemo } from 'react';
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
import {
  Loader2, List, FileText, CheckCircle, Clock, Eye, Download, AlertCircle, Inbox, User as UserIcon,
  Mail, Phone, MapPin, Calendar, Briefcase, Hash, Edit2, FileSignature, AlertTriangle, ChevronDown
} from 'lucide-react';
import { useToast } from '../../contexts/ToastContext';
import EmployeeAssignmentPanel from './EmployeeAssignmentPanel';

// Motion
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

// Helper to format date
const formatDate = (dateString: string | null) => {
  if (!dateString) return 'N/A';
  return new Date(dateString).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
};

const getInitials = (first?: string, last?: string) => {
  const a = (first || '').trim()[0] || '';
  const b = (last || '').trim()[0] || '';
  return (a + b || 'E').toUpperCase();
};

const Avatar = ({ src, first, last, size = 80 }: { src?: string; first?: string; last?: string; size?: number }) => {
  if (src) {
    return (
      <img
        src={src}
        alt="Profile"
        className="rounded-full object-cover ring-2 ring-white shadow-lg"
        style={{ width: size, height: size }}
      />
    );
  }
  return (
    <div
      className="rounded-full bg-white/30 text-white font-semibold grid place-items-center ring-2 ring-white shadow-lg"
      style={{ width: size, height: size }}
    >
      {getInitials(first, last)}
    </div>
  );
};

// --- PDF Viewer (Copied from Admin Dashboard) ---
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
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.96 }}
        className="relative w-full max-w-4xl h-[90vh] bg-gray-900 rounded-2xl shadow-2xl flex flex-col ring-1 ring-white/10"
      >
        <div className="flex-shrink-0 p-3 flex justify-between items-center border-b border-white/10">
          <h3 id="pdf-title" className="text-white font-semibold truncate pl-2">{title}</h3>
          <button onClick={onClose} className="p-2 rounded-full text-gray-300 hover:bg-white/10 hover:text-white" aria-label="Close document viewer">
            <X size={20} />
          </button>
        </div>
        <div className="flex-1 p-2">
           <iframe 
            src={`https://docs.google.com/gview?url=${encodeURIComponent(pdfUrl)}&embedded=true`} 
            className="w-full h-full border-0 rounded-b-2xl" 
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
  const [profileOpen, setProfileOpen] = useState(true); // dropdown open by default

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

    // Realtime listener for assignments and messages
    const channel = supabase
      .channel(`employee_assignments:${user.id}`)
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'assignment_members', filter: `employee_id=eq.${user.id}` },
        async () => {
          const result = await getAssignmentsForEmployee(user.id);
          if (!result.error) setAssignments(result.data || []);
        }
      )
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'assignment_messages' },
        (payload) => {
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
    setAssignments(prev => prev.map(a => a.id === assignmentId ? { ...a, status } : a));
    if (selectedAssignment?.id === assignmentId) {
      setSelectedAssignment(prev => prev ? { ...prev, status } : null);
    }
    const { error } = await updateAssignmentStatus(assignmentId, status);
    if (error) addToast({ type: 'error', title: 'Update Failed', message: error.message });
    else addToast({ type: 'success', title: 'Status Updated!' });
  };

  const handlePostComment = async (assignmentId: string, content: string) => {
    if (!user) return;
    const { error } = await postAssignmentComment(assignmentId, user.id, content);
    if (error) addToast({ type: 'error', title: 'Comment Failed', message: error.message });
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
      const filePath = `${user.id}/signed_${signedFile.name}`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('employee_documents')
        .upload(filePath, signedFile, { cacheControl: '3600', upsert: true });

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from('employee_documents')
        .getPublicUrl(uploadData.path);

      const { error: updateError } = await supabase
        .from('employee_documents')
        .update({
          signed_storage_url: urlData.publicUrl,
          signed_at: new Date().toISOString(),
        })
        .eq('id', doc.id);

      if (updateError) throw updateError;

      addToast({ type: 'success', title: 'Document Signed!', message: 'Your signed document has been uploaded.' });

      const result = await getEmployeeDocuments(user.id);
      if (!result.error) setDocuments(result.data || []);
    } catch (err: any) {
      addToast({ type: 'error', title: 'Signing Failed', message: err.message });
    }
  };

  const getStatusProps = (status: string) => {
    switch (status) {
      case 'completed': return { icon: CheckCircle, color: 'text-green-600', label: 'Completed' };
      case 'in_progress': return { icon: Clock, color: 'text-blue-600', label: 'In Progress' };
      case 'overdue': return { icon: AlertCircle, color: 'text-red-600', label: 'Overdue' };
      default: return { icon: List, color: 'text-amber-600', label: status };
    }
  };

  // Stats for profile section
  const stats = useMemo(() => {
    const total = assignments.length;
    const inProgress = assignments.filter(a => a.status === 'in_progress').length;
    const completed = assignments.filter(a => a.status === 'completed').length;
    const overdue = assignments.filter(a => a.status === 'overdue').length;
    return { total, inProgress, completed, overdue };
  }, [assignments]);

  // Loading skeleton
  const LoadingSkeleton = () => (
    <div className="flex h-screen bg-gradient-to-b from-white to-gray-50">
      <main className="flex-1 overflow-y-auto p-6 md:p-10">
        <div className="max-w-5xl mx-auto space-y-6">
          <div className="h-40 w-full bg-gray-200 rounded-2xl animate-pulse" />
          <div className="h-6 bg-gray-200 rounded w-1/3 animate-pulse" />
          <div className="space-y-3">
            {[1,2,3].map(i=>(
              <div key={i} className="h-24 rounded-xl bg-white shadow-sm border border-gray-100 animate-pulse" />
            ))}
          </div>
        </div>
      </main>
    </div>
  );

  if (loading) return <LoadingSkeleton />;
  if (error) return <div className="flex h-screen items-center justify-center text-red-600 font-medium">{error}</div>;

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
    <div className="flex h-screen bg-gradient-to-b from-white to-gray-50">
      <main className="flex-1 overflow-y-auto">
        {/* Gradient Header with employee photo */}
        <div className="relative">
          <div className="h-40 bg-gradient-to-r from-[#FF5722] via-orange-500 to-amber-400" />
          <div className="max-w-5xl mx-auto px-6">
            <div className="relative -mt-10 flex items-end justify-between">
              <div className="text-white drop-shadow-sm">
                <h1 className="text-xl md:text-2xl font-semibold">
                  Welcome, {profile?.first_name || 'Employee'}
                </h1>
                <p className="text-white/90 text-xs md:text-sm">Here’s what’s on your plate. Let’s get to work.</p>
              </div>
              <div className="translate-y-6">
                <Avatar
                  src={profile?.avatar_url}
                  first={profile?.first_name}
                  last={profile?.last_name}
                  size={80}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Page Content */}
        <div className="max-w-5xl mx-auto px-6 pb-10 space-y-8 mt-10">
          {/* Profile Section (collapsible) */}
          <section className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            {/* Header / Toggle */}
            <button
              className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50"
              onClick={() => setProfileOpen(v => !v)}
              aria-expanded={profileOpen}
            >
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-full bg-gray-100 grid place-items-center">
                  <UserIcon className="h-5 w-5 text-gray-500" />
                </div>
                <div className="text-left">
                  <p className="text-sm text-gray-500">Profile</p>
                  <p className="text-base font-semibold text-gray-900">{profile?.first_name} {profile?.last_name}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                {!isEditingProfile && (
                  <button
                    onClick={(e) => { e.stopPropagation(); handleEditProfile(); }}
                    className="flex items-center gap-2 px-3 py-1.5 text-xs font-semibold rounded-lg border border-gray-300 hover:bg-gray-50"
                  >
                    <Edit2 size={14} /> Edit
                  </button>
                )}
                <ChevronDown
                  className={`h-5 w-5 text-gray-500 transition-transform ${profileOpen ? 'rotate-180' : ''}`}
                />
              </div>
            </button>

            {/* Dropdown content */}
            <AnimatePresence initial={false}>
              {profileOpen && (
                <motion.div
                  key="profile-content"
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ type: 'tween', duration: 0.2 }}
                  className="px-6 pb-6"
                >
                  {/* If editing form */}
                  {isEditingProfile ? (
                    <div className="space-y-4 pt-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm font-medium text-gray-700">First Name</label>
                          <input
                            type="text"
                            value={profileForm.first_name}
                            onChange={(e) => setProfileForm({ ...profileForm, first_name: e.target.value })}
                            className="mt-1 w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#FF5722]/40"
                          />
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-700">Last Name</label>
                          <input
                            type="text"
                            value={profileForm.last_name}
                            onChange={(e) => setProfileForm({ ...profileForm, last_name: e.target.value })}
                            className="mt-1 w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#FF5722]/40"
                          />
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-700">Phone</label>
                          <input
                            type="text"
                            value={profileForm.phone}
                            onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                            className="mt-1 w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#FF5722]/40"
                          />
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-700">Home Address</label>
                          <input
                            type="text"
                            value={profileForm.home_address}
                            onChange={(e) => setProfileForm({ ...profileForm, home_address: e.target.value })}
                            className="mt-1 w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#FF5722]/40"
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
                    <>
                      {/* Profile stats inside dropdown */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-4">
                        <div className="rounded-xl border border-gray-200 p-4 bg-white/80">
                          <p className="text-xs text-gray-500">Total</p>
                          <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                        </div>
                        <div className="rounded-xl border border-gray-200 p-4 bg-white/80">
                          <p className="text-xs text-gray-500">In Progress</p>
                          <p className="text-2xl font-bold text-gray-900">{stats.inProgress}</p>
                        </div>
                        <div className="rounded-xl border border-gray-200 p-4 bg-white/80">
                          <p className="text-xs text-gray-500">Completed</p>
                          <p className="text-2xl font-bold text-gray-900">{stats.completed}</p>
                        </div>
                        <div className="rounded-xl border border-gray-200 p-4 bg-white/80">
                          <p className="text-xs text-gray-500">Overdue</p>
                          <p className="text-2xl font-bold text-gray-900">{stats.overdue}</p>
                        </div>
                      </div>

                      {/* Info blocks */}
                      <div className="mt-6">
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
                    </>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </section>

          {/* Assignments Section */}
          <section>
            <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
              <List className="text-gray-500" /> My Assignments
            </h2>
            {assignments.length === 0 ? (
               <div className="text-center p-10 bg-white rounded-2xl shadow-sm mt-4 border border-dashed border-gray-300">
                  <Inbox size={48} className="mx-auto text-gray-300" />
                  <h3 className="mt-4 font-semibold text-gray-800">All caught up!</h3>
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
                      className={`w-full p-4 bg-white rounded-2xl border border-gray-200 shadow-sm text-left transition-all ${
                        selectedAssignment?.id === assignment.id ? 'ring-2 ring-[#FF5722]' : 'hover:shadow-md hover:-translate-y-0.5'
                      }`}
                    >
                      <div className="flex justify-between items-center">
                        <span className="font-semibold text-gray-900">{assignment.title}</span>
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
          <section className="mt-8 pb-10">
            <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
              <FileText className="text-gray-500" /> My Documents
            </h2>
            {documents.length === 0 ? (
               <div className="text-center p-10 bg-white rounded-2xl shadow-sm mt-4 border border-dashed border-gray-300">
                  <FileText size={48} className="mx-auto text-gray-300" />
                  <h3 className="mt-4 font-semibold text-gray-800">No Documents</h3>
                  <p className="text-sm text-gray-500">Your admin hasn't uploaded any documents for you yet.</p>
                </div>
            ) : (
              <div className="mt-4 space-y-3">
                {documents.map(doc => {
                  const needsSignature = doc.requires_signing && !doc.signed_at;
                  return (
                    <div key={doc.id} className={`p-4 bg-white rounded-2xl shadow-sm border ${
                      needsSignature ? 'border-amber-300' : 'border-gray-200'
                    }`}>
                      <div className="flex flex-col sm:flex-row justify-between items-start gap-3">
                        <div className="flex-1">
                          <p className="font-semibold text-gray-900">{doc.document_name}</p>
                          {needsSignature && (
                            <div className="flex items-center gap-1.5 text-xs text-amber-700 font-medium mt-1">
                              <AlertTriangle size={14} /> Pending Signature - Action Required
                            </div>
                          )}
                          {doc.signed_at && (
                            <div className="flex items-center gap-1.5 text-xs text-green-700 font-medium mt-1">
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
