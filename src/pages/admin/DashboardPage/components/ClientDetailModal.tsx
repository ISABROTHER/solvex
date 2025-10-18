import React, { useState, useMemo } from 'react';
import { X, User, Mail, Phone, Building2, Award, Clock, TrendingUp, FileText, MessageSquare, Settings } from 'lucide-react';
import { ClientProfile, ServiceRequestDisplay, ClientStats, statusColorMap } from '../../../../types/client-sync.types';

interface ClientDetailModalProps {
  client: ClientProfile;
  requests: ServiceRequestDisplay[];
  stats: ClientStats;
  onClose: () => void;
}

type TabType = 'overview' | 'requests' | 'messages' | 'settings';

const ClientDetailModal: React.FC<ClientDetailModalProps> = ({ client, requests, stats, onClose }) => {
  const [activeTab, setActiveTab] = useState<TabType>('overview');

  const tabs: { id: TabType; label: string; icon: React.ReactNode }[] = [
    { id: 'overview', label: 'Overview', icon: <User size={16} /> },
    { id: 'requests', label: 'Requests', icon: <FileText size={16} /> },
    { id: 'messages', label: 'Messages', icon: <MessageSquare size={16} /> },
    { id: 'settings', label: 'Settings', icon: <Settings size={16} /> },
  ];

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">

        <div className="bg-gradient-to-r from-[#FF5722] to-[#C10100] text-white p-6 flex justify-between items-start">
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

        <div className="border-b border-gray-200">
          <div className="flex">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-6 py-4 font-medium text-sm transition-colors border-b-2 ${
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

        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === 'overview' && <OverviewTab client={client} stats={stats} requests={requests} />}
          {activeTab === 'requests' && <RequestsTab requests={requests} />}
          {activeTab === 'messages' && <MessagesTab clientId={client.id} />}
          {activeTab === 'settings' && <SettingsTab client={client} />}
        </div>
      </div>
    </div>
  );
};

