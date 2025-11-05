// @ts-nocheck
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '../../../../features/auth/AuthProvider';
import Card from '../components/Card';
import {
  Loader2, User, Search, AlertCircle, Mail, Phone, MapPin, Calendar, Hash,
  FileText, DollarSign, Building, CreditCard, Briefcase, ClipboardList, Eye,
  Clock, Plus, X, Trash2, Edit2, PlusCircle, Download, UploadCloud, ChevronDown,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useToast } from '../../../../contexts/ToastContext';
import EmployeeEditModal from '../components/EmployeeEditModal';
import CreateAssignmentModal from '../components/CreateAssignmentModal';
import AssignmentDetailPanel from '../components/AssignmentDetailPanel';
import {
  getAllEmployees,
  createEmployee,
  updateEmployee,
  deleteEmployee,
  onEmployeesChange,
  getEmployeeDocuments,
  createEmployeeDocument,
  deleteEmployeeDocument,
  uploadEmployeeDocument,
  deleteEmployeeDocumentFile,
  onEmployeeDocumentsChange,
  getEmployeeAssignments,
  getAllAssignments,
  onAssignmentsChange,
  type Profile,
  type EmployeeDocument,
  type Assignment
} from '../../../../lib/supabase/operations';
import { supabase } from '../../../../lib/supabase/client';

