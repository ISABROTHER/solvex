// src/pages/client/client.ts

export type ServiceRequestStatus = 'Pending' | 'In Progress' | 'In Review' | 'Completed';

export interface Client {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  company: string;
  tier: string;
  avatarUrl: string;
  notifications: { email: boolean; sms: boolean; inApp: boolean };
  stats: { totalRequests: number; onTimePercentage: number; lastActivity: string };
  // --- Added Fields ---
  location?: string; // e.g., "Accra, Ghana"
  phone?: string; // Existing, will be labelled "Mobile Number"
  emergencyContactName?: string;
  emergencyContactMobile?: string;
  // --- End Added Fields ---
}

export interface ServiceRequest {
  id: string;
  serviceType: string;
  projectTitle: string;
  status: ServiceRequestStatus;
  brief: string;
  createdAt: string;
  updatedAt: string;
  timeline: string;
}

export interface Message {
  id: string;
  requestId: string;
  sender: { name: string; role: 'client' | 'admin' };
  content: string;
  timestamp: string;
  isRead: boolean;
}