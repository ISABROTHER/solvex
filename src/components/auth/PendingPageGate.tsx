import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../features/auth'; // Corrected import path

interface PendingPageGateProps {
  children: React.ReactNode;
}

const PendingPageGate: React.FC<PendingPageGateProps> = ({ children }) => {
  const { profile, isLoading, isAuthenticated } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div>Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated || !profile) {
    // Not logged in, send to login
    return <Navigate to="/login" replace />;
  }

  // If user is admin or employee, send to their dashboard
  if (profile.role === 'admin') {
    return <Navigate to="/admin" replace />;
  }
  if (profile.role === 'employee') {
    return <Navigate to="/employee/dashboard" replace />;
  }

  // If user is a client
  if (profile.role === 'client') {
    // and is approved, send them to their dashboard
    if (profile.approval_status === 'approved') {
      return <Navigate to="/client" replace />;
    }
    // and is NOT approved (pending, rejected), let them see the page
    return <>{children}</>;
  }
  
  // Fallback (e.g., unknown role)
  return <Navigate to="/login" replace />;
};

export default PendingPageGate;