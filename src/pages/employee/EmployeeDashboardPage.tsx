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
  Edit3,
  Save,
  X,
  Upload,
  ClipboardList,
  FileDown,
  FileUp,
  Eye,
  Trash2,
  Home
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useToast } from '../../contexts/ToastContext';
import AssignmentsSection from './components/AssignmentsSection'; // <-- 1. IMPORT THE NEW SECTION

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

// --- TASK INTERFACE (REMOVED) ---
// --- TASKITEM COMPONENT (REMOVED) ---

// --- HELPERS ---

const formatDate = (dateString: string | null) => {
  if (!dateString) return 'N/A';
  const d = new Date(dateString);
  if (isNaN(d.getTime())) return 'N/A';
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
};

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

// --- MAIN ---

const EmployeeDashboardPage: React.FC = () => {
  const { user, logout } = useAuth();
  const { addToast } = useToast();
  const [profile, setProfile] = useState<Profile | null>(null);
  // --- TASKS STATE (REMOVED) ---
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // --- TASK UI STATES (REMOVED) ---

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
  const [isRemovingDocument, setIsRemovingDocument] = useState(false);
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

      // --- TASK FETCHING (REMOVED) ---

    } catch (err) {
      console.error('Unexpected error:', err);
      setError('Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  // --- updateTaskStatus (REMOVED) ---
  // --- filteredTasks (REMOVED) ---
  // --- stats (REMOVED) ---

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
            {/* --- TASK SUMMARY BUTTON (REMOVED) --- */}
          </div>
        </div>

        {/* --- TASK SUMMARY (REMOVED) --- */}
     
        {/* Grid: Main content (Tasks) on left, Sidebar (Profile) on right for desktop */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">

          {/* --- MAIN CONTENT (ASSIGNMENTS) --- */}
          {/* This is the new section that replaces the old tasks */}
          <div className="lg:col-span-3 space-y-6">
            <AssignmentsSection />
          </div>

          {/* --- SIDEBAR (PROFILE) --- */}
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

            {/* My Documents Card */}
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
            
            {/* Employment Details Card */}
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

            {/* Financial Details Card */}
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