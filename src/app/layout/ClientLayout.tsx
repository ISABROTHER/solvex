import React from 'react';
import { Outlet, Link, NavLink } from 'react-router-dom';
import { LayoutDashboard, FileText, User, Home } from 'lucide-react'; // Import icons

const ClientLayout: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-neutral-50">
      {/* --- Top Navigation Bar for Client Portal --- */}
      <nav className="w-full flex items-center justify-between px-4 sm:px-6 py-3 border-b bg-white shadow-sm sticky top-0 z-10">
        {/* Dashboard Link (Left-aligned or part of center group) */}
        <NavLink
          to="/client" // Link to the client dashboard home
          className={({ isActive }) =>
            `flex items-center gap-1.5 text-sm transition-colors mr-auto sm:mr-0 ${ // mr-auto pushes nav center/right on mobile
              isActive
                ? 'font-semibold text-[#FF5722]'
                : 'text-gray-600 hover:text-gray-900'
            }`
          }
          end // Ensures only exact match for Dashboard is active
        >
          <LayoutDashboard size={18} />
          <span className="hidden sm:inline">Client Dashboard</span> {/* Hide text on small screens */}
           <span className="sm:hidden">Dashboard</span> {/* Show shorter text on small screens */}
        </NavLink>

        {/* Center: Optional Navigation Links ( uncomment if needed later ) */}
        <div className="hidden sm:flex items-center gap-4 sm:gap-6"> {/* Hide these links on mobile for simplicity */}
          {/*
          <NavLink
            to="/client/requests"
            className={({ isActive }) =>
              `flex items-center gap-1.5 text-sm transition-colors ${
                isActive
                  ? 'font-semibold text-[#FF5722]'
                  : 'text-gray-600 hover:text-gray-900'
              }`
            }
          >
            <FileText size={16} />
            Requests
          </NavLink>
          <NavLink
            to="/client/profile"
            className={({ isActive }) =>
              `flex items-center gap-1.5 text-sm transition-colors ${
                isActive
                  ? 'font-semibold text-[#FF5722]'
                  : 'text-gray-600 hover:text-gray-900'
              }`
            }
          >
            <User size={16} />
            Profile
          </NavLink>
           */}
        </div>

        {/* Back to Main Site Link (Right-aligned) */}
        <Link
          to="/"
          className="flex items-center gap-1 sm:gap-1.5 text-xs sm:text-sm text-gray-500 hover:text-[#FF5722] transition-colors ml-auto sm:ml-0" // ml-auto pushes link right on mobile
          title="Back to Main Site" // Added title for clarity
        >
          <Home size={16} />
          <span className="hidden sm:inline">Back to Site</span> {/* Hide text on small screens */}
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