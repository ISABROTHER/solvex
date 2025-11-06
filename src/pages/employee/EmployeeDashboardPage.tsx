// @ts-nocheck
import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../features/auth/AuthProvider';
import { supabase } from '../../lib/supabase/client';
import type { Database } from '../../lib/supabase/database.types';
import {
  getAssignmentsForEmployee,
  getFullAssignmentDetails,
  updateAssignmentStatus,
  postAssignmentComment,
  uploadDeliverable,
  deleteDeliverable,
  getEmployeeDocuments,
  signEmployeeDocument, // <-- 1. Keep this import
  EmployeeDocument,     // <-- 2. Keep this import
} from '../../lib/supabase/operations';
import { useToast } from '../../contexts/ToastContext';
import {
  Briefcase,
  Calendar,
  DollarSign,
  FileText,
  Mail,
  MapPin,
  Phone,
  User,
  Loader2,
  AlertCircle,
  File,
  CheckCircle,
  AlertTriangle,
  Eye,
  Edit,
  Send,
  UploadCloud,
  Trash2,
  Check,
  X,
  List,
} from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import EmployeeAssignmentPanel from './EmployeeAssignmentPanel';
import EnhancedPdfViewer from '../../components/EnhancedPdfViewer';

// Type definitions
type Profile = Database['public']['Tables']['profiles']['Row'];
type Assignment = Database['public']['Tables']['assignments']['Row'] & {
  client_id: { full_name: string };
  deliverables: any[];
  comments: any[];
};

// --- 3. Helper to extract storage path from URL ---
const getStoragePathFromUrl = (url: string | null): string => {
  if (!url) return '';
  try {
    return url.split('/employee_documents/')[1];
  } catch (e) {
    console.error('Could not parse storage path:', e);
    return '';
  }
};


const InfoCard: React.FC<{
  icon: React.ElementType;
  label: string;
  value: string | number | null | undefined;
}> = ({ icon: Icon, label, value }) => (
  <div className="flex items-start gap-3">
    <Icon className="w-4 h-4 text-gray-400 flex-shrink-0 mt-1" />
    <div>
      <p className="text-xs text-gray-500">{label}</p>
      <p className="font-medium text-gray-900 break-words">{value || 'N/A'}</p>
    </div>
  </div>
);

