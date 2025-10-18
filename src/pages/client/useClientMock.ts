// src/pages/client/useClientMock.ts

import { useState } from 'react';
import { Client, ServiceRequest, Message, ServiceRequestStatus } from './client';

const mockClient: Client = {
  id: 'user-123',
  firstName: 'Alex',
  lastName: 'Doe',
  email: 'alex.doe@example.com',
  company: 'Innovate Inc.',
  tier: 'VIP',
  avatarUrl: `https://api.dicebear.com/8.x/initials/svg?seed=Alex`,
  notifications: { email: true, sms: false, inApp: true },
  stats: { totalRequests: 8, onTimePercentage: 98, lastActivity: '2025-10-02T10:00:00Z' },
  // --- Added Mock Data ---
  location: 'Accra, Ghana', // Added location
  phone: '+233 24 123 4567', // Ensure phone exists for "Mobile Number"
  emergencyContactName: 'Jane Doe', // Added emergency contact name
  emergencyContactMobile: '+233 55 987 6543', // Added emergency contact mobile
  // --- End Added Mock Data ---
};

// ... (rest of the file remains the same)
const mockRequests: ServiceRequest[] = [
  { id: 'req-001', serviceType: 'Brand Strategy', projectTitle: 'Q4 Brand Refresh', status: 'Completed', brief: 'Complete overhaul of brand guidelines for the new quarter.', createdAt: '2025-08-01T10:00:00Z', updatedAt: '2025-09-15T14:30:00Z', timeline: '3-4 Weeks' },
  { id: 'req-002', serviceType: 'Advertising', projectTitle: 'Holiday Social Media Campaign', status: 'In Progress', brief: 'Develop and launch a social media ad campaign for the holiday season.', createdAt: '2025-09-10T11:00:00Z', updatedAt: '2025-10-01T09:00:00Z', timeline: 'Ongoing' },
  { id: 'req-003', serviceType: 'Photography & Videography', projectTitle: 'New Product Photoshoot', status: 'In Review', brief: 'Photoshoot for our upcoming product line. Need e-commerce and lifestyle shots.', createdAt: '2025-09-20T15:00:00Z', updatedAt: '2025-09-28T18:00:00Z', timeline: '1 Week' },
  { id: 'req-004', serviceType: 'Content Marketing', projectTitle: 'Blog Post Series on Industry Trends', status: 'Pending', brief: 'A series of 4 blog posts about emerging trends in our industry.', createdAt: '2025-10-01T16:00:00Z', updatedAt: '2025-10-01T16:00:00Z', timeline: 'Flexible' },
];

const mockMessages: Message[] = [
    { id: 'msg-1', requestId: 'req-002', sender: { name: 'Admin', role: 'admin' }, content: 'Hey Alex, the first drafts for the ad creatives are ready for your review.', timestamp: '2025-09-29T10:00:00Z', isRead: true },
    { id: 'msg-2', requestId: 'req-002', sender: { name: 'Alex', role: 'client' }, content: 'Great, thanks! Taking a look now.', timestamp: '2025-09-29T10:05:00Z', isRead: true },
];

export const useClientMock = () => {
  const [clientData] = useState<Client>(mockClient); // Renamed to avoid conflict
  const [requests, setRequests] = useState<ServiceRequest[]>(mockRequests);
  const [messages, setMessages] = useState<Message[]>(mockMessages);

  const addMessage = (newMessage: Omit<Message, 'id' | 'timestamp' | 'isRead'>) => {
    const message: Message = {
        ...newMessage,
        id: `msg-${Date.now()}`,
        timestamp: new Date().toISOString(),
        isRead: false,
    };
    setMessages(prev => [...prev, message]);
  };

  const addRequest = (newRequestData: Omit<ServiceRequest, 'id' | 'createdAt' | 'updatedAt' | 'status'>) => {
      const newRequest: ServiceRequest = {
          ...newRequestData,
          id: `req-${Date.now()}`,
          status: 'Pending',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
      };
      setRequests(prev => [newRequest, ...prev]);
      return newRequest;
  };

  const updateRequestStatus = (requestId: string, status: ServiceRequestStatus) => {
      setRequests(prev => prev.map(r => r.id === requestId ? { ...r, status, updatedAt: new Date().toISOString() } : r));
  }

  return {
    client: clientData, // Return renamed variable
    requests,
    messages,
    addMessage,
    addRequest,
    updateRequestStatus,
    isLoading: false,
  };
};