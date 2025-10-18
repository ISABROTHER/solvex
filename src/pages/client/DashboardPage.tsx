// src/pages/client/DashboardPage.tsx
import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
// Updated icons: Removed Clock, CreditCard. Kept MessageSquare, CheckCircle, User, FilePlus.
import { FilePlus, MessageSquare, CheckCircle, User } from 'lucide-react';
import { useAuth } from '../../features/auth';
import { useClientMock } from './useClientMock';
import StatusBadge from './StatusBadge';
// Removed PaymentReceivingModal import as the trigger is gone

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08 } },
};
const fadeUp = { hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0 } };

// Metric component remains the same as the last stable version
const Metric: React.FC<{
    label: string;
    value: React.ReactNode;
    icon: React.ElementType;
    colorBg?: string;
    iconColor?: string;
    className?: string;
}> = ({
  label,
  value,
  icon: Icon,
  colorBg = 'bg-amber-100',
  iconColor = 'text-amber-600',
  className = '',
}) => (
      <div className={`bg-white rounded-2xl p-4 sm:p-5 shadow-lg border border-gray-100 flex items-center gap-4 ${className}`}>
        <div className={`${colorBg} p-3 rounded-full flex items-center justify-center flex-shrink-0`}>
          <Icon className={`w-5 h-5 ${iconColor}`} />
        </div>
        <div className="overflow-hidden">
          <p className="text-xs text-gray-500 truncate">{label}</p>
          <p className="text-xl font-semibold text-gray-900 truncate">{value}</p>
        </div>
      </div>
  );


const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const { client, requests } = useClientMock();
  const userName = user?.user_metadata?.full_name?.split(' ')[0] || user?.email || client.firstName;
  // Removed modal state

  const stats = {
    // pending: requests.filter(r => r.status === 'Pending').length, // Removed calculation
    active: requests.filter(r => r.status === 'In Progress').length,
    completed: requests.filter(r => r.status === 'Completed').length,
    // tier: client.tier, // Removed calculation
  };

  // Removed paymentDisplayValue

  const recentRequests = requests.slice(0, 5).map(req => ({
    id: req.id,
    title: req.projectTitle,
    status: req.status,
    requestedAt: req.createdAt,
  }));

  // Removed modal handler

  return (
      <div className="min-h-screen bg-gradient-to-b from-stone-50 via-orange-50 to-amber-50 p-4 sm:p-6 lg:p-8">
        <motion.div className="max-w-6xl mx-auto space-y-6" initial="hidden" animate="show" variants={container}>
          <motion.header variants={fadeUp} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">Hey {userName}</h1>
              <p className="text-sm text-gray-600 mt-1">Here's what's happening with your projects and requests.</p>
            </div>
            <div className="flex gap-3">
              <Link
                to="/client/new"
                className="inline-flex items-center gap-2 bg-[#FF5722] text-white px-4 py-2 rounded-lg shadow hover:scale-[1.02] transition-transform duration-200"
              >
                <FilePlus size={16} />
                New Request
              </Link>
              <Link
                to="/client/profile"
                className="inline-flex items-center gap-2 bg-white px-4 py-2 rounded-lg shadow border border-gray-100 hover:scale-[1.02] transition-transform duration-200"
              >
                <User size={16} />
                Profile
              </Link>
            </div>
          </motion.header>

          <motion.section variants={fadeUp}>
             {/* --- Updated Metrics Grid --- */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4"> {/* Kept 2 columns */}
              {/* Removed Pending Requests Metric */}
              <Metric label="Active Requests" value={stats.active} icon={MessageSquare} colorBg="bg-amber-100" iconColor="text-amber-600" />
              <Metric label="Completed" value={stats.completed} icon={CheckCircle} colorBg="bg-green-100" iconColor="text-green-600" />
              {/* Removed Account Tier / Payments Metric */}
            </div>
            {/* --- End Updated Metrics Grid --- */}
          </motion.section>

          <motion.section variants={fadeUp}>
            <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-xl border border-gray-100">
              <h2 className="text-lg font-semibold text-gray-800 mb-3">Quick Actions</h2>
              {/* Kept original Quick Actions */}
              <div className="flex flex-col sm:flex-row gap-3">
                <Link
                  to="/client/new"
                  className="flex-1 inline-flex items-center justify-center gap-2 bg-[#FF5722] text-white py-3 rounded-lg font-medium"
                >
                  <FilePlus size={16} />
                  Submit Request
                </Link>
                <Link
                  to="/client/requests"
                  className="flex-1 inline-flex items-center justify-center gap-2 bg-white border border-gray-200 py-3 rounded-lg"
                >
                  <Clock size={16} /> {/* Kept Clock icon here */}
                  View Requests
                </Link>
                <Link
                  to="/contact"
                  className="flex-1 inline-flex items-center justify-center gap-2 bg-white border border-gray-200 py-3 rounded-lg"
                >
                  <MessageSquare size={16} />
                  Contact Support
                </Link>
              </div>
            </div>
          </motion.section>

          {/* Recent Requests section remains the same */}
          <motion.section variants={fadeUp}>
            <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-xl border border-gray-100">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Recent Requests</h2>
              {recentRequests.length ? (
                <ul className="divide-y divide-gray-100">
                  {recentRequests.map((req) => (
                    <li key={req.id} className="py-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                      <div>
                        <Link to={`/client/requests/${req.id}`} className="font-medium text-gray-900 hover:text-[#FF5722]">
                          {req.title}
                        </Link>
                        <p className="text-xs text-gray-500 mt-1">Requested {new Date(req.requestedAt).toLocaleDateString()}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <StatusBadge status={req.status} />
                        <Link to={`/client/requests/${req.id}`} className="text-sm text-[#FF5722] font-medium">
                          View
                        </Link>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-gray-500 text-center py-6">No recent requests. Submit your first request to get started!</p>
              )}
            </div>
          </motion.section>
        </motion.div>
        {/* Comment moved inside the closing tag */}
      </div>
  );
};

export default DashboardPage;