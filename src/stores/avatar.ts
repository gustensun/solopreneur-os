import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { generateId } from '@/lib/utils';
import type { CustomerAvatar } from '@/types';

const now = new Date().toISOString();

const sampleAvatars: CustomerAvatar[] = [
  {
    id: generateId(),
    name: 'Alex the Ambitious Creator',
    age: '28-35',
    gender: 'Male/Female (skews 60% male)',
    occupation: 'Content creator, freelancer, or corporate employee with a side hustle',
    income: '$50k-$80k/year (wants to reach $150k+)',
    goals: 'Build a profitable online business that replaces their 9-5 income. Create leverage through digital products and AI. Have freedom to work from anywhere and own their schedule.',
    frustrations: 'Posting content for months with no results. Trying multiple courses but none gave clear step-by-step guidance. Overwhelmed by too many options and conflicting advice online.',
    fears: 'Wasting money on another program that doesn\'t work. Being judged by peers for "trying to make money online." Running out of time while working a full-time job.',
    desires: 'To wake up to Stripe notifications. To quit their job with confidence. To have a business that feels authentic and leverages their existing knowledge.',
    dailyLife: 'Spends 2-3 hours after work on their business. Watches YouTube creators and takes mental notes. Scrolls Twitter/X learning from founders. Listens to business podcasts on commute.',
    platforms: 'YouTube, Twitter/X, LinkedIn, Instagram, TikTok',
    objections: 'Is this different from the 5 courses I\'ve bought? I don\'t have time. I\'m not an expert in anything. What if I fail publicly?',
    createdAt: now,
    updatedAt: now,
  },
];

interface AvatarStore {
  avatars: CustomerAvatar[];

  addAvatar: (avatar: Omit<CustomerAvatar, 'id' | 'createdAt' | 'updatedAt'>) => string;
  updateAvatar: (id: string, updates: Partial<CustomerAvatar>) => void;
  deleteAvatar: (id: string) => void;
  getDefaultAvatar: () => CustomerAvatar | undefined;
}

export const useAvatarStore = create<AvatarStore>()(
  persist(
    (set, get) => ({
      avatars: sampleAvatars,

      addAvatar: (avatar) => {
        const id = generateId();
        const now = new Date().toISOString();
        const newAvatar: CustomerAvatar = { ...avatar, id, createdAt: now, updatedAt: now };
        set((state) => ({ avatars: [...state.avatars, newAvatar] }));
        return id;
      },

      updateAvatar: (id, updates) => {
        const now = new Date().toISOString();
        set((state) => ({
          avatars: state.avatars.map((a) =>
            a.id === id ? { ...a, ...updates, updatedAt: now } : a
          ),
        }));
      },

      deleteAvatar: (id) =>
        set((state) => ({ avatars: state.avatars.filter((a) => a.id !== id) })),

      getDefaultAvatar: () => get().avatars[0],
    }),
    { name: 'solopreneur-avatars' }
  )
);
