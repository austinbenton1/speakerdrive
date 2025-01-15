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

interface ProfileState {
  profile: {
    display_name: string | null;
    services: string[];
    industries: string[];
    offering: string | null;
  } | null;
  updateProfile: (data: {
    display_name?: string | null;
    services?: string[];
    industries?: string[];
    offering?: string | null;
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

export const useProfileStore = create<ProfileState>((set) => ({
  profile: null,
  updateProfile: (data) => set((state) => ({
    profile: state.profile ? { ...state.profile, ...data } : null
  })),
}));