const OverviewTab: React.FC<{ client: ClientProfile; stats: ClientStats; requests: ServiceRequestDisplay[] }> = ({ client, stats, requests }) => {
  const recentRequests = useMemo(() => requests.slice(0, 5), [requests]);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4 border border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-blue-600 font-medium">Total Requests</p>
              <p className="text-3xl font-bold text-blue-900 mt-1">{stats.totalRequests}</p>
            </div>
            <div className="bg-blue-200 p-3 rounded-full">
              <FileText className="text-blue-700" size={24} />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4 border border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-green-600 font-medium">Completed</p>
              <p className="text-3xl font-bold text-green-900 mt-1">{stats.completedRequests}</p>
            </div>
            <div className="bg-green-200 p-3 rounded-full">
              <TrendingUp className="text-green-700" size={24} />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-lg p-4 border border-amber-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-amber-600 font-medium">Active</p>
              <p className="text-3xl font-bold text-amber-900 mt-1">{stats.activeRequests}</p>
            </div>
            <div className="bg-amber-200 p-3 rounded-full">
              <Clock className="text-amber-700" size={24} />
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Client Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div className="flex items-start gap-3">
            <Mail className="text-gray-400 mt-0.5" size={18} />
            <div>
              <p className="text-gray-500 font-medium">Email</p>
              <p className="text-gray-900">{client.email || 'Not provided'}</p>
            </div>
          </div>
          {client.phone && (
            <div className="flex items-start gap-3">
              <Phone className="text-gray-400 mt-0.5" size={18} />
              <div>
                <p className="text-gray-500 font-medium">Phone</p>
                <p className="text-gray-900">{client.phone}</p>
              </div>
            </div>
          )}
          {client.company && (
            <div className="flex items-start gap-3">
              <Building2 className="text-gray-400 mt-0.5" size={18} />
              <div>
                <p className="text-gray-500 font-medium">Company</p>
                <p className="text-gray-900">{client.company}</p>
              </div>
            </div>
          )}
          <div className="flex items-start gap-3">
            <Clock className="text-gray-400 mt-0.5" size={18} />
            <div>
              <p className="text-gray-500 font-medium">Last Activity</p>
              <p className="text-gray-900">
                {stats.lastActivityDate
                  ? new Date(stats.lastActivityDate).toLocaleDateString()
                  : 'No activity'}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Recent Requests</h3>
        {recentRequests.length > 0 ? (
          <div className="space-y-3">
            {recentRequests.map(req => (
              <div key={req.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <div className="flex-1">
                  <p className="font-semibold text-gray-900">{req.project_title || 'Untitled Project'}</p>
                  <p className="text-xs text-gray-500 capitalize">{req.service_key.replace(/_/g, ' ')}</p>
                </div>
                <span className={`px-3 py-1 text-xs font-semibold capitalize rounded-full ${statusColorMap.client[req.clientStatus]}`}>
                  {req.clientStatus}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-center py-4">No requests yet</p>
        )}
      </div>
    </div>
  );
};

const RequestsTab: React.FC<{ requests: ServiceRequestDisplay[] }> = ({ requests }) => {
  const [filterStatus, setFilterStatus] = useState<string>('all');

  const filteredRequests = useMemo(() => {
    if (filterStatus === 'all') return requests;
    return requests.filter(r => r.clientStatus === filterStatus);
  }, [requests, filterStatus]);

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-bold text-gray-900">All Requests ({requests.length})</h3>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#FF5722] focus:border-[#FF5722]"
        >
          <option value="all">All Statuses</option>
          <option value="Pending">Pending</option>
          <option value="In Progress">In Progress</option>
          <option value="In Review">In Review</option>
          <option value="Completed">Completed</option>
        </select>
      </div>

      <div className="space-y-3">
        {filteredRequests.map(req => (
          <div key={req.id} className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-2">
              <div className="flex-1">
                <h4 className="font-bold text-gray-900">{req.project_title || 'Untitled Project'}</h4>
                <p className="text-sm text-gray-500 capitalize">{req.service_key.replace(/_/g, ' ')}</p>
              </div>
              <span className={`px-3 py-1 text-xs font-semibold capitalize rounded-full ${statusColorMap.client[req.clientStatus]}`}>
                {req.clientStatus}
              </span>
            </div>
            {req.brief && (
              <p className="text-sm text-gray-600 mb-3 line-clamp-2">{req.brief}</p>
            )}
            <div className="flex items-center gap-4 text-xs text-gray-500">
              <span className="flex items-center gap-1">
                <Clock size={12} />
                {new Date(req.requested_at).toLocaleDateString()}
              </span>
              <span>Updated {new Date(req.updated_at).toLocaleDateString()}</span>
            </div>
          </div>
        ))}
        {filteredRequests.length === 0 && (
          <p className="text-center text-gray-500 py-8">No requests found</p>
        )}
      </div>
    </div>
  );
};

const MessagesTab: React.FC<{ clientId: string }> = ({ clientId }) => {
  return (
    <div className="bg-gray-50 rounded-lg p-8 text-center">
      <MessageSquare className="mx-auto text-gray-400 mb-4" size={48} />
      <h3 className="text-lg font-semibold text-gray-900 mb-2">Messages Integration</h3>
      <p className="text-gray-600 text-sm max-w-md mx-auto">
        Real-time messaging system will be integrated here. This will show all conversations between the client and admin team.
      </p>
      <div className="mt-6 p-4 bg-white rounded-lg border border-gray-200 text-left">
        <p className="text-xs text-gray-500 mb-2">Coming Soon:</p>
        <ul className="text-sm text-gray-700 space-y-1">
          <li>• Real-time message thread</li>
          <li>• File attachments support</li>
          <li>• Read receipts</li>
          <li>• Typing indicators</li>
        </ul>
      </div>
    </div>
  );
};

const SettingsTab: React.FC<{ client: ClientProfile }> = ({ client }) => {
  const [tier, setTier] = useState(client.tier);

  return (
    <div className="space-y-6">
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Account Settings</h3>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Client Tier</label>
            <select
              value={tier}
              onChange={(e) => setTier(e.target.value as any)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF5722] focus:border-[#FF5722]"
            >
              <option value="Regular">Regular</option>
              <option value="VIP">VIP</option>
              <option value="Enterprise">Enterprise</option>
            </select>
            <p className="text-xs text-gray-500 mt-1">Client tier determines priority and feature access</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Account Status</label>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-sm text-gray-700">Active</span>
            </div>
          </div>

          <button className="w-full bg-[#FF5722] text-white py-2 px-4 rounded-lg font-medium hover:bg-[#E64A19] transition-colors">
            Save Changes
          </button>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Notification Preferences</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-700">Email Notifications</span>
            <input type="checkbox" className="w-4 h-4 text-[#FF5722] rounded focus:ring-[#FF5722]" defaultChecked />
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-700">SMS Notifications</span>
            <input type="checkbox" className="w-4 h-4 text-[#FF5722] rounded focus:ring-[#FF5722]" />
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-700">In-App Notifications</span>
            <input type="checkbox" className="w-4 h-4 text-[#FF5722] rounded focus:ring-[#FF5722]" defaultChecked />
          </div>
        </div>
      </div>

      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <h3 className="text-lg font-bold text-red-900 mb-2">Danger Zone</h3>
        <p className="text-sm text-red-700 mb-4">Irreversible actions that affect the client account</p>
        <button className="bg-red-600 text-white py-2 px-4 rounded-lg text-sm font-medium hover:bg-red-700 transition-colors">
          Suspend Account
        </button>
      </div>
    </div>
  );
};

export default ClientDetailModal;
