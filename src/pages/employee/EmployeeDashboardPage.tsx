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
  Home // <-- ADDED ICON
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useToast } from '../../contexts/ToastContext'; 

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
  signed_contract_url: string | null;
  signed_contract_name: string | null;
}

interface Task {
  id: string;
  title: string;
  description: string | null;
  status: 'pending' | 'in_progress' | 'completed';
  priority: 'low' | 'medium' | 'high';
  deadline: string | null;
  created_at: string;
  assigned_by: string | null;
}

// --- HELPERS ---

const formatDate = (dateString: string | null) => {
  if (!dateString) return 'N/A';
  const d = new Date(dateString);
  if (isNaN(d.getTime())) return 'N/A';
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
};

const badgeForPriority = (priority: Task['priority']) => {
  switch (priority) {
    case 'low':
      return 'bg-green-100 text-green-700';
    case 'medium':
      return 'bg-yellow-100 text-yellow-700';
    case 'high':
      return 'bg-red-100 text-red-700';
    default:
      return 'bg-gray-100 text-gray-700';
  }
};

const statusMeta = (status: Task['status']) => {
  switch (status) {
    case 'pending':
      return { icon: Clock, ring: 'ring-yellow-200', tint: 'bg-yellow-50 text-yellow-600' };
    case 'in_progress':
      return { icon: Loader2, ring: 'ring-blue-200', tint: 'bg-blue-50 text-blue-600' };
    case 'completed':
      return { icon: CheckCircle, ring: 'ring-green-200', tint: 'bg-green-50 text-green-600' };
    default:
      return { icon: Clock, ring: 'ring-gray-200', tint: 'bg-gray-50 text-gray-600' };
  }
};

// --- REUSABLE UI ---

// --- PDF VIEWER MODAL ---
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

const TaskItem: React.FC<{
  task: Task;
  onStatusChange: (taskId: string, newStatus: Task['status']) => void;
  isUpdating: boolean;
}> = ({ task, onStatusChange, isUpdating }) => {
  const meta = statusMeta(task.status);
  const StatusIcon = meta.icon;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -6 }}
      className="bg-white p-5 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${badgeForPriority(task.priority)}`}>
              {task.priority === 'low' ? 'Low' : task.priority === 'medium' ? 'Medium' : 'High'}
            </span>
            {task.deadline && (
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-gray-100 text-gray-700">
                <Calendar size={12} />
                {formatDate(task.deadline)}
              </span>
            )}
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mt-2 truncate">{task.title}</h3>
          {task.description && <p className="text-sm text-gray-600 mt-1">{task.description}</p>}
        </div>

        <div className={`p-2 rounded-full ${meta.tint} ring-2 ${meta.ring}`}>
          <StatusIcon size={20} className={task.status === 'in_progress' ? 'animate-spin' : ''} />
        </div>
      </div>

      <div className="border-t border-gray-100 mt-4 pt-4 flex items-center justify-between gap-3">
        <div className="text-sm text-gray-500">
          {task.deadline ? (
            <span className="flex items-center gap-1.5">
              <Calendar size={14} />
              Due: {formatDate(task.deadline)}
            </span>
          ) : (
            <span className="text-gray-400">No deadline</span>
          )}
        </div>

        <select
          value={task.status}
          onChange={(e) => onStatusChange(task.id, e.target.value as Task['status'])}
          disabled={isUpdating}
          className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#FF5722] disabled:opacity-70"
        >
          <option value="pending">Pending</option>
          <option value="in_progress">In Progress</option>
          <option value="completed">Completed</option>
        </select>
      </div>
    </motion.div>
  );
};

// --- MAIN ---

