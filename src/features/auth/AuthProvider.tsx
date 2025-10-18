// src/features/auth/AuthProvider.tsx
import React, { createContext, useState, useEffect, ReactNode, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase/client';
import type { Session, User } from '@supabase/supabase-js';

type UserRole = 'client' | 'admin' | null;

interface AuthState {
  isAuthenticated: boolean;
  role: UserRole;
  user: User | null;
  session: Session | null;
  isLoading: boolean;
}

interface AuthContextType extends AuthState {
  clientLogin: (email?: string, password?: string) => Promise<boolean>;
  adminLogin: (email?: string, password?: string) => Promise<boolean>;
  logout: () => Promise<void>;
  login: (email: string, password: string) => Promise<boolean>; // Generic login
  signup: (email: string, password: string, userData?: any) => Promise<boolean>; // Generic signup
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
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false, role: null, user: null, session: null, isLoading: true,
  });
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

   useEffect(() => {
    setError(null);
    supabase.auth.getSession().then(({ data: { session } }) => {
      updateUserState(session);
      setAuthState(prev => ({ ...prev, isLoading: false }));
    });

    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        await updateUserState(session);
        setAuthState(prev => ({ ...prev, isLoading: false }));
      }
    );

    return () => authListener?.subscription.unsubscribe();
  }, []);

  const updateUserState = async (session: Session | null) => {
     setError(null);
     if (session?.user) {
        // --- TODO: IMPLEMENT YOUR ROLE FETCHING LOGIC ---
        // Example: Fetch from 'profiles' table where id === session.user.id
        let userRole: UserRole = 'client'; // Default/Fallback
        try {
            const { data: profile } = await supabase
                .from('profiles') // ** CHECK TABLE NAME **
                .select('role')   // ** CHECK COLUMN NAME **
                .eq('id', session.user.id)
                .single();
            if (profile?.role === 'admin' || profile?.role === 'client') {
                userRole = profile.role;
            }
        } catch (roleError) { console.error("Error fetching role:", roleError); }
        // --- End Role Logic ---

        setAuthState({
          isAuthenticated: true, role: userRole, user: session.user, session: session, isLoading: false,
        });
     } else {
        setAuthState({
            isAuthenticated: false, role: null, user: null, session: null, isLoading: false,
        });
     }
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    setAuthState(prev => ({ ...prev, isLoading: true }));
    setError(null);
    try {
      const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
      if (signInError) throw signInError;
      // State updates via onAuthStateChange
      return true;
    } catch (err: any) {
      setError(err.message || 'Login failed.');
      setAuthState(prev => ({ ...prev, isLoading: false }));
      return false;
    }
  };

  const signup = async (email: string, password: string, userData?: any): Promise<boolean> => {
     setAuthState(prev => ({ ...prev, isLoading: true }));
     setError(null);
     try {
       const { error: signUpError } = await supabase.auth.signUp({ email, password, options: { data: userData } });
       if (signUpError) throw signUpError;
       alert('Signup successful! Check email to confirm.');
       return true;
     } catch (err: any) {
       setError(err.message || 'Signup failed.');
       setAuthState(prev => ({ ...prev, isLoading: false }));
       return false;
     }
  };

   const clientLogin = async (email?: string, password?: string): Promise<boolean> => {
    if (!email || !password) { setError("Email/password required."); return false; }
    return await login(email, password);
   };

   const adminLogin = async (email?: string, password?: string): Promise<boolean> => {
    if (!email || !password) { setError("Email/password required."); return false; }
     return await login(email, password);
   };

  const logout = async () => {
    setAuthState(prev => ({ ...prev, isLoading: true }));
    setError(null);
    try {
        const { error: signOutError } = await supabase.auth.signOut();
        if (signOutError) throw signOutError;
        // State clears via onAuthStateChange
        navigate('/my-page');
    } catch (err: any) {
        setError(err.message || 'Logout failed.');
        setAuthState({ isAuthenticated: false, role: null, user: null, session: null, isLoading: false }); // Fallback
        navigate('/my-page');
    }
  };

  const value = { ...authState, clientLogin, adminLogin, logout, login, signup, error, setError };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export { AuthContext }; // Export for potential direct use (like in MyPage)
export default AuthProvider;