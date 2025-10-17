// @ts-nocheck
import React, { useState, useEffect } from 'react';
import Card from '../components/Card';
import { Loader2 } from 'lucide-react';
import {
  getAllJobPositions,
  updateJobPosition,
  type JobPosition
} from '../../../../lib/supabase/operations';

const JobsTab: React.FC = () => {
  const [positions, setPositions] = useState<JobPosition[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchPositions();
  }, []);

  const fetchPositions = async () => {
    const { data, error: fetchError } = await getAllJobPositions();
    if (fetchError) {
      setError('Failed to load positions');
      console.error(fetchError);
    } else {
      setPositions(data || []);
    }
    setLoading(false);
  };

  const handleToggleStatus = async (position: JobPosition) => {
    const newStatus = position.status === 'open' ? 'closed' : 'open';

    setPositions(prev => prev.map(p => p.id === position.id ? { ...p, status: newStatus } : p));

    const { error } = await updateJobPosition(position.id, { status: newStatus });
    if (error) {
      console.error('Failed to update status:', error);
      setPositions(prev => prev.map(p => p.id === position.id ? { ...p, status: position.status } : p));
    }
  };

  const groupedPositions = positions.reduce((acc, pos) => {
    const team = pos.team_name || 'Uncategorized';
    if (!acc[team]) acc[team] = [];
    acc[team].push(pos);
    return acc;
  }, {} as Record<string, JobPosition[]>);

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="w-10 h-10 animate-spin text-gray-400" /></div>;
  if (error) return <div className="text-center py-20 text-red-600">{error}</div>;

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Job Positions</h2>
      <p className="text-gray-600">Manage job postings. Use the Teams tab for full editing capabilities.</p>

      {Object.entries(groupedPositions).map(([teamName, teamPositions]) => (
        <Card key={teamName} title={`${teamName} (${teamPositions.length} positions)`}>
          <div className="space-y-4">
            {teamPositions.map((position) => (
              <div key={position.id} className="flex items-start justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900">{position.title}</h4>
                  <p className="text-sm text-gray-600 mt-1">{position.description}</p>
                </div>
                <div className="ml-4">
                  <button
                    onClick={() => handleToggleStatus(position)}
                    className={`px-3 py-1 rounded-full text-sm font-medium ${
                      position.status === 'open'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {position.status === 'open' ? 'Open' : 'Closed'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </Card>
      ))}
    </div>
  );
};

export default JobsTab;
