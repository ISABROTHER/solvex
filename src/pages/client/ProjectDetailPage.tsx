// src/pages/client/ProjectDetailPage.tsx
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase/client';
import { useAuth } from '../../features/auth/AuthProvider';
import { Loader2, XCircle, CheckCircle, Clock, ArrowLeft, Package, Calendar, Info } from 'lucide-react';
// Note: We'll define types locally in case the main 'database.types.ts' isn't updated yet
import { Database } from '../../lib/supabase/database.types';

// Use correct types if available, otherwise 'any'
type ClientTask = Database['public']['Tables']['client_tasks']['Row'];
type ClientProject = Database['public']['Tables']['client_projects']['Row'];

interface ProjectWithTasks extends ClientProject {
  client_tasks: ClientTask[];
}

// --- New Status Badge Component ---
const StatusBadge: React.FC<{ status: string | null; type: 'project' | 'task' }> = ({ status, type }) => {
  let bgColor, textColor, text;

  switch (status) {
    case 'completed':
      bgColor = 'bg-green-100';
      textColor = 'text-green-700';
      text = 'Completed';
      break;
    case 'in_progress':
      bgColor = 'bg-blue-100';
      textColor = 'text-blue-700';
      text = 'In Progress';
      break;
    case 'on_hold':
      bgColor = 'bg-gray-100';
      textColor = 'text-gray-700';
      text = 'On Hold';
      break;
    case 'active': // Project status
      bgColor = 'bg-blue-100';
      textColor = 'text-blue-700';
      text = 'Active';
      break;
    case 'pending': // Task or Project status
    default:
      bgColor = 'bg-yellow-100';
      textColor = 'text-yellow-700';
      text = 'Pending';
      break;
  }
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${bgColor} ${textColor}`}>
      {text}
    </span>
  );
};

// --- New Task Item Component ---
const TaskItem: React.FC<{ task: ClientTask }> = ({ task }) => {
  const Icon = task.status === 'completed' ? CheckCircle : task.status === 'in_progress' ? Clock : Info;
  const iconColor = task.status === 'completed' ? 'text-green-500' : task.status === 'in_progress' ? 'text-blue-500' : 'text-yellow-500';

  return (
    <li className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
      <div className="flex items-center space-x-3">
        <Icon className={`h-6 w-6 flex-shrink-0 ${iconColor}`} />
        <div>
          <p className="text-sm font-medium text-gray-900">{task.title}</p>
          {task.description && (
            <p className="text-sm text-gray-500">{task.description}</p>
          )}
        </div>
      </div>
      <div className="flex-shrink-0 text-right">
        {task.due_date && (
          <p className="text-xs text-gray-500 flex items-center">
            <Calendar className="h-3 w-3 mr-1" />
            Due: {new Date(task.due_date).toLocaleDateString()}
          </p>
        )}
        <StatusBadge status={task.status} type="task" />
      </div>
    </li>
  );
};

const ProjectDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [project, setProject] = useState<ProjectWithTasks | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProject = async () => {
      if (!id || !user) {
        setIsLoading(false);
        setError('Not authorized or project not found.');
        return;
      }

      setIsLoading(true);
      setError(null);
      try {
        // --- UPDATED: Fetch from 'client_projects' and select 'client_tasks' ---
        const { data, error: fetchError } = await supabase
          .from('client_projects')
          .select('*, client_tasks(*)') // <-- UPDATED
          .eq('id', id)
          .eq('client_id', user.id) // Security check
          .single();

        if (fetchError) throw fetchError;
        if (!data) throw new Error('Project not found or access denied.');

        setProject(data as ProjectWithTasks);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProject();
  }, [id, user]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <Loader2 className="h-10 w-10 animate-spin text-gray-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center p-6 bg-white shadow-sm rounded-lg">
        <XCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-red-600">Error</h2>
        <p className="text-gray-500 mt-2">{error}</p>
        <Link
          to="/client/projects"
          className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-gray-600 hover:bg-gray-700"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Projects
        </Link>
      </div>
    );
  }

  if (!project) {
    return null; // Should be covered by error state
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Back Button */}
      <div className="mb-4">
        <Link
          to="/client/projects"
          className="inline-flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="h-4 w-4" />
          All Projects
        </Link>
      </div>

      {/* Project Header */}
      <div className="bg-white shadow-sm rounded-lg p-6 mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div className="mb-4 sm:mb-0">
            <h1 className="text-3xl font-bold text-gray-900">{project.title}</h1>
            <p className="text-sm text-gray-500 mt-1">
              Created: {new Date(project.created_at || '').toLocaleDateString()}
            </p>
          </div>
          <div>
            <label className="text-xs font-medium text-gray-500">Project Status</label>
            <div className="mt-1">
              <StatusBadge status={project.status} type="project" />
            </div>
          </div>
        </div>
        {project.description && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <h2 className="text-lg font-semibold text-gray-800">Description</h2>
            <p className="text-gray-600 mt-2">{project.description}</p>
          </div>
        )}
      </div>

      {/* Tasks Section */}
      <div>
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">Project Tasks</h2>
        {/* --- UPDATED: Check 'client_tasks' --- */}
        {project.client_tasks && project.client_tasks.length > 0 ? (
          <div className="bg-white shadow-sm rounded-lg overflow-hidden">
            <ul className="divide-y divide-gray-200 space-y-2 p-4">
              {project.client_tasks.sort((a, b) => new Date(a.created_at!).getTime() - new Date(b.created_at!).getTime()).map(task => (
                <TaskItem key={task.id} task={task} />
              ))}
            </ul>
          </div>
        ) : (
          <div className="bg-white shadow-sm rounded-lg p-10 flex items-center justify-center border border-dashed border-gray-300">
            <div className="text-center">
              <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-700">No tasks yet</h3>
              <p className="text-gray-500 mt-1">Tasks for this project will appear here once they are added.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProjectDetailPage;