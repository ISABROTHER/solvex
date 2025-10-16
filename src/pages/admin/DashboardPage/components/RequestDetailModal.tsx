import React, { useState } from 'react';
import { X, Clock, User, FileText, Calendar, CircleCheck as CheckCircle2, Circle, CircleAlert as AlertCircle, MessageSquare } from 'lucide-react';
import { ServiceRequestDisplay, statusColorMap, AdminServiceRequestStatus } from '../../../../types/client-sync.types';

interface RequestDetailModalProps {
  request: ServiceRequestDisplay;
  onClose: () => void;
  onStatusUpdate: (newStatus: AdminServiceRequestStatus) => void;
}

const RequestDetailModal: React.FC<RequestDetailModalProps> = ({ request, onClose, onStatusUpdate }) => {
  const [selectedStatus, setSelectedStatus] = useState<AdminServiceRequestStatus>(request.status);

  const statusOptions: AdminServiceRequestStatus[] = ['requested', 'confirmed', 'in_progress', 'completed', 'cancelled'];

  const handleStatusChange = (newStatus: AdminServiceRequestStatus) => {
    setSelectedStatus(newStatus);
    onStatusUpdate(newStatus);
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col">

        <div className="bg-gray-900 text-white p-6 flex justify-between items-start">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h2 className="text-2xl font-bold">{request.project_title || 'Untitled Project'}</h2>
              <span className={`px-3 py-1 text-xs font-semibold capitalize rounded-full ${statusColorMap.client[request.clientStatus]}`}>
                {request.clientStatus}
              </span>
            </div>
            <p className="text-gray-300 text-sm capitalize">{request.service_key.replace(/_/g, ' ')}</p>
            <div className="flex items-center gap-4 mt-3 text-sm text-gray-400">
              <span className="flex items-center gap-1">
                <User size={14} />
                {request.clients?.full_name || request.clients?.email || 'Unknown Client'}
              </span>
              <span className="flex items-center gap-1">
                <Calendar size={14} />
                {new Date(request.requested_at).toLocaleDateString()}
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/20 rounded-full transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <FileText size={20} className="text-[#FF5722]" />
                  Project Brief
                </h3>
                <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                  {request.brief || 'No brief provided'}
                </p>
              </div>

              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <CheckCircle2 size={20} className="text-[#FF5722]" />
                  Progress Timeline
                </h3>
                <ProgressTimeline currentStatus={request.status} />
              </div>

              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <MessageSquare size={20} className="text-[#FF5722]" />
                  Activity Log
                </h3>
                <div className="space-y-3">
                  <ActivityLogItem
                    timestamp={request.updated_at}
                    action="Status updated"
                    description={`Request status changed to ${request.status}`}
                  />
                  <ActivityLogItem
                    timestamp={request.requested_at}
                    action="Request created"
                    description="New service request submitted"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Status Management</h3>
                <div className="space-y-3">
                  {statusOptions.map(status => (
                    <button
                      key={status}
                      onClick={() => handleStatusChange(status)}
                      className={`w-full text-left px-4 py-3 rounded-lg border-2 transition-all ${
                        selectedStatus === status
                          ? 'border-[#FF5722] bg-[#FF5722]/10 font-semibold'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        {selectedStatus === status ? (
                          <CheckCircle2 size={18} className="text-[#FF5722]" />
                        ) : (
                          <Circle size={18} className="text-gray-400" />
                        )}
                        <span className="capitalize">{status.replace(/_/g, ' ')}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Request Details</h3>
                <div className="space-y-3 text-sm">
                  <div>
                    <p className="text-gray-500 font-medium">Request ID</p>
                    <p className="text-gray-900 font-mono text-xs">{request.id.substring(0, 8)}...</p>
                  </div>
                  <div>
                    <p className="text-gray-500 font-medium">Client Email</p>
                    <p className="text-gray-900">{request.clients?.email || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-gray-500 font-medium">Requested Date</p>
                    <p className="text-gray-900">{new Date(request.requested_at).toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-gray-500 font-medium">Last Updated</p>
                    <p className="text-gray-900">{new Date(request.updated_at).toLocaleString()}</p>
                  </div>
                  {request.timeline && (
                    <div>
                      <p className="text-gray-500 font-medium">Timeline</p>
                      <p className="text-gray-900">{request.timeline}</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <AlertCircle className="text-blue-600 flex-shrink-0 mt-0.5" size={20} />
                  <div>
                    <p className="text-sm font-semibold text-blue-900">Admin View</p>
                    <p className="text-xs text-blue-700 mt-1">
                      Changes made here will be reflected in the client dashboard in real-time
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const ProgressTimeline: React.FC<{ currentStatus: AdminServiceRequestStatus }> = ({ currentStatus }) => {
  const steps: { status: AdminServiceRequestStatus; label: string; description: string }[] = [
    { status: 'requested', label: 'Requested', description: 'Initial request submitted' },
    { status: 'confirmed', label: 'Confirmed', description: 'Request reviewed and confirmed' },
    { status: 'in_progress', label: 'In Progress', description: 'Work has begun' },
    { status: 'completed', label: 'Completed', description: 'Request fulfilled' },
  ];

  const currentIndex = steps.findIndex(s => s.status === currentStatus);

  return (
    <div className="space-y-4">
      {steps.map((step, index) => {
        const isCompleted = index <= currentIndex;
        const isCurrent = index === currentIndex;
        const isCancelled = currentStatus === 'cancelled';

        return (
          <div key={step.status} className="flex items-start gap-4">
            <div className="flex flex-col items-center">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-colors ${
                  isCancelled && isCurrent
                    ? 'bg-red-100 border-red-500'
                    : isCompleted
                    ? 'bg-green-100 border-green-500'
                    : 'bg-gray-100 border-gray-300'
                }`}
              >
                {isCompleted ? (
                  <CheckCircle2
                    size={20}
                    className={isCancelled && isCurrent ? 'text-red-600' : 'text-green-600'}
                  />
                ) : (
                  <Circle size={20} className="text-gray-400" />
                )}
              </div>
              {index < steps.length - 1 && (
                <div
                  className={`w-0.5 h-12 ${isCompleted ? 'bg-green-300' : 'bg-gray-200'}`}
                />
              )}
            </div>
            <div className="flex-1 pb-8">
              <h4 className={`font-semibold ${isCurrent ? 'text-gray-900' : 'text-gray-600'}`}>
                {step.label}
              </h4>
              <p className="text-sm text-gray-500 mt-1">{step.description}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
};

interface ActivityLogItemProps {
  timestamp: string;
  action: string;
  description: string;
}

const ActivityLogItem: React.FC<ActivityLogItemProps> = ({ timestamp, action, description }) => {
  return (
    <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
      <div className="bg-[#FF5722] p-2 rounded-full">
        <Clock size={14} className="text-white" />
      </div>
      <div className="flex-1">
        <p className="font-semibold text-gray-900 text-sm">{action}</p>
        <p className="text-xs text-gray-600 mt-0.5">{description}</p>
        <p className="text-xs text-gray-400 mt-1">{new Date(timestamp).toLocaleString()}</p>
      </div>
    </div>
  );
};

export default RequestDetailModal;
