// src/features/auth/MyPage.tsx
import React, { useState, useEffect } from 'react'; // Remove useContext
// Remove AuthContext import, useAuth is sufficient
import { useAuth } from './useAuth';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import { Home, Loader2 } from 'lucide-react';

const MyPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  // Get isAuthenticated and role directly from useAuth
  const { clientLogin, adminLogin, isLoading, error: authError, setError: setAuthError, isAuthenticated, role } = useAuth();
  const [activeTab, setActiveTab] = useState<'client' | 'admin'>(location.state?.defaultTab || 'client');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

   useEffect(() => { setAuthError(null); }, [email, password, activeTab, setAuthError]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    let targetRole: 'client' | 'admin' | null = null;
    let success = false;

    try {
      if (activeTab === 'client') {
        targetRole = 'client';
        success = await clientLogin(email, password);
      } else {
        targetRole = 'admin';
        success = await adminLogin(email, password);
      }

      if (success) {
         // Allow time for onAuthStateChange
         setTimeout(() => {
           // Re-check state using the hook's current values
           const currentAuth = useAuth(); // Get latest state via hook

           if (currentAuth.isAuthenticated && currentAuth.role === targetRole) {
              navigate(targetRole === 'admin' ? '/admin' : '/client');
           } else if (currentAuth.isAuthenticated) {
              setAuthError(`Login successful but role is incorrect.`);
           } else {
             setAuthError('Login attempt succeeded but session update failed.');
           }
         }, 300);
      } else if (!authError) {
         setAuthError('Login failed. Check credentials.');
      }
    } catch (err: any) {
      setAuthError(err.message || 'An unexpected login error.');
    }
  };

  // ... (rest of the component remains the same, using isLoading and authError from useAuth)
  // ... (handleTabClick, renderClientForm, renderAdminForm, return statement)
};

export default MyPage; // No need to export AuthContext here either