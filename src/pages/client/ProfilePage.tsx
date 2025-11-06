import React from 'react';
// import ClientNavbar from '../../app/layout/ClientNavbar'; // --- REMOVED

const ProfilePage: React.FC = () => {
  return (
    <>
      {/* <ClientNavbar /> */} {/* --- REMOVED */}
      <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">My Profile</h1>
        
        {/* Placeholder Content */}
        <div className="bg-white shadow-sm rounded-lg">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-800">Profile Information</h2>
            <p className="text-gray-600 mt-1">This is where clients will update personal info and upload a profile photo.</p>
          </div>
          <div className="p-6">
            <form className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">First Name</label>
                  <input type="text" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" placeholder="John" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Last Name</label>
                  <input type="text" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm" placeholder="Doe" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Email</label>
                <input type="email" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm bg-gray-100" placeholder="john.doe@example.com" readOnly />
              </div>
              <div className="pt-2">
                <button type="submit" className="px-4 py-2 bg-[#FF5722] text-white font-semibold rounded-md shadow-sm hover:bg-[#E64A19]">
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
};

export default ProfilePage;