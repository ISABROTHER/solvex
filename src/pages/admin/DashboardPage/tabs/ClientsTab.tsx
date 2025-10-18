// src/pages/admin/DashboardPage/tabs/ClientsTab.tsx
// @ts-nocheck
import React, { useState, useEffect, useMemo, useCallback } from "react";
import { Check, X, Mail, Phone, User, RefreshCw, Loader2, AlertCircle, Eye, BarChart3, UserCheck } from "lucide-react"; // Added UserCheck
import Card from "../components/Card";
import {
  listClientsWithStats, // You might need a real implementation of this now
  listServiceRequests,
  updateServiceRequestStatus,
  ServiceRequestStatus,
  // --- Access Request Imports ---
  getAccessRequests,
  updateAccessRequestStatus,
  inviteUserByEmail,
  createOrUpdateClientProfile, // Use the upsert version
  onAccessRequestsChange,
  AccessRequest
} from "../../../../lib/supabase/operations";
import { supabase } from "../../../../lib/supabase/client";
import ClientDetailModal from "../components/ClientDetailModal";
import RequestDetailModal from "../components/RequestDetailModal";
import { mapRequestsToDisplay, calculateClientStats } from "../../../../utils/client-sync.utils";
import type { ClientProfile, ServiceRequestDisplay } from "../../../../types/client-sync.types";
import { useToast } from "../../../../contexts/ToastContext";

// ... (types and statusColorMap remain the same) ...
// Define ClientRow based on your 'profiles' or 'clients' table structure if different
type ClientRow = Database['public']['Tables']['profiles']['Row']; // Example if using profiles
type ServiceRequestJoined = Database['public']['Tables']['service_requests']['Row'] & {
  clients: { full_name: string | null; email: string | null } | null;
};