const formatDate = (dateString: string | null) => {
  if (!dateString) return 'N/A';
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

const EmployeeDashboardPage: React.FC = () => {
  const { user, profile: authProfile } = useAuth();
  const { addToast } = useToast();

  const [profile, setProfile] = useState<Profile | null>(authProfile);
  const [loadingProfile, setLoadingProfile] = useState(!authProfile);
  const [errorProfile, setErrorProfile] = useState<string | null>(null);

  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loadingAssignments, setLoadingAssignments] = useState(true);
  const [errorAssignments, setErrorAssignments] = useState<string | null>(null);
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null);

  const [documents, setDocuments] = useState<EmployeeDocument[]>([]);
  const [loadingDocs, setLoadingDocs] = useState(true);
  const [errorDocs, setErrorDocs] = useState<string | null>(null);

  // --- 4. Change PDF Viewer State ---
  const [viewingDoc, setViewingDoc] = useState<EmployeeDocument | null>(null);
  const [viewingDocIsSigned, setViewingDocIsSigned] = useState(false);
  const [isSigning, setIsSigning] = useState(false);


  // Fetch Profile
  const fetchProfile = useCallback(async () => {
    if (!user) return;
    setLoadingProfile(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      if (error) throw error;
      setProfile(data);
    } catch (err: any) {
      setErrorProfile(err.message);
    } finally {
      setLoadingProfile(false);
    }
  }, [user]);

  // Fetch Assignments
  const fetchAssignments = useCallback(async () => {
    if (!user) return;
    setLoadingAssignments(true);
    try {
      const { data, error } = await getAssignmentsForEmployee(user.id);
      if (error) throw error;
      setAssignments(data || []);
    } catch (err: any) {
      setErrorAssignments(err.message);
    } finally {
      setLoadingAssignments(false);
    }
  }, [user]);

  // Fetch Documents
  const fetchDocuments = useCallback(async () => {
    if (!user) return;
    setLoadingDocs(true);
    try {
      const { data, error } = await getEmployeeDocuments(user.id);
      if (error) throw error;
      setDocuments(data || []);
    } catch (err: any) {
      setErrorDocs(err.message);
    } finally {
      setLoadingDocs(false);
    }
  }, [user]);

  // Initial data fetch
  useEffect(() => {
    if (user) {
      if (!authProfile) {
        fetchProfile();
      }
      fetchAssignments();
      fetchDocuments();
    }
  }, [user, authProfile, fetchProfile, fetchAssignments, fetchDocuments]);
  
  // --- 5. Update Document View Handler ---
  const handleViewDocument = (doc: EmployeeDocument, isSignedVersion: boolean = false) => {
    const urlToUse = isSignedVersion ? doc.signed_storage_url : doc.storage_url;
    if (!urlToUse) {
      addToast({ type: 'error', title: 'File not found', message: 'The document URL is missing.' });
      return;
    }
    
    const storagePath = getStoragePathFromUrl(urlToUse);
    if (!storagePath) {
      addToast({ type: 'error', title: 'Invalid File Path', message: 'Could not determine the file path for download.' });
      return;
    }
    
    setViewingDoc(doc);
    setViewingDocIsSigned(isSignedVersion);
  };

  // --- Document Signing Handler (Unchanged) ---
  const handleSignDocument = async (doc: EmployeeDocument) => {
    if (!user) return;
    if (!window.confirm("Are you sure you want to sign this document? This action is final.")) return;

    setIsSigning(true);
    try {
      const updatedDoc = await signEmployeeDocument(doc, user.id);
      setDocuments(prev => 
        prev.map(d => d.id === updatedDoc.id ? updatedDoc : d)
      );
      addToast({ type: 'success', title: 'Document Signed!', message: 'Thank you for signing.' });
    } catch (err: any) {
      addToast({ type: 'error', title: 'Signing Failed', message: err.message });
    } finally {
      setIsSigning(false);
    }
  };


  // --- Assignment Handlers (Unchanged) ---
  const handleAssignmentClick = async (assignment: Assignment) => {
    setLoadingAssignments(true);
    setSelectedAssignment(null);
    try {
      const { data, error } = await getFullAssignmentDetails(assignment.id);
      if (error) throw error;
      setSelectedAssignment(data);
    } catch (err: any) {
      addToast({ type: 'error', title: 'Failed to load details', message: err.message });
    } finally {
      setLoadingAssignments(false);
    }
  };

  const handleUpdateStatus = async (newStatus: string) => {
    if (!selectedAssignment) return;
    const { error } = await updateAssignmentStatus(selectedAssignment.id, newStatus);
    if (error) {
      addToast({ type: 'error', title: 'Status Update Failed' });
    } else {
      addToast({ type: 'info', title: 'Status Updated' });
      setSelectedAssignment(prev => prev ? { ...prev, status: newStatus } : null);
      fetchAssignments(); // Refresh list
    }
  };

  const handlePostComment = async (comment: string) => {
    if (!selectedAssignment || !user) return;
    const { error } = await postAssignmentComment(selectedAssignment.id, user.id, comment);
    if (error) {
      addToast({ type: 'error', title: 'Comment Failed to Send' });
    } else {
      addToast({ type: 'success', title: 'Comment Posted!' });
      handleAssignmentClick(selectedAssignment); // Refetch details
    }
  };

  const handleUploadDeliverable = async (file: File) => {
    if (!selectedAssignment || !user) return;
    try {
      await uploadDeliverable(selectedAssignment.id, user.id, file);
      addToast({ type: 'success', title: 'File Uploaded!' });
      handleAssignmentClick(selectedAssignment); // Refetch details
    } catch (err: any) {
      addToast({ type: 'error', title: 'Upload Failed', message: err.message });
    }
  };

  const handleDeleteDeliverable = async (deliverableId: string, storagePath: string) => {
    if (!window.confirm("Are you sure you want to delete this file?")) return;
    try {
      await deleteDeliverable(deliverableId, storagePath);
      addToast({ type: 'success', title: 'File Deleted' });
      handleAssignmentClick(selectedAssignment); // Refetch details
    } catch (err: any) {
      addToast({ type: 'error', title: 'Delete Failed', message: err.message });
    }
  };
  
  if (loadingProfile && !profile) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-12 h-12 animate-spin text-[#FF5722]" />
      </div>
    );
  }

  if (errorProfile) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <AlertCircle className="w-12 h-12 text-red-500" />
        <h2 className="mt-4 text-xl font-semibold">Failed to load profile</h2>
        <p className="text-gray-600">{errorProfile}</p>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>No profile data found.</p>
      </div>
    );
  }
  
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };
  
  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto p-4 md:p-8 space-y-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
        >
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {getGreeting()}, {profile.first_name || 'Employee'}
            </h1>
            <p className="text-lg text-gray-600">
              Welcome to your dashboard.
            </p>
          </div>
          <div className="flex items-center gap-3">
            {profile.avatar_url ? (
              <img
                src={profile.avatar_url}
                alt="Profile"
                className="w-16 h-16 rounded-full object-cover border-4 border-white shadow-sm"
              />
            ) : (
              <span className="flex items-center justify-center w-16 h-16 bg-gray-200 rounded-full border-4 border-white shadow-sm">
                <User className="w-8 h-8 text-gray-500" />
              </span>
            )}
            <div>
              <p className="font-semibold text-gray-900">
                {profile.first_name} {profile.last_name}
              </p>
              <p className="text-sm text-gray-500">{profile.position}</p>
            </div>
          </div>
        </motion.div>
        
        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column (Profile & Documents) */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-1 space-y-6"
          >
            {/* Profile Card (Unchanged) */}
            <div className="bg-white p-6 rounded-xl shadow-lg">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Your Information
              </h2>
              <div className="space-y-4">
                <InfoCard icon={Mail} label="Email" value={profile.email} />
                <InfoCard icon={Phone} label="Phone" value={profile.phone} />
                <InfoCard icon={MapPin} label="Address" value={profile.home_address} />
                <InfoCard icon={Calendar} label="Start Date" value={formatDate(profile.start_date)} />
                <InfoCard icon={Briefcase} label="Position" value={profile.position} />
                <InfoCard icon={DollarSign} label="Salary" value={profile.salary ? `GHS ${profile.salary}` : 'N/A'} />
                <InfoCard icon={FileText} label="National ID" value={profile.national_id} />
              </div>
            </div>

            {/* Documents Card (Button logic updated) */}
            <div className="bg-white p-6 rounded-xl shadow-lg">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Your Documents
              </h2>
              <div className="space-y-4">
                {loadingDocs ? (
                  <div className="flex justify-center py-4">
                    <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
                  </div>
                ) : errorDocs ? (
                  <p className="text-sm text-red-600">{errorDocs}</p>
                ) : documents.length === 0 ? (
                  <p className="text-sm text-gray-500 text-center py-4">
                    You have no documents.
                  </p>
                ) : (
                  documents.map(doc => {
                    const isSigned = doc.requires_signing && doc.signed_storage_url;
                    const isPending = doc.requires_signing && !doc.signed_storage_url;
                    const isViewOnly = !doc.requires_signing;

                    return (
                      <div key={doc.id} className={`p-4 rounded-lg bg-gray-50 border ${isPending ? 'border-yellow-300' : 'border-gray-200'}`}>
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                          <div className="min-w-0">
                            <p className="font-semibold text-gray-800 truncate">{doc.document_name}</p>
                            {isViewOnly && (
                              <span className="flex items-center gap-1.5 text-xs font-medium text-blue-600">
                                <File size={14} /> View Only
                              </span>
                            )}
                            {isPending && (
                              <span className="flex items-center gap-1.5 text-xs font-medium text-yellow-600">
                                <AlertTriangle size={14} /> Pending Signature
                              </span>
                            )}
                            {isSigned && (
                              <span className="flex items-center gap-1.5 text-xs font-medium text-green-600">
                                <CheckCircle size={14} /> Signed on {formatDate(doc.signed_at)}
                              </span>
                            )}
                          </div>
                          <div className="flex-shrink-0 flex items-center gap-2 w-full sm:w-auto">
                            <button
                              onClick={() => handleViewDocument(doc, false)}
                              className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border border-gray-300 hover:bg-gray-100"
                            >
                              <Eye size={14} /> View
                            </button>
                            {isSigned && (
                              <button
                                onClick={() => handleViewDocument(doc, true)}
                                className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border border-green-300 text-green-700 bg-green-50 hover:bg-green-100"
                              >
                                <Eye size={14} /> Signed
                              </button>
                            )}
                          </div>
                        </div>
                        {isPending && (
                          <button
                            onClick={() => handleSignDocument(doc)}
                            disabled={isSigning}
                            className="w-full mt-3 inline-flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 disabled:opacity-50"
                          >
                            {isSigning ? <Loader2 size={16} className="animate-spin" /> : <Edit size={16} />}
                            {isSigning ? 'Signing...' : 'Review & Sign Document'}
                          </button>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </motion.div>

          {/* Right Column (Assignments) */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="lg:col-span-2 space-y-6"
          >
            <div className="bg-white p-6 rounded-xl shadow-lg">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <List size={22} /> Your Assignments
              </h2>
              {loadingAssignments ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
                </div>
              ) : errorAssignments ? (
                 <p className="text-sm text-red-600">{errorAssignments}</p>
              ) : assignments.length === 0 ? (
                <p className="text-sm text-gray-500 text-center py-8">
                  You have no assignments.
                </p>
              ) : (
                <div className="space-y-3">
                  {assignments.map(assignment => (
                    <button
                      key={assignment.id}
                      onClick={() => handleAssignmentClick(assignment)}
                      className="w-full flex items-center justify-between p-4 rounded-lg bg-gray-50 border border-gray-200 hover:bg-gray-100 text-left transition-colors"
                    >
                      <div className="min-w-0">
                        <p className="font-semibold text-gray-800 truncate">{assignment.title}</p>
                        <p className="text-sm text-gray-500">
                          Due: {formatDate(assignment.due_date)}
                        </p>
                      </div>
                      <span className={`px-3 py-1 text-xs font-semibold capitalize rounded-full ${
                        assignment.status === 'completed' ? 'bg-green-100 text-green-700' : 
                        assignment.status === 'in_progress' ? 'bg-blue-100 text-blue-700' : 
                        assignment.status === 'overdue' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'
                      }`}>
                        {assignment.status.replace("_", " ")}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </div>

      {/* --- 6. Update Modal Rendering --- */}
      <AnimatePresence>
        {viewingDoc && (
          <EnhancedPdfViewer
            title={viewingDocIsSigned ? `(SIGNED) ${viewingDoc.document_name}` : viewingDoc.document_name}
            storagePath={getStoragePathFromUrl(
              viewingDocIsSigned ? viewingDoc.signed_storage_url : viewingDoc.storage_url
            )}
            onClose={() => setViewingDoc(null)}
          />
        )}
      </AnimatePresence>

      {/* Assignment Detail Panel (Unchanged) */}
      <EmployeeAssignmentPanel
        assignment={selectedAssignment}
        onClose={() => setSelectedAssignment(null)}
        onUpdateStatus={handleUpdateStatus}
        onPostComment={handlePostComment}
        onUploadDeliverable={handleUploadDeliverable}
        onDeleteDeliverable={handleDeleteDeliverable}
      />
    </div>
  );
};

export default EmployeeDashboardPage;