import React, { useCallback } from 'react';
import { Camera, X } from 'lucide-react';
import { uploadAvatar } from '../utils/avatar';
import { supabase } from '../lib/supabase';
import { useAvatarStore } from '../lib/store';

interface PhotoUploaderProps {
  avatarUrl: string | null;
  onPhotoChange: (url: string | null) => void;
}

export default function PhotoUploader({ avatarUrl, onPhotoChange }: PhotoUploaderProps) {
  const [isUploading, setIsUploading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const setGlobalAvatarUrl = useAvatarStore((state) => state.setAvatarUrl);

  const handleUpload = async (file: File) => {
    try {
      setIsUploading(true);
      setError(null);

      // Upload the file and get public URL, passing current avatarUrl for deletion
      const publicUrl = await uploadAvatar(file, avatarUrl);

      // Update profiles table
      const { data: { user } } = await supabase.auth.getUser();
      if (!user?.id) throw new Error('No authenticated user');

      const { error: profileError } = await supabase
        .from('profiles')
        .update({ avatar_url: publicUrl })
        .eq('id', user.id);

      if (profileError) throw profileError;

      onPhotoChange(publicUrl);
      setGlobalAvatarUrl(publicUrl);
    } catch (err) {
      console.error('Error uploading photo:', err);
      setError('Failed to upload photo. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      handleUpload(file);
    }
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleUpload(file);
    }
  };

  const handleRemove = async () => {
    try {
      setIsUploading(true);
      setError(null);

      if (avatarUrl) {
        // Delete the old avatar from storage
        const fileName = avatarUrl.split('/').pop();
        if (fileName) {
          await supabase.storage
            .from('avatars')
            .remove([fileName]);
        }
      }

      // Update profiles table
      const { data: { user } } = await supabase.auth.getUser();
      if (!user?.id) throw new Error('No authenticated user');

      const { error: profileError } = await supabase
        .from('profiles')
        .update({ avatar_url: null })
        .eq('id', user.id);

      if (profileError) throw profileError;

      onPhotoChange(null);
      setGlobalAvatarUrl(null);
    } catch (err) {
      console.error('Error removing photo:', err);
      setError('Failed to remove photo. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="flex items-center gap-8">
      <div className="relative group">
        <div className="relative w-24 h-24">
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt="Profile"
              className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-lg"
            />
          ) : (
            <div className="w-24 h-24 rounded-full bg-gray-100 flex items-center justify-center border-4 border-white shadow-lg">
              <Camera className="w-8 h-8 text-gray-400" />
            </div>
          )}
          {avatarUrl && (
            <button
              onClick={handleRemove}
              disabled={isUploading}
              className="absolute -top-2 -right-2 w-6 h-6 bg-red-100 rounded-full flex items-center justify-center hover:bg-red-200 transition-colors disabled:opacity-50"
            >
              <X className="w-4 h-4 text-red-600" />
            </button>
          )}
        </div>
        <div
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
          className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity bg-black bg-opacity-50 flex items-center justify-center cursor-pointer"
        >
          <label className="cursor-pointer text-white text-xs font-medium text-center p-2">
            <input
              type="file"
              accept="image/*"
              onChange={handleChange}
              disabled={isUploading}
              className="hidden"
            />
            {isUploading ? 'Uploading...' : 'Change\nPhoto'}
          </label>
        </div>
      </div>

      <div className="flex-1">
        <h3 className="text-lg font-semibold text-gray-900 mb-1">Profile Photo</h3>
        <p className="text-sm text-gray-500 mb-3">
          Add a professional photo to help event organizers recognize you
        </p>
        {error && (
          <p className="text-sm text-red-600 mb-3">{error}</p>
        )}
        <div className="flex gap-2 text-sm">
          <label className="btn-secondary cursor-pointer">
            <input
              type="file"
              accept="image/*"
              onChange={handleChange}
              disabled={isUploading}
              className="hidden"
            />
            Upload new photo
          </label>
          {avatarUrl && (
            <button
              onClick={handleRemove}
              disabled={isUploading}
              className="text-red-600 hover:text-red-700 disabled:opacity-50"
            >
              Remove
            </button>
          )}
        </div>
      </div>
    </div>
  );
}