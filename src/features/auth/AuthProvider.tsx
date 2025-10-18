import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '../../lib/supabase/client';

export type UserRole = 'admin' | 'client' | null;

export interface AuthState {
  isAuthenticated: boolean;
  role: UserRole;
  user: User | null;
  session: Session | null;
  isLoading: boolean;
}

export interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string) => Promise<void>;
  clientLogin: (email: string, password: string) => Promise<void>;
  adminLogin: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  error: string | null;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    role: null,
    user: null,
    session: null,
    isLoading: true,
  });
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      updateUserState(session);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      updateUserState(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const updateUserState = async (session: Session | null): Promise<UserRole> => {
    setError(null);
    let userRole: UserRole = null;

    if (session?.user) {
      setAuthState({
        isAuthenticated: true,
        role: null,
        user: session.user,
        session: session,
        isLoading: false,
      });
      userRole = null;
    } else {
      setAuthState({
        isAuthenticated: false,
        role: null,
        user: null,
        session: null,
        isLoading: false,
      });
    }

    return userRole;
  };

  const login = async (email: string, password: string) => {
    setError(null);
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (signInError) {
      setError(signInError.message);
      throw signInError;
    }
  };

  const signup = async (email: string, password: string) => {
    setError(null);
    const { error: signUpError } = await supabase.auth.signUp({
      email,
      password,
    });
    if (signUpError) {
      setError(signUpError.message);
      throw signUpError;
    }
  };

  const clientLogin = async (email: string, password: string) => {
    await login(email, password);
  };

  const adminLogin = async (email: string, password: string) => {
    await login(email, password);
  };

  const logout = async () => {
    setError(null);
    const { error: signOutError } = await supabase.auth.signOut();
    if (signOutError) {
      setError(signOutError.message);
      throw signOutError;
    }
  };

  const value: AuthContextType = {
    ...authState,
    login,
    signup,
    clientLogin,
    adminLogin,
    logout,
    error,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthProvider;
