import {
  ServiceRequestDisplay,
  ServiceRequestDB,
  ClientProfile,
  ClientStats,
  statusMapping,
  AdminServiceRequestStatus,
  ClientServiceRequestStatus
} from '../types/client-sync.types';

export const mapRequestToDisplay = (request: ServiceRequestDB): ServiceRequestDisplay => {
  const clientStatus = statusMapping.toClient[request.status] || 'Pending';

  return {
    ...request,
    clientStatus,
    timeline: estimateTimeline(request),
    files: parseAttachments(request.attachments),
    assignedTeam: [],
  };
};

export const mapRequestsToDisplay = (requests: ServiceRequestDB[]): ServiceRequestDisplay[] => {
  return requests.map(mapRequestToDisplay);
};

export const calculateClientStats = (
  client: ClientProfile,
  requests: ServiceRequestDB[]
): ClientStats => {
  const clientRequests = requests.filter(r => r.client_id === client.id);

  const totalRequests = clientRequests.length;
  const activeRequests = clientRequests.filter(
    r => r.status === 'requested' || r.status === 'confirmed' || r.status === 'in_progress'
  ).length;
  const completedRequests = clientRequests.filter(r => r.status === 'completed').length;

  const lastActivityDate = clientRequests.length > 0
    ? clientRequests.reduce((latest, req) => {
        const reqDate = new Date(req.updated_at);
        return reqDate > latest ? reqDate : latest;
      }, new Date(clientRequests[0].updated_at)).toISOString()
    : null;

  return {
    totalRequests,
    activeRequests,
    completedRequests,
    lastActivityDate,
  };
};

export const convertAdminStatusToClient = (
  adminStatus: AdminServiceRequestStatus
): ClientServiceRequestStatus => {
  return statusMapping.toClient[adminStatus] || 'Pending';
};

export const convertClientStatusToAdmin = (
  clientStatus: ClientServiceRequestStatus
): AdminServiceRequestStatus => {
  return statusMapping.toAdmin[clientStatus] || 'requested';
};

const estimateTimeline = (request: ServiceRequestDB): string => {
  const serviceKey = request.service_key.toLowerCase();

  if (serviceKey.includes('brand')) return '3-4 Weeks';
  if (serviceKey.includes('photo') || serviceKey.includes('video')) return '1-2 Weeks';
  if (serviceKey.includes('content')) return '2-3 Weeks';
  if (serviceKey.includes('advertising')) return 'Ongoing';
  if (serviceKey.includes('strategy')) return '4-6 Weeks';

  return 'Flexible';
};

const parseAttachments = (attachments: any): { name: string; url: string }[] | undefined => {
  if (!attachments) return undefined;

  try {
    if (Array.isArray(attachments)) {
      return attachments.map((att, index) => ({
        name: att.name || `Attachment ${index + 1}`,
        url: att.url || att.label || ''
      }));
    }
    return undefined;
  } catch (error) {
    return undefined;
  }
};

export const getStatusProgressPercentage = (status: AdminServiceRequestStatus): number => {
  const progressMap: Record<AdminServiceRequestStatus, number> = {
    requested: 25,
    confirmed: 50,
    in_progress: 75,
    completed: 100,
    cancelled: 0,
  };

  return progressMap[status] || 0;
};

export const getNextStatus = (currentStatus: AdminServiceRequestStatus): AdminServiceRequestStatus | null => {
  const flow: AdminServiceRequestStatus[] = ['requested', 'confirmed', 'in_progress', 'completed'];
  const currentIndex = flow.indexOf(currentStatus);

  if (currentIndex === -1 || currentIndex === flow.length - 1) return null;

  return flow[currentIndex + 1];
};

export const canTransitionToStatus = (
  currentStatus: AdminServiceRequestStatus,
  targetStatus: AdminServiceRequestStatus
): boolean => {
  if (currentStatus === targetStatus) return true;

  if (targetStatus === 'cancelled') return true;

  const statusOrder: AdminServiceRequestStatus[] = ['requested', 'confirmed', 'in_progress', 'completed'];
  const currentIndex = statusOrder.indexOf(currentStatus);
  const targetIndex = statusOrder.indexOf(targetStatus);

  return targetIndex >= currentIndex;
};

export const sortRequestsByPriority = (requests: ServiceRequestDisplay[]): ServiceRequestDisplay[] => {
  const priorityOrder: Record<AdminServiceRequestStatus, number> = {
    requested: 1,
    confirmed: 2,
    in_progress: 3,
    completed: 4,
    cancelled: 5,
  };

  return [...requests].sort((a, b) => {
    const priorityDiff = priorityOrder[a.status] - priorityOrder[b.status];
    if (priorityDiff !== 0) return priorityDiff;

    return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
  });
};

export const filterRequestsByStatus = (
  requests: ServiceRequestDisplay[],
  status: AdminServiceRequestStatus | 'all'
): ServiceRequestDisplay[] => {
  if (status === 'all') return requests;
  return requests.filter(r => r.status === status);
};

export const searchRequests = (
  requests: ServiceRequestDisplay[],
  searchTerm: string
): ServiceRequestDisplay[] => {
  if (!searchTerm.trim()) return requests;

  const term = searchTerm.toLowerCase();

  return requests.filter(r =>
    r.project_title?.toLowerCase().includes(term) ||
    r.service_key.toLowerCase().includes(term) ||
    r.brief?.toLowerCase().includes(term) ||
    r.clients?.full_name?.toLowerCase().includes(term) ||
    r.clients?.email?.toLowerCase().includes(term)
  );
};

export const groupRequestsByStatus = (requests: ServiceRequestDisplay[]): Record<AdminServiceRequestStatus, ServiceRequestDisplay[]> => {
  const grouped: Record<AdminServiceRequestStatus, ServiceRequestDisplay[]> = {
    requested: [],
    confirmed: [],
    in_progress: [],
    completed: [],
    cancelled: [],
  };

  requests.forEach(request => {
    grouped[request.status].push(request);
  });

  return grouped;
};
