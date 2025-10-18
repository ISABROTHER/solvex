// src/pages/admin/DashboardPage/tabs/ClientsTab.tsx
// @ts-nocheck
import React, { useState, useEffect, useMemo, useCallback } from "react";
// ... other imports ...
import { Check, X, Mail, Phone, User, RefreshCw, Loader2, AlertCircle } from "lucide-react"; // Added Check, X, User
import Card from "../components/Card";
import {
  listClientsWithStats,
  listServiceRequests,
  updateServiceRequestStatus,
  ServiceRequestStatus,
  // --- Import new operations ---
  getAccessRequests,
  updateAccessRequestStatus,
  inviteUserByEmail,
  createClientProfile,
  onAccessRequestsChange,
  AccessRequest // Import the type
} from "../../../../lib/supabase/operations";
import { supabase } from "../../../../lib/supabase/client"; // Keep direct client import for channel removal
import ClientDetailModal from "../components/ClientDetailModal";
import RequestDetailModal from "../components/RequestDetailModal";
import { mapRequestsToDisplay, calculateClientStats } from "../../../../utils/client-sync.utils";
import type { ClientProfile, ServiceRequestDisplay } from "../../../../types/client-sync.types";
import { useToast } from "../../../../contexts/ToastContext"; // Import useToast


// ... (keep existing types like ClientRow, ServiceRequestJoined, statusColorMap, etc.) ...

