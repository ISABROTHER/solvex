// @ts-nocheck
import React from "react";
import { Link } from "react-router-dom";
import { LogOut, Bell, User, Home, Menu } from "lucide-react"; // <-- IMPORT 'Menu' ICON
import { useAuth } from "../../../../features/auth/AuthProvider"; 

// --- UPDATED PROPS TO MATCH index.tsx ---
interface TopbarProps {
  onMenuClick: () => void;
  onDesktopMenuClick: () => void;
}

const Topbar: React.FC<TopbarProps> = ({ onMenuClick, onDesktopMenuClick }) => {
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
      {/* Left side: Menu Toggles & Title */}
      <div className="flex items-center">
        {/* --- START: ADDED MENU BUTTONS --- */}

        {/* Desktop Menu Toggle (Hidden on mobile) */}
        <button 
          onClick={onDesktopMenuClick} 
          className="text-gray-600 hover:text-[#FF5722] hidden lg:block mr-3 p-1 rounded-full"
          title="Toggle sidebar"
        >
            <Menu size={24} />
        </button>

        {/* Mobile Menu Toggle (Shows on mobile) */}
        <button 
          onClick={onMenuClick} 
          className="text-gray-600 hover:text-[#FF5722] lg:hidden mr-3 p-1 rounded-full"
          title="Open menu"
        >
            <Menu size={24} />
        </button>
        {/* --- END: ADDED MENU BUTTONS --- */}
         
         <h1 className="text-xl font-semibold text-gray-800">Admin Dashboard</h1>
      </div>

      {/* Right side: Icons and User Info */}
      <div className="flex items-center space-x-4">
        <Link
          to="/"
          className="flex items-center gap-1.5 text-sm text-gray-600 hover:text-[#FF5722] transition-colors"
          title="Back to Home"
        >
          <Home size={18} />
          <span className="hidden sm:inline">Back to Home</span>
        </Link>
        <div className="h-6 w-px bg-gray-200"></div> 
        
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