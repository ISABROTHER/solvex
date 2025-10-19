import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from './AuthProvider'; // <-- CORRECTED IMPORT
import { Loader2 } from 'lucide-react'; // For loading state

const AdminRoute: React.FC = () => {
  const { isAuthenticated, role, isLoading } = useAuth(); // Get role and loading status
  const location = useLocation();

  // Show loading indicator while session/role is being checked initially
  // This prevents brief flashes of the login page for already authenticated users
  if (isLoading) {
    console.log("AdminRoute: Auth state is loading...");
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="h-10 w-10 animate-spin text-gray-500" />
      </div>
    );
  }

  // Redirect to login if not authenticated OR if role is explicitly NOT 'admin'
  // We allow null role briefly during loading, but not after loading is complete.
  if (!isAuthenticated || role !== 'admin') {
     console.warn(`AdminRoute: Access DENIED. isAuthenticated: ${isAuthenticated}, Role: ${role}, isLoading: ${isLoading}`);
    // Redirect them to the login page, passing the current location
    // So they can redirect back after logging in successfully as admin
    return <Navigate to="/my-page" state={{ from: location, defaultTab: 'admin' }} replace />;
  }

  // If authenticated and role IS 'admin', render the child routes (Admin Dashboard)
  console.log("AdminRoute: Access GRANTED.");
  return <Outlet />;
};

export default AdminRoute;