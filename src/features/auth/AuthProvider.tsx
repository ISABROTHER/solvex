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
  login: (email: string, password: string) => Promise<boolean>;
  signup: (email: string, password: string, userData?: any) => Promise<boolean>;
  error: string | null;
  setError: (message: string | null) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
      throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    role: null,
    user: null,
    session: null,
    isLoading: true,
  });
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

   useEffect(() => {
    setError(null);
    const getSession = async () => {
        const { data: { session } } = await supabase.auth.getSession();
        await updateUserState(session);
        setAuthState(prev => ({ ...prev, isLoading: false }));
    };
    getSession();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        await updateUserState(session);
        setAuthState(prev => ({ ...prev, isLoading: false }));
      }
    );

    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, []);

  const updateUserState = async (session: Session | null) => {
     setError(null);
     if (session?.user) {
        // --- TODO: Implement Your Role Logic Here ---
        // Fetch role from your 'profiles' table based on session.user.id
        let userRole: UserRole = 'client'; // Default/fallback
        try {
            const { data: profile } = await supabase
                .from('profiles') // **ADJUST TABLE NAME**
                .select('role') // **ADJUST COLUMN NAME**
                .eq('id', session.user.id)
                .single();
            if (profile && (profile.role === 'admin' || profile.role === 'client')) {
                userRole = profile.role;
            }
        } catch (roleError) {
             console.error("Error fetching role:", roleError);
        }
        // --- End Role Logic ---

        setAuthState({
          isAuthenticated: true,
          role: userRole,
          user: session.user,
          session: session,
          isLoading: false,
        });
     } else {
        setAuthState({
            isAuthenticated: false,
            role: null,
            user: null,
            session: null,
            isLoading: false,
        });
     }
  };


  const login = async (email: string, password: string): Promise<boolean> => {
    setAuthState(prev => ({ ...prev, isLoading: true }));
    setError(null);
    try {
      const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
      if (signInError) throw signInError;
      return true; // onAuthStateChange will handle state updates
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
       const { error: signUpError } = await supabase.auth.signUp({
         email,
         password,
         options: { data: userData },
       });
       if (signUpError) throw signUpError;
       alert('Signup successful! Please check your email to confirm.'); // Provide feedback
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
        // State cleared by onAuthStateChange
        navigate('/my-page');
    } catch (err: any) {
        setError(err.message || 'Logout failed.');
        setAuthState({ isAuthenticated: false, role: null, user: null, session: null, isLoading: false }); // Fallback clear state
        navigate('/my-page');
    }
  };

  const value = { ...authState, clientLogin, adminLogin, logout, login, signup, error, setError };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Export AuthContext if used directly elsewhere (like in MyPage example)
export { AuthContext };
export default AuthProvider;