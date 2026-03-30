import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { UserProfile } from '@/types';

const defaultUser: UserProfile = {
  id: 'gusten-sun',
  name: 'Gusten Sun',
  email: 'gusten@gustensun.com',
  initials: 'GS',
  avatarUrl: undefined,
  anthropicApiKey: '',
};

interface UserStore {
  user: UserProfile;
  isAuthenticated: boolean;
  hasCompletedOnboarding: boolean;

  updateProfile: (updates: Partial<UserProfile>) => void;
  setAvatarUrl: (url: string) => void;
  setApiKey: (key: string) => void;
  completeOnboarding: () => void;
}

export const useUserStore = create<UserStore>()(
  persist(
    (set) => ({
      user: defaultUser,
      isAuthenticated: true,
      hasCompletedOnboarding: false,

      updateProfile: (updates) => {
        set((state) => ({ user: { ...state.user, ...updates } }));
      },

      setAvatarUrl: (url) => {
        set((state) => ({ user: { ...state.user, avatarUrl: url } }));
      },

      setApiKey: (key) => {
        set((state) => ({ user: { ...state.user, anthropicApiKey: key } }));
      },

      completeOnboarding: () => {
        set({ hasCompletedOnboarding: true });
      },
    }),
    { name: 'solopreneur-user' }
  )
);
