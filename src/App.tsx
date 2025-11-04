import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './features/auth/AuthProvider';
import PublicLayout from './app/layout/PublicLayout';
import AdminLayout from './app/layout/AdminLayout';
import ClientLayout from './app/layout/ClientLayout';
import AdminRoute from './features/auth/AdminRoute';
import ClientRoute from './features/auth/ClientRoute';
import HomePage from './pages/HomePage';
import ServicesPage from './pages/ServicesPage';
import RentalsPage from './pages/RentalsPage';
import CareersPage from './pages/CareersPage';
import ContactPage from './pages/ContactPage';
import RequestAccessPage from './pages/RequestAccessPage';
import SuccessPage from './pages/SuccessPage';
import MyPage from './features/auth/MyPage';
import AdminDashboard from './pages/admin/DashboardPage';
import ClientDashboard from './pages/client/DashboardPage';
import { ToastProvider } from './contexts/ToastContext';
import { CartProvider } from './contexts/CartContext';
import CartDrawer from './contexts/CartDrawer';
import CartFAB from './contexts/CartFAB';

// --- IMPORT THE NEW PROFILE PAGE ---
import ProfilePage from './pages/Profile';

function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <CartProvider>
          <AuthProvider>
            <Routes>
            {/* --- Public Routes --- */}
            <Route path="/" element={<PublicLayout />}>
              <Route index element={<HomePage />} />
              <Route path="services" element={<ServicesPage />} />
              <Route path="rentals" element={<RentalsPage />} />
              <Route path="careers" element={<CareersPage />} />
              <Route path="contact" element={<ContactPage />} />
              <Route path="request-access" element={<RequestAccessPage />} />
              <Route path="success" element={<SuccessPage />} />
              <Route path="my-page" element={<MyPage />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Route>

            {/* --- Admin Dashboard --- */}
            <Route
              path="/admin/*"
              element={
                <AdminRoute>
                  <AdminLayout />
                </AdminRoute>
              }
            >
              <Route index element={<AdminDashboard />} />
              <Route path="*" element={<AdminDashboard />} />
            </Route>

            {/* --- Client Portal --- */}
            <Route
              path="/portal/*"
              element={
                <ClientRoute>
                  <ClientLayout />
                </ClientRoute>
              }
            >
              <Route index element={<ClientDashboard />} />
              {/* --- ADD THE PROFILE ROUTE HERE --- */}
              <Route path="profile" element={<ProfilePage />} />
              <Route path="*" element={<Navigate to="/portal" replace />} />
            </Route>

          </Routes>
          <CartDrawer />
          <CartFAB />
        </AuthProvider>
        </CartProvider>
      </ToastProvider>
    </BrowserRouter>
  );
}

export default App;