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
  Search
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

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
  const [profile, setProfile] = useState<Profile | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingTaskId, setUpdatingTaskId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // UI: filters & search
  const [statusFilter, setStatusFilter] = useState<'all' | Task['status']>('all');
  const [query, setQuery] = useState('');

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
        alert('Failed to update task status');
      } else {
        setTasks((prev) => prev.map((t) => (t.id === taskId ? { ...t, status: newStatus } : t)));
      }
    } catch (err) {
      console.error('Unexpected error updating task:', err);
      alert('Unexpected error updating task status');
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
            <button
              onClick={fetchProfileAndTasks}
              className="inline-flex items-center gap-2 px-3 py-2 text-sm font-semibold rounded-lg border border-gray-200 hover:bg-gray-100"
              title="Refresh"
            >
              <RefreshCw size={16} />
              Refresh
            </button>
            <button
              onClick={logout}
              className="flex items-center gap-2 px-4 py-2 bg-[#FF5722] text-white text-sm font-semibold rounded-lg hover:bg-[#E64A19] transition-colors"
            >
              <LogOut size={16} />
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome + Stats */}
        <div className="mb-8">
          <div className="flex flex-col gap-4">
            <div>
              <h2 className="text-3xl font-bold text-gray-900">
                Welcome back, {profile?.first_name || 'Employee'}!
              </h2>
              <p className="text-sm text-gray-500">
                Here’s a quick snapshot of your assignments and details.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
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
            </div>
          </div>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left: Profile + Financial */}
          <div className="lg:col-span-1 space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white p-6 rounded-xl shadow-sm border border-gray-200"
            >
              <div className="flex flex-col items-center text-center">
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
                  {(profile?.first_name || '') + ' ' + (profile?.last_name || '')}
                </h3>
                <p className="text-base text-[#FF5722] font-medium">
                  {profile?.position || 'N/A'}
                </p>
              </div>

              <div className="border-t border-gray-100 my-6" />

              <div className="space-y-4">
                <InfoRow icon={Mail} label="Email" value={profile?.email} />
                <InfoRow icon={Phone} label="Phone" value={profile?.phone} />
                <InfoRow icon={MapPin} label="Home Address" value={profile?.home_address} />
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white p-6 rounded-xl shadow-sm border border-gray-200"
            >
              <h4 className="text-lg font-semibold text-gray-900 mb-4">Financial Details</h4>
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

          {/* Right: Employment + Tasks */}
          <div className="lg:col-span-2 space-y-6">
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

            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white p-6 rounded-xl shadow-sm border border-gray-200"
            >
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
                <h4 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <Target className="w-5 h-5 text-[#FF5722]" />
                  My Assignments
                </h4>

                <div className="flex items-center gap-2">
                  <div className="relative">
                    <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      placeholder="Search tasks…"
                      className="pl-9 pr-3 py-2 text-sm rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#FF5722] w-56"
                    />
                  </div>
                  <div className="flex gap-1 bg-gray-100 p-1 rounded-lg">
                    {(['all', 'pending', 'in_progress', 'completed'] as const).map((key) => (
                      <button
                        key={key}
                        onClick={() => setStatusFilter(key as any)}
                        className={`px-3 py-1.5 rounded-md text-sm font-medium transition ${
                          statusFilter === key
                            ? 'bg-white shadow-sm border border-gray-200'
                            : 'text-gray-600 hover:bg-white/70'
                        }`}
                      >
                        {key === 'all'
                          ? 'All'
                          : key === 'in_progress'
                          ? 'In Progress'
                          : key[0].toUpperCase() + key.slice(1)}
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
        </div>
      </main>
    </div>
  );
};

export default EmployeeDashboardPage;
