import React from 'react';
import { useAuth } from '../../features/auth';
import { useClientMock } from './useClientMock';

const ProfilePage: React.FC = () => {
  const { user } = useAuth();
  const { client } = useClientMock();

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Profile</h1>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Name</label>
              <p className="mt-1 text-lg">{client.firstName} {client.lastName}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Email</label>
              <p className="mt-1 text-lg">{client.email}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Company</label>
              <p className="mt-1 text-lg">{client.company}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Tier</label>
              <p className="mt-1 text-lg">{client.tier}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
