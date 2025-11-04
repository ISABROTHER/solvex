// src/features/auth/AuthProvider.tsx
// @ts-nocheck
import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '../../lib/supabase/client';
import type { AuthSession, User } from '@supabase/supabase-js';
import type { Profile } from '../../lib/supabase/operations'; // Import Profile type

// --- Helper Functions ---

/**
 * Fetches the user's profile from the database.
 */
const getProfile = async (): Promise<Profile | null> => {
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
      // Do not overwrite existing profile data, just create if missing
      ignoreDuplicates: true, 
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
     // This case should be rare, but handles a race condition
     throw new Error("Failed to retrieve profile after upsert.");
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
  logout: () => Promise<void>;
  refreshProfile: () => void; // Add a refresh function
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loadingUser, setLoadingUser] = useState(true);
  const [loadingProfile, setLoadingProfile] = useState(false);
  const navigate = useNavigate();

  // --- Profile Fetching Function ---
  const fetchProfile = useCallback(async () => {
    // This local 'user' check is fine because fetchProfile is re-memoized when 'user' state changes
    if (!user) { 
      setProfile(null);
      return;
    }
    
    setLoadingProfile(true);
    try {
      const existingProfile = await getProfile();
      if (existingProfile) {
        setProfile(existingProfile);
      } else {
        // If no profile, create one
        const newProfile = await ensureProfileExists(user);
        setProfile(newProfile);
      }
    } catch (error) {
      console.error("Failed to fetch or create profile:", error);
      setProfile(null);
    } finally {
      setLoadingProfile(false);
    }
  }, [user]); // Dependency on 'user' state is correct

  // --- Auth State Change Listener ---
  useEffect(() => {
    setLoadingUser(true);
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        const currentUser = session?.user ?? null;
        setUser(currentUser); // Set user state
        setLoadingUser(false);
        
        // Handle profile logic based on the *new* user state
        if (_event === 'SIGNED_IN' && currentUser) {
          setLoadingProfile(true);
          try {
            // We can call getProfile() as it reads auth from supabase, not stale state
            const existingProfile = await getProfile(); 
            if (!existingProfile) {
              const newProfile = await ensureProfileExists(currentUser);
              setProfile(newProfile);
            } else {
              setProfile(existingProfile);
            }
          } catch (err) {
            console.error("Failed to create profile on sign-in:", err);
            setProfile(null);
          } finally {
            setLoadingProfile(false);
          }
        } else if (!currentUser) {
          // User signed out
          setProfile(null);
        }
      }
    );
    return () => subscription.unsubscribe();
  }, []); // Empty dep array is correct for setting up the listener

  // --- Effect to fetch profile on initial load if session exists ---
  useEffect(() => {
    // If auth is loaded, and we have a user, but no profile yet
    if (!loadingUser && user && !profile && !loadingProfile) {
      fetchProfile();
    }
  }, [user, profile, loadingUser, loadingProfile, fetchProfile]);

  // --- Logout Function ---
  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
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
    refreshProfile: fetchProfile, // Expose the refresh function
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