import React from "react";
import { Link } from "react-router-dom";
import { LogOut, Bell, User, Home, Menu } from "lucide-react";
import { useAuth } from "../../../../features/auth/AuthProvider";

interface TopbarProps {
  setSidebarOpen: (open: boolean) => void;
  handleSignOut: () => Promise<void>;
}

const Topbar: React.FC<TopbarProps> = ({ setSidebarOpen, handleSignOut }) => {
  const { user } = useAuth();

  return (
    <div className="bg-white shadow-sm px-4 py-3 flex justify-between items-center sticky top-0 z-10 border-b">
      <div className="flex items-center">
        <button
          onClick={() => setSidebarOpen(true)}
          className="text-gray-600 hover:text-[#FF5722] lg:hidden mr-3 p-1 rounded-full"
          title="Open menu"
        >
          <Menu size={24} />
        </button>
        <h1 className="text-xl font-semibold text-gray-800">Admin Dashboard</h1>
      </div>

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

        <button className="text-gray-500 hover:text-gray-700 relative">
          <Bell size={20} />
        </button>

        <div className="flex items-center space-x-2">
          <User size={20} className="text-gray-500" />
          <span className="text-sm text-gray-700 hidden sm:block">
            {user?.email || "Admin"}
          </span>
          <button
            onClick={handleSignOut}
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
