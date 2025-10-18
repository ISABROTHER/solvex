// src/features/auth/MyPage.tsx

import React, { useState } from 'react';
import { useAuth } from './useAuth'; // Assuming useAuth provides clientLogin and adminLogin
import { useLocation, Link, useNavigate } from 'react-router-dom'; // Added useNavigate
import { Home } from 'lucide-react';
import { Loader2 } from 'lucide-react'; // Import Loader icon

// Constant for link text
const HOME_LINK_TEXT = "Back to Home";

const MyPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate(); // Hook for navigation
  const { clientLogin, adminLogin, loading, error: authError } = useAuth(); // Get login functions and state from hook

  const [activeTab, setActiveTab] = useState<'client' | 'admin'>(location.state?.defaultTab || 'client');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [formError, setFormError] = useState<string | null>(null); // Local error state for the form

  // Use the error from the auth context if available
  React.useEffect(() => {
    setFormError(authError);
  }, [authError]);

  const handleSubmit = async (e: React.FormEvent) => { // Make function async
    e.preventDefault();
    setFormError(null); // Clear previous errors

    try {
      let success = false;
      if (activeTab === 'client') {
        success = await clientLogin(email, password); // Call actual client login
        if (success) {
           console.log('Client login successful, navigating...');
           navigate('/client'); // Navigate to client dashboard on success
        }
      } else {
        success = await adminLogin(email, password); // Call actual admin login
         if (success) {
           console.log('Admin login successful, navigating...');
           navigate('/admin'); // Navigate to admin dashboard on success
         }
      }
        // If login fails, the error should be set via the authError effect
        if (!success && !authError) { // Handle case where login returns false but no specific error message
            setFormError('Login failed. Please check your credentials.');
        }

    } catch (err: any) {
        // This catch block might be redundant if useAuth handles errors, but good for safety
      console.error('Login Error:', err);
      setFormError(err.message || 'An unexpected error occurred during login.');
    }
    // No need to setIsSubmitting(false) if using 'loading' from useAuth
  };

  // --- Client Login Form ---
  const renderClientForm = () => (
    <>
      <h2 className="text-2xl font-bold text-center text-gray-800 mb-1">Client Login</h2>
      <p className="text-center text-gray-500 mb-6 text-sm">Welcome to your SolveX Studios portal.</p>

      {/* --- Error Message Area (using formError state) --- */}
      <div className="min-h-[3.25rem] mb-4 flex items-center justify-center">
        {formError && (
            <p className="text-red-500 text-sm text-center bg-red-50 p-3 rounded-md w-full">{formError}</p>
        )}
      </div>
      {/* --- End Error Message Area --- */}

      <div className="mb-4">
        <label className="block text-gray-700 text-sm font-semibold mb-2" htmlFor="email">Email Address</label>
        <input
          type="email"
          id="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          className="w-full px-3 py-2 border rounded-md border-gray-300 focus:ring-2 focus:ring-[#FF5722] focus:border-transparent outline-none"
          required
          autoComplete="email"
          disabled={loading} // Disable input while loading
        />
      </div>
      <div className="mb-4">
        <label className="block text-gray-700 text-sm font-semibold mb-2" htmlFor="password">Password</label>
        <input
          type="password"
          id="password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          className="w-full px-3 py-2 border rounded-md border-gray-300 focus:ring-2 focus:ring-[#FF5722] focus:border-transparent outline-none"
          required
          autoComplete="current-password"
          disabled={loading} // Disable input while loading
        />
      </div>

      <button
        type="submit"
        disabled={loading} // Use loading state from useAuth
        className="w-full flex justify-center items-center gap-2 bg-[#FF5722] text-white font-bold py-2 px-4 rounded-md hover:bg-[#E64A19] transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
      >
        {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : null}
        {loading ? 'Processing...' : 'Login'}
      </button>

      <div className="text-center mt-6 border-t pt-6">
        <p className="text-sm text-gray-600 mb-2">Don't have an account yet?</p>
        <Link
          to="/request-access"
          className={`w-full block bg-gray-100 text-gray-800 font-bold py-2 px-4 rounded-md hover:bg-gray-200 transition-colors ${loading ? 'pointer-events-none opacity-50' : ''}`} // Disable link visually during login
        >
          Request Access
        </Link>
      </div>
    </>
  );

  // --- Admin Login Form ---
  const renderAdminForm = () => (
    <>
      <h2 className="text-2xl font-bold text-center text-gray-800 mb-1">Admin Login</h2>
      <p className="text-center text-gray-500 mb-6 text-sm">Internal access only</p>

      {/* --- Error Message Area (using formError state) --- */}
       <div className="min-h-[3.25rem] mb-4 flex items-center justify-center">
        {formError && (
            <p className="text-red-500 text-sm text-center bg-red-50 p-3 rounded-md w-full">{formError}</p>
        )}
       </div>
      {/* --- End Error Message Area --- */}

      <div className="mb-4">
        <label className="block text-gray-700 text-sm font-semibold mb-2" htmlFor="admin-email">Email Address</label>
        <input
          type="email"
          id="admin-email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          className="w-full px-3 py-2 border rounded-md border-gray-300 focus:ring-2 focus:ring-gray-800 focus:border-transparent outline-none"
          required
          autoComplete="email"
          disabled={loading} // Disable input while loading
        />
      </div>
      <div className="mb-6">
        <label className="block text-gray-700 text-sm font-semibold mb-2" htmlFor="admin-password">Password</label>
        <input
          type="password"
          id="admin-password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          className="w-full px-3 py-2 border rounded-md border-gray-300 focus:ring-2 focus:ring-gray-800 focus:border-transparent outline-none"
          required
          autoComplete="current-password"
          disabled={loading} // Disable input while loading
        />
      </div>
      <button
        type="submit"
        disabled={loading} // Use loading state from useAuth
        className="w-full flex justify-center items-center gap-2 bg-gray-800 text-white font-bold py-2 px-4 rounded-md hover:bg-gray-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
      >
        {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : null}
        {loading ? 'Processing...' : 'Login'}
      </button>
    </>
  );

  // Clear form error when switching tabs
  const handleTabClick = (tab: 'client' | 'admin') => {
      setActiveTab(tab);
      setFormError(null);
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">

        {/* --- Home Button Link --- */}
        <div className="mb-4 text-center">
            <Link to="/" className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#FF5722] rounded-md px-2 py-1">
                <Home size={16} aria-hidden="true" />
                {HOME_LINK_TEXT}
            </Link>
        </div>
        {/* --- End Home Button Link --- */}

        {/* Tab Buttons */}
        <div className="flex border-b border-gray-200 mb-6">
          <button
            onClick={() => handleTabClick('client')} // Updated onClick
            className={`flex-1 py-3 text-sm font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-inset focus:ring-[#FF5722] text-center ${activeTab === 'client' ? 'text-[#FF5722] border-b-2 border-[#FF5722]' : 'text-gray-500 hover:text-gray-700 border-b-2 border-transparent'}`}
            aria-selected={activeTab === 'client'}
            disabled={loading} // Disable tab switching during login
          >
            CLIENT
          </button>
          <button
             onClick={() => handleTabClick('admin')} // Updated onClick
             className={`flex-1 py-3 text-sm font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-inset focus:ring-gray-800 text-center ${activeTab === 'admin' ? 'text-gray-800 border-b-2 border-gray-800' : 'text-gray-500 hover:text-gray-700 border-b-2 border-transparent'}`}
             aria-selected={activeTab === 'admin'}
             disabled={loading} // Disable tab switching during login
          >
            ADMIN
          </button>
        </div>

        {/* Form Container */}
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