import { create } from 'zustand';
import { User } from '@supabase/supabase-js';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  setUser: (user: User | null) => void;
}

interface AvatarState {
  avatarUrl: string | null;
  setAvatarUrl: (url: string | null) => void;
}

interface UploadStatus {
  isUploading: boolean;
  message?: string;
  error?: string;
}

interface UploadStatusState {
  status: UploadStatus;
  setStatus: (status: UploadStatus) => void;
}

interface UploadStatus {
  isUploading: boolean;
  message?: string;
  error?: string;
}

interface UploadStatusState {
  status: UploadStatus;
  setStatus: (status: UploadStatus) => void;
}

interface ProfileState {
  profile: {
    display_name: string | null;
    services: string;
    offering: string | null;
    website: string | null;
  } | null;
  updateProfile: (data: {
    display_name?: string | null;
    services?: string;
    offering?: string | null;
    website?: string | null;
  }) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  setUser: (user) => set({ 
    user, 
    isAuthenticated: !!user 
  }),
}));

export const useAvatarStore = create<AvatarState>((set) => ({
  avatarUrl: null,
  setAvatarUrl: (url) => set({ avatarUrl: url }),
}));

export const useUploadStatusStore = create<UploadStatusState>((set) => ({
  status: { isUploading: false },
  setStatus: (status) => set({ status }),
}));

export const useProfileStore = create<ProfileState>((set) => ({
  profile: null,
  updateProfile: (data) => set((state) => {
    if (!state.profile) return { profile: null };
    
    // Only update the profile if the data is actually changing
    const updatedProfile = {
      ...state.profile,
      display_name: data.display_name ?? state.profile.display_name,
      services: data.services ?? state.profile.services,
      offering: data.offering ?? state.profile.offering,
      website: data.website ?? state.profile.website
    };

    // Only update state if something actually changed
    if (JSON.stringify(updatedProfile) !== JSON.stringify(state.profile)) {
      return { profile: updatedProfile };
    }
    return state;
  }),
}));