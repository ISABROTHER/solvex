// @ts-nocheck
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from '../../../../lib/supabase/client';
import type { Database } from '../../../../lib/supabase/database.types';
import { useAuth } from '../../../../features/auth/AuthProvider';
import Card from '../components/Card';
import { 
  Loader2, 
  User, 
  Search, 
  AlertCircle, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar, 
  Hash, 
  FileText, 
  DollarSign, 
  Building, 
  CreditCard,
  Briefcase,
  ClipboardList,
  Eye,
  FileDown,
  Clock,
  CheckCircle,
  Plus,
  Send,
  X,
  FileUp,
  Trash2,
  Edit2,
  PlusCircle,
  Download,
  UploadCloud,
  ChevronDown,
  AlertTriangle,
  ShieldCheck,
  List,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useToast } from '../../../../contexts/ToastContext';
import EmployeeEditModal from '../components/EmployeeEditModal';
import CreateAssignmentModal from '../components/CreateAssignmentModal'; 

// --- 1. IMPORT NEW FUNCTIONS ---
import AssignmentDetailPanel from '../components/AssignmentDetailPanel';
import {
  getAssignmentsForEmployee,
  getFullAssignmentDetails,
  createAssignment,
  updateAssignmentStatus,
  postAssignmentComment,
  getEmployeeDocuments,
  uploadEmployeeDocument,
  deleteEmployeeDocument,
  createDocumentSignedUrl,
  EmployeeDocument, 
  // --- IMPORTED NEW MANAGEMENT FUNCTIONS ---
  deleteEmployeeAccount, 
  blockEmployeeAccess 
} from '../../../../lib/supabase/operations';


// --- TYPE DEFINITIONS ---
export type Profile = Database['public']['Tables']['profiles']['Row'];
// --- 2. REMOVE MOCK DOCUMENTS ---
// const MOCK_DOCUMENTS: EmployeeDocument[] = [ ... ];


// --- Helper Function ---
const formatDate = (dateString: string | null) => {
  if (!dateString) return 'N/A';
  const d = new Date(dateString);
  if (isNaN(d.getTime())) return 'N/A';
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
};


// --- Reusable InfoRow ---
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

// --- Reusable PDF Viewer (Unchanged) ---
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
           {/* Use Google Docs viewer as a fallback for universal compatibility */}
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

// --- MAIN TAB COMPONENT ---
const EmployeesTab: React.FC = () => {
  const { user } = useAuth();
  const { addToast } = useToast();
  const [employees, setEmployees] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [selectedEmployee, setSelectedEmployee] = useState<Profile | null>(null);
  const [editingEmployee, setEditingEmployee] = useState<Partial<Profile> | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  
  const [searchQuery, setSearchQuery] = useState('');

  // --- Document States (Unchanged) ---
  const [documents, setDocuments] = useState<EmployeeDocument[]>([]);
  const [loadingDocs, setLoadingDocs] = useState(false);
  const [isUploadingDoc, setIsUploadingDoc] = useState(false);
  const [newDocName, setNewDocName] = useState('');
  const [newDocFile, setNewDocFile] = useState<File | null>(null);
  const [newDocRequiresSigning, setNewDocRequiresSigning] = useState(false);
  const [docUploadError, setDocUploadError] = useState<string | null>(null);
  const [showDocUpload, setShowDocUpload] = useState(false);

  // PDF Viewer
  const [viewingPdf, setViewingPdf] = useState<string | null>(null);
  const [viewingPdfTitle, setViewingPdfTitle] = useState<string>('');

  // --- State for Assignments (Unchanged) ---
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loadingAssignments, setLoadingAssignments] = useState(false);
  const [isCreateAssignModalOpen, setIsCreateAssignModalOpen] = useState(false);
  const [isSavingAssignment, setIsSavingAssignment] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null);

  const fetchData = useCallback(async () => {
    setError(null);
    try {
      const { data: employeesData, error: employeesError } = await supabase
        .from('profiles')
        .select('*')
        // --- FIX: Query for employee, admin, AND blocked users ---
        .in('role', ['employee', 'admin', 'blocked']) 
        .order('first_name');
      if (employeesError) throw employeesError;
      setEmployees(employeesData || []);
    } catch (err: any) {
      console.error('Error fetching employee data:', err);
      setError('Failed to load employee data. Check RLS policies.');
    } finally {
      setLoading(false);
    }
  }, []);
  
  useEffect(() => {
    fetchData(); 
  }, [fetchData]);

  // --- Management Handlers (NEW) ---
  const handleBlockAccess = async (employee: Profile) => {
    if (employee.role === 'admin') {
      addToast({ type: 'error', title: 'Action Denied', message: 'Cannot block an Admin through this panel.' });
      return;
    }

    const newRole = employee.role === 'blocked' ? 'employee' : 'blocked';
    const action = newRole === 'blocked' ? 'BLOCK' : 'UNBLOCK';
    
    if (window.confirm(`Are you sure you want to ${action} access for ${employee.first_name} ${employee.last_name}?`)) {
      const { error } = await blockEmployeeAccess(employee.id, newRole);
      if (error) {
        addToast({ type: 'error', title: 'Action Failed', message: error.message });
      } else {
        addToast({ type: 'success', title: 'Access Updated', message: `${employee.first_name}'s access is now ${newRole}.` });
        fetchData(); // Refresh employee list
        if (selectedEmployee?.id === employee.id) setSelectedEmployee(prev => prev ? { ...prev, role: newRole } : null);
      }
    }
  };

  const handleDeleteEmployee = async (employee: Profile) => {
    if (employee.role === 'admin') {
      addToast({ type: 'error', title: 'Action Denied', message: 'Admins must be demoted or removed manually from the database first.' });
      return;
    }

    const employeeName = `${employee.first_name} ${employee.last_name}`;

    if (window.confirm(`WARNING: Are you absolutely sure you want to PERMANENTLY DELETE ${employeeName}? This action is irreversible and will delete their AUTH account and all associated PROFILE data.`)) {
      
      const { error } = await deleteEmployeeAccount(employee.id);
      
      if (error) {
        addToast({ type: 'error', title: 'Deletion Failed', message: error.message });
      } else {
        addToast({ type: 'success', title: 'Employee Deleted', message: `${employeeName} was permanently removed.` });
        
        // Update UI
        if (selectedEmployee?.id === employee.id) setSelectedEmployee(null);
        fetchData(); // Refresh list
      }
    }
  };
  // --- End Management Handlers ---

  // --- Function to fetch assignments (Unchanged) ---
  const fetchAssignments = async (profileId: string) => {
    setLoadingAssignments(true);
    try {
      const { data, error } = await getAssignmentsForEmployee(profileId);
      if (error) throw error;
      setAssignments(data || []);
    } catch (err: any) {
      addToast({ type: 'error', title: 'Error Fetching Assignments', message: err.message });
    } finally {
      setLoadingAssignments(false);
    }
  };
  
  // --- Function to fetch documents (Unchanged) ---
  const fetchDocuments = async (profileId: string) => {
      setLoadingDocs(true);
      try {
          const { data, error } = await getEmployeeDocuments(profileId);
          if (error) throw error;
          setDocuments(data || []);
      } catch (err: any) {
          addToast({ type: 'error', title: 'Error Fetching Documents', message: err.message });
      } finally {
          setLoadingDocs(false);
      }
  };
  
  // --- Fetch data on employee selection (Unchanged) ---
  useEffect(() => {
      if (selectedEmployee) {
          fetchDocuments(selectedEmployee.id);
          fetchAssignments(selectedEmployee.id);
      } else {
          setDocuments([]); 
          setAssignments([]);
      }
      // Reset upload form
      setShowDocUpload(false);
      setNewDocName('');
      setNewDocFile(null);
      setNewDocRequiresSigning(false);
      setDocUploadError(null);
      
  }, [selectedEmployee]);

  // Filter employees
  const filteredEmployees = useMemo(() => {
    const q = searchQuery.toLowerCase();
    if (!q) return employees;
    return employees.filter(e =>
      (e.first_name || '').toLowerCase().includes(q) ||
      (e.last_name || '').toLowerCase().includes(q) ||
      (e.email || '').toLowerCase().includes(q) ||
      (e.position || '').toLowerCase().includes(q)
    );
  }, [employees, searchQuery]);
  
  // --- Employee Modal Handlers (Unchanged) ---
  const handleEditEmployee = (e: React.MouseEvent, employee: Profile) => {
    e.stopPropagation(); 
    setEditingEmployee(employee);
    setIsModalOpen(true);
  };
  const handleAddNewEmployee = () => {
    setEditingEmployee({}); 
    setIsModalOpen(true);
  };
  
  // --- Employee Save/Create Handler (Unchanged) ---
  const handleSaveEmployee = async (formData: Partial<Profile>, password?: string) => {
    setIsSavingProfile(true);
    const isNewUser = !formData.id;
    
    try {
      if (isNewUser) {
        // --- Create New Employee ---
        if (!formData.email || !password) {
           addToast({ type: 'error', title: 'Error', message: 'Email and password are required for new employees.'});
           setIsSavingProfile(false);
           return;
        }
        
        const { data: authData, error: authError } = await supabase.auth.signUp({
          email: formData.email,
          password: password,
        });
        
        let userId = authData.user?.id;

        if (authError && authError.message.includes('User already registered')) {
            // --- THIS IS THE FIX ---
            // The user exists in auth. Let's try to find their profile and update it.
            addToast({ type: 'warning', title: 'User Exists', message: 'User already in Auth. Trying to find and update their profile...' });
            
            const { data: existingProfile, error: profileFindError } = await supabase
              .from('profiles')
              .select('id')
              .eq('email', formData.email)
              .single();

            if (profileFindError || !existingProfile) {
                // This is the "ghost" user problem.
                // Auth user is deleted, identity is not. Profile is (maybe) deleted.
                // We can't create a new auth user, and we can't find a profile to update.
                addToast({ type: 'error', title: 'Creation Failed', message: 'This email is in a "ghost" state. Please try again in 24 hours, or use a different email.' });
                setIsSavingProfile(false);
                return;
            }

            // We found their profile. Let's update it.
            userId = existingProfile.id;
            const { error: updateError } = await supabase
              .from('profiles')
              .update({ ...formData, role: 'employee' }) // Ensure role is set
              .eq('id', userId);

            if (updateError) throw updateError;
            addToast({ type: 'success', title: 'Employee Updated', message: 'This user already existed, and their profile has been updated.' });

        } else if (authError) {
            // A different, unexpected auth error
            throw authError;
        
        } else {
            // --- Sign Up was successful (this is the normal path) ---
            if (!userId) throw new Error('Could not get user ID after sign up.');
            
            const profileData = {
              ...formData,
              id: userId, // Link profile to auth user
              role: 'employee',
            };
            
            const { error: profileError } = await supabase
              .from('profiles')
              .insert(profileData);
              
            if (profileError) throw profileError;
            
            addToast({ type: 'success', title: 'Employee Created!', message: `${formData.email} can now log in.` });
        }

      } else {
        // --- Update Existing Employee (this logic is fine) ---
        const { error: updateError } = await supabase
          .from('profiles')
          .update(formData)
          .eq('id', formData.id);
          
        if (updateError) throw updateError;
        addToast({ type: 'success', title: 'Employee Updated!' });
      }
      
      setIsModalOpen(false);
      setEditingEmployee(null);
      fetchData(); // Refetch employee list
      
    } catch (err: any) {
      console.error("Save employee error:", err);
      addToast({ type: 'error', title: 'Save Failed', message: err.message });
    } finally {
      setIsSavingProfile(false);
    }
  };
  
  // --- Document Handlers (Unchanged) ---
  const handleViewPdf = (url: string, title: string) => {
    // For admin, just use the public URL
    setViewingPdf(url);
    setViewingPdfTitle(title);
  };
  
  // --- Document Upload Handler (Unchanged) ---
  const handleUploadDocument = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDocFile || !newDocName.trim() || !selectedEmployee) {
        setDocUploadError("Document name and file are required.");
        return;
    }
    setIsUploadingDoc(true);
    setDocUploadError(null);
    try {
      const newDoc = await uploadEmployeeDocument(
        selectedEmployee.id,
        newDocName.trim(),
        newDocRequiresSigning,
        newDocFile
      );
      
      setDocuments(prev => [newDoc, ...prev]);
      addToast({ type: 'success', title: 'Document Uploaded!' });
      
      // Reset form
      setNewDocName('');
      setNewDocFile(null);
      setNewDocRequiresSigning(false);
      setShowDocUpload(false);
      
    } catch (err: any) {
      setDocUploadError(err.message);
      addToast({ type: 'error', title: 'Upload Failed', message: err.message });
    } finally {
      setIsUploadingDoc(false);
    }
  };

  // --- Document Delete Handler (Unchanged) ---
  const handleDeleteDocument = async (doc: EmployeeDocument) => {
    if (!window.confirm(`Are you sure you want to delete "${doc.document_name}"?`)) return;
    try {
      await deleteEmployeeDocument(doc);
      setDocuments(prev => prev.filter(d => d.id !== doc.id));
      addToast({ type: 'success', title: 'Document Deleted' });
    } catch (err: any) {
      addToast({ type: 'error', title: 'Delete Failed', message: err.message });
    }
  };
  
  // --- Assignment Handlers (Unchanged) ---
  const handleOpenCreateAssignment = () => {
    setIsCreateAssignModalOpen(true);
  };
  
  const handleSaveAssignment = async (data: any) => {
    if (!user) return;
    setIsSavingAssignment(true);
    try {
      const { error } = await createAssignment(data, user.id);
      if (error) throw error;
      
      addToast({ type: 'success', title: 'Assignment Created!' });
      setIsCreateAssignModalOpen(false);
      if(selectedEmployee) fetchAssignments(selectedEmployee.id);
    } catch (err: any) {
      addToast({ type: 'error', title: 'Creation Failed', message: err.message });
    } finally {
      setIsSavingAssignment(false);
    }
  };
  
  const handleUpdateStatus = async (newStatus: string) => {
    if (!selectedAssignment) return;
    
    // Optimistic update
    const oldAssignment = selectedAssignment;
    const oldList = assignments;
    setSelectedAssignment(prev => prev ? { ...prev, status: newStatus } : null);
    setAssignments(prev =>
      prev.map(a => a.id === selectedAssignment.id ? { ...a, status: newStatus } : a)
    );
    
    // Real update
    const { error } = await updateAssignmentStatus(selectedAssignment.id, newStatus);
    if (error) {
      addToast({ type: 'error', title: 'Status Update Failed' });
      setSelectedAssignment(oldAssignment); // Revert
      setAssignments(oldList);
    } else {
      addToast({ type: 'info', title: 'Status Updated' });
    }
  };
  
  const handlePostComment = async (comment: string) => {
    if (!selectedAssignment || !user) return;
    const { error } = await postAssignmentComment(selectedAssignment.id, user.id, comment);
    if (error) {
      addToast({ type: 'error', title: 'Comment Failed to Send' });
    } else {
      addToast({ type: 'success', title: 'Comment Posted!' });
      // Refetch details to show new comment
      handleAssignmentClick(selectedAssignment);
    }
  };

  const handleAssignmentClick = async (assignment: Assignment) => {
    setLoadingAssignments(true);
    setSelectedAssignment(null); // Clear first
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
  
  const handleApprove = (id: string) => addToast({ type: 'success', title: 'Deliverable Approved (Mock)!' });
  const handleRequestEdits = (id: string, msg: string) => addToast({ type: 'info', title: 'Edits Requested (Mock)' });
  

  if (loading && employees.length === 0) {
    return <div className="flex justify-center py-20"><Loader2 className="w-10 h-10 animate-spin text-gray-400" /></div>;
  }
  
  if (error) {
    return <div className="text-center py-20 text-red-600 flex flex-col items-center gap-3"><AlertCircle className="w-6 h-6" />{error}</div>;
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
      {/* --- Column 1: Employee List --- */}
      <Card className="lg:col-span-1 flex flex-col" title="Employees">
        <button
          onClick={handleAddNewEmployee}
          className="w-full mb-4 flex items-center justify-center gap-2 px-4 py-2.5 bg-[#FF5722] text-white text-sm font-semibold rounded-lg hover:bg-[#E64A19] transition-colors"
        >
          <PlusCircle size={18} />
          Add New Employee
        </button>
        
        <div className="relative mb-4">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Search employees..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 pr-3 py-2 text-sm rounded-lg border border-gray-300 w-full"
          />
        </div>
        <div className="flex-1 overflow-y-auto -mr-6 -ml-6 pr-3 pl-6">
          <div className="space-y-2">
            {filteredEmployees.map(employee => (
              <div
                key={employee.id}
                onClick={() => setSelectedEmployee(employee)}
                className={`w-full flex items-center justify-between gap-3 p-3 rounded-lg text-left transition-colors cursor-pointer ${
                  selectedEmployee?.id === employee.id ? 'bg-[#FF5722]/10' : 'hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  {employee.avatar_url ? (
                    <img src={employee.avatar_url} alt="avatar" className="w-10 h-10 rounded-full object-cover" />
                  ) : (
                    <span className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                      <User size={20} className="text-gray-500" />
                    </span>
                  )}
                  <div className="min-w-0">
                    <p className="font-semibold text-gray-900 truncate">{employee.first_name} {employee.last_name}</p>
                    <p className="text-sm text-gray-500 truncate">{employee.position || 'No position'}</p>
                    {/* NEW: Role Badge for quick status check */}
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full mt-0.5 ${
                        employee.role === 'admin' ? 'bg-indigo-100 text-indigo-800' : 
                        employee.role === 'blocked' ? 'bg-red-100 text-red-800' : 
                        'bg-green-100 text-green-800'
                    }`}>
                      {employee.role || 'employee'}
                    </span>
                  </div>
                </div>
                {/* NEW: Management Actions Dropdown/Menu for Mobile/Compact View (Optional alternative to a dedicated column) */}
                <div className="flex space-x-2 flex-shrink-0">
                    <button
                      onClick={(e) => { e.stopPropagation(); handleEditEmployee(e, employee); }}
                      className="p-2 rounded-full text-gray-400 hover:bg-gray-200 hover:text-gray-700 transition-colors"
                      title={`Edit ${employee.first_name}`}
                    >
                      <Edit2 size={16} />
                    </button>
                    
                    <button 
                        onClick={(e) => { e.stopPropagation(); handleBlockAccess(employee); }}
                        className={`p-2 rounded-full text-white transition-colors ${employee.role === 'blocked' ? 'bg-green-500 hover:bg-green-600' : 'bg-yellow-500 hover:bg-yellow-600'}`}
                        title={employee.role === 'blocked' ? 'Unblock Access' : 'Block Access'}
                        disabled={employee.role === 'admin'}
                    >
                        {employee.role === 'blocked' ? <ShieldCheck size={16} /> : <AlertTriangle size={16} />}
                    </button>

                    <button 
                        onClick={(e) => { e.stopPropagation(); handleDeleteEmployee(employee); }}
                        className="p-2 rounded-full bg-red-100 text-red-600 hover:bg-red-200 transition-colors"
                        title="Delete Employee"
                    >
                        <Trash2 size={16} />
                    </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Card>

      {/* --- Column 2: Selected Employee Details --- */}
      <div className="lg:col-span-2 space-y-6">
        {!selectedEmployee ? (
          <Card className="flex items-center justify-center h-full min-h-[400px]">
            <p className="text-gray-500">Select an employee to view their details</p>
          </Card>
        ) : (
          <AnimatePresence>
            <motion.div
              key={selectedEmployee.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              {/* Profile & Contact Card (Unchanged) */}
              <Card title="Profile & Contact">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <InfoRow icon={Mail} label="Email" value={selectedEmployee.email} />
                  <InfoRow icon={Phone} label="Phone" value={selectedEmployee.phone} />
                  <InfoRow icon={MapPin} label="Address" value={selectedEmployee.home_address} />
                  <InfoRow icon={Calendar} label="Birth Date" value={formatDate(selectedEmployee.birth_date)} />
                </div>
              </Card>

              {/* Employment Details Card (Unchanged) */}
              <Card title="Employment Details">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <InfoRow icon={Briefcase} label="Position" value={selectedEmployee.position} />
                  <InfoRow icon={Hash} label="Employee #" value={selectedEmployee.employee_number} />
                  <InfoRow icon={Calendar} label="Start Date" value={formatDate(selectedEmployee.start_date)} />
                  <InfoRow icon={FileText} label="National ID" value={selectedEmployee.national_id} />
                  <InfoRow icon={DollarSign} label="Salary" value={selectedEmployee.salary ? `GHS ${selectedEmployee.salary}` : 'N/A'} />
                  <InfoRow icon={Building} label="Bank" value={selectedEmployee.bank_name} />
                  <InfoRow icon={CreditCard} label="Account #" value={selectedEmployee.bank_account} />
                </div>
              </Card>
              
              {/* Documents Card (Unchanged) */}
              <Card title="Documents">
                <div className="space-y-4">
                  <h4 className="font-medium text-gray-800">Employee Documents</h4>
                  {loadingDocs ? (
                    <div className="flex justify-center py-4"><Loader2 className="w-5 h-5 animate-spin text-gray-400" /></div>
                  ) : documents.length === 0 ? (
                    <p className="text-sm text-gray-500 text-center py-2">No documents uploaded for this employee.</p>
                  ) : (
                    <div className="space-y-3">
                      {documents.map(doc => {
                        const isSigned = doc.requires_signing && doc.signed_storage_url;
                        const isPending = doc.requires_signing && !doc.signed_storage_url;
                        const isViewOnly = !doc.requires_signing;

                        return (
                          <div key={doc.id} className={`p-3 rounded-lg bg-gray-50 border ${isPending ? 'border-yellow-300' : 'border-gray-200'}`}>
                            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                              {/* Left Side: Name and Status */}
                              <div className="min-w-0">
                                <p className="font-semibold text-gray-800 truncate">{doc.document_name}</p>
                                {isViewOnly && (
                                  <span className="flex items-center gap-1.5 text-xs font-medium text-blue-600">
                                    <ShieldCheck size={14} /> View Only
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
                              {/* Right Side: Buttons */}
                              <div className="flex gap-2 sm:flex-shrink-0 w-full sm:w-auto">
                                <button
                                  onClick={() => handleViewPdf(doc.storage_url, doc.document_name)}
                                  className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border border-gray-300 hover:bg-gray-100"
                                >
                                  <Eye size={14} /> View
                                </button>
                                {isSigned && (
                                  <button
                                    onClick={() => handleViewPdf(doc.signed_storage_url!, `(SIGNED) ${doc.document_name}`)}
                                    className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border border-green-300 text-green-700 bg-green-50 hover:bg-green-100"
                                  >
                                    <Eye size={14} /> View Signed
                                  </button>
                                )}
                                <button
                                  onClick={() => handleDeleteDocument(doc)}
                                  className="sm:flex-none inline-flex items-center justify-center gap-1.5 px-2 py-1.5 text-xs font-semibold rounded-lg border border-gray-300 text-gray-500 hover:bg-red-50 hover:border-red-200 hover:text-red-600"
                                >
                                  <Trash2 size={14} />
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* --- Upload Form Toggle Button --- */}
                  <div className="border-t pt-4">
                    <button
                      onClick={() => setShowDocUpload(!showDocUpload)}
                      className="w-full flex items-center justify-between px-4 py-2.5 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-semibold text-gray-700"
                    >
                      <span className="flex items-center gap-2">
                        <UploadCloud size={16} />
                        Upload New Document
                      </span>
                      <ChevronDown size={18} className={`transition-transform ${showDocUpload ? 'rotate-180' : ''}`} />
                    </button>
                  </div>

                  {/* --- Collapsible Upload Form --- */}
                  <AnimatePresence>
                    {showDocUpload && (
                      <motion.form
                        initial={{ opacity: 0, height: 0, marginTop: 0 }}
                        animate={{ opacity: 1, height: 'auto', marginTop: '16px' }}
                        exit={{ opacity: 0, height: 0, marginTop: 0 }}
                        onSubmit={handleUploadDocument} 
                        className="space-y-4 p-4 bg-gray-50 border border-gray-200 rounded-lg overflow-hidden"
                      >
                        {docUploadError && (
                          <div className="p-3 bg-red-100 border border-red-300 text-red-700 rounded-lg flex items-center gap-2 text-sm">
                            <AlertCircle size={16} /> {docUploadError}
                          </div>
                        )}
                        <div>
                          <label className="text-sm font-medium text-gray-700">Document Name *</label>
                          <input
                            type="text"
                            value={newDocName}
                            onChange={(e) => setNewDocName(e.target.value)}
                            placeholder="e.g., Employment Contract"
                            className="mt-1 w-full px-3 py-2 rounded-lg border border-gray-300"
                          />
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-700">File *</label>
                          <input
                            type="file"
                            onChange={(e) => setNewDocFile(e.target.files ? e.target.files[0] : null)}
                            className="mt-1 w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-[#FF5722]/10 file:text-[#FF5722] hover:file:bg-[#FF5722]/20"
                          />
                        </div>
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            id="requires_signing"
                            checked={newDocRequiresSigning}
                            onChange={(e) => setNewDocRequiresSigning(e.target.checked)}
                            className="h-4 w-4 rounded text-[#FF5722] focus:ring-[#FF5722]"
                          />
                          <label htmlFor="requires_signing" className="text-sm font-medium text-gray-700">
                            Requires employee signature
                          </label>
                        </div>
                        
                        <button
                          type="submit"
                          disabled={isUploadingDoc || !newDocFile || !newDocName}
                          className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 disabled:opacity-50"
                        >
                          {isUploadingDoc ? <Loader2 size={16} className="animate-spin" /> : <UploadCloud size={16} />} 
                          {isUploadingDoc ? 'Uploading...' : 'Upload Document'}
                        </button>
                      </motion.form>
                    )}
                  </AnimatePresence>
                </div>
              </Card>

              {/* --- ASSIGNMENTS CARD (Live) --- */}
              <Card>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <List size={20} /> Assignments
                  </h3>
                  <button
                    onClick={handleOpenCreateAssignment}
                    className="inline-flex items-center gap-2 px-3 py-1.5 text-xs font-semibold rounded-lg bg-blue-100 text-blue-700 hover:bg-blue-200"
                  >
                    <PlusCircle size={16} />
                    Create New
                  </button>
                </div>
                
                {loadingAssignments ? (
                  <div className="flex justify-center py-4"><Loader2 className="w-5 h-5 animate-spin text-gray-400" /></div>
                ) : assignments.length === 0 ? (
                  <p className="text-sm text-gray-500 text-center py-4">No assignments for this employee.</p>
                ) : (
                  <div className="space-y-3">
                    {assignments.map(assignment => (
                      <button 
                        key={assignment.id} 
                        onClick={() => handleAssignmentClick(assignment)}
                        className="w-full flex items-center justify-between p-3 rounded-lg bg-gray-50 border border-gray-200 hover:bg-gray-100 text-left"
                      >
                        <div className="min-w-0">
                          <p className="font-medium text-gray-800 truncate">{assignment.title}</p>
                          <p className="text-sm text-gray-500">Due: {formatDate(assignment.due_date)}</p>
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
              </Card>
            </motion.div>
          </AnimatePresence>
        )}
      </div>

      {/* --- Modals & Panels (Unchanged) --- */}
      <AnimatePresence>
        {viewingPdf && <PdfViewerModal pdfUrl={viewingPdf} title={viewingPdfTitle} onClose={() => setViewingPdf(null)} />}
      </AnimatePresence>
      
      <EmployeeEditModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingEmployee(null);
        }}
        employee={editingEmployee}
        onSave={handleSaveEmployee}
        isSaving={isSavingProfile}
      />
      
      <CreateAssignmentModal
        isOpen={isCreateAssignModalOpen}
        onClose={() => setIsCreateAssignModalOpen(false)}
        onSave={handleSaveAssignment}
        isSaving={isSavingAssignment}
        employees={employees} 
      />
      
      <AssignmentDetailPanel
        assignment={selectedAssignment}
        onClose={() => setSelectedAssignment(null)}
        onUpdateStatus={handleUpdateStatus}
        onPostComment={handlePostComment}
        onApproveDeliverable={handleApprove}
        onRequestEdits={handleRequestEdits}
      />
    </div>
  );
};

export default EmployeesTab;