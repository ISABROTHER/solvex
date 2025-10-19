import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from './AuthProvider'; // <-- CORRECTED IMPORT
import { Loader2 } from 'lucide-react';

const AdminRoute: React.FC = () => {
  const { isAuthenticated, role, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="h-10 w-10 animate-spin text-gray-500" />
      </div>
    );
  }

  if (!isAuthenticated || role !== 'admin') {
    console.warn(`AdminRoute: Access denied. Auth: ${isAuthenticated}, Role: ${role}`);
    return <Navigate to="/my-page" state={{ from: location, defaultTab: 'admin' }} replace />;
  }

  return <Outlet />;
};

export default AdminRoute;