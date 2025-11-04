// @ts-nocheck
import React, { useState, useMemo } from 'react';
import { supabase } from '../../../../lib/supabase/client';
import type { Database } from '../../../../lib/supabase/database.types';
import { useAuth } from '../../../../features/auth/AuthProvider';
import Card from '../components/Card';
import { 
  Loader2, 
  User, 
  Search, 
  AlertCircle, 
  PlusCircle,
  List,
  LayoutGrid,
  Filter,
  Users
} from 'lucide-react';
import { useToast } from '../../../../contexts/ToastContext';
import { Profile } from './EmployeesTab'; // Assuming type is exported from EmployeesTab
import CreateAssignmentModal from '../components/CreateAssignmentModal';
import AssignmentDetailPanel from '../components/AssignmentDetailPanel';

// --- TYPE DEFINITIONS (MOCKED) ---
// We define these here temporarily, as requested (frontend-first)

type Category = 'Design' | 'Content' | 'Public Relations' | 'Innovation Lab' | 'Production' | 'Client Project';
type Priority = 'low' | 'medium' | 'high';
type Status = 'Assigned' | 'In Progress' | 'Pending Review' | 'Completed' | 'Overdue';
type AssignmentType = 'individual' | 'team';

export type Milestone = { 
  id: string, 
  title: string, 
  due_date: string | null, 
  completed: boolean 
};

type AssignmentAttachment = { 
  id: string, 
  file_name: string, 
  file_url: string, 
  uploaded_at: string 
};

type AssignmentComment = { 
  id: string, 
  profile: Pick<Profile, 'first_name' | 'last_name' | 'avatar_url'>, 
  content: string, 
  created_at: string 
};

export type Assignment = {
  id: string;
  title: string;
  category: Category;
  description: string;
  attachments: AssignmentAttachment[];
  priority: Priority;
  type: AssignmentType;
  start_date: string | null;
  due_date: string | null;
  milestones: Milestone[];
  assignees: Pick<Profile, 'id' | 'first_name' | 'last_name' | 'avatar_url'>[];
  supervisor: Pick<Profile, 'id' | 'first_name' | 'last_name' | 'avatar_url'> | null;
  status: Status;
  comments: AssignmentComment[];
  deliverables: AssignmentAttachment[]; // Files uploaded by employees
};

// --- MOCK DATA (FRONTEND-FIRST) ---
const MOCK_USER_1: Pick<Profile, 'id' | 'first_name' | 'last_name' | 'avatar_url'> = { id: '1', first_name: 'John', last_name: 'Doe', avatar_url: null };
const MOCK_USER_2: Pick<Profile, 'id' | 'first_name' | 'last_name' | 'avatar_url'> = { id: '2', first_name: 'Jane', last_name: 'Smith', avatar_url: null };
const MOCK_SUPERVISOR: Pick<Profile, 'id' | 'first_name' | 'last_name' | 'avatar_url'> = { id: '3', first_name: 'Mike', last_name: 'Brown', avatar_url: null };

const MOCK_ASSIGNMENTS: Assignment[] = [
  {
    id: 'assign_1',
    title: 'Client Brand Strategy Deck',
    category: 'Design',
    description: 'Create a full brand strategy deck for the new client. Include tone, format, and target audience analysis.',
    attachments: [{ id: 'att_1', file_name: 'Client_Brief.pdf', file_url: '#', uploaded_at: '2025-11-03' }],
    priority: 'high',
    type: 'team',
    start_date: '2025-11-05',
    due_date: '2025-11-15',
    milestones: [
      { id: 'm_1', title: 'Initial Research', due_date: '2025-11-07', completed: true },
      { id: 'm_2', title: 'Draft v1', due_date: '2025-11-10', completed: false },
      { id: 'm_3', title: 'Final Deck', due_date: '2025-11-15', completed: false },
    ],
    assignees: [MOCK_USER_1, MOCK_USER_2],
    supervisor: MOCK_SUPERVISOR,
    status: 'In Progress',
    comments: [
      { id: 'c_1', profile: MOCK_SUPERVISOR, content: 'Great start, team. Let\'s focus on the target audience slide.', created_at: '1d ago' },
      { id: 'c_2', profile: MOCK_USER_1, content: '@Mike Brown Thanks, will do. Draft v1 coming soon.', created_at: '1h ago' },
    ],
    deliverables: [],
  },
  {
    id: 'assign_2',
    title: 'Social Media Campaign Plan',
    category: 'Content',
    description: 'Plan out the Q4 social media campaign.',
    attachments: [],
    priority: 'medium',
    type: 'individual',
    start_date: '2025-11-01',
    due_date: '2025-11-10',
    milestones: [],
    assignees: [MOCK_USER_2],
    supervisor: MOCK_SUPERVISOR,
    status: 'Pending Review',
    comments: [],
    deliverables: [{ id: 'd_1', file_name: 'Social_Plan_v1.pdf', file_url: '#', uploaded_at: '2025-11-04' }],
  },
  {
    id: 'assign_3',
    title: 'Pitch Video Editing',
    category: 'Production',
    description: 'Edit the final pitch video.',
    attachments: [],
    priority: 'low',
    type: 'individual',
    start_date: '2025-11-01',
    due_date: '2025-11-03',
    milestones: [],
    assignees: [MOCK_USER_1],
    supervisor: null,
    status: 'Overdue',
    comments: [],
    deliverables: [],
  },
];
// --- END MOCK DATA ---


