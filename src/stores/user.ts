import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { UserProfile } from '@/types';

const defaultUser: UserProfile = {
  id: 'gusten-sun',
  name: 'Gusten Sun',
  email: 'gusten@gustensun.com',
  initials: 'GS',
  avatarUrl: undefined,
};

interface UserStore {
  user: UserProfile;
  isAuthenticated: boolean;

  updateProfile: (updates: Partial<UserProfile>) => void;
  setAvatarUrl: (url: string) => void;
}

export const useUserStore = create<UserStore>()(
  persist(
    (set) => ({
      user: defaultUser,
      isAuthenticated: true,

      updateProfile: (updates) => {
        set((state) => ({ user: { ...state.user, ...updates } }));
      },

      setAvatarUrl: (url) => {
        set((state) => ({ user: { ...state.user, avatarUrl: url } }));
      },
    }),
    { name: 'solopreneur-user' }
  )
);
