import React, { useState, useEffect } from "react";
import Sidebar from "./components/SideBar";

import Topbar from "./components/Topbar"; 

import HomeTab from "./tabs/HomeTab";
import ClientsTab from "./tabs/ClientsTab";
import ProjectsTab from "./tabs/ProjectsTab";
import TeamsTab from "./tabs/TeamsTab";
import EquipmentTab from "./tabs/EquipmentTab";
import PartnersTab from "./tabs/PartnersTab";
import SettingsTab from "./tabs/SettingsTab";
import ApplicationsTab from "./tabs/ApplicationsTab";
import JobsTab from "./tabs/JobsTab";
import ServicesTab from "./tabs/ServicesTab";
import EmployeesTab from "./tabs/EmployeesTab"; // <-- 1. IMPORT NEW TAB

export type TabKey =
  | "home"
  | "clients"
  | "projects"
  | "access_requests"
  | "partners"
  | "applications"
  | "employees" // <-- 2. ADD TAB KEY
  | "settings";

const DashboardPage: React.FC = () => {
  const [tab, setTab] = useState<TabKey>("home");
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [mobileOpen]);

  const handleSelect = (k: TabKey) => {
    setTab(k);
    if (mobileOpen) {
      setMobileOpen(false);
    }
  };

  return (
    <div className="flex h-screen w-full overflow-hidden bg-gray-50"
      style={{ background: 'linear-gradient(to bottom right, #f9fafb, #fff5f2)' }}>
      <div
        className={`hidden sm:block h-full transition-all duration-300 ease-in-out ${
          isSidebarOpen ? "w-72" : "w-0"
        } overflow-hidden flex-shrink-0`}
      >
        <div className="w-72 h-full">
          <Sidebar active={tab} onSelect={handleSelect} />
        </div>
      </div>

      <div className="flex-1 flex flex-col overflow-hidden">
        <Topbar
          onMenuClick={() => setMobileOpen(true)}
          onDesktopMenuClick={() => setSidebarOpen(!isSidebarOpen)}
        />
        <Sidebar
          active={tab}
          onSelect={handleSelect}
          isMobile
          isOpenMobile={mobileOpen}
          onCloseMobile={() => setMobileOpen(false)}
        />
        <main className="flex-1 overflow-auto p-4 sm:p-5">
          {tab === "home" && <HomeTab />}
          {tab === "clients" && <ClientsTab />}
          {tab === "projects" && <ProjectsTab />}
          {tab === "partners" && <PartnersTab />}
          {tab === "applications" && <ApplicationsTab />}
          {tab === "employees" && <EmployeesTab />} {/* <-- 3. RENDER NEW TAB */}
          {tab === "settings" && (
            <SettingsTab 
              jobsTab={<JobsTab />}
              teamsTab={<TeamsTab />}
              servicesTab={<ServicesTab />}
              equipmentTab={<EquipmentTab />}
            />
          )}
        </main>
      </div>
    </div>
  );
};

export default DashboardPage;