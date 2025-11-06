// src/app/layout/ClientHeader.tsx
import React, { Fragment } from 'react';
import { useAuth } from '../../features/auth/AuthProvider';
import { Menu, Transition } from '@headlessui/react';
import { ChevronDown, LogOut, Menu as MenuIcon, User, Settings, Shield } from 'lucide-react';
import { Link } from 'react-router-dom';

interface ClientHeaderProps {
  setSidebarOpen: (open: boolean) => void;
}

const ClientHeader: React.FC<ClientHeaderProps> = ({ setSidebarOpen }) => {
  const { profile, logout } = useAuth();

  const getInitials = (firstName?: string, lastName?: string) => {
    const first = firstName?.[0] || '';
    const last = lastName?.[0] || '';
    return `${first}${last}`.toUpperCase();
  };

  const avatarUrl = profile?.avatar_url;
  const initials = getInitials(profile?.first_name, profile?.last_name);
  const displayName = profile?.first_name ? `${profile.first_name} ${profile.last_name}` : profile?.email;

  return (
    <header className="sticky top-0 z-30 flex h-16 flex-shrink-0 items-center justify-between border-b border-gray-200 bg-white shadow-sm lg:h-20">
      {/* Gradient Background */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <div className="absolute -inset-y-10 -inset-x-40 sm:-inset-x-20 bg-gradient-to-r from-[#FF5722] to-[#FF9800] opacity-90 skew-y-[-3.5deg] shadow-lg"></div>
      </div>

      {/* Mobile Menu Button */}
      <div className="relative z-10 lg:hidden px-4">
        <button
          type="button"
          className="-ml-0.5 inline-flex h-12 w-12 items-center justify-center rounded-md text-white hover:text-gray-100"
          onClick={() => setSidebarOpen(true)}
        >
          <span className="sr-only">Open sidebar</span>
          <MenuIcon className="h-6 w-6" aria-hidden="true" />
        </button>
      </div>

      {/* Page Title (hidden on mobile, shown on desktop) */}
      <div className="relative z-10 hidden lg:flex items-center pl-8">
        <Link to="/client/dashboard">
          <h1 className="text-2xl font-bold text-white tracking-tight">Client Portal</h1>
        </Link>
      </div>

      {/* Profile Dropdown */}
      <div className="relative z-10 px-4 sm:px-6 lg:px-8">
        <Menu as="div" className="relative">
          <Menu.Button className="flex items-center gap-3 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-[#FF5722]">
            <span className="sr-only">Open user menu</span>
            <span className="hidden sm:inline-block text-right">
              <span className="block font-medium text-white truncate max-w-[200px]">{displayName}</span>
              <span className="block text-xs text-white opacity-80">Client Account</span>
            </span>
            <div className="h-10 w-10 rounded-full bg-white/30 backdrop-blur-sm flex items-center justify-center text-white font-medium border-2 border-white/50">
              {avatarUrl ? (
                <img className="h-full w-full rounded-full object-cover" src={avatarUrl} alt="Profile" />
              ) : (
                <span>{initials}</span>
              )}
            </div>
            <ChevronDown className="h-5 w-5 text-white/70 hidden sm:block" />
          </Menu.Button>
          <Transition
            as={Fragment}
            enter="transition ease-out duration-100"
            enterFrom="transform opacity-0 scale-95"
            enterTo="transform opacity-100 scale-100"
            leave="transition ease-in duration-75"
            leaveFrom="transform opacity-100 scale-100"
            leaveTo="transform opacity-0 scale-95"
          >
            <Menu.Items className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
              <Menu.Item>
                {({ active }) => (
                  <Link
                    to="/client/profile"
                    className={`${active ? 'bg-gray-100' : ''} group flex w-full items-center px-4 py-2 text-sm text-gray-700`}
                  >
                    <User className="mr-3 h-5 w-5 text-gray-400 group-hover:text-gray-500" />
                    Edit Profile
                  </Link>
                )}
              </Menu.Item>
              <Menu.Item>
                {({ active }) => (
                  <a
                    href="#"
                    className={`${active ? 'bg-gray-100' : ''} group flex w-full items-center px-4 py-2 text-sm text-gray-700`}
                  >
                    <Settings className="mr-3 h-5 w-5 text-gray-400 group-hover:text-gray-500" />
                    Change Password
                  </a>
                )}
              </Menu.Item>
              <Menu.Item>
                {({ active }) => (
                  <a
                    href="mailto:support@solvexstudios.com"
                    className={`${active ? 'bg-gray-100' : ''} group flex w-full items-center px-4 py-2 text-sm text-gray-700`}
                  >
                    <Shield className="mr-3 h-5 w-5 text-gray-400 group-hover:text-gray-500" />
                    Contact Support
                  </a>
                )}
              </Menu.Item>
              <Menu.Item>
                {({ active }) => (
                  <button
                    onClick={logout}
                    className={`${active ? 'bg-gray-100' : ''} group flex w-full items-center px-4 py-2 text-sm text-red-600`}
                  >
                    <LogOut className="mr-3 h-5 w-5 text-red-400 group-hover:text-red-500" />
                    Logout
                  </button>
                )}
              </Menu.Item>
            </Menu.Items>
          </Transition>
        </Menu>
      </div>
    </header>
  );
};

export default ClientHeader;