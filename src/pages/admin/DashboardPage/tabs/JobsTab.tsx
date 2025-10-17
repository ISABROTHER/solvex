import React, { useState, useEffect, useCallback } from 'react';
import Card from '../components/Card';
import { PlusCircle, Edit2, Trash2, Loader2, Send } from 'lucide-react';
import { getJobTeamsAndPositions, updateJobPosition } from '../../../../lib/supabase/operations'; // Import new fetch/update functions
import type { Database } from '../../../../lib/supabase/database.types';
import { useToast } from '../../../../contexts/ToastContext';

type JobPosition = Database['public']['Tables']['job_positions']['Row'];
type JobTeamWithPositions = Database['public']['Tables']['job_teams']['Row'] & {
  job_positions: JobPosition[];
};

const JobsTab: React.FC = () => {
  const [teams, setTeams] = useState<JobTeamWithPositions[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { addToast } = useToast();

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    const { data, error: fetchError } = await getJobTeamsAndPositions(); // CALL LIVE FETCH
    if (fetchError) {
      setError("Failed to fetch job data. Did you run 'Sync Now' in Settings?");
      console.error(fetchError);
      setTeams([]);
    } else {
      setTeams(data || []);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchData();
    // In a real app, you would set up a realtime subscription here for instant updates.
  }, [fetchData]);

  const handleToggleOpen = async (position: JobPosition) => {
    const newStatus = !position.is_open;
    
    // Optimistic Update
    setTeams(prevTeams => prevTeams.map(team => ({
        ...team,
        job_positions: team.job_positions.map(pos => 
            pos.id === position.id ? { ...pos, is_open: newStatus } : pos
        )
    })));

    const { error: updateError } = await updateJobPosition(position.id, { is_open: newStatus });
    
    if (updateError) {
        addToast({ type: 'error', title: 'Update Failed', message: updateError.message });
        fetchData(); // Revert on failure
    } else {
        addToast({ type: 'success', title: 'Status Updated', message: `${position.name} is now ${newStatus ? 'Open' : 'Closed'}.` });
    }
  };

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="w-10 h-10 animate-spin text-gray-400" /></div>;

  if (error) return <div className="text-center py-20 text-red-600">{error}</div>;

  return (
    <div className="space-y-8">
      {teams.length === 0 ? (
        <Card>
          <p className="text-center text-gray-500 py-8">No teams or job postings are loaded.</p>
          <p className="text-center text-sm text-gray-600 mt-2">Go to the **Settings Tab** and click **"Sync Now"** to load the initial job data.</p>
        </Card>
      ) : (
        teams.map(team => (
          <Card key={team.id} title={team.name} right={
            <button onClick={() => alert('Add New Position form would open here.')} className="flex items-center gap-2 text-sm font-semibold text-gray-600 hover:text-black">
              <PlusCircle size={16} />
              Add Position
            </button>
          }>
            <div className="space-y-3">
              {team.job_positions
                .sort((a, b) => (a.is_open === b.is_open ? 0 : a.is_open ? -1 : 1)) // Sort open jobs first
                .map((pos) => (
                <div key={pos.id} className="flex items-center justify-between p-3 rounded-lg bg-gray-50 border">
                  <p className="font-medium text-gray-800">{pos.name}</p>
                  <div className="flex items-center gap-2">
                    <button
                        onClick={() => handleToggleOpen(pos)}
                        className={`px-3 py-1 text-xs font-semibold rounded-full transition-colors flex items-center gap-1 ${
                          pos.is_open ? 'bg-green-100 text-green-800 hover:bg-green-200' : 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
                        }`}
                    >
                        {pos.is_open ? <Send size={12} className='-rotate-90'/> : <Loader2 size={12}/>}
                        {pos.is_open ? 'Open' : 'Draft'}
                    </button>
                    <button onClick={() => alert('Edit form here')} className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-200 rounded-md"><Edit2 size={14} /></button>
                    <button onClick={() => alert('Delete logic here')} className="p-2 text-red-500 hover:bg-red-100 rounded-md"><Trash2 size={14} /></button>
                  </div>
                </div>
              ))}
              {team.job_positions.length === 0 && (
                  <p className="text-sm text-gray-500 px-3 py-4 text-center">No job postings for this team yet.</p>
              )}
            </div> 
          </Card>
        ))
      )}
    </div>
  );
};

export default JobsTab;