// --- Helper Components ---
const statusColors = {
  'Assigned': 'bg-gray-100 text-gray-700',
  'In Progress': 'bg-blue-100 text-blue-700',
  'Pending Review': 'bg-yellow-100 text-yellow-700',
  'Completed': 'bg-green-100 text-green-700',
  'Overdue': 'bg-red-100 text-red-700',
};

const priorityColors = {
  'low': 'border-green-400',
  'medium': 'border-yellow-400',
  'high': 'border-red-400',
};

// --- Main Tab Component ---
const AssignmentsTab: React.FC = () => {
  const { user } = useAuth();
  const { addToast } = useToast();
  
  // --- State ---
  const [assignments, setAssignments] = useState<Assignment[]>(MOCK_ASSIGNMENTS);
  const [loading, setLoading] = useState(false); // Set to false to show mock data
  const [error, setError] = useState<string | null>(null);
  
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Modals / Panels
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null);

  // --- MOCKED FUNCTIONS ---
  const handleSaveAssignment = async (data: any) => {
    setIsSaving(true);
    // In real app, call Supabase here
    await new Promise(res => setTimeout(res, 1000));
    addToast({ type: 'success', title: 'Assignment Created!' });
    setIsSaving(false);
    setIsCreateModalOpen(false);
    // Here we would refetch data, but for mock, we just close
  };

  const handleUpdateStatus = (newStatus: string) => {
    if (!selectedAssignment) return;
    // Mock update
    setSelectedAssignment(prev => prev ? { ...prev, status: newStatus as Status } : null);
    setAssignments(prev => 
      prev.map(a => a.id === selectedAssignment.id ? { ...a, status: newStatus as Status } : a)
    );
    addToast({ type: 'info', title: 'Status Updated', message: `${selectedAssignment.title} set to ${newStatus}` });
  };
  
  const handlePostComment = (comment: string) => {
    if (!selectedAssignment) return;
    // Mock post
    const newComment: AssignmentComment = {
      id: `c_${Date.now()}`,
      profile: { first_name: 'Admin', last_name: '', avatar_url: null }, // Mocking admin user
      content: comment,
      created_at: 'Just now'
    };
    setSelectedAssignment(prev => prev ? { ...prev, comments: [...prev.comments, newComment] } : null);
  };
  
  const handleApprove = (id: string) => addToast({ type: 'success', title: 'Deliverable Approved!' });
  const handleRequestEdits = (id: string, msg: string) => addToast({ type: 'info', title: 'Edits Requested' });

  // --- Filtering (Point #6) ---
  const filteredAssignments = useMemo(() => {
    const q = searchQuery.toLowerCase();
    return assignments.filter(a =>
      a.title.toLowerCase().includes(q) ||
      a.category.toLowerCase().includes(q) ||
      a.assignees.some(u => `${u.first_name} ${u.last_name}`.toLowerCase().includes(q))
    );
  }, [assignments, searchQuery]);

  if (loading) {
    return <div className="flex justify-center py-20"><Loader2 className="w-10 h-10 animate-spin text-gray-400" /></div>;
  }
  
  if (error) {
    return <div className="text-center py-20 text-red-600 flex flex-col items-center gap-3"><AlertCircle className="w-6 h-6" />{error}</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <h2 className="text-3xl font-bold text-gray-900">Assignments</h2>
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-[#FF5722] text-white text-sm font-semibold rounded-lg hover:bg-[#E64A19] transition-colors"
        >
          <PlusCircle size={18} />
          Create Assignment
        </button>
      </div>

      {/* Filter & View Controls (Point #6) */}
      <Card>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="relative w-full md:w-72">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by title, assignee, or category..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-3 py-2 text-sm rounded-lg border border-gray-300 w-full"
            />
          </div>
          <div className="flex items-center gap-4">
            <button className="flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-gray-900">
              <Filter size={16} />
              Filter by Status
            </button>
            <div className="flex items-center gap-1 p-1 bg-gray-200 rounded-lg">
              <button 
                onClick={() => setViewMode('list')}
                className={`p-1.5 rounded-md ${viewMode === 'list' ? 'bg-white shadow-sm' : 'text-gray-600'}`}
              >
                <List size={18} />
              </button>
              <button 
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-md ${viewMode === 'grid' ? 'bg-white shadow-sm' : 'text-gray-600'}`}
              >
                <LayoutGrid size={18} />
              </button>
            </div>
          </div>
        </div>
      </Card>

      {/* Assignment List (Grid View) */}
      {viewMode === 'grid' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAssignments.map(assignment => (
            <AssignmentCard 
              key={assignment.id} 
              assignment={assignment} 
              onClick={() => setSelectedAssignment(assignment)}
            />
          ))}
        </div>
      )}
      
      {/* Assignment List (List View) */}
      {viewMode === 'list' && (
         <Card>
           <div className="space-y-3">
             {filteredAssignments.map(assignment => (
                <AssignmentListItem 
                  key={assignment.id} 
                  assignment={assignment} 
                  onClick={() => setSelectedAssignment(assignment)}
                />
             ))}
           </div>
         </Card>
      )}

      {/* Modals & Panels */}
      <CreateAssignmentModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSave={handleSaveAssignment}
        isSaving={isSaving}
      />
      
      <AssignmentDetailPanel
        assignment={selectedAssignment}
        onClose={() => setSelectedAssignment(null)}
        onUpdateStatus={handleUpdateStatus}
        onPostComment={handlePostComment}
        onApproveDeliverable={handleApprove}
        onRequestEdits={handleRequestEdits}
      />
    </div>
  );
};

// --- Sub-Components for the List/Grid ---

// Card for Grid View
const AssignmentCard: React.FC<{ assignment: Assignment, onClick: () => void }> = ({ assignment, onClick }) => {
  const progress = useMemo(() => {
    if (assignment.milestones.length === 0) return 0;
    const completed = assignment.milestones.filter(m => m.completed).length;
    return Math.round((completed / assignment.milestones.length) * 100);
  }, [assignment]);

  return (
    <Card className="cursor-pointer hover:shadow-lg" onClick={onClick}>
      <div className={`h-2 w-full bg-gray-200 rounded-t-lg overflow-hidden border-b-4 ${priorityColors[assignment.priority]}`}>
         {/* <div className="bg-[#FF5722] h-full" style={{ width: `${progress}%` }}></div> */}
      </div>
      
      <div className="p-5">
        <span className="px-3 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-700">{assignment.category}</span>
        
        <h4 className="text-lg font-bold text-gray-900 mt-2 truncate">{assignment.title}</h4>
        
        <span className={`mt-2 inline-flex px-2 py-0.5 text-xs font-semibold rounded-full ${statusColors[assignment.status]}`}>
          {assignment.status}
        </span>
        
        <p className="text-sm text-gray-500 mt-3 line-clamp-2">{assignment.description}</p>
        
        <div className="border-t mt-4 pt-4">
          <div className="flex items-center -space-x-2">
            {assignment.assignees.map(user => (
              <span key={user.id} title={`${user.first_name} ${user.last_name}`} className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center border-2 border-white">
                <User size={16} className="text-gray-600" />
              </span>
            ))}
          </div>
          <div className="text-sm text-gray-500 mt-3">
            <strong>Due:</strong> {assignment.due_date || 'N/A'}
          </div>
        </div>
      </div>
    </Card>
  );
};

// Row for List View
const AssignmentListItem: React.FC<{ assignment: Assignment, onClick: () => void }> = ({ assignment, onClick }) => (
  <button onClick={onClick} className="w-full flex items-center justify-between p-4 rounded-lg hover:bg-gray-50">
    <div className="flex items-center gap-4 min-w-0">
       <span className={`w-3 h-3 rounded-full flex-shrink-0 ${priorityColors[assignment.priority].replace('border-4', 'bg-')}`} />
       <div className="min-w-0 text-left">
          <p className="text-base font-semibold text-gray-900 truncate">{assignment.title}</p>
          <p className="text-sm text-gray-500">{assignment.category}</p>
       </div>
    </div>
    <div className="flex items-center gap-4 flex-shrink-0">
        <div className="flex items-center -space-x-2">
            {assignment.assignees.map(user => (
              <span key={user.id} title={`${user.first_name} ${user.last_name}`} className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center border-2 border-white">
                <User size={16} className="text-gray-600" />
              </span>
            ))}
        </div>
       <span className={`hidden md:inline-flex px-3 py-1 text-xs font-semibold rounded-full ${statusColors[assignment.status]}`}>
          {assignment.status}
        </span>
        <div className="hidden lg:block text-sm text-gray-500 w-28">
          Due: {assignment.due_date || 'N/A'}
        </div>
    </div>
  </button>
);


export default AssignmentsTab;