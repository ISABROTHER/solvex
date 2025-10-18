import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useClientMock } from './useClientMock';
import StatusBadge from './StatusBadge';

const RequestDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { requests } = useClientMock();
  const request = requests.find(r => r.id === id);

  if (!request) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-4xl mx-auto">
          <p className="text-center text-gray-500">Request not found</p>
          <div className="text-center mt-4">
            <Link to="/client/requests" className="text-[#FF5722] hover:underline">
              Back to Requests
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <Link
          to="/client/requests"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Requests
        </Link>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{request.projectTitle}</h1>
              <p className="text-gray-500 mt-2">{request.serviceType}</p>
            </div>
            <StatusBadge status={request.status} />
          </div>

          <div className="space-y-6">
            <div>
              <h3 className="text-sm font-semibold text-gray-700 uppercase mb-2">Brief</h3>
              <p className="text-gray-900">{request.brief}</p>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div>
                <h3 className="text-sm font-semibold text-gray-700 uppercase mb-2">Timeline</h3>
                <p className="text-gray-900">{request.timeline}</p>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-gray-700 uppercase mb-2">Created</h3>
                <p className="text-gray-900">{new Date(request.createdAt).toLocaleDateString()}</p>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-gray-700 uppercase mb-2">Last Updated</h3>
              <p className="text-gray-900">{new Date(request.updatedAt).toLocaleString()}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RequestDetailPage;
