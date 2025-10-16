// src/components/client/ProgressTimeline.tsx
import React from 'react';
import { Check } from 'lucide-react';
import { ServiceRequestStatus } from './client';

interface ProgressTimelineProps {
    currentStatus: ServiceRequestStatus;
}

const ProgressTimeline: React.FC<ProgressTimelineProps> = ({ currentStatus }) => {
    const statuses: ServiceRequestStatus[] = ['Pending', 'In Progress', 'In Review', 'Completed'];
    const currentIndex = statuses.indexOf(currentStatus);

    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
            <nav aria-label="Progress">
                <ol className="flex items-center">
                    {statuses.map((status, index) => (
                        <li key={status} className={`relative ${index !== statuses.length - 1 ? 'flex-1' : ''}`}>
                            {index <= currentIndex ? (
                                <div className="flex items-center">
                                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-brand">
                                        <Check className="h-5 w-5 text-white" />
                                    </span>
                                    <span className="ml-2 text-xs sm:text-sm font-medium text-brand">{status}</span>
                                </div>
                            ) : (
                                 <div className="flex items-center">
                                    <span className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-gray-300 dark:border-gray-600"></span>
                                    <span className="ml-2 text-xs sm:text-sm font-medium text-gray-500">{status}</span>
                                </div>
                            )}

                            {index < statuses.length - 1 && (
                                <div className={`absolute top-4 left-4 -ml-px mt-0.5 h-0.5 w-full ${index < currentIndex ? 'bg-brand' : 'bg-gray-300 dark:bg-gray-600'}`} />
                            )}
                        </li>
                    ))}
                </ol>
            </nav>
        </div>
    );
};

export default ProgressTimeline;
