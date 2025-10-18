// src/features/auth/ClientRoute.tsx
import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from './useAuth';
import PendingApprovalScreen from './PendingApprovalScreen'; // Import the pending screen
import RequestReasonForm from './RequestReasonForm'; // Import the reason form

const ClientRoute: React.FC = () => {
  const { isAuthenticated, role, isLoading, hasPendingRequest } = useAuth();

  if (isLoading) {
    // Optional: Add a better loading spinner component here
    return <div className="min-h-screen flex items-center justify-center">Loading authentication...</div>;
  }

  if (!isAuthenticated) {
    // Not logged in, redirect to login page
    return <Navigate to="/my-page" state={{ defaultTab: 'client' }} replace />;
  }

  if (role === 'pending') {
    // Logged in but pending approval
    if (hasPendingRequest === null) {
        // Still checking if reason was submitted
         return <div className="min-h-screen flex items-center justify-center">Checking access status...</div>;
    }
    return hasPendingRequest ? <PendingApprovalScreen /> : <RequestReasonForm />;
  }

  if (role === 'client') {
    // Logged in and approved client, show the dashboard/outlet
    return <Outlet />;
  }

  // If role is admin or something else unexpected, redirect away (e.g., to login)
  // Or handle admin case specifically if ClientRoute might be hit by admins
  return <Navigate to="/my-page" replace />;
};

export default ClientRoute;