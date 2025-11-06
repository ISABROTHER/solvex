import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// --- CONTEXT & AUTH IMPORTS ---
import { AuthProvider } from './features/auth'; // Cleaned import
import { CartProvider } from './contexts/CartContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { ToastProvider } from './contexts/ToastContext';

// --- NEW AUTH COMPONENTS ---
import RoleGate from './components/auth/RoleGate';
import PendingPageGate from './components/auth/PendingPageGate';

// --- LAYOUT IMPORTS ---
import PublicLayout from './app/layout/PublicLayout';
import AdminLayout from './app/layout/AdminLayout';
import ClientLayout from './app/layout/ClientLayout';

// --- UI COMPONENT IMPORTS ---
import CartFAB from './contexts/CartFAB';
import CartDrawer from './contexts/CartDrawer';

// --- PAGE IMPORTS ---
import HomePage from './pages/HomePage';
import ServicesPage from './pages/ServicesPage';
import RentalsPage from './pages/RentalsPage';
import RentalDetailPage from './pages/RentalDetailPage';
import CartPage from './pages/CartPage';
import SuccessPage from './pages/SuccessPage';
import CareersPage from './pages/CareersPage';
import ContactPage from './pages/ContactPage';

// --- AUTH & STATUS PAGES ---
import LoginPage from './pages/auth/LoginPage'; // New
import SignupPage from './pages/auth/SignupPage'; // New
import PendingAccessPage from './pages/PendingAccessPage';
import AccessDeniedPage from './pages/AccessDeniedPage'; // You may want to remove this or use it

// --- ADMIN PAGES ---
import DashboardPage from './pages/admin/DashboardPage';

// --- CLIENT PAGES ---
import ClientDashboard from './pages/client/DashboardPage';
import ProfilePage from './pages/client/ProfilePage';
import ProjectsPage from './pages/client/ProjectsPage';
import ProjectDetailPage from './pages/client/ProjectDetailPage';
import MessagesPage from './pages/client/MessagesPage';
import BillingPage from './pages/client/BillingPage';

// --- EMPLOYEE PAGES ---
import EmployeeDashboardPage from './pages/employee/EmployeeDashboardPage';


const MainLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <>
    {children}
    <CartFAB />
    <CartDrawer />
  </>
);

function App() {
  return (
    <Router>
      <ThemeProvider>
        <AuthProvider>
          <CartProvider>
            <ToastProvider>
              <Routes>
                {/* New Authentication Pages */}
                <Route path="/login" element={<LoginPage />} />
                <Route path="/signup" element={<SignupPage />} />
                
                {/* Status Pages */}
                <Route path="/pending" element={
                  <PendingPageGate>
                    <PendingAccessPage />
                  </PendingPageGate>
                } />
                <Route path="/access-denied" element={<AccessDeniedPage />} />
                
                {/* Public-Facing Pages */}
                <Route element={<MainLayout><PublicLayout /></MainLayout>}>
                  <Route path="/" element={<HomePage />} />
                  <Route path="/services" element={<ServicesPage />} />
                  <Route path="/rentals" element={<RentalsPage />} />
                  <Route path="/rentals/:slug" element={<RentalDetailPage />} />
                  <Route path="/cart" element={<CartPage />} />
                  <Route path="/success" element={<SuccessPage />} />
                  <Route path="/careers" element={<CareersPage />} />
                  <Route path="/contact" element={<ContactPage />} />
                </Route>

                {/* Admin-Only Pages (Using RoleGate) */}
                <Route element={<RoleGate expectedRole="admin"><AdminLayout /></RoleGate>}>
                  <Route path="/admin" element={<DashboardPage />} />
                  <Route path="/dashboard" element={<DashboardPage />} />
                  {/* Add other admin routes here */}
                </Route>

                {/* Client-Only Pages (Using RoleGate) */}
                <Route element={<RoleGate expectedRole="client"><ClientLayout /></RoleGate>}>
                  <Route path="/client" element={<ClientDashboard />} />
                  <Route path="/client/dashboard" element={<ClientDashboard />} />
                  <Route path="/client/profile" element={<ProfilePage />} />
                  <Route path="/client/projects" element={<ProjectsPage />} />
                  <Route path="/client/projects/:id" element={<ProjectDetailPage />} />
                  <Route path="/client/messages" element={<MessagesPage />} />
                  <Route path="/client/billing" element={<BillingPage />} />
                </Route>

                {/* Employee-Only Pages (Using RoleGate) */}
                {/* Note: No EmployeeLayout was defined in your App.tsx, so wrapping page directly */}
                <Route path="/employee/dashboard" element={
                  <RoleGate expectedRole="employee">
                    <EmployeeDashboardPage />
                  </RoleGate>
                } />

                {/* Removed /my-page and old /pending-access routes */}
                
                {/* Fallback Redirect */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </ToastProvider>
          </CartProvider>
        </AuthProvider>
      </ThemeProvider>
    </Router>
  );
}

export default App;