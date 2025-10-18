import React from 'react';
import { Outlet } from 'react-router-dom';
// Removed unused imports: Link, NavLink, LayoutDashboard, FileText, User

const ClientLayout: React.FC = () => {
  return (
    // Removed the outer div with flex-col and the top bar div
    // The main container is now just the Outlet wrapper
    <div className="min-h-screen bg-neutral-50"> {/* Added min-h-screen and bg here */}
      {/* Main Content Area */}
      <div className="flex-1"> {/* Kept flex-1 for potential future layout needs */}
        <Outlet />
      </div>
    </div>
  );
};

export default ClientLayout;