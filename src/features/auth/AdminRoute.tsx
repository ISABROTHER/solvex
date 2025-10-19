// src/features/auth/AdminRoute.tsx
import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from './useAuth'; // Get auth state
import { Loader2 } from 'lucide-react'; // For loading state

const AdminRoute: React.FC = () => {
  const { isAuthenticated, role, isLoading } = useAuth(); // Get role and loading status
  const location = useLocation();

  // Show loading indicator while session/role is being checked initially
  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="h-10 w-10 animate-spin text-gray-500" />
      </div>
    );
  }

  // Redirect to login if not authenticated OR if role is not 'admin'
  if (!isAuthenticated || role !== 'admin') {
     console.warn(`AdminRoute: Access denied. Auth: ${isAuthenticated}, Role: ${role}`);
    // Redirect them to the login page, passing the current location
    // So they can redirect back after logging in
    return <Navigate to="/my-page" state={{ from: location, defaultTab: 'admin' }} replace />;
  }

  // If authenticated and role is 'admin', render the child routes (Admin Dashboard)
  return <Outlet />;
};

export default AdminRoute;