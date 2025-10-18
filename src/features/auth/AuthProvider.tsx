// src/features/auth/AuthProvider.tsx
import React, { createContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '../../lib/supabase/client'; // Import your Supabase client
import type { Session, User } from '@supabase/supabase-js';

// Define the shape of your user metadata including the role
interface UserMetadata {
  role?: 'pending' | 'client' | 'admin';
  full_name?: string;
  [key: string]: any;
}

interface AppUser extends User {
  user_metadata: UserMetadata; // Override with our specific metadata type
}

interface AuthState {
  isAuthenticated: boolean;
  role: UserMetadata['role'] | null;
  user: AppUser | null;
  session: Session | null;
  isLoading: boolean;
  hasPendingRequest: boolean | null; // Track if user has submitted a reason
}

interface AuthContextType extends AuthState {
  logout: () => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, fullName?: string) => Promise<void>;
  submitAccessReason: (reason: string) => Promise<void>; // New function
  checkAccessRequest: () => Promise<boolean>; // New function
  // Keep adminLogin/clientLogin for manual override if needed, but primary logic is role-based
  adminLogin?: () => void; // Optional: Keep for testing/direct login if needed
  clientLogin?: () => void; // Optional: Keep for testing/direct login if needed
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AuthController: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    role: null,
    user: null,
    session: null,
    isLoading: true, // Start loading until session is checked
    hasPendingRequest: null,
  });
  const navigate = useNavigate();
  const location = useLocation();

  // Function to check if the current user has submitted an access request
  const checkAccessRequest = useCallback(async (): Promise<boolean> => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;

    const { data, error } = await supabase
      .from('client_requests')
      .select('id')
      .eq('user_id', user.id)
      .maybeSingle(); // Use maybeSingle to get null if no row exists

    if (error) {
      console.error('Error checking access request:', error);
      return false; // Assume no request on error
    }
    return !!data; // Return true if data exists (request submitted), false otherwise
  }, []);

  // Set session and role based on Supabase Auth state change
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        setAuthState(prev => ({ ...prev, isLoading: true })); // Set loading true during async checks
        const user = session?.user as AppUser | null;
        const role = user?.user_metadata?.role || null;
        const isAuthenticated = !!session;

        let hasRequest = false;
        if (isAuthenticated && role === 'pending') {
          hasRequest = await checkAccessRequest();
        }

        setAuthState({
          isAuthenticated: isAuthenticated,
          role: role,
          user: user,
          session: session,
          isLoading: false,
          hasPendingRequest: hasRequest,
        });

        // Redirect based on role AFTER setting state
        if (isAuthenticated) {
            if (role === 'admin' && !location.pathname.startsWith('/admin')) {
                // Navigate to admin only if not already there
                // navigate('/admin', { replace: true });
            } else if (role === 'client' && !location.pathname.startsWith('/client')) {
                // Navigate to client only if not already there
                // navigate('/client', { replace: true });
            }
            // If role is 'pending', we let the specific components handle the display
        }
      }
    );

    // Initial check
    supabase.auth.getSession().then(({ data: { session } }) => {
        const user = session?.user as AppUser | null;
        const role = user?.user_metadata?.role || null;
        const isAuthenticated = !!session;
        let hasRequest = false;

        // Immediately check for pending request if user is pending
        const checkInitialRequest = async () => {
             if (isAuthenticated && role === 'pending') {
                 hasRequest = await checkAccessRequest();
             }
             setAuthState({
                isAuthenticated: isAuthenticated,
                role: role,
                user: user,
                session: session,
                isLoading: false,
                hasPendingRequest: hasRequest,
             });
        };
        checkInitialRequest();
    });


    return () => {
      subscription?.unsubscribe();
    };
  }, [navigate, location.pathname, checkAccessRequest]); // Add checkAccessRequest to dependencies


  const login = async (email: string, password: string) => {
    setAuthState(prev => ({ ...prev, isLoading: true }));
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setAuthState(prev => ({ ...prev, isLoading: false }));
      throw error; // Let the calling component handle UI error display
    }
    // Auth state change listener will handle setting user/role and redirecting
  };

  const signup = async (email: string, password: string, fullName?: string) => {
    setAuthState(prev => ({ ...prev, isLoading: true }));
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          role: 'pending', // Set initial role to pending!
          full_name: fullName || '',
        },
      },
    });
    if (error) {
      setAuthState(prev => ({ ...prev, isLoading: false }));
      throw error;
    }
    // User needs to confirm email (if enabled)
    // Auth state listener handles the rest when they eventually log in.
    setAuthState(prev => ({ ...prev, isLoading: false }));
    // Optionally navigate to a "Check your email" page here
  };

  const logout = async () => {
    setAuthState(prev => ({ ...prev, isLoading: true }));
    const { error } = await supabase.auth.signOut();
    if (error) console.error('Logout Error:', error);
    // Auth state change listener handles setting state to logged out
    setAuthState({ // Manually reset state faster
        isAuthenticated: false, role: null, user: null, session: null, isLoading: false, hasPendingRequest: null
    });
    navigate('/my-page', { replace: true }); // Go back to login
  };

  // New function to submit the access reason
  const submitAccessReason = async (reason: string) => {
    if (!authState.user) throw new Error("User not logged in");
    if (!reason.trim()) throw new Error("Reason cannot be empty");

    setAuthState(prev => ({ ...prev, isLoading: true }));
    const { error } = await supabase
      .from('client_requests')
      .insert({
        user_id: authState.user.id,
        reason: reason.trim(),
        status: 'pending' // Ensure status is pending
      });

    if (error) {
      console.error("Error submitting access reason:", error);
      setAuthState(prev => ({ ...prev, isLoading: false }));
      throw error;
    }

    // Update local state to reflect that the request has been submitted
    setAuthState(prev => ({ ...prev, hasPendingRequest: true, isLoading: false }));
  };

  // Keep adminLogin/clientLogin if needed for direct testing/override
    const adminLogin = () => {
        // This is a mock/direct login, use Supabase Auth login for real app
        setAuthState({ isAuthenticated: true, role: 'admin', user: null, session: null, isLoading: false, hasPendingRequest: false });
        navigate('/admin');
    };

    const clientLogin = () => {
        // This is a mock/direct login, use Supabase Auth login for real app
        setAuthState({ isAuthenticated: true, role: 'client', user: null, session: null, isLoading: false, hasPendingRequest: false });
        navigate('/client');
    };


  return (
    <AuthContext.Provider value={{
        ...authState,
        logout,
        login,
        signup,
        submitAccessReason, // Expose the new function
        checkAccessRequest, // Expose the check function
        adminLogin, // Optional
        clientLogin, // Optional
     }}>
      {children}
    </AuthContext.Provider>
  );
};

const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  return <AuthController>{children}</AuthController>;
};

export { AuthContext, useAuth }; // Make sure useAuth is exported here
export default AuthProvider;