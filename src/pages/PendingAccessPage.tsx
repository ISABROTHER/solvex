// src/pages/PendingAccessPage.tsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../features/auth/AuthProvider';
import { supabase } from '../lib/supabase/client';
import { Loader2, Send, CheckCircle } from 'lucide-react';
import { useToast } from '../contexts/ToastContext';
import { Link } from 'react-router-dom';

const PendingAccessPage: React.FC = () => {
  const { user, profile, logout } = useAuth();
  const { addToast } = useToast();

  const [reason, setReason] = useState(profile?.reason_for_access || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(!!profile?.reason_for_access);
  const [error, setError] = useState('');

  // Pre-fill reason if it was already submitted
  useEffect(() => {
    if (profile?.reason_for_access) {
      setReason(profile.reason_for_access);
      setIsSubmitted(true);
    }
  }, [profile]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !reason.trim()) return;

    setIsSubmitting(true);
    setError('');

    try {
      // --- THIS WAS THE BROKEN LINE ---
      const { error } = await supabase
        .from('profiles')
        .update({ reason_for_access: reason })
        .eq('id', user.id);

      if (error) throw error;

      setIsSubmitted(true);
      addToast({ type: 'success', title: 'Message Sent!', message: 'We will review your request shortly.' });
    } catch (err: any) {
      setError('Failed to send message. Please try again.');
      addToast({ type: 'error', title: 'Error', message: err.message });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-lg w-full bg-white p-8 rounded-lg shadow-md relative">
        <button
          onClick={logout}
          className="absolute top-4 right-4 text-sm text-gray-500 hover:text-red-600"
        >
          Logout
        </button>
        <div className="text-center">
          <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Account Created!</h1>
          <p className="text-lg text-gray-600 mb-6">
            Your access is <span className="font-semibold text-yellow-600">pending approval</span> from the SolveX team.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="reason" className="block text-sm font-medium text-gray-700">
              {isSubmitted
                ? 'Your submitted message:'
                : 'Please tell us who you are and why you need access:'}
            </label>
            <textarea
              id="reason"
              rows={4}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              readOnly={isSubmitted}
              disabled={isSubmitting || isSubmitted}
              className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm sm:text-sm ${
                isSubmitted ? 'bg-gray-100 cursor-not-allowed' : 'focus:border-[#FF5722] focus:ring-[#FF5722]'
              }`}
              placeholder="e.g., I'm John from XYZ Corp, need to check on our Q4 branding project."
            />
          </div>

          {error && <p className="text-sm text-red-600 text-center">{error}</p>}

          <button
            type="submit"
            disabled={isSubmitting || isSubmitted || !reason.trim()}
            className="w-full flex justify-center items-center gap-2 rounded-md bg-[#FF5722] px-3 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-[#E64A19] disabled:opacity-50"
          >
            {isSubmitting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : isSubmitted ? (
              <CheckCircle className="h-4 w-4" />
            ) : (
              <Send className="h-4 w-4" />
            )}
            {isSubmitting ? 'Submitting...' : isSubmitted ? 'Message Sent' : 'Submit Request'}
          </button>
        </form>
        <p className="text-xs text-gray-500 text-center mt-4">
          You will be notified by email once approved.
          <Link to="/" className="ml-1 font-medium text-[#FF5722] hover:underline">
            Back to Home
          </Link>
        </p>
      </div>
    </div>
  );
};

export default PendingAccessPage;