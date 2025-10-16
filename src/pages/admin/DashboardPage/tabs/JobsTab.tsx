import React, { useState, useEffect } from 'react';
import Card from '../components/Card';
import { PlusCircle, Edit2, Trash2, Loader2 } from 'lucide-react';

// --- MOCK DATA ADDED HERE ---
// This placeholder data will be used until the database function is built.
const mockTeams = [
  {
    id: 'team_1',
    name: "Strategy & Planning Team",
    job_positions: [
      { id: 'pos_1', name: "Brand Strategist", description: "..." },
      { id: 'pos_2', name: "Advertising Specialist", description: "..." },
    ]
  },
  {
    id: 'team_2',
    name: "Technology and Innovation Team",
    job_positions: [
      { id: 'pos_3', name: "Software Developer/Engineer", description: "..." },
    ]
  },
  {
    id: 'team_3',
    name: "Content & Production Team",
    job_positions: [
      { id: 'pos_4', name: "Video Editor / Videographer", description: "..." },
      { id: 'pos_5', name: "Graphic Designer", description: "..." },
    ]
  }
];

const JobsTab: React.FC = () => {
  const [teams, setTeams] = useState<any[]>([]); // Use 'any' for simplicity with mock data
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate fetching data
    setLoading(true);
    setTimeout(() => {
      setTeams(mockTeams);
      setLoading(false);
    }, 500); // A small delay to show the loading spinner
  }, []);

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="w-10 h-10 animate-spin text-gray-400" /></div>;

  return (
    <div className="space-y-8">
      {teams.length === 0 ? (
        <Card>
          <p className="text-center text-gray-500 py-8">No teams or job postings have been created yet.</p>
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
              {team.job_positions.map((pos: any) => (
                <div key={pos.id} className="flex items-center justify-between p-3 rounded-lg bg-gray-50 border">
                  <p className="font-medium text-gray-800">{pos.name}</p>
                  <div className="flex items-center gap-2">
                    <button className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-200 rounded-md"><Edit2 size={14} /></button>
                    <button className="p-2 text-red-500 hover:bg-red-100 rounded-md"><Trash2 size={14} /></button>
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