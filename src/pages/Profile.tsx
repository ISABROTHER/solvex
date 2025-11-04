// src/pages/Profile.tsx
import React from 'react';
import useSWR from 'swr';
import { getAuthedUserProfile, getMyTasks } from '../lib/supabase/operations';
import { useAuth } from '../features/auth/AuthProvider';
import { Loader2, AlertCircle } from 'lucide-react';
import EmployeeProfileCard from '../components/profile/EmployeeProfileCard';
import AvatarUploader from '../components/profile/AvatarUploader';
import MyTasks from '../components/profile/MyTasks';
import Card from './admin/DashboardPage/components/Card'; // Re-using Admin Card

const ProfilePage: React.FC = () => {
  const { user } = useAuth();
  
  // Fetch profile data
  const { 
    data: profile, 
    error: profileError, 
    isLoading: loadingProfile,
    mutate: mutateProfile // We'll use this to refresh after avatar upload
  } = useSWR(user ? 'userProfile' : null, getAuthedUserProfile);
  
  // Fetch task data
  const { 
    data: tasksData, 
    error: tasksError, 
    isLoading: loadingTasks,
    mutate: mutateTasks // To refresh tasks
  } = useSWR(user ? 'myTasks' : null, getMyTasks);

  const isLoading = loadingProfile || loadingTasks;
  const error = profileError || tasksError;

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-[#FF5722]" />
      </div>
    );
  }

  if (error || !profile?.data) {
    return (
      <Card title="Error">
        <div className="flex flex-col items-center justify-center py-10 text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
          <h3 className="text-xl font-semibold text-gray-800">Could not load profile</h3>
          <p className="text-gray-600 mt-2">{error?.message || "An unknown error occurred."}</p>
        </div>
      </Card>
    );
  }

  const tasks = tasksData?.data || [];

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-8 space-y-8">
      <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column (Avatar + Main Card) */}
        <div className="lg:col-span-1 space-y-8">
          <Card>
            <div className="flex flex-col items-center p-4">
              <AvatarUploader
                currentAvatarUrl={profile.data.avatar_url}
                onUploadSuccess={() => {
                  // Re-fetch the profile data to show new image
                  mutateProfile(); 
                }}
              />
              <h2 className="mt-4 text-2xl font-semibold text-gray-900 text-center">
                {profile.data.full_name}
              </h2>
              <p className="text-gray-600">{profile.data.position || 'Employee'}</p>
              <p className="text-sm text-gray-500 mt-1">
                Employee #: {profile.data.employee_number || 'N/A'}
              </p>
            </div>
          </Card>
        </div>
        
        {/* Right Column (Details + Tasks) */}
        <div className="lg:col-span-2 space-y-8">
          <EmployeeProfileCard profile={profile.data} />
          
          <MyTasks tasks={tasks} onUpdate={mutateTasks} />
        </div>
        
      </div>
    </div>
  );
};

export default ProfilePage;