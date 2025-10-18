// src/pages/admin/DashboardPage/components/ClientDetailModal.tsx

import React, { useState, useMemo } from 'react';
// Added Banknote icon
import { X, User, Mail, Phone, Building2, Award, Clock, TrendingUp, FileText, MessageSquare, Settings, Banknote } from 'lucide-react';
import { ClientProfile, ServiceRequestDisplay, ClientStats, statusColorMap } from '../../../../types/client-sync.types'; // Make sure Banknote is imported or add it

// --- (Keep existing imports and interfaces) ---

// Define the PayoutsTab placeholder component
const PayoutsTab: React.FC<{ clientId: string; clientName: string | null }> = ({ clientId, clientName }) => {
  // In a real implementation, you would fetch payout data here based on clientId
  // const { data: payouts, isLoading, error } = useFetchPayouts(clientId);

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
         <h3 className="text-lg font-bold text-gray-900">Payouts for {clientName || 'this Client'}</h3>
         {/* Placeholder button - Needs backend function */}
         <button className="bg-green-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed w-full sm:w-auto" disabled>
           Initiate New Payout
         </button>
      </div>
       {/* Placeholder for payout list/table */}
       <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center text-gray-500 min-h-[200px] flex flex-col justify-center">
          <Banknote size={32} className="mx-auto text-gray-400 mb-3" />
          <p className="font-medium">Payout History & Management</p>
          <p className="text-xs mt-1">
            (Requires database schema changes and backend functions for payout processing)
          </p>
          {/* Example structure */}
          {/* <ul className="mt-4 text-left divide-y"> ... payout items ... </ul> */}
       </div>
    </div>
  );
};


// Updated ClientDetailModal Component
const ClientDetailModal: React.FC<ClientDetailModalProps> = ({ client, requests, stats, onClose }) => {
  // Updated TabType to include 'payouts'
  type TabType = 'overview' | 'requests' | 'messages' | 'payouts' | 'settings';
  const [activeTab, setActiveTab] = useState<TabType>('overview');

  // Added 'payouts' to the tabs array
  const tabs: { id: TabType; label: string; icon: React.ReactNode }[] = [
    { id: 'overview', label: 'Overview', icon: <User size={16} /> },
    { id: 'requests', label: 'Requests', icon: <FileText size={16} /> },
    { id: 'messages', label: 'Messages', icon: <MessageSquare size={16} /> },
    { id: 'payouts', label: 'Payouts', icon: <Banknote size={16} /> }, // Added Payouts tab
    { id: 'settings', label: 'Settings', icon: <Settings size={16} /> },
  ];

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">

        {/* --- Header (No changes needed) --- */}
        <div className="bg-gradient-to-r from-[#FF5722] to-[#C10100] text-white p-6 flex justify-between items-start">
          {/* ... existing header code ... */}
           <div>
            <h2 className="text-2xl font-bold">{client.full_name || 'Unnamed Client'}</h2>
            <p className="text-white/90 text-sm mt-1">{client.email}</p>
            <div className="flex items-center gap-4 mt-3 text-sm">
              <span className="flex items-center gap-1">
                <Award size={14} />
                {client.tier} Tier
              </span>
              {client.company && (
                <span className="flex items-center gap-1">
                  <Building2 size={14} />
                  {client.company}
                </span>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/20 rounded-full transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* --- Tabs Navigation (No changes needed) --- */}
        <div className="border-b border-gray-200">
          <div className="flex flex-wrap sm:flex-nowrap overflow-x-auto"> {/* Added flex-wrap and overflow */}
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-shrink-0 flex items-center gap-2 px-4 sm:px-6 py-4 font-medium text-sm transition-colors border-b-2 whitespace-nowrap ${ // Added flex-shrink-0 and whitespace-nowrap
                  activeTab === tab.id
                    ? 'border-[#FF5722] text-[#FF5722]'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* --- Content Area --- */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Conditional Rendering Updated */}
          {activeTab === 'overview' && <OverviewTab client={client} stats={stats} requests={requests} />}
          {activeTab === 'requests' && <RequestsTab requests={requests} />}
          {activeTab === 'messages' && <MessagesTab clientId={client.id} />}
          {activeTab === 'payouts' && <PayoutsTab clientId={client.id} clientName={client.full_name} />} {/* Render PayoutsTab */}
          {activeTab === 'settings' && <SettingsTab client={client} />}
        </div>
      </div>
    </div>
  );
};

// --- (Keep existing OverviewTab, RequestsTab, MessagesTab, SettingsTab components) ---
// Note: Make sure the existing tab components (OverviewTab, RequestsTab, etc.) are defined in this file or imported correctly. I'm assuming they exist based on previous context.
// --- Example Stubs if they are not in this file ---
const OverviewTab: React.FC<{ client: ClientProfile; stats: ClientStats; requests: ServiceRequestDisplay[] }> = ({ client, stats, requests }) => <div>Overview Content Placeholder</div>;
const RequestsTab: React.FC<{ requests: ServiceRequestDisplay[] }> = ({ requests }) => <div>Requests Content Placeholder</div>;
const MessagesTab: React.FC<{ clientId: string }> = ({ clientId }) => <div>Messages Content Placeholder</div>;
const SettingsTab: React.FC<{ client: ClientProfile }> = ({ client }) => <div>Settings Content Placeholder</div>;
// --- End Example Stubs ---


export default ClientDetailModal;