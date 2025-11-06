import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from './AuthProvider'; // <-- CORRECTED IMPORT
import { Loader2 } from 'lucide-react'; // For loading state

const AdminRoute: React.FC = () => {
  // --- 1. GET isRestoring FROM useAuth ---
  const { isAuthenticated, role, isLoading, isRestoring } = useAuth(); // Get role and loading status
  const location = useLocation();

  // --- 2. ADD isRestoring TO THE LOADING CHECK ---
  // This prevents brief flashes of the login page for already authenticated users
  if (isLoading || isRestoring) {
    console.log(`AdminRoute: Auth state is loading (isLoading: ${isLoading}, isRestoring: ${isRestoring})...`);
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="h-10 w-10 animate-spin text-gray-500" />
      </div>
    );
  }

  // Redirect employees to their dashboard
  if (isAuthenticated && role === 'employee') {
    console.warn(`AdminRoute: Employee trying to access admin area. Redirecting to employee dashboard.`);
    return <Navigate to="/employee/dashboard" replace />;
  }

  // Redirect to login if not authenticated OR if role is explicitly NOT 'admin'
  if (!isAuthenticated || role !== 'admin') {
     console.warn(`AdminRoute: Access DENIED. isAuthenticated: ${isAuthenticated}, Role: ${role}, isLoading: ${isLoading}, isRestoring: ${isRestoring}`);
    return <Navigate to="/my-page" state={{ from: location, defaultTab: 'admin' }} replace />;
  }

  // If authenticated and role IS 'admin', render the child routes (Admin Dashboard)
  console.log("AdminRoute: Access GRANTED.");
  return <Outlet />;
};

export default AdminRoute;