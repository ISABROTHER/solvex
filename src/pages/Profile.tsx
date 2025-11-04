// src/pages/Profile.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { getMyTasks } from '../lib/supabase/operations';
import { useAuth } from '../features/auth/AuthProvider';
import { Loader2, AlertCircle } from 'lucide-react';
import EmployeeProfileCard from '../components/profile/EmployeeProfileCard';
import AvatarUploader from '../components/profile/AvatarUploader';
import MyTasks from '../components/profile/MyTasks';
import Card from './admin/DashboardPage/components/Card'; // Re-using Admin Card
import type { Task } from '../lib/supabase/operations';

const ProfilePage: React.FC = () => {
  const { user, profile, loading: loadingAuth, refreshProfile } = useAuth();
  
  // --- STATE FOR TASKS ---
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loadingTasks, setLoadingTasks] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // --- DATA FETCHING ---
  const fetchTasks = useCallback(async () => {
    if (!user) return;
    
    setLoadingTasks(true);
    setError(null);
    try {
      const { data, error: tasksError } = await getMyTasks();
      if (tasksError) throw tasksError;
      setTasks(data || []);
    } catch (err: any) {
      console.error("Error fetching tasks:", err);
      setError(err.message || "Could not load tasks.");
    } finally {
      setLoadingTasks(false);
    }
  }, [user]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  // --- RENDER ---
  const isLoading = loadingAuth || loadingTasks;

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-[#FF5722]" />
      </div>
    );
  }

  if (error || !profile) {
    return (
      <Card title="Error">
        <div className="flex flex-col items-center justify-center py-10 text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
          <h3 className="text-xl font-semibold text-gray-800">Could not load profile</h3>
          <p className="text-gray-600 mt-2">{error || "User profile not found."}</p>
        </div>
      </Card>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-8 space-y-8">
      <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column (Avatar + Main Card) */}
        <div className="lg:col-span-1 space-y-8">
          <Card>
            <div className="flex flex-col items-center p-4">
              <AvatarUploader
                currentAvatarUrl={profile.avatar_url}
                onUploadSuccess={() => {
                  // Re-fetch the profile data to show new image
                  refreshProfile(); 
                }}
              />
              <h2 className="mt-4 text-2xl font-semibold text-gray-900 text-center">
                {profile.full_name}
              </h2>
              <p className="text-gray-600">{profile.position || 'Employee'}</p>
              <p className="text-sm text-gray-500 mt-1">
                Employee #: {profile.employee_number || 'N/A'}
              </p>
            </div>
          </Card>
        </div>
        
        {/* Right Column (Details + Tasks) */}
        <div className="lg:col-span-2 space-y-8">
          <EmployeeProfileCard profile={profile} />
          
          <MyTasks tasks={tasks} onUpdate={fetchTasks} />
        </div>
        
      </div>
    </div>
  );
};

export default ProfilePage;