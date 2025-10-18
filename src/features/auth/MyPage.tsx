// src/features/auth/MyPage.tsx
// Reverted: Calls mock logins, simple navigation

import React, { useState, useEffect } from 'react';
import { useAuth } from './useAuth';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import { Home, Loader2 } from 'lucide-react';

const MyPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  // Get mock functions and state
  const { clientLogin, adminLogin, isLoading, error: authError, setError: setAuthError } = useAuth();
  const [activeTab, setActiveTab] = useState<'client' | 'admin'>(location.state?.defaultTab || 'client');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  // Use authError directly from context

   useEffect(() => { setAuthError(null); }, [email, password, activeTab, setAuthError]);

  // Reverted handleSubmit for mock functions
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null); // Clear previous errors

    try {
      let success = false;
      if (activeTab === 'client') {
        success = await clientLogin(email, password); // Calls mock
        if (success) {
           navigate('/client'); // Navigate directly on mock success
        }
      } else {
        success = await adminLogin(email, password); // Calls mock
         if (success) {
           navigate('/admin'); // Navigate directly on mock success
         }
      }
      // If mock login returns false, authError should be set by AuthProvider
      if (!success && !authError) {
          setAuthError('Mock login failed. Try again.');
      }

    } catch (err: any) {
      // Should not happen with current mocks, but keep for safety
      setAuthError(err.message || 'An unexpected error occurred.');
    }
  };

  const handleTabClick = (tab: 'client' | 'admin') => {
      setActiveTab(tab);
      setAuthError(null);
  };

  // --- Render Functions (renderClientForm, renderAdminForm) ---
  // These are fine as they use isLoading and authError
  const renderClientForm = () => (
    <>
      <h2 className="text-2xl font-bold text-center text-gray-800 mb-1">Client Login</h2>
      <p className="text-center text-gray-500 mb-6 text-sm">Access your portal.</p>
      <div className="min-h-[3.25rem] mb-4 flex items-center justify-center">
        {authError && <p className="text-red-500 text-sm text-center bg-red-50 p-3 rounded-md w-full">{authError}</p>}
      </div>
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="email">Email</label>
        <input type="email" id="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-[#FF5722]" required autoComplete="email" disabled={isLoading} />
      </div>
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="password">Password</label>
        <input type="password" id="password" value={password} onChange={e => setPassword(e.target.value)} className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-[#FF5722]" required autoComplete="current-password" disabled={isLoading} />
      </div>
      <button type="submit" disabled={isLoading} className="w-full flex justify-center items-center gap-2 bg-[#FF5722] text-white font-bold py-2 px-4 rounded-md hover:bg-[#E64A19] transition-colors disabled:bg-gray-400">
        {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Login'}
      </button>
      <div className="text-center mt-6 border-t pt-6">
        <p className="text-sm text-gray-600 mb-2">Need access?</p>
        <Link to="/request-access" className={`w-full block bg-gray-100 text-gray-800 font-bold py-2 px-4 rounded-md hover:bg-gray-200 ${isLoading ? 'pointer-events-none opacity-50' : ''}`}>
          Request Access
        </Link>
      </div>
    </>
  );

  const renderAdminForm = () => (
    <>
      <h2 className="text-2xl font-bold text-center text-gray-800 mb-1">Admin Login</h2>
      <p className="text-center text-gray-500 mb-6 text-sm">Internal access only.</p>
       <div className="min-h-[3.25rem] mb-4 flex items-center justify-center">
        {authError && <p className="text-red-500 text-sm text-center bg-red-50 p-3 rounded-md w-full">{authError}</p>}
       </div>
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="admin-email">Email</label>
        <input type="email" id="admin-email" value={email} onChange={e => setEmail(e.target.value)} className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-gray-800" required autoComplete="email" disabled={isLoading} />
      </div>
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="admin-password">Password</label>
        <input type="password" id="admin-password" value={password} onChange={e => setPassword(e.target.value)} className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-gray-800" required autoComplete="current-password" disabled={isLoading} />
      </div>
      <button type="submit" disabled={isLoading} className="w-full flex justify-center items-center gap-2 bg-gray-800 text-white font-bold py-2 px-4 rounded-md hover:bg-gray-700 transition-colors disabled:bg-gray-400">
        {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Login'}
      </button>
    </>
  );
  // --- End Render Functions ---

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="mb-4 text-center">
            <Link to="/" className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900">
                <Home size={16} /> Back to Home
            </Link>
        </div>
        <div className="flex border-b border-gray-200 mb-6">
          <button onClick={() => handleTabClick('client')} disabled={isLoading} className={`flex-1 py-3 text-sm font-semibold ${activeTab === 'client' ? 'text-[#FF5722] border-b-2 border-[#FF5722]' : 'text-gray-500 hover:text-gray-700'}`}>CLIENT</button>
          <button onClick={() => handleTabClick('admin')} disabled={isLoading} className={`flex-1 py-3 text-sm font-semibold ${activeTab === 'admin' ? 'text-gray-800 border-b-2 border-gray-800' : 'text-gray-500 hover:text-gray-700'}`}>ADMIN</button>
        </div>
         <div className="bg-white p-6 sm:p-8 rounded-lg shadow-md">
          <form onSubmit={handleSubmit} noValidate>
            {activeTab === 'client' ? renderClientForm() : renderAdminForm()}
          </form>
        </div>
      </div>
    </div>
  );
};

export default MyPage;