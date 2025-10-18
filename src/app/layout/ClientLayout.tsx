import React from 'react';
import { Outlet, Link, NavLink } from 'react-router-dom';
// Removed unused User import, kept LayoutDashboard and Home
import { LayoutDashboard, Home, User } from 'lucide-react';
// Removed the import for useClientMock as the avatar is no longer needed

const ClientLayout: React.FC = () => {
  // Removed the call to useClientMock

  return (
    <div className="min-h-screen flex flex-col bg-neutral-50">
      {/* --- Top Navigation Bar for Client Portal --- */}
      <nav className="w-full flex items-center justify-between px-4 sm:px-6 py-3 border-b bg-white shadow-sm sticky top-0 z-10">
        {/* Dashboard Link */}
        <NavLink
          to="/client"
          className={({ isActive }) =>
            `flex items-center gap-2 text-sm transition-colors mr-auto sm:mr-0 ${
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

        {/* Center: Profile Link (Text Only) */}
        <div className="hidden sm:flex items-center gap-4 sm:gap-6 absolute left-1/2 transform -translate-x-1/2">
          <NavLink
            to="/client/profile"
            className={({ isActive }) =>
              `flex items-center gap-1.5 text-sm transition-colors ${ // Using gap-1.5 for consistency if icon is re-added
                isActive
                  ? 'font-semibold text-[#FF5722]'
                  : 'text-gray-600 hover:text-gray-900'
              }`
            }
          >
            {/* --- Removed Client Avatar Image, Optionally add User icon back --- */}
             <User size={16} /> {/* Optional: Add User icon back if desired */}
            {/* --- End Removal --- */}
            Profile
          </NavLink>
          {/* You can add Requests link back here if needed */}
          {/* <NavLink to="/client/requests" ... >Requests</NavLink> */}
        </div>

        {/* Back to Main Site Link (Right-aligned) */}
        <Link
          to="/"
          className="flex items-center gap-1 sm:gap-1.5 text-xs sm:text-sm text-gray-500 hover:text-[#FF5722] transition-colors ml-auto sm:ml-0"
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