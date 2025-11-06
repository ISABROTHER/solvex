// src/pages/AccessDeniedPage.tsx
import React from 'react';
import { useAuth } from '../features/auth/AuthProvider';
import { XCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

const AccessDeniedPage: React.FC = () => {
  const { logout } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center bg-white p-8 rounded-lg shadow-md">
        <XCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-red-600 mb-4">Access Denied</h1>
        <p className="text-gray-600 mb-6">
          Your request for access has been reviewed, and unfortunately, it could not be approved at this time.
        </p>
        <p className="text-sm text-gray-500 mb-6">
          If you believe this is an error, please contact our support team at
          <a href="mailto:support@solvexstudios.com" className="font-medium text-[#FF5722] hover:underline">
            {' '}support@solvexstudios.com
          </a>.
        </p>
        <button
          onClick={logout}
          className="w-full px-4 py-2 bg-gray-700 text-white font-semibold rounded-md hover:bg-gray-800 transition-colors"
        >
          Logout
        </button>
      </div>
    </div>
  );
};

export default AccessDeniedPage;