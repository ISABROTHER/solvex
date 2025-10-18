// @ts-nocheck
import React, { useState, useEffect, useMemo, useCallback } from "react";
import { Link, Mail, Phone, Clock, Loader as Loader2, RefreshCw, CircleAlert as AlertCircle, Eye, BarChart3 } from "lucide-react";
import Card from "../components/Card";
import { listClientsWithStats, listServiceRequests, updateServiceRequestStatus, ServiceRequestStatus } from "../../../../lib/supabase/operations";
import type { Database } from "../../../../lib/supabase/database.types";
import { supabase } from "../../../../lib/supabase/client";
import ClientDetailModal from "../components/ClientDetailModal";
import RequestDetailModal from "../components/RequestDetailModal";
import { mapRequestsToDisplay, calculateClientStats } from "../../../../utils/client-sync.utils";
import type { ClientProfile, ServiceRequestDisplay } from "../../../../types/client-sync.types";

// Define complex types locally for the component
type ClientRow = Database['public']['Tables']['clients']['Row'];
type ServiceRequestJoined = Database['public']['Tables']['service_requests']['Row'] & {
  clients: { full_name: string | null; email: string | null } | null;
};

const statusColorMap: Record<ServiceRequestStatus, string> = {
  requested: 'bg-amber-100 text-amber-800 ring-amber-200',
  confirmed: 'bg-blue-100 text-blue-800 ring-blue-200',
  in_progress: 'bg-indigo-100 text-indigo-800 ring-indigo-200',
  completed: 'bg-green-100 text-green-800 ring-green-200',
  cancelled: 'bg-red-100 text-red-800 ring-red-200',
  pending: 'bg-gray-100 text-gray-800 ring-gray-200',
};

const statusOptions: ServiceRequestStatus[] = ['requested', 'confirmed', 'in_progress', 'completed', 'cancelled'];


