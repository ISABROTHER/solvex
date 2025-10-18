// src/features/auth/AuthProvider.tsx
import React, { createContext, useState, useEffect, ReactNode, useContext } from 'react';
import { useNavigate } from 'react-router-dom'; // <-- Import useNavigate
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
  clientLogin: (email?: string, password?: string) => Promise<{ success: boolean; role: UserRole }>; // <-- Return role
  adminLogin: (email?: string, password?: string) => Promise<{ success: boolean; role: UserRole }>; // <-- Return role
  logout: () => Promise<void>;
  login: (email: string, password: string) => Promise<{ success: boolean; role: UserRole }>; // <-- Return role
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
  const navigate = useNavigate(); // <-- Initialize navigate

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

  // Updated function to return the role
  const updateUserState = async (session: Session | null): Promise<UserRole> => {
     setError(null);
     let userRole: UserRole = null; // Default role
     if (session?.user) {
        // --- TODO: IMPLEMENT YOUR ROLE FETCHING LOGIC ---
        // This MUST query your database (e.g., 'profiles' table)
        // to determine if the user `session.user.id` is 'client' or 'admin'.
        // Replace this example with your actual logic.
        try {
            const { data: profile, error: profileError } = await supabase
                .from('profiles') // ** CHECK YOUR TABLE NAME **
                .select('role')   // ** CHECK YOUR COLUMN NAME **
                .eq('id', session.user.id)
                .single();

            if (profileError) {
                console.error("Error fetching user role:", profileError);
                userRole = 'client'; // Fallback role on error
            } else if (profile && (profile.role === 'admin' || profile.role === 'client')) {
                userRole = profile.role;
            } else {
                console.warn(`User ${session.user.id} has missing or invalid role.`);
                userRole = 'client'; // Fallback role if invalid/missing
            }
        } catch (roleError) {
             console.error("Unexpected error fetching role:", roleError);
             userRole = 'client'; // Fallback role on unexpected error
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

  // Updated login function to return role
  const login = async (email: string, password: string): Promise<{ success: boolean; role: UserRole }> => {
    setAuthState(prev => ({ ...prev, isLoading: true }));
    setError(null);
    try {
      const { data, error: signInError } = await supabase.auth.signInWithPassword({ email, password });
      if (signInError) throw signInError;
      if (!data.session) throw new Error("Login succeeded but no session returned.");

      // Process session and get role *before* returning
      const role = await updateUserState(data.session);

      return { success: true, role: role }; // Return success and the role
    } catch (err: any) {
      setError(err.message || 'Login failed.');
      setAuthState(prev => ({ ...prev, isLoading: false }));
      return { success: false, role: null };
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
     } finally {
        // Set loading false here too, as onAuthStateChange might not fire immediately for signup
        setAuthState(prev => ({ ...prev, isLoading: false }));
     }
  };

   // Updated clientLogin to match new return type
   const clientLogin = async (email?: string, password?: string): Promise<{ success: boolean; role: UserRole }> => {
    if (!email || !password) {
        setError("Email/password required.");
        return { success: false, role: null };
    }
    return await login(email, password);
   };

   // Updated adminLogin to match new return type
   const adminLogin = async (email?: string, password?: string): Promise<{ success: boolean; role: UserRole }> => {
    if (!email || !password) {
        setError("Email/password required.");
        return { success: false, role: null };
    }
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

// No direct export of AuthContext needed anymore
export default AuthProvider;