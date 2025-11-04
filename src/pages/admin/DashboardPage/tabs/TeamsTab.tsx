// src/pages/admin/DashboardPage/tabs/TeamsTab.tsx
// @ts-nocheck
import React, { useState, useEffect, useCallback, useMemo } from "react";
import Card from "../components/Card";
import { Loader2, Mail, Phone, X, PlusCircle, Edit2, Trash2, Save, AlertCircle, Image, ListOrdered } from 'lucide-react'; 
import { getAllTeams, getMembers, createTeam, updateTeam, deleteTeam } from "../../../../lib/supabase/operations";
import { supabase } from "../../../../lib/supabase/client";
import type { Database } from "../../../../lib/supabase/database.types"; 
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "../../../../contexts/ToastContext";

// Define strict types for the component to improve safety
type Team = Database['public']['Tables']['teams']['Row'];
type MemberRow = Database['public']['Tables']['members']['Row'];
type Member = (MemberRow & {
  teams: { name: string } | null;
});

// ----------------------------------------------------
// --- START: Team Edit Modal (CRUD) ---
// ----------------------------------------------------
const TeamEditModal = ({ isOpen, onClose, team, onSave }) => {
  const [formData, setFormData] = useState({
    name: team?.name || '',
    description: team?.description || '',
    image_url: team?.image_url || '',
    display_order: team?.display_order || 0,
    id: team?.id,
  });
  const [error, setError] = useState('');

  useEffect(() => {
    // Reset form when team changes
    setFormData({
      name: team?.name || '',
      description: team?.description || '',
      image_url: team?.image_url || '',
      display_order: team?.display_order || 0,
      id: team?.id,
    });
    setError('');
  }, [team]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ 
      ...prev, 
      [name]: type === 'checkbox' ? checked : (name === 'display_order' ? parseInt(value) || 0 : value) 
    }));
    setError('');
  };

  const handleSave = () => {
    if (!formData.name.trim()) {
        setError('Team name is required.');
        return;
    }
    onSave(formData);
    onClose();
  };

  if (!isOpen || !team) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <motion.div className="absolute inset-0 bg-black/50" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} />
      <motion.div 
         initial={{ scale: 0.9, opacity: 0 }}
         animate={{ scale: 1, opacity: 1 }}
         exit={{ scale: 0.9, opacity: 0 }}
         className="relative w-full max-w-xl bg-white rounded-2xl shadow-2xl max-h-[90vh] overflow-hidden flex flex-col"
      >
        <div className="flex-shrink-0 p-6 flex justify-between items-center border-b">
          <h3 className="text-xl font-bold text-gray-900">{team.id ? `Edit Team: ${team.name}` : 'Create New Team'}</h3>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-200"><X size={20} /></button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          <form onSubmit={(e) => { e.preventDefault(); handleSave(); }} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Team Name*</label>
              <input type="text" name="name" value={formData.name} onChange={handleChange} className="w-full px-3 py-2 border rounded-lg bg-gray-50 focus:ring-[#FF5722]" required/>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1"><Image size={14} className="w-4 h-4 inline mr-1" /> Image URL</label>
              <input type="url" name="image_url" value={formData.image_url} onChange={handleChange} className="w-full px-3 py-2 border rounded-lg bg-gray-50 focus:ring-[#FF5722]" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1"><ListOrdered size={14} className="w-4 h-4 inline mr-1" /> Display Order</label>
              <input type="number" name="display_order" value={formData.display_order} onChange={handleChange} className="w-full px-3 py-2 border rounded-lg bg-gray-50 focus:ring-[#FF5722]" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea name="description" value={formData.description} onChange={handleChange} rows={3} className="w-full px-3 py-2 border rounded-lg bg-gray-50 focus:ring-[#FF5722]"></textarea>
            </div>
            {error && (
              <div className="p-3 bg-red-100 border border-red-300 text-red-700 rounded-lg flex items-center gap-2 text-sm">
                <AlertCircle size={16} /> {error}
              </div>
            )}
          </form>
        </div>

        <div className="flex-shrink-0 p-6 border-t flex justify-end gap-3 bg-gray-50">
          <button onClick={onClose} className="px-6 py-2 text-sm font-semibold text-gray-700 rounded-lg hover:bg-gray-100">
            Cancel
          </button>
          <button onClick={handleSave} className="flex items-center gap-2 px-6 py-2 bg-[#FF5722] text-white font-semibold rounded-lg hover:bg-[#E64A19]">
            <Save size={16} />
            {team.id ? 'Save Changes' : 'Create Team'}
          </button>
        </div>
      </motion.div>
    </div>
  );
};
// ----------------------------------------------------
// --- END: Team Edit Modal ---
// ----------------------------------------------------


const TeamsTab: React.FC = () => {
  const [teams, setTeams] = useState<Team[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [isTeamModalOpen, setIsTeamModalOpen] = useState(false); 
  const [editingTeam, setEditingTeam] = useState<Team | null>(null); 
  const { addToast } = useToast();

  // Unified fetch function for Teams and Members
  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    const [teamsResult, membersResult] = await Promise.allSettled([getAllTeams(), getMembers()]);

    if (teamsResult.status === 'rejected' || teamsResult.value.error) {
        setError("Failed to fetch teams. Check RLS on 'teams' table.");
        setTeams([]);
    } else {
        setTeams(teamsResult.value.data || []);
    }
    
    if (membersResult.status === 'rejected' || membersResult.value.error) {
        if (teamsResult.status === 'fulfilled' && teamsResult.value.data) {
             setError("Failed to fetch some members. Check RLS on 'members' table.");
        }
        setMembers([]);
    } else {
        setMembers(membersResult.value.data || []);
    }

    setLoading(false);
  }, []);

  useEffect(() => {
    fetchData();
    
    // Realtime subscriptions
    const memberChannel = supabase.channel('public:members')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'members' }, () => fetchData())
      .subscribe();
      
    const teamsChannel = supabase.channel('public:teams')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'teams' }, () => fetchData())
      .subscribe();

    return () => {
      supabase.removeChannel(memberChannel);
      supabase.removeChannel(teamsChannel);
    };
  }, [fetchData]);

  const groupedMembers = useMemo(() => {
    const memberMap = new Map<string | null, Member[]>();
    
    members.forEach(member => {
      const teamId = member.team_id;
      if (!memberMap.has(teamId)) {
        memberMap.set(teamId, []);
      }
      const teamName = (member.teams && member.teams.name) ? member.teams.name : 'Unassigned';
      
      memberMap.get(teamId)!.push({ ...member, teams: { name: teamName } });
    });

    const grouped = teams.map(team => ({
        ...team,
        members: memberMap.get(team.id) || []
    }));

    if (memberMap.has(null) && memberMap.get(null)?.length > 0) {
        // Create a mock team object for unassigned members
        const unassignedMembers = memberMap.get(null);
        grouped.push({
            id: 'unassigned',
            name: 'Unassigned',
            description: 'Members not yet assigned to a functional team.',
            members: unassignedMembers,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            team_name: 'Unassigned',
            display_order: 9999,
        });
    }

    // Sort by display order, falling back to name. Filter out teams with no members unless they are explicitly created (not shown here)
    return grouped
      .filter(team => team.members?.length > 0 || team.id !== 'unassigned') // Only show unassigned if members exist
      .sort((a, b) => (a.display_order || 9999) - (b.display_order || 9999));
  }, [teams, members]);


  const handleSaveTeam = async (teamData: Team) => {
      const isUpdating = !!teamData.id && teamData.id !== 'unassigned';
      const action = isUpdating ? 'Update' : 'Create';

      try {
        let result;
        if (isUpdating) {
            const { members, ...updatePayload } = teamData;
            result = await updateTeam(teamData.id, updatePayload);
        } else {
            const { id, members, ...insertPayload } = teamData;
            result = await createTeam(insertPayload);
        }

        if (result.error) throw result.error;
        addToast({ type: 'success', title: `Team ${action} Successful`, message: `Team "${teamData.name}" has been saved.` });
      } catch (error) {
        addToast({ type: 'error', title: `${action} Failed`, message: `Failed to save team. Error: ${error.message || 'Unknown'}` });
      }
  }

  const handleDeleteTeam = async (team: Team) => {
      if (!window.confirm(`WARNING: This will soft-delete the team "${team.name}" and set the 'team_id' of all ${team.members.length} associated job postings to 'null' (Uncategorized). Are you sure?`)) return;
      
      try {
        const { error } = await deleteTeam(team.id);

        if (error) throw error;
        
        addToast({ type: 'success', title: 'Team Deleted', message: `Team "${team.name}" soft-deleted and jobs moved to Uncategorized.` });
      } catch (error) {
         addToast({ type: 'error', title: 'Deletion Failed', message: `Failed to delete team. Error: ${error.message || 'Unknown'}` });
      }
  }


  if (loading) {
    return <div className="flex justify-center py-20"><Loader2 className="w-10 h-10 animate-spin text-gray-400" /></div>;
  }

  return (
    <div className="space-y-8">
      {error && (
        <Card>
          <div className="text-center py-5 text-red-600 flex flex-col items-center gap-3">
             <AlertCircle className="w-6 h-6" />
             <p className="font-semibold">{error}</p>
             <p className="text-sm text-gray-600">Ensure the **Teams and Members tables** were created and RLS policies grant **SELECT** access to the authenticated user.</p>
             <p className="text-xs text-blue-500">Run **"Sync Now"** in Settings to attempt auto-fixing permissions.</p>
          </div>
        </Card>
      )}

      <div className="flex justify-end">
        <button
          onClick={() => { setEditingTeam({}); setIsTeamModalOpen(true); }}
          className="flex items-center gap-2 px-4 py-2 bg-[#FF5722] text-white rounded-lg text-sm font-semibold hover:bg-[#E64A19] transition-colors"
        >
          <PlusCircle size={16} />
          Add New Team
        </button>
      </div>

      {groupedMembers.length === 0 && !error && (
        <Card>
          <p className="text-center text-gray-500 py-8">No members are currently assigned to any team.</p>
          <p className="text-center text-sm text-gray-600 mt-2">Go to the **Settings Tab** and click **"Sync Now"** to load initial member data.</p>
        </Card>
      )}
      
      {groupedMembers.map((team) => (
        <Card key={team.id} title={`${team.name} (${team.members?.length || 0})`} right={
            <div className="flex items-center gap-2">
                <button
                    onClick={() => {
                        const teamData = teams.find(t => t.id === team.id) || { id: team.id, name: team.name, description: team.description };
                        setEditingTeam(teamData); 
                        setIsTeamModalOpen(true);
                    }}
                    disabled={team.id === 'unassigned'}
                    className="p-2 text-gray-500 hover:bg-gray-100 rounded-md transition-colors disabled:opacity-50"
                    title={team.id === 'unassigned' ? 'Cannot edit unassigned group' : 'Edit Team'}
                >
                    <Edit2 size={16} />
                </button>
                <button
                    onClick={() => handleDeleteTeam(team)}
                    disabled={team.id === 'unassigned'}
                    className="p-2 text-red-500 hover:bg-red-100 rounded-md transition-colors disabled:opacity-50"
                    title={team.id === 'unassigned' ? 'Cannot delete unassigned group' : 'Delete Team'}
                >
                    <Trash2 size={16} />
                </button>
            </div>
        }>
          {team.description && <p className="text-sm text-gray-600 mb-4">{team.description}</p>}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {team.members?.map((member) => (
              <div
                key={member.id}
                onClick={() => setSelectedMember(member)}
                className="group cursor-pointer rounded-lg border bg-gray-50 p-4 transition-all hover:bg-white hover:shadow-md hover:-translate-y-1"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gray-200 flex-shrink-0 flex items-center justify-center font-bold text-gray-600">
                    {member.full_name?.charAt(0) || 'N'}
                  </div>
                  <div className="overflow-hidden">
                    <p className="font-semibold text-gray-800 truncate">{member.full_name || 'Unknown'}</p>
                    <p className="text-xs text-gray-500 truncate">{member.role_title || 'N/A'}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      ))}

      {/* Member Detail Modal (Slide-over panel) */}
      <AnimatePresence>
        {selectedMember && (
          <div className="fixed inset-0 z-50">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/40" onClick={() => setSelectedMember(null)} />
            <motion.div
              initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="absolute right-0 top-0 h-full w-full max-w-lg bg-white shadow-xl flex flex-col"
            >
              <div className="flex-shrink-0 p-6 flex items-center justify-between border-b">
                <h3 className="text-xl font-semibold">Member Details</h3>
                <button className="p-2 rounded-full hover:bg-gray-100" onClick={() => setSelectedMember(null)}><X size={20} /></button>
              </div>
              <div className="p-6 overflow-auto space-y-6 text-sm">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center font-bold text-2xl text-gray-600">
                    {selectedMember.full_name?.charAt(0) || 'N'}
                  </div>
                  <div>
                    <div className="font-bold text-lg">{selectedMember.full_name || 'Unknown Member'}</div>
                    <div className="text-gray-500">{selectedMember.role_title || 'N/A'}</div>
                    <div className={`mt-1 text-xs font-semibold px-2 py-0.5 rounded-full inline-block ${selectedMember.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>{selectedMember.status || 'N/A'}</div>
                  </div>
                </div>
                <div className="border-t pt-6 space-y-4">
                  <h4 className="font-semibold text-gray-800">Contact Information</h4>
                  <div className="flex items-center gap-3">
                    <Mail size={16} className="text-gray-400" />
                    <a href={`mailto:${selectedMember.email}`} className="text-blue-600 hover:underline">{selectedMember.email}</a>
                  </div>
                  {selectedMember.phone && <div className="flex items-center gap-3">
                    <Phone size={16} className="text-gray-400" />
                    <a href={`tel:${selectedMember.phone}`} className="text-blue-600 hover:underline">{selectedMember.phone}</a>
                  </div>}
                </div>
                 <div className="border-t pt-6 space-y-2">
                  <h4 className="font-semibold text-gray-800">Details</h4>
                  <p><strong>Team:</strong> {selectedMember.teams?.name || 'Unassigned'}</p>
                  <p><strong>Date Joined:</strong> {new Date(selectedMember.created_at).toLocaleDateString()}</p>
                </div>
              </div>
              <div className="flex-shrink-0 p-6 border-t mt-auto flex gap-3 bg-gray-50">
                <a href={`mailto:${selectedMember.email}`} className="flex-1 text-center rounded-lg bg-[#FF5722] text-white px-4 py-2 font-semibold hover:bg-[#E64A19] transition-colors">Email Member</a>
                <button onClick={() => alert('Implement Member Update/Offboard')} className="flex-1 text-center rounded-lg border bg-white px-4 py-2 font-semibold hover:bg-gray-100 transition-colors">Update Status</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Team Edit/Create Modal */}
      {editingTeam && (
        <TeamEditModal
          isOpen={isTeamModalOpen}
          onClose={() => setIsTeamModalOpen(false)}
          team={editingTeam}
          onSave={handleSaveTeam}
        />
      )}
    </div>
  );
};

export default TeamsTab;
