import React from 'react';
import { Link } from 'react-router-dom';
import { useClientMock } from './useClientMock';
import StatusBadge from './StatusBadge';

const RequestsPage: React.FC = () => {
  const { requests } = useClientMock();

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900">My Requests</h1>
          <Link
            to="/client/new"
            className="bg-[#FF5722] text-white px-4 py-2 rounded-lg hover:bg-[#E64A19] transition"
          >
            New Request
          </Link>
        </div>
        <div className="bg-white rounded-lg shadow">
          {requests.length > 0 ? (
            <ul className="divide-y divide-gray-200">
              {requests.map((request) => (
                <li key={request.id} className="p-6 hover:bg-gray-50 transition">
                  <Link to={`/client/requests/${request.id}`} className="block">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">{request.projectTitle}</h3>
                        <p className="text-sm text-gray-500 mt-1">{request.serviceType}</p>
                        <p className="text-sm text-gray-600 mt-2">{request.brief}</p>
                      </div>
                      <StatusBadge status={request.status} />
                    </div>
                    <div className="mt-4 flex gap-4 text-sm text-gray-500">
                      <span>Created: {new Date(request.createdAt).toLocaleDateString()}</span>
                      <span>Timeline: {request.timeline}</span>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <div className="p-12 text-center text-gray-500">
              <p>No requests yet. Create your first request to get started!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RequestsPage;
