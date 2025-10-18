import React from 'react';
import { Outlet, Link, NavLink } from 'react-router-dom';
import { LayoutDashboard, Home } from 'lucide-react'; // Removed User, added Home
import { useClientMock } from '../../pages/client/useClientMock'; // Import the mock hook to get avatar

const ClientLayout: React.FC = () => {
  // Get client data to access the avatarUrl
  const { client } = useClientMock();

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

        {/* Center: Profile Link with Image */}
        <div className="hidden sm:flex items-center gap-4 sm:gap-6 absolute left-1/2 transform -translate-x-1/2"> {/* Center the profile link */}
          <NavLink
            to="/client/profile"
            className={({ isActive }) =>
              `flex items-center gap-2 text-sm transition-colors ${ // Increased gap slightly
                isActive
                  ? 'font-semibold text-[#FF5722]'
                  : 'text-gray-600 hover:text-gray-900'
              }`
            }
          >
            {/* --- Added Client Avatar Image --- */}
            <img
                src={client.avatarUrl}
                alt="Client profile picture"
                className="h-6 w-6 rounded-full object-cover border border-gray-200" // Added styling
            />
            {/* --- End Client Avatar Image --- */}
            Profile
          </NavLink>
          {/* You can add Requests link back here if needed */}
          {/* <NavLink to="/client/requests" ... >Requests</NavLink> */}
        </div>

        {/* Back to Main Site Link (Right-aligned) */}
        <Link
          to="/"
          className="flex items-center gap-1 sm:gap-1.5 text-xs sm:text-sm text-gray-500 hover:text-[#FF5722] transition-colors ml-auto sm:ml-0" // Ensure this is pushed right
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