const formatDate = (dateString: string | null) => {
  if (!dateString) return 'N/A';
  const d = new Date(dateString);
  if (isNaN(d.getTime())) return 'N/A';
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
};

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
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
          <h3 className="text-white font-semibold truncate pl-2">{title}</h3>
          <button onClick={onClose} className="p-2 rounded-full text-gray-400 hover:bg-gray-700 hover:text-white">
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

  const [documents, setDocuments] = useState<EmployeeDocument[]>([]);
  const [loadingDocs, setLoadingDocs] = useState(false);
  const [isUploadingDoc, setIsUploadingDoc] = useState(false);
  const [newDocName, setNewDocName] = useState('');
  const [newDocFile, setNewDocFile] = useState<File | null>(null);
  const [docUploadError, setDocUploadError] = useState<string | null>(null);
  const [showDocUpload, setShowDocUpload] = useState(false);

  const [viewingPdf, setViewingPdf] = useState<string | null>(null);
  const [viewingPdfTitle, setViewingPdfTitle] = useState<string>('');

  const [assignments, setAssignments] = useState<any[]>([]);
  const [loadingAssignments, setLoadingAssignments] = useState(false);
  const [isCreateAssignModalOpen, setIsCreateAssignModalOpen] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState<any>(null);

  const fetchEmployees = useCallback(async () => {
    setError(null);
    try {
      const { data, error: fetchError } = await getAllEmployees();
      if (fetchError) throw fetchError;
      setEmployees(data || []);
    } catch (err: any) {
      console.error('Error fetching employees:', err);
      setError('Failed to load employees');
      addToast({ type: 'error', title: 'Error', message: err.message });
    } finally {
      setLoading(false);
    }
  }, [addToast]);

  const fetchDocuments = useCallback(async (profileId: string) => {
    setLoadingDocs(true);
    try {
      const { data, error } = await getEmployeeDocuments(profileId);
      if (error) throw error;
      setDocuments(data || []);
    } catch (err: any) {
      addToast({ type: 'error', title: 'Error', message: 'Failed to load documents' });
    } finally {
      setLoadingDocs(false);
    }
  }, [addToast]);

  const fetchAssignments = useCallback(async () => {
    setLoadingAssignments(true);
    try {
      const { data, error } = await getAllAssignments();
      if (error) {
        console.error('Assignments error:', error);
        throw error;
      }
      setAssignments(data || []);
    } catch (err: any) {
      console.error('Failed to fetch assignments:', err);
      addToast({ type: 'error', title: 'Error', message: err.message || 'Failed to load assignments' });
    } finally {
      setLoadingAssignments(false);
    }
  }, [addToast]);

  useEffect(() => {
    fetchEmployees();
    fetchAssignments();

    const employeesChannel = onEmployeesChange((payload) => {
      if (payload.eventType === 'INSERT') {
        setEmployees(prev => [payload.new, ...prev]);
        addToast({ type: 'success', title: 'Employee Added', message: 'New employee added' });
      } else if (payload.eventType === 'UPDATE') {
        setEmployees(prev => prev.map(emp => emp.id === payload.new.id ? payload.new : emp));
        if (selectedEmployee?.id === payload.new.id) {
          setSelectedEmployee(payload.new);
        }
        addToast({ type: 'info', title: 'Employee Updated', message: 'Employee information updated' });
      } else if (payload.eventType === 'DELETE') {
        setEmployees(prev => prev.filter(emp => emp.id !== payload.old.id));
        if (selectedEmployee?.id === payload.old.id) {
          setSelectedEmployee(null);
        }
        addToast({ type: 'info', title: 'Employee Removed', message: 'Employee removed' });
      }
    });

    const assignmentsChannel = onAssignmentsChange((payload) => {
      if (payload.eventType === 'INSERT') {
        fetchAssignments();
      } else if (payload.eventType === 'UPDATE') {
        setAssignments(prev => prev.map(a => a.id === payload.new.id ? { ...a, ...payload.new } : a));
      } else if (payload.eventType === 'DELETE') {
        setAssignments(prev => prev.filter(a => a.id !== payload.old.id));
      }
    });

    return () => {
      employeesChannel.unsubscribe();
      assignmentsChannel.unsubscribe();
    };
  }, [fetchEmployees, fetchAssignments, addToast, selectedEmployee?.id]);

  useEffect(() => {
    if (selectedEmployee) {
      fetchDocuments(selectedEmployee.id);

      const docsChannel = onEmployeeDocumentsChange(selectedEmployee.id, (payload) => {
        if (payload.eventType === 'INSERT') {
          setDocuments(prev => [payload.new, ...prev]);
        } else if (payload.eventType === 'DELETE') {
          setDocuments(prev => prev.filter(doc => doc.id !== payload.old.id));
        }
      });

      return () => {
        docsChannel.unsubscribe();
      };
    } else {
      setDocuments([]);
    }
  }, [selectedEmployee, fetchDocuments]);

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

  const handleEditEmployee = (e: React.MouseEvent, employee: Profile) => {
    e.stopPropagation();
    setEditingEmployee(employee);
    setIsModalOpen(true);
  };

  const handleSaveEmployee = async (formData: Partial<Profile>, password?: string) => {
    setIsSavingProfile(true);
    try {
      if (editingEmployee?.id) {
        const { data, error } = await updateEmployee(editingEmployee.id, formData);
        if (error) throw error;
        addToast({ type: 'success', title: 'Success', message: 'Employee updated successfully' });
      } else {
        if (!password) throw new Error('Password required for new employee');
        const { data: authData, error: authError } = await supabase.auth.signUp({
          email: formData.email!,
          password,
        });
        if (authError) throw authError;
        if (!authData.user) throw new Error('Failed to create user');

        const { data, error } = await createEmployee({
          ...formData,
          id: authData.user.id,
          role: 'employee'
        });
        if (error) throw error;
        addToast({ type: 'success', title: 'Success', message: 'Employee created successfully' });
      }
      setIsModalOpen(false);
      setEditingEmployee(null);
    } catch (err: any) {
      addToast({ type: 'error', title: 'Error', message: err.message });
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleUploadDocument = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDocFile || !newDocName.trim() || !selectedEmployee) {
      setDocUploadError("Document name and file are required");
      return;
    }
    setIsUploadingDoc(true);
    setDocUploadError(null);
    try {
      const { data: uploadData, error: uploadError } = await uploadEmployeeDocument(
        selectedEmployee.id,
        newDocFile,
        newDocFile.name
      );
      if (uploadError) throw uploadError;

      const { error: dbError } = await createEmployeeDocument({
        profile_id: selectedEmployee.id,
        document_name: newDocName,
        storage_path: uploadData.path,
        storage_url: uploadData.url,
        uploaded_by: user?.id
      });
      if (dbError) throw dbError;

      addToast({ type: 'success', title: 'Success', message: 'Document uploaded' });
      setShowDocUpload(false);
      setNewDocName('');
      setNewDocFile(null);
    } catch (err: any) {
      setDocUploadError(err.message);
      addToast({ type: 'error', title: 'Upload Failed', message: err.message });
    } finally {
      setIsUploadingDoc(false);
    }
  };

  const handleDeleteDocument = async (doc: EmployeeDocument) => {
    if (!confirm('Delete this document?')) return;
    try {
      await deleteEmployeeDocumentFile(doc.storage_path);
      const { error } = await deleteEmployeeDocument(doc.id);
      if (error) throw error;
      addToast({ type: 'success', title: 'Deleted', message: 'Document removed' });
    } catch (err: any) {
      addToast({ type: 'error', title: 'Error', message: err.message });
    }
  };

  const handleViewPdf = (url: string, title: string) => {
    setViewingPdf(url);
    setViewingPdfTitle(title);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 animate-spin text-[#FF5722]" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-red-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Employees</h2>
          <p className="text-sm text-gray-500">Manage employee profiles, documents, and assignments</p>
        </div>
        <button
          onClick={() => {
            setEditingEmployee({}); // Set to empty object for "create" mode
            setIsModalOpen(true);
          }}
          className="flex items-center gap-2 px-4 py-2 bg-[#FF5722] text-white rounded-lg hover:bg-[#E64A19] transition-colors"
        >
          <PlusCircle size={20} />
          Add Employee
        </button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
        <input
          type="text"
          placeholder="Search employees..."
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF5722] focus:border-transparent"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-3">
          {filteredEmployees.length === 0 ? (
            <Card>
              <p className="text-center text-gray-500 py-8">No employees found</p>
            </Card>
          ) : (
            filteredEmployees.map(emp => (
              <Card
                key={emp.id}
                className={`cursor-pointer transition-all hover:shadow-md ${
                  selectedEmployee?.id === emp.id ? 'ring-2 ring-[#FF5722]' : ''
                }`}
                onClick={() => setSelectedEmployee(emp)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#FF5722]/10 flex items-center justify-center">
                      <User size={20} className="text-[#FF5722]" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">
                        {emp.first_name} {emp.last_name}
                      </p>
                      <p className="text-sm text-gray-500">{emp.position || 'No Position'}</p>
                    </div>
                  </div>
                  <button
                    onClick={(e) => handleEditEmployee(e, emp)}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <Edit2 size={16} className="text-gray-600" />
                  </button>
                </div>
              </Card>
            ))
          )}
        </div>

        <div className="lg:col-span-2">
          {selectedEmployee ? (
            <div className="space-y-6">
              <Card>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Employee Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <InfoRow icon={Mail} label="Email" value={selectedEmployee.email} />
                  <InfoRow icon={Phone} label="Phone" value={selectedEmployee.phone} />
                  <InfoRow icon={Hash} label="Employee Number" value={selectedEmployee.employee_number} />
                  <InfoRow icon={Calendar} label="Birth Date" value={formatDate(selectedEmployee.birth_date)} />
                  <InfoRow icon={FileText} label="National ID" value={selectedEmployee.national_id} />
                  <InfoRow icon={Briefcase} label="Position" value={selectedEmployee.position} />
                  <InfoRow icon={Calendar} label="Start Date" value={formatDate(selectedEmployee.start_date)} />
                  <InfoRow icon={Calendar} label="End Date" value={formatDate(selectedEmployee.end_date)} />
                  <InfoRow icon={MapPin} label="Address" value={selectedEmployee.home_address} />
                  <InfoRow icon={DollarSign} label="Salary" value={selectedEmployee.salary} />
                  <InfoRow icon={Clock} label="Payday" value={selectedEmployee.payday} />
                  <InfoRow icon={Building} label="Bank" value={selectedEmployee.bank_name} />
                  <InfoRow icon={CreditCard} label="Account" value={selectedEmployee.bank_account} />
                </div>
              </Card>

              <Card>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Documents</h3>
                  <button
                    onClick={() => setShowDocUpload(!showDocUpload)}
                    className="flex items-center gap-2 px-3 py-1.5 bg-[#FF5722] text-white text-sm rounded-lg hover:bg-[#E64A19]"
                  >
                    <UploadCloud size={16} />
                    Upload
                  </button>
                </div>

                {showDocUpload && (
                  <form onSubmit={handleUploadDocument} className="mb-4 p-4 bg-gray-50 rounded-lg space-y-3">
                    <input
                      type="text"
                      placeholder="Document name"
                      value={newDocName}
                      onChange={e => setNewDocName(e.target.value)}
                      className="w-full px-3 py-2 border rounded-lg"
                    />
                    <input
                      type="file"
                      onChange={e => setNewDocFile(e.target.files?.[0] || null)}
                      className="w-full"
                      accept=".pdf,.doc,.docx,.jpg,.png"
                    />
                    {docUploadError && <p className="text-sm text-red-600">{docUploadError}</p>}
                    <div className="flex gap-2">
                      <button
                        type="submit"
                        disabled={isUploadingDoc}
                        className="px-4 py-2 bg-[#FF5722] text-white rounded-lg hover:bg-[#E64A19] disabled:opacity-50"
                      >
                        {isUploadingDoc ? 'Uploading...' : 'Upload'}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setShowDocUpload(false);
                          setNewDocName('');
                          setNewDocFile(null);
                          setDocUploadError(null);
                        }}
                        className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                )}

                {loadingDocs ? (
                  <div className="text-center py-4">
                    <Loader2 className="w-6 h-6 animate-spin text-[#FF5722] mx-auto" />
                  </div>
                ) : documents.length === 0 ? (
                  <p className="text-center text-gray-500 py-8">No documents</p>
                ) : (
                  <div className="space-y-2">
                    {documents.map(doc => (
                      <div key={doc.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <FileText size={20} className="text-gray-400" />
                          <span className="font-medium text-gray-900">{doc.document_name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleViewPdf(doc.storage_url, doc.document_name)}
                            className="p-2 hover:bg-gray-200 rounded-lg"
                          >
                            <Eye size={16} className="text-gray-600" />
                          </button>
                          <a
                            href={doc.storage_url}
                            download
                            className="p-2 hover:bg-gray-200 rounded-lg"
                          >
                            <Download size={16} className="text-gray-600" />
                          </a>
                          <button
                            onClick={() => handleDeleteDocument(doc)}
                            className="p-2 hover:bg-red-100 rounded-lg"
                          >
                            <Trash2 size={16} className="text-red-600" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </Card>

              <Card>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Assignments</h3>
                  <button
                    onClick={() => setIsCreateAssignModalOpen(true)}
                    className="flex items-center gap-2 px-3 py-1.5 bg-[#FF5722] text-white text-sm rounded-lg hover:bg-[#E64A19]"
                  >
                    <Plus size={16} />
                    Create
                  </button>
                </div>

                {loadingAssignments ? (
                  <div className="text-center py-4">
                    <Loader2 className="w-6 h-6 animate-spin text-[#FF5722] mx-auto" />
                  </div>
                ) : assignments.filter(a => a.assignment_members?.some(m => m.employee_id === selectedEmployee.id)).length === 0 ? (
                  <p className="text-center text-gray-500 py-8">No assignments</p>
                ) : (
                  <div className="space-y-2">
                    {assignments
                      .filter(a => a.assignment_members?.some(m => m.employee_id === selectedEmployee.id))
                      .map(assign => (
                        <div
                          key={assign.id}
                          onClick={() => setSelectedAssignment(assign)}
                          className="p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100"
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium text-gray-900">{assign.title}</p>
                              <p className="text-sm text-gray-500">{assign.status}</p>
                            </div>
                            <ClipboardList size={20} className="text-gray-400" />
                          </div>
                        </div>
                      ))}
                  </div>
                )}
              </Card>
            </div>
          ) : (
            <Card className="h-full flex items-center justify-center">
              <div className="text-center text-gray-500">
                <User size={48} className="mx-auto mb-4 text-gray-300" />
                <p>Select an employee to view details</p>
              </div>
            </Card>
          )}
        </div>
      </div>

      {isModalOpen && (
        <EmployeeEditModal
          employee={editingEmployee}
          onClose={() => {
            setIsModalOpen(false);
            setEditingEmployee(null);
          }}
          onSave={handleSaveEmployee}
          isSaving={isSavingProfile}
        />
      )}

      {isCreateAssignModalOpen && selectedEmployee && (
        <CreateAssignmentModal
          onClose={() => setIsCreateAssignModalOpen(false)}
          onSave={async (data) => {
            await fetchAssignments();
            setIsCreateAssignModalOpen(false);
            addToast({ type: 'success', title: 'Assignment Created' });
          }}
          allEmployees={employees}
          preselectedEmployeeIds={[selectedEmployee.id]}
        />
      )}

      {selectedAssignment && (
        <AssignmentDetailPanel
          assignment={selectedAssignment}
          onClose={() => setSelectedAssignment(null)}
          onUpdate={() => fetchAssignments()}
        />
      )}

      {viewingPdf && (
        <PdfViewerModal
          pdfUrl={viewingPdf}
          title={viewingPdfTitle}
          onClose={() => {
            setViewingPdf(null);
            setViewingPdfTitle('');
          }}
        />
      )}
    </div>
  );
};

export default EmployeesTab;