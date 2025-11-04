// @ts-nocheck
import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Users, FileText, Settings, LogOut,
  Package, Wrench, Briefcase, FileCheck, UsersRound,
  UserCheck
} from 'lucide-react';
import { useAuth } from '../../../../features/auth/AuthProvider';
import { TabKey } from '..'; // Import TabKey from index

// --- ICONS & NAV ITEMS (Unchanged) ---
const icons = {
  home: LayoutDashboard,
  clients: UsersRound,
  accessRequests: UserCheck,
  equipment: Package,
  services: Wrench,
  jobs: Briefcase,
  applications: FileCheck,
  settings: Settings,
};

const navItems = [
  { name: 'Home', path: '', icon: 'home' },
  { name: 'Clients', path: 'clients', icon: 'clients' },
  { name: 'Access Requests', path: 'access-requests', icon: 'accessRequests' },
  { name: 'Equipment', path: 'equipment', icon: 'equipment' },
  { name: 'Services', path: 'services', icon: 'services' },
  { name: 'Jobs', path: 'jobs', icon: 'jobs' },
  { name: 'Applications', path: 'applications', icon: 'applications' },
  { name: 'Settings', path: 'settings', icon: 'settings' },
];

// --- UPDATED PROPS INTERFACE ---
interface SideBarProps {
  active: TabKey;
  onSelect: (key: TabKey) => void;
  isMobile?: boolean;
  isOpenMobile?: boolean;
  onCloseMobile?: () => void;
}

const SideBar: React.FC<SideBarProps> = ({
  active,
  onSelect,
  isMobile = false,
  isOpenMobile = false,
  onCloseMobile,
}) => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleSelect = (key: TabKey) => {
    onSelect(key);
    if (isMobile && onCloseMobile) {
      onCloseMobile(); // Close mobile menu on selection
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/my-page');
    } catch (error) {
      console.error("Logout failed from Sidebar:", error);
    }
  };

  // --- REUSABLE SIDEBAR CONTENT ---
  const sidebarContent = (
    <>
      {/* Logo */}
      <div className="px-4 mb-6">
        <NavLink to="/admin" className="flex items-center justify-center">
          <img
            src="https://i.imgur.com/MhcvKs3.png" // Your logo
            alt="SolveX Studios Logo"
            className="h-10"
          />
        </NavLink>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-4 space-y-2">
        {navItems.map((item) => {
          const IconComponent = icons[item.icon as keyof typeof icons] || LayoutDashboard;
          // Convert path to TabKey format (e.g., "access-requests" -> "access_requests")
          const itemKey = item.path === '' ? 'home' : item.path.replace(/-/g, '_');
          const isActive = active === itemKey;

          return (
            // Use buttons to trigger onSelect handler
            <button
              key={item.name}
              onClick={() => handleSelect(itemKey as TabKey)}
              className={`flex items-center w-full space-x-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-[#FF5722] text-white shadow-inner' // <-- BRANDED ACTIVE COLOR
                  : 'text-gray-300 hover:bg-[#FF5722]/20 hover:text-[#FF5722]' // <-- BRANDED HOVER COLOR
              }`}
            >
              <IconComponent size={18} />
              <span>{item.name}</span>
            </button>
          );
        })}
      </nav>

      {/* Logout Button (relative, not absolute) */}
      <div className="px-4 pb-4">
        <button
          onClick={handleLogout}
          className="flex items-center w-full space-x-3 px-3 py-2.5 rounded-md text-sm font-medium hover:bg-[#FF5722]/20 hover:text-[#FF5722] transition-colors text-gray-400" // <-- BRANDED HOVER
        >
          <LogOut size={18} />
          <span>Logout</span>
        </button>
      </div>
    </>
  );

  // --- MOBILE SIDEBAR RENDER ---
  if (isMobile) {
    return (
      <div className={`fixed inset-0 z-40 ${isOpenMobile ? 'block' : 'hidden'} lg:hidden`}>
        {/* Backdrop */}
        <div className="absolute inset-0 bg-black/60" onClick={onCloseMobile} />
        {/* Panel */}
        <div className="relative bg-gray-900 text-gray-300 w-72 h-full space-y-6 py-7 px-2 flex flex-col">
          {sidebarContent}
        </div>
      </div>
    );
  }

  // --- DESKTOP SIDEBAR RENDER ---
  return (
    <div className="bg-gray-900 text-gray-300 w-72 space-y-6 py-7 px-2 flex flex-col h-full">
      {sidebarContent}
    </div>
  );
};

export default SideBar;