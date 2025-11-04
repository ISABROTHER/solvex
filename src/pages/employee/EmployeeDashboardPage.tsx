// @ts-nocheck
import React, { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../../features/auth';
import { supabase } from '../../lib/supabase/client';
import {
  Loader2,
  Calendar,
  MapPin,
  Phone,
  CreditCard,
  Briefcase,
  User,
  Hash,
  FileText,
  DollarSign,
  Mail,
  LogOut,
  Building,
  CheckCircle,
  Clock,
  Award,
  Target,
  RefreshCw,
  Search,
  Edit3,
  Save,
  X,
  Upload,
  ClipboardList,
  FileDown,
  FileUp,
  Eye,
  Trash2,
  Home,
  Users,
  List,
  AlertTriangle, // <-- 1. IMPORT
  ShieldCheck, // <-- 1. IMPORT
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useToast } from '../../contexts/ToastContext'; 
import EmployeeAssignmentPanel from './EmployeeAssignmentPanel';
// 2. We'll need to move these types to a shared file eventually
import { Assignment, Milestone } from '../admin/DashboardPage/tabs/AssignmentsTab'; 

// --- TYPE DEFINITIONS ---
interface Profile {
  id: string;
  first_name: string | null;
  last_name: string | null;
  email: string | null;
  phone: string | null;
  avatar_url: string | null;
  employee_number: string | null;
  birth_date: string | null;
  national_id: string | null;
  position: string | null;
  start_date: string | null;
  end_date: string | null;
  home_address: string | null;
  salary: number | null;
  payday: string | null;
  bank_account: string | null;
  bank_name: string | null;
  // This is now replaced by the new documents table
  // signed_contract_url: string | null;
  // signed_contract_name: string | null;
}

// 3. NEW DOCUMENT TYPE
type EmployeeDocument = {
  id: string;
  profile_id: string;
  document_name: string;
  storage_url: string; // URL of the *unsigned* doc from admin
  requires_signing: boolean;
  signed_storage_url: string | null; // URL of the *signed* version from employee
  signed_storage_path: string | null;
  signed_at: string | null;
};

// --- MOCK DATA (FRONTEND-FIRST) ---
const MOCK_USER_1: Pick<Profile, 'id' | 'first_name' | 'last_name' | 'avatar_url'> = { id: '1', first_name: 'John', last_name: 'Doe', avatar_url: null };
const MOCK_ASSIGNMENTS: Assignment[] = [
  {
    id: 'assign_1',
    title: 'Client Brand Strategy Deck',
    category: 'Design',
    description: 'Create a full brand strategy deck...',
    attachments: [{ id: 'att_1', file_name: 'Client_Brief.pdf', file_url: '#', uploaded_at: '2025-11-03' }],
    priority: 'high',
    type: 'team',
    start_date: '2025-11-05',
    due_date: '2025-11-15',
    milestones: [
      { id: 'm_1', title: 'Initial Research', due_date: '2025-11-07', completed: true },
      { id: 'm_2', title: 'Draft v1', due_date: '2025-11-10', completed: false },
    ],
    assignees: [MOCK_USER_1],
    supervisor: null,
    status: 'In Progress',
    comments: [],
    deliverables: [],
  },
  {
    id: 'assign_2',
    title: 'Social Media Campaign Plan',
    category: 'Content',
    description: 'Plan out the Q4 social media campaign.',
    attachments: [],
    priority: 'medium',
    type: 'individual',
    start_date: '2025-11-01',
    due_date: '2025-11-10',
    milestones: [],
    assignees: [MOCK_USER_1],
    supervisor: null,
    status: 'Pending Review',
    comments: [],
    deliverables: [{ id: 'd_1', file_name: 'Social_Plan_v1.pdf', file_url: '#', uploaded_at: '2025-11-04' }],
  },
];
const MOCK_DOCUMENTS: EmployeeDocument[] = [
  { id: 'doc_1', document_name: 'Employment Contract', storage_url: '/mock-contract.pdf', requires_signing: true, signed_storage_url: null, signed_at: null, profile_id: '1', signed_storage_path: null },
  { id: 'doc_2', document_name: 'Employee Handbook v2', storage_url: '/mock-handbook.pdf', requires_signing: true, signed_storage_url: 'https://example.com/signed-handbook.pdf', signed_at: new Date().toISOString(), profile_id: '1', signed_storage_path: 'mock/path' },
  { id: 'doc_3', document_name: 'October 2025 Payslip', storage_url: '/mock-payslip.pdf', requires_signing: false, signed_storage_url: null, signed_at: null, profile_id: '1', signed_storage_path: null },
];
// --- END MOCK DATA ---

// --- HELPERS ---
const formatDate = (dateString: string | null) => {
  if (!dateString) return 'N/A';
  const d = new Date(dateString);
  if (isNaN(d.getTime())) return 'N/A';
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
};

// --- REUSABLE UI ---
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

const InfoRow: React.FC<{ icon: React.ElementType; label: string; value: string | number | null }> = ({
  icon: Icon,
  label,
  value
}) => (
  <div className="flex items-start gap-3">
    <Icon className="w-4 h-4 text-gray-400 flex-shrink-0 mt-1" />
    <div>
      <p className="text-xs text-gray-500">{label}</p>
      <p className="font-medium text-gray-900 break-words">{value || 'N/A'}</p>
    </div>
  </div>
);

// --- MAIN ---
const EmployeeDashboardPage: React.FC = () => {
  const { user, logout } = useAuth();
  const { addToast } = useToast();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // --- New Assignment State ---
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null);
  
  // UI: filters & search
  const [statusFilter, setStatusFilter] = useState<'all' | string>('all');
  const [query, setQuery] = useState('');
  
  // Profile edit mode
  const [editMode, setEditMode] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  const [editPhone, setEditPhone] = useState<string>('');
  const [editAddress, setEditAddress] = useState<string>('');
  const [editBankName, setEditBankName] = useState<string>('');
  const [editBankAccount, setEditBankAccount] = useState<string>('');
  const [avatarUploading, setAvatarUploading] = useState(false);

  // --- 4. NEW DOCUMENTS STATE ---
  const [documents, setDocuments] = useState<EmployeeDocument[]>([]);
  const [loadingDocs, setLoadingDocs] = useState(false);
  const [uploadingDocId, setUploadingDocId] = useState<string | null>(null);
  
  // PDF Viewer
  const [viewingPdf, setViewingPdf] = useState<string | null>(null);
  const [viewingPdfTitle, setViewingPdfTitle] = useState<string>('');

  useEffect(() => {
    if (user?.id) {
      fetchDashboardData();
      // ... (real-time listeners to be added) ...
    }
  }, [user?.id]);

  const fetchDashboardData = async () => {
    if (!user?.id) return;
    setLoading(true);
    setError(null);
    try {
      // Fetch Profile
      const { data: profileData, error: profileError } = await (supabase as any)
        .from('profiles')
        .select('*') 
        .eq('id', user.id)
        .maybeSingle();
      if (profileError) throw profileError;
      setProfile(profileData);
      setEditPhone(profileData?.phone || '');
      setEditAddress(profileData?.home_address || '');
      setEditBankName(profileData?.bank_name || '');
      setEditBankAccount(profileData?.bank_account || '');

      // --- 5. FETCH NEW ASSIGNMENTS (MOCKED) ---
      await new Promise(res => setTimeout(res, 500)); // Simulate load
      setAssignments(MOCK_ASSIGNMENTS);
      
      // --- 6. FETCH NEW DOCUMENTS (MOCKED) ---
      await new Promise(res => setTimeout(res, 500)); // Simulate load
      setDocuments(MOCK_DOCUMENTS);

    } catch (err) {
      console.error('Unexpected error:', err);
      setError('Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  const filteredAssignments = useMemo(() => {
    const q = query.trim().toLowerCase();
    return assignments.filter((a) => {
      const matchesStatus = statusFilter === 'all' ? true : a.status === statusFilter;
      const matchesQuery =
        q.length === 0 ||
        a.title.toLowerCase().includes(q) ||
        (a.description || '').toLowerCase().includes(q);
      return matchesStatus && matchesQuery;
    });
  }, [assignments, statusFilter, query]);
  
  // --- Profile & Avatar Handlers (unchanged) ---
  const onSaveProfile = async () => { /* ... (mocked) ... */ };
  const onUploadAvatar = async (file: File) => { /* ... (mocked) ... */ };

  // --- 7. NEW DOCUMENT UPLOAD HANDLER (Mocked) ---
  const onUploadSignedDoc = async (file: File, doc: EmployeeDocument) => {
    if (!user?.id || !file) return;
    setUploadingDocId(doc.id);
    try {
      // --- MOCKED ---
      // 1. Upload file to Storage
      // const storagePath = `${user.id}/signed_${doc.id}_${file.name}`;
      // const { error: upErr } = await supabase.storage.from('documents').upload(storagePath, file);
      // if (upErr) throw upErr;
      
      // 2. Get public URL
      // const { data: pub } = supabase.storage.from('documents').getPublicUrl(storagePath);
      // if (!publicUrl) throw new Error('Could not get public URL.');
      
      // 3. Update 'documents' table
      // const { error: dbErr } = await supabase.from('documents')
      //   .update({
      //     signed_storage_url: publicUrl,
      //     signed_storage_path: storagePath,
      //     signed_at: new Date().toISOString()
      //   })
      //   .eq('id', doc.id);
      // if (dbErr) throw dbErr;
      
      await new Promise(res => setTimeout(res, 1000));
      setDocuments(prev => prev.map(d => 
        d.id === doc.id ? { ...d, signed_storage_url: 'https://mock.url/signed.pdf', signed_at: new Date().toISOString() } : d
      ));
      // --- END MOCKED ---
      
      addToast({ type: 'success', title: 'Document Uploaded!', message: `${doc.document_name} is saved.` });
    
    } catch (e: any) {
      console.error('Error uploading signed document:', e);
      addToast({ type: 'error', title: 'Upload Failed', message: e.message });
    } finally {
      setUploadingDocId(null);
    }
  };

  const handleViewPdf = (url: string, title: string) => {
    setViewingPdf(url);
    setViewingPdfTitle(title);
  };
  
  // --- New Assignment Handlers (Mocked) ---
  const handlePostComment = (comment: string) => {
    addToast({ type: 'info', title: 'Comment Posted (Mock)' });
  };
  const handleUploadDeliverable = (file: File, version: string) => {
    addToast({ type: 'success', title: 'Deliverable Uploaded (Mock)' });
  };


  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-10 w-10 animate-spin text-[#FF5722]" />
          <p className="text-sm text-gray-500">Loading your dashboard…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header (unchanged) */}
      <header className="sticky top-0 z-30 border-b border-gray-200 bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <img src="https://i.imgur.com/eioVNZq.png" alt="Logo" className="h-8" />
            <h1 className="text-xl font-bold text-gray-900">Employee Dashboard</h1>
          </div>
          <div className="flex items-center gap-2">
            <a
              href="/"
              className="inline-flex items-center gap-2 px-3 py-2 text-sm font-semibold rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-100"
              title="Main Site"
            >
              <Home size={16} />
              <span className="hidden sm:inline">Main Site</span>
            </a>
            <button
              onClick={fetchDashboardData}
              className="inline-flex items-center gap-2 px-3 py-2 text-sm font-semibold rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-100"
              title="Refresh"
            >
              <RefreshCw size={16} />
              <span className="hidden sm:inline">Refresh</span>
            </button>
            <button
              onClick={logout}
              className="flex items-center gap-2 px-4 py-2 bg-[#FF5722] text-white text-sm font-semibold rounded-lg hover:bg-[#E64A19] transition-colors"
            >
              <LogOut size={16} />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome (unchanged) */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <h2 className="text-3xl font-bold text-gray-900">
              Welcome back, {profile?.first_name || 'Employee'}!
            </h2>
          </div>
        </div>

        {/* Grid: Main content (Assignments) on left, Sidebar (Profile) on right */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">

          {/* --- MAIN CONTENT (ASSIGNMENTS) --- */}
          <div className="lg:col-span-3 space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white p-4 sm:p-6 rounded-xl shadow-sm border border-gray-200"
            >
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
                <h4 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <List className="w-5 h-5 text-[#FF5722]" />
                  My Assignments
                </h4>
                <div className="flex flex-col sm:flex-row items-stretch gap-2">
                  <div className="relative flex-1 sm:flex-none">
                    <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      placeholder="Search assignments…"
                      className="pl-9 pr-3 py-2 text-sm rounded-lg border border-gray-300 w-full sm:w-56"
                    />
                  </div>
                  <div className="flex-1 sm:flex-none grid grid-cols-4 gap-1 bg-gray-100 p-1 rounded-lg">
                    {(['all', 'Assigned', 'In Progress', 'Pending Review'] as const).map((key) => (
                      <button
                        key={key}
                        onClick={() => setStatusFilter(key as any)}
                        className={`px-3 py-1.5 rounded-md text-sm font-medium transition text-center ${
                          statusFilter === key
                            ? 'bg-white shadow-sm border border-gray-200 text-gray-900'
                            : 'text-gray-600 hover:bg-white/70'
                        }`}
                      >
                        {key === 'all' ? 'All' : key.split(' ')[0]}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {error && (
                <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                  {error}
                </div>
              )}

              {assignments.length === 0 ? (
                <div className="text-center py-12">
                  <List className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-600 font-medium">No assignments... yet.</p>
                </div>
              ) : filteredAssignments.length === 0 ? (
                <div className="text-center py-12">
                  <Search className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-600 font-medium">No assignments match your filters.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredAssignments.map((assignment) => (
                    <AssignmentCard 
                      key={assignment.id} 
                      assignment={assignment} 
                      onClick={() => setSelectedAssignment(assignment)} 
                    />
                  ))}
                </div>
              )}
            </motion.div>
          </div>

          {/* --- 8. RESTORED SIDEBAR --- */}
          <div className="lg:col-span-2 space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white p-6 rounded-xl shadow-sm border border-gray-200"
            >
              <div className="flex flex-col items-center text-center">
                <div className="relative">
                  {profile?.avatar_url ? (
                    <img
                      src={profile.avatar_url}
                      alt="Profile"
                      className="w-24 h-24 rounded-full object-cover border-4 border-gray-100"
                    />
                  ) : (
                    <div className="w-24 h-24 rounded-full bg-gray-100 flex items-center justify-center border-4 border-gray-200">
                      <User className="w-12 h-12 text-gray-400" />
                    </div>
                  )}
                  <label className="absolute -bottom-2 -right-2">
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      disabled={avatarUploading}
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) onUploadAvatar(file);
                      }}
                    />
                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold bg-white border border-gray-200 shadow-sm cursor-pointer hover:bg-gray-50">
                      {avatarUploading ? <Loader2 size={12} className="animate-spin" /> : <Upload size={12} />}
                      {avatarUploading ? '...' : 'Change'}
                    </span>
                  </label>
                </div>

                <h3 className="text-xl font-bold text-gray-900 mt-4">
                  {(profile?.first_name || '') + ' ' + (profile?.last_name || '')}
                </h3>
                <p className="text-base text-[#FF5722] font-medium">
                  {profile?.position || 'N/A'}
                </p>
              </div>

              <div className="border-t border-gray-100 my-6" />

              {/* View or Edit */}
              {!editMode ? (
                <>
                  <div className="space-y-4">
                    <InfoRow icon={Mail} label="Email" value={profile?.email} />
                    <InfoRow icon={Phone} label="Phone" value={profile?.phone} />
                    <InfoRow icon={MapPin} label="Home Address" value={profile?.home_address} />
                  </div>
                  <button
                    onClick={() => setEditMode(true)}
                    className="mt-5 inline-flex items-center gap-2 px-3 py-2 text-sm font-semibold rounded-lg border border-gray-200 hover:bg-gray-100"
                  >
                    <Edit3 size={16} />
                    Edit Profile
                  </button>
                </>
              ) : (
                <div className="space-y-4">
                  {/* Edit Form Inputs (unchanged) */}
                  {/* ... */}
                </div>
              )}
            </motion.div>

            {/* --- 9. NEW "MY DOCUMENTS" CARD --- */}
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white p-6 rounded-xl shadow-sm border border-gray-200"
            >
              <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <ClipboardList className="w-5 h-5 text-[#FF5722]" />
                My Documents
              </h4>
              <div className="space-y-3">
                {loadingDocs ? (
                  <div className="flex justify-center py-4"><Loader2 className="w-5 h-5 animate-spin text-gray-400" /></div>
                ) : documents.length === 0 ? (
                  <p className="text-sm text-gray-500 text-center py-2">No documents found.</p>
                ) : (
                  documents.map(doc => (
                    <div key={doc.id} className="p-3 rounded-lg bg-gray-50 border border-gray-200">
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                        {/* Left Side: Name and Status */}
                        <div className="min-w-0">
                          <p className="font-semibold text-gray-800 truncate">{doc.document_name}</p>
                          {!doc.requires_signing && (
                            <span className="flex items-center gap-1.5 text-xs font-medium text-blue-600">
                              <ShieldCheck size={14} /> View Only
                            </span>
                          )}
                          {doc.requires_signing && !doc.signed_storage_url && (
                            <span className="flex items-center gap-1.5 text-xs font-medium text-yellow-600">
                              <AlertTriangle size={14} /> Action Required
                            </span>
                          )}
                          {doc.requires_signing && doc.signed_storage_url && (
                            <span className="flex items-center gap-1.5 text-xs font-medium text-green-600">
                              <CheckCircle size={14} /> Signed
                            </span>
                          )}
                        </div>
                        {/* Right Side: Buttons */}
                        <div className="flex gap-2 sm:flex-shrink-0 w-full sm:w-auto">
                          <button
                            onClick={() => handleViewPdf(doc.storage_url, doc.document_name)}
                            className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border border-gray-300 hover:bg-gray-100"
                          >
                            <Eye size={14} /> View
                          </button>
                          {doc.signed_storage_url && (
                             <button
                                onClick={() => handleViewPdf(doc.signed_storage_url, `(SIGNED) ${doc.document_name}`)}
                                className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border border-green-300 text-green-700 bg-green-50 hover:bg-green-100"
                              >
                                <Eye size={14} /> View Signed
                              </button>
                          )}
                        </div>
                      </div>
                      
                      {/* Upload Box for Pending Documents */}
                      {doc.requires_signing && !doc.signed_storage_url && (
                        <label className="relative flex flex-col items-center justify-center p-4 mt-3 rounded-lg border-2 border-dashed border-gray-300 hover:border-[#FF5722] hover:bg-orange-50 transition-colors cursor-pointer">
                          <input
                            type="file"
                            accept="application/pdf"
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                            disabled={uploadingDocId === doc.id}
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) onUploadSignedDoc(file, doc);
                            }}
                          />
                          {uploadingDocId === doc.id ? (
                            <>
                              <Loader2 size={24} className="text-gray-500 animate-spin" />
                              <span className="mt-2 text-sm font-medium text-gray-600">Uploading...</span>
                            </>
                          ) : (
                            <>
                              <FileUp size={24} className="text-gray-400" />
                              <span className="mt-2 text-sm font-semibold text-[#FF5722]">Upload Signed Version</span>
                              <span className="mt-1 text-xs text-gray-500">PDF only</span>
                            </>
                          )}
                        </label>
                      )}
                    </div>
                  ))
                )}
              </div>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white p-6 rounded-xl shadow-sm border border-gray-200"
            >
              <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Award className="w-5 h-5 text-[#FF5722]" />
                Employment Details
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-5">
                <InfoRow icon={Hash} label="Employee Number" value={profile?.employee_number} />
                <InfoRow icon={Briefcase} label="Position" value={profile?.position} />
                <InfoRow icon={Calendar} label="Start Date" value={formatDate(profile?.start_date)} />
                <InfoRow icon={Calendar} label="End Date" value={formatDate(profile?.end_date)} />
                <InfoRow icon={FileText} label="National ID" value={profile?.national_id} />
                <InfoRow icon={Calendar} label="Birth Date" value={formatDate(profile?.birth_date)} />
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white p-6 rounded-xl shadow-sm border border-gray-200"
            >
              <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-[#FF5722]" />
                Financial Details
              </h4>
              <div className="space-y-4">
                <InfoRow
                  icon={DollarSign}
                  label="Salary"
                  value={profile?.salary ? `GHS ${Number(profile.salary).toLocaleString()}` : 'N/A'}
                />
                <InfoRow icon={Calendar} label="Payday" value={profile?.payday} />
                <InfoRow icon={Building} label="Bank" value={profile?.bank_name} />
                <InfoRow icon={CreditCard} label="Account" value={profile?.bank_account} />
              </div>
            </motion.div>
          </div>
        </div>
      </main>

      {/* PDF Viewer Modal */}
      <AnimatePresence>
        {viewingPdf && (
          <PdfViewerModal 
            pdfUrl={viewingPdf} 
            title={viewingPdfTitle}  
            onClose={() => setViewingPdf(null)} 
          />
        )}
      </AnimatePresence>
      
      {/* New Assignment Panel */}
      <EmployeeAssignmentPanel
        assignment={selectedAssignment}
        onClose={() => setSelectedAssignment(null)}
        onPostComment={handlePostComment}
        onUploadDeliverable={handleUploadDeliverable}
      />
    </div>
  );
};

