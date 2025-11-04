// @ts-nocheck
import type { Database } from '../../../../lib/supabase/database.types';

// --- Shared Profile Type ---
export type Profile = Database['public']['Tables']['profiles']['Row'];

// --- Shared Document Type ---
export type EmployeeDocument = {
  id: string;
  profile_id: string;
  document_name: string;
  storage_url: string;
  requires_signing: boolean;
  signed_storage_url: string | null;
  signed_storage_path: string | null;
  signed_at: string | null;
};

// --- Shared Assignment Types ---
export type Category = 'Design' | 'Content' | 'Public Relations' | 'Innovation Lab' | 'Production' | 'Client Project';
export type Priority = 'low' | 'medium' | 'high';
export type Status = 'Assigned' | 'In Progress' | 'Pending Review' | 'Completed' | 'Overdue';
export type AssignmentType = 'individual' | 'team';

export type Milestone = { 
  id: string, 
  title: string, 
  due_date: string | null, 
  completed: boolean 
};

export type AssignmentAttachment = { 
  id: string, 
  file_name: string, 
  file_url: string, 
  uploaded_at: string 
};

export type AssignmentComment = { 
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