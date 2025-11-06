import React, { useState, useEffect, ChangeEvent } from 'react';
import { useAuth } from '../../features/auth/AuthProvider';
import { supabase } from '../../lib/supabase/client';
import { useToast } from '../../contexts/ToastContext';
import { User, Mail, Phone, Loader2, UploadCloud, Edit3, Check } from 'lucide-react';

const ProfilePage: React.FC = () => {
  const { user, profile, refreshUserProfile } = useAuth();
  const { addToast } = useToast();

  // Form state
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');

  // Loading states
  const [isUpdating, setIsUpdating] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  // Avatar state
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);

  // Pre-fill form and avatar from profile
  useEffect(() => {
    if (profile) {
      setFirstName(profile.first_name || '');
      setLastName(profile.last_name || '');
      setPhone(profile.phone || '');
      setAvatarUrl(profile.avatar_url ? getPublicAvatarUrl(profile.avatar_url) : null);
    }
  }, [profile]);

  // Helper to construct public URL for an avatar
  const getPublicAvatarUrl = (path: string): string => {
    const { data } = supabase.storage.from('avatars').getPublicUrl(path);
    return data.publicUrl;
  };

  // Handle text form submission
  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setIsUpdating(true);
    const updates = {
      id: user.id,
      first_name: firstName,
      last_name: lastName,
      phone: phone,
      updated_at: new Date().toISOString(),
    };

    try {
      const { error }_ = await supabase.from('profiles').upsert(updates);
      if (error) throw error;

      await refreshUserProfile(); // Refresh auth context
      addToast({ type: 'success', title: 'Profile Updated', message: 'Your information has been saved.' });
    } catch (err: any) {
      addToast({ type: 'error', title: 'Update Failed', message: err.message });
    } finally {
      setIsUpdating(false);
    }
  };

  // Handle file selection for avatar
  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const newUrl = URL.createObjectURL(file); // Create local preview
      setAvatarFile(file);
      setAvatarUrl(newUrl);
    }
  };

  // Handle avatar upload and profile update
  const handleAvatarUpload = async () => {
    if (!avatarFile || !user) return;

    setIsUploading(true);
    const fileExt = avatarFile.name.split('.').pop();
    const filePath = `${user.id}/${Math.random()}.${fileExt}`;

    try {
      // 1. Upload the file to storage
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, avatarFile, {
          cacheControl: '3600',
          upsert: true, // Overwrite existing file for this user
        });

      if (uploadError) throw uploadError;

      // 2. Update the 'avatar_url' in the profiles table
      const { error: updateError }_ = await supabase
        .from('profiles')
        .update({ avatar_url: filePath })
        .eq('id', user.id);

      if (updateError) throw updateError;

      // 3. Refresh the auth context to show new avatar in header
      await refreshUserProfile();
      
      // 4. Update local state with the *new* public URL, not the local one
      setAvatarUrl(getPublicAvatarUrl(filePath));
      setAvatarFile(null); // Clear the file
      addToast({ type: 'success', title: 'Avatar Updated', message: 'Your new photo is saved.' });
    } catch (err: any) {
      addToast({ type: 'error', title: 'Upload Failed', message: err.message });
      // Revert to old avatar if upload fails
      setAvatarUrl(profile?.avatar_url ? getPublicAvatarUrl(profile.avatar_url) : null);
    } finally {
      setIsUploading(false);
    }
  };

  // Helper to get initials
  const getInitials = (firstName?: string, lastName?: string) => {
    const first = firstName?.[0] || '';
    const last = lastName?.[0] || '';
    return `${first}${last}`.toUpperCase();
  };

  return (
    <div className="max-w-4xl mx-auto">
      <header className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
        <p className="text-lg text-gray-600 mt-1">Manage your personal information and profile photo.</p>
      </header>

      {/* Profile Card */}
      <div className="bg-white shadow-sm rounded-lg overflow-hidden">
        {/* Card Header */}
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800">Profile Information</h2>
        </div>

        {/* Card Body */}
        <div className="p-6 md:grid md:grid-cols-3 md:gap-8">
          {/* Left: Avatar Section */}
          <div className="md:col-span-1 flex flex-col items-center mb-6 md:mb-0">
            <div className="relative h-32 w-32 rounded-full mb-4">
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt="Profile Avatar"
                  className="h-full w-full rounded-full object-cover"
                />
              ) : (
                <div className="h-full w-full rounded-full bg-gray-200 flex items-center justify-center text-gray-500 text-4xl font-medium">
                  {getInitials(profile?.first_name, profile?.last_name)}
                </div>
              )}
              {/* Upload Spinner Overlay */}
              {isUploading && (
                <div className="absolute inset-0 bg-white/70 rounded-full flex items-center justify-center">
                  <Loader2 className="h-8 w-8 animate-spin text-[#FF5722]" />
                </div>
              )}
            </div>

            <input
              type="file"
              id="avatar-upload"
              className="hidden"
              accept="image/png, image/jpeg, image/gif"
              onChange={handleFileChange}
              disabled={isUploading}
            />

            {/* Show "Save Photo" button only if a new file is staged */}
            {avatarFile ? (
              <button
                onClick={handleAvatarUpload}
                disabled={isUploading}
                className="w-full inline-flex justify-center items-center gap-2 px-4 py-2 bg-green-600 text-white text-sm font-semibold rounded-md shadow-sm hover:bg-green-700 disabled:opacity-50"
              >
                <Check className="h-4 w-4" />
                Save Photo
              </button>
            ) : (
              <label
                htmlFor="avatar-upload"
                className={`w-full inline-flex justify-center items-center gap-2 px-4 py-2 bg-gray-700 text-white text-sm font-semibold rounded-md shadow-sm ${
                  isUploading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-800 cursor-pointer'
                }`}
              >
                {isUploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <UploadCloud className="h-4 w-4" />}
                Change Photo
              </label>
            )}
            <p className="text-xs text-gray-500 mt-2">Max 5MB (PNG, JPG, GIF)</p>
          </div>

          {/* Right: Form Section */}
          <div className="md:col-span-2">
            <form onSubmit={handleUpdateProfile} className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {/* First Name */}
                <div>
                  <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">
                    First Name
                  </label>
                  <div className="relative">
                    <User className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      id="firstName"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      className="pl-10 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#FF5722] focus:ring-[#FF5722] sm:text-sm"
                      placeholder="John"
                    />
                  </div>
                </div>

                {/* Last Name */}
                <div>
                  <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">
                    Last Name
                  </label>
                  <div className="relative">
                    <User className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      id="lastName"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      className="pl-10 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#FF5722] focus:ring-[#FF5722] sm:text-sm"
                      placeholder="Doe"
                    />
                  </div>
                </div>
              </div>

              {/* Email (Read-only) */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    id="email"
                    value={profile?.email || ''}
                    readOnly
                    className="pl-10 block w-full rounded-md border-gray-300 shadow-sm bg-gray-100 cursor-not-allowed sm:text-sm"
                  />
                </div>
              </div>

              {/* Phone */}
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number
                </label>
                <div className="relative">
                  <Phone className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="tel"
                    id="phone"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="pl-10 block w-full rounded-md border-gray-300 shadow-sm focus:border-[#FF5722] focus:ring-[#FF5722] sm:text-sm"
                    placeholder="+1 (555) 123-4567"
                  />
                </div>
              </div>

              {/* Save Button */}
              <div className="text-right pt-2">
                <button
                  type="submit"
                  disabled={isUpdating || isUploading}
                  className="inline-flex justify-center items-center gap-2 px-6 py-2.5 bg-[#FF5722] text-white font-semibold rounded-md shadow-sm hover:bg-[#E64A19] disabled:opacity-50"
                >
                  {isUpdating ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <Edit3 className="h-5 w-5" />
                  )}
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;