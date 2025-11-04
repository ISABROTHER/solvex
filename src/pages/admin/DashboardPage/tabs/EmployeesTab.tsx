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
  Eye,
  FileDown,
  CheckCircle,
  Send,
  X,
  Edit2,
  PlusCircle,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useToast } from '../../../../contexts/ToastContext';
import EmployeeEditModal from '../components/EmployeeEditModal';

// --- TYPE DEFINITIONS ---
export type Profile = Database['public']['Tables']['profiles']['Row'];
// This 'Task' type comes from your ...183138_...sql migration
type Task = Database['public']['Tables']['tasks']['Row'];

// --- 1. ADD THIS HELPER FUNCTION BACK (FIXES BLANK SCREEN) ---
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

// --- Reusable PDF Viewer ---
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
  const [tasks, setTasks] = useState<Task[]>([]); // 2. RESTORED TASKS STATE
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [selectedEmployee, setSelectedEmployee] = useState<Profile | null>(null);
  const [editingEmployee, setEditingEmployee] = useState<Partial<Profile> | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  
  const [searchQuery, setSearchQuery] = useState('');

  // --- 3. RESTORED TASK FORM STATE ---
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDesc, setNewTaskDesc] = useState('');
  const [newTaskPriority, setNewTaskPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [isSubmittingTask, setIsSubmittingTask] = useState(false);

  // --- 4. RESTORED DOCUMENTS STATE (SIMPLE) ---
  const [viewingPdf, setViewingPdf] = useState<string | null>(null);
  const [viewingPdfTitle, setViewingPdfTitle] = useState<string>('');
  // This is the mock unsigned contract from the original file
  const unsignedContract = { name: 'Employment Contract (Unsigned)', url: '/mock-contract.pdf' };

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
      
      // 5. RESTORED TASK FETCH
      const { data: tasksData, error: tasksError } = await supabase
        .from('tasks')
        .select('*')
        .order('created_at', { ascending: false });
      if (tasksError) throw tasksError;
      setTasks(tasksData || []);
      
    } catch (err: any) {
      console.error('Error fetching employee data:', err);
      setError('Failed to load employee data. Check RLS policies.');
    } finally {
      setLoading(false);
    }
  }, []);
  
  useEffect(() => {
    fetchData(); 
    // ... (listeners for profiles and tasks to be added if needed) ...
  }, [fetchData]);

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
  
  // 6. RESTORED 'employeeTasks' FILTER
  const employeeTasks = useMemo(() => {
    if (!selectedEmployee) return [];
    return tasks.filter(t => t.assigned_to === selectedEmployee.id);
  }, [tasks, selectedEmployee]);
  
  // --- Employee Modal Handlers ---
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
    // ... (Mocked logic) ...
    setIsSavingProfile(true);
    await new Promise(res => setTimeout(res, 1000));
    addToast({ type: 'success', title: 'Employee Saved (Mock)' });
    setIsSavingProfile(false);
    setIsModalOpen(false);
    setEditingEmployee(null);
  };
  
  // --- Document Handlers ---
  const handleViewPdf = (url: string, title: string) => {
    setViewingPdf(url);
    setViewingPdfTitle(title);
  };
  
  // --- 7. RESTORED 'handleAssignTask' ---
  const handleAssignTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle || !selectedEmployee || !user) return;

    setIsSubmittingTask(true);
    try {
      const { data: newTask, error } = await supabase
        .from('tasks')
        .insert({
          title: newTaskTitle,
          description: newTaskDesc || null,
          priority: newTaskPriority,
          status: 'pending',
          assigned_to: selectedEmployee.id,
          assigned_by: user.id
        })
        .select()
        .single();
      
      if (error) throw error;
      
      setTasks(prev => [newTask, ...prev]); 
      setNewTaskTitle('');
      setNewTaskDesc('');
      setNewTaskPriority('medium');
      addToast({ type: 'success', title: 'Task Assigned!', message: `${newTaskTitle} assigned to ${selectedEmployee.first_name}.` });
      
    } catch (err: any) {
      console.error('Error creating task:', err);
      addToast({ type: 'error', title: 'Error', message: `Failed to create task: ${err.message}` });
    } finally {
      setIsSubmittingTask(false);
    }
  };

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
              
              {/* --- 8. RESTORED SIMPLE DOCUMENTS CARD --- */}
              <Card title="Documents">
                <div className="space-y-4">
                  {/* Unsigned Contract */}
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 p-3 rounded-lg bg-gray-50 border border-gray-200">
                    <span className="flex items-center gap-2.5 font-medium text-gray-700">
                      <FileText size={16} className="text-gray-500" />
                      <span className="truncate">{unsignedContract.name}</span>
                    </span>
                    <div className="flex gap-2 sm:flex-shrink-0">
                      <button onClick={() => handleViewPdf(unsignedContract.url, unsignedContract.name)} className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border border-gray-300 hover:bg-gray-100"><Eye size={14} /> View</button>
                      <a href={unsignedContract.url} download="Employment_Contract_Unsigned.pdf" className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border border-gray-300 hover:bg-gray-100"><FileDown size={14} /> Download</a>
                    </div>
                  </div>
                  {/* Signed Contract */}
                  {selectedEmployee.signed_contract_url ? (
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 p-3 rounded-lg bg-green-50 border border-green-200">
                      <span className="flex items-center gap-2.5 font-medium text-green-800">
                        <CheckCircle size={16} className="text-green-600" />
                        <span className="truncate" title={selectedEmployee.signed_contract_name || 'Signed Contract'}>{selectedEmployee.signed_contract_name || 'Signed Contract'}</span>
                      </span>
                      <div className="flex gap-2 sm:flex-shrink-0">
                        <button onClick={() => handleViewPdf(selectedEmployee.signed_contract_url!, selectedEmployee.signed_contract_name!)} className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border border-green-300 text-green-800 hover:bg-green-100"><Eye size={14} /> View</button>
                        <a href={selectedEmployee.signed_contract_url} download={selectedEmployee.signed_contract_name || 'Signed_Contract.pdf'} className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border border-green-300 text-green-800 hover:bg-green-100"><FileDown size={14} /> Download</a>
                      </div>
                    </div>
                  ) : (
                    <div className="p-4 text-center rounded-lg border-2 border-dashed border-gray-300">
                      <p className="text-sm text-gray-500">Employee has not uploaded their signed contract.</p>
                    </div>
                  )}
                </div>
              </Card>

              {/* --- 9. RESTORED SIMPLE "ASSIGN TASK" CARD --- */}
              <Card title="Assign Task">
                <form onSubmit={handleAssignTask} className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700">Task Title</label>
                    <input
                      type="text"
                      value={newTaskTitle}
                      onChange={(e) => setNewTaskTitle(e.target.value)}
                      placeholder="e.g., 'Prepare Q4 marketing report'"
                      className="mt-1 w-full px-3 py-2 rounded-lg border border-gray-300"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Description (Optional)</label>
                    <textarea
                      value={newTaskDesc}
                      onChange={(e) => setNewTaskDesc(e.target.value)}
                      placeholder="Add more details..."
                      rows={3}
                      className="mt-1 w-full px-3 py-2 rounded-lg border border-gray-300"
                    />
                  </div>
                  <div className="flex flex-col sm:flex-row gap-4 justify-between">
                    <div>
                      <label className="text-sm font-medium text-gray-700">Priority</label>
                      <select
                        value={newTaskPriority}
                        onChange={(e) => setNewTaskPriority(e.target.value as any)}
                        className="mt-1 w-full sm:w-auto px-3 py-2 rounded-lg border border-gray-300"
                      >
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                      </select>
                    </div>
                    <button
                      type="submit"
                      disabled={isSubmittingTask}
                      className="inline-flex items-center justify-center gap-2 px-6 py-2 bg-[#FF5722] text-white font-semibold rounded-lg hover:bg-[#E64A19] disabled:opacity-50 sm:self-end"
                    >
                      {isSubmittingTask ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                      {isSubmittingTask ? 'Assigning...' : 'Assign Task'}
                    </button>
                  </div>
                </form>
              </Card>

              {/* --- 10. RESTORED SIMPLE "TASK LIST" CARD --- */}
              <Card title="Task List">
                {employeeTasks.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">No tasks assigned to this employee.</p>
                ) : (
                  <div className="space-y-3">
                    {employeeTasks.map(task => (
                      <div key={task.id} className="flex items-center justify-between p-3 rounded-lg bg-gray-50 border border-gray-200">
                        <div>
                          <p className="font-medium text-gray-800">{task.title}</p>
                          <p className="text-sm text-gray-500">{task.description}</p>
                        </div>
                        <span className={`px-3 py-1 text-xs font-semibold capitalize rounded-full ${
                          task.status === 'completed' ? 'bg-green-100 text-green-700' : 
                          task.status === 'in_progress' ? 'bg-blue-100 text-blue-700' : 'bg-yellow-100 text-yellow-700'
                        }`}>
                          {task.status.replace('_', ' ')}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </Card>
            </motion.div>
          </AnimatePresence>
        )}
      </div>

      {/* --- Modals & Panels --- */}
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
      
      {/* --- 11. REMOVED THE ASSIGNMENT MODALS/PANELS --- */}
    </div>
  );
};

export default EmployeesTab;