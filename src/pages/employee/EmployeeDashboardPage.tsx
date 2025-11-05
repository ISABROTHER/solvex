import React, { useEffect, useState } from 'react';
import { useAuth } from '../../features/auth';
import { supabase } from '../../lib/supabase/client';
import { Loader2, Calendar, MapPin, Phone, CreditCard, Briefcase, User, Hash, FileText, DollarSign } from 'lucide-react';

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

    try {
      const { data: profileData, error: profileError } = await (supabase as any)
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();

      if (profileError) {
        console.error('Error fetching profile:', profileError);
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
      } else {
        setTasks(tasksData || []);
      }
    } catch (error) {
      console.error('Unexpected error:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateTaskStatus = async (taskId: string, newStatus: 'pending' | 'in_progress' | 'completed') => {
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'low': return 'text-green-600';
      case 'medium': return 'text-yellow-600';
      case 'high': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Employee Dashboard</h1>
          <button
            onClick={logout}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
          >
            Logout
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex items-start space-x-6">
            <div className="flex-shrink-0">
              {profile?.avatar_url ? (
                <img
                  src={profile.avatar_url}
                  alt="Profile"
                  className="w-32 h-32 rounded-full object-cover border-4 border-blue-100"
                />
              ) : (
                <div className="w-32 h-32 rounded-full bg-blue-100 flex items-center justify-center border-4 border-blue-200">
                  <User className="w-16 h-16 text-blue-600" />
                </div>
              )}
            </div>

            <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center space-x-3">
                <User className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">Name</p>
                  <p className="font-semibold text-gray-900">
                    {profile?.first_name} {profile?.last_name}
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <Hash className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">Employee Number</p>
                  <p className="font-semibold text-gray-900">{profile?.employee_number || 'N/A'}</p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <Calendar className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">Birth Date</p>
                  <p className="font-semibold text-gray-900">{formatDate(profile?.birth_date)}</p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <FileText className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">National ID</p>
                  <p className="font-semibold text-gray-900">{profile?.national_id || 'N/A'}</p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <Briefcase className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">Position</p>
                  <p className="font-semibold text-gray-900">{profile?.position || 'N/A'}</p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <Calendar className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">Employment Period</p>
                  <p className="font-semibold text-gray-900">
                    {formatDate(profile?.start_date)} - {formatDate(profile?.end_date)}
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <MapPin className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">Home Address</p>
                  <p className="font-semibold text-gray-900">{profile?.home_address || 'N/A'}</p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <Phone className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">Phone Number</p>
                  <p className="font-semibold text-gray-900">{profile?.phone || 'N/A'}</p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <DollarSign className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">Salary</p>
                  <p className="font-semibold text-gray-900">
                    {profile?.salary ? `$${Number(profile.salary).toLocaleString()}` : 'N/A'}
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <Calendar className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">Payday</p>
                  <p className="font-semibold text-gray-900">{profile?.payday || 'N/A'}</p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <CreditCard className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">Bank Account</p>
                  <p className="font-semibold text-gray-900">
                    {profile?.bank_account || 'N/A'}
                    {profile?.bank_name && ` (${profile.bank_name})`}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6">My Assignments</h2>

          {tasks.length === 0 ? (
            <div className="text-center py-12">
              <Briefcase className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No tasks assigned yet</p>
            </div>
          ) : (
            <div className="space-y-4">
              {tasks.map((task) => (
                <div
                  key={task.id}
                  className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition"
                >
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 text-lg">{task.title}</h3>
                      {task.description && (
                        <p className="text-gray-600 mt-1">{task.description}</p>
                      )}
                    </div>
                    <span className={`ml-4 text-sm font-medium ${getPriorityColor(task.priority)}`}>
                      {task.priority.toUpperCase()}
                    </span>
                  </div>

                  <div className="flex items-center justify-between mt-4">
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      {task.deadline && (
                        <div className="flex items-center space-x-1">
                          <Calendar className="w-4 h-4" />
                          <span>Due: {formatDate(task.deadline)}</span>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center space-x-3">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(task.status)}`}>
                        {task.status.replace('_', ' ').toUpperCase()}
                      </span>
                      <select
                        value={task.status}
                        onChange={(e) => updateTaskStatus(task.id, e.target.value as any)}
                        disabled={updatingTaskId === task.id}
                        className="px-3 py-1 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                      >
                        <option value="pending">Pending</option>
                        <option value="in_progress">In Progress</option>
                        <option value="completed">Completed</option>
                      </select>
                      {updatingTaskId === task.id && (
                        <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default EmployeeDashboardPage;
