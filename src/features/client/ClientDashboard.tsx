import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FilePlus, MessageSquare, User, Clock, CheckCircle } from 'lucide-react'; // Added icons
import { useAuth } from './auth'; // Assuming useAuth provides user info
import { useClientMock } from './useClientMock'; // Keeping mock data hook for stats
import StatusBadge from './StatusBadge'; // Assuming this component exists

const ClientDashboard: React.FC = () => {
    const { user } = useAuth(); // Get logged-in user info
    const { stats, recentRequests } = useClientMock(); // Get mock stats and recent requests

    // Animation variants for staggering items
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1,
            },
        },
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 },
    };

    const userName = user?.user_metadata?.full_name?.split(' ')[0] || user?.email || 'Client';

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-stone-50 to-orange-50 p-4 sm:p-6 lg:p-8">
            <motion.div
                className="max-w-7xl mx-auto space-y-8"
                initial="hidden"
                animate="visible"
                variants={containerVariants}
            >
                {/* Welcome Header */}
                <motion.header variants={itemVariants} className="mb-8">
                    <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">
                        Welcome back, {userName}!
                    </h1>
                    <p className="text-lg text-gray-600">Here's a quick overview of your account.</p>
                </motion.header>

                {/* Quick Stats Grid */}
                <motion.section variants={containerVariants} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                    <motion.div variants={itemVariants} className="bg-white p-6 rounded-xl shadow-md border border-gray-100 flex items-center gap-4">
                        <div className="bg-blue-100 p-3 rounded-full">
                            <Clock className="w-6 h-6 text-blue-600" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Pending Requests</p>
                            <p className="text-2xl font-bold text-gray-900">{stats.pending}</p>
                        </div>
                    </motion.div>
                    <motion.div variants={itemVariants} className="bg-white p-6 rounded-xl shadow-md border border-gray-100 flex items-center gap-4">
                        <div className="bg-yellow-100 p-3 rounded-full">
                            <MessageSquare className="w-6 h-6 text-yellow-600" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Active Requests</p>
                            <p className="text-2xl font-bold text-gray-900">{stats.active}</p>
                        </div>
                    </motion.div>
                    <motion.div variants={itemVariants} className="bg-white p-6 rounded-xl shadow-md border border-gray-100 flex items-center gap-4">
                        <div className="bg-green-100 p-3 rounded-full">
                            <CheckCircle className="w-6 h-6 text-green-600" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Completed Requests</p>
                            <p className="text-2xl font-bold text-gray-900">{stats.completed}</p>
                        </div>
                    </motion.div>
                     <motion.div variants={itemVariants} className="bg-white p-6 rounded-xl shadow-md border border-gray-100 flex items-center gap-4">
                        <div className="bg-purple-100 p-3 rounded-full">
                            <User className="w-6 h-6 text-purple-600" />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Account Tier</p>
                            <p className="text-2xl font-bold text-gray-900">{stats.tier}</p>
                        </div>
                    </motion.div>
                </motion.section>

                {/* Quick Actions */}
                <motion.section variants={itemVariants} className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
                    <h2 className="text-xl font-semibold text-gray-800 mb-4">Quick Actions</h2>
                    <div className="flex flex-col sm:flex-row gap-4">
                        <Link
                            to="/client/new-request"
                            className="flex-1 text-center bg-[#FF5722] text-white font-semibold py-3 px-6 rounded-lg hover:bg-[#E64A19] transition duration-200 ease-in-out flex items-center justify-center gap-2 transform hover:scale-[1.02]"
                        >
                            <FilePlus size={20} />
                            Submit New Request
                        </Link>
                        <Link
                            to="/client/requests"
                            className="flex-1 text-center bg-gray-100 text-gray-800 font-semibold py-3 px-6 rounded-lg hover:bg-gray-200 transition duration-200 ease-in-out flex items-center justify-center gap-2"
                        >
                            <Clock size={20} />
                            View All Requests
                        </Link>
                         <Link
                            to="/client/profile"
                            className="flex-1 text-center bg-gray-100 text-gray-800 font-semibold py-3 px-6 rounded-lg hover:bg-gray-200 transition duration-200 ease-in-out flex items-center justify-center gap-2"
                        >
                            <User size={20} />
                            Manage Profile
                        </Link>
                    </div>
                </motion.section>

                {/* Recent Requests List */}
                <motion.section variants={itemVariants} className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
                    <h2 className="text-xl font-semibold text-gray-800 mb-4">Recent Requests</h2>
                    {recentRequests.length > 0 ? (
                        <ul className="divide-y divide-gray-200">
                            {recentRequests.map((request) => (
                                <li key={request.id} className="py-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                                    <div>
                                        <Link to={`/client/requests/${request.id}`} className="text-md font-medium text-gray-900 hover:text-[#FF5722] transition-colors">
                                            {request.title}
                                        </Link>
                                        <p className="text-sm text-gray-500 mt-1">
                                            Requested on: {new Date(request.requestedAt).toLocaleDateString()}
                                        </p>
                                    </div>
                                    <StatusBadge status={request.status} />
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="text-gray-500 text-center py-6">You haven't submitted any requests yet.</p>
                    )}
                </motion.section>

            </motion.div>
        </div>
    );
};

export default ClientDashboard;