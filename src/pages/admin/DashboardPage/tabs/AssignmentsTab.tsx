// @ts-nocheck
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from '../../../../lib/supabase/client';
import type { Database } from '../../../../lib/supabase/database.types';
import { useAuth } from '../../../../features/auth/AuthProvider';
import Card from '../components/Card';
import { 
  Loader2, 
  User, 
  Search, 
  AlertCircle,
  Briefcase,
  Plus,
  Send,
  X,
  Users,
  MessageSquare,
  ChevronRight,
  Calendar,
  FileText,
  UserPlus
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import AdminAssignmentChat from '../components/AssignmentChat'; // We will create this next

// --- PLANNED TYPES ---
// These types match the new tables we will create in Supabase
type Profile = Database['public']['Tables']['profiles']['Row'];

type Assignment = {
  id: number;
  created_at: string;
  title: string;
  instructions: string;
  created_by: string; // uuid of admin
  status: 'pending' | 'in_progress' | 'completed';
  due_date: string | null;
  // Fetched via join
  members: Profile[];
};

type AssignmentMessage = {
  id: number;
  created_at: string;
  assignment_id: number;
  sender_id: string; // uuid of sender
  content: string;
  // Fetched via join
  sender_profile: {
    first_name: string | null;
    last_name: string | null;
    avatar_url: string | null;
  };
};

// --- MOCK DATA (to build the UI before backend is ready) ---
const MOCK_PROFILES: Profile[] = [
  { id: '1a', role: 'employee', first_name: 'John', last_name: 'Doe', email: 'john@test.com', avatar_url: null, ... },
  { id: '2b', role: 'employee', first_name: 'Jane', last_name: 'Smith', email: 'jane@test.com', avatar_url: null, ... },
  { id: '3c', role: 'employee', first_name: 'Mike', last_name: 'Brown', email: 'mike@test.com', avatar_url: null, ... },
];

const MOCK_ASSIGNMENTS: Assignment[] = [
  { 
    id: 1, created_at: new Date().toISOString(), title: 'Q4 Marketing Campaign', instructions: 'Plan and execute the Q4 marketing campaign. Focus on social media.', 
    created_by: 'admin_id', status: 'in_progress', due_date: null, members: [MOCK_PROFILES[0], MOCK_PROFILES[1]] 
  },
  { 
    id: 2, created_at: new Date().toISOString(), title: 'Website Redesign Mockups', instructions: 'Create Figma mockups for the new homepage.', 
    created_by: 'admin_id', status: 'pending', due_date: null, members: [MOCK_PROFILES[2]]
  },
];
// --- END MOCK DATA ---


const AssignmentsTab: React.FC = () => {
  const { user } = useAuth();
  const [allEmployees, setAllEmployees] = useState<Profile[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);

  // Form State
  const [newTitle, setNewTitle] = useState('');
  const [newInstructions, setNewInstructions] = useState('');
  const [newMembers, setNewMembers] = useState<string[]>([]); // Array of employee UUIDs
  
  const [isSubmitting, setIsSubmitting] = useState(false);

  // --- MOCK DATA FETCHER ---
  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // In reality, you would fetch from 'profiles' and 'assignments'
      // const { data: employeesData, error: employeesError } = await supabase.from('profiles').select('*').eq('role', 'employee');
      // if (employeesError) throw employeesError;
      setAllEmployees(MOCK_PROFILES);

      // const { data: assignmentsData, error: assignmentsError } = await supabase.rpc('fetch_assignments_with_members');
      // if (assignmentsError) throw assignmentsError;
      setAssignments(MOCK_ASSIGNMENTS);

    } catch (err: any) {
      console.error('Error fetching data:', err);
      setError('Failed to load data.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleCreateAssignment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle || !newInstructions || newMembers.length === 0 || !user) return;

    setIsSubmitting(true);
    setError(null);
    try {
      // --- This is how you'll handle it with Supabase ---
      // 1. Insert into 'assignments'
      // const { data: newAssignment, error: assignmentError } = await supabase
      //   .from('assignments')
      //   .insert({
      //     title: newTitle,
      //     instructions: newInstructions,
      //     created_by: user.id,
      //     status: 'pending'
      //   })
      //   .select()
      //   .single();
      // if (assignmentError) throw assignmentError;

      // 2. Map members for the join table
      // const membersToInsert = newMembers.map(employee_id => ({
      //   assignment_id: newAssignment.id,
      //   employee_id: employee_id
      // }));

      // 3. Insert into 'assignment_members'
      // const { error: membersError } = await supabase
      //   .from('assignment_members')
      //   .insert(membersToInsert);
      // if (membersError) throw membersError;

      // --- Mocking the result for now ---
      const newId = Math.floor(Math.random() * 10000);
      const members = allEmployees.filter(e => newMembers.includes(e.id));
      const mockNewAssignment: Assignment = {
        id: newId,
        created_at: new Date().toISOString(),
        title: newTitle,
        instructions: newInstructions,
        created_by: user!.id,
        status: 'pending',
        due_date: null,
        members: members,
      };

      setAssignments(prev => [mockNewAssignment, ...prev]);
      setShowCreateForm(false);
      setNewTitle('');
      setNewInstructions('');
      setNewMembers([]);

    } catch (err: any) {
      console.error('Error creating assignment:', err);
      setError(`Failed to create assignment: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSelectMember = (id: string) => {
    setNewMembers(prev => 
      prev.includes(id) ? prev.filter(mId => mId !== id) : [...prev, id]
    );
  };

  if (loading) {
    return <div className="flex justify-center py-20"><Loader2 className="w-10 h-10 animate-spin text-gray-400" /></div>;
  }
  
  if (error) {
    return <div className="text-center py-20 text-red-600 flex flex-col items-center gap-3"><AlertCircle className="w-6 h-6" />{error}</div>;
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
      {/* --- Column 1: Assignment List --- */}
      <Card className="lg:col-span-1 flex flex-col" title="Assignments">
        <button
          onClick={() => {
            setShowCreateForm(true);
            setSelectedAssignment(null);
          }}
          className="w-full mb-4 flex items-center justify-center gap-2 px-4 py-2.5 bg-[#FF5722] text-white text-sm font-semibold rounded-lg hover:bg-[#E64A19] transition-colors"
        >
          <Plus size={18} />
          Create New Assignment
        </button>
        <div className="flex-1 overflow-y-auto -mr-6 -ml-6 pr-3 pl-6">
          <div className="space-y-2">
            {assignments.map(assignment => (
              <button
                key={assignment.id}
                onClick={() => {
                  setSelectedAssignment(assignment);
                  setShowCreateForm(false);
                }}
                className={`w-full p-3 rounded-lg text-left transition-colors ${
                  selectedAssignment?.id === assignment.id ? 'bg-[#FF5722]/10' : 'hover:bg-gray-50'
                }`}
              >
                <div className="flex justify-between items-center">
                  <p className="font-semibold text-gray-900 truncate">{assignment.title}</p>
                  <span className={`px-2 py-0.5 text-xs font-semibold capitalize rounded-full ${
                    assignment.status === 'completed' ? 'bg-green-100 text-green-700' : 
                    assignment.status === 'in_progress' ? 'bg-blue-100 text-blue-700' : 'bg-yellow-100 text-yellow-700'
                  }`}>
                    {assignment.status}
                  </span>
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <Users size={14} className="text-gray-400" />
                  <div className="flex -space-x-2">
                    {assignment.members.slice(0, 3).map(m => (
                      <img key={m.id} src={m.avatar_url || `https://ui-avatars.com/api/?name=${m.first_name}+${m.last_name}&background=random`} alt="member" className="w-5 h-5 rounded-full border-2 border-white" />
                    ))}
                    {assignment.members.length > 3 && (
                      <span className="w-5 h-5 rounded-full border-2 border-white bg-gray-200 text-gray-600 text-[10px] flex items-center justify-center">
                        +{assignment.members.length - 3}
                      </span>
                    )}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </Card>

      {/* --- Column 2: Details / Create Form --- */}
      <div className="lg:col-span-2 space-y-6">
        <AnimatePresence mode="wait">
          {showCreateForm ? (
            <motion.div
              key="create-form"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <Card title="Create New Assignment">
                <form onSubmit={handleCreateAssignment} className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700">Title</label>
                    <input
                      type="text"
                      value={newTitle}
                      onChange={(e) => setNewTitle(e.target.value)}
                      placeholder="e.g., 'Q1 Social Media Strategy'"
                      className="mt-1 w-full px-3 py-2 rounded-lg border border-gray-300"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Instructions</label>
                    <textarea
                      value={newInstructions}
                      onChange={(e) => setNewInstructions(e.target.value)}
                      placeholder="Give clear instructions, goals, and deadlines..."
                      rows={5}
                      className="mt-1 w-full px-3 py-2 rounded-lg border border-gray-300"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Assign To</label>
                    <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 p-2 border border-gray-300 rounded-lg max-h-48 overflow-y-auto">
                      {allEmployees.map(emp => (
                        <button
                          type="button"
                          key={emp.id}
                          onClick={() => handleSelectMember(emp.id)}
                          className={`flex items-center gap-2 p-2 rounded-md text-left transition-colors ${
                            newMembers.includes(emp.id) ? 'bg-[#FF5722]/20' : 'hover:bg-gray-100'
                          }`}
                        >
                          <input
                            type="checkbox"
                            readOnly
                            checked={newMembers.includes(emp.id)}
                            className="pointer-events-none rounded text-[#FF5722] focus:ring-[#FF5722]"
                          />
                          <span className="text-sm font-medium">{emp.first_name} {emp.last_name}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="flex justify-end gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setShowCreateForm(false)}
                      className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting || newMembers.length === 0}
                      className="inline-flex items-center justify-center gap-2 px-6 py-2 bg-[#FF5722] text-white font-semibold rounded-lg hover:bg-[#E64A19] disabled:opacity-50"
                    >
                      {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                      {isSubmitting ? 'Creating...' : 'Create Assignment'}
                    </button>
                  </div>
                </form>
              </Card>
            </motion.div>
          ) : selectedAssignment ? (
            <motion.div
              key={selectedAssignment.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              <Card title={selectedAssignment.title}>
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold text-gray-800 flex items-center gap-2"><FileText size={16} /> Instructions</h3>
                    <p className="mt-1 text-gray-600 whitespace-pre-wrap">{selectedAssignment.instructions}</p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800 flex items-center gap-2"><Users size={16} /> Assigned Team</h3>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {selectedAssignment.members.map(m => (
                        <span key={m.id} className="flex items-center gap-2 px-3 py-1 rounded-full bg-gray-100">
                          <img src={m.avatar_url || `https://ui-avatars.com/api/?name=${m.first_name}+${m.last_name}&background=random`} alt="member" className="w-5 h-5 rounded-full" />
                          <span className="text-sm font-medium text-gray-700">{m.first_name} {m.last_name}</span>
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </Card>

              {/* Chat Component will go here */}
              <AdminAssignmentChat assignment={selectedAssignment} adminUser={user} />

            </motion.div>
          ) : (
            <motion.div
              key="placeholder"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <Card className="flex flex-col items-center justify-center h-full min-h-[400px]">
                <Briefcase size={48} className="text-gray-300" />
                <p className="mt-4 text-gray-500">Select an assignment to view details</p>
                <p className="text-sm text-gray-400">or create a new one</p>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default AssignmentsTab;