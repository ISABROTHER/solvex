// src/pages/employee/EmployeeDashboardPage.tsx
// @ts-nocheck
import React, { useState } from 'react';
import { useAuth } from '../../features/auth/AuthProvider';
import {
  createDocumentSignedUrl,
  updateAssignmentStatus,
  postAssignmentComment,
  uploadSignedEmployeeDocument, // <-- IMPORT NEW UPLOAD FUNCTION
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
  Upload,
  UploadCloud,
  Check
} from 'lucide-react';
import { useToast } from '../../contexts/ToastContext';
import EmployeeAssignmentPanel from './EmployeeAssignmentPanel';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

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

// --- PDF Viewer ---
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
  // --- 1. GET ALL DATA DIRECTLY FROM THE GLOBAL HOOK ---
  const { user, profile, assignments, documents, loading, refetchEmployeeData } = useAuth();
  const { addToast } = useToast();

  const [selectedAssignment, setSelectedAssignment] = useState<any | null>(null);
  const [viewingPdf, setViewingPdf] = useState<string | null>(null);
  const [viewingPdfTitle, setViewingPdfTitle] = useState<string>('');
  
  // --- NEW STATE for handling uploads ---
  const [uploadingDocId, setUploadingDocId] = useState<string | null>(null);
  
  const handleAssignmentClick = (assignmentId: string) => {
    if (selectedAssignment?.id === assignmentId) {
      setSelectedAssignment(null); // Toggle off
      return;
    }
    const assignmentToOpen = assignments.find(a => a.id === assignmentId);
    if (assignmentToOpen) {
      setSelectedAssignment(assignmentToOpen);
    } else {
      addToast({ type: 'error', title: 'Error', message: 'Could not find assignment.' });
    }
  };

  const handleUpdateStatus = async (assignmentId: string, status: string) => {
    if (selectedAssignment?.id === assignmentId) {
      setSelectedAssignment(prev => prev ? { ...prev, status: status } : null);
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
    // AuthProvider's realtime listener will update the state
  };

  // --- UPDATED: View document (original or signed) ---
  const handleViewDocument = async (doc: EmployeeDocument, type: 'original' | 'signed') => {
    setViewingPdf(null); // Show loading
    setViewingPdfTitle(type === 'original' ? doc.document_name : `(SIGNED) ${doc.document_name}`);
    try {
      const url = await createDocumentSignedUrl(doc, type);
      setViewingPdf(url);
    } catch (err: any) {
      addToast({ type: 'error', title: 'Could not load document', message: err.message });
      setViewingPdfTitle('');
    }
  };
  
  // --- NEW: Handle file upload for signed document ---
  const handleSignedFileSelect = async (event: React.ChangeEvent<HTMLInputElement>, doc: EmployeeDocument) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploadingDocId(doc.id);
    try {
      await uploadSignedEmployeeDocument(doc, file);
      addToast({ type: 'success', title: 'File Uploaded!', message: 'Your signed document has been submitted.' });
      refetchEmployeeData(); // Tell AuthProvider to refetch all data
    } catch (err: any) {
      addToast({ type: 'error', title: 'Upload Failed', message: err.message });
    } finally {
      setUploadingDocId(null);
    }
  };
  
  const getStatusProps = (status: string) => {
    switch (status) {
      case 'completed': return { icon: CheckCircle, color: 'text-green-500', label: 'Completed' };
      case 'in_progress': return { icon: Clock, color: 'text-blue-500', label: 'In Progress' };
      case 'overdue': return { icon: AlertCircle, color: 'text-red-500', label: 'Overdue' };
      case 'pending_review': return { icon: Eye, color: 'text-purple-500', label: 'Pending Review' };
      default: return { icon: List, color: 'text-yellow-500', label: 'Pending' };
    }
  };

  // --- FINAL LOADING CHECK ---
  if (loading) {
    return <div className="flex h-screen items-center justify-center"><Loader2 className="w-12 h-12 animate-spin text-[#FF5722]" /></div>;
  }
  
  // --- CRASH FIX: Ensure profile is NOT null before accessing its properties ---
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
  // --- END CRASH FIX ---


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

              {/* --- UPDATED: Documents Section --- */}
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
                  <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                    {documents.map(doc => {
                      const isPending = doc.requires_signing && !doc.signed_storage_url;
                      const isSigned = doc.requires_signing && doc.signed_storage_url;
                      const isLoading = uploadingDocId === doc.id;

                      return (
                        <div key={doc.id} className={`p-4 bg-white rounded-lg shadow-sm ${isPending ? 'border-l-4 border-yellow-400' : ''} ${isSigned ? 'border-l-4 border-green-500' : ''}`}>
                          <p className="font-semibold text-gray-800">{doc.document_name}</p>
                          {/* Status Badge */}
                          {isPending && <span className="text-xs text-yellow-600 font-medium">Pending Signature</span>}
                          {isSigned && <span className="text-xs text-green-600 font-medium">Signed on {formatSimpleDate(doc.signed_at)}</span>}
                          {!doc.requires_signing && <span className="text-xs text-gray-500 font-medium">For Your Records</span>}
                          
                          {/* Button Group */}
                          <div className="flex gap-2 mt-3">
                            {isSigned ? (
                              <>
                                {/* --- AFTER SIGNING --- */}
                                <button 
                                  onClick={() => handleViewDocument(doc, 'original')}
                                  className="flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border border-gray-300 hover:bg-gray-100 flex-1"
                                >
                                  <Eye size={14} /> View Original
                                </button>
                                <button 
                                  onClick={() => handleViewDocument(doc, 'signed')}
                                  className="flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border border-green-600 bg-green-50 text-green-700 hover:bg-green-100 flex-1"
                                >
                                  <Check size={14} /> View Signed
                                </button>
                              </>
                            ) : (
                              <>
                                {/* --- BEFORE SIGNING --- */}
                                <button 
                                  onClick={() => handleViewDocument(doc, 'original')}
                                  className="flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border border-gray-300 hover:bg-gray-100 flex-1"
                                >
                                  <Eye size={14} /> View
                                </button>
                                <a 
                                  href={doc.storage_url}
                                  download
                                  target="_blank" // Add target blank for safety
                                  rel="noopener noreferrer"
                                  className="flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border border-gray-300 hover:bg-gray-100 flex-1"
                                >
                                  <Download size={14} /> Download
                                </a>
                              </>
                            )}
                          </div>
                          
                          {/* --- UPLOAD BUTTON (only if pending) --- */}
                          {isPending && (
                            <div className="mt-3">
                              <label 
                                htmlFor={`upload-${doc.id}`}
                                className={`flex items-center justify-center gap-2 px-3 py-2 text-sm font-semibold rounded-lg text-white transition-colors ${
                                  isLoading ? 'bg-gray-400' : 'bg-[#FF5722] hover:bg-[#E64A19] cursor-pointer'
                                }`}
                              >
                                {isLoading ? (
                                  <Loader2 size={16} className="animate-spin" />
                                ) : (
                                  <UploadCloud size={16} />
                                )}
                                {isLoading ? 'Uploading...' : 'Upload Signed Document'}
                              </label>
                              <input 
                                type="file" 
                                id={`upload-${doc.id}`}
                                className="hidden"
                                accept="application/pdf"
                                disabled={isLoading}
                                onChange={(e) => handleSignedFileSelect(e, doc)}
                              />
                            </div>
                          )}
                        </div>
                      );
                    })}
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
                  <InfoRow icon={Calendar} label="Birth Date" value={formatDate(profile.birth_date)} />
                </div>
              </div>
              
               {/* Employment Card */}
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">Employment Details</h2>
                <div className="space-y-2">
                  <InfoRow icon={Briefcase} label="Position" value={profile.position} />
                  <InfoRow icon={Hash} label="Employee #" value={profile.employee_number} />
                  <InfoRow icon={Calendar} label="Start Date" value={formatDate(profile.start_date)} />
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