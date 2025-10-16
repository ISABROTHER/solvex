import React from "react";
import { Bell, Menu, LogOut, Home } from "lucide-react"; // Import the Home icon
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../../../features/auth";

const Topbar: React.FC<{ onMenuClick?: () => void; onDesktopMenuClick?: () => void; }> = ({ onMenuClick, onDesktopMenuClick }) => {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleLogout = async () => {
    try {
      logout();
      navigate("/"); // Redirect to home after logout
    } catch (err) {
      console.error("Logout failed:", err);
      navigate("/"); // Still redirect even if logout has an error
    }
  };

  return (
    <header className="sticky top-0 z-30 h-14 border-b bg-white/80 backdrop-blur flex items-center justify-between px-3 sm:px-4 flex-shrink-0">
      <div className="flex items-center gap-2">
        {/* Mobile menu button */}
        <button
          className="p-2 -ml-1 rounded-md hover:bg-gray-100 sm:hidden"
          aria-label="Open menu"
          onClick={onMenuClick}
        >
          <Menu size={18} />
        </button>

        {/* Desktop sidebar toggle */}
        <button
          className="p-2 -ml-1 rounded-md hover:bg-gray-100 hidden sm:block"
          aria-label="Toggle sidebar"
          onClick={onDesktopMenuClick}
        >
          <Menu size={18} />
        </button>

        <Link
          to="/"
          className="text-sm font-semibold text-gray-800 hover:text-gray-900 transition-colors"
          aria-label="Back to public website home"
        >
          Admin Panel
        </Link>
      </div>

      <div className="flex items-center gap-3">
        {/* --- NEW BUTTON ADDED HERE --- */}
        <Link
          to="/"
          className="flex items-center gap-1.5 rounded-md border px-2 py-1 text-sm text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-colors"
          aria-label="Back to public website"
        >
          <Home size={16} />
          <span className="hidden sm:inline">Back to Site</span>
        </Link>
        {/* --- END OF NEW BUTTON --- */}

        <button className="relative rounded-full p-2 hover:bg-gray-100" aria-label="Notifications">
          <Bell size={18} />
          <span className="absolute -right-0.5 -top-0.5 inline-flex h-2.5 w-2.5 rounded-full bg-red-500" />
        </button>

        <button
          onClick={handleLogout}
          className="flex items-center gap-1 rounded-md border px-2 py-1 text-sm hover:bg-gray-50"
        >
          <LogOut size={16} /> Logout
        </button>
      </div>
    </header>
  );
};

export default Topbar;