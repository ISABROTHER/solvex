import React from 'react';
import { Outlet, Link } from 'react-router-dom';

const AdminLayout: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-neutral-50">
      <div className="w-full flex items-center justify-between px-4 py-2 border-b bg-white">
        <div className="font-semibold">Admin Panel</div>
        <div className="flex items-center gap-3">
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

export default AdminLayout;