const ClientsTab: React.FC = () => {
  const [clients, setClients] = useState<ClientRow[]>([]);
  const [requests, setRequests] = useState<ServiceRequestJoined[]>([]);
  const [accessRequests, setAccessRequests] = useState<AccessRequest[]>([]); // <-- State for access requests
  const [loading, setLoading] = useState(true);
  const [loadingRequests, setLoadingRequests] = useState(true); // Separate loading for access requests
  const [error, setError] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<ServiceRequestStatus | "All">("requested");
  const [searchTerm, setSearchTerm] = useState("");
  const [isUpdatingStatus, setIsUpdatingStatus] = useState<string | null>(null); // Track which request is updating
  const [selectedClient, setSelectedClient] = useState<ClientRow | null>(null);
  const [selectedRequest, setSelectedRequest] = useState<ServiceRequestDisplay | null>(null);
  const [viewMode, setViewMode] = useState<'table' | 'kanban'>('table');
  const { addToast } = useToast(); // Get toast function


  const displayRequests = useMemo(() => mapRequestsToDisplay(requests), [requests]);
  const filteredRequests = useMemo(() => {
     // ... (filtering logic for service requests remains the same) ...
     return displayRequests.filter(req => {
        const statusMatch = filterStatus === "All" || req.status === filterStatus;
        const searchMatch = !searchTerm ||
          req.clients?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          req.clients?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          req.project_title?.toLowerCase().includes(searchTerm.toLowerCase());
        return statusMatch && searchMatch;
      });
  }, [displayRequests, filterStatus, searchTerm]);

  // --- Combined Fetch Function ---
  const fetchData = useCallback(async () => {
    setLoading(true);
    setLoadingRequests(true);
    setError(null);

    const results = await Promise.allSettled([
        listClientsWithStats(),
        listServiceRequests(),
        getAccessRequests() // Fetch access requests too
    ]);

    // Handle results
    if (results[0].status === 'fulfilled' && !results[0].value.error) {
        setClients(results[0].value.data || []);
    } else {
        setError(prev => (prev ? prev + " | " : "") + "Failed to fetch clients.");
        console.error("Client fetch error:", results[0].status === 'rejected' ? results[0].reason : results[0].value.error);
    }

    if (results[1].status === 'fulfilled' && !results[1].value.error) {
        setRequests(results[1].value.data || []);
    } else {
         setError(prev => (prev ? prev + " | " : "") + "Failed to fetch service requests.");
        console.error("Service request fetch error:", results[1].status === 'rejected' ? results[1].reason : results[1].value.error);
    }

    if (results[2].status === 'fulfilled' && !results[2].value.error) {
        setAccessRequests(results[2].value.data || []);
    } else {
         setError(prev => (prev ? prev + " | " : "") + "Failed to fetch access requests.");
        console.error("Access request fetch error:", results[2].status === 'rejected' ? results[2].reason : results[2].value.error);
    }

    setLoading(false);
    setLoadingRequests(false);
  }, []);

  // --- Realtime subscription setup ---
  useEffect(() => {
    fetchData(); // Initial fetch

    // Subscribe to service requests
    const serviceRequestsChannel = supabase.channel('service_requests_admin_view')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'service_requests' }, fetchData)
      .subscribe();

    // Subscribe to access requests
    const accessRequestsSubscription = onAccessRequestsChange(fetchData);

    // Subscribe to client changes (optional, if client list needs real-time updates)
    const clientsChannel = supabase.channel('clients_admin_view')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'clients' }, fetchData)
      .subscribe();

    // Cleanup function
    return () => {
      supabase.removeChannel(serviceRequestsChannel);
      supabase.removeChannel(accessRequestsSubscription);
      supabase.removeChannel(clientsChannel);
    };
  }, [fetchData]);

  // --- Handle Status Update for Service Requests ---
  const handleServiceRequestStatusUpdate = async (request: ServiceRequestJoined, newStatus: ServiceRequestStatus) => {
    // ... (logic remains the same as before) ...
    setIsUpdatingStatus(request.id);
    const originalStatus = request.status;
    setRequests(prev => prev.map(r => r.id === request.id ? { ...r, status: newStatus } : r));
    const { error: updateError } = await updateServiceRequestStatus(request.id, newStatus);
    if (updateError) {
      addToast({ type: 'error', title: 'Update Failed', message: `Failed to update status for ${request.project_title}.` });
      setRequests(prev => prev.map(r => r.id === request.id ? { ...r, status: originalStatus } : r));
    }
    setIsUpdatingStatus(null);
  };

  // --- Handle Approve Access Request ---
  const handleApprove = async (request: AccessRequest) => {
    if (isUpdatingStatus) return;
    setIsUpdatingStatus(request.id);

    try {
        // 1. Invite the user
        addToast({ type: 'info', title: 'Inviting User...', message: `Sending invite to ${request.email}` });
        const { data: inviteData, error: inviteError } = await inviteUserByEmail(request.email);

        if (inviteError) {
            // Check for specific Supabase errors if necessary, e.g., user already exists
            if (inviteError.message?.includes("already registered")) {
                 addToast({ type: 'warning', title: 'User Exists', message: `${request.email} is already registered. Approving request without new invite.` });
                 // Proceed to potentially create profile & update request status anyway
            } else if (inviteError.message === "Admin Auth API not available.") {
                addToast({ type: 'error', title: 'Invite Failed', message: 'Admin action required. Cannot invite from client-side directly. Use Supabase Functions.' });
                setIsUpdatingStatus(null);
                return; // Stop the process if invite failed critically
            }
            else {
                 throw new Error(`Invite Error: ${inviteError.message}`); // Throw other errors
            }
        } else {
             addToast({ type: 'success', title: 'Invite Sent', message: `Invite email sent to ${request.email}.` });
        }


        // Determine User ID: Use ID from invite if successful, otherwise need to fetch existing user
        let userId = inviteData?.user?.id;
        if (!userId && inviteError?.message?.includes("already registered")) {
             // Fetch existing user ID if invite wasn't needed
             // IMPORTANT: This assumes email is unique in auth.users
             // This step ideally happens server-side for security.
             addToast({ type: 'info', title: 'Fetching Existing User ID...' });
             const { data: { users }, error: userFetchError } = await supabase.auth.admin.listUsers({ email: request.email });
             if (userFetchError || !users || users.length === 0) {
                 throw new Error(`Failed to find existing user ID for ${request.email}: ${userFetchError?.message || 'User not found'}`);
             }
             userId = users[0].id;
             addToast({ type: 'success', title: 'Found Existing User', message: `Using ID for ${request.email}` });
        }

        if (!userId) {
            throw new Error("Could not determine User ID for profile creation.");
        }


        // 2. Create Profile (or ensure it exists with 'client' role)
        addToast({ type: 'info', title: 'Creating Profile...', message: `Setting up profile for ${userId}` });
        const { error: profileError } = await createClientProfile(
            userId,
            request.first_name,
            request.last_name,
            request.email,
            request.phone,
            request.company_name
        );
        if (profileError) throw new Error(`Profile Creation Error: ${profileError.message}`);
        addToast({ type: 'success', title: 'Profile Created/Verified', message: `User ${userId} assigned client role.` });

        // 3. Update Request Status
        addToast({ type: 'info', title: 'Finalizing Request...', message: `Marking request ${request.id.substring(0, 6)}... as approved.` });
        const { error: statusError } = await updateAccessRequestStatus(request.id, 'approved');
        if (statusError) throw new Error(`Status Update Error: ${statusError.message}`);

        addToast({ type: 'success', title: 'Request Approved!', message: `${request.first_name} ${request.last_name} has been granted access.` });

        // Refetch data is handled by the realtime listener

    } catch (err: any) {
        console.error("Approval Error:", err);
        addToast({ type: 'error', title: 'Approval Failed', message: err.message || 'An unexpected error occurred.' });
        // Optionally revert UI changes if needed, though realtime listener should handle it
    } finally {
        setIsUpdatingStatus(null);
    }
  };

  // --- Handle Reject Access Request ---
  const handleReject = async (request: AccessRequest) => {
    if (isUpdatingStatus) return;
    if (!window.confirm(`Are you sure you want to reject the request from ${request.first_name} ${request.last_name}?`)) return;

    setIsUpdatingStatus(request.id);
    try {
        const { error } = await updateAccessRequestStatus(request.id, 'rejected');
        if (error) throw error;
        addToast({ type: 'success', title: 'Request Rejected', message: `Access request from ${request.email} has been rejected.` });
        // Realtime listener handles UI update
    } catch (err: any) {
        console.error("Rejection Error:", err);
        addToast({ type: 'error', title: 'Rejection Failed', message: err.message || 'Could not update request status.' });
    } finally {
        setIsUpdatingStatus(null);
    }
  };


  // --- Render Loading/Error States ---
  if (loading && loadingRequests) {
    return <div className="flex justify-center py-20"><Loader2 className="w-10 h-10 animate-spin text-gray-400" /></div>;
  }

  // Filter pending access requests
  const pendingAccessRequests = accessRequests.filter(req => req.status === 'pending');

  return (
    <div className="space-y-6">

       {/* --- Access Requests Section (NEW) --- */}
       <Card title={`Pending Access Requests (${pendingAccessRequests.length})`} right={
            <button onClick={fetchData} disabled={loadingRequests} className="p-1.5 rounded-full hover:bg-gray-100 disabled:opacity-50" title="Refresh Requests">
              <RefreshCw size={18} className={loadingRequests ? 'animate-spin' : ''} />
            </button>
       }>
            {loadingRequests ? (
                 <div className="flex justify-center py-10"><Loader2 className="w-6 h-6 animate-spin text-gray-400" /></div>
            ) : error && !accessRequests.length ? ( // Show error only if loading failed AND no data
                 <div className="text-center py-10 text-red-600 flex flex-col items-center gap-3"><AlertCircle className="w-6 h-6" />{error.includes("access requests") ? error : "Failed to load access requests."}</div>
            ) : pendingAccessRequests.length === 0 ? (
                 <p className="text-center text-gray-500 py-10">No pending access requests.</p>
            ) : (
                <div className="overflow-x-auto">
                    <table className="min-w-full text-sm">
                        <thead className="bg-gray-50">
                            <tr className="text-left text-gray-600">
                                <th className="px-4 py-2 font-semibold">Name</th>
                                <th className="px-4 py-2 font-semibold">Contact</th>
                                <th className="px-4 py-2 font-semibold hidden md:table-cell">Company</th>
                                <th className="px-4 py-2 font-semibold hidden lg:table-cell">Reason</th>
                                <th className="px-4 py-2 font-semibold">Date</th>
                                <th className="px-4 py-2 font-semibold text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {pendingAccessRequests.map((req) => (
                                <tr key={req.id} className={`${isUpdatingStatus === req.id ? 'opacity-50' : 'hover:bg-gray-50'}`}>
                                    <td className="px-4 py-3 font-medium text-gray-800">{req.first_name} {req.last_name}</td>
                                    <td className="px-4 py-3 text-gray-600 space-y-0.5">
                                        <div className="flex items-center gap-1.5"><Mail size={14} className="text-gray-400"/> {req.email}</div>
                                        <div className="flex items-center gap-1.5"><Phone size={14} className="text-gray-400"/> {req.phone}</div>
                                    </td>
                                    <td className="px-4 py-3 text-gray-600 hidden md:table-cell">{req.company_name || 'N/A'}</td>
                                    <td className="px-4 py-3 text-gray-600 hidden lg:table-cell max-w-xs truncate">{req.reason || 'N/A'}</td>
                                    <td className="px-4 py-3 text-gray-500">{new Date(req.created_at).toLocaleDateString()}</td>
                                    <td className="px-4 py-3">
                                        <div className="flex justify-end gap-2">
                                            <button
                                                onClick={() => handleApprove(req)}
                                                disabled={!!isUpdatingStatus}
                                                className="p-2 bg-green-100 text-green-700 rounded-full hover:bg-green-200 disabled:opacity-50 disabled:cursor-not-allowed"
                                                title="Approve Request"
                                            >
                                                {isUpdatingStatus === req.id ? <Loader2 size={16} className="animate-spin"/> : <Check size={16} />}
                                            </button>
                                            <button
                                                onClick={() => handleReject(req)}
                                                disabled={!!isUpdatingStatus}
                                                className="p-2 bg-red-100 text-red-700 rounded-full hover:bg-red-200 disabled:opacity-50 disabled:cursor-not-allowed"
                                                title="Reject Request"
                                            >
                                                {isUpdatingStatus === req.id ? <Loader2 size={16} className="animate-spin"/> : <X size={16} />}
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </Card>
        {/* --- End Access Requests Section --- */}


      {/* --- Existing CLIENTS TABLE --- */}
      <Card title={`Client List (${clients.length})`}>
         {loading ? (
             <div className="flex justify-center py-10"><Loader2 className="w-6 h-6 animate-spin text-gray-400" /></div>
         ): error && !clients.length ? (
             <div className="text-center py-10 text-red-600 flex flex-col items-center gap-3"><AlertCircle className="w-6 h-6" />{error.includes("clients") ? error : "Failed to load clients."}</div>
         ) : (
            <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                    {/* ... (table head remains the same) ... */}
                     <thead className="bg-gray-50">
                      <tr className="text-left text-gray-600">
                        <th className="px-4 py-2 font-semibold">Name</th>
                        <th className="px-4 py-2 font-semibold">Contact</th>
                        <th className="px-4 py-2 font-semibold">Tier</th>
                        <th className="px-4 py-2 font-semibold">Total Requests</th>
                        <th className="px-4 py-2 font-semibold">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                    {clients.map((c) => {
                        // Ensure clients have the expected structure or handle potential undefined
                        const clientRequests = requests.filter(r => r.client_id === c.id);
                        const fullName = c.full_name || `${c.first_name || ''} ${c.last_name || ''}`.trim() || 'N/A';
                        return (
                        <tr key={c.id} className="hover:bg-gray-50 transition-colors">
                            <td className="px-4 py-3 font-medium text-gray-800">{fullName}</td>
                            <td className="px-4 py-3 text-gray-600 space-y-1">
                                <div className="flex items-center gap-1"><Mail size={14} className="text-gray-400"/> {c.email || 'N/A'}</div>
                                {c.phone && <div className="flex items-center gap-1"><Phone size={14} className="text-gray-400"/> {c.phone}</div>}
                            </td>
                            <td className="px-4 py-3 text-gray-600">{c.tier || 'N/A'}</td>
                            <td className="px-4 py-3 text-gray-600">{clientRequests.length}</td>
                            <td className="px-4 py-3">
                            <button
                                onClick={() => setSelectedClient(c)}
                                className="rounded-md border bg-white px-3 py-1.5 font-medium hover:bg-gray-100 transition-colors flex items-center gap-1 text-xs"
                            >
                                <User size={14} /> View Profile
                            </button>
                            </td>
                        </tr>
                        )})}
                    </tbody>
                </table>
                {clients.length === 0 && <p className="py-8 text-center text-gray-500">No active client profiles found.</p>}
            </div>
         )}
      </Card>

      {/* --- Existing SERVICE REQUESTS LIST --- */}
      <Card title="Client Service Requests" right={ /* ... (Filter UI remains the same) ... */ }>
         {loading ? (
             <div className="flex justify-center py-10"><Loader2 className="w-6 h-6 animate-spin text-gray-400" /></div>
         ) : error && !requests.length ? (
              <div className="text-center py-10 text-red-600 flex flex-col items-center gap-3"><AlertCircle className="w-6 h-6" />{error.includes("service requests") ? error : "Failed to load service requests."}</div>
         ) : (
            viewMode === 'table' ? (
                <div className="overflow-x-auto">
                    {/* ... (Service request table structure remains the same) ... */}
                    <table className="min-w-full text-sm">
                         {/* ... thead ... */}
                         <tbody className="divide-y divide-gray-200">
                            {filteredRequests.map((r) => (
                                <tr key={r.id} className="hover:bg-gray-50 transition-colors cursor-pointer" onClick={() => setSelectedRequest(r)}>
                                     {/* ... tds ... */}
                                    <td className="px-4 py-3 text-right" onClick={(e) => e.stopPropagation()}>
                                        <div className="flex items-center gap-2 justify-end">
                                        <select
                                            value={r.status}
                                            // Pass the full ServiceRequestJoined object
                                            onChange={(e) => handleServiceRequestStatusUpdate(requests.find(req => req.id === r.id)!, e.target.value as ServiceRequestStatus)}
                                            disabled={isUpdatingStatus === r.id} // Check against specific ID
                                            className="..."
                                        >
                                           {/* ... options ... */}
                                        </select>
                                        {/* ... View button ... */}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                             {/* ... No results row ... */}
                         </tbody>
                    </table>
                </div>
            ) : (
                <KanbanView requests={filteredRequests} onRequestClick={setSelectedRequest} />
            )
         )}
      </Card>

      {/* --- Modals --- */}
      {selectedClient && (
        <ClientDetailModal
          client={selectedClient as ClientProfile}
          requests={displayRequests.filter(r => r.client_id === selectedClient.id) as any}
          stats={calculateClientStats(selectedClient as ClientProfile, requests as any)}
          onClose={() => setSelectedClient(null)}
        />
      )}

      {selectedRequest && (
        <RequestDetailModal
          request={selectedRequest}
          onClose={() => setSelectedRequest(null)}
          onStatusUpdate={(newStatus) => {
            const originalRequest = requests.find(r => r.id === selectedRequest.id);
            if (originalRequest) {
              handleServiceRequestStatusUpdate(originalRequest, newStatus);
            }
          }}
        />
      )}
    </div>
  );
};

// KanbanView component remains the same
const KanbanView: React.FC<{ requests: ServiceRequestDisplay[]; onRequestClick: (req: ServiceRequestDisplay) => void }> = ({ requests, onRequestClick }) => {
    // ... (Kanban JSX remains the same) ...
     const columns: { status: ServiceRequestStatus; label: string; color: string }[] = [
        { status: 'requested', label: 'Requested', color: 'border-amber-300 bg-amber-50' },
        { status: 'confirmed', label: 'Confirmed', color: 'border-blue-300 bg-blue-50' },
        { status: 'in_progress', label: 'In Progress', color: 'border-indigo-300 bg-indigo-50' },
        { status: 'completed', label: 'Completed', color: 'border-green-300 bg-green-50' },
    ];
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 p-4">
        {columns.map(col => {
            const columnRequests = requests.filter(r => r.status === col.status);
            return (
            <div key={col.status} className={`border-t-4 rounded-lg p-4 ${col.color} min-h-[400px] bg-gray-50 shadow-sm`}>
                <div className="flex items-center justify-between mb-4">
                <h4 className="font-bold text-gray-900">{col.label}</h4>
                <span className="bg-white px-2 py-1 rounded-full text-xs font-semibold ring-1 ring-gray-200">{columnRequests.length}</span>
                </div>
                <div className="space-y-3">
                {columnRequests.map(req => (
                    <div
                    key={req.id}
                    onClick={() => onRequestClick(req)}
                    className="bg-white border border-gray-200 rounded-lg p-3 hover:shadow-md transition-shadow cursor-pointer"
                    >
                    <h5 className="font-semibold text-sm text-gray-900 mb-1 line-clamp-1">{req.project_title || 'Untitled'}</h5>
                    <p className="text-xs text-gray-500 mb-2 line-clamp-1 capitalize">{req.service_key.replace(/_/g, ' ')}</p>
                    <div className="flex items-center justify-between text-xs">
                        <span className="text-gray-600 line-clamp-1">{req.clients?.full_name || req.clients?.email || 'Unknown'}</span>
                        <span className="text-gray-400 flex-shrink-0">{new Date(req.requested_at).toLocaleDateString()}</span>
                    </div>
                    </div>
                ))}
                {columnRequests.length === 0 && (
                    <p className="text-center text-gray-400 text-sm py-8">No requests</p>
                )}
                </div>
            </div>
            );
        })}
        </div>
    );
};


export default ClientsTab;