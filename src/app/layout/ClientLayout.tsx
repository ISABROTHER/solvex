// src/app/layout/ClientLayout.tsx
import React, { useState } from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import ClientHeader from './ClientHeader';
import ClientSidebar from './ClientSidebar';
import {
  Home,
  Package,
  MessageSquare,
  CreditCard,
  User,
} from 'lucide-react';

// Navigation for DESKTOP sidebar
const navigation = [
  { name: 'Dashboard', href: '/client/dashboard', icon: Home },
  { name: 'My Projects', href: '/client/projects', icon: Package },
  { name: 'Messages', href: '/client/messages', icon: MessageSquare },
  { name: 'Billing', href: '/client/billing', icon: CreditCard },
  { name: 'Profile', href: '/client/profile', icon: User },
];

const ClientLayout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Mobile Sidebar */}
      <ClientSidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

      {/* Static sidebar for desktop */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
        <div className="flex min-h-0 flex-1 flex-col border-r border-gray-200 bg-white">
          {/* Logo */}
          <div className="flex h-20 flex-shrink-0 items-center justify-center border-b px-4">
            <NavLink to="/" className="flex items-center gap-2">
              <img
                className="h-8 w-auto"
                src="/Solvexstudios logo.png"
                alt="SolveX Studios"
              />
              <span className="text-xl font-bold text-[#FF5722]">SolveX</span>
            </NavLink>
          </div>
          {/* Desktop Navigation */}
          <div className="flex flex-1 flex-col overflow-y-auto pt-5 pb-4">
            <nav className="mt-1 flex-1 space-y-1 px-3">
              {navigation.map((item) => (
                <NavLink
                  key={item.name}
                  to={item.href}
                  end // Make 'Dashboard' link exact
                  className={({ isActive }) =>
                    `
                    ${
                      isActive
                        ? 'bg-orange-100 text-[#FF5722]'
                        : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                    }
                    group flex items-center rounded-md px-3 py-3 text-sm font-semibold
                    `
                  }
                >
                  {({ isActive }) => (
                    <>
                      <item.icon
                        className={`
                          ${
                            isActive
                              ? 'text-[#FF5722]'
                              : 'text-gray-400 group-hover:text-gray-500'
                          }
                          mr-3 h-5 w-5 flex-shrink-0
                          `}
                        aria-hidden="true"
                      />
                      {item.name}
                    </>
                  )}
                </NavLink>
              ))}
            </nav>
          </div>
        </div>
      </div>

      {/* Main content area */}
      <div className="flex flex-1 flex-col lg:pl-64">
        {/* Top Header Bar */}
        <ClientHeader setSidebarOpen={setSidebarOpen} />
        
        {/* Page Content */}
        <main className="flex-1">
          <div className="py-8 px-4 sm:px-6 lg:px-8">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default ClientLayout;