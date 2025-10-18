import React, { createContext, useState, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';

interface User {
  id: string;
  email?: string;
  user_metadata?: {
    full_name?: string;
    [key: string]: any;
  };
}

interface Session {
  user: User;
}

interface AuthState {
  isAuthenticated: boolean;
  role: 'client' | 'admin' | null;
  user: User | null;
  session: Session | null;
  isLoading: boolean;
}

interface AuthContextType extends AuthState {
  clientLogin: (email?: string, password?: string) => Promise<boolean>;
  clientSignup: () => void;
  adminLogin: (email?: string, password?: string) => Promise<boolean>;
  logout: () => void;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, userData?: any) => Promise<void>;
  loading: boolean;
  error: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AuthController: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    role: null,
    user: null,
    session: null,
    isLoading: false,
  });
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const updateSession = (isAuthenticated: boolean, role: 'client' | 'admin' | null) => {
    const session = { isAuthenticated, role };
    localStorage.setItem('session', JSON.stringify(session));
    setAuthState({ ...session, user: null, session: null, isLoading: false });
  };

  const login = async (email: string, password: string) => {
    console.warn('Auth not configured. Connect your database first.');
  };

  const signup = async (email: string, password: string, userData?: any) => {
    console.warn('Auth not configured. Connect your database first.');
  };

  const clientLogin = async (email?: string, password?: string): Promise<boolean> => {
    console.warn('Auth not configured. Using mock login.');
    updateSession(true, 'client');
    navigate('/client/dashboard');
    return true;
  };

  const clientSignup = () => {
    updateSession(true, 'client');
    navigate('/client/dashboard');
  };

  const adminLogin = async (email?: string, password?: string): Promise<boolean> => {
    console.warn('Auth not configured. Using mock login.');
    updateSession(true, 'admin');
    navigate('/admin');
    return true;
  };

  const logout = () => {
    const previousRole = authState.role;
    localStorage.removeItem('session');
    setAuthState({ isAuthenticated: false, role: null, user: null, session: null, isLoading: false });
    navigate('/my-page', { state: { defaultTab: previousRole === 'admin' ? 'admin' : 'client' } });
  };

  return (
    <AuthContext.Provider value={{ ...authState, clientLogin, clientSignup, adminLogin, logout, login, signup, loading: authState.isLoading, error }}>
      {children}
    </AuthContext.Provider>
  );
};

const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  return <AuthController>{children}</AuthController>;
};

export { AuthContext };
export default AuthProvider;
