// @ts-nocheck
import React from 'react';
import { useLocation } from 'react-router-dom';
import SideBar from './components/SideBar';
import Topbar from './components/Topbar';
import HomeTab from './tabs/HomeTab';
import AccessRequestsTab from './tabs/AccessRequestsTab';
import ClientsTab from './tabs/ClientsTab';
import ProjectsTab from './tabs/ProjectsTab';
// import AssignmentsTab from './tabs/AssignmentsTab'; // <-- 1. DELETE THIS
import EmployeesTab from './tabs/EmployeesTab';
import TeamsTab from './tabs/TeamsTab';
import PartnersTab from './tabs/PartnersTab';
import ServicesTab from './tabs/ServicesTab';
import EquipmentTab from './tabs/EquipmentTab';
import JobsTab from './tabs/JobsTab';
import ApplicationsTab from './tabs/ApplicationsTab';
import SettingsTab from './tabs/SettingsTab';

const TABS = [
  { path: '/admin/dashboard', component: HomeTab, exact: true },
  { path: '/admin/dashboard/access-requests', component: AccessRequestsTab },
  { path: '/admin/dashboard/clients', component: ClientsTab },
  { path: '/admin/dashboard/projects', component: ProjectsTab },
  // { path: '/admin/dashboard/assignments', component: AssignmentsTab }, // <-- 2. DELETE THIS
  { path: '/admin/dashboard/employees', component: EmployeesTab },
  { path: '/admin/dashboard/teams', component: TeamsTab },
  { path: '/admin/dashboard/partners', component: PartnersTab },
  { path: '/admin/dashboard/services', component: ServicesTab },
  { path: '/admin/dashboard/equipment', component: EquipmentTab },
  { path: '/admin/dashboard/jobs', component: JobsTab },
  { path: '/admin/dashboard/applications', component: ApplicationsTab },
  { path: '/admin/dashboard/settings', component: SettingsTab },
];

const DashboardPage: React.FC = () => {
  const location = useLocation();

  const getActiveTab = () => {
    const activeTab = TABS.find(tab => location.pathname === tab.path);
    return activeTab ? activeTab.component : HomeTab;
  };

  const ActiveTabComponent = getActiveTab();

  return (
    <div className="flex h-screen bg-gray-100">
      <SideBar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Topbar />
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 p-6">
          <ActiveTabComponent />
        </main>
      </div> 
    </div>
  );
};

export default DashboardPage;