const EmployeeDashboardPage: React.FC = () => {
  const { user, logout } = useAuth();
  const { addToast } = useToast(); // <-- Initialize toast
  const [profile, setProfile] = useState<Profile | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingTaskId, setUpdatingTaskId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // UI: filters & search
  const [statusFilter, setStatusFilter] = useState<'all' | Task['status']>('all');
  const [query, setQuery] = useState('');
  const [showTaskSummary, setShowTaskSummary] = useState(false);

  // Profile edit mode
  const [editMode, setEditMode] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  const [editPhone, setEditPhone] = useState<string>('');
  const [editAddress, setEditAddress] = useState<string>('');
  const [editBankName, setEditBankName] = useState<string>('');
  const [editBankAccount, setEditBankAccount] = useState<string>('');
  const [avatarUploading, setAvatarUploading] = useState(false);

  // --- STATE FOR DOCUMENTS ---
  const [signedDocument, setSignedDocument] = useState<{ name: string; url: string } | null>(null);
  const [documentUploading, setDocumentUploading] = useState(false);
  const [isRemovingDocument, setIsRemovingDocument] = useState(false); // <-- New state
  const [viewingPdf, setViewingPdf] = useState<string | null>(null);
  const [viewingPdfTitle, setViewingPdfTitle] = useState<string>('');
  const unsignedContract = { name: 'Employment Contract (Unsigned)', url: '/mock-contract.pdf' }; 

  useEffect(() => {
    if (user?.id) {
      fetchProfileAndTasks();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  const fetchProfileAndTasks = async () => {
    if (!user?.id) return;
    setLoading(true);
    setError(null);

    try {
      const { data: profileData, error: profileError } = await (supabase as any)
        .from('profiles')
        .select('*') 
        .eq('id', user.id)
        .maybeSingle();

      if (profileError) {
        console.error('Error fetching profile:', profileError);
        setError('Could not load profile.');
      } else {
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
      }

      const { data: tasksData, error: tasksError } = await (supabase as any)
        .from('tasks')
        .select('*')
        .eq('assigned_to', user.id)
        .order('created_at', { ascending: false });

      if (tasksError) {
        console.error('Error fetching tasks:', tasksError);
        setError((prev) => prev || 'Could not load tasks.');
      } else {
        setTasks(tasksData || []);
      }
    } catch (err) {
      console.error('Unexpected error:', err);
      setError('Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  const updateTaskStatus = async (taskId: string, newStatus: Task['status']) => {
    setUpdatingTaskId(taskId);
    try {
      const { error: updateError } = await (supabase as any)
        .from('tasks')
        .update({ status: newStatus, updated_at: new Date().toISOString() })
        .eq('id', taskId);

      if (updateError) {
        console.error('Error updating task:', updateError);
        addToast({ type: 'error', title: 'Task Update Failed' });
      } else {
        setTasks((prev) => prev.map((t) => (t.id === taskId ? { ...t, status: newStatus } : t)));
      }
    } catch (err) {
      console.error('Unexpected error updating task:', err);
      addToast({ type: 'error', title: 'Error', message: 'An unexpected error occurred.' });
    } finally {
      setUpdatingTaskId(null);
    }
  };

  const filteredTasks = useMemo(() => {
    const q = query.trim().toLowerCase();
    return tasks.filter((t) => {
      const matchesStatus = statusFilter === 'all' ? true : t.status === statusFilter;
      const matchesQuery =
        q.length === 0 ||
        t.title.toLowerCase().includes(q) ||
        (t.description || '').toLowerCase().includes(q);
      return matchesStatus && matchesQuery;
    });
  }, [tasks, statusFilter, query]);

  const stats = useMemo(() => {
    const total = tasks.length;
    const completed = tasks.filter((t) => t.status === 'completed').length;
    const inProgress = tasks.filter((t) => t.status === 'in_progress').length;
    const pending = tasks.filter((t) => t.status === 'pending').length;
    const pct = total ? Math.round((completed / total) * 100) : 0;
    return { total, completed, inProgress, pending, pct };
  }, [tasks]);

  const onSaveProfile = async () => {
    if (!user?.id) return;
    setSavingProfile(true);
    setError(null);
    try {
      const updates: Partial<Profile> = {
        phone: editPhone || null,
        home_address: editAddress || null,
        bank_name: editBankName || null,
        bank_account: editBankAccount || null
      };

      const { error: upErr } = await (supabase as any)
        .from('profiles')
        .update(updates)
        .eq('id', user.id);

      if (upErr) throw upErr;

      setProfile((prev) => (prev ? { ...prev, ...updates } as Profile : prev));
      setEditMode(false);
      addToast({ type: 'success', title: 'Profile Saved!' });
    } catch (e: any) {
      console.error('Error saving profile:', e);
      setError('Could not save changes.');
      addToast({ type: 'error', title: 'Save Failed', message: e.message });
    } finally {
      setSavingProfile(false);
    }
  };

  const onUploadAvatar = async (file: File) => {
    if (!user?.id || !file) return;
    const BUCKET = 'avatars';
    const MAX_MB = 5;

    if (file.size > MAX_MB * 1024 * 1024) {
      addToast({ type: 'error', title: 'File too large', message: `Image must be under ${MAX_MB}MB.` });
      return;
    }

    const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg';
    if (!['jpg', 'jpeg', 'png', 'webp'].includes(ext)) {
      addToast({ type: 'error', title: 'Invalid File Type', message: 'Please upload a JPG, PNG, or WEBP.' });
      return;
    }

    setAvatarUploading(true);
    try {
      const path = `${user.id}/${Date.now()}_${file.name}`;
      const { error: upErr } = await supabase.storage.from(BUCKET).upload(path, file, {
        cacheControl: '3600',
        upsert: false
      });
      if (upErr) throw upErr;

      const { data: pub } = supabase.storage.from(BUCKET).getPublicUrl(path);
      const publicUrl = pub?.publicUrl;
      if (!publicUrl) throw new Error('Could not get public URL.');

      const { error: profErr } = await (supabase as any)
        .from('profiles')
        .update({ avatar_url: publicUrl })
        .eq('id', user.id);
      if (profErr) throw profErr;

      setProfile((prev) => (prev ? { ...prev, avatar_url: publicUrl } : prev));
      addToast({ type: 'success', title: 'Avatar Updated!' });
    } catch (e: any) {
      console.error('Error uploading avatar:', e);
      addToast({ type: 'error', title: 'Upload Failed', message: e.message });
    } finally {
      setAvatarUploading(false);
    }
  };

  const onUploadSignedContract = async (file: File) => {
    if (!user?.id || !file) return;
    const BUCKET = 'employee-documents'; 
    const MAX_MB = 10; 

    if (file.type !== 'application/pdf') {
      addToast({ type: 'error', title: 'Invalid File Type', message: 'Please upload a PDF file.' });
      return;
    }
    if (file.size > MAX_MB * 1024 * 1024) {
      addToast({ type: 'error', title: 'File too large', message: `PDF must be under ${MAX_MB}MB.` });
      return;
    }

    setDocumentUploading(true);
    try {
      const path = `${user.id}/signed_contract_${Date.now()}.pdf`;
      const { error: upErr } = await supabase.storage.from(BUCKET).upload(path, file);
      if (upErr) throw upErr;

      const { data: pub } = supabase.storage.from(BUCKET).getPublicUrl(path);
      const publicUrl = pub?.publicUrl;
      if (!publicUrl) throw new Error('Could not get public URL.');

      const updates = {
        signed_contract_url: publicUrl,
        signed_contract_name: file.name
      };
      const { error: profErr } = await (supabase as any)
        .from('profiles')
        .update(updates)
        .eq('id', user.id);
      if (profErr) throw profErr;

      setSignedDocument({ name: file.name, url: publicUrl });
      setProfile((prev) => (prev ? { ...prev, ...updates } as Profile : prev));
      addToast({ type: 'success', title: 'Contract Uploaded!', message: 'Your signed document is saved.' });
    
    } catch (e: any)
{
      console.error('Error uploading signed contract:', e);
      addToast({ type: 'error', title: 'Upload Failed', message: e.message });
    } finally {
      setDocumentUploading(false);
    }
  };

  const onRemoveSignedContract = async () => {
    if (!user?.id || !signedDocument || !profile?.signed_contract_url) return;
    
    if (!window.confirm("Are you sure you want to remove your signed contract? You will be asked to upload it again.")) {
      return;
    }

    setIsRemovingDocument(true);
    try {
      const BUCKET = 'employee-documents';
      const url = profile.signed_contract_url;
      const path = url.substring(url.indexOf(`/${BUCKET}/`) + BUCKET.length + 2); 

      const { error: storageErr } = await supabase.storage.from(BUCKET).remove([path]);
      if (storageErr) throw storageErr; 

      const updates = {
        signed_contract_url: null,
        signed_contract_name: null
      };
      const { error: profErr } = await (supabase as any)
        .from('profiles')
        .update(updates)
        .eq('id', user.id);
      if (profErr) throw profErr;

      setSignedDocument(null);
      setProfile((prev) => (prev ? { ...prev, ...updates } as Profile : prev));
      addToast({ type: 'success', title: 'Document Removed', message: 'You can now upload a new one.' });

    } catch (e: any) {
      console.error('Error removing document:', e);
      addToast({ type: 'error', title: 'Removal Failed', message: e.message });
    } finally {
      setIsRemovingDocument(false);
    }
  };

  const handleViewPdf = (url: string, title: string) => {
    setViewingPdf(url);
    setViewingPdfTitle(title);
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
      {/* Header */}
      <header className="sticky top-0 z-30 border-b border-gray-200 bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <img src="https://i.imgur.com/eioVNZq.png" alt="Logo" className="h-8" />
            <h1 className="text-xl font-bold text-gray-900">Employee Dashboard</h1>
          </div>
          <div className="flex items-center gap-2">
            {/* --- NEW BUTTON HERE --- */}
            <a
              href="/"
              className="inline-flex items-center gap-2 px-3 py-2 text-sm font-semibold rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-100"
              title="Main Site"
            >
              <Home size={16} />
              <span className="hidden sm:inline">Main Site</span>
            </a>
            <button
              onClick={fetchProfileAndTasks}
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
        {/* Welcome */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <h2 className="text-3xl font-bold text-gray-900">
              Welcome back, {profile?.first_name || 'Employee'}!
            </h2>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowTaskSummary((s) => !s)}
                className="inline-flex items-center gap-2 px-3 py-2 text-sm font-semibold rounded-lg border border-gray-200 hover:bg-gray-100"
              >
                {showTaskSummary ? <X size={16} /> : <Target size={16} />}
                {showTaskSummary ? 'Hide Summary' : 'Show Summary'}
              </button>
            </div>
          </div>
        </div>

        {/* Optional Task Summary (hidden by default) */}
        <AnimatePresence initial={false}>
          {showTaskSummary && (
            <motion.div
              initial={{ opacity: 0, y: -10, height: 0 }}
              animate={{ opacity: 1, y: 0, height: 'auto' }}
              exit={{ opacity: 0, y: -10, height: 0 }}
              className="mb-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
            >
              <div className="bg-white rounded-xl border border-gray-200 p-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">Total Tasks</span>
                  <Briefcase className="w-4 h-4 text-gray-400" />
                </div>
                <p className="mt-2 text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
              <div className="bg-white rounded-xl border border-gray-200 p-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">In Progress</span>
                  <Loader2 className="w-4 h-4 text-blue-500" />
                </div>
                <p className="mt-2 text-2xl font-bold text-gray-900">{stats.inProgress}</p>
              </div>
              <div className="bg-white rounded-xl border border-gray-200 p-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">Pending</span>
                  <Clock className="w-4 h-4 text-yellow-500" />
                </div>
                <p className="mt-2 text-2xl font-bold text-gray-900">{stats.pending}</p>
              </div>
              <div className="bg-white rounded-xl border border-gray-200 p-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">Completed</span>
                  <CheckCircle className="w-4 h-4 text-green-600" />
                </div>
                <p className="mt-2 text-2xl font-bold text-gray-900">{stats.completed}</p>
                <div className="mt-3 h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-green-500"
                    style={{ width: `${stats.pct}%` }}
                    aria-label={`Completed ${stats.pct}%`}
                  />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Grid: Main content (Tasks) on left, Sidebar (Profile) on right for desktop */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">

          {/* --- MAIN CONTENT (TASKS) --- */}
          {/* On mobile, this appears first. On desktop, it takes 3/5 width. */}
          <div className="lg:col-span-3 space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white p-4 sm:p-6 rounded-xl shadow-sm border border-gray-200"
            >
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
                <h4 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <Target className="w-5 h-5 text-[#FF5722]" />
                  My Assignments
                </h4>

                <div className="flex flex-col sm:flex-row items-stretch gap-2">
                  <div className="relative flex-1 sm:flex-none">
                    <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      placeholder="Search tasks…"
                      className="pl-9 pr-3 py-2 text-sm rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#FF5722] w-full sm:w-56"
                    />
                  </div>
                  <div className="flex-1 sm:flex-none grid grid-cols-4 gap-1 bg-gray-100 p-1 rounded-lg">
                    {(['all', 'pending', 'in_progress', 'completed'] as const).map((key) => (
                      <button
                        key={key}
                        onClick={() => setStatusFilter(key as any)}
                        className={`px-3 py-1.5 rounded-md text-sm font-medium transition text-center ${
                          statusFilter === key
                            ? 'bg-white shadow-sm border border-gray-200 text-gray-900'
                            : 'text-gray-600 hover:bg-white/70'
                        }`}
                      >
                        {key === 'all'
                          ? 'All'
                          : key === 'in_progress'
                          ? 'WIP'
                          : key[0].toUpperCase() + key.slice(1,4)}
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

              {tasks.length === 0 ? (
                <div className="text-center py-12">
                  <Target className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-600 font-medium">No tasks assigned yet.</p>
                  <p className="text-sm text-gray-400">Enjoy the quiet... for now.</p>
                </div>
              ) : filteredTasks.length === 0 ? (
                <div className="text-center py-12">
                  <Search className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-600 font-medium">No tasks match your filters.</p>
                  <p className="text-sm text-gray-400">Try a different status or search term.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <AnimatePresence initial={false}>
                    {filteredTasks.map((task) => (
                      <TaskItem
                        key={task.id}
                        task={task}
                        onStatusChange={updateTaskStatus}
                        isUpdating={updatingTaskId === task.id}
                      />
                    ))}
                  </AnimatePresence>
                </div>
              )}
            </motion.div>
          </div>

          {/* --- SIDEBAR (PROFILE) --- */}
          {/* On mobile, this appears second. On desktop, it takes 2/5 width. */}
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
                  <div className="text-left">
                    <label className="text-xs text-gray-500">Phone</label>
                    <input
                      value={editPhone}
                      onChange={(e) => setEditPhone(e.target.value)}
                      className="mt-1 w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#FF5722] text-sm"
                      placeholder="+233 ..."
                    />
                  </div>
                  <div className="text-left">
                    <label className="text-xs text-gray-500">Home Address</label>
                    <input
                      value={editAddress}
                      onChange={(e) => setEditAddress(e.target.value)}
                      className="mt-1 w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#FF5722] text-sm"
                      placeholder="Street, City"
                    />
                  </div>
                  <div className="text-left">
                    <label className="text-xs text-gray-500">Bank Name</label>
                    <input
                      value={editBankName}
                      onChange={(e) => setEditBankName(e.target.value)}
                      className="mt-1 w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#FF5722] text-sm"
                      placeholder="e.g., GCB Bank"
                    />
                  </div>
                  <div className="text-left">
                    <label className="text-xs text-gray-500">Bank Account</label>
                    <input
                      value={editBankAccount}
                      onChange={(e) => setEditBankAccount(e.target.value)}
                      className="mt-1 w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#FF5722] text-sm"
                      placeholder="Account Number"
                    />
                  </div>

                  <div className="flex gap-2 pt-2">
                    <button
                      onClick={onSaveProfile}
                      disabled={savingProfile}
                      className="inline-flex items-center gap-2 px-3 py-2 text-sm font-semibold rounded-lg bg-[#FF5722] text-white hover:bg-[#E64A19] disabled:opacity-70"
                    >
                      {savingProfile ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                      {savingProfile ? 'Saving…' : 'Save'}
                    </button>
                    <button
                      onClick={() => {
                        setEditMode(false);
                        // reset edits to current profile
                        setEditPhone(profile?.phone || '');
                        setEditAddress(profile?.home_address || '');
                        setEditBankName(profile?.bank_name || '');
                        setEditBankAccount(profile?.bank_account || '');
                      }}
                      className="inline-flex items-center gap-2 px-3 py-2 text-sm font-semibold rounded-lg border border-gray-200 hover:bg-gray-100"
                    >
                      <X size={16} />
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </motion.div>

            {/* --- MODIFIED: My Documents Card --- */}
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white p-6 rounded-xl shadow-sm border border-gray-200"
            >
              <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <ClipboardList className="w-5 h-5 text-[#FF5722]" />
                My Documents
              </h4>
              <div className="space-y-4">
                
                {/* Unsigned Contract */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 p-3 rounded-lg bg-gray-50 border border-gray-200">
                  <span className="flex items-center gap-2.5 font-medium text-gray-700 min-w-0">
                    <FileText size={16} className="text-gray-500 flex-shrink-0" />
                    <span className="truncate">{unsignedContract.name}</span>
                  </span>
                  <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto mt-2 sm:mt-0 sm:flex-shrink-0">
                    <button
                      onClick={() => handleViewPdf(unsignedContract.url, unsignedContract.name)}
                      className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border border-gray-300 hover:bg-gray-100"
                    >
                      <Eye size={14} /> View
                    </button>
                    <a
                      href={unsignedContract.url}
                      download="Employment_Contract_Unsigned.pdf"
                      className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border border-gray-300 hover:bg-gray-100"
                    >
                      <FileDown size={14} /> Download
                    </a>
                  </div>
                </div>

                {/* Signed Contract */}
                {signedDocument ? (
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 p-3 rounded-lg bg-green-50 border border-green-200">
                    <span className="flex items-center gap-2.5 font-medium text-green-800 min-w-0">
                      <CheckCircle size={16} className="text-green-600 flex-shrink-0" />
                      <span className="truncate" title={signedDocument.name}>{signedDocument.name}</span>
                    </span>
                    <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto mt-2 sm:mt-0 sm:flex-shrink-0">
                      <button
                        onClick={() => handleViewPdf(signedDocument.url, signedDocument.name)}
                        className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border border-green-300 text-green-800 hover:bg-green-100"
                      >
                        <Eye size={14} /> View
                      </button>
                      <a
                        href={signedDocument.url}
                        download={signedDocument.name}
                        className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border border-green-300 text-green-800 hover:bg-green-100"
                      >
                        <FileDown size={14} /> Download
                      </a>
                      <button
                        onClick={onRemoveSignedContract}
                        disabled={isRemovingDocument}
                        className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border border-red-300 text-red-700 bg-red-50 hover:bg-red-100 disabled:opacity-50"
                      >
                        {isRemovingDocument ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                        Remove
                      </button>
                    </div>
                  </div>
                ) : (
                  <label className="relative flex flex-col items-center justify-center p-6 rounded-lg border-2 border-dashed border-gray-300 hover:border-[#FF5722] hover:bg-orange-50 transition-colors cursor-pointer">
                    <input
                      type="file"
                      accept="application/pdf"
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      disabled={documentUploading}
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) onUploadSignedContract(file);
                      }}
                    />
                    {documentUploading ? (
                      <>
                        <Loader2 size={24} className="text-gray-500 animate-spin" />
                        <span className="mt-2 text-sm font-medium text-gray-600">Uploading...</span>
                      </>
                    ) : (
                      <>
                        <FileUp size={24} className="text-gray-400" />
                        <span className="mt-2 text-sm font-semibold text-[#FF5722]">Upload Signed Contract</span>
                        <span className="mt-1 text-xs text-gray-500">PDF only, max 10MB</span>
                      </>
                    )}
                  </label>
                )}
              </div>
            </motion.div>
            
            {/* Employment Details Card (moved down) */}
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

            {/* Financial Details Card (moved down) */}
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
    </div>
  );
};

export default EmployeeDashboardPage;