import React from 'react';
import Card from '../components/Card';
import { Check, X } from 'lucide-react';

// This is mock data. In a real app, you would fetch this from your database.
const mockRequests = [
  { id: 1, name: 'John Doe', email: 'john.doe@example.com', reason: 'Need access to our project files for the Q4 campaign.', services: ['Advertising', 'Content Marketing'], submitted_at: '2025-10-08T10:00:00Z', status: 'Pending' },
  { id: 2, name: 'Jane Smith', email: 'jane.smith@example.com', reason: 'Following up on our call about brand strategy.', services: ['Business Strategy'], submitted_at: '2025-10-07T14:30:00Z', status: 'Approved' },
];

const AccessRequestsTab: React.FC = () => {
  return (
    <Card title="Client Access Requests">
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50">
            <tr className="text-left text-gray-600">
              <th className="px-4 py-2 font-semibold">Name</th>
              <th className="px-4 py-2 font-semibold">Reason for Access</th>
              <th className="px-4 py-2 font-semibold">Submitted</th>
              <th className="px-4 py-2 font-semibold">Status</th>
              <th className="px-4 py-2 font-semibold text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {mockRequests.map((req) => (
              <tr key={req.id}>
                <td className="px-4 py-3">
                  <p className="font-medium text-gray-800">{req.name}</p>
                  <p className="text-gray-500">{req.email}</p>
                </td>
                <td className="px-4 py-3 text-gray-600">{req.reason}</td>
                <td className="px-4 py-3 text-gray-500">{new Date(req.submitted_at).toLocaleDateString()}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${
                    req.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' :
                    req.status === 'Approved' ? 'bg-green-100 text-green-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {req.status}
                  </span>
                </td>
                <td className="px-4 py-3">
                  {req.status === 'Pending' && (
                     <div className="flex justify-end gap-2">
                        <button className="p-2 bg-green-100 text-green-700 rounded-full hover:bg-green-200"><Check size={16} /></button>
                        <button className="p-2 bg-red-100 text-red-700 rounded-full hover:bg-red-200"><X size={16} /></button>
                     </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
};

export default AccessRequestsTab;