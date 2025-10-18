// src/pages/admin/DashboardPage/tabs/JobsTab.tsx
// @ts-nocheck
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Card from '../components/Card';
import { Loader2, PlusCircle, Edit2, Trash2, RefreshCw, AlertCircle, X, ExternalLink } from 'lucide-react';
import {
  getAllJobPositions,
  updateJobPosition,
  createJobPosition,
  softDeleteJobPosition,
  getAllTeams,
} from '../../../../lib/supabase/operations';
import type { JobPosition, Team } from '../../../../lib/supabase/operations';
import { supabase } from '../../../../lib/supabase/client';
import { useToast } from '../../../../contexts/ToastContext';
import JobEditModal from '../components/JobEditModal'; // Import the new modal

const JobsTab: React.FC = () => {
  const [positions, setPositions] = useState<JobPosition[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = setIsSaving(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingJob, setEditingJob] = useState<JobPosition | null>(null);
  const { addToast } = useToast();
  
  // Memoize grouped positions
  const groupedPositions = useMemo(() => {
    return positions.reduce((acc, pos) => {
        const teamName = pos.team_name || 'Uncategorized';
        if (!acc[teamName]) acc[teamName] = [];
        acc[teamName].push(pos);
        return acc;
    }, {} as Record<string, JobPosition[]>);
  }, [positions]);

  // Unified fetch function
  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);

    const [positionsResult, teamsResult] = await Promise.all([
      getAllJobPositions(),
      getAllTeams(),
    ]);

    if (positionsResult.error) {
      setError('Failed to load job positions. Check RLS policies.');
    } else {
      setPositions(positionsResult.data || []);
    }
    
    if (teamsResult.error) {
        // Log team error but don't stop position rendering
        console.error('Failed to load teams:', teamsResult.error);
    } else {
        setTeams(teamsResult.data || []);
    }

    setLoading(false);
  }, []);

  // Initial fetch and Realtime Subscription
  useEffect(() => {
    fetchData();
    
    // Setup Real-time listener for job_positions
    const jobChannel = supabase.channel('public:job_positions_admin')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'job_positions' }, () => fetchData())
      .subscribe();
      
    // Setup Real-time listener for teams (in case names change)
    const teamChannel = supabase.channel('public:teams_jobs_sync')
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'teams' }, () => fetchData())
      .subscribe();

    return () => {
      supabase.removeChannel(jobChannel);
      supabase.removeChannel(teamChannel);
    };
  }, [fetchData]);
  
  
  // CRUD Handlers
  const handleSaveJob = async (jobData: Partial<JobPosition>) => {
    setIsSaving(true);
    const isUpdating = !!jobData.id;
    const action = isUpdating ? 'Update' : 'Create';

    // Optimistic update
    if (isUpdating) {
        setPositions(prev => prev.map(p => p.id === jobData.id ? { ...p, ...jobData } : p));
    }

    try {
        let result;
        if (isUpdating) {
            result = await updateJobPosition(jobData.id, jobData);
        } else {
            result = await createJobPosition(jobData);
        }

        if (result.error) throw result.error;
        addToast({ type: 'success', title: `Job ${action}d!`, message: `Position "${jobData.title}" was saved.` });
        // The real-time listener will fetch and update the full list.

    } catch (err) {
        addToast({ type: 'error', title: `${action} Failed`, message: `Failed to save job. Error: ${err.message || 'Unknown'}` });
        // Full list re-fetch handles rollback
        fetchData(); 
    } finally {
        setIsSaving(false);
    }
  };

  const handleToggleStatus = async (position: JobPosition) => {
    const newStatus = position.status === 'open' ? 'closed' : 'open';
    
    // Optimistic update
    setPositions(prev => prev.map(p => p.id === position.id ? { ...p, status: newStatus } : p));

    const { error: updateError } = await updateJobPosition(position.id, { status: newStatus });
    if (updateError) {
      addToast({ type: 'error', title: 'Update Failed', message: `Failed to toggle status: ${updateError.message}` });
      // Rollback on failure
      setPositions(prev => prev.map(p => p.id === position.id ? { ...p, status: position.status } : p));
    } else {
       addToast({ type: 'success', title: 'Status Updated', message: `${position.title} is now ${newStatus}.` });
    }
  };
  
  const handleDeleteJob = async (position: JobPosition) => {
      if (!window.confirm(`Are you sure you want to soft-delete the job posting "${position.title}"? It will be hidden from the public careers page.`)) return;
      
      // Optimistic delete
      setPositions(prev => prev.filter(p => p.id !== position.id));
      
      const { error: deleteError } = await softDeleteJobPosition(position.id);
      
      if (deleteError) {
          addToast({ type: 'error', title: 'Delete Failed', message: deleteError.message });
          // Rollback on failure (full re-fetch)
          fetchData(); 
      } else {
          addToast({ type: 'success', title: 'Posting Deleted', message: `${position.title} is now soft-deleted.` });
      }
  };


  if (loading) return <div className="flex justify-center py-20"><Loader2 className="w-10 h-10 animate-spin text-gray-400" /></div>;
  if (error) return <div className="text-center py-20 text-red-600 flex flex-col items-center gap-3"><AlertCircle className="w-6 h-6" />{error}</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Job Postings Manager</h2>
        <button
            onClick={() => { setEditingJob(null); setIsModalOpen(true); }}
            className="flex items-center gap-2 px-4 py-2 bg-[#FF5722] text-white rounded-lg text-sm font-semibold hover:bg-[#E64A19] transition-colors"
        >
          <PlusCircle size={16} />
          Add New Job
        </button>
      </div>
      
      <p className="text-gray-600 text-sm">Total active positions: {positions.filter(p => p.status === 'open').length} / {positions.length}</p>

      {Object.entries(groupedPositions).map(([teamName, teamPositions]) => (
        <Card 
            key={teamName} 
            title={teamName === 'Uncategorized' ? `Uncategorized Jobs (${teamPositions.length})` : teamName}
        >
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
                <thead className="bg-gray-50">
                    <tr className="text-left text-gray-600 border-b">
                        <th className="px-4 py-2 font-semibold">Position Title</th>
                        <th className="px-4 py-2 font-semibold hidden md:table-cell">Date Posted</th>
                        <th className="px-4 py-2 font-semibold w-20 text-center">Status</th>
                        <th className="px-4 py-2 font-semibold w-32 text-right">Actions</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                    {teamPositions.map((position) => (
                        <tr key={position.id} className="hover:bg-gray-50 transition-colors">
                            <td className="px-4 py-3 font-medium text-gray-800">
                                {position.title}
                                <span className="block text-xs text-gray-500 line-clamp-1">{position.description}</span>
                            </td>
                            <td className="px-4 py-3 text-gray-600 hidden md:table-cell">
                                {new Date(position.created_at).toLocaleDateString()}
                            </td>
                            <td className="px-4 py-3 text-center">
                                <button
                                    onClick={() => handleToggleStatus(position)}
                                    className={`px-3 py-1 rounded-full text-xs font-medium ring-1 ring-inset transition-colors ${
                                      position.status === 'open'
                                        ? 'bg-green-100 text-green-800 ring-green-300 hover:bg-green-200'
                                        : 'bg-gray-100 text-gray-700 ring-gray-300 hover:bg-gray-200'
                                    } disabled:opacity-50`}
                                    disabled={isSaving}
                                >
                                    {position.status === 'open' ? 'Open' : 'Closed'}
                                </button>
                            </td>
                            <td className="px-4 py-3 text-right">
                                <div className="flex justify-end gap-2">
                                    <button 
                                        onClick={() => { setEditingJob(position); setIsModalOpen(true); }}
                                        className="p-1 text-gray-500 hover:bg-gray-200 rounded-md" 
                                        aria-label="Edit Job"
                                        disabled={isSaving}
                                    >
                                        <Edit2 size={16} />
                                    </button>
                                    <button 
                                        onClick={() => handleDeleteJob(position)}
                                        className="p-1 text-red-500 hover:bg-red-100 rounded-md" 
                                        aria-label="Delete Job"
                                        disabled={isSaving}
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
          </div>
        </Card>
      ))}
      
      {/* Edit/Create Modal */}
      <JobEditModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        job={editingJob}
        teams={teams}
        onSave={handleSaveJob}
        isSaving={isSaving}
      />
    </div>
  );
};

export default JobsTab;
