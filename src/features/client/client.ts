// src/types/client.ts

export type ClientTier = "Regular" | "VIP" | "Enterprise";

export type ServiceRequestStatus = "Pending" | "In Progress" | "In Review" | "Completed";

export interface Client {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  company?: string;
  tier: ClientTier;
  avatarUrl?: string;
  notifications: {
    email: boolean;
    sms: boolean;
    inApp: boolean;
  };
  stats: {
    totalRequests: number;
    onTimePercentage: number;
    lastActivity: string;
  };
}

export interface ServiceRequest {
  id: string;
  serviceType: string;
  projectTitle: string;
  status: ServiceRequestStatus;
  brief: string;
  files?: { name: string; url: string }[];
  timeline: string;
  createdAt: string;
  updatedAt: string;
  assignedTeam?: { name: string; avatarUrl?: string }[];
}

export interface Message {
  id: string;
  requestId: string;
  sender: {
    name: string;
    role: "client" | "admin";
    avatarUrl?: string;
  };
  content: string;
  timestamp: string;
  isRead: boolean;
}
