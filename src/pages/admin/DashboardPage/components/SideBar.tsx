// @ts-nocheck
import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Users, FileText, Settings, LogOut,
  Package, Wrench, Briefcase, FileCheck, UsersRound,
  UserCheck // Added UserCheck for Access Requests
} from 'lucide-react';
import { useAuth } from '../../../../features/auth/AuthProvider'; // <-- CORRECTED IMPORT PATH

// Define icons map if not already defined globally
const icons = {
  home: LayoutDashboard,
  clients: UsersRound, // Updated Icon
  accessRequests: UserCheck, // Added Icon
  equipment: Package,
  services: Wrench,
  jobs: Briefcase,
  applications: FileCheck, // Keep if separate tab
  settings: Settings,
};

// Define navigation items
const navItems = [
  { name: 'Home', path: '', icon: 'home' },
  { name: 'Clients', path: 'clients', icon: 'clients' },
  { name: 'Access Requests', path: 'access-requests', icon: 'accessRequests' }, // Added Nav Item
  { name: 'Equipment', path: 'equipment', icon: 'equipment' },
  { name: 'Services', path: 'services', icon: 'services' },
  { name: 'Jobs', path: 'jobs', icon: 'jobs' },
  { name: 'Applications', path: 'applications', icon: 'applications' },
  { name: 'Settings', path: 'settings', icon: 'settings' },
];

interface SideBarProps {
  isOpen: boolean; // Assuming state is managed by parent
}

const SideBar: React.FC<SideBarProps> = ({ isOpen }) => {
  const { logout } = useAuth(); // Get logout function
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/my-page'); // Explicit navigation after logout, though AuthProvider might also handle it
    } catch (error) {
      console.error("Logout failed from Sidebar:", error);
      // Optionally show an error toast
    }
  };

  return (
    <div className={`fixed inset-y-0 left-0 bg-gray-900 text-gray-300 w-64 space-y-6 py-7 px-2 transform ${isOpen ? 'translate-x-0' : '-translate-x-full'} transition-transform duration-200 ease-in-out lg:relative lg:translate-x-0 lg:block z-30 shadow-lg`}>

      {/* Logo or Brand */}
      <div className="px-4 mb-6">
        <NavLink to="/admin" className="flex items-center justify-center">
          {/* --- MODIFICATION: Replaced text with your logo --- */}
          <img
            src="https://i.imgur.com/MhcvKs3.png"
            alt="SolveX Studios Logo"
            className="h-10"
          />
        </NavLink>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-4 space-y-2">
        {navItems.map((item) => {
          const IconComponent = icons[item.icon as keyof typeof icons] || LayoutDashboard; // Fallback icon
          return (
            <NavLink
              key={item.name}
              to={`/admin/${item.path}`} // Base path is /admin
              end={item.path === ''} // `end` prop for exact match on Home route
              className={({ isActive }) =>
                `flex items-center space-x-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-gray-700 text-white shadow-inner'
                    : 'hover:bg-gray-700 hover:text-white'
                }`
              }
            >
              <IconComponent size={18} />
              <span>{item.name}</span>
            </NavLink>
          );
        })}
      </nav>

      {/* Logout Button */}
      <div className="absolute bottom-0 left-0 w-full px-4 pb-4">
        <button
          onClick={handleLogout}
          className="flex items-center w-full space-x-3 px-3 py-2.5 rounded-md text-sm font-medium hover:bg-red-700 hover:text-white transition-colors text-red-400"
        >
          <LogOut size={18} />
          <span>{isUpdatingStatus === r.id ? 'Saving...' : (r.status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()))}</span>
        </button>
      </div>
    </div>
  );
};

export default SideBar;