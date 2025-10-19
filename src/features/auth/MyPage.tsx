import React, { useState, useEffect } from 'react';
import { useAuth } from './AuthProvider'; // <-- CORRECTED IMPORT
import { useLocation, Link, useNavigate } from 'react-router-dom';
import { Home, Loader2 } from 'lucide-react';
import Alert from '../../components/Alert'; // Import Alert component

const MyPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  // Get functions and state from AuthProvider via useAuth
  const { clientLogin, adminLogin, isLoading, error: authError, setError: setAuthError } = useAuth();
  // State for the active tab (client or admin)
  const [activeTab, setActiveTab] = useState<'client' | 'admin'>(location.state?.defaultTab || 'client');
  // State for form inputs
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

   // Effect to clear any existing authentication errors when inputs change or tab switches
   useEffect(() => {
     setAuthError(null);
   }, [email, password, activeTab, setAuthError]);

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); // Prevent default form submission
    setAuthError(null); // Clear previous errors before attempting login
    let targetRole: 'client' | 'admin' = activeTab; // Role user is trying to log in as

    console.log(`Attempting login for ${targetRole} with email: ${email}`);

    try {
      // Call the appropriate login function from AuthProvider
      // result will be { success: boolean, role: UserRole }
      let result;

      if (targetRole === 'client') {
        result = await clientLogin(email, password);
      } else { // targetRole === 'admin'
        result = await adminLogin(email, password);
      }

      console.log("Login result:", result);

      // Process the login result
      if (result.success && result.role === targetRole) {
        // SUCCESS: Login successful AND role matches the portal tab
        console.log(`Login successful as ${targetRole}. Navigating...`);
        navigate(targetRole === 'admin' ? '/admin' : '/client'); // Navigate to dashboard
      } else if (result.success && result.role !== targetRole) {
        // SUCCESS, BUT WRONG ROLE: Login credentials were valid, but the fetched role doesn't match
        console.warn(`Login successful but role mismatch. Expected ${targetRole}, got ${result.role}`);
        // Display specific error about role mismatch
        // Use a more informative message if the role was null (profile fetch failed)
        if (result.role === null) {
            setAuthError(authError || "Login successful, but failed to verify account role. Please contact support."); // Show AuthProvider error if set
        } else {
            setAuthError(`Login successful, but your account role ('${result.role}') does not grant access to the ${targetRole} portal.`);
        }
        // DO NOT NAVIGATE
      } else if (!result.success && authError) {
          // FAILED with specific error from AuthProvider (e.g., "Invalid login credentials", "Profile not found")
          console.log("Login failed with error from AuthProvider:", authError);
          // Error is already set, Alert component will display it. No need to call setAuthError again.
      } else if (!result.success) {
         // FAILED without a specific error message (generic failure)
         console.warn("Login failed without specific error message.");
         setAuthError('Login failed. Please check your email and password.');
      }

    } catch (err: any) {
      // Catch unexpected errors during the handleSubmit process itself
      console.error("Unexpected error during login submission:", err);
      setAuthError(err.message || 'An unexpected error occurred.');
    }
    // isLoading state is managed by AuthProvider and reflected in UI via useAuth()
  };

  // Switch between client/admin tabs
  const handleTabClick = (tab: 'client' | 'admin') => {
      setActiveTab(tab);
      setAuthError(null); // Clear errors on tab switch
  };

  // --- Render Functions for Forms ---
  const renderClientForm = () => (
    <>
      <h2 className="text-2xl font-bold text-center text-gray-800 mb-1">Client Login</h2>
      <p className="text-center text-gray-500 mb-6 text-sm">Access your project portal.</p>
      {/* Display Auth Error if present using Alert component */}
      {authError && <Alert type="error" message={authError} className="mb-4" />}
      {/* Email Input */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="email">Email</label>
        <input type="email" id="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-[#FF5722]" required autoComplete="email" disabled={isLoading} />
      </div>
      {/* Password Input */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="password">Password</label>
        <input type="password" id="password" value={password} onChange={e => setPassword(e.target.value)} className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-[#FF5722]" required autoComplete="current-password" disabled={isLoading} />
      </div>
      {/* Login Button */}
      <button type="submit" disabled={isLoading} className="w-full flex justify-center items-center gap-2 bg-[#FF5722] text-white font-bold py-2 px-4 rounded-md hover:bg-[#E64A19] transition-colors disabled:opacity-50 disabled:cursor-wait">
        {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Login'}
      </button>
      {/* Request Access Link */}
      <div className="text-center mt-6 border-t pt-6">
        <p className="text-sm text-gray-600 mb-2">Don't have access yet?</p>
        <Link to="/request-access" className={`w-full block bg-gray-100 text-gray-800 font-bold py-2 px-4 rounded-md hover:bg-gray-200 transition-colors ${isLoading ? 'pointer-events-none opacity-50' : ''}`}>
          Request Access
        </Link>
      </div>
    </>
  );

  const renderAdminForm = () => (
    <>
      <h2 className="text-2xl font-bold text-center text-gray-800 mb-1">Admin Login</h2>
      <p className="text-center text-gray-500 mb-6 text-sm">Internal use only.</p>
      {/* Display Auth Error if present using Alert component */}
      {authError && <Alert type="error" message={authError} className="mb-4" />}
       {/* Email Input */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="admin-email">Email</label>
        <input type="email" id="admin-email" value={email} onChange={e => setEmail(e.target.value)} className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-gray-800" required autoComplete="email" disabled={isLoading} />
      </div>
       {/* Password Input */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="admin-password">Password</label>
        <input type="password" id="admin-password" value={password} onChange={e => setPassword(e.target.value)} className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-gray-800" required autoComplete="current-password" disabled={isLoading} />
      </div>
      {/* Login Button */}
      <button type="submit" disabled={isLoading} className="w-full flex justify-center items-center gap-2 bg-gray-800 text-white font-bold py-2 px-4 rounded-md hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-wait">
        {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Login'}
      </button>
    </>
  );
  // --- End Render Functions ---

  // --- Main Page Structure ---
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Back Home Link */}
        <div className="mb-4 text-center">
            <Link to="/" className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition-colors">
                <Home size={16} /> Back to Home
            </Link>
        </div>
        {/* Tab Buttons */}
        <div className="flex border-b border-gray-200 mb-6">
          <button onClick={() => handleTabClick('client')} disabled={isLoading} className={`flex-1 py-3 text-sm font-semibold transition-colors ${activeTab === 'client' ? 'text-[#FF5722] border-b-2 border-[#FF5722]' : 'text-gray-500 hover:text-gray-700'}`}>CLIENT</button>
          <button onClick={() => handleTabClick('admin')} disabled={isLoading} className={`flex-1 py-3 text-sm font-semibold transition-colors ${activeTab === 'admin' ? 'text-gray-800 border-b-2 border-gray-800' : 'text-gray-500 hover:text-gray-700'}`}>ADMIN</button>
        </div>
        {/* Form Container */}
         <div className="bg-white p-6 sm:p-8 rounded-lg shadow-md">
          {/* Form element with submit handler */}
          <form onSubmit={handleSubmit} noValidate>
            {/* Render the correct form based on the active tab */}
            {activeTab === 'admin' ? renderAdminForm() : renderClientForm()}
          </form>
        </div>
      </div>
    </div>
  );
};

export default MyPage; 