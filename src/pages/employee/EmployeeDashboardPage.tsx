// src/pages/employee/EmployeeDashboardPage.tsx
// @ts-nocheck
import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { useAuth } from '../../features/auth/AuthProvider';
import { supabase } from '../../lib/supabase/client';
import {
  // --- 1. IMPORT NEW V2 ASSIGNMENT FUNCTIONS ---
  getEmployeeAssignments,
  getFullAssignmentDetailsV2,
  updateAssignmentStatusV2,
  postAssignmentCommentV2,
  updateMilestoneStatus,
  uploadAssignmentDeliverable,
  updateAssignmentProgress,
  createStorageSignedUrl,
  // --- Other functions ---
  createDocumentSignedUrl,
  getEmployeeDocuments,
  uploadSignedEmployeeDocument,
  EmployeeDocument,
  // --- 3. IMPORT NEW V2 TYPES ---
  Assignment,
  FullAssignment,
  AssignmentStatus
} from '../../lib/supabase/operations';
import {
  Loader2,
  List,
  FileText,
  CheckCircle,
  Clock,
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
  UploadCloud,
  AlertTriangle,
  X,
  LogOut,
  Home,
  ChevronRight,
  ChevronLeft,
  ChevronDown,
  Filter,
  ArrowDownWideNarrow,
  Eye,
  FileUp,
  Moon,
  Sun,
} from 'lucide-react';
import { useToast } from '../../contexts/ToastContext';
import { useTheme } from '../../contexts/ThemeContext';
// --- 4. IMPORT NEW V2 PANEL ---
import EmployeeAssignmentPanelV2 from './EmployeeAssignmentPanelV2';
import EnhancedPdfViewer from '../../components/EnhancedPdfViewer';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';

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

// --- Reusable InfoRow (Unchanged) ---
const InfoRow: React.FC<{ icon: React.ElementType; label: string; value: string | number | null | undefined }> = ({
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

// --- NEW: Reusable Stat Card Component ---
const StatCard: React.FC<{ title: string; value: number; icon: React.ElementType; color: string }> = ({ title, value, icon: Icon, color }) => (
  <div className={`bg-white p-4 rounded-xl shadow-md border border-gray-200 flex items-center gap-4 ${color}`}>
    <div className={`p-3 rounded-full ${color.replace('text-', 'bg-').replace('500', '100')}`}>
      <Icon size={20} />
    </div>
    <div>
      <p className="text-2xl font-bold text-gray-800">{value}</p>
      <p className="text-sm font-medium text-gray-500">{title}</p>
    </div>
  </div>
);

// --- 5. NEW V2: Status Pill Component ---
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


// --- Profile Edit Form Modal (Unchanged) ---
const ProfileEditModal = ({ isOpen, onClose, profile, onSave, isSaving }) => {
  const [formData, setFormData] = useState({
    first_name: profile?.first_name || '',
    last_name: profile?.last_name || '',
    email: profile?.email || '',
    phone: profile?.phone || '',
    home_address: profile?.home_address || '',
  });
  const [avatarFile, setAvatarFile] = useState(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    setFormData({
        first_name: profile?.first_name || '',
        last_name: profile?.last_name || '',
        email: profile?.email || '',
        phone: profile?.phone || '',
        home_address: profile?.home_address || '',
    });
    setAvatarFile(null);
  }, [profile, isOpen]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };
  
  const handleFileChange = (e) => {
    setAvatarFile(e.target.files?.[0] || null);
  };

  const handleSave = () => {
    onSave(formData, avatarFile);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <motion.div className="absolute inset-0 bg-black/60" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} />
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl max-h-[90vh] overflow-hidden"
      >
        <div className="p-6 border-b flex justify-between items-center">
          <h3 className="text-xl font-bold text-gray-900">Edit Personal Info</h3>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-200"><X size={20} /></button>
        </div>
        <div className="p-6 space-y-4">
          
          {/* Avatar Section */}
          <div className="flex items-center gap-4 border-b pb-4">
            <div className="w-20 h-20 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden flex-shrink-0 border-2 border-gray-100">
              {profile.avatar_url || avatarFile ? (
                <img 
                    src={avatarFile ? URL.createObjectURL(avatarFile) : profile.avatar_url} 
                    alt="Avatar" 
                    className="w-full h-full object-cover" 
                />
              ) : (
                <User size={36} className="text-gray-500" />
              )}
            </div>
            <div>
              <label htmlFor="avatar-upload" className="cursor-pointer inline-flex items-center px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
                <UploadCloud size={16} className="mr-2" />
                {avatarFile ? 'Change File' : 'Upload Photo'}
              </label>
              {avatarFile && <p className="text-xs text-gray-500 mt-1 truncate max-w-[150px]">{avatarFile.name}</p>}
              <input ref={fileInputRef} type="file" id="avatar-upload" className="sr-only" accept="image/*" onChange={handleFileChange} />
              
            </div>
          </div>

          {/* Name Fields (Read-Only) */}
          <div className="grid grid-cols-2 gap-4">
            <label className="block">
              <span className="text-sm font-medium text-gray-700">First Name</span>
              <input 
                type="text" 
                name="first_name" 
                value={formData.first_name} 
                className="mt-1 w-full p-2 border rounded-md bg-gray-100 cursor-not-allowed" 
                readOnly={true} 
                disabled={isSaving}
              />
            </label>
            <label className="block">
              <span className="text-sm font-medium text-gray-700">Last Name</span>
              <input 
                type="text" 
                name="last_name" 
                value={formData.last_name} 
                className="mt-1 w-full p-2 border rounded-md bg-gray-100 cursor-not-allowed" 
                readOnly={true} 
                disabled={isSaving}
              />
            </label>
          </div>

          {/* Email (Editable) */}
          <label className="block">
            <span className="text-sm font-medium text-gray-700">Email</span>
            <input 
                type="email" 
                name="email" 
                value={formData.email} 
                onChange={handleChange} 
                className="mt-1 w-full p-2 border rounded-md bg-gray-50"
                disabled={isSaving}
            />
             <p className="text-xs text-gray-500 mt-1">Note: Changing your email here updates your profile record, but changing your login email requires the main user authentication process.</p>
          </label>
          
          {/* Phone (Editable) */}
          <label className="block">
            <span className="text-sm font-medium text-gray-700">Phone</span>
            <input 
                type="tel" 
                name="phone" 
                value={formData.phone} 
                onChange={handleChange} 
                className="mt-1 w-full p-2 border rounded-md bg-gray-50"
                disabled={isSaving}
            />
          </label>
          {/* Home Address (Editable) */}
          <label className="block">
            <span className="text-sm font-medium text-gray-700">Home Address</span>
            <input 
                type="text" 
                name="home_address" 
                value={formData.home_address} 
                onChange={handleChange} 
                className="mt-1 w-full p-2 border rounded-md bg-gray-50"
                disabled={isSaving}
            />
          </label>
        </div>
        <div className="p-6 border-t flex justify-end">
          <button onClick={handleSave} disabled={isSaving} className="flex items-center gap-2 px-4 py-2 bg-[#FF5722] text-white font-semibold rounded-lg hover:bg-[#E64A19] disabled:opacity-50">
            {isSaving ? <Loader2 size={16} className="animate-spin" /> : 'Save Changes'}
          </button>
        </div>
      </motion.div>
    </div>
  );
};


// --- MODAL COMPONENT FOR SIGNED UPLOAD (Unchanged) ---
const SignedDocUploadModal = ({ isOpen, onClose, doc, onUpload, isSigning }) => {
  const [signedFile, setSignedFile] = useState<File | null>(null);

  useEffect(() => {
    if (isOpen) {
      setSignedFile(null);
    }
  }, [isOpen]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSignedFile(e.target.files?.[0] || null);
  };

  const handleSubmit = () => {
    if (signedFile) {
      onUpload(doc, signedFile);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <motion.div className="absolute inset-0 bg-black/60" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} />
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl max-h-[90vh] overflow-hidden"
      >
        <div className="p-6 border-b flex justify-between items-center">
          <h3 className="text-xl font-bold text-gray-900">Upload Signed Document</h3>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-200"><X size={20} /></button>
        </div>
        <div className="p-6 space-y-4">
          <p className="text-sm text-gray-600">
            Please upload the signed version of: <strong className="text-gray-800">{doc.document_name}</strong>
          </p>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Signed File (PDF, PNG, JPG)</label>
            <input
              type="file"
              onChange={handleFileChange}
              accept=".pdf,.png,.jpg,.jpeg"
              className="mt-1 w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-[#FF5722]/10 file:text-[#FF5722] hover:file:bg-[#FF5722]/20"
            />
          </div>
        </div>
        <div className="p-6 border-t flex justify-end">
          <button 
            onClick={handleSubmit} 
            disabled={isSigning || !signedFile} 
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 disabled:opacity-50"
          >
            {isSigning ? <Loader2 size={16} className="animate-spin" /> : <FileUp size={16} />}
            {isSigning ? 'Uploading...' : 'Submit Signed Document'}
          </button>
        </div>
      </motion.div>
    </div>
  );
};


