// @ts-nocheck
import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { 
  Home, 
  Users, 
  Briefcase, 
  Settings, 
  LogOut, 
  ShieldCheck,
  UserCheck,
  FileText,
  ClipboardList,
  UserPlus,
  Package,
  Wrench,
  Building,
  HardHat
} from 'lucide-react';
import { useAuth } from '../../../../features/auth';

const NAV_LINKS = [
  { name: 'Home', path: '/admin/dashboard', icon: Home, exact: true },
  { name: 'Access Requests', path: '/admin/dashboard/access-requests', icon: ShieldCheck },
  { name: 'Clients', path: '/admin/dashboard/clients', icon: UserCheck },
  { name: 'Projects', path: '/admin/dashboard/projects', icon: Briefcase },
  // { name: 'Assignments', path: '/admin/dashboard/assignments', icon: ClipboardList }, // <-- DELETE THIS
  { name: 'Employees', path: '/admin/dashboard/employees', icon: Users },
  { name: 'Teams', path: '/admin/dashboard/teams', icon: Users },
  { name: 'Partners', path: '/admin/dashboard/partners', icon: Building },
  { name: 'Services', path: '/admin/dashboard/services', icon: Wrench },
  { name: 'Equipment', path: '/admin/dashboard/equipment', icon: HardHat },
  { name: 'Jobs', path: '/admin/dashboard/jobs', icon: Package },
  { name: 'Applications', path: '/admin/dashboard/applications', icon: FileText },
  { name: 'Settings', path: '/admin/dashboard/settings', icon: Settings },
];

const NavItem: React.FC<{ link: typeof NAV_LINKS[0] }> = ({ link }) => (
  <NavLink
    to={link.path}
    end={link.exact}
    className={({ isActive }) =>
      `flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
        isActive
          ? 'bg-[#FF5722] text-white'
          : 'text-gray-600 hover:bg-gray-200 hover:text-gray-900'
      }`
    }
  >
    <link.icon className="w-5 h-5 mr-3" />
    {link.name}
  </NavLink>
);

const SideBar: React.FC = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <div className="w-64 h-screen bg-white shadow-md flex flex-col flex-shrink-0">
      <div className="flex items-center justify-center h-20 border-b">
        <img src="https://i.imgur.com/eioVNZq.png" alt="Logo" className="h-10" />
      </div>
      <nav className="flex-1 overflow-y-auto px-4 py-6 space-y-2">
        {NAV_LINKS.map(link => (
          <NavItem key={link.name} link={link} />
        ))}
      </nav>
      <div className="px-4 py-6 border-t">
        <button
          onClick={handleLogout}
          className="flex items-center w-full px-4 py-3 text-sm font-medium text-red-600 rounded-lg hover:bg-red-50"
        >
          <LogOut className="w-5 h-5 mr-3" />
          Logout
        </button>
      </div>
    </div>
  );
};

export default SideBar; 