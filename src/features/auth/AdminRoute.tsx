// src/features/auth/AdminRoute.tsx
import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from './useAuth';

const AdminRoute: React.FC = () => {
  const { isAuthenticated, role, isLoading } = useAuth();

  if (isLoading) {
    // Optional: Add a better loading spinner component here
    return <div className="min-h-screen flex items-center justify-center">Loading authentication...</div>;
  }

  // Only allow if authenticated AND role is explicitly 'admin'
  return isAuthenticated && role === 'admin'
    ? <Outlet /> // Render the admin content (e.g., AdminLayout -> DashboardPage)
    : <Navigate to="/my-page" state={{ defaultTab: 'admin' }} replace />; // Redirect non-admins to login
};

export default AdminRoute;