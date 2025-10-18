import React from 'react';
import { Outlet, Link, NavLink } from 'react-router-dom';

const ClientLayout: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-neutral-50">
      <div className="w-full flex items-center justify-between px-4 py-2 border-b bg-white">
        <div className="font-semibold">Client Portal</div>
        <div className="flex items-center gap-3">
          <NavLink
            to="/client"
            className={({ isActive }) =>
              `text-sm ${isActive ? 'font-semibold' : ''}`
            }
            end
          >
            Dashboard
          </NavLink>
          <NavLink
            to="/client/requests"
            className={({ isActive }) =>
              `text-sm ${isActive ? 'font-semibold' : ''}`
            }
          >
            Requests
          </NavLink>
          <NavLink
            to="/client/profile"
            className={({ isActive }) =>
              `text-sm ${isActive ? 'font-semibold' : ''}`
            }
          >
            Profile
          </NavLink>
          <Link
            to="/"
            className="text-sm underline underline-offset-4 hover:opacity-80"
          >
            Back to Site
          </Link>
        </div>
      </div>
      <div className="flex-1">
        <Outlet />
      </div>
    </div>
  );
};

export default ClientLayout;
