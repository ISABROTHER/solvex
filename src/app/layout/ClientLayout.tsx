import React from 'react';
import { Outlet, Link, NavLink } from 'react-router-dom';
import { LayoutDashboard, Home } from 'lucide-react'; // Import necessary icons

const ClientLayout: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-neutral-50">
      {/* --- Re-added Top Navigation Bar for Client Portal --- */}
      <nav className="w-full flex items-center justify-between px-4 sm:px-6 py-3 border-b bg-white shadow-sm sticky top-0 z-10">
        {/* Dashboard Link */}
        <NavLink
          to="/client" // Link to the client dashboard home
          className={({ isActive }) =>
            `flex items-center gap-2 text-sm transition-colors ${
              isActive
                ? 'font-semibold text-[#FF5722]'
                : 'text-gray-600 hover:text-gray-900'
            }`
          }
          end // Ensures only exact match for Dashboard is active
        >
          <LayoutDashboard size={18} />
          Client Dashboard
        </NavLink>

        {/* You can add Requests/Profile links back here if desired */}
        {/* <NavLink to="/client/requests" ...>Requests</NavLink> */}
        {/* <NavLink to="/client/profile" ...>Profile</NavLink> */}

        {/* Back to Main Site Link */}
        <Link
          to="/"
          className="flex items-center gap-1.5 text-xs sm:text-sm text-gray-500 hover:text-[#FF5722] transition-colors"
        >
          <Home size={16} />
          Back to Main Site
        </Link>
      </nav>
      {/* --- End Top Navigation Bar --- */}

      {/* Main Content Area */}
      <div className="flex-1">
        <Outlet />
      </div>
    </div>
  );
};

export default ClientLayout;