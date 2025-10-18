import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useClientMock } from './useClientMock';

const NewRequestPage: React.FC = () => { 
  const navigate = useNavigate();
  const { addRequest } = useClientMock();
  const [formData, setFormData] = useState({
    serviceType: '',
    projectTitle: '',
    brief: '',
    timeline: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newRequest = addRequest(formData);
    navigate(`/client/requests/${newRequest.id}`);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">New Request</h1>
        <div className="bg-white rounded-lg shadow p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="serviceType" className="block text-sm font-medium text-gray-700 mb-2">
                Service Type
              </label>
              <select
                id="serviceType"
                name="serviceType"
                value={formData.serviceType}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF5722] focus:border-transparent"
              >
                <option value="">Select a service</option>
                <option value="Brand Strategy">Brand Strategy</option>
                <option value="Advertising">Advertising</option>
                <option value="Photography & Videography">Photography & Videography</option>
                <option value="Content Marketing">Content Marketing</option>
                <option value="Web Development">Web Development</option>
              </select>
            </div>

            <div>
              <label htmlFor="projectTitle" className="block text-sm font-medium text-gray-700 mb-2">
                Project Title
              </label>
              <input
                type="text"
                id="projectTitle"
                name="projectTitle"
                value={formData.projectTitle}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF5722] focus:border-transparent"
              />
            </div>

            <div>
              <label htmlFor="brief" className="block text-sm font-medium text-gray-700 mb-2">
                Project Brief
              </label>
              <textarea
                id="brief"
                name="brief"
                value={formData.brief}
                onChange={handleChange}
                required
                rows={6}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF5722] focus:border-transparent"
              />
            </div>

            <div>
              <label htmlFor="timeline" className="block text-sm font-medium text-gray-700 mb-2">
                Timeline
              </label>
              <input
                type="text"
                id="timeline"
                name="timeline"
                value={formData.timeline}
                onChange={handleChange}
                required
                placeholder="e.g., 2-3 weeks, Flexible"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#FF5722] focus:border-transparent"
              />
            </div>

            <div className="flex gap-4">
              <button
                type="submit"
                className="flex-1 bg-[#FF5722] text-white px-6 py-3 rounded-lg hover:bg-[#E64A19] transition font-semibold"
              >
                Submit Request
              </button>
              <button
                type="button"
                onClick={() => navigate('/client/requests')}
                className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default NewRequestPage;
