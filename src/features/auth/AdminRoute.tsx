import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from './AuthProvider'; // <-- CORRECTED IMPORT
import { Loader2 } from 'lucide-react'; // For loading state

const AdminRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isAdmin, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="h-10 w-10 animate-spin text-gray-500" />
      </div>
    );
  }

  if (!user || !isAdmin) {
    return <Navigate to="/my-page" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

export default AdminRoute;