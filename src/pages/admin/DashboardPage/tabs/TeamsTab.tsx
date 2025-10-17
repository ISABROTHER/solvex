// @ts-nocheck
import React, { useState, useEffect, useCallback, useMemo } from "react";
import Card from "../components/Card";
import { Loader2, Mail, Phone, X, PlusCircle, Edit2, Trash2, Send, Database } from "lucide-react";
import { getTeams, getMembers, createTeam, updateTeam } from "../../../../lib/supabase/operations"; // Import CRUD functions
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
// --- START NEW COMPONENT: Team Edit Modal (CRUD) ---
// ----------------------------------------------------
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
    if (!formData.name) return alert('Team name is required.');
    onSave(formData);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
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
            <label className="block text-sm font-medium text-gray-700 mb-1"><Image size={14} className="w-4 h-4 inline mr-1" /> Image URL</label>
            <input type="url" name="image_url" value={formData.image_url || ''} onChange={handleChange} className="w-full px-3 py-2 border rounded-lg bg-gray-50 focus:ring-[#FF5722]" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1"><ListOrdered size={14} className="w-4 h-4 inline mr-1" /> Display Order</label>
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
// ----------------------------------------------------
// --- END NEW COMPONENT: Team Edit Modal ---
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
    
    // Call the updated operations.ts functions
    const [teamsResult, membersResult] = await Promise.all([getTeams(), getMembers()]);

    // Supabase returns { data, error, ... }
    if (teamsResult.error || membersResult.error) {
      setError("Failed to fetch team data. Check RLS policies on 'teams' and 'members' tables.");
      console.error("Team Fetch Error:", teamsResult.error || membersResult.error);
      setTeams([]);
      setMembers([]);
    } else {
      setTeams(teamsResult.data || []);
      setMembers(membersResult.data || []);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    // Initial data fetch
    fetchData();
    
    // RLS check requires all roles to have SELECT access on their respective tables.
    // Assuming the SQL to create teams and members and RLS policies has been run.
    const channel = supabase.channel('public:members')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'members' },
        () => fetchData()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchData]);

  const groupedMembers = useMemo(() => {
    const memberMap = new Map<string | null, Member[]>();
    
    members.forEach(member => {
      const teamId = member.team_id;
      if (!memberMap.has(teamId)) {
        memberMap.set(teamId, []);
      }
      // Ensure the member object includes the team name from the join
      const teamName = member.teams ? member.teams.name : 'Unassigned';
      memberMap.get(teamId)!.push({ ...member, teams: { name: teamName } });
    });

    const grouped = teams.map(team => ({
        ...team,
        members: memberMap.get(team.id) || []
    })).filter(team => team.members.length > 0); 

    // Add an "Unassigned" group if there are members with no team
    if (memberMap.has(null) && memberMap.get(null).length > 0) {
        grouped.push({
            id: 'unassigned',
            name: 'Unassigned',
            description: 'Members not yet assigned to a functional team.',
            members: memberMap.get(null),
            // Default required fields
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
        });
    }

    // Sort teams by name for consistency
    return grouped.sort((a, b) => a.name.localeCompare(b.name));
  }, [teams, members]);


  const handleSaveTeam = async (teamData: Team) => {
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
        addToast({ type: 'success', title: `Team ${action} Successful`, message: `Team "${teamData.name}" has been saved.` });
        fetchData(); 
      } catch (error) {
        addToast({ type: 'error', title: `${action} Failed`, message: `Failed to save team. Error: ${error.message || 'Unknown'}` });
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
          onClick={() => { setEditingTeam({ name: '', description: '' }); setIsTeamModalOpen(true); }}
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
      
      {groupedMembers.map(({ name, members: teamMembers, id: teamId, description }) => (
        <Card key={teamId} title={`${name} (${teamMembers.length})`} right={
            <div className="flex items-center gap-2">
                <button
                    onClick={() => {
                        const team = teams.find(t => t.id === teamId) || { id: 'new', name, description };
                        setEditingTeam(team); 
                        setIsTeamModalOpen(true);
                    }}
                    className="p-2 text-gray-500 hover:bg-gray-100 rounded-md transition-colors"
                    title="Edit Team"
                >
                    <Edit2 size={16} />
                </button>
                <button
                    onClick={() => alert('Add New Member form would open here.')}
                    className="flex items-center gap-2 text-sm font-semibold text-gray-600 hover:text-black"
                    title="Add Member to Team"
                >
                    <PlusCircle size={16} />
                    Member
                </button>
            </div>
        }>
          {description && <p className="text-sm text-gray-600 mb-4">{description}</p>}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {teamMembers.map((member) => (
              <div
                key={member.id}
                onClick={() => setSelectedMember(member)}
                className="group cursor-pointer rounded-lg border bg-gray-50 p-4 transition-all hover:bg-white hover:shadow-md hover:-translate-y-1"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gray-200 flex-shrink-0 flex items-center justify-center font-bold text-gray-600">
                    {member.full_name?.charAt(0)}
                  </div>
                  <div className="overflow-hidden">
                    <p className="font-semibold text-gray-800 truncate">{member.full_name}</p>
                    <p className="text-xs text-gray-500 truncate">{member.role_title}</p>
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
                    {selectedMember.full_name?.charAt(0)}
                  </div>
                  <div>
                    <div className="font-bold text-lg">{selectedMember.full_name}</div>
                    <div className="text-gray-500">{selectedMember.role_title}</div>
                    <div className={`mt-1 text-xs font-semibold px-2 py-0.5 rounded-full inline-block ${selectedMember.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>{selectedMember.status}</div>
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
                <a href={`mailto:${selectedMember.email}`} className="flex-1 text-center rounded-lg bg-blue-600 text-white px-4 py-2 font-semibold hover:bg-blue-700 transition-colors">Email Member</a>
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