// src/pages/admin/DashboardPage/tabs/ClientsTab.tsx
import React, { useState, useEffect, useMemo } from 'react';
import { supabase } from '../../../../lib/supabase/client';
import { useAuth } from '../../../../features/auth/AuthProvider'; // Changed import
import { useToast } from '../../../../contexts/ToastContext';
import { Loader2, CheckCircle, XCircle, Users, Clock, Search, Eye } from 'lucide-react';
import ClientDetailModal from '../components/ClientDetailModal';
import { Database } from '../../../../lib/supabase/database.types'; // Import main db types

// Define the Client Profile type based on our profiles table
type ClientProfile = Database['public']['Tables']['profiles']['Row'];

// Type for the modal state
type ModalState = {
  isOpen: boolean;
  client: ClientProfile | null;
};

// New Status Badge component
const StatusBadge: React.FC<{ status: string | null }> = ({ status }) => {
  let bgColor, textColor, text;
  switch (status) {
    case 'approved':
      bgColor = 'bg-green-100';
      textColor = 'text-green-700';
      text = 'Approved';
      break;
    case 'denied':
      bgColor = 'bg-red-100';
      textColor = 'text-red-700';
      text = 'Denied';
      break;
    case 'pending':
    default:
      bgColor = 'bg-yellow-100';
      textColor = 'text-yellow-700';
      text = 'Pending';
      break;
  }
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${bgColor} ${textColor}`}>
      {text}
    </span>
  );
};

const ClientsTab: React.FC = () => {
  const { addToast } = useToast();
  const { user } = useAuth(); // Get admin user if needed

  const [clients, setClients] = useState<ClientProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'approved' | 'denied'>('all');
  
  // State for managing which client is being updated (for loading spinners)
  const [updatingClientId, setUpdatingClientId] = useState<string | null>(null);

  // Modal state
  const [modal, setModal] = useState<ModalState>({ isOpen: false, client: null });

  // Fetch all client profiles
  const fetchClients = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const { data, error: fetchError } = await supabase
        .from('profiles')
        .select('*')
        .eq('role', 'client') // Only fetch clients
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;
      setClients(data || []);
    } catch (err: any) {
      setError(err.message);
      addToast({ type: 'error', title: 'Error fetching clients', message: err.message });
    } finally {
      setIsLoading(false);
    }
  };

  // Initial fetch on component mount
  useEffect(() => {
    fetchClients();
  }, []);

  // Set up Supabase real-time subscription
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel('public:profiles:role=client')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'profiles',
          filter: `role=eq.client`,
        },
        (payload) => {
          console.log('Real-time update received:', payload);
          // Smartly update the local state
          setClients(currentClients => {
            const newRecord = payload.new as any as ClientProfile;
            const oldRecordId = (payload.old as any)?.id;

            if (payload.eventType === 'INSERT') {
              // Add new client to the top of the list
              return [newRecord, ...currentClients];
            }
            if (payload.eventType === 'UPDATE') {
              // Find and replace updated client
              return currentClients.map(client =>
                client.id === newRecord.id ? newRecord : client
              );
            }
            if (payload.eventType === 'DELETE') {
              // Remove deleted client
              return currentClients.filter(client => client.id !== oldRecordId);
            }
            return currentClients; // No change
          });
        }
      )
      .subscribe((status, err) => {
        if (status === 'SUBSCRIBED') {
          console.log('Subscribed to client profiles channel');
        }
        if (status === 'CHANNEL_ERROR' && err) {
           console.error('Subscription error:', err);
           addToast({ type: 'error', title: 'Real-time Error', message: err.message });
        }
      });

    // Cleanup function to remove subscription
    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, addToast]);

  // Handle client approval
  const handleUpdateStatus = async (clientId: string, newStatus: 'approved' | 'denied') => {
    setUpdatingClientId(clientId);
    try {
      const { error: updateError } = await (supabase
        .from('profiles')
        .update as any)({
          approval_status: newStatus,
        })
        .eq('id', clientId);

      if (updateError) throw updateError;

      addToast({
        type: 'success',
        title: `Client ${newStatus}`,
        message: `The client's access status has been updated.`,
      });
    } catch (err: any) {
      addToast({ type: 'error', title: 'Update Failed', message: err.message });
    } finally {
      setUpdatingClientId(null);
    }
    // Note: No need to manually update state, the real-time subscription will catch the change
  };
  
  // Memoized, filtered list of clients
  const filteredClients = useMemo(() => {
    return clients
      .filter(client => {
        // Status filter
        if (statusFilter !== 'all' && client.approval_status !== statusFilter) {
          return false;
        }
        // Search filter
        if (searchTerm) {
          const fullName = `${client.first_name || ''} ${client.last_name || ''}`.toLowerCase();
          const email = client.email?.toLowerCase() || '';
          const search = searchTerm.toLowerCase();
          return fullName.includes(search) || email.includes(search);
        }
        return true; // Pass if no search term
      });
  }, [clients, searchTerm, statusFilter]);
  
  // Count of pending clients for the tab badge
  const pendingCount = useMemo(() => {
    return clients.filter(c => c.approval_status === 'pending').length;
  }, [clients]);

  // Handle opening the detail modal
  const openModal = (client: ClientProfile) => {
    setModal({ isOpen: true, client });
  };
  
  // Render function for the table body
  const renderTableBody = () => {
    if (isLoading) {
      return (
        <tr>
          <td colSpan={6} className="text-center p-6">
            <Loader2 className="h-6 w-6 animate-spin mx-auto text-gray-400" />
            <p className="text-sm text-gray-500 mt-2">Loading client data...</p>
          </td>
        </tr>
      );
    }

    if (error) {
      return (
        <tr>
          <td colSpan={6} className="text-center p-6">
            <XCircle className="h-6 w-6 mx-auto text-red-500" />
            <p className="text-sm text-red-600 mt-2">Error: {error}</p>
          </td>
        </tr>
      );
    }

    if (filteredClients.length === 0) {
      return (
        <tr>
          <td colSpan={6} className="text-center p-6">
            <Users className="h-6 w-6 mx-auto text-gray-400" />
            <p className="text-sm text-gray-500 mt-2">No clients found matching your criteria.</p>
          </td>
        </tr>
      );
    }
    
    return filteredClients.map(client => {
      const isUpdating = updatingClientId === client.id;
      return (
        <tr key={client.id} className="hover:bg-gray-50 transition-colors">
          {/* Client Name & Email */}
          <td className="whitespace-nowrap px-6 py-4">
            <div className="flex items-center">
              <div className="h-10 w-10 flex-shrink-0">
                <img
                  className="h-10 w-10 rounded-full object-cover"
                  src={client.avatar_url || `https://ui-avatars.com/api/?name=${client.first_name}+${client.last_name}&background=random`}
                  alt={`${client.first_name} ${client.last_name}`}
                />
              </div>
              <div className="ml-4">
                <div className="text-sm font-medium text-gray-900">{client.first_name} {client.last_name}</div>
                <div className="text-sm text-gray-500">{client.email}</div>
              </div>
            </div>
          </td>
          
          {/* Reason for Access */}
          <td className="px-6 py-4">
            <p className="text-sm text-gray-700 max-w-xs truncate" title={client.reason_for_access || ''}>
              {client.reason_for_access || <span className="text-gray-400 italic">No message</span>}
            </p>
          </td>
          
          {/* Status */}
          <td className="whitespace-nowrap px-6 py-4">
            <StatusBadge status={client.approval_status} />
          </td>
          
          {/* Joined Date */}
          <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
            {new Date(client.created_at || '').toLocaleDateString()}
          </td>
          
          {/* Actions */}
          <td className="whitespace-nowrap px-6 py-4 text-sm font-medium">
            {client.approval_status === 'pending' ? (
              <div className="flex gap-2">
                <button
                  onClick={() => handleUpdateStatus(client.id, 'approved')}
                  disabled={isUpdating}
                  className="inline-flex items-center gap-1 rounded-md bg-green-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-green-700 disabled:opacity-50"
                >
                  {isUpdating ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle className="h-4 w-4" />}
                  Approve
                </button>
                <button
                  onClick={() => handleUpdateStatus(client.id, 'denied')}
                  disabled={isUpdating}
                  className="inline-flex items-center gap-1 rounded-md bg-red-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-red-700 disabled:opacity-50"
                >
                  {isUpdating ? <Loader2 className="h-4 w-4 animate-spin" /> : <XCircle className="h-4 w-4" />}
                  Deny
                </button>
              </div>
            ) : (
              <button
                onClick={() => openModal(client)}
                className="text-indigo-600 hover:text-indigo-900 inline-flex items-center gap-1 text-xs"
              >
                <Eye className="h-4 w-4" /> View Details
              </button>
            )}
          </td>
        </tr>
      );
    });
  };

  return (
    <div>
      <h2 className="text-2xl font-semibold text-gray-900 mb-4">Client Management</h2>
      
      {/* Filters and Search */}
      <div className="flex flex-col sm:flex-row gap-4 mb-4">
        {/* Search Input */}
        <div className="relative flex-grow">
          <input
            type="text"
            placeholder="Search by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
        </div>
        
        {/* Status Filter */}
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as 'all' | 'pending' | 'approved' | 'denied')}
          className="border rounded-lg shadow-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="all">All Statuses</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="denied">Denied</option>
        </select>
      </div>

      {/* Client Table */}
      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Client
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Reason for Access
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Joined
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {renderTableBody()}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* Client Detail Modal - Temporarily disabled due to type mismatch */}
      {/* {modal.isOpen && modal.client && (
        <ClientDetailModal
          client={modal.client}
          isOpen={modal.isOpen}
          onClose={() => setModal({ isOpen: false, client: null })}
        />
      )} */}
      
      {/* Inform admin of pending count */}
      {pendingCount > 0 && (
         <div className="fixed bottom-6 right-6 z-50">
           <div className="flex items-center gap-3 bg-yellow-600 text-white font-semibold px-5 py-3 rounded-lg shadow-lg">
             <Clock className="h-5 w-5" />
             <span>{pendingCount} client(s) awaiting approval</span>
           </div>
         </div>
      )}
    </div>
  );
};

export default ClientsTab;