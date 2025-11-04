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
  List, // <-- 1. IMPORT List
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useToast } from '../../../../contexts/ToastContext';
import EmployeeEditModal from '../components/EmployeeEditModal';
// 2. IMPORT THE ASSIGNMENT COMPONENTS FROM LAST TIME
import CreateAssignmentModal from '../components/CreateAssignmentModal'; 
import AssignmentDetailPanel from '../components/AssignmentDetailPanel';
// 3. IMPORT THE NEW ASSIGNMENT TYPES (we'll move these to a shared file later)
import { Assignment, Milestone, AssignmentComment } from './AssignmentsTab'; 

// --- TYPE DEFINITIONS ---
export type Profile = Database['public']['Tables']['profiles']['Row'];
// 4. THIS TYPE IS NOW DEPRECATED
// type Task = Database['public']['Tables']['tasks']['Row']; 
type EmployeeDocument = {
  // ... (document type definition remains)
  id: string, document_name: string, storage_url: string, requires_signing: boolean,
  signed_storage_url: string | null, signed_at: string | null
};

// --- MOCK DATA (FRONTEND-FIRST) ---
// We'll use this to populate the new UI
const MOCK_USER_1: Pick<Profile, 'id' | 'first_name' | 'last_name' | 'avatar_url'> = { id: '1', first_name: 'John', last_name: 'Doe', avatar_url: null };
const MOCK_ASSIGNMENTS: Assignment[] = [
  {
    id: 'assign_1',
    title: 'Client Brand Strategy Deck',
    category: 'Design',
    status: 'In Progress',
    due_date: '2025-11-15',
    assignees: [MOCK_USER_1],
    //... (other fields added in panel)
  },
  {
    id: 'assign_3',
    title: 'Pitch Video Editing',
    category: 'Production',
    status: 'Overdue',
    due_date: '2025-11-03',
    assignees: [MOCK_USER_1],
    //... (other fields added in panel)
  },
];
const MOCK_DOCUMENTS: EmployeeDocument[] = [
  { id: 'doc_1', document_name: 'Employment Contract', storage_url: '/mock-contract.pdf', requires_signing: true, signed_storage_url: null, signed_at: null },
  { id: 'doc_3', document_name: 'October 2025 Payslip', storage_url: '/mock-payslip.pdf', requires_signing: false, signed_storage_url: null, signed_at: null },
];
// --- END MOCK DATA ---


// --- HELPERS ---
const formatDate = (dateString: string | null) => {
  if (!dateString) return 'N/A';
  const d = new Date(dateString);
  if (isNaN(d.getTime())) return 'N/A';
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
};

// ... (InfoRow and PdfViewerModal components remain unchanged) ...
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

