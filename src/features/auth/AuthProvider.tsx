import React, { createContext, useState, useEffect, ReactNode, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase/client'; // Import Supabase client
import type { Session, User } from '@supabase/supabase-js'; // Import Supabase types

// Define Role type
type UserRole = 'client' | 'admin' | null;

// Structure for the authentication state
interface AuthState {
  isAuthenticated: boolean;
  role: UserRole;
  user: User | null;
  session: Session | null;
  isLoading: boolean; // Tracks initial session loading and login attempts
}

// Structure for the return value of login functions
type LoginResult = { success: boolean; role: UserRole };

// Structure for the context value provided to consumers
interface AuthContextType extends AuthState {
  clientLogin: (email?: string, password?: string) => Promise<LoginResult>;
  adminLogin: (email?: string, password?: string) => Promise<LoginResult>;
  logout: () => Promise<void>;
  login: (email: string, password: string) => Promise<LoginResult>; // Generic underlying login
  signup: (email: string, password: string, userData?: any) => Promise<boolean>; // Signup function
  error: string | null; // Stores login/auth errors
  setError: (message: string | null) => void; // Function to manually set/clear errors
}

// --- CONTEXT CREATION (Internal) ---
// Define the context *inside* this file, DO NOT EXPORT IT
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// --- CUSTOM HOOK (Exported) ---
// Define and EXPORT the hook that uses the internal context
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) throw new Error('useAuth must be used within an AuthProvider');
    return context;
};

// --- PROVIDER COMPONENT (Default Export) ---
const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false, role: null, user: null, session: null, isLoading: true, // Start in loading state
  });
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

   // Effect runs once on mount to check initial session and set up listener
   useEffect(() => {
    setError(null); // Clear any previous errors on load
    console.log("AuthProvider mounted. Checking initial session...");

    // Check the current session status from Supabase
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log("Initial session data:", session);
      // Update state based on the session (fetches role if session exists)
      updateUserState(session).finally(() => {
          // Once role fetch (or lack thereof) is done, mark initial loading as complete
          setAuthState(prev => ({ ...prev, isLoading: false }));
          console.log("Initial session check complete.");
      });
    }).catch(err => {
        // Handle errors during initial session fetch
        console.error("Error getting initial session:", err);
        setError("Could not retrieve current session status.");
        setAuthState(prev => ({ ...prev, isLoading: false })); // Stop loading even on error
    });

    // Subscribe to Supabase auth events (SIGNED_IN, SIGNED_OUT, etc.)
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        console.log("Auth state changed:", _event, session);
        // Update state whenever auth status changes
        // Don't set isLoading here, as it's not an explicit login attempt
        await updateUserState(session);
        // Ensure loading is false after potential async role fetch during state change
         setAuthState(prev => ({ ...prev, isLoading: false }));
      }
    );

    // Cleanup: Unsubscribe from the listener when the component unmounts
    return () => {
      console.log("AuthProvider unmounting. Unsubscribing listener.");
      authListener?.subscription.unsubscribe();
    };
  }, []); // Empty dependency array ensures this runs only once

  // Fetches the user's role from the 'profiles' table and updates the auth state
  const updateUserState = async (session: Session | null): Promise<UserRole> => {
     console.log("updateUserState called with session:", session);
     let userRole: UserRole = null; // Start with null role

     if (session?.user) {
        // --- Fetch Role from 'profiles' table ---
        try {
            console.log(`Fetching profile for user ID: ${session.user.id}`);
            const { data: profile, error: profileError } = await supabase
                .from('profiles') // ** YOUR PROFILES TABLE NAME **
                .select('role')   // ** YOUR ROLE COLUMN NAME **
                .eq('id', session.user.id) // Match the user ID
                .single(); // Expect exactly one profile

            console.log("Profile fetch result:", { profile, profileError });

            if (profileError) {
                // Handle profile not found error (PGRST116 indicates 0 rows found)
                if (profileError.code === 'PGRST116') {
                     console.warn(`Profile record not found for user ${session.user.id}. Cannot assign role.`);
                     // Set an error message indicating profile setup is needed
                     setError("Your user profile is not set up correctly. Please contact support.");
                     // Role remains null
                } else {
                    // Throw other database errors (like RLS issues, table not found, etc.)
                    console.error("Database error fetching profile:", profileError);
                    setError(`Database Error: ${profileError.message}`);
                    throw profileError;
                }
            } else if (profile && (profile.role === 'admin' || profile.role === 'client')) {
                // Valid role found in the profile
                userRole = profile.role;
                console.log(`Role successfully determined: ${userRole}`);
            } else {
                // Profile found, but role column is missing, null, or has an invalid value
                console.warn(`User ${session.user.id} profile has invalid or missing role: '${profile?.role}'.`);
                setError("Your account has an invalid role configuration.");
                // Role remains null
            }
        } catch (err: any) {
             // Catch any unexpected errors during the database query
             console.error("Unexpected error fetching user role:", err.message);
             setError("Could not verify your account role due to a system error.");
             userRole = null; // Ensure role is null on error
        }
        // --- End Role Logic ---

        // Update the global auth state based on session and fetched role
        setAuthState(prev => ({
          ...prev, // Keep current loading state
          isAuthenticated: true, // User is authenticated
          role: userRole, // Assign the fetched role (could be null if error occurred)
          user: session.user,
          session: session,
        }));
     } else {
        // No active session (user logged out or session expired)
        console.log("updateUserState: No active session. Clearing auth state.");
        setAuthState(prev => ({
            ...prev, // Keep current loading state
            isAuthenticated: false,
            role: null,
            user: null,
            session: null,
        }));
     }
     return userRole; // Return the role (or null)
  };

  // Generic Login Function (called by adminLogin/clientLogin)
  const login = async (email: string, password: string): Promise<LoginResult> => {
    console.log("Attempting login for:", email);
    setAuthState(prev => ({ ...prev, isLoading: true })); // Set loading for the login attempt
    setError(null); // Clear previous errors
    try {
      // Attempt to sign in with Supabase Auth
      const { data, error: signInError } = await supabase.auth.signInWithPassword({ email, password });

      // Handle Supabase authentication errors (e.g., invalid password)
      if (signInError) {
        console.error("Supabase sign-in error:", signInError);
        throw signInError; // Let the catch block handle it
      }
      // Check if session data is missing after successful sign-in (shouldn't happen)
      if (!data.session) {
        console.error("Login successful according to Supabase, but no session data returned.");
        throw new Error("Login succeeded but failed to retrieve session details.");
      }

      console.log("Supabase login successful. Fetching user role...");
      // Manually trigger the role fetch *after* successful sign-in
      const role = await updateUserState(data.session);

      // Check if role fetch failed even though login succeeded
      // If role is null here, updateUserState should have set an error message.
      if (role === null && data.session) {
          console.warn("Login successful, but failed to determine user role from profile.");
          setAuthState(prev => ({ ...prev, isLoading: false })); // Stop loading
          // Don't automatically log out; let MyPage show the error.
          return { success: true, role: null }; // Indicate login success but role failure
      }

      console.log("Role fetch complete. Login process finished.");
      setAuthState(prev => ({ ...prev, isLoading: false })); // Stop loading after role fetch
      return { success: true, role: role }; // Return success and the fetched role

    } catch (err: any) {
      // Catch errors from signInWithPassword or updateUserState's DB query
      console.error("Login process failed:", err.message);
      // Use Supabase's error message if available, otherwise provide a generic one
      setError(err.message || 'Login failed. Please check credentials and try again.');
      setAuthState(prev => ({ ...prev, isLoading: false })); // Stop loading on error
      return { success: false, role: null }; // Indicate login failure
    }
  };

  // Signup function (profile creation handled by DB trigger)
  const signup = async (email: string, password: string, userData?: any): Promise<boolean> => {
     setAuthState(prev => ({ ...prev, isLoading: true }));
     setError(null);
     try {
       // Pass first/last name if available in userData for the DB trigger
       const options = userData ? { data: { first_name: userData.firstName, last_name: userData.lastName } } : {};
       const { error: signUpError } = await supabase.auth.signUp({ email, password, options });
       if (signUpError) throw signUpError;
       alert('Signup successful! Check your email to verify your account.');
       return true;
     } catch (err: any) {
       setError(err.message || 'Signup failed.');
       return false;
     } finally {
        setAuthState(prev => ({ ...prev, isLoading: false }));
     }
  };

   // Specific login function for clients
   const clientLogin = async (email?: string, password?: string): Promise<LoginResult> => {
    if (!email || !password) { setError("Email and password are required."); return { success: false, role: null }; }
    return await login(email, password); // Uses the generic login
   };

   // Specific login function for admins
   const adminLogin = async (email?: string, password?: string): Promise<LoginResult> => {
    if (!email || !password) { setError("Email and password are required."); return { success: false, role: null }; }
     return await login(email, password); // Uses the generic login
   };

  // Logout function
  const logout = async () => {
    console.log("Attempting logout...");
    setAuthState(prev => ({ ...prev, isLoading: true })); // Indicate loading
    setError(null);
    try {
        const { error: signOutError } = await supabase.auth.signOut();
        if (signOutError) throw signOutError;
        console.log("Supabase logout successful.");
        // State clears automatically via the onAuthStateChange listener
        navigate('/my-page'); // Redirect after successful sign out
    } catch (err: any) {
        console.error("Logout failed:", err.message); 
        setError(err.message || 'Logout failed.');
        setAuthState(prev => ({ ...prev, isLoading: false })); // Clear loading on error anyway
    }
    // isLoading will be set to false by the onAuthStateChange listener
  };

  // Value provided to context consumers
  const value = { ...authState, clientLogin, adminLogin, logout, login, signup, error, setError };

  // Render the provider, passing the value to its children
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthProvider; // Export the provider component