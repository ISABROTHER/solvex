// @ts-nocheck
import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion'; 
import {
  LayoutDashboard, Users, FileText, Settings, LogOut,
  Package, Wrench, Briefcase, FileCheck, UsersRound,
  UserCheck,
  ClipboardList // <-- 1. IMPORT NEW ICON
} from 'lucide-react';
import { useAuth } from '../../../../features/auth/AuthProvider';
import { TabKey } from '..'; 

// --- ICONS & NAV ITEMS (Unchanged) ---
const icons = {
  home: LayoutDashboard,
  clients: UsersRound,
  accessRequests: UserCheck,
  equipment: Package,
  services: Wrench,
  jobs: Briefcase,
  applications: FileCheck,
  employees: Users,
  assignments: ClipboardList, // <-- 2. ADD ICON
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
  { name: 'Employees', path: 'employees', icon: 'employees' },
  { name: 'Assignments', path: 'assignments', icon: 'assignments' }, // <-- 3. ADD NAV ITEM
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
      {/* Logo (Removed) */}
      <div className="h-16 flex items-center justify-center px-4 mb-2">
        {/* Logo space left blank as requested */}
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
                  ? 'bg-[#FF5722]/10 text-[#FF5722] font-semibold' // Active
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900' // Hover
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
          className="flex items-center w-full space-x-3 px-3 py-2.5 rounded-md text-sm font-medium hover:bg-red-50 hover:text-red-600 transition-colors text-gray-600"
        >
          <LogOut size={18} />
          <span>Logout</span>
        </button>
      </div>
    </>
  );

  // --- MOBILE SIDEBAR RENDER (NOW ANIMATED) ---
  if (isMobile) {
    return (
      <AnimatePresence>
        {isOpenMobile && ( // Only render if open
          <div className="fixed inset-0 z-40 lg:hidden">
            {/* Backdrop */}
            <motion.div
              className="absolute inset-0 bg-black/60"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onCloseMobile}
            />
            {/* Panel */}
            <motion.div
              className="relative bg-white text-gray-600 w-72 h-full space-y-6 py-7 px-2 flex flex-col"
              initial={{ x: "-100%" }} // Start off-screen left
              animate={{ x: 0 }} // Animate to on-screen
              exit={{ x: "-100%" }} // Animate off-screen left
              transition={{ type: 'spring', stiffness: 300, damping: 30 }} // Smooth animation
            >
              {sidebarContent}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    );
  }

  // --- DESKTOP SIDEBAR RENDER (Unchanged) ---
  return (
    <div className="bg-white text-gray-600 w-72 space-y-6 py-7 px-2 flex flex-col h-full border-r border-gray-200">
      {sidebarContent}
    </div>
  );
};

export default SideBar;