// src/features/auth/AuthProvider.tsx
// ... (imports and types remain the same) ...

const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // ... (state and navigate) ...

  useEffect(() => {
    // ... (session fetching and listener setup) ...
  }, []);

  const updateUserState = async (session: Session | null): Promise<UserRole> => {
     setError(null);
     let userRole: UserRole = null; // Default to null initially
     if (session?.user) {
        // --- ✅ IMPLEMENT YOUR ROLE FETCHING LOGIC HERE ---
        try {
            // Query your 'profiles' table using the user ID
            const { data: profile, error: profileError } = await supabase
                .from('profiles') // <--- Make sure this table name is correct
                .select('role')   // <--- Make sure this column name is correct
                .eq('id', session.user.id) // Find profile matching the logged-in user's ID
                .single(); // Expect only one profile per user

            if (profileError) {
                // Handle cases like profile not found (user exists in auth but not profiles)
                if (profileError.code === 'PGRST116') { // PostgREST code for "relation does not exist or insufficient privilege" or "0 rows"
                     console.warn(`Profile not found for user ${session.user.id}. Defaulting role.`);
                     // Decide: should they be 'client'? Or should login fail?
                     userRole = 'client'; // Example: Default to client if no profile found
                } else {
                    // Handle other database errors
                    console.error("Error fetching user profile/role:", profileError.message);
                    setError("Could not verify your account role.");
                    // Returning null might prevent login if role is required later
                }
            } else if (profile && (profile.role === 'admin' || profile.role === 'client')) {
                // Successfully fetched a valid role
                userRole = profile.role;
            } else {
                // Profile found, but role column is missing, null, or has an invalid value
                console.warn(`User ${session.user.id} has missing or invalid role ('${profile?.role}') in profiles table. Defaulting role.`);
                userRole = 'client'; // Example: Default to client
            }
        } catch (err: any) {
             // Catch unexpected errors during the fetch
             console.error("Unexpected error fetching user role:", err);
             setError("An error occurred while checking your role.");
             userRole = null; // Prevent login if role check fails unexpectedly
        }
        // --- End Role Logic ---

        setAuthState({
          isAuthenticated: true, role: userRole, user: session.user, session: session, isLoading: false,
        });
     } else {
        // No active session
        setAuthState({
            isAuthenticated: false, role: null, user: null, session: null, isLoading: false,
        });
     }
     return userRole; // Return the determined role (could be null if fetch failed)
  };

  // ... (login, signup, clientLogin, adminLogin, logout functions remain the same as previous correct version) ...
  // Make sure they use the updated `updateUserState` which returns the role.

  const value = { /* ... (auth state and functions) ... */ };
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthProvider;