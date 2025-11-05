// @ts-nocheck
import React, { useEffect, useState, useCallback } from 'react';
import { useAuth } from '../../features/auth';
import {
  Loader2, Calendar, MapPin, Phone, CreditCard, Briefcase, User, Hash, FileText,
  DollarSign, Mail, LogOut, Building, CheckCircle, Clock, RefreshCw, Eye,
  ClipboardList, FileDown, Home,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useToast } from '../../contexts/ToastContext';
import EmployeeAssignmentPanel from './EmployeeAssignmentPanel';
import {
  getEmployeeById,
  getEmployeeDocuments,
  getEmployeeAssignments,
  onEmployeeDocumentsChange,
  onAssignmentsChange,
  type Profile,
  type EmployeeDocument
} from '../../lib/supabase/operations';

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
    <Icon className="w-5 h-5 text-gray-400 flex-shrink-0 mt-1" />
    <div>
      <p className="text-xs text-gray-500 uppercase tracking-wide">{label}</p>
      <p className="font-medium text-gray-900 break-words">{value || 'N/A'}</p>
    </div>
  </div>
);

const StatCard: React.FC<{ icon: React.ElementType; label: string; value: string | number; color: string }> = ({
  icon: Icon,
  label,
  value,
  color
}) => (
  <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
    <div className="flex items-center gap-3">
      <div className={`w-12 h-12 rounded-lg ${color} flex items-center justify-center`}>
        <Icon size={24} className="text-white" />
      </div>
      <div>
        <p className="text-sm text-gray-500">{label}</p>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
      </div>
    </div>
  </div>
);

