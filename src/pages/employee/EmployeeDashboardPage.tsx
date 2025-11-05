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
  X,
  LogOut, // <-- ADDED
  Home // <-- ADDED
} from 'lucide-react';
import { useToast } from '../../contexts/ToastContext';
import EmployeeAssignmentPanel from './EmployeeAssignmentPanel';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom'; // <-- ADDED

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


// --- NEW: Profile Edit Form Modal ---
const ProfileEditModal = ({ isOpen, onClose, profile, onSave, isSaving }) => {
  const [formData, setFormData] = useState({
    first_name: profile?.first_name || '',
    last_name: profile?.last_name || '',
    phone: profile?.phone || '',
    home_address: profile?.home_address || '',
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSave = () => {
    onSave(formData);
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
          <div className="grid grid-cols-2 gap-4">
            <label className="block">
              <span className="text-sm font-medium text-gray-700">First Name</span>
              <input type="text" name="first_name" value={formData.first_name} onChange={handleChange} className="mt-1 w-full p-2 border rounded-md bg-gray-50" />
            </label>
            <label className="block">
              <span className="text-sm font-medium text-gray-700">Last Name</span>
              <input type="text" name="last_name" value={formData.last_name} onChange={handleChange} className="mt-1 w-full p-2 border rounded-md bg-gray-50" />
            </label>
          </div>
          <label className="block">
            <span className="text-sm font-medium text-gray-700">Phone</span>
            <input type="tel" name="phone" value={formData.phone} onChange={handleChange} className="mt-1 w-full p-2 border rounded-md bg-gray-50" />
          </label>
          <label className="block">
            <span className="text-sm font-medium text-gray-700">Home Address</span>
            <input type="text" name="home_address" value={formData.home_address} onChange={handleChange} className="mt-1 w-full p-2 border rounded-md bg-gray-50" />
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

// --- Main Employee Dashboard Page ---
const EmployeeDashboardPage: React.FC = () => {
  const { user, profile, logout } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const [assignments, setAssignments] = useState<any[]>([]);
  const [documents, setDocuments] = useState<EmployeeDocument[]>([]);
  const [selectedAssignment, setSelectedAssignment] = useState<any | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [viewingPdf, setViewingPdf] = useState<string | null>(null);
  const [viewingPdfTitle, setViewingPdfTitle] = useState<string>('');
  
  const [isEditingProfile, setIsEditingProfile] = useState(false); // <-- NEW STATE
  const [isSavingProfile, setIsSavingProfile] = useState(false); // <-- NEW STATE

  // --- UPDATED LOGIC FOR handleSaveProfile ---
  const handleSaveProfile = async (formData: any) => {
    if (!user) return;
    setIsSavingProfile(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update(formData)
        .eq('id', user.id);

      if (error) throw error;
      addToast({ type: 'success', title: 'Profile Updated!', message: 'Changes will reflect on next reload.' });
      setIsEditingProfile(false);
      // Force a soft refresh of auth state or simply prompt for manual reload
      setTimeout(() => window.location.reload(), 1500);
    } catch (err: any) {
      addToast({ type: 'error', title: 'Update Failed', message: err.message });
    } finally {
      setIsSavingProfile(false);
    }
  };

  // --- LOGIC FOR handleLogout ---
  const handleLogout = async () => {
    try {
      await logout();
      navigate('/my-page');
    } catch (err: any) {
      addToast({ type: 'error', title: 'Logout Failed', message: err.message });
    }
  };
  // ------------------------------------

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

    // ... (rest of useEffect remains unchanged)
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

  // Simplified version of handleSignDocument just to avoid breaking
  const handleSignDocument = async () => {
    addToast({ type: 'info', title: 'Action Disabled', message: 'Document signing is currently disabled in the live demo.' });
  };


  const getStatusProps = (status: string) => {
    switch (status) {
      case 'completed': return { icon: CheckCircle, color: 'text-green-500', label: 'Completed' };
      case 'in_progress': return { icon: Clock, color: 'text-blue-500', label: 'In Progress' };
      case 'overdue': return { icon: AlertCircle, color: 'text-red-500', label: 'Overdue' };
      default: return { icon: List, color: 'text-yellow-500', label: status };
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
      {/* --- NEW: Fixed Top Bar (Navigation) --- */}
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
          
          {/* --- NEW: Hero Section --- */}
          <div className="relative p-8 md:p-10 bg-gradient-to-r from-blue-600 to-indigo-700 rounded-xl shadow-lg text-white mb-8">
            <motion.div initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.5 }}>
              <div className="flex items-center gap-6">
                <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center text-white text-3xl font-bold border-2 border-white">
                  {profile.first_name?.[0] || 'E'}
                </div>
                <div>
                  <h1 className="text-3xl font-bold">Welcome, {profile.first_name}!</h1>
                  <p className="text-indigo-200">{profile.position || 'Employee'}</p>
                </div>
              </div>
            </motion.div>
          </div>
          {/* --- END: Hero Section --- */}


          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Left Column: Assignments & Documents (lg:col-span-2) */}
            <div className="lg:col-span-2 space-y-8">
              
              {/* Assignments Section */}
              <section className="bg-white p-6 rounded-xl shadow-md border border-gray-200">
                <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2 mb-4">
                  <List className="text-gray-500" /> My Active Assignments
                </h2>
                {assignments.length === 0 ? (
                  <div className="text-center p-10">
                      <Inbox size={48} className="mx-auto text-gray-300" />
                      <h3 className="mt-4 font-semibold text-gray-700">All caught up!</h3>
                      <p className="text-sm text-gray-500">You have no active assignments.</p>
                    </div>
                ) : (
                  <div className="space-y-3">
                    {assignments.map(assignment => {
                      const { icon: Icon, color, label } = getStatusProps(assignment.status);
                      return (
                        <button
                          key={assignment.id}
                          onClick={() => handleAssignmentClick(assignment.id)}
                          className={`w-full p-4 bg-gray-50 rounded-lg text-left transition-all border ${
                            selectedAssignment?.id === assignment.id ? 'ring-2 ring-[#FF5722] border-[#FF5722]' : 'hover:bg-gray-100 border-gray-200'
                          }`}
                        >
                          <div className="flex justify-between items-center">
                            <span className="font-semibold text-gray-800">{assignment.title}</span>
                            <span className={`flex items-center text-xs font-medium gap-1.5 px-3 py-1 rounded-full ${color.replace('text-', 'bg-').replace('500', '100')} ${color}`}>
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
                            <span className="text-xs text-green-600 font-medium flex items-center gap-1 mt-0.5"><CheckCircle size={12} /> Signed</span>
                          )}
                          {!doc.requires_signing && (
                            <span className="text-xs text-blue-600 font-medium mt-0.5">Reference Document</span>
                          )}
                        </div>
                        <button 
                          onClick={() => handleViewDocument(doc)}
                          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-[#FF5722] text-white hover:bg-[#E64A19] transition-colors"
                        >
                          <Eye size={14} /> View
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </section>
            </div>
            
            {/* Right Column: Profile Details (lg:col-span-1) */}
            <aside className="lg:col-span-1 space-y-6">
              
              {/* Profile Card */}
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
              
               {/* Employment Card (Read-only sensitive data) */}
              <div className="bg-white p-6 rounded-xl shadow-md border border-gray-200">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">Employment Details</h2>
                <div className="space-y-2">
                  <InfoRow icon={Briefcase} label="Position" value={profile.position} />
                  <InfoRow icon={Hash} label="Employee #" value={profile.employee_number} />
                  <InfoRow icon={Calendar} label="Start Date" value={formatDate(profile.start_date)} />
                  <InfoRow icon={DollarSign} label="Salary" value={profile.salary ? `GHS ${profile.salary}` : 'N/A'} />
                  <InfoRow icon={Building} label="Bank" value={profile.bank_name} />
                  <InfoRow icon={CreditCard} label="Account #" value={profile.bank_account} />
                </div>
              </div>
            </aside>
            
          </div>
        </div>
      </main>

      {/* Assignment Detail Panel (kept) */}
      <EmployeeAssignmentPanel
        assignment={selectedAssignment}
        onClose={() => setSelectedAssignment(null)}
        onPostComment={handlePostComment}
        onUpdateStatus={handleUpdateStatus}
      />
      
      {/* PDF Viewer Modal (kept) */}
      <AnimatePresence>
        {viewingPdf && <PdfViewerModal pdfUrl={viewingPdf} title={viewingPdfTitle} onClose={() => setViewingPdf(null)} />}
      </AnimatePresence>

      {/* --- NEW: Profile Edit Modal (Component added) --- */}
      <ProfileEditModal
        isOpen={isEditingProfile}
        onClose={() => setIsEditingProfile(false)}
        profile={profile}
        onSave={handleSaveProfile}
        isSaving={isSavingProfile}
      />
    </div>
  );
};

export default EmployeeDashboardPage;