const ClientsTab: React.FC = () => {
  const [clients, setClients] = useState<ClientRow[]>([]);
  const [requests, setRequests] = useState<ServiceRequestJoined[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<ServiceRequestStatus | "All">("requested");
  const [searchTerm, setSearchTerm] = useState("");
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [selectedClient, setSelectedClient] = useState<ClientRow | null>(null);
  const [selectedRequest, setSelectedRequest] = useState<ServiceRequestDisplay | null>(null);
  const [viewMode, setViewMode] = useState<'table' | 'kanban'>('table');

  // @ts-expect-error - Mock service request data doesn't fully match database schema
  const displayRequests = useMemo(() => mapRequestsToDisplay(requests), [requests]);

  const filteredRequests = useMemo(() => {
    return displayRequests.filter(req => {
      const statusMatch = filterStatus === "All" || req.status === filterStatus;
      const searchMatch = !searchTerm ||
        req.clients?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        req.clients?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        req.project_title?.toLowerCase().includes(searchTerm.toLowerCase());
      return statusMatch && searchMatch;
    });
  }, [displayRequests, filterStatus, searchTerm]);


  const fetchData = useCallback(async () => {
    setError(null);
    const [clientsResult, requestsResult] = await Promise.all([listClientsWithStats(), listServiceRequests()]);
    
    if (clientsResult.error || requestsResult.error) {
      setError("Failed to fetch client or request data.");
      console.error(clientsResult.error || requestsResult.error);
    } else {
      setClients(clientsResult.data || []);
      setRequests(requestsResult.data || []);
    }
    setLoading(false);
  }, []);
  
  // Realtime subscription and initial fetch
  useEffect(() => {
    fetchData();
    
    const channel = supabase.channel('service_requests_admin_view')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'service_requests' },
        (payload) => {
          // Refetch both lists to update counts and the request list itself
          fetchData(); 
        }
      )
      .subscribe();
      
    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchData]);
  
  
  const handleStatusUpdate = async (request: ServiceRequestJoined, newStatus: ServiceRequestStatus) => {
    setIsUpdatingStatus(true);
    const originalStatus = request.status;
    
    // Optimistic Update
    setRequests(prev => prev.map(r => r.id === request.id ? { ...r, status: newStatus } : r));
    
    const { error: updateError } = await updateServiceRequestStatus(request.id, newStatus);
    
    if (updateError) {
      setError(`Failed to update status for ${request.project_title}.`);
      // Revert on failure
      setRequests(prev => prev.map(r => r.id === request.id ? { ...r, status: originalStatus } : r));
    }
    setIsUpdatingStatus(false);
  };


  if (loading) {
    return <div className="flex justify-center py-20"><Loader2 className="w-10 h-10 animate-spin text-gray-400" /></div>;
  }
  
  if (error) {
    return <div className="text-center py-20 text-red-600 flex flex-col items-center gap-3"><AlertCircle className="w-6 h-6" />{error}</div>;
  }


  return (
    <div className="space-y-6">
      
      {/* --- CLIENTS TABLE --- */}
      <Card title={`Client List (${clients.length})`}>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
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
                const clientRequests = requests.filter(r => r.client_id === c.id);
                return (
                  <tr key={c.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 font-medium text-gray-800">{c.full_name || 'N/A'}</td>
                    <td className="px-4 py-3 text-gray-600 space-y-1">
                        <div className="flex items-center gap-1"><Mail size={14} className="text-gray-400"/> {c.email}</div>
                        {c.phone && <div className="flex items-center gap-1"><Phone size={14} className="text-gray-400"/> {c.phone}</div>}
                    </td>
                    <td className="px-4 py-3 text-gray-600">{c.tier}</td>
                    <td className="px-4 py-3 text-gray-600">{clientRequests.length}</td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => setSelectedClient(c)}
                        className="rounded-md border bg-white px-3 py-1.5 font-medium hover:bg-gray-100 transition-colors flex items-center gap-1"
                      >
                        <Eye size={14} />
                        View Profile
                      </button>
                    </td>
                  </tr>
                )})}
            </tbody>
          </table>
          {clients.length === 0 && <p className="py-8 text-center text-gray-500">No client profiles found.</p>}
        </div>
      </Card>
      
      {/* --- SERVICE REQUESTS LIST --- */}
      <Card title="Client Service Requests" right={
        <div className="flex items-center gap-3">
          <div className="flex items-center rounded-md bg-gray-100 p-1">
            <button
              onClick={() => setViewMode('table')}
              className={`px-3 py-1 text-xs rounded ${viewMode === 'table' ? 'bg-white shadow-sm font-semibold' : ''}`}
            >
              Table
            </button>
            <button
              onClick={() => setViewMode('kanban')}
              className={`px-3 py-1 text-xs rounded ${viewMode === 'kanban' ? 'bg-white shadow-sm font-semibold' : ''}`}
            >
              Kanban
            </button>
          </div>
          <input 
            type="text" 
            value={searchTerm} 
            onChange={(e) => setSearchTerm(e.target.value)} 
            placeholder="Search request/client..." 
            className="w-48 rounded-md border px-3 py-1.5 text-sm"
          />
          <select 
            value={filterStatus} 
            onChange={(e) => setFilterStatus(e.target.value as any)} 
            className="rounded-md border px-3 py-1.5 text-sm appearance-none bg-white"
          >
            <option value="All">All Statuses</option>
            {statusOptions.map(s => <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>)}
          </select>
          <button onClick={fetchData} disabled={loading} className="p-1.5 rounded-full hover:bg-gray-100 disabled:opacity-50" title="Refresh">
              <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>
      }>
        {viewMode === 'table' ? (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
            <thead className="bg-gray-50">
              <tr className="text-left text-gray-600">
                <th className="px-4 py-2 font-semibold">Client</th>
                <th className="px-4 py-2 font-semibold">Service/Project</th>
                <th className="px-4 py-2 font-semibold">Requested At</th>
                <th className="px-4 py-2 font-semibold text-center">Status</th>
                <th className="px-4 py-2 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredRequests.map((r) => (
                <tr key={r.id} className="hover:bg-gray-50 transition-colors cursor-pointer" onClick={() => setSelectedRequest(r)}>
                  <td className="px-4 py-3 font-medium text-gray-800">
                    {r.clients?.full_name || r.clients?.email || 'Unknown Client'}
                    <span className="block text-xs text-gray-500">{r.clients?.email}</span>
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    <span className="font-semibold">{r.project_title || 'N/A'}</span>
                    <span className="block text-xs text-gray-500 capitalize">{r.service_key.replace(/_/g, ' ')}</span>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{new Date(r.requested_at).toLocaleString()}</td>
                  <td className="px-4 py-3 text-center">
                    <span className={`inline-block rounded-full px-3 py-1 text-xs font-semibold capitalize ring-1 ring-inset ${statusColorMap[r.status]}`}>
                      {r.status.replace(/_/g, ' ')}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center gap-2 justify-end">
                      <select
                        value={r.status}
                        onChange={(e) => handleStatusUpdate(requests.find(req => req.id === r.id)!, e.target.value as ServiceRequestStatus)}
                        disabled={isUpdatingStatus}
                        className="rounded-md border px-2 py-1 text-xs appearance-none focus:ring-2 focus:ring-[#FF5722] disabled:opacity-70"
                      >
                        {statusOptions.map(s => <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>)}
                      </select>
                      <button
                        onClick={() => setSelectedRequest(r)}
                        className="p-1 hover:bg-gray-100 rounded"
                      >
                        <Eye size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredRequests.length === 0 && (
                <tr><td className="px-4 py-10 text-center text-gray-500" colSpan={5}>No requests match the current filter.</td></tr>
              )}
            </tbody>
            </table>
          </div>
        ) : (
          <KanbanView requests={filteredRequests} onRequestClick={setSelectedRequest} />
        )}
      </Card>

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
              handleStatusUpdate(originalRequest, newStatus);
            }
          }}
        />
      )}
    </div>
  );
};

const KanbanView: React.FC<{ requests: ServiceRequestDisplay[]; onRequestClick: (req: ServiceRequestDisplay) => void }> = ({ requests, onRequestClick }) => {
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
          <div key={col.status} className={`border-2 rounded-lg p-4 ${col.color} min-h-[400px]`}>
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-bold text-gray-900">{col.label}</h4>
              <span className="bg-white px-2 py-1 rounded-full text-xs font-semibold">{columnRequests.length}</span>
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
                    <span className="text-gray-600">{req.clients?.full_name || 'Unknown'}</span>
                    <span className="text-gray-400">{new Date(req.requested_at).toLocaleDateString()}</span>
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