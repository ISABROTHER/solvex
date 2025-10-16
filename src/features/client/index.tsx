import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CirclePlus as PlusCircle, FileText, MessageSquare, ArrowRight } from 'lucide-react';
import { useClientMock } from './useClientMock';
import StatusBadge from './StatusBadge';

const ClientDashboard: React.FC = () => {
    const { client, requests, isLoading } = useClientMock();

    const stats = {
        active: requests.filter(r => r.status === 'In Progress').length,
        inReview: requests.filter(r => r.status === 'In Review').length,
        completed: requests.filter(r => r.status === 'Completed').length,
    };

    const recentActivity = requests.slice(0, 5);

    if (isLoading) {
        return <div>Loading...</div>;
    }

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
            <div className="space-y-8">
                {/* Welcome Banner */}
                <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-sm flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Welcome back, {client.firstName}!</h1>
                        <p className="text-gray-600 dark:text-gray-300">Here's what's happening with your projects.</p>
                    </div>
                    <div className="text-sm font-semibold bg-brand/10 text-brand px-3 py-1 rounded-full">{client.tier} Tier</div>
                </div>

                {/* Quick Actions */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <Link to="/client/new" className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm hover:shadow-md transition-shadow flex items-center gap-4">
                        <PlusCircle className="h-8 w-8 text-brand" />
                        <div>
                            <h3 className="font-semibold">New Request</h3>
                            <p className="text-sm text-gray-500">Start a new project</p>
                        </div>
                    </Link>
                    <Link to="/client/requests" className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm hover:shadow-md transition-shadow flex items-center gap-4">
                        <FileText className="h-8 w-8 text-brand" />
                        <div>
                            <h3 className="font-semibold">My Requests</h3>
                            <p className="text-sm text-gray-500">View all projects</p>
                        </div>
                    </Link>
                    <Link to="/client/messages" className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm hover:shadow-md transition-shadow flex items-center gap-4 opacity-50 cursor-not-allowed">
                        <MessageSquare className="h-8 w-8 text-gray-400" />
                        <div>
                            <h3 className="font-semibold">Messages</h3>
                            <p className="text-sm text-gray-500">Check your inbox</p>
                        </div>
                    </Link>
                </div>

                {/* Project Snapshot */}
                <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
                    <h2 className="text-lg font-semibold mb-4">Project Snapshot</h2>
                    <div className="grid grid-cols-3 divide-x dark:divide-gray-700">
                        <div className="text-center px-2">
                            <p className="text-3xl font-bold">{stats.active}</p>
                            <p className="text-sm text-gray-500">Active</p>
                        </div>
                        <div className="text-center px-2">
                            <p className="text-3xl font-bold">{stats.inReview}</p>
                            <p className="text-sm text-gray-500">In Review</p>
                        </div>
                        <div className="text-center px-2">
                            <p className="text-3xl font-bold">{stats.completed}</p>
                            <p className="text-sm text-gray-500">Completed</p>
                        </div>
                    </div>
                </div>
                
                {/* Recent Activity */}
                <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
                    <h2 className="text-lg font-semibold mb-4">Recent Activity</h2>
                    <ul className="space-y-3">
                        {recentActivity.map(req => (
                            <li key={req.id} className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-md">
                                <Link to={`/client/requests/${req.id}`} className="flex justify-between items-center group">
                                    <div>
                                        <p className="font-medium text-sm">{req.projectTitle}</p>
                                        <p className="text-xs text-gray-500">Last updated: {new Date(req.updatedAt).toLocaleDateString()}</p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <StatusBadge status={req.status} />
                                        <ArrowRight className="h-4 w-4 text-gray-400 group-hover:translate-x-1 transition-transform" />
                                    </div>
                                </Link>
                            </li>
                        ))}
                    </ul>
                </div>

            </div>
        </motion.div>
    );
};

export default ClientDashboard;