// --- MAIN TAB COMPONENT ---
const EmployeesTab: React.FC = () => {
  const { user } = useAuth();
  const { addToast } = useToast();
  const [employees, setEmployees] = useState<Profile[]>([]);
  // const [tasks, setTasks] = useState<Task[]>([]); // 5. REMOVED
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [selectedEmployee, setSelectedEmployee] = useState<Profile | null>(null);
  const [editingEmployee, setEditingEmployee] = useState<Partial<Profile> | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  
  const [searchQuery, setSearchQuery] = useState('');
  
  // --- 6. REMOVED Task Form State ---

  // --- State for Documents ---
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

  // --- 7. NEW STATE FOR ASSIGNMENTS ---
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
        .eq('role', 'employee')
        .order('first_name');
      if (employeesError) throw employeesError;
      setEmployees(employeesData || []);
      
      // 8. REMOVED task fetch
      
    } catch (err: any) {
      console.error('Error fetching employee data:', err);
      setError('Failed to load employee data. Check RLS policies.');
    } finally {
      setLoading(false);
    }
  }, []);
  
  useEffect(() => {
    fetchData(); // Initial fetch
    
    // ... (profileChannel listener remains) ...
    // ... (docsChannel listener remains) ...
    
    // 9. We'll add a real-time listener for 'assignments' later
    
  }, [fetchData]);

  // --- 10. NEW: Function to fetch assignments for selected employee ---
  const fetchAssignments = async (profileId: string) => {
    setLoadingAssignments(true);
    try {
      // --- MOCKED ---
      // Real query:
      // const { data, error } = await supabase
      //   .from('assignments')
      //   .select('*, assignees:assignment_assignees(profile_id)')
      //   .eq('assignees.profile_id', profileId)
      // if (error) throw error;
      
      await new Promise(res => setTimeout(res, 500)); // Simulate load
      setAssignments(MOCK_ASSIGNMENTS);
      // --- END MOCKED ---
    } catch (err: any) {
      addToast({ type: 'error', title: 'Error Fetching Assignments', message: err.message });
    } finally {
      setLoadingAssignments(false);
    }
  };
  
  // --- Function to fetch documents ---
  const fetchDocuments = async (profileId: string) => {
      setLoadingDocs(true);
      try {
          // --- MOCKED ---
          await new Promise(res => setTimeout(res, 500)); 
          setDocuments(MOCK_DOCUMENTS);
          // --- END MOCKED ---
      } catch (err: any) {
          addToast({ type: 'error', title: 'Error Fetching Documents', message: err.message });
      } finally {
          setLoadingDocs(false);
      }
  };
  
  // --- Fetch docs AND assignments when employee is selected ---
  useEffect(() => {
      if (selectedEmployee) {
          fetchDocuments(selectedEmployee.id);
          fetchAssignments(selectedEmployee.id); // 11. ADDED
      } else {
          setDocuments([]); 
          setAssignments([]); // 11. ADDED
      }
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
  
  // 12. REMOVED 'employeeTasks' useMemo

  // ... (Employee modal handlers remain unchanged) ...
  const handleEditEmployee = (e: React.MouseEvent, employee: Profile) => {
    e.stopPropagation(); 
    setEditingEmployee(employee);
    setIsModalOpen(true);
  };
  const handleAddNewEmployee = () => {
    setEditingEmployee({}); 
    setIsModalOpen(true);
  };
  const handleSaveEmployee = async (formData: Partial<Profile>, password?: string) => {
    // ... (logic is unchanged) ...
  };
  
  // 13. REMOVED 'handleAssignTask'
  
  // ... (Document handlers remain unchanged) ...
  const handleViewPdf = (url: string, title: string) => {
    setViewingPdf(url);
    setViewingPdfTitle(title);
  };
  const handleUploadDocument = async (e: React.FormEvent) => {
    // ... (logic is unchanged) ...
  };
  const handleDeleteDocument = async (doc: EmployeeDocument) => {
     // ... (logic is unchanged) ...
  };
  
  // --- 14. NEW ASSIGNMENT MODAL HANDLERS ---
  const handleOpenCreateAssignment = () => {
    setIsCreateAssignModalOpen(true);
    // We could pre-fill the selectedEmployee in the modal if we modify it
  };
  
  const handleSaveAssignment = async (data: any) => {
    setIsSavingAssignment(true);
    // --- MOCKED ---
    // Real Supabase logic will go here
    await new Promise(res => setTimeout(res, 1000));
    addToast({ type: 'success', title: 'Assignment Created!' });
    // --- END MOCKED ---
    setIsSavingAssignment(false);
    setIsCreateAssignModalOpen(false);
    if(selectedEmployee) fetchAssignments(selectedEmployee.id); // Refetch
  };
  
  // --- 15. NEW ASSIGNMENT PANEL HANDLERS (MOCKED) ---
  const handleUpdateStatus = (newStatus: string) => {
    if (!selectedAssignment) return;
    setSelectedAssignment(prev => prev ? { ...prev, status: newStatus as Status } : null);
    setAssignments(prev => 
      prev.map(a => a.id === selectedAssignment.id ? { ...a, status: newStatus as Status } : a)
    );
    addToast({ type: 'info', title: 'Status Updated' });
  };
  const handlePostComment = (comment: string) => {
    addToast({ type: 'info', title: 'Comment Posted (Mock)' });
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
                  </div>
                </div>
                <button
                  onClick={(e) => handleEditEmployee(e, employee)}
                  className="p-2 rounded-full text-gray-400 hover:bg-gray-200 hover:text-gray-700 transition-colors flex-shrink-0"
                  title={`Edit ${employee.first_name}`}
                >
                  <Edit2 size={16} />
                </button>
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
              {/* Profile, Employment, and Documents cards are unchanged */}
              <Card title="Profile & Contact">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <InfoRow icon={Mail} label="Email" value={selectedEmployee.email} />
                  <InfoRow icon={Phone} label="Phone" value={selectedEmployee.phone} />
                  <InfoRow icon={MapPin} label="Address" value={selectedEmployee.home_address} />
                  <InfoRow icon={Calendar} label="Birth Date" value={formatDate(selectedEmployee.birth_date)} />
                </div>
              </Card>

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
              
              <Card title="Documents">
                {/* ... (All the document UI from the previous step goes here - no changes) ... */}
              </Card>

              {/* --- 16. NEW ASSIGNMENTS CARD --- */}
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
                
                {/* Assignment List for this Employee */}
                {loadingAssignments ? (
                  <div className="flex justify-center py-4"><Loader2 className="w-5 h-5 animate-spin text-gray-400" /></div>
                ) : assignments.length === 0 ? (
                  <p className="text-sm text-gray-500 text-center py-4">No assignments for this employee.</p>
                ) : (
                  <div className="space-y-3">
                    {assignments.map(assignment => (
                      <button 
                        key={assignment.id} 
                        onClick={() => setSelectedAssignment(assignment)}
                        className="w-full flex items-center justify-between p-3 rounded-lg bg-gray-50 border border-gray-200 hover:bg-gray-100 text-left"
                      >
                        <div className="min-w-0">
                          <p className="font-medium text-gray-800 truncate">{assignment.title}</p>
                          <p className="text-sm text-gray-500">Due: {formatDate(assignment.due_date)}</p>
                        </div>
                        <span className={`px-3 py-1 text-xs font-semibold capitalize rounded-full ${
                          assignment.status === 'Completed' ? 'bg-green-100 text-green-700' : 
                          assignment.status === 'In Progress' ? 'bg-blue-100 text-blue-700' : 
                          assignment.status === 'Overdue' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'
                        }`}>
                          {assignment.status}
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </Card>
              
              {/* --- 17. REMOVED OLD TASK CARDS --- */}

            </motion.div>
          </AnimatePresence>
        )}
      </div>

      {/* --- Modals & Panels --- */}
      
      {/* PDF Viewer */}
      <AnimatePresence>
        {viewingPdf && <PdfViewerModal pdfUrl={viewingPdf} title={viewingPdfTitle} onClose={() => setViewingPdf(null)} />}
      </AnimatePresence>
      
      {/* Edit Employee Modal */}
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
      
      {/* 18. ADD NEW ASSIGNMENT MODALS/PANELS */}
      <CreateAssignmentModal
        isOpen={isCreateAssignModalOpen}
        onClose={() => setIsCreateAssignModalOpen(false)}
        onSave={handleSaveAssignment}
        isSaving={isSavingAssignment}
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