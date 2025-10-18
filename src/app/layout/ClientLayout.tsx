// src/app/layout/ClientLayout.tsx
import React from 'react';
import { Outlet, Link, NavLink } from 'react-router-dom';
import { LayoutDashboard, Home, User, FileText } from 'lucide-react'; // Import icons

const ClientLayout: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-neutral-50">
      {/* --- Top Navigation Bar for Client Portal --- */}
      <nav className="w-full flex items-center justify-between px-4 sm:px-6 py-3 border-b bg-white shadow-sm sticky top-0 z-10">
        {/* Left Side: Dashboard Link */}
        <NavLink
          to="/client"
          className={({ isActive }) =>
            `flex items-center gap-1.5 text-sm transition-colors ${
              isActive
                ? 'font-semibold text-[#FF5722]'
                : 'text-gray-600 hover:text-gray-900'
            }`
          }
          end
        >
          <LayoutDashboard size={18} />
          <span className="hidden sm:inline">Client Dashboard</span>
          <span className="sm:hidden">Dashboard</span>
        </NavLink>

        {/* Center: Other Links (Optional) - Hidden on mobile */}
        <div className="hidden sm:flex items-center gap-4 sm:gap-6">
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
        </div>

        {/* Right Side: Back to Site Link */}
        <Link
          to="/"
          className="flex items-center gap-1 sm:gap-1.5 text-xs sm:text-sm text-gray-500 hover:text-[#FF5722] transition-colors"
          title="Back to Main Site"
        >
          <Home size={16} />
          <span className="hidden sm:inline">Back to Site</span>
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