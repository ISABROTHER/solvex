import React from "react";
import { Menu, Bell, User, LogOut } from "lucide-react";

interface TopbarProps {
  onMenuClick: () => void;
  onDesktopMenuClick: () => void;
}

const Topbar: React.FC<TopbarProps> = ({ onMenuClick, onDesktopMenuClick }) => {
  return (
    <div className="bg-white shadow-md px-4 py-3 flex justify-between items-center sticky top-0 z-10 border-b border-gray-200">
      <div className="flex items-center gap-4">
        <button
          onClick={onMenuClick}
          className="sm:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
          aria-label="Open menu"
        >
          <Menu className="w-5 h-5 text-gray-700" />
        </button>
        <button
          onClick={onDesktopMenuClick}
          className="hidden sm:block p-2 rounded-lg hover:bg-gray-100 transition-colors"
          aria-label="Toggle sidebar"
        >
          <Menu className="w-5 h-5 text-gray-700" />
        </button>
        <h1 className="text-xl font-bold text-gray-900">Admin Dashboard</h1>
      </div>

      <div className="flex items-center space-x-4">
        <button className="text-gray-500 hover:text-[#FF5722] transition-colors relative">
          <Bell size={20} />
        </button>

        <div className="flex items-center space-x-2">
          <User size={20} className="text-gray-500" />
          <span className="text-sm text-gray-700 hidden sm:block">Admin</span>
        </div>
      </div>
    </div>
  );
};

export default Topbar;
