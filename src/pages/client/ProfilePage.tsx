// src/pages/client/ProfilePage.tsx
import React from 'react';
import { useAuth } from '../../features/auth'; // Keep useAuth if needed for user info
import { useClientMock } from './useClientMock';
import { UserCircle, BuildingOffice2, MapPin, Phone as PhoneIcon, ShieldExclamation } from 'lucide-react'; // Import relevant icons

// Reusable component for profile fields
const ProfileField: React.FC<{ label: string; value?: string | null; icon?: React.ElementType }> = ({ label, value, icon: Icon }) => {
  if (!value) return null; // Don't render if value is missing

  return (
    <div className="py-3 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
      <dt className="text-sm font-medium leading-6 text-gray-500 flex items-center gap-2">
        {Icon && <Icon size={16} className="text-gray-400" />}
        {label}
      </dt>
      <dd className="mt-1 text-sm leading-6 text-gray-800 sm:col-span-2 sm:mt-0">{value}</dd>
    </div>
  );
};


const ProfilePage: React.FC = () => {
  // const { user } = useAuth(); // Can keep if you need user data separate from client profile
  const { client } = useClientMock(); // Get client data from mock

  // Combine first and last name for display
  const fullName = `${client.firstName || ''} ${client.lastName || ''}`.trim();

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Updated Title */}
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6">My Profile</h1>

        <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-100">
          <div className="px-4 py-5 sm:px-6">
            <h2 className="text-base font-semibold leading-7 text-gray-900">Personal Information</h2>
            <p className="mt-1 max-w-2xl text-sm leading-6 text-gray-500">Details about your account.</p>
          </div>
          <div className="border-t border-gray-100 px-4 py-5 sm:px-6">
            <dl className="divide-y divide-gray-100">
              <ProfileField label="Full Name" value={fullName} icon={UserCircle} />
              <ProfileField label="Company Name" value={client.company} icon={BuildingOffice2} />
              <ProfileField label="Email Address" value={client.email} /> {/* Email doesn't need icon here */}
              <ProfileField label="Mobile Number" value={client.phone} icon={PhoneIcon} /> {/* Changed label */}
              <ProfileField label="Location" value={client.location} icon={MapPin} />
            </dl>
          </div>
        </div>

        {/* Emergency Contact Section */}
        <div className="mt-6 bg-white rounded-lg shadow-md overflow-hidden border border-gray-100">
           <div className="px-4 py-5 sm:px-6">
              <h2 className="text-base font-semibold leading-7 text-gray-900 flex items-center gap-2">
                 <ShieldExclamation size={18} className="text-red-600"/> Emergency Contact
              </h2>
              <p className="mt-1 max-w-2xl text-sm leading-6 text-gray-500">Contact person in case of emergencies.</p>
           </div>
           <div className="border-t border-gray-100 px-4 py-5 sm:px-6">
              <dl className="divide-y divide-gray-100">
                 <ProfileField label="Contact Name" value={client.emergencyContactName} />
                 <ProfileField label="Contact Mobile" value={client.emergencyContactMobile} icon={PhoneIcon} />
              </dl>
              {/* Add message if no emergency contact is set */}
              {!client.emergencyContactName && !client.emergencyContactMobile && (
                  <p className="text-sm text-gray-500 italic py-3">No emergency contact information provided.</p>
              )}
           </div>
         </div>

         {/* Optional: Add Tier Info */}
         <div className="mt-6 bg-white rounded-lg shadow-md overflow-hidden border border-gray-100">
            <div className="px-4 py-5 sm:px-6">
               <h2 className="text-base font-semibold leading-7 text-gray-900">Account Information</h2>
            </div>
            <div className="border-t border-gray-100 px-4 py-5 sm:px-6">
               <dl className="divide-y divide-gray-100">
                  <ProfileField label="Account Tier" value={client.tier} />
               </dl>
            </div>
          </div>

      </div>
    </div>
  );
};

export default ProfilePage;