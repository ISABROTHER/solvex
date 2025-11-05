// @ts-nocheck
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '../../lib/supabase/client';
import { Database } from '../../lib/supabase/database.types';
// --- 1. IMPORT NEW FUNCTIONS ---
import { getEmployeeDashboardData, getFullAssignmentDetails } from '../../lib/supabase/operations'; // <-- Added getFullAssignmentDetails
import type { EmployeeDocument } from '../../lib/supabase/operations';

export type Profile = Database['public']['Tables']['profiles']['Row'];

// --- 2. UPDATE THE CONTEXT TYPE ---
interface AuthContextType {
  session: Session | null;
  user: User | null;
  profile: Profile | null;
  assignments: any[]; // <-- ADDED
  documents: EmployeeDocument[]; // <-- ADDED
  loading: boolean;
  logout: () => Promise<void>;
  refetchEmployeeData: () => void; // <-- ADDED
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  // --- 3. ADD NEW GLOBAL STATE ---
  const [assignments, setAssignments] = useState<any[]>([]);
  const [documents, setDocuments] = useState<EmployeeDocument[]>([]);

  // --- 4. CREATE A REUSABLE FETCH FUNCTION ---
  const fetchEmployeeData = async (currentUser: User) => {
    try {
      const { profile, assignments, documents } = await getEmployeeDashboardData(currentUser.id);
      // We set profile here again to be safe
      setProfile(profile); 
      setAssignments(assignments || []);
      setDocuments(documents || []);
    } catch (error: any) {
      console.error("Error fetching employee dashboard data:", error);
      // Don't lock the user out, just log the error
      // We'll keep their profile null/empty
    }
  };
  
  // --- 5. UPGRADE THE MAIN USEEFFECT ---
  useEffect(() => {
    setLoading(true);

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        setSession(session);
        const currentUser = session?.user ?? null;
        setUser(currentUser);

        if (currentUser) {
          try {
            // Fetch profile for everyone
            const { data: profileData, error } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', currentUser.id)
              .single();
              
            if (error) throw error;
            
            // Set profile *before* checking its role
            setProfile(profileData);
            
            // --- THIS IS THE FIX ---
            // We must check if profileData EXISTS before checking profileData.role
            if (profileData && profileData.role === 'employee') {
              // Now it's safe to fetch employee data
              await fetchEmployeeData(currentUser);
            }
            // --- END FIX ---
            
          } catch (error: any) {
            console.error("Error fetching profile/data on auth change:", error);
            // If this fails, set profile to null
            setProfile(null); 
          } finally {
            setLoading(false);
          }
        } else {
          // User is logged out
          setProfile(null);
          setAssignments([]);
          setDocuments([]);
          setLoading(false);
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);
  
  // --- 6. ADD REALTIME LISTENERS (THE PROFESSIONAL WAY) ---
  useEffect(() => {
    if (!user || profile?.role !== 'employee') {
      return; // Only run for logged-in employees
    }
    
    const refetchAll = () => fetchEmployeeData(user);
    const refetchAssignment = async (assignmentId: string) => {
      try {
        const { data, error } = await getFullAssignmentDetails(assignmentId);
        if (error) throw error;
        setAssignments(prev => prev.map(a => a.id === assignmentId ? data : a));
      } catch (err) {
        console.error("Failed to refresh assignment", err);
      }
    };

    const channel = supabase
      .channel(`employee_dashboard_realtime:${user.id}`)
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'assignment_members', filter: `employee_id=eq.${user.id}` },
        refetchAll
      )
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'assignment_messages' },
        (payload) => {
          if (payload.new.assignment_id) {
             refetchAssignment(payload.new.assignment_id);
          }
        }
      )
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'employee_documents', filter: `profile_id=eq.${user.id}` },
         refetchAll
      )
      .subscribe();
      
    return () => {
      supabase.removeChannel(channel);
    };

  }, [user, profile]); // Re-subscribe if the user or profile changes

  const logout = async () => {
    await supabase.auth.signOut();
    // The onAuthStateChange listener will handle clearing state
  };
  
  const refetchEmployeeData = () => {
    if (user) {
      setLoading(true); // Show loading spinner on manual refresh
      fetchEmployeeData(user).finally(() => setLoading(false));
    }
  };

  // --- 7. PROVIDE THE NEW STATE ---
  const value: AuthContextType = {
    session,
    user,
    profile,
    assignments,
    documents,
    loading,
    logout,
    refetchEmployeeData,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};