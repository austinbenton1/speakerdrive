import React, { useCallback, useState, useEffect } from 'react';
import { Camera, X, Upload, Image as ImageIcon, AlertCircle, CheckCircle2 } from 'lucide-react';
import { uploadAvatar } from '../utils/avatar';
import { supabase } from '../lib/supabase';
import { useAvatarStore, useUploadStatusStore } from '../lib/store';

interface PhotoUploaderProps {
  avatarUrl: string | null;
  onPhotoChange: (url: string | null) => void;
  disabled?: boolean;
}

export default function PhotoUploader({ avatarUrl, onPhotoChange, disabled = false }: PhotoUploaderProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const setGlobalAvatarUrl = useAvatarStore((state) => state.setAvatarUrl);
  const setUploadStatus = useUploadStatusStore((state) => state.setStatus);
  const [success, setSuccess] = useState(false);
  const [transitionState, setTransitionState] = useState<'idle' | 'uploading' | 'success'>('idle');
  const [showPlaceholder, setShowPlaceholder] = useState(!avatarUrl);

  // Reset transition state after success
  useEffect(() => {
    if (transitionState === 'success') {
      const timer = setTimeout(() => {
        setTransitionState('idle');
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [transitionState]);

  const handleUpload = async (file: File) => {
    try {
      setIsUploading(true);
      setError(null);
      setSuccess(false);
      setTransitionState('uploading');
      setShowPlaceholder(false);
      setUploadStatus({ isUploading: true, message: 'Uploading profile photo...' });

      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user?.id) throw new Error('No authenticated user');

      // Upload the file and get public URL
      const publicUrl = await uploadAvatar(file, user.id, avatarUrl);
      setGlobalAvatarUrl(publicUrl);

      // Update parent first
      onPhotoChange(publicUrl);
      
      // Show success message and refresh image
      setTransitionState('success');
      setSuccess(true);
      setUploadStatus({ isUploading: false });
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccess(false);
      }, 3000);

    } catch (err) {
      console.error('Error uploading photo:', err);
      setError('Failed to upload photo. Please try again.');
      setUploadStatus({ 
        isUploading: false, 
        error: 'Failed to upload photo. Please try again.' 
      });
      setTransitionState('idle');
      setShowPlaceholder(true);
    } finally {
      setIsUploading(false);
    }
  };

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      handleUpload(file);
    }
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
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
      setShowPlaceholder(true);
      setShowPlaceholder(true);
      setError(null);

      // Get current user and profile for webhook
      const { data: { user } } = await supabase.auth.getUser();
      if (!user?.id) throw new Error('No authenticated user');

      const { data: currentProfile } = await supabase
        .from('profiles')
        .select('display_name, avatar_url')
        .eq('id', user.id)
        .single();

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
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: null })
        .eq('id', user.id);

      if (updateError) throw updateError;

      // Update parent first
      onPhotoChange(null);
      setGlobalAvatarUrl(null);
      refreshImage();

      const webhookPayload = {
        user: {
          id: user.id,
          display_name: currentProfile?.display_name || null
        },
        changes: {
          avatar_url: null
        }
      };

      // Fire and forget webhook
      fetch('https://n8n.speakerdrive.com/webhook/supa-profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(webhookPayload)
      }).catch(err => {
        console.error('Webhook error:', err);
      });
    } catch (err) {
      console.error('Error removing photo:', err);
      setError('Failed to remove photo. Please try again.');
      setShowPlaceholder(false);
      setShowPlaceholder(false);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="relative">
      {/* Success Message */}
      {/* Success Message */}
      {success && (
        <div className="absolute -top-16 left-0 right-0 bg-emerald-50 border border-emerald-200 rounded-lg p-3 mb-4 animate-fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
            <p className="text-sm text-emerald-700">
              Profile updated successfully! Refresh the page to see new image.
            </p>
          </div>
        </div>
      )}

      {/* Photo Preview Section */}
      <div className={`
        relative group aspect-square rounded-xl overflow-hidden shadow-sm
        ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
      `}>
        <div className="relative w-full h-full">
          {!showPlaceholder && avatarUrl ? (
            <img
              src={avatarUrl}
              alt="Profile"
              className="w-full h-full object-cover border border-gray-200/75"
              loading="eager"
              crossOrigin="anonymous"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.onerror = null;
                target.src = 'https://www.gravatar.com/avatar/default?d=mp&s=200';
                setShowPlaceholder(true);
              }}
            />
          ) : (
            <div className="w-full h-full bg-gray-50 flex items-center justify-center border-2 border-gray-200/50 border-dashed">
              <Camera className="w-8 h-8 text-gray-400/75" />
            </div>
          )}
          {transitionState !== 'idle' && (
            <div className="absolute inset-0 bg-gray-50 flex items-center justify-center border border-gray-200/75 rounded-xl">
              <div className="text-center">
                {transitionState === 'success' ? (
                  <div className="bg-emerald-50 p-4 rounded-lg border border-emerald-100">
                    <div className="w-8 h-8 mx-auto mb-2 text-emerald-500">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                    <p className="text-sm font-medium text-emerald-700">Profile Updated!</p>
                  </div>
                ) : (
                  <>
                    <Camera className="w-8 h-8 text-gray-400/75 mx-auto mb-2" />
                    <p className="text-sm text-gray-500">
                      {isUploading ? 'Uploading...' : 'Processing...'}
                    </p>
                  </>
                )}
              </div>
            </div>
          )}
          {avatarUrl && !isUploading && (
            <button
              onClick={handleRemove}
              disabled={isUploading || disabled}
              className="absolute top-2 right-2 w-6 h-6 rounded-full bg-white/90 backdrop-blur-[2px] shadow-sm flex items-center justify-center hover:bg-white group/remove transition-all"
            >
              <X className="w-3.5 h-3.5 text-gray-400 group-hover/remove:text-gray-600" />
            </button>
          )}
        </div>
        <div
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
          className={`
            absolute inset-0 rounded-lg transition-all duration-200 flex flex-col items-center justify-center cursor-pointer
            backdrop-blur-[1px]
            ${isDragging 
              ? 'opacity-100 bg-blue-500/20 ring-4 ring-blue-500/50' 
              : 'opacity-0 group-hover:opacity-100 bg-black/50'
            }
            ${disabled ? 'cursor-not-allowed' : ''}
          `}
        >
          <label className={`cursor-pointer text-white text-xs font-medium text-center p-2 ${disabled ? 'cursor-not-allowed' : ''}`}>
            <input
              type="file"
              accept="image/*"
              onChange={handleChange}
              disabled={isUploading || disabled}
              className="hidden"
            />
            <div className="flex flex-col items-center gap-2">
              {isUploading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Uploading...</span>
                </>
              ) : isDragging ? (
                <>
                  <Upload className="w-5 h-5 animate-bounce" />
                  <span>Drop to Upload</span>
                </>
              ) : (
                <>
                  <ImageIcon className="w-5 h-5" />
                  <span>Change Photo</span>
                </>
              )}
            </div>
          </label>
        </div>
      </div>
      {error && (
        <p className="mt-2 text-xs text-red-500 flex items-center gap-1">
          <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
          {error}
        </p>
      )}
    </div>
  );
}