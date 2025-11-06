import React, { Fragment, useEffect, useState, useMemo } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import {
  X,
  Home,
  Users,
  Briefcase,
  Folder,
  Settings,
  LogOut,
  Shield,
  FileText,
  Truck,
  Building,
  Wrench,
  UserCheck,
  ClipboardList, // Import ClipboardList
  Clock, // Import Clock
} from 'lucide-react';
import { Tab } from '../../index';
import { supabase } from '../../../../lib/supabase/client'; // Import supabase

interface SideBarProps {
  activeTab: string;
  setActiveTab: (id: string) => void;
  tabs: Tab[];
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  handleSignOut: () => void;
}

// Map tab IDs to Lucide icons
const iconMap: { [key: string]: React.ElementType } = {
  home: Home,
  clients: Users,
  employees: Briefcase,
  projects: Folder,
  services: Wrench,
  equipment: Truck,
  jobs: ClipboardList, // Updated icon
  applications: FileText,
  access: Shield, // This will be removed, but we'll leave the icon for now
  partners: Building,
  teams: UserCheck,
  settings: Settings,
};

const SideBar: React.FC<SideBarProps> = ({
  activeTab,
  setActiveTab,
  tabs,
  sidebarOpen,
  setSidebarOpen,
  handleSignOut,
}) => {
  // --- NEW: State for pending counts ---
  const [pendingApplications, setPendingApplications] = useState(0);
  const [pendingClients, setPendingClients] = useState(0); // Renamed from accessRequests

  // --- UPDATED: Fetch counts for applications and pending clients ---
  useEffect(() => {
    // Fetch pending applications
    const fetchAppCount = async () => {
      const { count, error } = await supabase
        .from('job_applications')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending');
      if (!error) {
        setPendingApplications(count || 0);
      }
    };

    // Fetch pending clients
    const fetchClientCount = async () => {
      const { count, error } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('role', 'client')
        .eq('approval_status', 'pending'); // Updated query
      if (!error) {
        setPendingClients(count || 0);
      }
    };
    
    fetchAppCount();
    fetchClientCount();
    
    // --- UPDATED: Real-time subscriptions ---
    const appChannel = supabase
      .channel('public:job_applications:status=pending')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'job_applications' },
        fetchAppCount // Refetch on any change
      )
      .subscribe();
      
    const clientChannel = supabase
      .channel('public:profiles:role=client:status=pending')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'profiles', filter: 'role=eq.client' },
        fetchClientCount // Refetch on any change
      )
      .subscribe();

    return () => {
      supabase.removeChannel(appChannel);
      supabase.removeChannel(clientChannel);
    };
  }, []);

  // --- NEW: Memoize navigation items to include counts ---
  const navigationItems = useMemo(() => {
    return tabs.map(tab => {
      let count = 0;
      if (tab.id === 'applications') {
        count = pendingApplications;
      } else if (tab.id === 'clients') {
        count = pendingClients;
      }

      return {
        ...tab,
        icon: iconMap[tab.id] || Settings,
        count: count,
      };
    // --- REMOVED: Filter out 'access' tab ---
    }).filter(tab => tab.id !== 'access');
  }, [tabs, pendingApplications, pendingClients]);
  
  const handleNavClick = (id: string) => {
    setActiveTab(id);
    setSidebarOpen(false); // Close mobile sidebar on click
  };

  const renderNav = () => (
    <nav className="flex-1 space-y-1 px-2 py-4">
      {navigationItems.map(item => (
        <button
          key={item.name}
          onClick={() => handleNavClick(item.id)}
          className={`
            ${
              activeTab === item.id
                ? 'bg-gray-900 text-white'
                : 'text-gray-300 hover:bg-gray-700 hover:text-white'
            }
            group flex items-center px-3 py-2.5 text-sm font-medium rounded-md w-full transition-colors duration-150
          `}
        >
          <item.icon
            className={`
              ${
                activeTab === item.id ? 'text-white' : 'text-gray-400 group-hover:text-gray-300'
              }
              mr-3 flex-shrink-0 h-5 w-5 transition-colors duration-150
            `}
            aria-hidden="true"
          />
          <span className="flex-1 text-left">{item.name}</span>
          {item.count > 0 && (
            <span
              className={`
                ml-3 inline-block py-0.5 px-2.5 text-xs font-bold rounded-full
                ${
                  activeTab === item.id
                    ? 'bg-white text-gray-900'
                    : 'bg-yellow-500 text-yellow-900 group-hover:bg-yellow-400'
                }
              `}
            >
              {item.count}
            </span>
          )}
        </button>
      ))}
    </nav>
  );

  const renderLogoAndLogout = () => (
    <>
      <div className="flex flex-shrink-0 items-center px-4">
        {/* You can replace this with your logo */}
        <h1 className="text-2xl font-bold text-white">SolveX</h1>
      </div>
      <div className="flex flex-shrink-0 border-t border-gray-700 p-4">
        <button
          onClick={handleSignOut}
          className="group w-full flex-shrink-0 rounded-md p-3 text-sm font-medium text-gray-300 hover:bg-gray-700 hover:text-white"
        >
          <div className="flex items-center">
            <LogOut className="h-5 w-5 text-gray-400 group-hover:text-gray-300" />
            <span className="ml-3">Log out</span>
          </div>
        </button>
      </div>
    </>
  );

  return (
    <>
      {/* Mobile Sidebar */}
      <Transition.Root show={sidebarOpen} as={Fragment}>
        <Dialog as="div" className="relative z-40 md:hidden" onClose={setSidebarOpen}>
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
              <Dialog.Panel className="relative flex w-full max-w-xs flex-1 flex-col bg-gray-800">
                {/* Close button */}
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

                {/* Logo and Nav */}
                <div className="flex flex-1 flex-col overflow-y-auto pt-5 pb-4">
                  <div className="flex flex-shrink-0 items-center px-4">
                    <h1 className="text-2xl font-bold text-white">SolveX</h1>
                  </div>
                  {renderNav()}
                </div>
                {/* Logout */}
                <div className="flex flex-shrink-0 border-t border-gray-700 p-4">
                  <button
                    onClick={handleSignOut}
                    className="group w-full flex-shrink-0 rounded-md p-3 text-sm font-medium text-gray-300 hover:bg-gray-700 hover:text-white"
                  >
                    <div className="flex items-center">
                      <LogOut className="h-5 w-5 text-gray-400 group-hover:text-gray-300" />
                      <span className="ml-3">Log out</span>
                    </div>
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
            <div className="w-14 flex-shrink-0">{/* Dummy element to force sidebar to shrink to fit close icon */}</div>
          </div>
        </Dialog>
      </Transition.Root>

      {/* Static sidebar for desktop */}
      <div className="hidden md:fixed md:inset-y-0 md:flex md:w-64 md:flex-col">
        <div className="flex min-h-0 flex-1 flex-col bg-gray-800">
          <div className="flex flex-1 flex-col overflow-y-auto pt-5 pb-4">
            {renderLogoAndLogout()}
            {renderNav()}
          </div>
        </div>
      </div>
    </>
  );
};

export default SideBar;