// --- Main Employee Dashboard Page ---
const EmployeeDashboardPage: React.FC = () => {
  const { user, profile, logout } = useAuth();
  const { addToast } = useToast();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  // --- 6. NEW V2: State ---
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [documents, setDocuments] = useState<EmployeeDocument[]>([]);
  const [selectedAssignment, setSelectedAssignment] = useState<FullAssignment | null>(null);
  const [isPanelLoading, setIsPanelLoading] = useState(false);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [viewingPdf, setViewingPdf] = useState<string | null>(null);
  const [viewingPdfTitle, setViewingPdfTitle] = useState<string>('');
  
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  
  const [uploadingSignedDoc, setUploadingSignedDoc] = useState<EmployeeDocument | null>(null);
  const [isSigning, setIsSigning] = useState(false);
  
  const [assignmentPage, setAssignmentPage] = useState(0); 
  const ASSIGNMENTS_PER_PAGE = 7;
  
  const [isEmploymentDetailsOpen, setIsEmploymentDetailsOpen] = useState(false); 
  
  const [filterStatus, setFilterStatus] = useState('all_active'); 
  const [sortType, setSortType] = useState('due_date');

  // --- Payday Countdown Logic (Unchanged) ---
  const calculatePayday = useCallback(() => {
    if (!profile?.payday) return 'N/A';
    const dayOfMonth = parseInt(profile.payday.match(/\d+/)?.[0] || '0', 10);
    if (dayOfMonth === 0) return 'N/A';
    const today = new Date();
    const todayDate = today.getDate();
    let nextPayday = new Date(today.getFullYear(), today.getMonth(), dayOfMonth);
    if (todayDate > dayOfMonth) {
      nextPayday.setMonth(nextPayday.getMonth() + 1);
    }
    const diffTime = nextPayday.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    if (diffDays === 0) return 'Today!';
    if (diffDays === 1) return 'Tomorrow';
    return `${diffDays} days`;
  }, [profile?.payday]);
  
  const [daysToPay, setDaysToPay] = useState(() => calculatePayday());

  useEffect(() => {
      setDaysToPay(calculatePayday());
  }, [calculatePayday]);

  // --- Assignment Stats Logic (Unchanged, uses new V2 status field) ---
  const assignmentStats = useMemo(() => {
    const total = assignments.length;
    const pending = assignments.filter(a => a.status === 'Assigned' || a.status === 'Changes_Requested').length;
    const inProgress = assignments.filter(a => a.status === 'In_Progress').length;
    const inReview = assignments.filter(a => a.status === 'Submitted').length;
    
    return { total, pending, inProgress, inReview };
  }, [assignments]);

  // --- 7. NEW V2: Data Fetching ---
  const fetchAllData = async () => {
      if (!user) return;
      setLoading(true);
      setError(null);
      try {
        // Now uses getEmployeeAssignments
        const [assignmentResult, documentResult] = await Promise.all([
          getEmployeeAssignments(user.id),
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

  const handleSaveProfile = async (formData: any, avatarFile: File | null) => {
    if (!user) return;
    setIsSavingProfile(true);
    
    let avatarUrl = profile.avatar_url; 
    
    try {
        if (avatarFile) {
            const fileExtension = avatarFile.name.split('.').pop();
            const filePath = `${user.id}/avatar.${fileExtension}`; 
            
            const { data: uploadData, error: uploadError } = await supabase.storage
                .from('avatars') 
                .upload(filePath, avatarFile, { cacheControl: '3600', upsert: true });

            if (uploadError) throw new Error(`Avatar upload failed: ${uploadError.message}`);

            const { data: urlData } = supabase.storage
                .from('avatars')
                .getPublicUrl(uploadData.path);
            
            avatarUrl = urlData.publicUrl;
        }
        
        const updateData = {
            email: formData.email, 
            phone: formData.phone,
            home_address: formData.home_address,
            avatar_url: avatarUrl 
        };
        
        const { error: dbError } = await supabase
            .from('profiles')
            .update(updateData)
            .eq('id', user.id);

        if (dbError) throw dbError;
        
        addToast({ type: 'success', title: 'Profile Updated!', message: 'Changes will reflect on next reload.' });
        setIsEditingProfile(false);
        setTimeout(() => window.location.reload(), 1500);

    } catch (err: any) {
      addToast({ type: 'error', title: 'Update Failed', message: err.message });
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/my-page');
    } catch (err: any) {
      addToast({ type: 'error', title: 'Logout Failed', message: err.message });
    }
  };
  
  // --- Assignment Filtering and Sorting Logic (Updated for V2) ---
  const filteredAssignments = useMemo(() => {
    let result = assignments.filter(a => a.status !== 'Closed' && a.status !== 'Approved' && a.status !== 'Cancelled');
    
    if (filterStatus !== 'all_active') {
        result = result.filter(a => a.status === filterStatus);
    }

    return result.sort((a, b) => {
      const getPriority = (status) => {
          const order = { 'Changes_Requested': 0, 'Assigned': 1, 'In_Progress': 2, 'Submitted': 3 };
          return order[status] !== undefined ? order[status] : 10;
      };
      
      const dateA = a.due_date ? new Date(a.due_date).getTime() : Infinity;
      const dateB = b.due_date ? new Date(b.due_date).getTime() : Infinity;
      
      let primarySort = 0;

      if (sortType === 'due_date' || sortType === 'month_year') {
          primarySort = dateA - dateB; 
          if (primarySort !== 0) return primarySort;
      } 
      
      if (sortType === 'title') {
          const titleA = a.title.toLowerCase();
          const titleB = b.title.toLowerCase();
          if (titleA < titleB) return -1;
          if (titleA > titleB) return 1;
      }
      
      return getPriority(a.status) - getPriority(b.status);
    });
  }, [assignments, filterStatus, sortType]);
  
  // Calculated visible assignments for pagination
  const visibleAssignments = useMemo(() => {
    const start = assignmentPage * ASSIGNMENTS_PER_PAGE;
    const end = start + ASSIGNMENTS_PER_PAGE;
    return filteredAssignments.slice(start, end);
  }, [filteredAssignments, assignmentPage, ASSIGNMENTS_PER_PAGE]);
  
  const totalPages = Math.ceil(filteredAssignments.length / ASSIGNMENTS_PER_PAGE);
  const totalAssignments = filteredAssignments.length;
  const startAssignment = assignmentPage * ASSIGNMENTS_PER_PAGE + 1;
  const endAssignment = Math.min(startAssignment + ASSIGNMENTS_PER_PAGE - 1, totalAssignments);

  // Reset page when filters change
  useEffect(() => {
    setAssignmentPage(0);
  }, [filterStatus, sortType]);


  // --- Data fetching and Realtime (Updated for V2) ---
  useEffect(() => {
    if (!user) return;

    fetchAllData();

    const channel = supabase
      .channel(`employee_dashboard:${user.id}`)
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'assignments', filter: `assignee_id=eq.${user.id}` },
        async () => {
          const result = await getEmployeeAssignments(user.id);
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
  
  // --- 8. NEW V2: Panel Handlers ---
  const handleAssignmentClick = async (assignment: Assignment) => {
    if (selectedAssignment?.id === assignment.id) {
      setSelectedAssignment(null);
      return;
    }

    setIsPanelLoading(true);
    setSelectedAssignment(null);
    try {
      const { data, error } = await getFullAssignmentDetailsV2(assignment.id);
      if (error) throw error;
      setSelectedAssignment(data);
    } catch (err: any) {
      addToast({ type: 'error', title: 'Error', message: 'Could not load assignment details.' });
      setSelectedAssignment(null);
    } finally {
      setIsPanelLoading(false);
    }
  };

  const handleUpdateStatus = async (assignmentId: string, newStatus: AssignmentStatus, payload: object = {}) => {
    if (!user) return;
    
    // Optimistic update
    setSelectedAssignment(prev => prev ? { ...prev, status: newStatus } : null);
    setAssignments(prev =>
      prev.map(a => a.id === assignmentId ? { ...a, status: newStatus } : a)
    );
    
    const { error } = await updateAssignmentStatusV2(assignmentId, newStatus, user.id, payload);
    if (error) {
      addToast({ type: 'error', title: 'Status Update Failed' });
      fetchAllData(); // Revert
    } else {
      addToast({ type: 'info', title: 'Status Updated' });
      if(selectedAssignment) {
        const { data } = await getFullAssignmentDetailsV2(selectedAssignment.id);
        setSelectedAssignment(data);
      }
    }
  };

  const handlePostComment = async (comment: string) => {
    if (!selectedAssignment || !user) return;
    const { error } = await postAssignmentCommentV2(selectedAssignment.id, user.id, comment);
    if (error) {
      addToast({ type: 'error', title: 'Comment Failed to Send' });
    } else {
      // Refresh details
      const { data } = await getFullAssignmentDetailsV2(selectedAssignment.id);
      setSelectedAssignment(data);
    }
  };
  
  const handleUpdateMilestone = async (milestoneId: string, newStatus: string) => {
    if (!user) return;
    const { error } = await updateMilestoneStatus(milestoneId, newStatus, user.id);
    if (error) {
      addToast({ type: 'error', title: 'Milestone update failed' });
    } else {
      // Refresh details
      const { data } = await getFullAssignmentDetailsV2(selectedAssignment.id);
      setSelectedAssignment(data);
    }
  };
  
  const handleUpdateProgress = async (progress: number) => {
    if (!selectedAssignment || !user) return;
    // Optimistic
    setSelectedAssignment(prev => prev ? { ...prev, progress_value: progress } : null);
    
    const { error } = await updateAssignmentProgress(selectedAssignment.id, progress, user.id);
    if (error) {
      addToast({ type: 'error', title: 'Progress update failed' });
      const { data } = await getFullAssignmentDetailsV2(selectedAssignment.id);
      setSelectedAssignment(data);
    }
  };
  
  const handleUploadDeliverable = async (file: File, label: string) => {
    if (!selectedAssignment || !user) return;
    try {
      await uploadAssignmentDeliverable(selectedAssignment.id, file, label, user.id);
      addToast({ type: 'success', title: 'File Uploaded!' });
      // Refresh details
      const { data } = await getFullAssignmentDetailsV2(selectedAssignment.id);
      setSelectedAssignment(data);
    } catch (err: any) {
      addToast({ type: 'error', title: 'Upload Failed', message: err.message });
    }
  };

  // --- Document Handlers (Unchanged) ---
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

  const handleSignedDocUpload = async (doc: EmployeeDocument, file: File) => {
    setIsSigning(true);
    try {
      const updatedDoc = await uploadSignedEmployeeDocument(doc, file);
      setDocuments(prevDocs => 
        prevDocs.map(d => d.id === updatedDoc.id ? updatedDoc : d)
      );
      addToast({ type: 'success', title: 'Upload Successful!', message: `${doc.document_name} has been signed.` });
      setUploadingSignedDoc(null);
    } catch (err: any) {
      addToast({ type: 'error', title: 'Upload Failed', message: err.message });
    } finally {
      setIsSigning(false);
    }
  };


  // Loading skeleton (kept for completeness)
  const LoadingSkeleton = () => (
    <div className="flex h-screen bg-gray-100">
      <main className="flex-1 overflow-y-auto p-6 md:p-10">
        <div className="max-w-4xl mx-auto">
          <div className="h-8 bg-gray-300 rounded w-1/3 animate-pulse" />
          <div className="h-4 bg-gray-200 rounded w-2/3 mt-2 animate-pulse" />
        </div>
      </main>
    </div>
  );

  if (loading) {
    return <LoadingSkeleton />;
  }

  if (error || !profile) {
    return (
      <div className="flex h-screen items-center justify-center text-center text-red-500 p-8">
        <div>
          <AlertCircle className="w-12 h-12 mx-auto" />
          <h1 className="mt-4 text-xl font-bold">Could not load your profile.</h1>
          <p className="text-gray-600">Ensure your user role is set to 'employee' in the database.</p>
        </div>
      </div>
    );
  }


  return (
    <div className="flex h-screen w-full flex-col bg-gray-50">
      {/* --- Fixed Top Bar (Navigation) --- */}
      <div className="flex-shrink-0 bg-white shadow-sm px-4 py-3 flex justify-between items-center sticky top-0 z-10 border-b">
        <h1 className="text-xl font-bold text-gray-900">Employee Portal</h1>
        <div className="flex items-center space-x-4">
          <Link
            to="/"
            className="flex items-center gap-1.5 text-sm text-gray-600 hover:text-[#FF5722] transition-colors"
            title="Return to SolveX Studios Website"
          >
            <Home size={18} />
            <span className="hidden sm:inline">Back to Site</span>
          </Link>
          <div className="h-6 w-px bg-gray-200"></div> 
          
          <button
            onClick={toggleTheme}
            className="p-2 rounded-full text-gray-500 hover:text-[#FF5722] hover:bg-gray-100 transition-colors"
            title={theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
          >
            {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
          </button>

          <button
            onClick={handleLogout}
            className="text-gray-500 hover:text-red-600 flex items-center"
            title="Logout"
          >
            <LogOut size={20} className="mr-1" />
            <span className="hidden sm:inline text-sm">Logout</span>
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-7xl mx-auto p-6 md:p-10">
          
          {/* --- Hero Section (Brand Color & Avatar) --- */}
          <div className="relative p-8 md:p-10 bg-gradient-to-r from-[#FF5722] to-[#C10100] rounded-xl shadow-xl text-white mb-8">
            <motion.div initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.5 }}>
              <div className="flex items-center gap-6">
                <div className="w-20 h-20 rounded-full bg-white/20 flex items-center justify-center overflow-hidden flex-shrink-0 border-2 border-white">
                  {profile.avatar_url ? (
                    <img 
                      src={profile.avatar_url} 
                      alt={`${profile.first_name} Avatar`} 
                      className="w-full h-full object-cover" 
                    />
                  ) : (
                    <User size={36} className="text-white" />
                  )}
                </div>
                <div>
                  <h1 className="text-3xl font-bold">Welcome back, {profile.first_name}!</h1>
                  <p className="text-orange-100">{profile.position || 'Employee'}</p>
                </div>
              </div>
            </motion.div>
          </div>
          {/* --- END: Hero Section --- */}
          
          {/* --- At a Glance Stats (Updated for V2) --- */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <StatCard title="Total Tasks" value={assignmentStats.total} icon={List} color="text-gray-500" />
            <StatCard title="Pending / Rework" value={assignmentStats.pending} icon={AlertCircle} color="text-red-500" />
            <StatCard title="In Progress" value={assignmentStats.inProgress} icon={Clock} color="text-blue-500" />
            <StatCard title="In Review" value={assignmentStats.inReview} icon={AlertTriangle} color="text-purple-500" />
          </div>
          {/* --- END: Stats --- */}


          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Left Column: Assignments & Documents (lg:col-span-2) */}
            <div className="lg:col-span-2 space-y-8">
              
              {/* Assignments Section (Filtered and Paginated) */}
              <section className="bg-white p-6 rounded-xl shadow-md border border-gray-200">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 border-b pb-4">
                  <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2 mb-3 sm:mb-0">
                    <List className="text-gray-500" /> Active Tasks ({filteredAssignments.length})
                  </h2>
                  
                  {/* --- Filter and Sort Controls (Updated for V2) --- */}
                  <div className="flex space-x-3 items-center">
                      <div className="relative">
                          <Filter size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                          <select 
                              value={filterStatus} 
                              onChange={(e) => setFilterStatus(e.target.value)}
                              className="appearance-none block w-full bg-white border border-gray-300 rounded-md py-2 pl-8 pr-8 text-sm text-gray-700 focus:outline-none focus:ring-[#FF5722] focus:border-[#FF5722]"
                          >
                              <option value="all_active">All Active</option>
                              <option value="Changes_Requested">Changes Requested</option>
                              <option value="In_Progress">In Progress</option>
                              <option value="Assigned">Assigned</option>
                              <option value="Submitted">Submitted</option>
                          </select>
                          <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
                      </div>

                      <div className="relative">
                          <ArrowDownWideNarrow size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                          <select 
                              value={sortType} 
                              onChange={(e) => setSortType(e.target.value)}
                              className="appearance-none block w-full bg-white border border-gray-300 rounded-md py-2 pl-8 pr-8 text-sm text-gray-700 focus:outline-none focus:ring-[#FF5722] focus:border-[#FF5722]"
                          >
                              <option value="due_date">Sort by Date (Default)</option>
                              <option value="title">Sort by Title</option>
                              <option value="priority">Sort by Status Priority</option>
                          </select>
                           <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
                      </div>
                  </div>
                  {/* --- END: Filter and Sort Controls --- */}
                  
                  <Link to="/employee/all-assignments" className="text-sm text-[#FF5722] hover:underline hidden md:block">
                     View All
                  </Link>
                </div>

                {filteredAssignments.length === 0 ? (
                  <div className="text-center p-10">
                      <Inbox size={48} className="mx-auto text-gray-300" />
                      <h3 className="mt-4 font-semibold text-gray-700">All caught up!</h3>
                      <p className="text-sm text-gray-500">You have no assignments matching the current criteria.</p>
                    </div>
                ) : (
                  <>
                    <div className="space-y-3">
                      {/* Only render visible assignments */}
                      {visibleAssignments.map(assignment => {
                        return (
                          <button
                            key={assignment.id}
                            onClick={() => handleAssignmentClick(assignment)}
                            className={`w-full p-4 bg-gray-50 rounded-lg text-left transition-all border ${
                              selectedAssignment?.id === assignment.id ? 'ring-2 ring-[#FF5722] border-[#FF5722]' : 'hover:bg-gray-100 border-gray-200'
                            }`}
                          >
                            <div className="flex justify-between items-center">
                              <span className="font-semibold text-gray-800">{assignment.title}</span>
                              <span className={`flex items-center text-xs font-medium gap-1.5 px-3 py-1 rounded-full capitalize ${getStatusPill(assignment.status)}`}>
                                {assignment.status.replace("_", " ")}
                              </span>
                            </div>
                            <p className="text-sm text-gray-500 mt-1">Due: {formatSimpleDate(assignment.due_date)}</p>
                          </button>
                        );
                      })}
                    </div>
                    
                    {/* Pagination/Next Button: Enhanced Design */}
                    {totalAssignments > ASSIGNMENTS_PER_PAGE && (
                      <div className="flex justify-between items-center border-t pt-4 mt-6">
                        <span className="text-sm font-medium text-gray-600">
                          Showing {startAssignment}-{endAssignment} of {totalAssignments} assignments
                        </span>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setAssignmentPage(p => p - 1)}
                            disabled={assignmentPage === 0}
                            className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 disabled:opacity-50 transition-colors"
                            aria-label="Previous page"
                          >
                            <ChevronLeft size={16} /> Previous
                          </button>
                          <button
                            onClick={() => setAssignmentPage(p => p + 1)}
                            disabled={assignmentPage >= totalPages - 1}
                            className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-semibold text-white bg-[#FF5722] hover:bg-[#E64A19] disabled:opacity-50 transition-colors"
                            aria-label="Next page"
                          >
                            Next <ChevronRight size={16} />
                          </button>
                        </div>
                      </div>
                    )}
                    {filteredAssignments.length > ASSIGNMENTS_PER_PAGE && (
                      <div className="text-center mt-4 md:hidden">
                        <Link to="/employee/all-assignments" className="text-sm font-semibold text-[#FF5722] hover:underline">
                          View All ({filteredAssignments.length})
                        </Link>
                      </div>
                    )}
                  </>
                )}
              </section>

              {/* Documents Section (Unchanged) */}
              <section className="bg-white p-6 rounded-xl shadow-md border border-gray-200">
                <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2 mb-4">
                  <FileText className="text-gray-500" /> Important Documents
                </h2>
                {documents.length === 0 ? (
                  <div className="text-center p-10">
                      <FileText size={48} className="mx-auto text-gray-300" />
                      <h3 className="mt-4 font-semibold text-gray-700">No Documents</h3>
                      <p className="text-sm text-gray-500">Your admin hasn't uploaded any documents for you yet.</p>
                    </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {documents.map(doc => (
                      <div key={doc.id} className="p-4 bg-gray-50 rounded-lg flex justify-between items-center border">
                        <div>
                          <p className="font-semibold text-gray-800 truncate">{doc.document_name}</p>
                          {doc.requires_signing && !doc.signed_at && (
                            <span className="text-xs text-yellow-600 font-medium flex items-center gap-1 mt-0.5"><AlertTriangle size={12} /> Pending Signature</span>
                          )}
                          {doc.signed_at && (
                            <span className="text-xs text-green-600 font-medium flex items-center gap-1 mt-0.5"><CheckCircle size={12} /> Signed on {formatDate(doc.signed_at)}</span>
                          )}
                          {!doc.requires_signing && (
                            <span className="text-xs text-blue-600 font-medium mt-0.5">Reference Document</span>
                          )}
                        </div>
                        
                        <div className="flex gap-2">
                          <button 
                            onClick={() => handleViewDocument(doc)}
                            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-[#FF5722] text-white hover:bg-[#E64A19] transition-colors"
                          >
                            <Eye size={14} /> View
                          </button>
                          
                          {doc.requires_signing && !doc.signed_at && (
                            <button 
                              onClick={() => setUploadingSignedDoc(doc)}
                              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-green-600 text-white hover:bg-green-700 transition-colors"
                            >
                              <FileUp size={14} /> Sign & Upload
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </section>
            </div>
            
            {/* Right Column: Profile Details (lg:col-span-1) */}
            <aside className="lg:col-span-1 space-y-6">
              
              {/* Profile Card (Always visible) */}
              <div className="bg-white p-6 rounded-xl shadow-md border border-gray-200">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold text-gray-800">My Info</h2>
                  <button onClick={() => setIsEditingProfile(true)} className="p-1.5 text-gray-500 hover:bg-gray-100 rounded-full" title="Edit Personal Info">
                    <Edit2 size={16} />
                  </button>
                </div>
                <div className="space-y-2">
                  <InfoRow icon={Mail} label="Email" value={profile.email} />
                  <InfoRow icon={Phone} label="Phone" value={profile.phone} />
                  <InfoRow icon={MapPin} label="Address" value={profile.home_address} />
                  <InfoRow icon={Calendar} label="Birth Date" value={formatDate(profile.birth_date)} />
                </div>
              </div>
              
              {/* Employment Card (Unchanged) */}
              <div className="bg-white rounded-xl shadow-md border border-gray-200">
                  <button
                      onClick={() => setIsEmploymentDetailsOpen(!isEmploymentDetailsOpen)}
                      className="w-full flex justify-between items-center p-6 text-xl font-semibold text-gray-800"
                      aria-expanded={isEmploymentDetailsOpen}
                      aria-controls="employment-details-content"
                  >
                      <h2 className="flex items-center gap-2">Employment Details</h2>
                      <motion.div
                          className="lg:hidden"
                          initial={false}
                          animate={{ rotate: isEmploymentDetailsOpen ? 180 : 0 }}
                          transition={{ duration: 0.3 }}
                      >
                          <ChevronDown size={24} className="text-gray-500" />
                      </motion.div>
                  </button>
                  <AnimatePresence initial={false}>
                      {isEmploymentDetailsOpen || (
                          typeof window !== 'undefined' && window.innerWidth >= 1024
                      ) ? (
                          <motion.div
                              key="employment-details-content"
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: "auto", opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.3, ease: "easeInOut" }}
                              className="overflow-hidden"
                              id="employment-details-content"
                          >
                              <div className="p-6 pt-0 space-y-2">
                                  <InfoRow icon={Briefcase} label="Position" value={profile.position} />
                                  <InfoRow icon={Hash} label="Employee #" value={profile.employee_number} />
                                  <InfoRow icon={Calendar} label="Start Date" value={formatDate(profile.start_date)} />
                                  <InfoRow icon={Calendar} label="End Date" value={formatDate(profile.end_date)} />
                                  <InfoRow icon={DollarSign} label="Salary" value={profile.salary ? `GHS ${profile.salary}` : 'N/A'} />
                                  <InfoRow icon={Clock} label="Next Payday" value={daysToPay} />
                                  <InfoRow icon={Building} label="Bank" value={profile.bank_name} />
                                  <InfoRow icon={CreditCard} label="Account #" value={profile.bank_account} />
                              </div>
                          </motion.div>
                      ) : null}
                  </AnimatePresence>
              </div>
              
            </aside>
            
          </div>
        </div>
      </main>

      {/* --- 9. NEW V2: Assignment Detail Panel --- */}
      <EmployeeAssignmentPanelV2
        assignment={selectedAssignment}
        onClose={() => setSelectedAssignment(null)}
        onPostComment={handlePostComment}
        onUpdateStatus={handleUpdateStatus}
        onUpdateMilestone={handleUpdateMilestone}
        onUpdateProgress={handleUpdateProgress}
        onUploadDeliverable={handleUploadDeliverable}
        getSignedUrl={createStorageSignedUrl}
        isLoading={isPanelLoading}
      />
      
      {/* Enhanced PDF Viewer Modal (Unchanged) */}
      <AnimatePresence>
        {viewingPdf && <EnhancedPdfViewer pdfUrl={viewingPdf} title={viewingPdfTitle} onClose={() => setViewingPdf(null)} />}
      </AnimatePresence>

      {/* Profile Edit Modal (Unchanged) */}
      <ProfileEditModal
        isOpen={isEditingProfile}
        onClose={() => setIsEditingProfile(false)}
        profile={profile}
        onSave={handleSaveProfile}
        isSaving={isSavingProfile}
      />
      
      {/* Signed Doc Upload Modal (Unchanged) */}
      <SignedDocUploadModal
        isOpen={!!uploadingSignedDoc}
        onClose={() => setUploadingSignedDoc(null)}
        doc={uploadingSignedDoc}
        onUpload={handleSignedDocUpload}
        isSigning={isSigning}
      />
    </div>
  );
};

export default EmployeeDashboardPage;