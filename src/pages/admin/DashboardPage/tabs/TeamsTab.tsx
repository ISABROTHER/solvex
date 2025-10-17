// @ts-nocheck
import React, { useState, useEffect, useCallback, useMemo } from "react";
import Card from "../components/Card";
import { Loader2, Plus, X, Pencil, Trash2, Eye, Users, Briefcase, Save, Image, ListOrdered } from "lucide-react";
import {
  getAllJobPositions,
  getAllJobApplications,
  createJobPosition,
  updateJobPosition,
  deleteJobPosition,
  onJobPositionsChange,
  onJobApplicationsChange,
  type JobPosition,
  type JobPositionInsert,
  getAllTeams,
  updateTeam,
  createTeam,
  type Team
} from "../../../../lib/supabase/operations";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "../../../../contexts/ToastContext";

// Define TeamFormState including description, image_url, and display_order
type TeamFormState = Partial<Team>;

// Define the state type for the Job Position input form
type PositionFormState = Partial<JobPositionInsert> & {
  requirementsText: string;
};

// --- START NEW COMPONENT: Team Edit Modal ---
const TeamEditModal = ({ isOpen, onClose, team, onSave }) => {
  const [formData, setFormData] = useState(team);

  useEffect(() => {
    setFormData(team);
  }, [team]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ 
      ...prev, 
      [name]: type === 'checkbox' ? checked : (name === 'display_order' ? parseInt(value) || 0 : value) 
    }));
  };

  const handleSave = () => {
    onSave(formData);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative w-full max-w-xl bg-white rounded-2xl shadow-2xl max-h-[90vh] overflow-hidden flex flex-col">
        <div className="flex-shrink-0 p-6 flex justify-between items-center border-b">
          <h3 className="text-xl font-bold text-gray-900">{team.id ? `Edit Team: ${team.name}` : 'Create New Team'}</h3>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-200"><X size={20} /></button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Team Name*</label>
            <input type="text" name="name" value={formData.name || ''} onChange={handleChange} className="w-full px-3 py-2 border rounded-lg bg-gray-50 focus:ring-[#FF5722]" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1"><Image className="w-4 h-4 inline mr-1" /> Image URL</label>
            <input type="url" name="image_url" value={formData.image_url || ''} onChange={handleChange} className="w-full px-3 py-2 border rounded-lg bg-gray-50 focus:ring-[#FF5722]" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1"><ListOrdered className="w-4 h-4 inline mr-1" /> Display Order</label>
            <input type="number" name="display_order" value={formData.display_order || 0} onChange={handleChange} className="w-full px-3 py-2 border rounded-lg bg-gray-50 focus:ring-[#FF5722]" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea name="description" value={formData.description || ''} onChange={handleChange} rows={3} className="w-full px-3 py-2 border rounded-lg bg-gray-50 focus:ring-[#FF5722]"></textarea>
          </div>
        </div>

        <div className="flex-shrink-0 p-6 border-t flex justify-end gap-3 bg-gray-50">
          <button onClick={handleSave} className="flex items-center gap-2 px-6 py-2 bg-[#FF5722] text-white font-semibold rounded-lg hover:bg-[#E64A19]">
            <Save size={16} />
            {team.id ? 'Save Changes' : 'Create Team'}
          </button>
        </div>
      </div>
    </div>
  );
};
// --- END NEW COMPONENT: Team Edit Modal ---


