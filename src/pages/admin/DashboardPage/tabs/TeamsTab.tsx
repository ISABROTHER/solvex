// @ts-nocheck
import React, { useState, useEffect, useCallback, useMemo } from "react";
import Card from "../components/Card";
import { Loader2, Mail, Phone, X } from "lucide-react";
import { getTeams, getMembers } from "../../../../lib/supabase/operations";
import { supabase } from "../../../../lib/supabase/client";
import type { Database } from "../../../../lib/supabase/database.types";
import { motion, AnimatePresence } from "framer-motion";

type Team = Database['public']['Tables']['teams']['Row'];
type Member = (Database['public']['Tables']['members']['Row'] & {
  teams: { team_name: string } | null;
});

const TeamsTab: React.FC = () => {
  const [teams, setTeams] = useState<Team[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);

  const fetchData = useCallback(async () => {
    // We don't set loading to true here to avoid a full page spinner on real-time updates
    setError(null);
    const [teamsResult, membersResult] = await Promise.all([getTeams(), getMembers()]);

    if (teamsResult.error || membersResult.error) {
      setError("Failed to fetch team data.");
      console.error(teamsResult.error || membersResult.error);
    } else {
      setTeams(teamsResult.data || []);
      setMembers(membersResult.data || []);
    }
    setLoading(false); // Set loading to false only after the initial fetch
  }, []);

  useEffect(() => {
    // Initial data fetch
    fetchData();
    
    // Set up real-time subscription for any changes in the members table
    const channel = supabase.channel('public:members')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'members' },
        (payload) => {
          console.log('Change received on members table!', payload);
          // When a change occurs, refetch all data to keep the list consistent
          fetchData();
        }
      )
      .subscribe();

    // Cleanup function to remove the subscription when the component unmounts
    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchData]);

  const groupedMembers = useMemo(() => {
    const memberMap = new Map<string | null, Member[]>();
    
    // Group members by their team_id
    members.forEach(member => {
      const teamId = member.team_id;
      if (!memberMap.has(teamId)) {
        memberMap.set(teamId, []);
      }
      memberMap.get(teamId)!.push(member);
    });

    // Create the final structure, mapping team IDs to team names
    const grouped = teams.map(team => ({
        ...team,
        members: memberMap.get(team.id) || []
    })).filter(team => team.members.length > 0); // Only show teams with members

    // Add an "Unassigned" group if there are members with no team
    if (memberMap.has(null) && memberMap.get(null)!.length > 0) {
        grouped.push({
            id: 'unassigned',
            name: 'Unassigned',
            team_name: 'Unassigned',
            description: null,
            updated_at: new Date().toISOString(),
            members: memberMap.get(null)!,
            // Add dummy fields to match Team type for consistency
            created_at: new Date().toISOString(),
            code: 'N/A',
            lead_member_id: null,
            email_alias: null,
            is_active: true,
        });
    }

    return grouped;
  }, [teams, members]);

  if (loading) {
    return <div className="flex justify-center py-20"><Loader2 className="w-10 h-10 animate-spin text-gray-400" /></div>;
  }

  if (error) {
    return <div className="text-center py-20 text-red-600">{error}</div>;
  }

  return (
    <div className="space-y-8">
      {groupedMembers.map(({ team_name, members: teamMembers }) => (
        <Card key={team_name} title={`${team_name} (${teamMembers.length})`}>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {teamMembers.map((member) => (
              <div
                key={member.id}
                onClick={() => setSelectedMember(member)}
                className="group cursor-pointer rounded-lg border bg-gray-50 p-4 transition-all hover:bg-white hover:shadow-md hover:-translate-y-1"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gray-200 flex-shrink-0 flex items-center justify-center font-bold text-gray-600">
                    {member.full_name.charAt(0)}
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
                    {selectedMember.full_name.charAt(0)}
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
                  <p><strong>Team:</strong> {selectedMember.teams?.team_name || 'Unassigned'}</p>
                  <p><strong>Date Joined:</strong> {new Date(selectedMember.created_at!).toLocaleDateString()}</p>
                </div>
              </div>
              <div className="flex-shrink-0 p-6 border-t mt-auto flex gap-3 bg-gray-50">
                <a href={`mailto:${selectedMember.email}`} className="flex-1 text-center rounded-lg bg-blue-600 text-white px-4 py-2 font-semibold hover:bg-blue-700 transition-colors">Email Member</a>
                {selectedMember.phone && <a href={`tel:${selectedMember.phone}`} className="flex-1 text-center rounded-lg border bg-white px-4 py-2 font-semibold hover:bg-gray-100 transition-colors">Call Member</a>}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default TeamsTab;