// @ts-nocheck
import React, { createContext, useContext, useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import useSWR from 'swr';
import { supabase } from '../../lib/supabase/client';
import type { AuthSession, User } from '@supabase/supabase-js';
import type { Profile } from '../../lib/supabase/operations'; // Import Profile type

// --- Helper Functions ---

/**
 * Fetches the user's profile from the database.
 */
const getProfile = async (): Promise<Profile | null> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    throw new Error('User not authenticated.');
  }

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  if (error && error.code !== 'PGRST116') { // PGRST116 = row not found
    console.error('Error fetching profile:', error);
    throw error;
  }
  return data as Profile | null;
};

/**
 * Creates a default profile for a new user if one doesn't exist.
 * Uses 'upsert' to be safe.
 */
const ensureProfileExists = async (user: User): Promise<Profile> => {
  const { data, error } = await supabase
    .from('profiles')
    .upsert({
      id: user.id,
      email: user.email,
      // Use metadata if available, otherwise email as name
      full_name: user.user_metadata?.full_name || user.email,
      // 'role' will be set to 'employee' by default from SQL
    }, {
      onConflict: 'id',
      ignoreDuplicates: true, // Don't update if profile exists
    })
    .select()
    .single();

  if (error) {
    console.error("Error ensuring profile exists:", error);
    throw error;
  }
  
  // If upsert did nothing (profile existed), fetch it
  if (!data) {
     const existing = await getProfile();
     if (existing) return existing;
  }
  
  return data as Profile;
};


// --- Auth Context ---

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  isAdmin: boolean;
  isClient: boolean;
  loading: boolean;
  logout: ()_ => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loadingUser, setLoadingUser] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  // --- SWR for Profile Fetching ---
  // Re-fetches profile when 'user' changes
  const { 
    data: profile, 
    error: profileError, 
    isLoading: loadingProfile,
    mutate: mutateProfile // Allows us to manually trigger re-fetch
  } = useSWR(user ? 'profile' : null, getProfile, {
    shouldRetryOnError: false, // Don't retry if profile doesn't exist yet
  });
  
  // --- Auth State Change Listener ---
  useEffect(() => {
    setLoadingUser(true);
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        setUser(session?.user ?? null);
        setLoadingUser(false);
        
        // --- START: NEW PROFILE CREATION LOGIC ---
        if (_event === 'SIGNED_IN' && session?.user) {
            try {
                // Check if profile exists
                const existingProfile = await getProfile();
                if (!existingProfile) {
                    // Create profile if it doesn't exist
                    await ensureProfileExists(session.user);
                    // Manually trigger a re-fetch of the profile data
                    mutateProfile();
                }
            } catch (err) {
                console.error("Failed to create profile on sign-in:", err);
            }
        }
        // --- END: NEW PROFILE CREATION LOGIC ---
      }
    );
    return () => subscription.unsubscribe();
  }, [mutateProfile]);


  // --- Logout Function ---
  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    mutateProfile(null); // Clear profile cache
    navigate('/');
  };
  
  const loading = loadingUser || (!!user && loadingProfile);
  const isAdmin = profile?.role === 'admin';
  const isClient = profile?.role === 'client';

  const value = {
    user,
    profile,
    isAdmin,
    isClient,
    loading,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// --- Custom Hook ---
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};