import React, { createContext, useState, useEffect, ReactNode, useContext } from 'react';
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

type LoginResult = { success: boolean; role: UserRole };

interface AuthContextType extends AuthState {
  clientLogin: (email: string, password: string) => Promise<LoginResult>;
  adminLogin: (email: string, password: string) => Promise<LoginResult>;
  login: (email: string, password: string) => Promise<LoginResult>;
  signup: (email: string, password: string, userData?: any) => Promise<boolean>;
  logout: () => Promise<void>;
  error: string | null;
  setError: (error: string | null) => void;
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
          .maybeSingle();

        console.log(`[updateUserState] Profile fetch response: Status=${status}`, { profile, profileError });

        if (profileError) {
          console.error("[updateUserState] Database error during profile fetch:", profileError);
          setError(`Error fetching profile: ${profileError.message}`);
        } else if (profile) {
          console.log(`[updateUserState] Profile data received:`, profile);
          const fetchedRole = (profile as { id: string; role: string }).role;
          console.log(`[updateUserState] Role value from profile: '${fetchedRole}'`);

          if (fetchedRole === 'admin' || fetchedRole === 'client') {
            userRole = fetchedRole;
            console.log(`[updateUserState] Role successfully verified as: ${userRole}`);
            setError(null);
          } else {
            console.error(`[updateUserState] User ${userId} profile has invalid role value: '${fetchedRole}'.`);
            setError("Your account has an invalid role configuration. Please contact support.");
          }
        } else if (!profile) {
          console.warn(`[updateUserState] No profile found for user ${userId}`);
          setError("Your user profile could not be found. Please contact support.");
        }
      } catch (err: any) {
        console.error("[updateUserState] Unexpected error during role fetch:", err);
        setError("A system error occurred while verifying your role.");
        userRole = null;
      }

      setAuthState({
        isAuthenticated: true,
        role: userRole,
        user: session.user,
        session: session,
        isLoading: false,
      });
      console.log("[updateUserState] Auth state updated:", { role: userRole, isAuthenticated: true });
    } else {
      console.log("[updateUserState] No active session. Clearing auth state.");
      setAuthState({
        isAuthenticated: false,
        role: null,
        user: null,
        session: null,
        isLoading: false,
      });
    }

    console.log(`[updateUserState] Finished. Returning role: ${userRole}`);
    return userRole;
  };

  const login = async (email: string, password: string): Promise<LoginResult> => {
    console.log(`[login] Attempting login for email: ${email}`);
    setError(null);
    setAuthState(prev => ({ ...prev, isLoading: true }));

    try {
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) {
        console.error("[login] Sign-in error:", signInError);
        setError(signInError.message);
        setAuthState(prev => ({ ...prev, isLoading: false }));
        return { success: false, role: null };
      }

      if (!data.session) {
        console.error("[login] No session returned after sign-in");
        setError("Login failed. No session created.");
        setAuthState(prev => ({ ...prev, isLoading: false }));
        return { success: false, role: null };
      }

      console.log("[login] Sign-in successful. Fetching role...");
      const role = await updateUserState(data.session);
      console.log(`[login] Role fetched: ${role}`);

      return { success: true, role };
    } catch (err: any) {
      console.error("[login] Unexpected error:", err);
      setError(err.message || 'An unexpected error occurred during login.');
      setAuthState(prev => ({ ...prev, isLoading: false }));
      return { success: false, role: null };
    }
  };

  const signup = async (email: string, password: string, userData?: any): Promise<boolean> => {
    console.log(`[signup] Attempting signup for email: ${email}`);
    setError(null);
    setAuthState(prev => ({ ...prev, isLoading: true }));

    try {
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: userData,
        },
      });

      if (signUpError) {
        console.error("[signup] Sign-up error:", signUpError);
        setError(signUpError.message);
        setAuthState(prev => ({ ...prev, isLoading: false }));
        return false;
      }

      console.log("[signup] Sign-up successful");
      setAuthState(prev => ({ ...prev, isLoading: false }));
      return true;
    } catch (err: any) {
      console.error("[signup] Unexpected error:", err);
      setError(err.message || 'An unexpected error occurred during signup.');
      setAuthState(prev => ({ ...prev, isLoading: false }));
      return false;
    }
  };

  const clientLogin = async (email: string, password: string): Promise<LoginResult> => {
    console.log(`[clientLogin] Calling login for client portal`);
    return login(email, password);
  };

  const adminLogin = async (email: string, password: string): Promise<LoginResult> => {
    console.log(`[adminLogin] Calling login for admin portal`);
    return login(email, password);
  };

  const logout = async () => {
    console.log("[logout] Logging out user");
    setError(null);
    setAuthState(prev => ({ ...prev, isLoading: true }));

    try {
      const { error: signOutError } = await supabase.auth.signOut();

      if (signOutError) {
        console.error("[logout] Sign-out error:", signOutError);
        setError(signOutError.message);
        setAuthState(prev => ({ ...prev, isLoading: false }));
        return;
      }

      console.log("[logout] Sign-out successful");
      setAuthState({
        isAuthenticated: false,
        role: null,
        user: null,
        session: null,
        isLoading: false,
      });
    } catch (err: any) {
      console.error("[logout] Unexpected error:", err);
      setError(err.message || 'An unexpected error occurred during logout.');
      setAuthState(prev => ({ ...prev, isLoading: false }));
    }
  };

  const value: AuthContextType = {
    ...authState,
    clientLogin,
    adminLogin,
    login,
    signup,
    logout,
    error,
    setError,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthProvider;
