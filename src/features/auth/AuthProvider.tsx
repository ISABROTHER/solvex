import React, { createContext, useState, useEffect, ReactNode, useContext } from 'react';
import { supabase } from '../../lib/supabase/client';
import type { Session, User }  from '@supabase/supabase-js';

type UserRole = 'client' | 'admin' | 'employee' | null;
type ApprovalStatus = 'pending' | 'approved' | 'denied' | null;

interface Profile {
  id: string;
  role: string;
  first_name?: string;
  last_name?: string;
  email?: string;
  phone?: string;
  home_address?: string;
  birth_date?: string;
  position?: string;
  employee_number?: string;
  start_date?: string;
  avatar_url?: string;
  approval_status: ApprovalStatus;
  reason_for_access: string | null;
  [key: string]: any;
}

interface AuthState {
  isAuthenticated: boolean;
  role: UserRole;
  approval_status: ApprovalStatus;
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  isLoading: boolean;
}

type LoginResult = { success: boolean; role: UserRole; approval_status: ApprovalStatus };
type SignupResult = { success: boolean; error: string | null };

interface AuthContextType extends AuthState {
  clientLogin: (email: string, password: string) => Promise<LoginResult>;
  adminLogin: (email: string, password: string) => Promise<LoginResult>;
  login: (email: string, password: string) => Promise<LoginResult>;
  signup: (email: string, password: string, userData: { first_name: string, last_name: string }) => Promise<SignupResult>;
  logout: () => Promise<void>;
  error: string | null;
  setError: (error: string | null) => void;
  isRestoring: boolean;
  setRestoring: (isRestoring: boolean) => void;
  refreshUserProfile: () => Promise<void>;
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
    approval_status: null,
    user: null,
    session: null,
    profile: null,
    isLoading: true,
  });
  const [error, setError] = useState<string | null>(null);
  const [isRestoring, setIsRestoring] = useState(false);

  const fetchProfile = async (userId: string): Promise<{ profile: Profile | null, role: UserRole, status: ApprovalStatus, error: string | null }> => {
    try {
      console.log(`[fetchProfile] Attempting to fetch full profile for ID: ${userId}`);
      // --- THIS WAS THE BROKEN LINE ---
      const { data: profile, error: profileError, status } = await supabase
        .from('profiles')
        .select('*, approval_status, reason_for_access')
        .eq('id', userId)
        .maybeSingle();

      console.log(`[fetchProfile] Profile fetch response: Status=${status}`);

      if (profileError) {
        console.error("[fetchProfile] Database error:", profileError);
        return { profile: null, role: null, status: null, error: `Error fetching profile: ${profileError.message}` };
      }
      
      if (profile) {
        const profileData = profile as Profile;
        const approvalStatus: ApprovalStatus = profileData.approval_status || 'pending';
        console.log(`[fetchProfile] Profile data received. Approval: ${approvalStatus}`);
        
        const fetchedRole = profileData.role;
        if (fetchedRole === 'admin' || fetchedRole === 'client' || fetchedRole === 'employee') {
          console.log(`[fetchProfile] Role successfully verified as: ${fetchedRole}`);
          return { profile: profileData, role: fetchedRole, status: approvalStatus, error: null };
        } else {
          console.error(`[fetchProfile] User ${userId} profile has invalid role value: '${fetchedRole}'.`);
          return { profile: profileData, role: null, status: approvalStatus, error: "Your account has an invalid role configuration." };
        }
      }
      
      console.warn(`[fetchProfile] No profile found for user ${userId}`);
      return { profile: null, role: null, status: null, error: "Your user profile could not be found." };

    } catch (err: any) {
      console.error("[fetchProfile] Unexpected error:", err);
      return { profile: null, role: null, status: null, error: "A system error occurred while verifying your role." };
    }
  };

  const updateUserState = async (session: Session | null): Promise<LoginResult> => {
    console.log("[updateUserState] Start. Session available:", !!session);
    
    if (session?.user?.id) {
      const { profile, role, status, error: profileError } = await fetchProfile(session.user.id);
      
      if (profileError) {
        setError(profileError);
      } else {
        setError(null);
      }

      setAuthState({
        isAuthenticated: true,
        role: role,
        approval_status: status,
        user: session.user,
        session: session,
        profile: profile,
        isLoading: false,
      });
      
      if (isRestoring) {
        setIsRestoring(false);
      }
      
      console.log("[updateUserState] Auth state updated:", { role: role, approval: status, isAuthenticated: true });
      return { success: true, role: role, approval_status: status };

    } else {
      console.log("[updateUserState] No active session.");
      
      if (isRestoring) {
        console.log("[updateUserState] Restoring session, ignoring null session.");
        return { success: true, role: authState.role, approval_status: authState.approval_status }; // Keep current state
      }
      
      console.log("[updateUserState] Clearing auth state.");
      setAuthState({
        isAuthenticated: false,
        role: null,
        approval_status: null,
        user: null,
        session: null,
        profile: null,
        isLoading: false,
      });
      
      console.log(`[updateUserState] Finished. Returning nulls.`);
      return { success: true, role: null, approval_status: null };
    }
  };
  
  const refreshUserProfile = async () => {
    console.log("[refreshUserProfile] Manual refresh triggered.");
    if (authState.user?.id) {
      setAuthState(prev => ({ ...prev, isLoading: true })); // Set loading
      const { profile, role, status, error: profileError } = await fetchProfile(authState.user.id);
      
      if (profileError) {
        setError(profileError);
      } else {
        setError(null);
      }
      
      // Update state with new profile info
      setAuthState(prev => ({
        ...prev,
        profile: profile,
        role: role,
        approval_status: status,
        isLoading: false,
      }));
      console.log("[refreshUserProfile] Profile data refreshed.");
    } else {
      console.warn("[refreshUserProfile] No user ID found, cannot refresh.");
    }
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      updateUserState(session);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      updateUserState(session);
    });

    return () => subscription.unsubscribe();
  }, []); // Only run on mount


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
        return { success: false, role: null, approval_status: null };
      }

      if (!data.session) {
        console.error("[login] No session returned after sign-in");
        setError("Login failed. No session created.");
        setAuthState(prev => ({ ...prev, isLoading: false }));
        return { success: false, role: null, approval_status: null };
      }

      console.log("[login] Sign-in successful. Fetching role...");
      const result = await updateUserState(data.session);
      console.log(`[login] Role/Status fetched: ${result.role}, ${result.approval_status}`);

      return result;
    } catch (err: any) {
      console.error("[login] Unexpected error:", err);
      setError(err.message || 'An unexpected error occurred during login.');
      setAuthState(prev => ({ ...prev, isLoading: false }));
      return { success: false, role: null, approval_status: null };
    }
  };

  const signup = async (email: string, password: string, userData: { first_name: string, last_name: string }): Promise<SignupResult> => {
    console.log(`[signup] Attempting signup for email: ${email}`);
    setError(null);
    setAuthState(prev => ({ ...prev, isLoading: true }));

    try {
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            ...userData,
            role: 'client'
          },
        },
      });

      if (signUpError) {
        console.error("[signup] Sign-up error:", signUpError);
        setError(signUpError.message);
        setAuthState(prev => ({ ...prev, isLoading: false }));
        return { success: false, error: signUpError.message };
      }
      
      if (!data.user) {
         console.error("[signup] Sign-up success but no user data returned.");
         setError("Sign up failed. Please try again.");
         setAuthState(prev => ({ ...prev, isLoading: false }));
         return { success: false, error: "Sign up failed." };
      }

      console.log("[signup] Sign-up successful. User must confirm email.");
      setAuthState(prev => ({ ...prev, isLoading: false }));
      return { success: true, error: null };

    } catch (err: any) {
      console.error("[signup] Unexpected error:", err);
      setError(err.message || 'An unexpected error occurred during signup.');
      setAuthState(prev => ({ ...prev, isLoading: false }));
      return { success: false, error: err.message };
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
    if (isRestoring) {
      setIsRestoring(false);
    }
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
        approval_status: null,
        user: null,
        session: null,
        profile: null,
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
    isRestoring,
    setRestoring: setIsRestoring,
    refreshUserProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthProvider;