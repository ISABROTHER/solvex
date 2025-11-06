// src/app/layout/ClientSidebar.tsx
import React, { Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import {
  Home,
  Package,
  MessageSquare,
  CreditCard,
  User,
  X,
} from 'lucide-react';
import { NavLink, Link } from 'react-router-dom';

const navigation = [
  { name: 'Dashboard', href: '/client/dashboard', icon: Home },
  { name: 'My Projects', href: '/client/projects', icon: Package },
  { name: 'Messages', href: '/client/messages', icon: MessageSquare },
  { name: 'Billing', href: '/client/billing', icon: CreditCard },
  { name: 'Profile', href: '/client/profile', icon: User },
];

interface ClientSidebarProps {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
}

const ClientSidebar: React.FC<ClientSidebarProps> = ({ sidebarOpen, setSidebarOpen }) => {
  return (
    <Transition.Root show={sidebarOpen} as={Fragment}>
      <Dialog as="div" className="relative z-40 lg:hidden" onClose={setSidebarOpen}>
        {/* Overlay */}
        <Transition.Child
          as={Fragment}
          enter="transition-opacity ease-linear duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="transition-opacity ease-linear duration-300"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-gray-600 bg-opacity-75" />
        </Transition.Child>

        {/* Sidebar Panel */}
        <div className="fixed inset-0 z-40 flex">
          <Transition.Child
            as={Fragment}
            enter="transition ease-in-out duration-300 transform"
            enterFrom="-translate-x-full"
            enterTo="translate-x-0"
            leave="transition ease-in-out duration-300 transform"
            leaveFrom="translate-x-0"
            leaveTo="-translate-x-full"
          >
            <Dialog.Panel className="relative flex w-full max-w-xs flex-1 flex-col bg-white pt-5 pb-4">
              {/* Close Button */}
              <Transition.Child
                as={Fragment}
                enter="ease-in-out duration-300"
                enterFrom="opacity-0"
                enterTo="opacity-100"
                leave="ease-in-out duration-300"
                leaveFrom="opacity-100"
                leaveTo="opacity-0"
              >
                <div className="absolute top-0 right-0 -mr-12 pt-2">
                  <button
                    type="button"
                    className="ml-1 flex h-10 w-10 items-center justify-center rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
                    onClick={() => setSidebarOpen(false)}
                  >
                    <span className="sr-only">Close sidebar</span>
                    <X className="h-6 w-6 text-white" aria-hidden="true" />
                  </button>
                </div>
              </Transition.Child>

              {/* Logo */}
              <div className="flex flex-shrink-0 items-center px-4">
                <Link to="/" className="flex items-center gap-2">
                  <img
                    className="h-8 w-auto"
                    src="/Solvexstudios logo.png"
                    alt="SolveX Studios"
                  />
                  <span className="text-xl font-bold text-[#FF5722]">SolveX</span>
                </Link>
              </div>

              {/* Navigation */}
              <div className="mt-5 h-0 flex-1 overflow-y-auto">
                <nav className="space-y-1 px-2">
                  {navigation.map((item) => (
                    <NavLink
                      key={item.name}
                      to={item.href}
                      end // Make 'Dashboard' link exact
                      onClick={() => setSidebarOpen(false)}
                      className={({ isActive }) =>
                        `
                        ${
                          isActive
                            ? 'bg-orange-100 text-[#FF5722]'
                            : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                        }
                        group flex items-center rounded-md px-3 py-3 text-base font-medium
                        `
                      }
                    >
                      <item.icon
                        className={`
                          ${
                            isActive
                              ? 'text-[#FF5722]'
                              : 'text-gray-400 group-hover:text-gray-500'
                          }
                          mr-4 h-6 w-6 flex-shrink-0
                          `}
                        aria-hidden="true"
                      />
                      {item.name}
                    </NavLink>
                  ))}
                </nav>
              </div>
            </Dialog.Panel>
          </Transition.Child>
          <div className="w-14 flex-shrink-0" aria-hidden="true">
            {/* Dummy element to force sidebar to shrink to fit close icon */}
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  );
};

export default ClientSidebar;