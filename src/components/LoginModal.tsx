// src/components/LoginModal.tsx

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Loader as Loader2 } from 'lucide-react';
import { useAuth } from '../features/auth';
import { useNavigate } from 'react-router-dom';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    try {
      await login(email, password);
      onClose(); // Close the modal first
      navigate('/dashboard'); // Then redirect to the dashboard
    } catch (err: any) {
      setError(err.message || 'Failed to log in. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };
  
  useEffect(() => {
    if(isOpen) {
        setEmail('');
        setPassword('');
        setError('');
        setIsLoading(false);
    }
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            className="relative w-full max-w-sm bg-white rounded-2xl shadow-2xl p-8"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
          >
            <h2 className="text-2xl font-bold text-center text-gray-900 mb-6">Admin Login</h2>
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#C10100]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#C10100]"
                />
              </div>
              {error && <p className="text-sm text-red-600 text-center">{error}</p>}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-[#C10100] text-white font-semibold py-3 rounded-lg hover:bg-red-800 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isLoading ? <Loader2 className="animate-spin" /> : 'Log In'}
              </button>
            </form>
            <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"><X /></button>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default LoginModal;