// @ts-nocheck
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { LogOut, User, MessageSquare, FileText, Send, Loader2, Link as LinkIcon, AlertCircle, X } from 'lucide-react';
import { useAuth } from '../auth/useAuth';
import { businessServicesData } from '../../data/business/services.data';
import { getOrCreateClientForUser, createServiceRequest, listMyServiceRequests } from '../../lib/supabase/operations';
import type { Database } from '../../lib/supabase/database.types';
import Select from 'react-select';

// Define complex types locally for the component
type ClientRow = Database['public']['Tables']['clients']['Row'];
type ServiceRequest = Database['public']['Tables']['service_requests']['Row'];
type ServiceRequestStatus = ServiceRequest['status'];
type ServiceRequestInsert = Database['public']['Tables']['service_requests']['Insert'];
type Attachment = { url: string; label: string };

const statusColorMap: Record<ServiceRequestStatus, string> = {
  requested: 'bg-amber-100 text-amber-800',
  confirmed: 'bg-blue-100 text-blue-800',
  in_progress: 'bg-indigo-100 text-indigo-800',
  completed: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
};

// Custom Select Styles
const selectStyles = {
  control: (provided: any, state: { isFocused: any; }) => ({
    ...provided, minHeight: '42px', backgroundColor: '#F9FAFB',
    borderColor: state.isFocused ? '#FF5722' : '#E5E7EB',
    boxShadow: state.isFocused ? '0 0 0 1px #FF5722' : 'none',
  }),
  option: (provided: any, state: { isSelected: any; isFocused: any; }) => ({
    ...provided,
    backgroundColor: state.isSelected ? '#FF5722' : state.isFocused ? '#FF57221A' : 'white',
    color: state.isSelected ? 'white' : '#1F2937',
  }),
};

const ServiceRequestForm: React.FC<{ client: ClientRow | null, onSuccess: () => void }> = ({ client, onSuccess }) => {
  const [formData, setFormData] = useState({
    serviceKey: '',
    projectTitle: '',
    brief: '',
    attachmentUrl: '',
    attachmentLabel: '',
  });
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const serviceOptions = useMemo(() => businessServicesData.map(s => ({
    value: s.title.toLowerCase().replace(/\s/g, '_').replace(/[^a-z0-9_]/g, ''),
    label: s.title,
  })), []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAddAttachment = () => {
    if (formData.attachmentUrl && formData.attachmentLabel) {
      setAttachments(prev => [...prev, { url: formData.attachmentUrl, label: formData.attachmentLabel }]);
      setFormData(prev => ({ ...prev, attachmentUrl: '', attachmentLabel: '' }));
    }
  };

  const handleRemoveAttachment = (url: string) => {
    setAttachments(prev => prev.filter(att => att.url !== url));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!client) return setError('Client profile not loaded.');

    if (!formData.serviceKey || !formData.projectTitle || !formData.brief) {
      return setError('Please fill out all required fields.');
    }

    setIsSubmitting(true);
    setError('');

    try {
      // @ts-expect-error - Mock data structure doesn't fully match database schema
      const payload: ServiceRequestInsert = {
        client_id: client.id,
        service_key: formData.serviceKey,
        project_title: formData.projectTitle.trim().substring(0, 100),
        brief: formData.brief.trim().substring(0, 5000),
        attachments: attachments as any,
        status: 'requested',
      };

      const { error: requestError } = await createServiceRequest(payload);
      if (requestError) throw requestError;

      setSuccess(true);
      setFormData({ serviceKey: '', projectTitle: '', brief: '', attachmentUrl: '', attachmentLabel: '' });
      setAttachments([]);
      onSuccess(); // This will trigger a refetch in the parent

      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError('Failed to submit request. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2"><Send size={20} className="text-brand" /> Request a New Service</h3>
      
      {error && <div className="p-3 mb-4 text-sm bg-red-100 text-red-700 rounded-lg flex items-center gap-2"><AlertCircle size={16} />{error}</div>}
      {success && <div className="p-3 mb-4 text-sm bg-green-100 text-green-700 rounded-lg flex items-center gap-2"><Send size={16} />Request successfully submitted!</div>}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Service Type *</label>
          <Select
            options={serviceOptions}
            styles={selectStyles}
            placeholder="Select a service..."
            value={serviceOptions.find(o => o.value === formData.serviceKey)}
            onChange={(option) => setFormData(prev => ({ ...prev, serviceKey: option?.value || '' }))}
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Project Title *</label>
          <input type="text" name="projectTitle" value={formData.projectTitle} onChange={handleChange} required className="w-full px-3 py-2 border rounded-lg bg-gray-50" maxLength={100} />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Brief / Details *</label>
          <textarea name="brief" value={formData.brief} onChange={handleChange} required rows={4} className="w-full px-3 py-2 border rounded-lg bg-gray-50" maxLength={5000} />
        </div>
        <button type="submit" disabled={isSubmitting || !client} className="w-full bg-brand text-white font-bold py-3 px-6 rounded-lg hover:bg-brand-dark transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
          {isSubmitting ? <Loader2 size={20} className="animate-spin" /> : 'Submit Request'}
        </button>
      </form>
    </div>
  );
};


const MyRequestsList: React.FC<{ client: ClientRow | null, key: number }> = ({ client, ...props }) => {
  const [requests, setRequests] = useState<(ServiceRequest & { service_name: string })[]>([]);
  const [loading, setLoading] = useState(true);
  
  const serviceMap = useMemo(() => new Map(businessServicesData.map(s => [
      s.title.toLowerCase().replace(/\s/g, '_').replace(/[^a-z0-9_]/g, ''), 
      s.title
    ])), []);
  
  const fetchRequests = useCallback(async () => {
    if (!client) return;
    setLoading(true);
    const { data, error } = await listMyServiceRequests(client.id);
    if (error) {
      console.error('Failed to fetch requests:', error);
    } else if (data) {
      const formattedRequests = data.map(req => ({
        ...req,
        service_name: serviceMap.get(req.service_key) || req.service_key,
      }));
      setRequests(formattedRequests);
    }
    setLoading(false);
  }, [client, serviceMap]);
  
  useEffect(() => {
    fetchRequests();
  }, [client, props.key]);


  if (loading) return <div className="text-center py-10"><Loader2 size={24} className="animate-spin text-gray-400" /></div>;
  
  return (
    <div className="space-y-4">
      <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2"><FileText size={20} className="text-brand-dark" /> My Requests ({requests.length})</h3>
      {requests.length === 0 ? (
        <p className="text-gray-500 p-4 bg-gray-100 rounded-lg">You have no active service requests.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm bg-white rounded-lg shadow-sm">
            <thead className="text-left text-gray-500 border-b">
              <tr>
                <th className="px-4 py-2">Service</th>
                <th className="px-4 py-2">Title</th>
                <th className="px-4 py-2">Requested</th>
                <th className="px-4 py-2 text-center">Status</th>
              </tr>
            </thead>
            <tbody>
              {requests.map(req => (
                <tr key={req.id} className="border-b last:border-b-0 hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-800">{req.service_name}</td>
                  <td className="px-4 py-3 text-gray-700">{req.project_title || 'No Title'}</td>
                  <td className="px-4 py-3 text-gray-500">{new Date(req.requested_at).toLocaleDateString()}</td>
                  <td className="px-4 py-3 text-center">
                    <span className={`inline-block rounded-full px-3 py-1 text-xs font-semibold capitalize ${statusColorMap[req.status]}`}>
                      {req.status.replace(/_/g, ' ')}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};


const ClientDashboard: React.FC = () => {
  const { logout, user, isLoading: authLoading } = useAuth();
  const [clientProfile, setClientProfile] = useState<ClientRow | null>(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [requestListKey, setRequestListKey] = useState(Date.now());

  const fetchClientProfile = useCallback(async () => {
    if (!user) {
        setIsLoadingProfile(false);
        return;
    };
    setIsLoadingProfile(true);
    const { data, error } = await getOrCreateClientForUser(user.id, user.email || '', user.user_metadata.full_name);
    if (error) {
      console.error('Error fetching/creating client profile:', error);
    } else {
      setClientProfile(data);
    }
    setIsLoadingProfile(false);
  }, [user]);

  useEffect(() => {
    if (!authLoading) {
      fetchClientProfile();
    }
  }, [authLoading, fetchClientProfile]);

  const handleRequestSuccess = () => {
    // Force a re-render of the requests list by changing its key
    setRequestListKey(Date.now());
  };

  if (authLoading || isLoadingProfile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <Loader2 size={32} className="animate-spin text-brand" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">
            Welcome, {clientProfile?.full_name?.split(' ')[0] || user?.email}!
          </h1>
          <button 
            onClick={logout} 
            className="flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-brand transition-colors"
          >
            <LogOut size={16} />
            Logout
          </button>
        </div>
      </header>
      <main>
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1">
              <div className="space-y-6">
                <ServiceRequestForm client={clientProfile} onSuccess={handleRequestSuccess} />
                <div className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-center gap-4">
                    <User className="w-6 h-6 text-gray-400" />
                    <div>
                      <h3 className="text-md font-semibold text-gray-700">My Profile</h3>
                      <p className="text-xs text-gray-500">Tier: {clientProfile?.tier || 'N/A'}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="lg:col-span-2">
              <MyRequestsList client={clientProfile} key={requestListKey} />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ClientDashboard;