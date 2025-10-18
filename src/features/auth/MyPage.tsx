import React, { useState } from 'react';
import { useAuth } from './useAuth';
import { useLocation, Link } from 'react-router-dom';
import { Home } from 'lucide-react'; // Keep Home for the top link

// Constant for link text - easy to change later
const HOME_LINK_TEXT = "Back to Home";

const MyPage: React.FC = () => {
  const location = useLocation();
  // Determine default tab based on previous state or default to 'client'
  const [activeTab, setActiveTab] = useState<'client' | 'admin'>(location.state?.defaultTab || 'client');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { clientLogin, adminLogin } = useAuth();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    // Placeholder for actual auth logic
    setTimeout(() => {
      if (activeTab === 'client') {
        clientLogin(); // Attempt client login
      } else {
        adminLogin(); // Attempt admin login
      }
      // Note: Actual implementation would handle errors from login attempts
      setIsSubmitting(false);
    }, 1000); // Simulate network delay
  };

  // --- Client Login Form ---
  const renderClientForm = () => (
    <>
      <h2 className="text-2xl font-bold text-center text-gray-800 mb-1">Client Login</h2>
      <p className="text-center text-gray-500 mb-6 text-sm">Welcome to your SolveX Studios portal.</p>

      {/* --- Error Message Area (with min-height) --- */}
      <div className="min-h-[3.25rem] mb-4 flex items-center justify-center"> {/* Adjusted height to better fit padding */}
        {error && (
            <p className="text-red-500 text-sm text-center bg-red-50 p-3 rounded-md w-full">{error}</p>
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
        />
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full bg-[#FF5722] text-white font-bold py-2 px-4 rounded-md hover:bg-[#E64A19] transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
      >
        {isSubmitting ? 'Processing...' : 'Login'}
      </button>

      <div className="text-center mt-6 border-t pt-6">
        <p className="text-sm text-gray-600 mb-2">Don't have an account yet?</p>
        <Link
          to="/request-access"
          className="w-full block bg-gray-100 text-gray-800 font-bold py-2 px-4 rounded-md hover:bg-gray-200 transition-colors"
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

      {/* --- Error Message Area (with min-height) --- */}
       <div className="min-h-[3.25rem] mb-4 flex items-center justify-center"> {/* Adjusted height to better fit padding */}
        {error && (
            <p className="text-red-500 text-sm text-center bg-red-50 p-3 rounded-md w-full">{error}</p>
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
          className="w-full px-3 py-2 border rounded-md border-gray-300 focus:ring-2 focus:ring-gray-800 focus:border-transparent outline-none" // Adjusted focus color for admin
          required
          autoComplete="email"
        />
      </div>
      <div className="mb-6"> {/* Keep mb-6 here to match spacing below paragraph */}
        <label className="block text-gray-700 text-sm font-semibold mb-2" htmlFor="admin-password">Password</label>
        <input
          type="password"
          id="admin-password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          className="w-full px-3 py-2 border rounded-md border-gray-300 focus:ring-2 focus:ring-gray-800 focus:border-transparent outline-none" // Adjusted focus color for admin
          required
          autoComplete="current-password"
        />
      </div>
      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full bg-gray-800 text-white font-bold py-2 px-4 rounded-md hover:bg-gray-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
      >
        {isSubmitting ? 'Processing...' : 'Login'}
      </button>
    </>
  );

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
            onClick={() => { setActiveTab('client'); setError(''); /* Clear error on tab switch */ }}
            className={`flex-1 py-3 text-sm font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-inset focus:ring-[#FF5722] ${activeTab === 'client' ? 'text-[#FF5722] border-b-2 border-[#FF5722]' : 'text-gray-500 hover:text-gray-700'}`}
            aria-selected={activeTab === 'client'} // Accessibility
          >
            CLIENT
          </button>
          <button
             onClick={() => { setActiveTab('admin'); setError(''); /* Clear error on tab switch */ }}
            className={`flex-1 py-3 text-sm font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-inset focus:ring-gray-800 ${activeTab === 'admin' ? 'text-gray-800 border-b-2 border-gray-800' : 'text-gray-500 hover:text-gray-700'}`}
             aria-selected={activeTab === 'admin'} // Accessibility
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

// --- Removed BottomNav component definitions ---