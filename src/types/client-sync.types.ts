export type ClientTier = "Regular" | "VIP" | "Enterprise";

export type AdminServiceRequestStatus = 'requested' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled';
export type ClientServiceRequestStatus = "Pending" | "In Progress" | "In Review" | "Completed";

export interface ClientProfile {
  id: string;
  user_id: string;
  full_name: string | null;
  email: string | null;
  phone: string | null;
  company: string | null;
  tier: ClientTier;
  created_at: string;
  updated_at: string;
}

export interface ServiceRequestDB {
  id: string;
  client_id: string;
  service_key: string;
  project_title: string | null;
  brief: string | null;
  attachments: any;
  status: AdminServiceRequestStatus;
  requested_at: string;
  updated_at: string;
  clients?: {
    full_name: string | null;
    email: string | null;
  } | null;
}

export interface ServiceRequestDisplay extends ServiceRequestDB {
  clientStatus: ClientServiceRequestStatus;
  timeline?: string;
  assignedTeam?: { name: string; avatarUrl?: string }[];
  files?: { name: string; url: string }[];
}

export interface ClientMessage {
  id: string;
  request_id: string;
  sender_id: string;
  sender_name: string;
  sender_role: 'client' | 'admin';
  content: string;
  timestamp: string;
  is_read: boolean;
}

export interface ClientStats {
  totalRequests: number;
  activeRequests: number;
  completedRequests: number;
  lastActivityDate: string | null;
}

export interface ClientNotificationPreferences {
  email: boolean;
  sms: boolean;
  inApp: boolean;
}

export const statusMapping = {
  toClient: {
    requested: 'Pending',
    confirmed: 'In Progress',
    in_progress: 'In Progress',
    completed: 'Completed',
    cancelled: 'Completed'
  } as Record<AdminServiceRequestStatus, ClientServiceRequestStatus>,

  toAdmin: {
    'Pending': 'requested',
    'In Progress': 'in_progress',
    'In Review': 'in_progress',
    'Completed': 'completed'
  } as Record<ClientServiceRequestStatus, AdminServiceRequestStatus>
};

export const statusColorMap = {
  admin: {
    requested: 'bg-amber-100 text-amber-800 ring-amber-200',
    confirmed: 'bg-blue-100 text-blue-800 ring-blue-200',
    in_progress: 'bg-indigo-100 text-indigo-800 ring-indigo-200',
    completed: 'bg-green-100 text-green-800 ring-green-200',
    cancelled: 'bg-red-100 text-red-800 ring-red-200',
  } as Record<AdminServiceRequestStatus, string>,

  client: {
    'Pending': 'bg-yellow-100 text-yellow-800 border-yellow-200',
    'In Progress': 'bg-blue-100 text-blue-800 border-blue-200',
    'In Review': 'bg-purple-100 text-purple-800 border-purple-200',
    'Completed': 'bg-green-100 text-green-800 border-green-200',
  } as Record<ClientServiceRequestStatus, string>
};
