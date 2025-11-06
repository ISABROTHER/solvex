import React, { useState, useEffect } from 'react';
import { useAuth } from '../features/auth/AuthProvider';
import { supabase } from '../lib/supabase/client';
import { useToast } from '../contexts/ToastContext';
import { useNavigate } from 'react-router-dom';
import { Send, Clock, Mail } from 'lucide-react';

const PendingAccessPage: React.FC = () => {
  const { profile, user, logout, refreshUserProfile } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (profile) {
      setReason(profile.reason_for_access || '');
      if (profile.reason_for_access) {
        setSubmitted(true);
      }
    }
  }, [profile]);

  const handleSubmitReason = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!user) return;
    setLoading(true);

    const { error } = await supabase
      .from('profiles')
      .update({ reason_for_access: reason, approval_status: 'pending' }) // Ensure status is pending
      .eq('id', user.id);

    if (error) {
      showToast('Error', 'Could not submit reason: ' + error.message, 'error');
    } else {
      showToast('Success', 'Your request for access has been submitted.', 'success');
      setSubmitted(true);
      refreshUserProfile(); // Refresh profile to get new data
    }
    setLoading(false);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const status = profile?.approval_status || 'pending';

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-200px)] bg-gray-100 dark:bg-gray-900 px-4 py-12">
      <div className="w-full max-w-lg p-8 space-y-6 bg-white rounded-lg shadow-xl dark:bg-gray-800">
        <div className="flex justify-center">
          <Clock className="w-16 h-16 text-yellow-500" />
        </div>
        <h1 className="text-3xl font-bold text-center text-gray-900 dark:text-white">
          Access Pending
        </h1>
        
        {status === 'rejected' && (
          <div className="p-4 text-center text-red-800 bg-red-100 rounded-lg dark:bg-red-900 dark:text-red-200">
            <p className="font-semibold">Your access request has been denied.</p>
            <p className="text-sm">Please contact support if you believe this is an error.</p>
          </div>
        )}

        {status === 'pending' && !submitted && (
          <p className="text-center text-gray-600 dark:text-gray-300">
            Your account has been created, but an administrator must approve it. 
            Please provide a reason for access to speed up the process.
          </p>
        )}

        {status === 'pending' && submitted && (
          <div className="p-4 text-center text-green-800 bg-green-100 rounded-lg dark:bg-green-900 dark:text-green-200">
            <p className="font-semibold">Your request is under review.</p>
            <p className="text-sm">We will notify you by email once your account is approved.</p>
          </div>
        )}

        {(status === 'pending' || status === 'rejected') && (
          <form onSubmit={handleSubmitReason} className="space-y-4">
            <div>
              <label
                htmlFor="reason"
                className="block mb-2 text-sm font-medium text-gray-900 dark:text-gray-300"
              >
                {submitted ? 'Update your reason (optional):' : 'Reason for Access:'}
              </label>
              <textarea
                id="reason"
                rows={4}
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full px-3 py-2 text-gray-900 bg-gray-50 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
                placeholder="e.g., I am a new client for the 'Project X'..."
                required
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full px-4 py-2 text-base font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:ring-4 focus:ring-blue-300 disabled:bg-blue-400 disabled:cursor-not-allowed flex items-center justify-center dark:bg-blue-500 dark:hover:bg-blue-600 dark:focus:ring-blue-800"
            >
              {loading ? (
                <svg className="w-5 h-5 mr-3 -ml-1 text-white animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : (
                <Send className="w-5 h-5 mr-2" />
              )}
              {loading ? 'Submitting...' : (submitted ? 'Update Request' : 'Submit for Approval')}
            </button>
          </form>
        )}

        <div className="pt-4 text-sm text-center text-gray-600 border-t border-gray-200 dark:border-gray-700 dark:text-gray-400">
          <p>
            Wrong account?{' '}
            <button
              onClick={handleLogout}
              className="font-medium text-blue-600 hover:underline dark:text-blue-500"
            >
              Sign Out
            </button>
          </p>
          <p className="mt-2">
            Need help?{' '}
            <a
              href="mailto:support@solvex.com"
              className="font-medium text-blue-600 hover:underline dark:text-blue-500 inline-flex items-center"
            >
              <Mail className="w-4 h-4 mr-1" /> Contact Support
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default PendingAccessPage;