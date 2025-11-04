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
  List, // <-- 1. IMPORT
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useToast } from '../../contexts/ToastContext'; 
// 2. IMPORT THE NEW PANEL AND TYPES
import EmployeeAssignmentPanel from './EmployeeAssignmentPanel';
import { Assignment, Milestone } from '../admin/DashboardPage/tabs/AssignmentsTab';
import { Profile } from '../admin/DashboardPage/tabs/EmployeesTab';

// --- 3. REMOVED OLD 'Task' AND 'Assignment' INTERFACES ---

// --- MOCK DATA (FRONTEND-FIRST) ---
const MOCK_USER_1: Pick<Profile, 'id' | 'first_name' | 'last_name' | 'avatar_url'> = { id: '1', first_name: 'John', last_name: 'Doe', avatar_url: null };
const MOCK_ASSIGNMENTS: Assignment[] = [
  {
    id: 'assign_1',
    title: 'Client Brand Strategy Deck',
    category: 'Design',
    description: 'Create a full brand strategy deck for the new client. Include tone, format, and target audience analysis.',
    attachments: [{ id: 'att_1', file_name: 'Client_Brief.pdf', file_url: '#', uploaded_at: '2025-11-03' }],
    priority: 'high',
    type: 'team',
    start_date: '2025-11-05',
    due_date: '2025-11-15',
    milestones: [
      { id: 'm_1', title: 'Initial Research', due_date: '2025-11-07', completed: true },
      { id: 'm_2', title: 'Draft v1', due_date: '2025-11-10', completed: false },
      { id: 'm_3', title: 'Final Deck', due_date: '2025-11-15', completed: false },
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
// --- END MOCK DATA ---


// --- HELPERS ---
const formatDate = (dateString: string | null) => {
  if (!dateString) return 'N/A';
  const d = new Date(dateString);
  if (isNaN(d.getTime())) return 'N/A';
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
};

// --- 4. REMOVED badgeForPriority and statusMeta ---

// --- REUSABLE UI ---

// ... (PdfViewerModal and InfoRow components remain unchanged) ...
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
// --- 5. REMOVED TaskItem component ---

// --- MAIN ---
const EmployeeDashboardPage: React.FC = () => {
  const { user, logout } = useAuth();
  const { addToast } = useToast();
  const [profile, setProfile] = useState<Profile | null>(null);
  // const [tasks, setTasks] = useState<Task[]>([]); // 6. REMOVED
  const [loading, setLoading] = useState(true);
  // const [updatingTaskId, setUpdatingTaskId] = useState<string | null>(null); // 6. REMOVED
  const [error, setError] = useState<string | null>(null);

  // --- 7. NEW ASSIGNMENT STATE ---
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null);
  
  // UI: filters & search
  const [statusFilter, setStatusFilter] = useState<'all' | string>('all'); // 8. Updated
  const [query, setQuery] = useState('');
  const [showTaskSummary, setShowTaskSummary] = useState(false);

  // Profile edit mode
  // ... (editMode and profile states remain unchanged) ...
  const [editMode, setEditMode] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  const [editPhone, setEditPhone] = useState<string>('');
  const [editAddress, setEditAddress] = useState<string>('');
  const [editBankName, setEditBankName] = useState<string>('');
  const [editBankAccount, setEditBankAccount] = useState<string>('');
  const [avatarUploading, setAvatarUploading] = useState(false);

  // --- 9. We'll update the 'My Documents' section next ---
  const [signedDocument, setSignedDocument] = useState<{ name: string; url: string } | null>(null);
  const [documentUploading, setDocumentUploading] = useState(false);
  const [isRemovingDocument, setIsRemovingDocument] = useState(false);
  const [viewingPdf, setViewingPdf] = useState<string | null>(null);
  const [viewingPdfTitle, setViewingPdfTitle] = useState<string>('');
  const unsignedContract = { name: 'Employment Contract (Unsigned)', url: '/mock-contract.pdf' }; 

  useEffect(() => {
    if (user?.id) {
      fetchDashboardData();

      // 10. We'll add real-time listeners for assignments later
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
      if (profileData?.signed_contract_url && profileData?.signed_contract_name) {
        setSignedDocument({ name: profileData.signed_contract_name, url: profileData.signed_contract_url });
      } else {
        setSignedDocument(null);
      }

      // 11. FETCH NEW ASSIGNMENTS (MOCKED)
      // Real query:
      // const { data: assignmentsData, error: assignmentsError } = await supabase
      //   .from('assignments')
      //   .select('*, assignees:assignment_assignees(profile_id)')
      //   .eq('assignees.profile_id', user.id)
      //   .order('created_at', { ascending: false });
      // if (assignmentsError) throw assignmentsError;
      
      await new Promise(res => setTimeout(res, 500)); // Simulate load
      setAssignments(MOCK_ASSIGNMENTS);

    } catch (err) {
      console.error('Unexpected error:', err);
      setError('Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  // --- 12. REMOVED updateTaskStatus ---

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

  // 13. REMOVED old 'stats' useMemo
  
  // ... (onSaveProfile, onUploadAvatar, onUploadSignedContract, onRemoveSignedContract, handleViewPdf remain unchanged) ...
  const onSaveProfile = async () => { /* ... */ };
  const onUploadAvatar = async (file: File) => { /* ... */ };
  const onUploadSignedContract = async (file: File) => { /* ... */ };
  const onRemoveSignedContract = async () => { /* ... */ };
  const handleViewPdf = (url: string, title: string) => { /* ... */ };
  
  // --- 14. NEW MOCKED HANDLERS ---
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
        {/* ... */}
      </header>

      {/* Main */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome (unchanged) */}
        <div className="mb-8">
          {/* ... */}
        </div>

        {/* Optional Task Summary (REMOVED) */}
        
        {/* Grid */}
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
                  {/* 15. UPDATED FILTERS */}
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
                  <p className="text-sm text-gray-400">Your queue is clear.</p>
                </div>
              ) : filteredAssignments.length === 0 ? (
                <div className="text-center py-12">
                  <Search className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-600 font-medium">No assignments match your filters.</p>
                </div>
              ) : (
                // 16. NEW ASSIGNMENT LIST
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
            
            {/* 17. REMOVED OLD TEAM ASSIGNMENTS CARD */}
            
          </div>

          {/* --- SIDEBAR (PROFILE) --- */}
          <div className="lg:col-span-2 space-y-6">
            {/* ... (All profile, documents, and details cards remain unchanged) ... */}
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white p-6 rounded-xl shadow-sm border border-gray-200"
            >
              {/* Profile Avatar & Edit Button */}
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white p-6 rounded-xl shadow-sm border border-gray-200"
            >
              {/* My Documents Card */}
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white p-6 rounded-xl shadow-sm border border-gray-200"
            >
              {/* Employment Details Card */}
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white p-6 rounded-xl shadow-sm border border-gray-200"
            >
              {/* Financial Details Card */}
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
      
      {/* 18. NEW ASSIGNMENT PANEL */}
      <EmployeeAssignmentPanel
        assignment={selectedAssignment}
        onClose={() => setSelectedAssignment(null)}
        onPostComment={handlePostComment}
        onUploadDeliverable={handleUploadDeliverable}
      />
    </div>
  );
};

// --- 19. NEW ASSIGNMENT CARD COMPONENT ---
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