// @ts-nocheck
import React from "react";
import { Link } from "react-router-dom"; // <-- ADD THIS IMPORT
import { LogOut, Bell, User, Home } from "lucide-react"; // <-- ADD 'Home' ICON
import { useAuth } from "../../../../features/auth/AuthProvider"; // <-- CORRECTED IMPORT

interface TopbarProps {
  toggleSidebar: () => void; // Assuming toggleSidebar is passed as a prop
}

const Topbar: React.FC<TopbarProps> = ({ toggleSidebar }) => {
  const { user, logout } = useAuth(); // Get user info and logout function

  const handleLogout = async () => {
    try {
      await logout();
      // Navigation happens inside the logout function in AuthProvider
    } catch (error) {
      console.error("Logout failed from Topbar:", error);
      // Optionally show a toast notification for logout failure
    }
  };


  return (
    <div className="bg-white shadow-sm px-4 py-3 flex justify-between items-center sticky top-0 z-10 border-b">
      {/* Left side: Search bar or other controls - Placeholder */}
      <div className="flex items-center">
         {/* Hamburger Menu Icon (Optional - if needed for mobile) */}
         {/* <button onClick={toggleSidebar} className="text-gray-600 focus:outline-none lg:hidden mr-4">
             <Menu size={24} />
         </button> */}
         <h1 className="text-xl font-semibold text-gray-800">Admin Dashboard</h1>
      </div>

      {/* Right side: Icons and User Info */}
      <div className="flex items-center space-x-4">
        {/* --- START: ADDED "BACK TO HOME" LINK --- */}
        <Link
          to="/"
          className="flex items-center gap-1.5 text-sm text-gray-600 hover:text-[#FF5722] transition-colors"
          title="Back to Home"
        >
          <Home size={18} />
          <span className="hidden sm:inline">Back to Home</span>
        </Link>
        <div className="h-6 w-px bg-gray-200"></div> 
        {/* --- END: ADDED "BACK TO HOME" LINK --- */}
        
        {/* Notifications Icon (Placeholder) */}
        <button className="text-gray-500 hover:text-gray-700 relative">
          <Bell size={20} />
          {/* Optional: Notification badge */}
          {/* <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-500 ring-2 ring-white"></span> */}
        </button>

        {/* User Info / Logout */}
        <div className="flex items-center space-x-2">
          <User size={20} className="text-gray-500" />
          <span className="text-sm text-gray-700 hidden sm:block">
            {/* Display user email or name if available */}
            {user?.email || "Admin"}
          </span>
          <button
            onClick={handleLogout}
            className="text-gray-500 hover:text-red-600"
            title="Logout"
          >
            <LogOut size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Topbar;