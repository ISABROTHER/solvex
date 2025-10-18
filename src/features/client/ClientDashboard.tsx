// src/pages/ClientDashboard.saas.tsx
import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FilePlus, MessageSquare, User, Clock, CheckCircle } from 'lucide-react';
import { useAuth } from './auth';
import { useClientMock } from './useClientMock';
import StatusBadge from './StatusBadge';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.06 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 8 },
  visible: { opacity: 1, y: 0 },
};

const Card: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
  <div className={`bg-white border border-gray-100 rounded-xl p-4 sm:p-6 shadow-sm ${className}`}>{children}</div>
);

const ClientDashboardSaaS: React.FC = () => {
  const { user } = useAuth();
  const { stats, recentRequests } = useClientMock();
  const userName = user?.user_metadata?.full_name?.split(' ')[0] || user?.email || 'Client';

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
      <motion.div
        className="max-w-7xl mx-auto space-y-6"
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        <motion.header variants={itemVariants}>
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
            <div>
              <h1 className="text-2xl sm:text-3xl font-semibold text-gray-900">Welcome back, {userName}.</h1>
              <p className="text-sm text-gray-500 mt-1">A concise snapshot of your activity.</p>
            </div>
            <div className="flex gap-3">
              <Link
                to="/client/new-request"
                className="inline-flex items-center gap-2 bg-black text-white px-4 py-2 rounded-lg text-sm font-medium shadow"
                aria-label="Submit a new request"
              >
                <FilePlus size={16} />
                New Request
              </Link>
            </div>
          </div>
        </motion.header>

        {/* Stats */}
        <motion.section variants={itemVariants}>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <div className="flex items-center gap-4">
                <div className="p-2 rounded-md bg-gray-100">
                  <Clock className="w-5 h-5 text-gray-700" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">Pending</p>
                  <p className="text-xl font-semibold text-gray-900">{stats.pending}</p>
                </div>
              </div>
            </Card>

            <Card>
              <div className="flex items-center gap-4">
                <div className="p-2 rounded-md bg-gray-100">
                  <MessageSquare className="w-5 h-5 text-gray-700" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">Active</p>
                  <p className="text-xl font-semibold text-gray-900">{stats.active}</p>
                </div>
              </div>
            </Card>

            <Card>
              <div className="flex items-center gap-4">
                <div className="p-2 rounded-md bg-gray-100">
                  <CheckCircle className="w-5 h-5 text-gray-700" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">Completed</p>
                  <p className="text-xl font-semibold text-gray-900">{stats.completed}</p>
                </div>
              </div>
            </Card>

            <Card>
              <div className="flex items-center gap-4">
                <div className="p-2 rounded-md bg-gray-100">
                  <User className="w-5 h-5 text-gray-700" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">Tier</p>
                  <p className="text-xl font-semibold text-gray-900">{stats.tier}</p>
                </div>
              </div>
            </Card>
          </div>
        </motion.section>

        {/* Quick Actions */}
        <motion.section variants={itemVariants}>
          <Card>
            <h2 className="text-sm font-medium text-gray-800 mb-3">Quick Actions</h2>
            <div className="flex flex-col sm:flex-row gap-3">
              <Link
                to="/client/new-request"
                className="flex-1 inline-flex items-center justify-center gap-2 rounded-md border border-gray-200 px-4 py-3 text-sm font-medium hover:bg-gray-50 transition"
              >
                <FilePlus size={16} />
                Submit New Request
              </Link>
              <Link
                to="/client/requests"
                className="flex-1 inline-flex items-center justify-center gap-2 rounded-md border border-gray-200 px-4 py-3 text-sm font-medium hover:bg-gray-50 transition"
              >
                <Clock size={16} />
                View Requests
              </Link>
              <Link
                to="/client/profile"
                className="flex-1 inline-flex items-center justify-center gap-2 rounded-md border border-gray-200 px-4 py-3 text-sm font-medium hover:bg-gray-50 transition"
              >
                <User size={16} />
                Manage Profile
              </Link>
            </div>
          </Card>
        </motion.section>

        {/* Recent Requests */}
        <motion.section variants={itemVariants}>
          <Card>
            <h2 className="text-sm font-medium text-gray-800 mb-4">Recent Requests</h2>
            {recentRequests.length ? (
              <ul className="divide-y divide-gray-100">
                {recentRequests.map((r) => (
                  <li key={r.id} className="py-3 flex flex-col sm:flex-row justify-between gap-3 items-start sm:items-center">
                    <div>
                      <Link to={`/client/requests/${r.id}`} className="text-sm font-medium text-gray-900 hover:text-gray-700">
                        {r.title}
                      </Link>
                      <p className="text-xs text-gray-500 mt-1">Requested on {new Date(r.requestedAt).toLocaleDateString()}</p>
                    </div>
                    <div className="mt-3 sm:mt-0">
                      <StatusBadge status={r.status} />
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-xs text-gray-500 text-center py-6">No requests yet.</p>
            )}
          </Card>
        </motion.section>
      </motion.div>
    </div>
  );
};

export default ClientDashboardSaaS;
