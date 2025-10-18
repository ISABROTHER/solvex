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
  clientLogin: (email?: string, password?: string) => Promise<{ success: boolean; role: UserRole }>;
  adminLogin: (email?: string, password?: string) => Promise<{ success: boolean; role: UserRole }>;
  logout: () => Promise<void>;
  login: (email: string, password: string) => Promise<{ success: boolean; role: UserRole }>;
  signup: (email: string, password: string, userData?: any) => Promise<boolean>;
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

  const updateUserState = async (session: Session | null): Promise<UserRole> => {
     setError(null);
     let userRole: UserRole = null;
     if (session?.user) {
        // --- ⚠️ IMPORTANT: IMPLEMENT YOUR ROLE FETCHING LOGIC HERE ---
        // Query your database (e.g., 'profiles' table) using `session.user.id`
        // to determine if the user is 'client' or 'admin'.
        // Replace this example:
        try {
            const { data: profile, error: profileError } = await supabase
                .from('profiles') // ** CHECK YOUR TABLE NAME **
                .select('role')   // ** CHECK YOUR COLUMN NAME **
                .eq('id', session.user.id) // Assumes profiles.id matches auth.users.id
                .single();

            if (profileError) {
                console.error("Error fetching user role:", profileError.message);
                // Decide fallback: maybe default to client, or prevent login by returning null?
                userRole = 'client'; // Example fallback
            } else if (profile && (profile.role === 'admin' || profile.role === 'client')) {
                userRole = profile.role;
            } else {
                console.warn(`User ${session.user.id} has missing or invalid role in profiles table.`);
                userRole = 'client'; // Example fallback for invalid role
            }
        } catch (roleError: any) {
             console.error("Unexpected error fetching role:", roleError);
             userRole = 'client'; // Example fallback
             setError("Could not verify user role.");
        }
        // --- End Role Logic ---

        setAuthState({
          isAuthenticated: true, role: userRole, user: session.user, session: session, isLoading: false,
        });
     } else {
        setAuthState({
            isAuthenticated: false, role: null, user: null, session: null, isLoading: false,
        });
     }
     return userRole; // Return the determined role
  };

  const login = async (email: string, password: string): Promise<{ success: boolean; role: UserRole }> => {
    setAuthState(prev => ({ ...prev, isLoading: true }));
    setError(null);
    try {
      const { data, error: signInError } = await supabase.auth.signInWithPassword({ email, password });
      if (signInError) throw signInError;
      if (!data.session) throw new Error("Login successful, but session data is missing.");

      // Wait for session processing and role fetch
      const role = await updateUserState(data.session);

      return { success: true, role: role };
    } catch (err: any) {
      setError(err.message || 'Login failed. Check email/password.');
      setAuthState(prev => ({ ...prev, isLoading: false }));
      return { success: false, role: null };
    }
  };

  const signup = async (email: string, password: string, userData?: any): Promise<boolean> => {
     setAuthState(prev => ({ ...prev, isLoading: true }));
     setError(null);
     try {
       // Note: You might want to create a profile entry here via an edge function or trigger
       const { error: signUpError } = await supabase.auth.signUp({ email, password, options: { data: userData } });
       if (signUpError) throw signUpError;
       alert('Signup successful! Check your email to verify your account.');
       return true;
     } catch (err: any) {
       setError(err.message || 'Signup failed. Please try again.');
       return false;
     } finally {
        setAuthState(prev => ({ ...prev, isLoading: false }));
     }
  };

   const clientLogin = async (email?: string, password?: string): Promise<{ success: boolean; role: UserRole }> => {
    if (!email || !password) { setError("Email and password are required."); return { success: false, role: null }; }
    return await login(email, password);
   };

   const adminLogin = async (email?: string, password?: string): Promise<{ success: boolean; role: UserRole }> => {
    if (!email || !password) { setError("Email and password are required."); return { success: false, role: null }; }
     return await login(email, password);
   };

  const logout = async () => {
    setAuthState(prev => ({ ...prev, isLoading: true }));
    setError(null);
    try {
        const { error: signOutError } = await supabase.auth.signOut();
        if (signOutError) throw signOutError;
        // State clears via onAuthStateChange listener
        navigate('/my-page'); // Redirect after sign out
    } catch (err: any) {
        setError(err.message || 'Logout failed.');
        setAuthState({ isAuthenticated: false, role: null, user: null, session: null, isLoading: false }); // Force clear state
        navigate('/my-page');
    }
  };

  const value = { ...authState, clientLogin, adminLogin, logout, login, signup, error, setError };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthProvider;