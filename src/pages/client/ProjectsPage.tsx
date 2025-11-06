// src/pages/client/ProjectsPage.tsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase/client';
import { useAuth } from '../../features/auth/AuthProvider';
import { Loader2, XCircle, Package, ArrowRight, CheckCircle, Clock, Info } from 'lucide-react';
import { Database } from '../../lib/supabase/database.types';

type ClientProject = Database['public']['Tables']['client_projects']['Row'];

// --- New Status Icon Component ---
const StatusIcon: React.FC<{ status: string | null }> = ({ status }) => {
  switch (status) {
    case 'completed':
      return <CheckCircle className="h-5 w-5 text-green-500" />;
    case 'in_progress':
    case 'active':
      return <Clock className="h-5 w-5 text-blue-500" />;
    case 'pending':
    case 'on_hold':
    default:
      return <Info className="h-5 w-5 text-yellow-500" />;
  }
};

// --- New Project Card Component ---
const ProjectCard: React.FC<{ project: ClientProject }> = ({ project }) => {
  return (
    <Link
      to={`/client/projects/${project.id}`}
      className="block bg-white shadow-sm rounded-lg p-5 hover:shadow-md transition-shadow duration-200"
    >
      <div className="flex justify-between items-start">
        <h3 className="text-lg font-semibold text-gray-800 group-hover:text-[#FF5722]">
          {project.title}
        </h3>
        <span className="text-xs font-medium text-gray-500 capitalize">
          {project.status}
        </span>
      </div>
      <p className="text-sm text-gray-600 mt-2 line-clamp-2">
        {project.description || 'No description provided.'}
      </p>
      <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-100">
        <div className="flex items-center space-x-2">
          <StatusIcon status={project.status} />
          <span className="text-sm text-gray-500">
            {new Date(project.created_at || '').toLocaleDateString()}
          </span>
        </div>
        <div className="inline-flex items-center text-sm font-medium text-[#FF5722]">
          View Details
          <ArrowRight className="h-4 w-4 ml-1" />
        </div>
      </div>
    </Link>
  );
};

const ProjectsPage: React.FC = () => {
  const { user } = useAuth();
  const [projects, setProjects] = useState<ClientProject[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProjects = async () => {
      if (!user) return;

      setIsLoading(true);
      setError(null);
      try {
        // --- UPDATED: Fetch from 'client_projects' ---
        const { data, error: fetchError } = await supabase
          .from('client_projects') // <-- UPDATED
          .select('*')
          .eq('client_id', user.id)
          .order('created_at', { ascending: false });

        if (fetchError) throw fetchError;
        setProjects(data || []);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProjects();
  }, [user]);

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex justify-center items-center min-h-[400px]">
          <Loader2 className="h-10 w-10 animate-spin text-gray-500" />
        </div>
      );
    }

    if (error) {
      return (
        <div className="bg-white shadow-sm rounded-lg p-10 text-center border border-red-200">
          <XCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-red-600">Error Fetching Projects</h2>
          <p className="text-gray-500 mt-2">{error}</p>
        </div>
      );
    }

    if (projects.length === 0) {
      return (
        <div className="bg-white shadow-sm rounded-lg p-10 flex items-center justify-center border border-dashed border-gray-300">
          <div className="text-center">
            <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-700">No Projects Found</h2>
            <p className="text-gray-500 mt-2">
              Your active projects will appear here once they are created by our team.
            </p>
          </div>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {projects.map(project => (
          <ProjectCard key={project.id} project={project} />
        ))}
      </div>
    );
  };

  return (
    <div className="max-w-7xl mx-auto">
      <header className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">My Projects</h1>
        <p className="text-lg text-gray-600 mt-1">
          View the status and tasks for all your active projects.
        {/* --- THIS WAS THE BROKEN LINE --- */}
        </p>
      </header>

      {renderContent()}
    </div>
  );
};

export default ProjectsPage;