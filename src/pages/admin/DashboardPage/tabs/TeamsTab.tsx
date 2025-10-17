// @ts-nocheck
import React, { useState, useEffect, useCallback, useMemo } from "react";
import Card from "../components/Card";
import { Loader2, Mail, Phone, X, PlusCircle, Edit2, Trash2, Save, AlertCircle, Image, ListOrdered } from 'lucide-react'; // Added Save, Image, ListOrdered
import { getTeams, getMembers, createTeam, updateTeam } from "../../../../lib/supabase/operations"; // Import CRUD functions
import { supabase } from "../../../../lib/supabase/client";
import type { Database } from "../../../../lib/supabase/database.types"; // Single, required import for Database type
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
  // Fix: Ensure all fields used in the form are initialized in state
  const [formData, setFormData] = useState({
    name: team.name || '',
    description: team.description || '',
    image_url: team.image_url || '',
    display_order: team.display_order || 0, // Assuming this exists or falls back to 0
    id: team.id,
  });

  useEffect(() => {
    setFormData({
      name: team.name || '',
      description: team.description || '',
      image_url: team.image_url || '',
      display_order: team.display_order || 0,
      id: team.id,
    });
  }, [team]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ 
      ...prev, 
      [name]: type === 'checkbox' ? checked : (name === 'display_order' ? parseInt(value) || 0 : value) 
    }));
  };

  const handleSave = () => {
    if (!formData.name.trim()) return alert('Team name is required.');
    onSave(formData);
    onClose();
  };

  if (!isOpen) return null;

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
        </div>

        <div className="flex-shrink-0 p-6 border-t flex justify-end gap-3 bg-gray-50">
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
    
    const [teamsResult, membersResult] = await Promise.all([getTeams(), getMembers()]);

    if (teamsResult.error) {
        setError("Failed to fetch teams. Check RLS policies on 'teams' table.");
        console.error("Team Fetch Error:", teamsResult.error);
        setTeams([]);
    } else {
        setTeams(teamsResult.data || []);
    }
    
    if (membersResult.error) {
        // Only set error if teams load but members fail
        if (!teamsResult.data) {
             setError("Failed to fetch all team data. Check RLS policies on 'members' table.");
        }
        console.error("Member Fetch Error:", membersResult.error);
        setMembers([]);
    } else {
        setMembers(membersResult.data || []);
    }

    setLoading(false);
  }, []);

  useEffect(() => {
    fetchData();
    
    const channel = supabase.channel('public:members')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'members' },
        () => fetchData()
      )
      .subscribe();
      
    // Set up subscription for teams table as well for real-time team CRUD updates
    const teamsChannel = supabase.channel('public:teams')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'teams' },
        () => fetchData()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
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
      // Extract the team name from the joined object or default to 'Unassigned'
      const teamName = (member.teams && member.teams.name) ? member.teams.name : 'Unassigned';
      
      // We must cast the joined result to the expected Member type, providing a consistent structure
      memberMap.get(teamId)!.push({ ...member, teams: { name: teamName } });
    });

    const grouped = teams.map(team => ({
        ...team,
        members: memberMap.get(team.id) || []
    })).filter(team => team.members.length > 0); 

    // Handle members without a team_id (teamId is null)
    if (memberMap.has(null) && memberMap.get(null).length > 0) {
        // Create a synthetic 'Unassigned' team object
        grouped.push({
            id: 'unassigned',
            name: 'Unassigned',
            description: 'Members not yet assigned to a functional team.',
            members: memberMap.get(null),
            // Default required fields (casting is necessary here as this object didn't come from DB)
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            // Add other fields from DB schema as null/default if necessary
            team_name: 'Unassigned',
            code: null,
            lead_member_id: null,
            email_alias: null,
            is_active: true,
        });
    }

    // Sort teams by name
    return grouped.sort((a, b) => a.name.localeCompare(b.name));
  }, [teams, members]);


  const handleSaveTeam = async (teamData: Team) => {
      const isUpdating = !!teamData.id && teamData.id !== 'unassigned';
      const action = isUpdating ? 'Update' : 'Create';

      try {
        let result;
        if (isUpdating) {
            result = await updateTeam(teamData.id, teamData);
        } else {
            // Remove the temporary ID for insertion
            const { id, ...insertData } = teamData;
            result = await createTeam(insertData);
        }

        if (result.error) throw result.error;
        addToast({ type: 'success', title: `Team ${action} Successful`, message: `Team "${teamData.name}" has been saved.` });
        fetchData(); // R