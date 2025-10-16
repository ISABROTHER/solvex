// src/pages/client/ProfilePage.tsx
import React from 'react';
import { motion } from 'framer-motion';
import { useClientMock } from './useClientMock';

const ProfilePage: React.FC = () => {
    const { client } = useClientMock();

    return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
                <div className="flex items-center space-x-4">
                    <img className="h-20 w-20 rounded-full" src={client.avatarUrl} alt="Client avatar" />
                    <div>
                        <h2 className="text-2xl font-bold">{client.firstName} {client.lastName}</h2>
                        <p className="text-gray-500">{client.company}</p>
                    </div>
                </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
                 <h3 className="font-semibold text-lg mb-4">Personal Information</h3>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div><span className="font-medium text-gray-500">Full Name:</span> {client.firstName} {client.lastName}</div>
                    <div><span className="font-medium text-gray-500">Email:</span> {client.email}</div>
                 </div>
                 <button className="mt-4 text-sm font-medium text-brand hover:text-brand-dark">Edit Information</button>
            </div>

             <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
                 <h3 className="font-semibold text-lg mb-4">Account Tier: <span className="text-brand">{client.tier}</span></h3>
                 <ul className="list-disc list-inside text-sm space-y-1">
                     <li>Priority Support</li>
                     <li>Early access to new services</li>
                     <li>Quarterly strategy review</li>
                 </ul>
                  <button className="mt-4 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-brand hover:bg-brand-dark">Upgrade Tier</button>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
                 <h3 className="font-semibold text-lg mb-4">Notification Preferences</h3>
                 <div className="space-y-2 text-sm">
                    <div className="flex items-center justify-between"><label htmlFor="email-notif">Email Notifications</label><input id="email-notif" type="checkbox" className="h-4 w-4 rounded text-brand focus:ring-brand" defaultChecked={client.notifications.email} /></div>
                    <div className="flex items-center justify-between"><label htmlFor="sms-notif">SMS Notifications</label><input id="sms-notif" type="checkbox" className="h-4 w-4 rounded text-brand focus:ring-brand" defaultChecked={client.notifications.sms} /></div>
                 </div>
            </div>
        </motion.div>
    );
};

export default ProfilePage;
