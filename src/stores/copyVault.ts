import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface CopyVaultStore {
  favorites: string[]; // template IDs
  toggleFavorite: (id: string) => void;
  isFavorite: (id: string) => boolean;
}

export const useCopyVaultStore = create<CopyVaultStore>()(
  persist(
    (set, get) => ({
      favorites: [],

      toggleFavorite: (id) =>
        set((state) => ({
          favorites: state.favorites.includes(id)
            ? state.favorites.filter((f) => f !== id)
            : [...state.favorites, id],
        })),

      isFavorite: (id) => get().favorites.includes(id),
    }),
    { name: 'solopreneur-copy-vault' }
  )
);
