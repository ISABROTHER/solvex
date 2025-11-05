// src/pages/employee/EmployeeDashboardPage.tsx
// @ts-nocheck
import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../../features/auth/AuthProvider';
import { supabase } from '../../lib/supabase/client';
import {
  createDocumentSignedUrl,
  updateAssignmentStatus,
  postAssignmentComment,
  getAssignmentsForEmployee,
  getEmployeeDocuments,
  getFullAssignmentDetails,
  EmployeeDocument
} from '../../lib/supabase/operations';
import {
  Loader2,
  List,
  FileText,
  CheckCircle,
  Clock,
  Send,
  Eye,
  Download,
  AlertCircle,
  Inbox,
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Briefcase,
  Hash,
  DollarSign,
  Building,
  CreditCard,
  Edit2,
  Upload,
  FileSignature,
  AlertTriangle,
  X
} from 'lucide-react';
import { useToast } from '../../contexts/ToastContext';
import EmployeeAssignmentPanel from './EmployeeAssignmentPanel';
import { motion, AnimatePresence } from 'framer-motion';

// --- Helper Functions ---
const formatDate = (dateString: string | null) => {
  if (!dateString) return 'N/A';
  const d = new Date(dateString);
  if (isNaN(d.getTime())) return 'N/A';
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
};

const formatSimpleDate = (dateString: string | null) => {
  if (!dateString) return 'N/A';
  return new Date(dateString).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
};

// --- Reusable InfoRow ---
const InfoRow: React.FC<{ icon: React.ElementType; label: string; value: string | number | null }> = ({
  icon: Icon,
  label,
  value
}) => (
  <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
    <Icon className="w-4 h-4 text-gray-400 flex-shrink-0 mt-1" />
    <div>
      <p className="text-xs text-gray-500">{label}</p>
      <p className="font-medium text-gray-900 break-words">{value || 'N/A'}</p>
    </div>
  </div>
);

// Helpers for PDF support detection (no UI changes)
const isIOS = () => {
  if (typeof navigator === 'undefined') return false;
  return /iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
};
const browserSupportsInlinePdf = () => {
  if (typeof navigator === 'undefined') return false;
  const mt = (navigator.mimeTypes || {});
  return !!mt['application/pdf'];
};

// --- PDF Viewer ---
const PdfViewerModal: React.FC<{ pdfUrl: string; title: string; onClose: () => void }> = ({ pdfUrl, title, onClose }) => {
  // Choose best rendering approach without touching visuals
  const viewerSrc = useMemo(() => {
    // If iOS or no inline PDF support, prefer Google viewer
    const preferGoogle = isIOS() || !browserSupportsInlinePdf();
    if (preferGoogle) {
      return `https://docs.google.com/gview?url=${encodeURIComponent(pdfUrl)}&embedded=true`;
    }
    // Otherwise try direct inline PDF first (often smoother + mobile friendly on Android/desktop)
    return `${pdfUrl}#toolbar=1&navpanes=0&view=FitH`;
  }, [pdfUrl]);

  const isGoogle = viewerSrc.includes('docs.google.com/gview');

  return (
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
            <div className="flex items-center gap-2">
              <a
                href={pdfUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-full text-gray-400 hover:bg-gray-700 hover:text-white"
                aria-label="Open in new tab / Download"
                title="Open in new tab / Download"
              >
                <Download size={18} />
              </a>
              <button onClick={onClose} className="p-2 rounded-full text-gray-400 hover:bg-gray-700 hover:text-white" aria-label="Close document viewer">
                <X size={20} />
              </button>
            </div>
          </div>
          <div className="flex-1 p-2">
            {/* Keep exact container styles; only source selection changes */}
            <iframe
              src={viewerSrc}
              className="w-full h-full border-0 rounded-b-lg"
              title="PDF Viewer"
              // improve mobile behavior
              allow="fullscreen"
              // sandbox omitted to preserve existing auth cookies for signed URLs if needed
            />
            {/* Gentle fallback messaging if Google viewer path used (no visual changes otherwise) */}
            {isGoogle && (
              <p className="sr-only">
                If the document does not display, use the Download button in the header to open in a new tab.
              </p>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

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

    // Lightweight realtime listeners
    const channel = supabase
      .channel(`employee_dashboard:${user.id}`)
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'assignments' },
        async () => {
          const result = await getAssignmentsForEmployee(user.id);
          if (!result.error) setAssignments(result.data || []);
        }
      )
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'employee_documents', filter: `profile_id=eq.${user.id}` },
        async () => {
          const result = await getEmployeeDocuments(user.id);
          if (!result.error) setDocuments(result.data || []);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };

  }, [user, addToast]);
  
  const handleAssignmentClick = async (assignmentId: string) => {
    if (selectedAssignment?.id === assignmentId) {
      setSelectedAssignment(null);
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
    setAssignments(prev =>
      prev.map(a => a.id === assignmentId ? { ...a, status } : a)
    );
    if (selectedAssignment?.id === assignmentId) {
      setSelectedAssignment(prev => prev ? { ...prev, status } : null);
    }

    const { error } = await updateAssignmentStatus(assignmentId, status);
    if (error) {
      addToast({ type: 'error', title: 'Update Failed', message: error.message });
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

  if (!profile) {
    return (
      <div className="flex h-screen items-center justify-center text-center text-red-500">
        <div>
          <AlertCircle className="w-12 h-12 mx-auto" />
          <h1 className="mt-4 text-xl font-bold">Could not load your profile.</h1>
          <p className="text-gray-600">Please contact the admin or try logging out and back in.</p>
        </div>
      </div>
    );
  }


  return (
    <div className="flex h-screen bg-gray-100">
      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-6 md:p-10">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900">Welcome, {profile.first_name}</h1>
          <p className="text-gray-600 mt-1">Here's your personal dashboard. Let's get to work.</p>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
            {/* Left Column: Assignments & Documents */}
            <div className="lg:col-span-2 space-y-8">
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
                              <Icon size={14} /> {label.replace("_", " ")}
                            </span>
                          </div>
                          <p className="text-sm text-gray-500 mt-1">Due: {formatSimpleDate(assignment.due_date)}</p>
                        </button>
                      );
                    })}
                  </div>
                )}
              </section>

              {/* Documents Section */}
              <section>
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
            
            {/* Right Column: Profile Details */}
            <aside className="lg:col-span-1 space-y-6">
              {/* Profile Card */}
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">My Profile</h2>
                <div className="space-y-2">
                  <InfoRow icon={Mail} label="Email" value={profile.email} />
                  <InfoRow icon={Phone} label="Phone" value={profile.phone} />
                  <InfoRow icon={MapPin} label="Address" value={profile.home_address} />
                  <InfoRow icon={Calendar} label="Birth Date" value={profile.birth_date} />
                </div>
              </div>
              
               {/* Employment Card */}
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">Employment Details</h2>
                <div className="space-y-2">
                  <InfoRow icon={Briefcase} label="Position" value={profile.position} />
                  <InfoRow icon={Hash} label="Employee #" value={profile.employee_number} />
                  <InfoRow icon={Calendar} label="Start Date" value={profile.start_date} />
                  <InfoRow icon={FileText} label="National ID" value={profile.national_id} />
                  <InfoRow icon={DollarSign} label="Salary" value={profile.salary ? `GHS ${profile.salary}` : 'N/A'} />
                  <InfoRow icon={Building} label="Bank" value={profile.bank_name} />
                  <InfoRow icon={CreditCard} label="Account #" value={profile.bank_account} />
                </div>
              </div>
            </aside>
            
          </div>
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
