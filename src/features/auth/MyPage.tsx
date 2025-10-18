import React, { useState } from 'react';
import { useAuth } from './useAuth';
import { useLocation, Link } from 'react-router-dom';

const MyPage: React.FC = () => {
  const location = useLocation();
  const [activeTab, setActiveTab] = useState<'client' | 'admin'>(location.state?.defaultTab || 'client');
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { clientLogin, adminLogin } = useAuth();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    // This is where you would add the logic from your plan:
    // 1. Check email status (invited, pending, not found).
    // 2. If not invited, show "Access requires approval."
    // 3. If pending, show "Your request is under review." 
    // 4. If invited, proceed with login.
    
    setIsSubmitting(true);
    setTimeout(() => {
      if (activeTab === 'client') {
        // For now, we'll just log in directly.
        clientLogin();
      } else {
        adminLogin();
      }
      setIsSubmitting(false);
    }, 1000);
  };

  const renderClientForm = () => (
    <>
      <h2 className="text-2xl font-bold text-center text-gray-800 mb-1">Client Login</h2>
      <p className="text-center text-gray-500 mb-6 text-sm">Welcome to your SolveX Studios portal.</p>
      
      {error && <p className="text-red-500 text-sm text-center mb-4 bg-red-50 p-3 rounded-md">{error}</p>}

      <div className="mb-4">
        <label className="block text-gray-700 text-sm font-semibold mb-2" htmlFor="email">Email Address</label>
        <input type="email" id="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full px-3 py-2 border rounded-md border-gray-300" required />
      </div>
      <div className="mb-4">
        <label className="block text-gray-700 text-sm font-semibold mb-2" htmlFor="password">Password</label>
        <input type="password" id="password" value={password} onChange={e => setPassword(e.target.value)} className="w-full px-3 py-2 border rounded-md border-gray-300" required />
      </div>

      <button type="submit" disabled={isSubmitting} className="w-full bg-[#FF5722] text-white font-bold py-2 px-4 rounded-md hover:bg-[#E64A19] transition-colors disabled:bg-gray-400">
        {isSubmitting ? 'Processing...' : 'Login'}
      </button>

      <div className="text-center mt-6 border-t pt-6">
        <p className="text-sm text-gray-600 mb-2">Don't have an account yet?</p>
        <Link to="/request-access" className="w-full block bg-gray-100 text-gray-800 font-bold py-2 px-4 rounded-md hover:bg-gray-200 transition-colors">
          Request Access
        </Link>
      </div>
    </>
  );

  const renderAdminForm = () => (
    <>
      <h2 className="text-2xl font-bold text-center text-gray-800 mb-1">Admin Login</h2>
      <p className="text-center text-gray-500 mb-6 text-sm">Internal access only</p>
      
      <div className="mb-4">
        <label className="block text-gray-700 text-sm font-semibold mb-2" htmlFor="admin-email">Email Address</label>
        <input type="email" id="admin-email" value={email} onChange={e => setEmail(e.target.value)} className="w-full px-3 py-2 border rounded-md border-gray-300" required />
      </div>
      <div className="mb-6">
        <label className="block text-gray-700 text-sm font-semibold mb-2" htmlFor="admin-password">Password</label>
        <input type="password" id="admin-password" value={password} onChange={e => setPassword(e.target.value)} className="w-full px-3 py-2 border rounded-md border-gray-300" required />
      </div>
      <button type="submit" disabled={isSubmitting} className="w-full bg-gray-800 text-white font-bold py-2 px-4 rounded-md hover:bg-gray-700 transition-colors disabled:bg-gray-400">
        {isSubmitting ? 'Processing...' : 'Login'}
      </button>
    </>
  );

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="flex border-b border-gray-200 mb-6">
          <button onClick={() => { setActiveTab('client'); }} className={`flex-1 py-3 text-sm font-semibold transition-colors ${activeTab === 'client' ? 'text-[#FF5722] border-b-2 border-[#FF5722]' : 'text-gray-500'}`}>
            CLIENT
          </button>
          <button onClick={() => { setActiveTab('admin'); }} className={`flex-1 py-3 text-sm font-semibold transition-colors ${activeTab === 'admin' ? 'text-gray-800 border-b-2 border-gray-800' : 'text-gray-500'}`}>
            ADMIN
          </button>
        </div>
        <div className="bg-white p-8 rounded-lg shadow-md">
          <form onSubmit={handleSubmit} noValidate>
            {activeTab === 'client' ? renderClientForm() : renderAdminForm()}
          </form>
        </div>
      </div>
    </div>
  );
};

export default MyPage;