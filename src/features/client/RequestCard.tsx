// src/components/client/RequestCard.tsx
import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ServiceRequest } from './client';
import StatusBadge from './StatusBadge';

interface RequestCardProps {
    request: ServiceRequest;
}

const RequestCard: React.FC<RequestCardProps> = ({ request }) => {
    return (
        <Link to={`/client/requests/${request.id}`}>
            <motion.div 
                className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm hover:shadow-md transition-shadow cursor-pointer border dark:border-gray-700"
                whileHover={{ y: -2 }}
            >
                <div className="flex justify-between items-start">
                    <h4 className="font-semibold text-sm mb-2 pr-2">{request.projectTitle}</h4>
                    <StatusBadge status={request.status} />
                </div>
                <p className="text-xs text-gray-500">{request.serviceType}</p>
                <p className="text-xs text-gray-400 mt-3">Updated: {new Date(request.updatedAt).toLocaleDateString()}</p>
            </motion.div>
        </Link>
    );
};

export default RequestCard;
