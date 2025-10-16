// src/pages/client/RequestsPage.tsx
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { SlidersHorizontal, Search } from 'lucide-react';
import { useClientMock } from './useClientMock';
import { ServiceRequest } from './client';
import RequestCard from './RequestCard';
import StatusBadge from './StatusBadge';
import { Link } from 'react-router-dom';

const RequestsPage: React.FC = () => {
    const { requests, isLoading } = useClientMock();
    const [view, setView] = useState<'list' | 'kanban'>('kanban');

    if (isLoading) {
        return <div>Loading Skeleton...</div>;
    }

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
            <div className="space-y-6">
                <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                        <input type="text" placeholder="Search requests..." className="w-48 sm:w-64 px-3 py-1.5 border dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-sm"/>
                        <button className="p-2 border dark:border-gray-600 rounded-md bg-white dark:bg-gray-800"><SlidersHorizontal className="h-4 w-4" /></button>
                    </div>
                    <div className="flex items-center rounded-md bg-gray-200 dark:bg-gray-700 p-1">
                        <button onClick={() => setView('kanban')} className={`px-3 py-1 text-sm rounded ${view === 'kanban' ? 'bg-white dark:bg-gray-800 shadow-sm' : ''}`}>Kanban</button>
                        <button onClick={() => setView('list')} className={`px-3 py-1 text-sm rounded ${view === 'list' ? 'bg-white dark:bg-gray-800 shadow-sm' : ''}`}>List</button>
                    </div>
                </div>

                <AnimatePresence mode="wait">
                    <motion.div
                        key={view}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                    >
                        {view === 'kanban' ? <KanbanView requests={requests} /> : <ListView requests={requests} />}
                    </motion.div>
                </AnimatePresence>
            </div>
        </motion.div>
    );
};

const KanbanView: React.FC<{ requests: ServiceRequest[] }> = ({ requests }) => {
    const statuses: ServiceRequest['status'][] = ['Pending', 'In Progress', 'In Review', 'Completed'];
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {statuses.map(status => (
                <div key={status}>
                    <h3 className="font-semibold mb-3 px-1">{status}</h3>
                    <div className="space-y-3">
                        {requests.filter(r => r.status === status).map(req => (
                            <RequestCard key={req.id} request={req} />
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
};

const ListView: React.FC<{ requests: ServiceRequest[] }> = ({ requests }) => (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Project</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Updated</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {requests.map(req => (
                    <tr key={req.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900 dark:text-white">{req.projectTitle}</div>
                            <div className="text-sm text-gray-500">{req.serviceType}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap"><StatusBadge status={req.status} /></td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(req.updatedAt).toLocaleDateString()}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <Link to={`/client/requests/${req.id}`} className="text-brand hover:text-brand-dark">View</Link>
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
    </div>
);

export default RequestsPage;
