// @ts-nocheck
// src/pages/client/RequestDetailPage.tsx
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import Confetti from 'react-confetti';
import { useClientMock } from './useClientMock';
import StatusBadge from './StatusBadge';
import ProgressTimeline from './ProgressTimeline';
import MessagesThread from './MessagesThread';
import { ServiceRequestStatus } from './client';

const RequestDetailPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const { requests, updateRequestStatus } = useClientMock();
    const [showConfetti, setShowConfetti] = useState(false);

    const request = requests.find(r => r.id === id);

    useEffect(() => {
        if (request?.status === 'Completed') {
            setShowConfetti(true);
            const timer = setTimeout(() => setShowConfetti(false), 5000); // Confetti for 5 seconds
            return () => clearTimeout(timer);
        }
    }, [request?.status]);

    if (!request) return <div className="text-center p-8">Request not found.</div>;

    const handleUpdateStatus = (status: ServiceRequestStatus) => {
        // TODO: Add permission checks (e.g., only allow moving to 'In Review')
        updateRequestStatus(request.id, status);
    };

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
            {showConfetti && <Confetti recycle={false} numberOfPieces={200} />}
            
            {/* Header */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
                <div className="flex justify-between items-start">
                    <div>
                        <p className="text-sm text-gray-500">{request.serviceType}</p>
                        <h1 className="text-2xl font-bold">{request.projectTitle}</h1>
                    </div>
                    <StatusBadge status={request.status} />
                </div>
                <p className="text-xs text-gray-400 mt-2">Last updated: {new Date(request.updatedAt).toLocaleString()}</p>
            </div>

            <ProgressTimeline currentStatus={request.status} />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                    <MessagesThread requestId={request.id} />
                </div>
                <div>
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 space-y-4">
                        <h3 className="font-semibold">Details</h3>
                        <div>
                            <h4 className="text-sm font-medium text-gray-500">Brief</h4>
                            <p className="text-sm mt-1">{request.brief}</p>
                        </div>
                         <div>
                            <h4 className="text-sm font-medium text-gray-500">Timeline</h4>
                            <p className="text-sm mt-1">{request.timeline}</p>
                        </div>
                        {request.status === 'In Progress' && (
                             <button onClick={() => handleUpdateStatus('In Review')} className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-brand hover:bg-brand-dark">
                                Mark as Ready for Review
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

export default RequestDetailPage;
