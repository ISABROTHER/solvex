import React, { useEffect, useState } from 'react';
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
  Target
} from 'lucide-react';
import { motion } from 'framer-motion';

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

// --- HELPER FUNCTIONS ---

const formatDate = (dateString: string | null) => {
  if (!dateString) return 'N/A';
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

// --- REUSABLE UI COMPONENTS ---

// A single item in the task list
const TaskItem: React.FC<{ task: Task; onStatusChange: (taskId: string, newStatus: Task['status']) => void; isUpdating: boolean }> = ({ task, onStatusChange, isUpdating }) => {
  const getStatusInfo = (status: Task['status']) => {
    switch (status) {
      case 'pending':
        return { icon: Clock, color: 'text-yellow-500', bg: 'bg-yellow-50' };
      case 'in_progress':
        return { icon: Loader2, color: 'text-blue-500', bg: 'bg-blue-50' };
      case 'completed':
        return { icon: CheckCircle, color: 'text-green-500', bg: 'bg-green-50' };
      default:
        return { icon: Clock, color: 'text-gray-500', bg: 'bg-gray-50' };
    }
  };

  const getPriorityInfo = (priority: Task['priority']) => {
    switch (priority) {
      case 'low':
        return { label: 'Low', color: 'bg-green-100 text-green-700' };
      case 'medium':
        return { label: 'Medium', color: 'bg-yellow-100 text-yellow-700' };
      case 'high':
        return { label: 'High', color: 'bg-red-100 text-red-700' };
      default:
        return { label: 'N/A', color: 'bg-gray-100 text-gray-700' };
    }
  };

  const StatusIcon = getStatusInfo(task.status).icon;
  const statusColor = getStatusInfo(task.status).color;
  const statusBg = getStatusInfo(task.status).bg;
  const priorityInfo = getPriorityInfo(task.priority);

  return (
    <motion.div
      layout
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="bg-white p-5 rounded-xl shadow-sm border border-gray-200 transition-shadow hover:shadow-md"
    >
      <div className="flex items-start justify-between">
        <div>
          <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${priorityInfo.color}`}>
            {priorityInfo.label}
          </span>
          <h3 className="text-lg font-semibold text-gray-900 mt-2">{task.title}</h3>
          {task.description && (
            <p className="text-sm text-gray-600 mt-1">{task.description}</p>
          )}
        </div>
        <div className={`p-2 rounded-full ${statusBg} ${statusColor}`}>
          <StatusIcon size={20} className={task.status === 'in_progress' ? 'animate-spin' : ''} />
        </div>
      </div>
      <div className="border-t border-gray-100 mt-4 pt-4 flex items-center justify-between">
        <div className="text-sm text-gray-500">
          {task.deadline ? (
            <span className="flex items-center gap-1.5">
              <Calendar size={14} />
              Due: {formatDate(task.deadline)}
            </span>
          ) : (
            <span>No deadline</span>
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

// A reusable info row for the profile card
const InfoRow: React.FC<{ icon: React.ElementType; label: string; value: string | number | null }> = ({ icon: Icon, label, value }) => (
  <div className="flex items-start gap-3">
    <Icon className="w-4 h-4 text-gray-400 flex-shrink-0 mt-1" />
    <div>
      <p className="text-xs text-gray-500">{label}</p>
      <p className="font-medium text-gray-900">{value || 'N/A'}</p>
    </div>
  </div>
);

// --- MAIN COMPONENT ---

const EmployeeDashboardPage: React.FC = () => {
  const { user, logout } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingTaskId, setUpdatingTaskId] = useState<string | null>(null);

  useEffect(() => {
    if (user?.id) {
      fetchProfileAndTasks();
    }
  }, [user?.id]);

  const fetchProfileAndTasks = async () => {
    if (!user?.id) return;
    setLoading(true);
    try {
      const { data: profileData, error: profileError } = await (supabase as any)
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();

      if (profileError) console.error('Error fetching profile:', profileError);
      else setProfile(profileData);

      const { data: tasksData, error: tasksError } = await (supabase as any)
        .from('tasks')
        .select('*')
        .eq('assigned_to', user.id)
        .order('created_at', { ascending: false });

      if (tasksError) console.error('Error fetching tasks:', tasksError);
      else setTasks(tasksData || []);

    } catch (error) {
      console.error('Unexpected error:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateTaskStatus = async (taskId: string, newStatus: Task['status']) => {
    setUpdatingTaskId(taskId);
    try {
      const { error } = await (supabase as any)
        .from('tasks')
        .update({ status: newStatus, updated_at: new Date().toISOString() })
        .eq('id', taskId);

      if (error) {
        console.error('Error updating task:', error);
        alert('Failed to update task status');
      } else {
        setTasks(tasks.map(task =>
          task.id === taskId ? { ...task, status: newStatus } : task
        ));
      }
    } catch (error) {
      console.error('Unexpected error updating task:', error);
    } finally {
      setUpdatingTaskId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-100">
        <Loader2 className="h-12 w-12 animate-spin text-[#FF5722]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      
      {/* --- Header --- */}
      <header className="bg-white shadow-sm sticky top-0 z-30 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <img src="https://i.imgur.com/eioVNZq.png" alt="Logo" className="h-8" />
            <h1 className="text-xl font-bold text-gray-900">
              Employee Dashboard
            </h1>
          </div>
          <button
            onClick={logout}
            className="flex items-center gap-2 px-4 py-2 bg-[#FF5722] text-white text-sm font-semibold rounded-lg hover:bg-[#E64A19] transition-colors"
          >
            <LogOut size={16} />
            Logout
          </button>
        </div>
      </header>

      {/* --- Main Content --- */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* --- Welcome Message --- */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900">
            Welcome back, {profile?.first_name || 'Employee'}!
          </h2>
        </div>

        {/* --- Main Layout Grid --- */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">

          {/* --- Main Content (Tasks) --- */}
          <div className="lg:col-span-3 space-y-6">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <h4 className="text-lg font-semibold text-gray-900 mb-4">My Assignments</h4>
              {tasks.length === 0 ? (
                <div className="text-center py-12">
                  <Target className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 font-medium">No tasks assigned yet.</p>
                  <p className="text-sm text-gray-400">Enjoy the quiet... for now.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {tasks.map((task) => (
                    <TaskItem 
                      key={task.id} 
                      task={task} 
                      onStatusChange={updateTaskStatus} 
                      isUpdating={updatingTaskId === task.id} 
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
          
          {/* --- Sidebar (Profile) --- */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <div className="flex flex-col items-center">
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
                <h3 className="text-xl font-bold text-gray-900 mt-4">
                  {profile?.first_name} {profile?.last_name}
                </h3>
                <p className="text-base text-[#FF5722] font-medium">{profile?.position || 'N/A'}</p>
              </div>
              
              <div className="border-t border-gray-100 my-6" />

              <div className="space-y-4">
                <InfoRow icon={Mail} label="Email" value={profile?.email} />
                <InfoRow icon={Phone} label="Phone" value={profile?.phone} />
                <InfoRow icon={MapPin} label="Home Address" value={profile?.home_address} />
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <h4 className="text-lg font-semibold text-gray-900 mb-4">Employment Details</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-5">
                <InfoRow icon={Hash} label="Employee Number" value={profile?.employee_number} />
                <InfoRow icon={Award} label="Position" value={profile?.position} />
                <InfoRow icon={Calendar} label="Start Date" value={formatDate(profile?.start_date)} />
                <InfoRow icon={Calendar} label="End Date" value={formatDate(profile?.end_date)} />
                <InfoRow icon={FileText} label="National ID" value={profile?.national_id} />
                <InfoRow icon={Calendar} label="Birth Date" value={formatDate(profile?.birth_date)} />
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <h4 className="text-lg font-semibold text-gray-900 mb-4">Financial Details</h4>
              <div className="space-y-4">
                <InfoRow icon={DollarSign} label="Salary" value={profile?.salary ? `GHS ${Number(profile.salary).toLocaleString()}` : 'N/A'} />
                <InfoRow icon={Calendar} label="Payday" value={profile?.payday} />
                <InfoRow icon={Building} label="Bank" value={profile?.bank_name} />
                <InfoRow icon={CreditCard} label="Account" value={profile?.bank_account} />
              </div>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
};

export default EmployeeDashboardPage;