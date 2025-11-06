// src/pages/client/DashboardPage.tsx
import React from 'react';
import { useAuth } from '../../features/auth/AuthProvider'; // Corrected import
import { ArrowRight, BarChart, CheckSquare, Clock } from 'lucide-react';

// Example Stat Card
interface StatCardProps {
  title: string;
  value: string;
  icon: React.ElementType;
  color: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon: Icon, color }) => (
  <div className="bg-white shadow-sm rounded-lg p-5 flex items-center space-x-4">
    <div className={`flex-shrink-0 h-12 w-12 flex items-center justify-center rounded-full ${color}`}>
      <Icon className="h-6 w-6 text-white" />
    </div>
    <div>
      <p className="text-sm font-medium text-gray-500 truncate">{title}</p>
      <p className="text-2xl font-semibold text-gray-900">{value}</p>
    </div>
  </div>
);

const ClientDashboard: React.FC = () => {
  const { profile } = useAuth();
  
  const firstName = profile?.first_name || 'Client';

  return (
    <div className="max-w-7xl mx-auto">
      {/* Welcome Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-1">
          Welcome back, {firstName}!
        </h1>
        <p className="text-lg text-gray-600">
          Here's a quick overview of your account.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 mb-6">
        <StatCard title="Active Projects" value="2" icon={Clock} color="bg-blue-500" />
        <StatCard title="Tasks Completed" value="14" icon={CheckSquare} color="bg-green-500" />
        <StatCard title="Pending Invoices" value="1" icon={BarChart} color="bg-yellow-500" />
      </div>

      {/* Main Content Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activity */}
        <div className="lg:col-span-2 bg-white shadow-sm rounded-lg">
          <div className="p-5 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
          </div>
          <ul className="divide-y divide-gray-200">
            {[
              { text: 'New designs for Project Alpha uploaded.', time: '2h ago' },
              { text: 'Invoice #INV-007 was paid.', time: '1d ago' },
              { text: 'Comment received on "Brand Logo" task.', time: '1d ago' },
              { text: 'Project Delta was marked as "Completed".', time: '3d ago' },
            ].map((item, index) => (
              <li key={index} className="p-5 flex justify-between items-center hover:bg-gray-50">
                <p className="text-sm text-gray-700">{item.text}</p>
                <p className="text-sm text-gray-400">{item.time}</p>
              </li>
            ))}
          </ul>
        </div>

        {/* Quick Actions */}
        <div className="bg-white shadow-sm rounded-lg">
          <div className="p-5 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Quick Actions</h3>
          </div>
          <div className="p-5 space-y-3">
            <button className="w-full flex justify-between items-center px-4 py-3 bg-gray-50 hover:bg-gray-100 rounded-md text-sm font-medium text-gray-700">
              View All Projects <ArrowRight className="h-4 w-4" />
            </button>
            <button className="w-full flex justify-between items-center px-4 py-3 bg-gray-50 hover:bg-gray-100 rounded-md text-sm font-medium text-gray-700">
              Check Messages <ArrowRight className="h-4 w-4" />
            </button>
            <button className="w-full flex justify-between items-center px-4 py-3 bg-gray-50 hover:bg-gray-100 rounded-md text-sm font-medium text-gray-700">
              Pay Invoices <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClientDashboard;