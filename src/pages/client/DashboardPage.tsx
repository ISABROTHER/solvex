// @ts-nocheck
import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { PlusCircle, FileText, CheckCircle, Clock, XCircle, Loader2 } from 'lucide-react';
import { useAuth } from '../../features/auth/AuthProvider'; // <-- CORRECTED IMPORT
// Assuming you have functions to fetch client-specific data
// import { getClientRequests, getClientProfile } from '../../lib/supabase/operations'; // Example imports

// Mock data (replace with actual data fetching)
import { useClientMock } from './useClientMock'; // Using mock hook for now
import StatusBadge from './StatusBadge';
import { ServiceRequestStatus } from '../../types/client-sync.types'; // Assuming type exists


// Type for dashboard requests (simplified)
type DashboardRequest = {
  id: string;
  project_title: string;
  service_key: string;
  status: ServiceRequestStatus;
  requested_at: string;
};

const DashboardPage: React.FC = () => {
  const { user } = useAuth(); // Get user info
  // const [requests, setRequests] = useState<DashboardRequest[]>([]);
  // const [loading, setLoading] = useState(true);
  // const [error, setError] = useState<string | null>(null);

  // --- Using Mock Data ---
  const { requests, loading, error, clientName } = useClientMock(); // Replace with real fetching
  // --- End Mock Data ---

  /*
  // --- Example Real Data Fetching (implement in operations.ts) ---
  useEffect(() => {
    const fetchData = async () => {
      if (!user?.id) return; // Wait for user info

      setLoading(true);
      setError(null);
      try {
        // Fetch client requests (implement getClientRequests in operations.ts)
        const { data: requestData, error: requestError } = await getClientRequests(user.id);
        if (requestError) throw requestError;
        setRequests(requestData || []);

        // Fetch client name (implement getClientProfile in operations.ts)
        // const { data: profileData, error: profileError } = await getClientProfile(user.id);
        // if (profileError) throw profileError;
        // setClientName(profileData?.first_name || user.email);

      } catch (err: any) {
        console.error("Error fetching client dashboard data:", err);
        setError(err.message || "Failed to load data.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user]); // Refetch if user changes
  */
  // --- End Real Data Fetching Example ---


  const recentRequests = useMemo(() => {
    return requests
      .sort((a, b) => new Date(b.requested_at).getTime() - new Date(a.requested_at).getTime())
      .slice(0, 5); // Show latest 5
  }, [requests]);

  const requestStats = useMemo(() => {
    return requests.reduce((acc, req) => {
      acc[req.status] = (acc[req.status] || 0) + 1;
      return acc;
    }, {} as Record<ServiceRequestStatus, number>);
  }, [requests]);

  const getIconForStatus = (status: ServiceRequestStatus) => {
    switch (status) {
      case 'completed': return <CheckCircle className="text-green-500" size={18} />;
      case 'in_progress':
      case 'confirmed': return <Clock className="text-blue-500" size={18} />;
      case 'cancelled': return <XCircle className="text-red-500" size={18} />;
      case 'requested':
      default: return <FileText className="text-amber-500" size={18} />;
    }
  };


  return (
    <div className="container mx-auto px-4 py-8">
      {/* Welcome Header */}
      <div className="mb-8 p-6 bg-gradient-to-r from-[#ff8a65] to-[#FF5722] rounded-lg shadow text-white">
        <h1 className="text-3xl font-bold mb-1">Welcome back, {clientName || user?.email}!</h1>
        <p className="text-orange-100">Here's a quick overview of your recent activity.</p>
      </div>

       {/* Loading and Error States */}
       {loading && (
         <div className="flex justify-center items-center py-20">
             <Loader2 className="h-10 w-10 animate-spin text-gray-400" />
         </div>
       )}
       {error && !loading && (
         <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative mb-6" role="alert">
             <strong className="font-bold">Error:</strong>
             <span className="block sm:inline ml-2">{error}</span>
         </div>
       )}


      {!loading && !error && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

          {/* Left Column: Quick Stats & New Request */}
          <div className="md:col-span-1 space-y-6">
            {/* Quick Stats */}
            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-lg font-semibold mb-4 text-gray-700">Request Summary</h2>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Requested:</span>
                  <span className="font-medium text-amber-600">{requestStats.requested || 0}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Confirmed/In Progress:</span>
                  <span className="font-medium text-blue-600">{(requestStats.confirmed || 0) + (requestStats.in_progress || 0)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Completed:</span>
                  <span className="font-medium text-green-600">{requestStats.completed || 0}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Cancelled:</span>
                  <span className="font-medium text-red-600">{requestStats.cancelled || 0}</span>
                </div>
              </div>
            </div>

            {/* New Request Button */}
            <Link
              to="/client/requests/new"
              className="block w-full text-center bg-[#FF5722] text-white font-semibold py-3 px-4 rounded-lg shadow hover:bg-[#E64A19] transition-colors flex items-center justify-center gap-2"
            >
              <PlusCircle size={20} />
              Submit New Request
            </Link>
          </div>

          {/* Right Column: Recent Requests */}
          <div className="md:col-span-2 bg-white p-6 rounded-lg shadow">
            <div className="flex justify-between items-center mb-4">
               <h2 className="text-lg font-semibold text-gray-700">Recent Requests</h2>
               <Link to="/client/requests" className="text-sm text-[#FF5722] hover:underline">View All</Link>
            </div>

            {recentRequests.length > 0 ? (
                <ul className="divide-y divide-gray-200">
                {recentRequests.map((req) => (
                  <li key={req.id} className="py-3 flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                       {getIconForStatus(req.status)}
                      <div>
                        <Link to={`/client/requests/${req.id}`} className="text-sm font-medium text-gray-800 hover:text-[#FF5722] hover:underline block truncate max-w-xs">
                          {req.project_title || req.service_key.replace(/_/g, ' ')}
                        </Link>
                        <p className="text-xs text-gray-500">
                          Requested on {new Date(req.requested_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <StatusBadge status={req.status} />
                  </li>
                ))}
              </ul>
            ) : (
                <p className="text-center text-gray-500 py-8">You haven't submitted any requests yet.</p>
            )}

          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardPage;