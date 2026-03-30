import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { generateId } from '@/lib/utils';

export interface GeneratedImage {
  id: string;
  url: string;
  prompt: string;
  platform: string;
  style: string;
  createdAt: string;
}

interface ImageStudioStore {
  images: GeneratedImage[];
  addImage: (img: Omit<GeneratedImage, 'id' | 'createdAt'>) => void;
  deleteImage: (id: string) => void;
}

export const useImageStudioStore = create<ImageStudioStore>()(
  persist(
    (set) => ({
      images: [],

      addImage: (img) => {
        const newImage: GeneratedImage = {
          ...img,
          id: generateId(),
          createdAt: new Date().toISOString(),
        };
        set((state) => ({ images: [newImage, ...state.images] }));
      },

      deleteImage: (id) => {
        set((state) => ({ images: state.images.filter((img) => img.id !== id) }));
      },
    }),
    { name: 'solopreneur-image-studio' }
  )
);
