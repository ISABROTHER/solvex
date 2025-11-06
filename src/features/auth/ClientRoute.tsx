import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from './AuthProvider'; // <-- CORRECTED IMPORT
import { Loader2 } from 'lucide-react'; // For loading state

const ClientRoute: React.FC = () => {
  // --- UPDATED: Get approval_status ---
  const { isAuthenticated, role, isLoading, approval_status } = useAuth(); // Get role and loading status
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

  // 1. Not logged in
  if (!isAuthenticated) {
    console.warn(`ClientRoute: Access DENIED. Not authenticated.`);
    return <Navigate to="/my-page" state={{ from: location, defaultTab: 'client' }} replace />;
  }
  
  // 2. Logged in, but not a client (e.g., admin, employee)
  if (role !== 'client') {
     console.warn(`ClientRoute: Access DENIED. Role is '${role}', not 'client'.`);
     // Send them back to login, maybe they meant to use another portal
     return <Navigate to="/my-page" state={{ from: location, defaultTab: role || 'client' }} replace />;
  }

  // 3. Logged in as a client, check approval status
  switch (approval_status) {
    case 'approved':
      console.log("ClientRoute: Access GRANTED. Status: 'approved'.");
      return <Outlet />; // Render the client dashboard
      
    case 'pending':
      console.log("ClientRoute: Access PENDING. Redirecting to /pending-access.");
      return <Navigate to="/pending-access" replace />;
      
    case 'denied':
      console.log("ClientRoute: Access DENIED. Redirecting to /access-denied.");
      return <Navigate to="/access-denied" replace />;

    default:
      // This handles 'null' or any other unexpected status
      console.warn(`ClientRoute: Unknown approval status: '${approval_status}'. Defaulting to pending.`);
      return <Navigate to="/pending-access" replace />;
  }
};

export default ClientRoute;