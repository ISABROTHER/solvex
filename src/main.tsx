import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { BrowserRouter } from 'react-router-dom';
import { ToastProvider } from './contexts/ToastContext.tsx';
import { CartProvider } from './contexts/CartContext.tsx';
// Ensure AuthProvider is imported correctly
import { AuthProvider } from './features/auth'; // Or './features/auth/AuthProvider'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <ToastProvider>
        <CartProvider>
          {/* Ensure AuthProvider wraps App */}
          <AuthProvider>
            <App />
          </AuthProvider>
        </CartProvider>
      </ToastProvider>
    </BrowserRouter>
  </React.StrictMode>,
);