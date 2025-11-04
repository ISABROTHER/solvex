import React, { useState, useEffect } from 'react';
import { useAuth } from './AuthProvider';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import { Home, Loader2 } from 'lucide-react';
import { supabase } from '../../lib/supabase/client';

const MyPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, profile, isAdmin, isClient, loading } = useAuth();
  const [activeTab, setActiveTab] = useState<'client' | 'admin'>(location.state?.defaultTab || 'client');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (user && profile) {
      if (isAdmin) {
        navigate('/admin');
      } else if (isClient) {
        navigate('/portal');
      }
    }
  }, [user, profile, isAdmin, isClient, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) throw signInError;

      if (data.user) {
        const { data: profileData, error: profileError } = await (supabase
          .from('profiles')
          .select('role')
          .eq('id', data.user.id)
          .single() as any);

        if (profileError || !profileData) {
          throw new Error('Unable to verify account role.');
        }

        const userRole = profileData.role;

        if (activeTab === 'admin' && userRole !== 'admin') {
          setError('You do not have admin access.');
          await supabase.auth.signOut();
        } else if (activeTab === 'client' && userRole !== 'client') {
          setError('You do not have client access.');
          await supabase.auth.signOut();
        }
      }
    } catch (err: any) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-gray-500" />
      </div>
    );
  }

  const renderClientForm = () => (
    <>
      <h2 className="text-2xl font-bold text-center text-gray-800 mb-1">Client Login</h2>
      <p className="text-center text-gray-500 mb-6 text-sm">Access your project portal.</p>
      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg text-sm">
          {error}
        </div>
      )}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="email">Email</label>
        <input
          type="email"
          id="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-[#FF5722]"
          required
          disabled={isLoading}
        />
      </div>
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="password">Password</label>
        <input
          type="password"
          id="password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-[#FF5722]"
          required
          disabled={isLoading}
        />
      </div>
      <button
        type="submit"
        disabled={isLoading}
        className="w-full flex justify-center items-center gap-2 bg-[#FF5722] text-white font-bold py-2 px-4 rounded-md hover:bg-[#E64A19] transition-colors disabled:opacity-50"
      >
        {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Login'}
      </button>
      <div className="text-center mt-6 border-t pt-6">
        <p className="text-sm text-gray-600 mb-2">Don't have access yet?</p>
        <Link
          to="/request-access"
          className="w-full block bg-gray-100 text-gray-800 font-bold py-2 px-4 rounded-md hover:bg-gray-200 transition-colors"
        >
          Request Access
        </Link>
      </div>
    </>
  );

  const renderAdminForm = () => (
    <>
      <h2 className="text-2xl font-bold text-center text-gray-800 mb-1">Admin Login</h2>
      <p className="text-center text-gray-500 mb-6 text-sm">Internal use only.</p>
      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg text-sm">
          {error}
        </div>
      )}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="admin-email">Email</label>
        <input
          type="email"
          id="admin-email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-gray-800"
          required
          disabled={isLoading}
        />
      </div>
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="admin-password">Password</label>
        <input
          type="password"
          id="admin-password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-gray-800"
          required
          disabled={isLoading}
        />
      </div>
      <button
        type="submit"
        disabled={isLoading}
        className="w-full flex justify-center items-center gap-2 bg-gray-800 text-white font-bold py-2 px-4 rounded-md hover:bg-gray-700 transition-colors disabled:opacity-50"
      >
        {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Login'}
      </button>
    </>
  );

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="mb-4 text-center">
          <Link to="/" className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition-colors">
            <Home size={16} /> Back to Home
          </Link>
        </div>
        <div className="flex border-b border-gray-200 mb-6">
          <button
            onClick={() => { setActiveTab('client'); setError(null); }}
            disabled={isLoading}
            className={`flex-1 py-3 text-sm font-semibold transition-colors ${
              activeTab === 'client' ? 'text-[#FF5722] border-b-2 border-[#FF5722]' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            CLIENT
          </button>
          <button
            onClick={() => { setActiveTab('admin'); setError(null); }}
            disabled={isLoading}
            className={`flex-1 py-3 text-sm font-semibold transition-colors ${
              activeTab === 'admin' ? 'text-gray-800 border-b-2 border-gray-800' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            ADMIN
          </button>
        </div>
        <div className="bg-white p-6 sm:p-8 rounded-lg shadow-md">
          <form onSubmit={handleSubmit} noValidate>
            {activeTab === 'admin' ? renderAdminForm() : renderClientForm()}
          </form>
        </div>
      </div>
    </div>
  );
};

export default MyPage;
