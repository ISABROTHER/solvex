import React, { useState } from 'react';
import { useAuth } from './useAuth';
import { useLocation, Link } from 'react-router-dom';
import { Home } from 'lucide-react'; // Standard icon library

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

      {error && <p className="text-red-500 text-sm text-center mb-4 bg-red-50 p-3 rounded-md">{error}</p>}

      <div className="mb-4">
        <label className="block text-gray-700 text-sm font-semibold mb-2" htmlFor="email">Email Address</label>
        <input
          type="email"
          id="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          className="w-full px-3 py-2 border rounded-md border-gray-300 focus:ring-2 focus:ring-[#FF5722] focus:border-transparent outline-none" // Added focus styles
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
          className="w-full px-3 py-2 border rounded-md border-gray-300 focus:ring-2 focus:ring-[#FF5722] focus:border-transparent outline-none" // Added focus styles
          required
          autoComplete="current-password"
        />
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full bg-[#FF5722] text-white font-bold py-2 px-4 rounded-md hover:bg-[#E64A19] transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed" // Added disabled cursor
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

      {error && <p className="text-red-500 text-sm text-center mb-4 bg-red-50 p-3 rounded-md">{error}</p>}

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
      <div className="mb-6">
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
        className="w-full bg-gray-800 text-white font-bold py-2 px-4 rounded-md hover:bg-gray-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed" // Added disabled cursor
      >
        {isSubmitting ? 'Processing...' : 'Login'}
      </button>
    </>
  );

  return (
    // Added padding-bottom to prevent overlap with potential fixed bottom nav
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 pb-24">
      <div className="max-w-md w-full">

        {/* --- Home Button Link --- */}
        {/* Simple, clear navigation back to the main site */}
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

      {/* Optional: Mobile Bottom Navigation (kept from previous code) */}
      <BottomNav />
    </div>
  );
};

export default MyPage;

// --- BottomNav Component (Kept from previous code) ---
const BottomNav: React.FC = () => {
    // ... (rest of BottomNav component code remains the same)
      return (
    <nav
      aria-label="Primary"
      className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 safe-area-inset-bottom"
    >
      <div className="max-w-md mx-auto flex justify-around px-4 py-2"> {/* Changed justify-between to justify-around */}
        <NavItem to="/" label="Home" ariaLabel="Go to home">
          {/* Home SVG */}
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 10.5L12 4l9 6.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1V10.5z" />
          </svg>
        </NavItem>

        <NavItem to="/request-access" label="Request" ariaLabel="Request access">
          {/* Request SVG (simplified user plus) */}
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
          </svg>
        </NavItem>
      </div>
    </nav>
  );
};

type NavItemProps = {
  to: string;
  label: string;
  ariaLabel?: string;
  children: React.ReactNode;
};

const NavItem: React.FC<NavItemProps> = ({ to, label, ariaLabel, children }) => {
  // Use NavLink to automatically handle active state if needed in the future
  return (
    <Link
      to={to}
      aria-label={ariaLabel || label}
      className="flex flex-col items-center justify-center text-xs text-gray-600 hover:text-[#FF5722] transition-colors no-underline p-1 rounded-md focus:outline-none focus:ring-2 focus:ring-[#FF5722]" // Added focus styles
      style={{ minWidth: 44 }} // Ensure minimum tap target size
    >
      <div
        className="flex items-center justify-center mb-1" // Added margin-bottom
        style={{ width: 32, height: 32 }} // Slightly adjusted size
      >
        {children}
      </div>
      <span className="text-center leading-tight">{label}</span>
    </Link>
  );
};