// src/components/profile/AvatarUploader.tsx
import React, { useState } from 'react';
import { supabase } from '../../lib/supabase/client';
import { useAuth } from '../../features/auth/AuthProvider';
import { Upload, Loader2, AlertCircle, User as UserIcon } from 'lucide-react';
import { useToast } from '../../contexts/ToastContext';

interface AvatarUploaderProps {
  currentAvatarUrl: string | null | undefined;
  onUploadSuccess: (newUrl: string) => void;
}

const AvatarUploader: React.FC<AvatarUploaderProps> = ({ currentAvatarUrl, onUploadSuccess }) => {
  const { user } = useAuth();
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { addToast } = useToast();

  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files || event.target.files.length === 0) {
      return;
    }
    if (!user) {
      setError('You must be logged in to upload an avatar.');
      return;
    }

    const file = event.target.files[0];
    const fileExt = file.name.split('.').pop();
    const filePath = `${user.id}-${Date.now()}.${fileExt}`;

    setIsUploading(true);
    setError(null);

    try {
      // 1. Upload file to Storage
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true, // Overwrite existing file with same name
        });

      if (uploadError) throw uploadError;

      // 2. Get Public URL
      const { data: urlData } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);
      
      if (!urlData) throw new Error('Could not get public URL.');
      
      const newAvatarUrl = urlData.publicUrl;

      // 3. Update 'profiles' table
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: newAvatarUrl })
        .eq('id', user.id);

      if (updateError) throw updateError;

      // 4. Notify parent component
      onUploadSuccess(newAvatarUrl);
      addToast({ type: 'success', title: 'Avatar Updated!' });

    } catch (err: any) {
      console.error('Avatar upload error:', err);
      const errMsg = err.message || 'An unknown error occurred.';
      setError(errMsg);
      addToast({ type: 'error', title: 'Upload Failed', message: errMsg });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="relative w-36 h-36">
      {currentAvatarUrl ? (
        <img
          src={currentAvatarUrl}
          alt="Profile"
          className="w-36 h-36 rounded-full object-cover border-4 border-gray-100"
        />
      ) : (
        <div className="w-36 h-36 rounded-full bg-gray-200 flex items-center justify-center border-4 border-gray-100">
          <UserIcon className="w-16 h-16 text-gray-400" />
        </div>
      )}
      
      <label
        htmlFor="avatar-upload"
        className="absolute -bottom-2 -right-2 w-12 h-12 bg-[#FF5722] rounded-full flex items-center justify-center text-white cursor-pointer shadow-lg hover:bg-[#E64A19] transition-all"
      >
        {isUploading ? (
          <Loader2 className="w-6 h-6 animate-spin" />
        ) : (
          <Upload className="w-6 h-6" />
        )}
        <input
          id="avatar-upload"
          type="file"
          accept="image/png, image/jpeg"
          onChange={handleUpload}
          disabled={isUploading}
          className="hidden"
        />
      </label>
    </div>
  );
};

export default AvatarUploader;