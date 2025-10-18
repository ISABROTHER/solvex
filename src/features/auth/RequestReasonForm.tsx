// src/features/auth/RequestReasonForm.tsx
import React, { useState } from 'react';
import { useAuth } from './useAuth';
import { Send, Loader2, LogOut, Info } from 'lucide-react';

const RequestReasonForm: React.FC = () => {
    const { user, submitAccessReason, logout } = useAuth();
    const [reason, setReason] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!reason.trim()) {
            setError('Please provide a reason for requesting access.');
            return;
        }
        setIsLoading(true);
        setError('');
        try {
            await submitAccessReason(reason);
            // No need to navigate, AuthProvider state `hasPendingRequest` will change
            // and cause a re-render showing the PendingApprovalScreen.
        } catch (err: any) {
            setError(err.message || 'Failed to submit request. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
            <div className="bg-white p-8 rounded-lg shadow-xl max-w-lg w-full">
                <Info className="w-12 h-12 mx-auto text-blue-500 mb-4" />
                <h1 className="text-2xl font-bold text-gray-800 mb-3 text-center">Client Access Request</h1>
                <p className="text-gray-600 mb-6 text-center">
                    Welcome, {user?.user_metadata?.full_name?.split(' ')[0] || user?.email}! To access the client dashboard, please tell us briefly why you need access.
                </p>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="reason" className="block text-sm font-medium text-gray-700 mb-1">
                            Reason for Access / Project Details*
                        </label>
                        <textarea
                            id="reason"
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            rows={4}
                            required
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF5722] focus:border-[#FF5722]"
                            placeholder="e.g., 'Checking status for Project X', 'Need to request photography service for our new product launch', etc."
                        />
                    </div>

                    {error && <p className="text-sm text-red-600 text-center">{error}</p>}

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full bg-[#FF5722] text-white font-semibold py-3 px-6 rounded-lg hover:bg-[#E64A19] disabled:opacity-50 flex items-center justify-center gap-2 transition-colors"
                    >
                        {isLoading ? <Loader2 className="animate-spin" /> : <Send size={16} />}
                        {isLoading ? 'Submitting...' : 'Submit Request'}
                    </button>
                </form>

                 <button
                    onClick={logout}
                    className="flex items-center justify-center gap-2 w-full text-sm font-medium text-gray-600 hover:text-red-600 mt-6 transition-colors"
                >
                    <LogOut size={16} />
                    Logout
                </button>
            </div>
        </div>
    );
};

export default RequestReasonForm;