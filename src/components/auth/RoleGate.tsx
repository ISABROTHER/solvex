import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../features/auth'; // Corrected import path

interface RoleGateProps {
  expectedRole: 'admin' | 'employee' | 'client';
  children: React.ReactNode;
}

const RoleGate: React.FC<RoleGateProps> = ({ expectedRole, children }) => {
  const { profile, isLoading, isAuthenticated } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div>Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated || !profile) {
    // User is not logged in, redirect to login
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (profile.role !== expectedRole) {
    // User is logged in, but has the wrong role.
    // Redirect them to their correct dashboard.
    const correctPath = profile.role === 'employee' ? '/employee/dashboard' : `/${profile.role}`;
    return <Navigate to={correctPath} replace />;
  }

  if (expectedRole === 'client' && profile.approval_status !== 'approved') {
    // User is a client, but not approved. Redirect to pending page.
    return <Navigate to="/pending" replace />;
  }

  // User has the correct role and (if client) is approved.
  return <>{children}</>;
};

export default RoleGate;