const ClientsTab: React.FC = () => {
  const [clients, setClients] = useState<ClientRow[]>([]); // Use correct type based on your data source
  const [requests, setRequests] = useState<ServiceRequestJoined[]>([]);
  const [accessRequests, setAccessRequests] = useState<AccessRequest[]>([]);
  const [loadingClients, setLoadingClients] = useState(true);
  const [loadingServiceRequests, setLoadingServiceRequests] = useState(true);
  const [loadingAccessRequests, setLoadingAccessRequests] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<ServiceRequestStatus | "All">("requested");
  const [searchTerm, setSearchTerm] = useState("");
  const [isUpdatingStatus, setIsUpdatingStatus] = useState<string | null>(null); // Track ID being updated
  const [selectedClient, setSelectedClient] = useState<ClientRow | null>(null);
  const [selectedRequest, setSelectedRequest] = useState<ServiceRequestDisplay | null>(null);
  const [viewMode, setViewMode] = useState<'table' | 'kanban'>('table');
  const { addToast } = useToast();

  const displayRequests = useMemo(() => mapRequestsToDisplay(requests), [requests]);
  const filteredRequests = useMemo(() => { /* ... (filtering logic) ... */
    return displayRequests.filter(req => {
        const statusMatch = filterStatus === "All" || req.status === filterStatus;
        const searchMatch = !searchTerm ||
          (req.clients?.full_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
          (req.clients?.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
          (req.project_title || '').toLowerCase().includes(searchTerm.toLowerCase());
        return statusMatch && searchMatch;
      });
  }, [displayRequests, filterStatus, searchTerm]);
  const pendingAccessRequests = useMemo(() => accessRequests.filter(req => req.status === 'pending'), [accessRequests]);

  // Combined Fetch Function
  const fetchData = useCallback(async () => {
    // Reset loading states individually
    setLoadingClients(true);
    setLoadingServiceRequests(true);
    setLoadingAccessRequests(true);
    setError(null);
    let currentError = '';

    const results = await Promise.allSettled([
        // Replace listClientsWithStats with actual query if needed
        // supabase.from('profiles').select('*').eq('role', 'client'), // Example: Fetch actual clients
         listClientsWithStats(), // Keeping mock for now, implement real fetch later
        listServiceRequests(),
        getAccessRequests('pending') // Fetch only pending requests initially
    ]);

    // Process Clients
    if (results[0].status === 'fulfilled' && !results[0].value.error) {
        setClients(results[0].value.data || []);
    } else {
        currentError += "Failed to fetch clients. ";
        console.error("Client fetch error:", results[0].status === 'rejected' ? results[0].reason : results[0].value.error);
    }
    setLoadingClients(false);

    // Process Service Requests
    if (results[1].status === 'fulfilled' && !results[1].value.error) {
        setRequests(results[1].value.data || []);
    } else {
         currentError += "Failed to fetch service requests. ";
        console.error("Service request fetch error:", results[1].status === 'rejected' ? results[1].reason : results[1].value.error);
    }
    setLoadingServiceRequests(false);

    // Process Access Requests
    if (results[2].status === 'fulfilled' && !results[2].value.error) {
        setAccessRequests(results[2].value.data || []);
    } else {
         currentError += "Failed to fetch access requests. ";
        console.error("Access request fetch error:", results[2].status === 'rejected' ? results[2].reason : results[2].value.error);
    }
    setLoadingAccessRequests(false);

    if (currentError) {
        setError(currentError.trim());
    }

  }, []);

  // Realtime subscription setup
  useEffect(() => {
    fetchData(); // Initial fetch

    const serviceRequestsSub = supabase.channel('service_requests_admin_view')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'service_requests' }, () => {
          setLoadingServiceRequests(true); // Indicate loading only for this section
          listServiceRequests().then(({ data, error: reqError }) => {
              if (reqError) console.error("Realtime service req fetch failed:", reqError);
              else setRequests(data || []);
              setLoadingServiceRequests(false);
          });
      }).subscribe();

    const accessRequestsSub = onAccessRequestsChange((payload) => {
        console.log('Access request change received:', payload);
        setLoadingAccessRequests(true); // Indicate loading
        // Refetch only pending requests to keep the list focused
        getAccessRequests('pending').then(({ data, error: accError }) => {
            if (accError) console.error("Realtime access req fetch failed:", accError);
            else setAccessRequests(data || []);
            setLoadingAccessRequests(false);
        });
    });

    // Optional: Realtime for clients/profiles if needed
    // const clientsSub = supabase.channel(...).subscribe();

    return () => {
      supabase.removeChannel(serviceRequestsSub);
      // Check if unsubscribe is needed or handled by removeChannel
      if (accessRequestsSub && typeof accessRequestsSub.unsubscribe === 'function') {
         accessRequestsSub.unsubscribe();
      } else {
          supabase.removeChannel(accessRequestsSub); // Fallback
      }
      // supabase.removeChannel(clientsSub);
    };
  }, [fetchData]); // Keep fetchData dependency for initial load

  // --- Handlers ---
  const handleServiceRequestStatusUpdate = async (request: ServiceRequestJoined, newStatus: ServiceRequestStatus) => {
      // ... (no changes needed here) ...
      setIsUpdatingStatus(request.id);
      const originalStatus = request.status;
      setRequests(prev => prev.map(r => r.id === request.id ? { ...r, status: newStatus } : r));
      const { error: updateError } = await updateServiceRequestStatus(request.id, newStatus);
      if (updateError) {
        addToast({ type: 'error', title: 'Update Failed', message: `Failed to update status for ${request.project_title}.` });
        setRequests(prev => prev.map(r => r.id === request.id ? { ...r, status: originalStatus } : r));
      } else {
          addToast({ type: 'success', title: 'Status Updated', message: `Request status changed.` });
      }
      setIsUpdatingStatus(null);
  };

  const handleApprove = async (request: AccessRequest) => {
    if (isUpdatingStatus) return; // Prevent double clicks
    setIsUpdatingStatus(request.id); // Set loading state for this specific request
    addToast({ type: 'info', title: 'Processing Approval...', message: `For ${request.email}` });

    try {
        // 1. Invite User (handles existing users)
        const { data: inviteData, error: inviteError } = await inviteUserByEmail(request.email);

        if (inviteError) {
            // Specific handling for non-critical "already registered"
            if (!inviteError.message?.includes('already registered')) {
                throw new Error(`Invite Error: ${inviteError.message}`);
            }
            addToast({ type: 'warning', title: 'User Exists', message: `${request.email} already registered. Proceeding to profile check.` });
        } else if (inviteData?.user) {
             addToast({ type: 'success', title: 'Invite Sent', message: `Invite email sent successfully to ${request.email}.` });
        } else {
             // Invite succeeded but somehow no user data returned (edge case)
             console.warn("Invite seemed successful but no user data returned.");
        }

        // Determine User ID (critical step)
        let userId = inviteData?.user?.id;
        if (!userId && inviteError?.message?.includes('already registered')) {
             // If user existed, we need their ID to create/update profile
             // This requires admin privileges client-side (less secure) or an Edge Function
             // For now, assume admin privileges OR handle this step manually/server-side
            addToast({ type: 'info', title: 'Fetching Existing User ID...', message: `For ${request.email}` });
             const { data: usersData, error: usersError } = await supabase.auth.admin.listUsers({ email: request.email });
             if (usersError || !usersData?.users?.length) {
                 throw new Error(`Failed to find existing user ID for ${request.email}: ${usersError?.message || 'Not found'}`);
             }
             userId = usersData.users[0].id;
             addToast({ type: 'success', title: 'Found Existing User ID' });
        }

        if (!userId) {
            throw new Error("Could not determine User ID. Cannot proceed with profile creation.");
        }

        // 2. Create or Update Profile
        addToast({ type: 'info', title: 'Setting up Profile...', message: `Assigning 'client' role to ${userId.substring(0,8)}...` });
        const { error: profileError } = await createOrUpdateClientProfile(
            userId,
            request.first_name,
            request.last_name,
            request.email,
            request.phone,
            request.company_name
        );
        if (profileError) throw new Error(`Profile Setup Error: ${profileError.message}`);
        addToast({ type: 'success', title: 'Profile Ready', message: `User profile created/updated successfully.` });

        // 3. Update Request Status to 'approved'
        addToast({ type: 'info', title: 'Finalizing...', message: `Marking request as approved.` });
        const { error: statusError } = await updateAccessRequestStatus(request.id, 'approved');
        if (statusError) throw new Error(`Status Update Error: ${statusError.message}`);

        // Final success toast
        addToast({ type: 'success', title: 'Request Approved!', message: `${request.first_name} ${request.last_name} granted access.` });

        // Realtime listener should remove the request from the pending list automatically

    } catch (err: any) {
        console.error("Approval Process Error:", err);
        addToast({ type: 'error', title: 'Approval Failed', message: err.message || 'An unexpected error occurred.' });
        // Let realtime handle UI state, no manual revert needed here
    } finally {
        setIsUpdatingStatus(null); // Clear loading state for this request
    }
  };

  const handleReject = async (request: AccessRequest) => {
    if (isUpdatingStatus) return;
    if (!window.confirm(`Reject access for ${request.first_name} ${request.last_name}?`)) return;

    setIsUpdatingStatus(request.id);
    try {
        const { error } = await updateAccessRequestStatus(request.id, 'rejected');
        if (error) throw error;
        addToast({ type: 'info', title: 'Request Rejected', message: `Access for ${request.email} was denied.` });
        // Realtime listener handles UI update
    } catch (err: any) {
        console.error("Rejection Error:", err);
        addToast({ type: 'error', title: 'Rejection Failed', message: err.message || 'Could not update status.' });
    } finally {
        setIsUpdatingStatus(null);
    }
  };


  // --- Render ---
  return (
    <div className="space-y-6">

       {/* --- Access Requests Section --- */}
       <Card title={`Pending Access Requests (${pendingAccessRequests.length})`} right={
            <button onClick={fetchData} disabled={loadingAccessRequests || loadingClients || loadingServiceRequests} className="p-1.5 rounded-full hover:bg-gray-100 disabled:opacity-50" title="Refresh All Data">
              <RefreshCw size={18} className={(loadingAccessRequests || loadingClients || loadingServiceRequests) ? 'animate-spin' : ''} />
            </button>
       }>
            {loadingAccessRequests ? (
                 <div className="flex justify-center py-10"><Loader2 className="w-6 h-6 animate-spin text-gray-400" /></div>
            ) : error && !accessRequests.length && !pendingAccessRequests.length ? (
                 <div className="text-center py-10 text-red-600 flex flex-col items-center gap-3"><AlertCircle className="w-6 h-6" />{error.includes("access requests") ? error : "Failed to load access requests."}</div>
            ) : pendingAccessRequests.length === 0 ? (
                 <p className="text-center text-gray-500 py-10">🎉 No pending access requests!</p>
            ) : (
                <div className="overflow-x-auto">
                    <table className="min-w-full text-sm">
                        <thead className="bg-gray-50 border-b">
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
                                <tr key={req.id} className={`${isUpdatingStatus === req.id ? 'opacity-50 pointer-events-none' : 'hover:bg-gray-50'}`}>
                                    <td className="px-4 py-3 font-medium text-gray-800">{req.first_name} {req.last_name}</td>
                                    <td className="px-4 py-3 text-gray-600 space-y-0.5">
                                        <div className="flex items-center gap-1.5"><Mail size={14} className="text-gray-400"/> {req.email}</div>
                                        <div className="flex items-center gap-1.5"><Phone size={14} className="text-gray-400"/> {req.phone}</div>
                                    </td>
                                    <td className="px-4 py-3 text-gray-600 hidden md:table-cell">{req.company_name || <span className="text-gray-400">N/A</span>}</td>
                                    <td className="px-4 py-3 text-gray-600 hidden lg:table-cell max-w-xs truncate" title={req.reason || ''}>{req.reason || <span className="text-gray-400">N/A</span>}</td>
                                    <td className="px-4 py-3 text-gray-500">{new Date(req.created_at).toLocaleDateString()}</td>
                                    <td className="px-4 py-3">
                                        <div className="flex justify-end gap-2">
                                            <button
                                                onClick={() => handleApprove(req)}
                                                disabled={!!isUpdatingStatus}
                                                className="p-2 bg-green-100 text-green-700 rounded-full hover:bg-green-200 disabled:opacity-50"
                                                title={`Approve ${req.first_name}`}
                                            >
                                                {isUpdatingStatus === req.id ? <Loader2 size={16} className="animate-spin"/> : <Check size={16} />}
                                            </button>
                                            <button
                                                onClick={() => handleReject(req)}
                                                disabled={!!isUpdatingStatus}
                                                className="p-2 bg-red-100 text-red-700 rounded-full hover:bg-red-200 disabled:opacity-50"
                                                title={`Reject ${req.first_name}`}
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

      {/* --- Existing CLIENTS TABLE --- */}
      <Card title={`Active Clients (${clients.length})`}>
         {loadingClients ? (
             <div className="flex justify-center py-10"><Loader2 className="w-6 h-6 animate-spin text-gray-400" /></div>
         ): error && !clients.length ? (
             <div className="text-center py-10 text-red-600">{error.includes("clients") ? error : "Failed to load clients."}</div>
         ) : (
             <div className="overflow-x-auto">
                 {/* ... table structure ... */}
                 <table className="min-w-full text-sm">
                     <thead className="bg-gray-50 border-b">
                         <tr className="text-left text-gray-600">
                             <th className="px-4 py-2 font-semibold">Name</th>
                             <th className="px-4 py-2 font-semibold">Contact</th>
                             <th className="px-4 py-2 font-semibold">Company</th>
                             <th className="px-4 py-2 font-semibold">Role</th>
                             <th className="px-4 py-2 font-semibold">Actions</th>
                         </tr>
                     </thead>
                     <tbody className="divide-y divide-gray-200">
                        {clients.map((c) => {
                            const clientRequests = requests.filter(r => r.client_id === c.id); // You might need to adjust this if client_id isn't directly on requests
                            const fullName = `${c.first_name || ''} ${c.last_name || ''}`.trim() || c.email || 'N/A';
                            return (
                                <tr key={c.id} className="hover:bg-gray-50">
                                    <td className="px-4 py-3 font-medium text-gray-800">{fullName}</td>
                                    <td className="px-4 py-3 text-gray-600 space-y-0.5">
                                        {c.email && <div className="flex items-center gap-1.5"><Mail size={14} className="text-gray-400"/> {c.email}</div>}
                                        {c.phone && <div className="flex items-center gap-1.5"><Phone size={14} className="text-gray-400"/> {c.phone}</div>}
                                    </td>
                                    <td className="px-4 py-3 text-gray-600">{c.company || <span className="text-gray-400">N/A</span>}</td>
                                    <td className="px-4 py-3 text-gray-600 capitalize">{c.role}</td>
                                    <td className="px-4 py-3">
                                        <button
                                            onClick={() => setSelectedClient(c)} // Pass the profile data
                                            className="rounded-md border bg-white px-3 py-1.5 font-medium hover:bg-gray-100 flex items-center gap-1 text-xs"
                                        >
                                            <User size={14} /> View Profile
                                        </button>
                                    </td>
                                </tr>
                            );
                        })}
                     </tbody>
                 </table>
                 {clients.length === 0 && <p className="py-8 text-center text-gray-500">No active client profiles found.</p>}
             </div>
         )}
      </Card>

      {/* --- Existing SERVICE REQUESTS --- */}
       <Card title="All Service Requests" right={ /* ... (Filter UI) ... */ }>
         {loadingServiceRequests ? (
             <div className="flex justify-center py-10"><Loader2 className="w-6 h-6 animate-spin text-gray-400" /></div>
         ) : error && !requests.length ? (
             <div className="text-center py-10 text-red-600">{error.includes("service requests") ? error : "Failed to load service requests."}</div>
         ) : (
            viewMode === 'table' ? ( <div className="overflow-x-auto">{/* ... Table ... */}</div> )
            : ( <KanbanView requests={filteredRequests} onRequestClick={setSelectedRequest} /> )
         )}
       </Card>

      {/* --- Modals --- */}
      {selectedClient && (
        <ClientDetailModal
          client={selectedClient as ClientProfile} // Adjust type casting as needed
          requests={displayRequests.filter(r => r.client_id === selectedClient.id) as any} // Adjust filtering if needed
          stats={calculateClientStats(selectedClient as ClientProfile, requests as any)} // Adjust type casting
          onClose={() => setSelectedClient(null)}
        />
      )}
      {/* ... (RequestDetailModal remains the same) ... */}
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
// ...

export default ClientsTab;