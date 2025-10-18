import React from 'react';
import { Outlet, Link, NavLink } from 'react-router-dom';
import { LayoutDashboard, FileText, User } from 'lucide-react'; // Import icons

const ClientLayout: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-neutral-50">
      {/* Updated Top Bar */}
      <div className="w-full flex items-center justify-between px-4 sm:px-6 py-2 border-b bg-white shadow-sm sticky top-0 z-10">
        {/* Left Side: Logo/Brand (Optional) */}
        <Link to="/client" className="text-lg font-bold text-gray-800 hover:text-[#FF5722] transition-colors">
          Client Portal
        </Link>

        {/* Center: Navigation Links */}
        <nav className="flex items-center gap-4 sm:gap-6">
          <NavLink
            to="/client"
            className={({ isActive }) =>
              `flex items-center gap-1.5 text-sm transition-colors ${
                isActive
                  ? 'font-semibold text-[#FF5722]'
                  : 'text-gray-600 hover:text-gray-900'
              }`
            }
            end // Ensures only exact match for Dashboard is active
          >
            <LayoutDashboard size={16} />
            Dashboard
          </NavLink>
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
        </nav>

        {/* Right Side: Back to Site Link */}
        <Link
          to="/"
          className="text-xs sm:text-sm text-gray-500 hover:text-[#FF5722] transition-colors underline underline-offset-2"
        >
          Back to Site
        </Link>
      </div>
      {/* Main Content Area */}
      <div className="flex-1">
        <Outlet />
      </div>
    </div>
  );
};

export default ClientLayout;