import React from 'react';
import { X, LayoutDashboard, UsersRound, FolderKanban, UserCheck, Briefcase, FileCheck, Settings } from 'lucide-react';
import type { TabKey } from '../index';

interface SideBarProps {
  active: TabKey;
  onSelect: (tab: TabKey) => void;
  isMobile?: boolean;
  isOpenMobile?: boolean;
  onCloseMobile?: () => void;
}

const navItems: { key: TabKey; label: string; icon: React.ElementType }[] = [
  { key: 'home', label: 'Home', icon: LayoutDashboard },
  { key: 'clients', label: 'Clients', icon: UsersRound },
  { key: 'projects', label: 'Projects', icon: FolderKanban },
  { key: 'access_requests', label: 'Access Requests', icon: UserCheck },
  { key: 'partners', label: 'Partners', icon: Briefcase },
  { key: 'applications', label: 'Applications', icon: FileCheck },
  { key: 'settings', label: 'Settings', icon: Settings },
];

const Sidebar: React.FC<SideBarProps> = ({
  active,
  onSelect,
  isMobile = false,
  isOpenMobile = false,
  onCloseMobile
}) => {
  if (isMobile) {
    return (
      <>
        {isOpenMobile && (
          <div className="fixed inset-0 bg-black/50 z-40 sm:hidden" onClick={onCloseMobile} />
        )}
        <div
          className={`fixed top-0 left-0 h-full w-72 bg-gradient-to-b from-gray-900 to-gray-800 text-white transform transition-transform duration-300 ease-in-out z-50 sm:hidden ${
            isOpenMobile ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          <div className="flex items-center justify-between p-5 border-b border-gray-700">
            <h2 className="text-xl font-bold tracking-wider">SOLVEX</h2>
            <button
              onClick={onCloseMobile}
              className="p-2 rounded-lg hover:bg-gray-700 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <nav className="p-4 space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = active === item.key;
              return (
                <button
                  key={item.key}
                  onClick={() => onSelect(item.key)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-[#FF5722] text-white shadow-lg'
                      : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>
      </>
    );
  }

  return (
    <div className="h-full bg-gradient-to-b from-gray-900 to-gray-800 text-white flex flex-col">
      <div className="p-5 border-b border-gray-700">
        <h2 className="text-xl font-bold tracking-wider text-center">SOLVEX</h2>
      </div>
      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = active === item.key;
          return (
            <button
              key={item.key}
              onClick={() => onSelect(item.key)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                isActive
                  ? 'bg-[#FF5722] text-white shadow-lg'
                  : 'text-gray-300 hover:bg-gray-700 hover:text-white'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
};

export default Sidebar;
