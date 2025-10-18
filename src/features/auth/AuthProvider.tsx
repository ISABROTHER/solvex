// src/features/auth/AuthProvider.tsx

// ... other code ...
import { useNavigate } from 'react-router-dom'; // Make sure this is imported

const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // ... state ...
  const navigate = useNavigate(); // Get the navigate function

  // ... useEffect for onAuthStateChange ...

  // Helper to update state AND return the new role
  const updateUserState = async (session: Session | null): Promise<UserRole> => {
     setError(null);
     let userRole: UserRole = null; // <-- Default role
     if (session?.user) {
        // --- TODO: IMPLEMENT YOUR ROLE FETCHING LOGIC ---
        try {
            const { data: profile } = await supabase
                .from('profiles')
                .select('role')
                .eq('id', session.user.id)
                .single();
            if (profile && (profile.role === 'admin' || profile.role === 'client')) {
                userRole = profile.role;
            } else {
                userRole = 'client'; // Fallback if profile exists but role is invalid
            }
        } catch (roleError) { 
             console.error("Error fetching role:", roleError);
             userRole = 'client'; // Fallback on error
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
     return userRole; // <-- RETURN THE ROLE
  };

  // MODIFIED login function
  const login = async (email: string, password: string): Promise<{ success: boolean; role: UserRole }> => {
    setAuthState(prev => ({ ...prev, isLoading: true }));
    setError(null);
    try {
      const { data, error: signInError } = await supabase.auth.signInWithPassword({ email, password });
      if (signInError) throw signInError;
      
      // Wait for the session to be processed and state updated
      const role = await updateUserState(data.session); // <-- This updates state AND returns the role
      
      if (!data.session) {
          throw new Error("Login succeeded but no session was returned.");
      }

      return { success: true, role: role }; // <-- Return success and the fetched role
    } catch (err: any) {
      setError(err.message || 'Login failed.');
      setAuthState(prev => ({ ...prev, isLoading: false }));
      return { success: false, role: null };
    }
  };

  // MODIFIED clientLogin
   const clientLogin = async (email?: string, password?: string): Promise<{ success: boolean; role: UserRole }> => {
    if (!email || !password) { 
        setError("Email/password required."); 
        return { success: false, role: null }; 
    }
    return await login(email, password);
   };

   // MODIFIED adminLogin
   const adminLogin = async (email?: string, password?: string): Promise<{ success: boolean; role: UserRole }> => {
    if (!email || !password) { 
        setError("Email/password required."); 
        return { success: false, role: null }; 
    }
     return await login(email, password);
   };
  
  // ... logout, signup, and value ...
  
  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// REMOVE THIS EXPORT:
// export { AuthContext };

export default AuthProvider;