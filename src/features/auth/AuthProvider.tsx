// src/features/auth/AuthProvider.tsx
import React, { createContext, useState, useEffect, ReactNode, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase/client';
import type { Session, User } from '@supabase/supabase-js';

type UserRole = 'client' | 'admin' | null;

interface AuthState { /* ... state properties ... */ }
type LoginResult = { success: boolean; role: UserRole };
interface AuthContextType extends AuthState { /* ... function signatures ... */ }

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => { /* ... useAuth hook ... */ };

const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false, role: null, user: null, session: null, isLoading: true,
  });
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => { /* ... session fetching and listener ... */ }, []);

  // --- UPDATED updateUserState with ENHANCED LOGGING ---
  const updateUserState = async (session: Session | null): Promise<UserRole> => {
     console.log("[updateUserState] Start. Session available:", !!session);
     let userRole: UserRole = null; // Default role outcome

     // Only proceed if we have a valid session and user
     if (session?.user?.id) {
        const userId = session.user.id;
        console.log(`[updateUserState] Processing user ID: ${userId}`);
        setError(null); // Clear previous errors *before* fetching profile

        try {
            console.log(`[updateUserState] Attempting to fetch profile for ID: ${userId}`);
            // Explicitly select id and role
            const { data: profile, error: profileError, status } = await supabase
                .from('profiles')
                .select('id, role') // Select id and role
                .eq('id', userId)
                .single(); // Expect one row or error

            console.log(`[updateUserState] Profile fetch response: Status=${status}`, { profile, profileError });

            // --- Analyze the fetch result ---
            if (profileError) {
                // Specific check for profile not found (PGRST116 can also mean RLS denial on 0 rows)
                if (profileError.code === 'PGRST116') {
                     console.warn(`[updateUserState] Profile fetch returned 0 rows (PGRST116) for user ${userId}. This likely means RLS blocked access or the profile row does not exist.`);
                     setError("Your user profile could not be found or accessed. Please contact support.");
                     // userRole remains null
                } else {
                    // Log and set error for other database errors
                    console.error("[updateUserState] Database error during profile fetch:", profileError);
                    setError(`Error fetching profile: ${profileError.message}`);
                    // userRole remains null
                }
            } else if (profile && profile.id === userId) {
                // --- Profile data RECEIVED successfully ---
                console.log(`[updateUserState] Profile data received:`, profile);
                const fetchedRole = profile.role;
                console.log(`[updateUserState] Role value from profile: '${fetchedRole}' (Type: ${typeof fetchedRole})`);

                // Check if the fetched role is valid
                if (fetchedRole === 'admin' || fetchedRole === 'client') {
                    userRole = fetchedRole;
                    console.log(`[updateUserState] Role successfully verified as: ${userRole}`);
                    setError(null); // Clear any previous transient error
                } else {
                    // Profile exists, but the role value is wrong
                    console.error(`[updateUserState] User ${userId} profile has invalid role value: '${fetchedRole}'.`);
                    setError("Your account has an invalid role configuration. Please contact support.");
                    // userRole remains null
                }
            } else {
                 // Should not happen with .single() unless Supabase behaviour changes
                 console.error(`[updateUserState] Profile fetch returned success status (${status}) but data is missing or ID mismatch. Profile received:`, profile);
                 setError("Inconsistent data received while verifying role.");
                 // userRole remains null
            }
        } catch (err: any) {
             // Catch unexpected JS errors during the try block
             console.error("[updateUserState] Unexpected JavaScript error during role fetch:", err);
             setError("A system error occurred while verifying your role.");
             userRole = null; // Ensure role is null
        }
        // --- End Role Logic ---

        // Update global state ONLY if login succeeded (session exists)
        setAuthState(prev => ({
          ...prev, // Keep isLoading from login function
          isAuthenticated: true,
          role: userRole, // Assign determined role (could be null)
          user: session.user,
          session: session,
        }));
        console.log("[updateUserState] Auth state updated:", { role: userRole, isAuthenticated: true });

     } else {
        // No session or logout occurred
        console.log("[updateUserState] No active session. Clearing auth state.");
        setAuthState(prev => ({
            ...prev, // Keep isLoading from logout function
            isAuthenticated: false, role: null, user: null, session: null,
        }));
     }
     console.log(`[updateUserState] Finished. Returning role: ${userRole}`);
     return userRole; // Return the determined role
  }; // --- End updateUserState ---


  // --- login function (no changes needed) ---
  const login = async (email: string, password: string): Promise<LoginResult> => {
     // ... (existing login logic) ...
  };
  // --- signup function (no changes needed) ---
  const signup = async (email: string, password: string, userData?: any): Promise<boolean> => {
      // ... (existing signup logic) ...
  };
  // --- clientLogin / adminLogin (no changes needed) ---
  const clientLogin = async (email?: string, password?: string): Promise<LoginResult> => { /* ... */ };
  const adminLogin = async (email?: string, password?: string): Promise<LoginResult> => { /* ... */ };
  // --- logout function (no changes needed) ---
  const logout = async () => { /* ... */ };


  const value = { ...authState, clientLogin, adminLogin, logout, login, signup, error, setError };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthProvider;