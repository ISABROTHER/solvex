import React, { useState, useEffect } from 'react';
import { useAuth } from './AuthProvider'; // <-- CORRECTED IMPORT
import { useLocation, Link, useNavigate } from 'react-router-dom';
import { Home, Loader2, CheckCircle } from 'lucide-react'; // <-- ADDED CheckCircle
import Alert from '../../components/Alert'; // Import Alert component

const MyPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  // Get functions and state from AuthProvider via useAuth
  const { clientLogin, adminLogin, login, signup, isLoading, error: authError, setError: setAuthError } = useAuth();
  // State for the active tab (client, admin, or employee)
  const [activeTab, setActiveTab] = useState<'client' | 'admin' | 'employee'>(location.state?.defaultTab || 'client');
  // --- NEW: State for login vs signup ---
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  // State for form inputs
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  // --- NEW: State for signup fields ---
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [signupSuccess, setSignupSuccess] = useState(false); // For "Check email" message
  
  // --- NEW: Get denied error from location state ---
  const [deniedError, setDeniedError] = useState(location.state?.error || null);

   // Effect to clear any existing authentication errors when inputs change or tab switches
   useEffect(() => {
     setAuthError(null);
     setDeniedError(null); // Clear denied error on switch
   }, [email, password, activeTab, setAuthError, mode, firstName, lastName]);

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); // Prevent default form submission
    setAuthError(null); // Clear previous errors
    setDeniedError(null);
    setSignupSuccess(false);

    // --- SIGN UP LOGIC ---
    if (mode === 'signup') {
      if (!firstName || !lastName) {
        setAuthError("First and Last name are required to sign up.");
        return;
      }
      
      const { success, error } = await signup(email, password, {
        first_name: firstName,
        last_name: lastName,
      });

      if (success) {
        setSignupSuccess(true); // Show "Check your email"
        setEmail('');
        setPassword('');
        setFirstName('');
        setLastName('');
      } else {
        setAuthError(error || 'Sign up failed. Please try again.');
      }
      return; // Stop here for signup
    }

    // --- LOGIN LOGIC ---
    try {
      let result;
      const targetRole = activeTab;

      console.log(`Attempting login for ${targetRole} with email: ${email}`);

      if (targetRole === 'client') {
        result = await clientLogin(email, password);
      } else if (targetRole === 'admin') {
        result = await adminLogin(email, password);
      } else { // targetRole === 'employee'
        result = await login(email, password);
      }

      console.log("Login result:", result);

      // Process the login result (this logic is now handled by ClientRoute/AdminRoute)
      if (result.success) {
        // AuthProvider's onAuthStateChange will fire,
        // and the protected routes will handle the redirect.
        console.log(`Login successful as ${result.role}. Letting route handle redirect...`);
        
        // --- NEW: Manually navigate based on role ---
        // ClientRoute/AdminRoute only work *after* this.
        if (result.role === 'admin') {
            navigate('/admin');
        } else if (result.role === 'employee') {
            navigate('/employee/dashboard');
        } else if (result.role === 'client') {
            // The ClientRoute will catch this and check approval status
            navigate('/client');
        }
        
      } else if (authError) {
          console.log("Login failed with error from AuthProvider:", authError);
      } else {
         console.warn("Login failed without specific error message.");
         setAuthError('Login failed. Please check your email and password.');
      }

    } catch (err: any) {
      // Catch unexpected errors during the handleSubmit process itself
      console.error("Unexpected error during login submission:", err);
      setAuthError(err.message || 'An unexpected error occurred.');
    }
  };

  // Switch between client/admin/employee tabs
  const handleTabClick = (tab: 'client' | 'admin' | 'employee') => {
      setActiveTab(tab);
      setAuthError(null); // Clear errors on tab switch
      setDeniedError(null);
      setMode('login'); // Default to login when switching tabs
      setSignupSuccess(false);
  };
  
  const isClientTab = activeTab === 'client';

  // --- Render Functions for Forms ---
  const renderClientForm = () => (
    <>
      <h2 className="text-2xl font-bold text-center text-gray-800 mb-1">
        {mode === 'login' ? 'Client Login' : 'Client Sign Up'}
      </h2>
      <p className="text-center text-gray-500 mb-6 text-sm">
        {mode === 'login' ? 'Access your project portal.' : 'Create your client account.'}
      </p>
      
      {/* Display Errors */}
      {authError && <Alert type="error" message={authError} className="mb-4" />}
      {deniedError && <Alert type="error" title="Access Denied" message={deniedError} className="mb-4" />}
      {signupSuccess && <Alert type="success" title="Check Your Email!" message="Please check your inbox to confirm your email address and activate your account." className="mb-4" />}

      {/* --- NEW: Signup Fields --- */}
      {mode === 'signup' && (
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="firstName">First Name *</label>
            <input type="text" id="firstName" value={firstName} onChange={e => setFirstName(e.target.value)} className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-[#FF5722]" required disabled={isLoading} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="lastName">Last Name *</label>
            <input type="text" id="lastName" value={lastName} onChange={e => setLastName(e.target.value)} className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-[#FF5722]" required disabled={isLoading} />
          </div>
        </div>
      )}

      {/* Email Input */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="email">Email *</label>
        <input type="email" id="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-[#FF5722]" required autoComplete="email" disabled={isLoading} />
      </div>
      {/* Password Input */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="password">Password *</label>
        <input type="password" id="password" value={password} onChange={e => setPassword(e.target.value)} className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-[#FF5722]" required autoComplete="current-password" disabled={isLoading} />
      </div>
      {/* Login/Signup Button */}
      <button type="submit" disabled={isLoading} className="w-full flex justify-center items-center gap-2 bg-[#FF5722] text-white font-bold py-2 px-4 rounded-md hover:bg-[#E64A19] transition-colors disabled:opacity-50 disabled:cursor-wait">
        {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : (mode === 'login' ? 'Login' : 'Create Account')}
      </button>

      {/* --- REMOVED: Request Access Button --- */}
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

  const renderEmployeeForm = () => (
    <>
      <h2 className="text-2xl font-bold text-center text-gray-800 mb-1">Employee Login</h2>
      <p className="text-center text-gray-500 mb-6 text-sm">Staff access portal.</p>
      {/* Display Auth Error if present using Alert component */}
      {authError && <Alert type="error" message={authError} className="mb-4" />}
       {/* Email Input */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="employee-email">Email</label>
        <input type="email" id="employee-email" value={email} onChange={e => setEmail(e.target.value)} className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-600" required autoComplete="email" disabled={isLoading} />
      </div>
       {/* Password Input */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="employee-password">Password</label>
        <input type="password" id="employee-password" value={password} onChange={e => setPassword(e.target.value)} className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-600" required autoComplete="current-password" disabled={isLoading} />
      </div>
      {/* Login Button */}
      <button type="submit" disabled={isLoading} className="w-full flex justify-center items-center gap-2 bg-blue-600 text-white font-bold py-2 px-4 rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-wait">
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
          <button onClick={() => handleTabClick('employee')} disabled={isLoading} className={`flex-1 py-3 text-sm font-semibold transition-colors ${activeTab === 'employee' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}>EMPLOYEE</button>
          <button onClick={() => handleTabClick('admin')} disabled={isLoading} className={`flex-1 py-3 text-sm font-semibold transition-colors ${activeTab === 'admin' ? 'text-gray-800 border-b-2 border-gray-800' : 'text-gray-500 hover:text-gray-700'}`}>ADMIN</button>
        </div>
        {/* Form Container */}
         <div className="bg-white p-6 sm:p-8 rounded-lg shadow-md">
          {/* Form element with submit handler */}
          <form onSubmit={handleSubmit} noValidate>
            {/* Render the correct form based on the active tab */}
            {activeTab === 'admin' ? renderAdminForm() : activeTab === 'employee' ? renderEmployeeForm() : renderClientForm()}
          </form>
          
          {/* --- NEW: Login/Signup Toggle for Client Tab --- */}
          {isClientTab && !signupSuccess && (
            <div className="text-center mt-6 border-t pt-6">
              <button
                onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}
                className="text-sm text-gray-600 hover:text-[#FF5722] font-medium"
                disabled={isLoading}
              >
                {mode === 'login'
                  ? "Don't have an account? Sign Up"
                  : 'Already have an account? Login'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MyPage;