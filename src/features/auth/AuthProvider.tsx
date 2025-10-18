// src/features/auth/AuthProvider.tsx
// Reverted: Back to mock login/logout, no Supabase

import React, { createContext, useState, ReactNode, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
// Removed Supabase imports

type UserRole = 'client' | 'admin' | null;

interface User { // Simplified mock user
  id: string;
  email?: string;
}
interface Session { // Simplified mock session
  user: User;
}

interface AuthState {
  isAuthenticated: boolean;
  role: UserRole;
  user: User | null;
  session: Session | null;
  isLoading: boolean; // Keep isLoading state
}

// Interface remains similar but functions will be mocks
interface AuthContextType extends AuthState {
  clientLogin: (email?: string, password?: string) => Promise<boolean>;
  adminLogin: (email?: string, password?: string) => Promise<boolean>;
  logout: () => void; // Reverted logout to sync
  login: (email: string, password: string) => Promise<boolean>; // Mock login
  signup: (email: string, password: string, userData?: any) => Promise<boolean>; // Mock signup
  error: string | null;
  setError: (message: string | null) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) throw new Error('useAuth must be used within an AuthProvider');
    return context;
};

const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Reverted initial state
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    role: null,
    user: null,
    session: null,
    isLoading: false, // Start not loading
  });
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  // Removed useEffect for Supabase session handling

  // Mock updateUserState (simpler version)
  const updateSessionState = (isAuthenticated: boolean, role: UserRole) => {
     const mockUser = isAuthenticated ? { id: 'mock-user-id', email: 'mock@example.com' } : null;
     const mockSession = isAuthenticated && mockUser ? { user: mockUser } : null;
     setAuthState({
         isAuthenticated,
         role,
         user: mockUser,
         session: mockSession,
         isLoading: false,
     });
     // Store mock session info if needed, or remove this
     // localStorage.setItem('session', JSON.stringify({ isAuthenticated, role }));
  };


  // Reverted Mock Login
  const login = async (email: string, password: string): Promise<boolean> => {
    setAuthState(prev => ({ ...prev, isLoading: true }));
    setError(null);
    console.warn('Auth not configured. Using mock login.');
    await new Promise(resolve => setTimeout(resolve, 500)); // Simulate delay
    // Basic mock logic: succeed if password isn't 'fail'
    if (password === 'fail') {
        setError('Mock login failed: Invalid credentials.');
        setAuthState(prev => ({ ...prev, isLoading: false }));
        return false;
    }
    // Role determination is removed - handled by specific logins now
    setAuthState(prev => ({ ...prev, isLoading: false })); // Set loading false, role set by specific login
    return true; // Indicate success for specific login to handle role/nav
  };

  // Reverted Mock Signup
  const signup = async (email: string, password: string, userData?: any): Promise<boolean> => {
     setAuthState(prev => ({ ...prev, isLoading: true }));
     setError(null);
     console.warn('Auth not configured. Using mock signup.');
     await new Promise(resolve => setTimeout(resolve, 500));
     alert('Mock signup complete. No email sent.');
     setAuthState(prev => ({ ...prev, isLoading: false }));
     return true;
  };

   // Reverted Mock Client Login
   const clientLogin = async (email?: string, password?: string): Promise<boolean> => {
     const success = await login(email || '', password || '');
     if(success) {
         updateSessionState(true, 'client'); // Set state directly
         // navigate('/client'); // Navigation moved to MyPage
     }
     return success;
   };

   // Reverted Mock Admin Login
   const adminLogin = async (email?: string, password?: string): Promise<boolean> => {
     const success = await login(email || '', password || '');
     if(success) {
         updateSessionState(true, 'admin'); // Set state directly
         // navigate('/admin'); // Navigation moved to MyPage
     }
     return success;
   };

  // Reverted Mock Logout (synchronous)
  const logout = () => {
    const previousRole = authState.role; // Remember role before clearing
    console.warn('Auth not configured. Using mock logout.');
    // localStorage.removeItem('session'); // Remove if you were storing mock session
    updateSessionState(false, null); // Clear state
    // Navigate back to login, potentially defaulting to the previous tab
    navigate('/my-page', { state: { defaultTab: previousRole === 'admin' ? 'admin' : 'client' } });
  };


  const value = { ...authState, clientLogin, adminLogin, logout, login, signup, error, setError };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export { AuthContext };
export default AuthProvider;