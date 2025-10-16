// src/components/client/StatusBadge.tsx
import React from 'react';
import { ServiceRequestStatus } from './client';

interface StatusBadgeProps {
  status: ServiceRequestStatus;
}

const statusStyles: Record<ServiceRequestStatus, string> = {
  Pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300',
  'In Progress': 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300',
  'In Review': 'bg-purple-100 text-purple-800 dark:bg-purple-900/50 dark:text-purple-300',
  Completed: 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300',
};

const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => (
  <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusStyles[status]}`}>
    {status}
  </span>
);

export default StatusBadge;