const TeamsTab: React.FC = () => {
  const [positions, setPositions] = useState<JobPosition[]>([]);
  const [applications, setApplications] = useState<any[]>([]);
  const [teams, setTeams] = useState<Team[]>([]); // <--- NEW STATE FOR TEAMS TABLE
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedApplication, setSelectedApplication] = useState<any | null>(null);
  const [isAddingPosition, setIsAddingPosition] = useState(false);
  const [editingPosition, setEditingPosition] = useState<JobPosition | null>(null);
  const [isTeamModalOpen, setIsTeamModalOpen] = useState(false); // <--- NEW STATE FOR TEAM MODAL
  const [editingTeam, setEditingTeam] = useState<Team | null>(null); // <--- NEW STATE FOR TEAM BEING EDITED
  const { addToast } = useToast();
  
  // Initialize newPosition state using the custom type
  const [newPosition, setNewPosition] = useState<PositionFormState>({
    title: '',
    description: '',
    team_name: '',
    team_image_url: '',
    is_open: true,
    requirementsText: ''
  });

  const fetchData = useCallback(async () => {
    setError(null);
    const [positionsResult, applicationsResult, teamsResult] = await Promise.all([ // <--- FETCH TEAMS
      getAllJobPositions(),
      getAllJobApplications(),
      getAllTeams() // <--- FETCH TEAMS
    ]);

    if (positionsResult.error || applicationsResult.error || teamsResult.error) {
      setError("Failed to fetch job data.");
      console.error(positionsResult.error || applicationsResult.error || teamsResult.error);
    } else {
      setPositions(positionsResult.data || []);
      setApplications(applicationsResult.data || []);
      setTeams(teamsResult.data || []); // <--- SET TEAMS
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchData();

    // Use job_positions channel only (teams channel relies on explicit updates)
    const positionsChannel = onJobPositionsChange(() => fetchData()); 
    const applicationsChannel = onJobApplicationsChange(() => fetchData());

    return () => {
      positionsChannel.unsubscribe();
      applicationsChannel.unsubscribe();
    };
  }, [fetchData]);

  const groupedPositions = useMemo(() => {
    const grouped = new Map<string, { team: Team | null; positions: JobPosition[] }>();
    const teamMap = new Map(teams.map(t => [t.name, t])); // Map teams by name for lookup

    positions.forEach(position => {
      const teamName = position.team_name || 'Unassigned';
      const team = teamMap.get(teamName);
      
      if (!grouped.has(teamName)) {
        grouped.set(teamName, { team: team || null, positions: [] });
      }
      grouped.get(teamName)!.positions.push(position);
    });

    return Array.from(grouped.entries())
      .map(([teamName, { team, positions: teamPositions }]) => ({
        teamName,
        team,
        positions: teamPositions,
        openPositions: teamPositions.filter(p => p.is_open).length
      }))
      // Sort by display_order if team exists, otherwise push to end
      .sort((a, b) => (a.team?.display_order || 999) - (b.team?.display_order || 999)); 

  }, [positions, teams]); // <--- DEPENDS ON TEAMS STATE NOW

  const resetFormState = () => setNewPosition({ title: '', description: '', team_name: '', team_image_url: '', is_open: true, requirementsText: '' });
  
  const handleSavePosition = async () => {
    if (!newPosition.title || !newPosition.description || !newPosition.team_name) {
      addToast({ type: 'warning', title: 'Missing Fields', message: 'Please fill in all required fields (Title, Description, Team Name).' });
      return;
    }
    
    const requirementsArray = newPosition.requirementsText 
      ? newPosition.requirementsText.split('\n').map(s => s.trim()).filter(Boolean) 
      : [];

    const payload = {
        title: newPosition.title,
        description: newPosition.description,
        team_name: newPosition.team_name,
        team_image_url: newPosition.team_image_url,
        is_open: newPosition.is_open,
        requirements: requirementsArray
    }
    
    const isUpdating = !!editingPosition;
    const action = isUpdating ? 'Update' : 'Creation';

    try {
      let result;
      if (isUpdating) {
        result = await updateJobPosition(editingPosition.id, payload);
      } else {
        result = await createJobPosition(payload);
      }
      
      if (result.error) throw result.error;

      if (isUpdating && (!result.data || result.data.length === 0)) {
        throw new Error("Job position not found or unable to update.");
      }

      addToast({ type: 'success', title: `${action} Successful`, message: `${newPosition.title} has been saved.` });

      setIsAddingPosition(false);
      setEditingPosition(null);
      resetFormState();
      fetchData(); 
      
    } catch (error) {
      console.error(`Failed to execute ${action} on position:`, error);
      addToast({ type: 'error', title: `${action} Failed`, message: `Failed to save position. Error: ${error.message || 'Unknown'}` });
    }
  };

  const handleEditPosition = (position: JobPosition) => {
    setEditingPosition(position);
    setNewPosition({
      title: position.title,
      description: position.description,
      team_name: position.team_name,
      team_image_url: position.team_image_url,
      is_open: position.is_open,
      requirementsText: position.requirements ? position.requirements.join('\n') : ''
    });
    setIsAddingPosition(true);
  };

  const handleDeletePosition = async (id: string) => {
    if (confirm('Are you sure you want to delete this position?')) {
      await deleteJobPosition(id);
      fetchData();
    }
  };

  const getApplicationsForPosition = (positionId: string) => {
    return applications.filter(app => app.job_position_id === positionId);
  };
  
  // --- NEW HANDLERS FOR TEAM MANAGEMENT ---
  const handleEditTeam = (team: Team) => {
      setEditingTeam(team);
      setIsTeamModalOpen(true);
  }

  const handleSaveTeam = async (teamData: TeamFormState) => {
      const isUpdating = !!teamData.id;
      const action = isUpdating ? 'Update' : 'Create';

      try {
        let result;
        if (isUpdating) {
            result = await updateTeam(teamData.id, teamData);
        } else {
            result = await createTeam(teamData);
        }

        if (result.error) throw result.error;

        addToast({ type: 'success', title: `${action} Successful`, message: `Team ${teamData.name} has been saved.` });
        fetchData(); // Refetch teams and positions
      } catch (error) {
        addToast({ type: 'error', title: `${action} Failed`, message: `Failed to save team. Error: ${error.message || 'Unknown'}` });
        console.error('Team save error:', error);
      }
  }
  // --- END NEW HANDLERS FOR TEAM MANAGEMENT ---


  if (loading) {
    return <div className="flex justify-center py-20"><Loader2 className="w-10 h-10 animate-spin text-gray-400" /></div>;
  }

  if (error) {
    return <div className="text-center py-20 text-red-600">{error}</div>;
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Job Positions & Applications</h2>
          <p className="text-sm text-gray-500 mt-1">Manage career opportunities and review applications</p>
        </div>
        <div className="flex gap-2">
            <button
              onClick={() => { setEditingTeam({name: '', description: '', image_url: ''}); setIsTeamModalOpen(true); }}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors"
            >
              <Plus size={20} />
              Add Team
            </button>
            <button
              onClick={() => { resetFormState(); setIsAddingPosition(true); }}
              className="flex items-center gap-2 px-4 py-2 bg-[#FF5722] text-white rounded-lg hover:bg-[#E64A19] transition-colors"
            >
              <Plus size={20} />
              Add Position
            </button>
        </div>
      </div>

      {/* KPI Cards... (remain the same) */}

      {groupedPositions.map(({ teamName, positions: teamPositions, openPositions, team }) => (
        <Card key={teamName} title={
            <div className="flex items-center gap-3">
                <Users size={20} className="text-gray-500" />
                <span className="font-bold text-gray-900">{teamName} ({openPositions} open positions)</span>
            </div>
        } right={
            <div className="flex items-center gap-2">
                {team && (
                    <button
                        onClick={() => handleEditTeam(team)} // <--- NEW: Edit Team Button
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                        title="Edit Team Details"
                    >
                        <Pencil size={16} />
                    </button>
                )}
                <button
                    onClick={() => { handleCreate(teamName); }}
                    className="flex items-center gap-2 text-sm font-semibold text-gray-600 hover:text-black"
                >
                    <Plus size={16} />
                    Add Position
                </button>
            </div>
        }>
          <div className="space-y-4">
            {team && team.description && (
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-800">
                    Team Description: {team.description}
                </div>
            )}
            {teamPositions.map((position) => {
              const positionApplications = getApplicationsForPosition(position.id);
              return (
                <div
                  key={position.id}
                  className="rounded-lg border bg-gray-50 p-4 hover:bg-white hover:shadow-md transition-all"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-semibold text-gray-900">{position.title}</h4>
                        <span className={`text-xs px-2 py-1 rounded-full ${position.is_open ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                          {position.is_open ? 'Open' : 'Closed'}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mt-1 line-clamp-2">{position.description}</p>
                      <div className="flex items-center gap-4 mt-2">
                        <span className="text-xs text-gray-500">
                          {positionApplications.length} application{positionApplications.length !== 1 ? 's' : ''}
                        </span>
                        <span className="text-xs text-gray-400">
                          Created {new Date(position.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-2 ml-4">
                      <button
                        onClick={() => handleEditPosition(position)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                        title="Edit"
                      >
                        <Pencil size={16} />
                      </button>
                      <button
                        onClick={() => handleDeletePosition(position.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded"
                        title="Delete"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                  {positionApplications.length > 0 && (
                    <div className="mt-4 pt-4 border-t">
                      <p className="text-sm font-medium text-gray-700 mb-2">Recent Applications:</p>
                      {/* ... Recent Applications list ... */}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </Card>
      ))}

      {/* --- Job Position Add/Edit Modal (Unchanged) --- */}
      <AnimatePresence>
        {isAddingPosition && ( /* ... existing modal ... */ )}
      </AnimatePresence>

      {/* --- NEW Team Edit Modal --- */}
      {editingTeam && (
        <TeamEditModal
          isOpen={isTeamModalOpen}
          onClose={() => setIsTeamModalOpen(false)}
          team={editingTeam}
          onSave={handleSaveTeam}
        />
      )}
      {/* ... Application Detail Modal (Unchanged) ... */}
    </div>
  );
};

export default TeamsTab;