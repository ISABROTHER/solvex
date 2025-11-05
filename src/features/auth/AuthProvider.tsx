// src/features/auth/AuthProvider.tsx
// @ts-nocheck
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '../../lib/supabase/client';
import { Database } from '../../lib/supabase/database.types';
// --- 1. IMPORT NEW FUNCTIONS ---
import { getEmployeeDashboardData, getFullAssignmentDetails } from '../../lib/supabase/operations'; 
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
      // Use the new single, efficient function
      const { profile, assignments, documents } = await getEmployeeDashboardData(currentUser.id);
      
      // We set profile here again to be safe
      setProfile(profile); 
      setAssignments(assignments || []);
      setDocuments(documents || []);
    } catch (error: any) {
      console.error("Error fetching employee dashboard data:", error);
      // Don't log the user out, just log the error
    }
  };
  
  // --- 5. UPGRADE THE MAIN USEEFFECT (CRASH FIX) ---
  useEffect(() => {
    setLoading(true);
    
    // Clear employee specific state on initial load
    setAssignments([]);
    setDocuments([]);
    setProfile(null); // Clear profile state as a safe measure

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        setSession(session);
        const currentUser = session?.user ?? null;
        setUser(currentUser);
        
        // Reset state on auth change
        setProfile(null);
        setAssignments([]);
        setDocuments([]);

        if (currentUser) {
          try {
            // Fetch profile for everyone
            const { data: profileData, error } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', currentUser.id)
              .single();
              
            if (error) throw error;
            
            setProfile(profileData);

            // --- CRITICAL FIX: If employee, fetch all dashboard data concurrently ---
            if (profileData && profileData.role === 'employee') {
                await fetchEmployeeData(currentUser);
            }
            
          } catch (error: any) {
            console.error("Error fetching profile on auth change:", error);
            setProfile(null); 
          } finally {
            setLoading(false);
          }
        } else {
          // User is logged out
          setLoading(false);
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // --- 6. ADD REALTIME LISTENERS ---
  useEffect(() => {
    if (!user || profile?.role !== 'employee') {
      return; 
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

  }, [user, profile]); 

  const logout = async () => {
    await supabase.auth.signOut();
  };
  
  // --- 7. ADD REFETCH FUNCTION ---
  const refetchEmployeeData = () => {
    if (user) {
      setLoading(true); 
      fetchEmployeeData(user).finally(() => setLoading(false));
    }
  };

  // --- 8. PROVIDE THE NEW STATE ---
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