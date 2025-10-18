// src/features/auth/MyPage.tsx
import React, { useState, useEffect } from 'react';
import { useAuth } from './useAuth'; // No AuthContext needed
// ... other imports

const MyPage: React.FC = () => {
  // ... state ...
  // No need to get isAuthenticated or role from useAuth here
  const { clientLogin, adminLogin, isLoading, error: authError, setError: setAuthError } = useAuth();

  // ... useEffect ...

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);

    try {
      let targetRole: 'client' | 'admin' = activeTab; // Simpler
      let result: { success: boolean; role: 'client' | 'admin' | null };

      if (targetRole === 'client') {
        result = await clientLogin(email, password);
      } else {
        result = await adminLogin(email, password);
      }

      if (result.success && result.role === targetRole) {
        // SUCCESS: Role matches the tab
        navigate(targetRole === 'admin' ? '/admin' : '/client');
      } else if (result.success) {
        // SUCCESS, but WRONG ROLE
        setAuthError(`Login successful, but your account role ('${result.role}') does not match this portal.`);
        // You might want to log them out here, or just show the error
      } else if (!authError) {
        // FAILED (and authProvider didn't set an error)
         setAuthError('Login failed. Please check credentials.');
      }
      // If authProvider set an error (e.g., "Invalid login credentials"), it will just be displayed
    } catch (err: any) {
      setAuthError(err.message || 'An unexpected login error occurred.');
    }
  };

  // ... (rest of the component is fine)
};

export default MyPage;