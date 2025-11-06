import React, { useState } from 'react';
import { supabase } from '../../lib/supabase/client';
import SideBar from './DashboardPage/components/SideBar';
import Topbar from './DashboardPage/components/Topbar';

// Import Tab Components
import HomeTab from './DashboardPage/tabs/HomeTab';
import ClientsTab from './DashboardPage/tabs/ClientsTab';
import EmployeesTab from './DashboardPage/tabs/EmployeesTab';
import ProjectsTab from './DashboardPage/tabs/ProjectsTab';
import ServicesTab from './DashboardPage/tabs/ServicesTab';
import EquipmentTab from './DashboardPage/tabs/EquipmentTab';
import JobsTab from './DashboardPage/tabs/JobsTab';
import ApplicationsTab from './DashboardPage/tabs/ApplicationsTab';
// import AccessRequestsTab from './DashboardPage/tabs/AccessRequestsTab'; // --- REMOVED
import PartnersTab from './DashboardPage/tabs/PartnersTab';
import TeamsTab from './DashboardPage/tabs/TeamsTab';
import SettingsTab from './DashboardPage/tabs/SettingsTab';
import { Database } from '../../lib/supabase/database.types';

// Define the type for a tab
export interface Tab {
  id: string;
  name: string;
  component: React.FC;
}

// Define the available tabs
const tabs: Tab[] = [
  { id: 'home', name: 'Home', component: HomeTab },
  { id: 'clients', name: 'Clients', component: ClientsTab },
  { id: 'employees', name: 'Employees', component: EmployeesTab },
  { id: 'projects', name: 'Projects', component: ProjectsTab },
  { id: 'services', name: 'Services', component: ServicesTab },
  { id: 'equipment', name: 'Equipment', component: EquipmentTab },
  { id: 'jobs', name: 'Jobs', component: JobsTab },
  { id: 'applications', name: 'Applications', component: ApplicationsTab },
  // { id: 'access', name: 'Access Requests', component: AccessRequestsTab }, // --- REMOVED
  { id: 'partners', name: 'Partners', component: PartnersTab },
  { id: 'teams', name: 'Teams', component: TeamsTab },
  { id: 'settings', name: 'Settings', component: SettingsTab },
];

export type Profile = Database['public']['Tables']['profiles']['Row'];
export type Service = Database['public']['Tables']['services']['Row'];
export type RentalGear = Database['public']['Tables']['rental_gear']['Row'];
export type JobPosition = Database['public']['Tables']['job_positions']['Row'];
export type JobApplication = Database['public']['Tables']['job_applications']['Row'];
export type AccessRequest = Database['public']['Tables']['access_requests']['Row'];

const DashboardPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState(tabs[0].id);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Error signing out:', error);
    }
  };

  const ActiveTabComponent = tabs.find(tab => tab.id === activeTab)?.component || HomeTab;

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <SideBar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        tabs={tabs}
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        handleSignOut={handleSignOut}
      />

      {/* Main content area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Topbar */}
        <Topbar setSidebarOpen={setSidebarOpen} handleSignOut={handleSignOut} />

        {/* Main content */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 p-6">
          <ActiveTabComponent />
        </main>
      </div>
    </div>
  );
};

export default DashboardPage;