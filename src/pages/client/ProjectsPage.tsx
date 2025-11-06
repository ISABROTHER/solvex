// src/pages/client/ProjectsPage.tsx
import React from 'react';
import { Package } from 'lucide-react';

const ProjectsPage: React.FC = () => {
  return (
    <div className="max-w-7xl mx-auto">
      <header className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">My Projects / Tasks</h1>
      </header>
      
      {/* Placeholder Content */}
      <div className="bg-white shadow-sm rounded-lg p-6 min-h-[400px] flex items-center justify-center border border-dashed border-gray-300">
        <div className="text-center">
          <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-700">Projects Page</h2>
          <p className="text-gray-500 mt-2">
            This is where clients will view their project deliverables and task status.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ProjectsPage;