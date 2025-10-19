import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from './AuthProvider'; // <-- CORRECTED IMPORT
import { Loader2 } from 'lucide-react'; // For loading state

const ClientRoute: React.FC = () => {
  const { isAuthenticated, role, isLoading } = useAuth(); // Get role and loading status
  const location = useLocation();

  // Show loading indicator while session/role is being checked initially
  if (isLoading) {
    console.log("ClientRoute: Auth state is loading...");
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="h-10 w-10 animate-spin text-gray-500" />
      </div>
    );
  }

  // Redirect to login if not authenticated OR if role is explicitly NOT 'client'
  // Allow admin role as well? (Optional - adjust if admins should access client routes)
  // const isAllowedRole = role === 'client' || role === 'admin'; // Example if admin can also access
  const isAllowedRole = role === 'client'; // Strict client-only access

  if (!isAuthenticated || !isAllowedRole) {
    console.warn(`ClientRoute: Access DENIED. isAuthenticated: ${isAuthenticated}, Role: ${role}, isLoading: ${isLoading}`);
    // Redirect them to the login page, passing the current location
    return <Navigate to="/my-page" state={{ from: location, defaultTab: 'client' }} replace />;
  }

  // If authenticated and role is allowed, render the child routes
  console.log("ClientRoute: Access GRANTED.");
  return <Outlet />;
};

export default ClientRoute;