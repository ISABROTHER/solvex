// src/pages/admin/DashboardPage/tabs/ClientsTab.tsx
// @ts-nocheck
import React, { useState, useEffect, useMemo, useCallback } from "react";
// ... other imports ...
import { RefreshCw, Loader2, AlertCircle, Eye, BarChart3, Search } from "lucide-react"; // Added Search
import Card from "../components/Card";
// ... other imports ...

const ClientsTab: React.FC = () => {
  // ... state variables ...
  const [filterStatus, setFilterStatus] = useState<ServiceRequestStatus | "All">("requested"); // Keep filter state
  const [searchTerm, setSearchTerm] = useState(""); // Keep search state
  const [viewMode, setViewMode] = useState<'table' | 'kanban'>('table'); // Keep view mode state
  const [loadingServiceRequests, setLoadingServiceRequests] = useState(true); // Keep loading state

  // ... other hooks and functions (displayRequests, filteredRequests, fetchData, handlers) ...


  // --- Render ---
  return (
    <div className="space-y-6">

       {/* --- Access Requests Section --- */}
       {/* ... Access Requests Card ... */}

      {/* --- Existing CLIENTS TABLE --- */}
      {/* ... Clients Card ... */}


      {/* --- Existing SERVICE REQUESTS LIST --- */}
       {/* FIX: Replaced comment with actual JSX for the filter UI */}
       <Card
          title="All Service Requests"
          right={
            <div className="flex items-center gap-3">
              {/* View Mode Toggle */}
              <div className="flex items-center rounded-md bg-gray-100 p-1">
                <button
                  onClick={() => setViewMode('table')}
                  className={`px-3 py-1 text-xs rounded ${viewMode === 'table' ? 'bg-white shadow-sm font-semibold' : 'text-gray-500 hover:text-gray-700'}`}
                  aria-pressed={viewMode === 'table'}
                >
                  Table
                </button>
                <button
                  onClick={() => setViewMode('kanban')}
                  className={`px-3 py-1 text-xs rounded ${viewMode === 'kanban' ? 'bg-white shadow-sm font-semibold' : 'text-gray-500 hover:text-gray-700'}`}
                  aria-pressed={viewMode === 'kanban'}
                >
                  Kanban
                </button>
              </div>
              {/* Search Input */}
              <div className="relative">
                 <Search className="absolute left-2.5 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                 <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search..."
                    className="w-48 rounded-md border border-gray-300 pl-8 pr-3 py-1.5 text-sm focus:ring-1 focus:ring-[#FF5722] focus:border-[#FF5722]"
                 />
              </div>
              {/* Status Filter Dropdown */}
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as any)}
                className="rounded-md border border-gray-300 px-3 py-1.5 text-sm appearance-none bg-white focus:ring-1 focus:ring-[#FF5722] focus:border-[#FF5722]"
              >
                <option value="All">All Statuses</option>
                {/* Dynamically generate options if needed, ensure statusOptions is defined */}
                {['requested', 'confirmed', 'in_progress', 'completed', 'cancelled'].map(s =>
                    <option key={s} value={s}>{s.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</option>)}
              </select>
              {/* Refresh Button */}
              <button onClick={fetchData} disabled={loadingServiceRequests || loadingClients || loadingAccessRequests} className="p-1.5 rounded-full hover:bg-gray-100 disabled:opacity-50" title="Refresh All Data">
                  <RefreshCw size={18} className={(loadingServiceRequests || loadingClients || loadingAccessRequests) ? 'animate-spin' : ''} />
              </button>
            </div>
          }
        >
         {loadingServiceRequests ? (
             <div className="flex justify-center py-10"><Loader2 className="w-6 h-6 animate-spin text-gray-400" /></div>
         ) : error && !requests.length ? (
              <div className="text-center py-10 text-red-600 flex flex-col items-center gap-3"><AlertCircle className="w-6 h-6" />{error.includes("service requests") ? error : "Failed to load service requests."}</div>
         ) : (
            viewMode === 'table' ? (
                <div className="overflow-x-auto">
                    {/* ... Service request table JSX ... */}
                     <table className="min-w-full text-sm">
                         <thead className="bg-gray-50 border-b">
                          <tr className="text-left text-gray-600">
                            <th className="px-4 py-2 font-semibold">Client</th>
                            {/* --- MODIFICATION: Hidden on mobile --- */}
                            <th className="px-4 py-2 font-semibold hidden md:table-cell">Service/Project</th>
                            <th className="px-4 py-2 font-semibold hidden md:table-cell">Requested At</th>
                            {/* --- END MODIFICATION --- */}
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
                                    {/* --- MODIFICATION: Hidden on mobile --- */}
                                    <td className="px-4 py-3 text-gray-600 hidden md:table-cell">
                                      <span className="font-semibold">{r.project_title || 'N/A'}</span>
                                      <span className="block text-xs text-gray-500 capitalize">{r.service_key.replace(/_/g, ' ')}</span>
                                    </td>
                                     <td className="px-4 py-3 text-gray-600 hidden md:table-cell">{new Date(r.requested_at).toLocaleString()}</td>
                                    {/* --- END MODIFICATION --- */}
                                     <td className="px-4 py-3 text-center">
                                       <span className={`inline-block rounded-full px-3 py-1 text-xs font-semibold capitalize ring-1 ring-inset ${statusColorMap[r.status]}`}>
                                         {r.status.replace(/_/g, ' ')}
                                       </span>
                                     </td>
                                    <td className="px-4 py-3 text-right" onClick={(e) => e.stopPropagation()}>
                                        <div className="flex items-center gap-2 justify-end">
                                            <select
                                                value={r.status}
                                                // Ensure you have the 'requests' state available here
                                                onChange={(e) => handleServiceRequestStatusUpdate(requests.find(req => req.id === r.id)!, e.target.value as ServiceRequestStatus)}
                                                disabled={isUpdatingStatus === r.id}
                                                className="rounded-md border border-gray-300 px-2 py-1 text-xs appearance-none focus:ring-1 focus:ring-[#FF5722] disabled:opacity-70 bg-white"
                                            >
                                                {/* Ensure statusOptions is defined */}
                                                {['requested', 'confirmed', 'in_progress', 'completed', 'cancelled'].map(s => <option key={s} value={s}>{s.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</option>)}
                                            </select>
                                            <button
                                              onClick={() => setSelectedRequest(r)}
                                              className="p-1 hover:bg-gray-100 rounded"
                                              title="View Details"
                                            >
                                              <Eye size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                             {filteredRequests.length === 0 && (
                                <tr><td className="px-4 py-10 text-center text-gray-500" colSpan={5}>No requests match filters.</td></tr>
                              )}
                         </tbody>
                    </table>
                </div>
            ) : (
                <KanbanView requests={filteredRequests} onRequestClick={setSelectedRequest} />
            )
         )}
       </Card>

      {/* --- Modals --- */}
      {/* ... Modals JSX ... */}

    </div>
  );
};

// KanbanView component remains the same
// ...

export default ClientsTab;