import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// --- CONTEXT & AUTH IMPORTS ---
import { AuthProvider, ClientRoute, AdminRoute, MyPage } from './features/auth';
import { CartProvider } from './contexts/CartContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { ToastProvider } from './contexts/ToastContext'; // ADD THIS LINE

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
import RequestAccessPage from './pages/RequestAccessPage';
import DashboardPage from './pages/admin/DashboardPage';
import ClientDashboard from './pages/client/DashboardPage';
import ProfilePage from './features/client/ProfilePage';
import RequestsPage from './features/client/RequestsPage';
import RequestDetailPage from './features/client/RequestDetailPage';
import NewRequestPage from './features/client/NewRequestPage';


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
            <ToastProvider> {/* WRAP WITH TOAST PROVIDER */}
              <Routes>
                {/* Authentication Pages */}
                <Route path="/my-page" element={<MyPage />} />
                <Route path="/request-access" element={<RequestAccessPage />} />

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

                {/* Admin-Only Pages */}
                <Route element={<AdminRoute />}>
                  <Route element={<AdminLayout />}>
                    <Route path="/admin" element={<DashboardPage />} />
                    <Route path="/dashboard" element={<DashboardPage />} />
                  </Route>
                </Route>

                {/* Client-Only Pages */}
                <Route element={<ClientRoute />}>
                  <Route element={<ClientLayout />}>
                    <Route path="/client" element={<ClientDashboard />} />
                    <Route path="/client/dashboard" element={<ClientDashboard />} />
                    <Route path="/client/profile" element={<ProfilePage />} />
                    <Route path="/client/requests" element={<RequestsPage />} />
                    <Route path="/client/requests/new" element={<NewRequestPage />} />
                    <Route path="/client/new" element={<NewRequestPage />} />
                    <Route path="/client/requests/:id" element={<RequestDetailPage />} />
                  </Route>
                </Route>

                {/* Fallback Redirect */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </ToastProvider> {/* WRAP WITH TOAST PROVIDER */}
          </CartProvider>
        </AuthProvider>
      </ThemeProvider>
    </Router>
  );
}

export default App;