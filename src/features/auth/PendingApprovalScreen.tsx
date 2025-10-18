// src/features/auth/PendingApprovalScreen.tsx
import React from 'react';
import { useAuth } from './useAuth';
import { Clock, LogOut } from 'lucide-react';

const PendingApprovalScreen: React.FC = () => {
    const { user, logout } = useAuth();

    return (
        <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-100 flex items-center justify-center p-4">
            <div className="bg-white p-8 rounded-lg shadow-xl text-center max-w-lg w-full">
                <Clock className="w-16 h-16 mx-auto text-amber-500 mb-6" />
                <h1 className="text-2xl font-bold text-gray-800 mb-3">Access Pending Approval</h1>
                <p className="text-gray-600 mb-6">
                    Thank you, {user?.user_metadata?.full_name?.split(' ')[0] || user?.email}! Your request for access has been received. Our team will review it shortly.
                </p>
                <p className="text-sm text-gray-500 mb-8">
                    You will receive an email notification once your access is granted. You can then log in again to access your dashboard.
                </p>
                <button
                    onClick={logout}
                    className="flex items-center justify-center gap-2 w-full text-sm font-medium text-gray-600 hover:text-red-600 transition-colors bg-gray-100 hover:bg-gray-200 py-2 px-4 rounded-md"
                >
                    <LogOut size={16} />
                    Logout
                </button>
            </div>
        </div>
    );
};

export default PendingApprovalScreen;