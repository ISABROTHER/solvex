import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from './AuthProvider';
import { Loader2 } from 'lucide-react';

const EmployeeRoute: React.FC = () => {
  const { isAuthenticated, role, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    console.log("EmployeeRoute: Auth state is loading...");
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="h-10 w-10 animate-spin text-gray-500" />
      </div>
    );
  }

  if (!isAuthenticated || role !== 'employee') {
    console.warn(`EmployeeRoute: Access DENIED. isAuthenticated: ${isAuthenticated}, Role: ${role}, isLoading: ${isLoading}`);
    return <Navigate to="/my-page" state={{ from: location, defaultTab: 'employee' }} replace />;
  }

  console.log("EmployeeRoute: Access GRANTED.");
  return <Outlet />;
};

export default EmployeeRoute;
