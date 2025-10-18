import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from './useAuth';

const ClientRoute: React.FC = () => {
  const { isAuthenticated, role, isLoading } = useAuth();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return isAuthenticated && role === 'client' ? <Outlet /> : <Navigate to="/my-page" replace />;
};

export default ClientRoute;