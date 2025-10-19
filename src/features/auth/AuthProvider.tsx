// src/features/auth/AuthProvider.tsx
import React, { createContext, useState, useEffect, ReactNode, useContext, useCallback } from 'react';
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
type LoginResult = { success: boolean; role: UserRole | null };

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<LoginResult>;
  logout: () => Promise<void>;
  signup: (email: string, password: string, userData?: any) => Promise<boolean>;
  clientLogin: (email: string, password: string) => Promise<LoginResult>;
  adminLogin: (email: string, password: string) => Promise<LoginResult>;
  error: string | null;
  setError: (error: string | null) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// --- FULLY IMPLEMENTED useAuth HOOK ---
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false, role: null, user: null, session: null, isLoading: true,
  });
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  // --- UPDATED updateUserState (Original logic preserved) ---
  const updateUserState = useCallback(async (session: Session | null): Promise<UserRole> => {
     console.log("[updateUserState] Start. Session available:", !!session);
     let userRole: UserRole = null;
     if (session?.user?.id) {
        const userId = session.user.id;
        console.log(`[updateUserState] Processing user ID: ${userId}`);
        setError(null);
        try {
            console.log(`[updateUserState] Attempting to fetch profile for ID: ${userId}`);
            const { data: profile, error: profileError, status } = await supabase
                .from('profiles')
                .select('id, role')
                .eq('id', userId)
                .single();
            console.log(`[updateUserState] Profile fetch response: Status=${status}`, { profile, profileError });

            if (profileError) {
                if (profileError.code === 'PGRST116') {
                     console.warn(`[updateUserState] Profile fetch returned 0 rows (PGRST116) for user ${userId}. This likely means RLS blocked access or the profile row does not exist.`);
                     setError("Your user profile could not be found or accessed. Please contact support.");
                } else {
                    console.error("[updateUserState] Database error during profile fetch:", profileError);
                    setError(`Error fetching profile: ${profileError.message}`);
                }
            } else if (profile && profile.id === userId) {
                console.log(`[updateUserState] Profile data received:`, profile);
                const fetchedRole = profile.role;
                console.log(`[updateUserState] Role value from profile: '${fetchedRole}' (Type: ${typeof fetchedRole})`);

                if (fetchedRole === 'admin' || fetchedRole === 'client') {
                    userRole = fetchedRole;
                    console.log(`[updateUserState] Role successfully verified as: ${userRole}`);
                    setError(null);
                } else {
                    console.error(`[updateUserState] User ${userId} profile has invalid role value: '${fetchedRole}'.`);
                    setError("Your account has an invalid role configuration. Please contact support.");
                }
            } else {
                 console.error(`[updateUserState] Profile fetch returned success status (${status}) but data is missing or ID mismatch. Profile received:`, profile);
                 setError("Inconsistent data received while verifying role.");
            }
        } catch (err: any) {
             console.error("[updateUserState] Unexpected JavaScript error during role fetch:", err);
             setError("A system error occurred while verifying your role.");
             userRole = null;
        }
        setAuthState(prev => ({
          ...prev, 
          isAuthenticated: true,
          role: userRole, 
          user: session.user,
          session: session,
        }));
        console.log("[updateUserState] Auth state updated:", { role: userRole, isAuthenticated: true });

     } else {
        console.log("[updateUserState] No active session. Clearing auth state.");
        setAuthState(prev => ({
            ...prev,
            isAuthenticated: false, role: null, user: null, session: null,
        }));
     }
     console.log(`[updateUserState] Finished. Returning role: ${userRole}`);
     return userRole;
  }, []);

  // Session listener/initial check
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      updateUserState(session).then(() => {
        setAuthState(prev => ({ ...prev, isLoading: false }));
      });
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        updateUserState(session);
        setAuthState(prev => ({ ...prev, isLoading: false }));
      }
    );

    return () => subscription?.unsubscribe();
  }, [updateUserState]);

  // --- LOGIN/SIGNUP/LOGOUT IMPLEMENTATION ---
  
  const login = async (email: string, password: string): Promise<LoginResult> => {
     setAuthState(prev => ({ ...prev, isLoading: true, isAuthenticated: false }));
     setError(null);
     
     const { data, error: authError } = await supabase.auth.signInWithPassword({ email, password });
     
     if (authError) {
        console.error("Supabase login error:", authError);
        setError(authError.message || "Invalid login credentials.");
        setAuthState(prev => ({ ...prev, isLoading: false }));
        return { success: false, role: null };
     }
     
     const role = await updateUserState(data.session);
     setAuthState(prev => ({ ...prev, isLoading: false }));
     
     return { success: true, role };
  };

  const signup = async (email: string, password: string, userData?: any): Promise<boolean> => {
      console.warn('Signup process initiated via Supabase Auth.');
      setAuthState(prev => ({ ...prev, isLoading: true }));
      setError(null);
      
      const { data, error: authError } = await supabase.auth.signUp({ 
          email, 
          password, 
          options: { data: userData }
      });
      
      setAuthState(prev => ({ ...prev, isLoading: false }));
      
      if (authError) {
          console.error("Supabase signup error:", authError);
          setError(authError.message || "Signup failed.");
          return false;
      }
      
      console.log("Signup successful, user data:", data);
      return true;
  };
  
  const clientLogin = async (email: string, password: string): Promise<LoginResult> => { 
      const result = await login(email, password);
      if (result.success && result.role !== 'client') {
          if (result.role === 'admin') {
              setError("You logged in as an Admin. Please use the Admin Portal or log in with a Client account.");
              await logout();
          } 
          return { success: false, role: result.role };
      }
      return result; 
  };
  
  const adminLogin = async (email: string, password: string): Promise<LoginResult> => { 
      const result = await login(email, password);
      if (result.success && result.role !== 'admin') {
          if (result.role === 'client') {
              setError("You logged in as a Client. Please use the Client Portal or log in with an Admin account.");
              await logout();
          }
          return { success: false, role: result.role };
      }
      return result;
  };

  const logout = async () => {
    setAuthState(prev => ({ ...prev, isLoading: true }));
    setError(null);
    const { error: authError } = await supabase.auth.signOut();
    
    setAuthState(prev => ({ ...prev, isLoading: false }));
    
    if (authError) {
      console.error("Supabase logout error:", authError);
      setError(authError.message || "Logout failed.");
    } else {
        setAuthState({ isAuthenticated: false, role: null, user: null, session: null, isLoading: false });
        navigate('/my-page');
    }
  };


  const value: AuthContextType = { ...authState, clientLogin, adminLogin, logout, login, signup, error, setError };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthProvider;