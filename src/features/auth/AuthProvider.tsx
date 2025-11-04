// src/main.tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import { CartProvider } from './contexts/CartContext';
import { ToastProvider } from './contexts/ToastContext';

// --- THIS IS THE FIX ---
// Import the new AuthProvider, not the old one from /contexts
import { AuthProvider } from './features/auth/AuthProvider'; 
// --- END OF FIX ---

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AuthProvider>
      <ToastProvider>
        <CartProvider>
          <App />
        </CartProvider>
      </ToastProvider>
    </AuthProvider>
  </React.StrictMode>,
)