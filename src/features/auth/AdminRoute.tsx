import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from './useAuth';

const AdminRoute: React.FC = () => {
  const { isAuthenticated, role, isLoading } = useAuth();

  if (isLoading) {
    return <div>Loading...</div>;
  }
  
  return isAuthenticated && role === 'admin' ? <Outlet /> : <Navigate to="/my-page" state={{ defaultTab: 'admin' }} replace />;
};

export default AdminRoute;