import React from 'react';
import { Menu, LogOut, User } from 'lucide-react';
import { useAuth } from '../../features/auth/AuthProvider';

interface ClientHeaderProps {
  setSidebarOpen: (open: boolean) => void;
}

const ClientHeader: React.FC<ClientHeaderProps> = ({ setSidebarOpen }) => {
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <div className="sticky top-0 z-10 flex h-20 flex-shrink-0 border-b border-gray-200 bg-white shadow-sm">
      <button
        type="button"
        className="border-r border-gray-200 px-4 text-gray-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-[#FF5722] lg:hidden"
        onClick={() => setSidebarOpen(true)}
      >
        <span className="sr-only">Open sidebar</span>
        <Menu className="h-6 w-6" aria-hidden="true" />
      </button>
      <div className="flex flex-1 justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex flex-1 items-center">
          <h1 className="text-xl font-semibold text-gray-900">Client Portal</h1>
        </div>
        <div className="ml-4 flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <User size={20} className="text-gray-500" />
            <span className="text-sm text-gray-700 hidden sm:block">
              {user?.email || 'Client'}
            </span>
          </div>
          <button
            onClick={handleLogout}
            className="text-gray-500 hover:text-red-600 flex items-center gap-1"
            title="Logout"
          >
            <LogOut size={20} />
            <span className="hidden sm:inline text-sm">Logout</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ClientHeader;