// --- New Assignment Card Component ---
const AssignmentCard: React.FC<{ assignment: Assignment, onClick: () => void }> = ({ assignment, onClick }) => {
  const progress = useMemo(() => {
    if (assignment.milestones.length === 0) return 0;
    const completed = assignment.milestones.filter(m => m.completed).length;
    return Math.round((completed / assignment.milestones.length) * 100);
  }, [assignment]);
  
  const statusColors = {
    'Assigned': 'bg-gray-100 text-gray-700',
    'In Progress': 'bg-blue-100 text-blue-700',
    'Pending Review': 'bg-yellow-100 text-yellow-700',
    'Completed': 'bg-green-100 text-green-700',
    'Overdue': 'bg-red-100 text-red-700',
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -6 }}
      onClick={onClick}
      className="bg-white p-5 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow cursor-pointer"
    >
      <div className="flex items-center justify-between gap-4">
        <span className="px-3 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-700">{assignment.category}</span>
        <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${statusColors[assignment.status]}`}>
          {assignment.status}
        </span>
      </div>
      
      <h3 className="text-lg font-semibold text-gray-900 mt-2 truncate">{assignment.title}</h3>
      <p className="text-sm text-gray-600 mt-1 line-clamp-2">{assignment.description}</p>
      
      <div className="border-t border-gray-100 mt-4 pt-4">
        {assignment.milestones.length > 0 && (
          <div className="mb-3">
            <div className="flex justify-between text-xs font-medium mb-1">
              <span>Progress</span>
              <span className="text-[#FF5722]">{progress}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-1.5">
              <div className="bg-[#FF5722] h-1.5 rounded-full" style={{ width: `${progress}%` }}></div>
            </div>
          </div>
        )}
        <div className="flex items-center justify-between">
          <div className="flex items-center -space-x-2">
            {assignment.assignees.map(user => (
              <span key={user.id} title={`${user.first_name} ${user.last_name}`} className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center border-2 border-white">
                <User size={16} className="text-gray-600" />
              </span>
            ))}
          </div>
          <div className="text-sm text-gray-500">
            <strong>Due:</strong> {formatDate(assignment.due_date)}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default EmployeeDashboardPage;