const EmployeeDashboardPage: React.FC = () => {
  const { user, logout } = useAuth();
  const { addToast } = useToast();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [documents, setDocuments] = useState<EmployeeDocument[]>([]);
  const [assignments, setAssignments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingDocs, setLoadingDocs] = useState(false);
  const [loadingAssignments, setLoadingAssignments] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'documents' | 'assignments'>('overview');

  const fetchProfile = useCallback(async () => {
    if (!user?.id) return;
    try {
      const { data, error } = await getEmployeeById(user.id);
      if (error) throw error;
      setProfile(data);
    } catch (err: any) {
      addToast({ type: 'error', title: 'Error', message: 'Failed to load profile' });
    } finally {
      setLoading(false);
    }
  }, [user?.id, addToast]);

  const fetchDocuments = useCallback(async () => {
    if (!user?.id) return;
    setLoadingDocs(true);
    try {
      const { data, error } = await getEmployeeDocuments(user.id);
      if (error) throw error;
      setDocuments(data || []);
    } catch (err: any) {
      addToast({ type: 'error', title: 'Error', message: 'Failed to load documents' });
    } finally {
      setLoadingDocs(false);
    }
  }, [user?.id, addToast]);

  const fetchAssignments = useCallback(async () => {
    if (!user?.id) return;
    setLoadingAssignments(true);
    try {
      const { data, error } = await getEmployeeAssignments(user.id);
      if (error) {
        console.error('Employee assignments error:', error);
        throw error;
      }
      setAssignments(data || []);
    } catch (err: any) {
      console.error('Failed to fetch employee assignments:', err);
      addToast({ type: 'error', title: 'Error', message: err.message || 'Failed to load assignments' });
    } finally {
      setLoadingAssignments(false);
    }
  }, [user?.id, addToast]);

  useEffect(() => {
    if (!user?.id) return;

    fetchProfile();
    fetchDocuments();
    fetchAssignments();

    const docsChannel = onEmployeeDocumentsChange(user.id, (payload) => {
      if (payload.eventType === 'INSERT') {
        setDocuments(prev => [payload.new, ...prev]);
        addToast({ type: 'info', title: 'New Document', message: 'A new document has been added' });
      } else if (payload.eventType === 'DELETE') {
        setDocuments(prev => prev.filter(doc => doc.id !== payload.old.id));
      }
    });

    const assignmentsChannel = onAssignmentsChange((payload) => {
      if (payload.eventType === 'INSERT') {
        fetchAssignments();
        addToast({ type: 'info', title: 'New Assignment', message: 'You have a new assignment' });
      } else if (payload.eventType === 'UPDATE') {
        setAssignments(prev => prev.map(a => a.id === payload.new.id ? { ...a, ...payload.new } : a));
      } else if (payload.eventType === 'DELETE') {
        setAssignments(prev => prev.filter(a => a.id !== payload.old.id));
      }
    });

    return () => {
      docsChannel.unsubscribe();
      assignmentsChannel.unsubscribe();
    };
  }, [user?.id, fetchProfile, fetchDocuments, fetchAssignments, addToast]);

  const handleLogout = async () => {
    try {
      await logout();
    } catch (err: any) {
      addToast({ type: 'error', title: 'Error', message: 'Logout failed' });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="w-8 h-8 animate-spin text-[#FF5722]" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-red-600">Failed to load profile</p>
      </div>
    );
  }

  const pendingAssignments = assignments.filter(a => a.status === 'pending').length;
  const inProgressAssignments = assignments.filter(a => a.status === 'in_progress').length;
  const completedAssignments = assignments.filter(a => a.status === 'completed').length;

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#FF5722] flex items-center justify-center">
                <User size={20} className="text-white" />
              </div>
              <div>
                <h1 className="text-lg font-semibold text-gray-900">
                  {profile.first_name} {profile.last_name}
                </h1>
                <p className="text-sm text-gray-500">{profile.position || 'Employee'}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            >
              <LogOut size={18} />
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <div className="flex gap-2 border-b border-gray-200">
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'overview'
                  ? 'border-[#FF5722] text-[#FF5722]'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              <Home size={16} className="inline mr-2" />
              Overview
            </button>
            <button
              onClick={() => setActiveTab('documents')}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'documents'
                  ? 'border-[#FF5722] text-[#FF5722]'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              <FileText size={16} className="inline mr-2" />
              Documents ({documents.length})
            </button>
            <button
              onClick={() => setActiveTab('assignments')}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'assignments'
                  ? 'border-[#FF5722] text-[#FF5722]'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              <ClipboardList size={16} className="inline mr-2" />
              Assignments ({assignments.length})
            </button>
          </div>
        </div>

        {activeTab === 'overview' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <StatCard
                icon={Clock}
                label="Pending"
                value={pendingAssignments}
                color="bg-yellow-500"
              />
              <StatCard
                icon={RefreshCw}
                label="In Progress"
                value={inProgressAssignments}
                color="bg-blue-500"
              />
              <StatCard
                icon={CheckCircle}
                label="Completed"
                value={completedAssignments}
                color="bg-green-500"
              />
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Personal Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <InfoRow icon={Mail} label="Email" value={profile.email} />
                <InfoRow icon={Phone} label="Phone" value={profile.phone} />
                <InfoRow icon={Hash} label="Employee Number" value={profile.employee_number} />
                <InfoRow icon={Calendar} label="Birth Date" value={formatDate(profile.birth_date)} />
                <InfoRow icon={FileText} label="National ID" value={profile.national_id} />
                <InfoRow icon={Briefcase} label="Position" value={profile.position} />
                <InfoRow icon={Calendar} label="Start Date" value={formatDate(profile.start_date)} />
                <InfoRow icon={Calendar} label="End Date" value={formatDate(profile.end_date)} />
                <InfoRow icon={MapPin} label="Address" value={profile.home_address} />
                <InfoRow icon={DollarSign} label="Salary" value={profile.salary} />
                <InfoRow icon={Clock} label="Payday" value={profile.payday} />
                <InfoRow icon={Building} label="Bank" value={profile.bank_name} />
                <InfoRow icon={CreditCard} label="Account" value={profile.bank_account} />
              </div>
            </div>
          </div>
        )}

        {activeTab === 'documents' && (
          <div className="space-y-4">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">My Documents</h2>
                <button
                  onClick={fetchDocuments}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <RefreshCw size={18} className="text-gray-600" />
                </button>
              </div>

              {loadingDocs ? (
                <div className="text-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-[#FF5722] mx-auto" />
                </div>
              ) : documents.length === 0 ? (
                <p className="text-center text-gray-500 py-8">No documents available</p>
              ) : (
                <div className="space-y-2">
                  {documents.map(doc => (
                    <div key={doc.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                      <div className="flex items-center gap-3">
                        <FileText size={20} className="text-gray-400" />
                        <div>
                          <p className="font-medium text-gray-900">{doc.document_name}</p>
                          <p className="text-xs text-gray-500">
                            Added {formatDate(doc.created_at)}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <a
                          href={doc.storage_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
                        >
                          <Eye size={16} className="text-gray-600" />
                        </a>
                        <a
                          href={doc.storage_url}
                          download
                          className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
                        >
                          <FileDown size={16} className="text-gray-600" />
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'assignments' && (
          <div className="space-y-4">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">My Assignments</h2>
                <button
                  onClick={fetchAssignments}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <RefreshCw size={18} className="text-gray-600" />
                </button>
              </div>

              {loadingAssignments ? (
                <div className="text-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-[#FF5722] mx-auto" />
                </div>
              ) : assignments.length === 0 ? (
                <p className="text-center text-gray-500 py-8">No assignments yet</p>
              ) : (
                <div className="space-y-2">
                  {assignments.map(assign => (
                    <div
                      key={assign.id}
                      onClick={() => setSelectedAssignment(assign)}
                      className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-gray-900">{assign.title}</p>
                          <p className="text-sm text-gray-500">{assign.instructions?.substring(0, 100)}...</p>
                          <p className="text-xs text-gray-400 mt-1">
                            Due: {formatDate(assign.due_date)}
                          </p>
                        </div>
                        <div className="text-right">
                          <span
                            className={`inline-block px-2 py-1 text-xs rounded-full ${
                              assign.status === 'completed'
                                ? 'bg-green-100 text-green-700'
                                : assign.status === 'in_progress'
                                ? 'bg-blue-100 text-blue-700'
                                : 'bg-yellow-100 text-yellow-700'
                            }`}
                          >
                            {assign.status}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      {selectedAssignment && (
        <EmployeeAssignmentPanel
          assignment={selectedAssignment}
          onClose={() => setSelectedAssignment(null)}
          onUpdate={() => fetchAssignments()}
        />
      )}
    </div>
  );
};

export default EmployeeDashboardPage;
