import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { generateId } from '@/lib/utils';
import type { BrainResource, BrainProfile, BrainCategory } from '@/types';

const DEFAULT_PROFILE_ID = 'default-gusten-sun';

const defaultProfile: BrainProfile = {
  id: DEFAULT_PROFILE_ID,
  name: 'Gusten Sun',
  initials: 'GS',
  description: 'Personal brand and business knowledge base for Gusten Sun',
  isDefault: true,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

const sampleResources: BrainResource[] = [
  {
    id: generateId(),
    name: 'Brand Story & Origin',
    type: 'text',
    category: 'personal-brand',
    profileId: DEFAULT_PROFILE_ID,
    status: 'processed',
    content:
      'Gusten Sun is a solopreneur coach and educator helping creators build 6-figure online businesses through AI-powered strategies, personal branding, and high-ticket offers.',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: generateId(),
    name: 'AI Inner Circle Sales Page',
    type: 'text',
    category: 'products-offers',
    profileId: DEFAULT_PROFILE_ID,
    status: 'processed',
    content:
      'The AI Inner Circle is a monthly membership for solopreneurs who want to leverage AI tools to grow their business faster. Members get weekly live calls, templates, and a private community.',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: generateId(),
    name: 'Content Marketing Strategy 2024',
    type: 'text',
    category: 'marketing-content',
    profileId: DEFAULT_PROFILE_ID,
    status: 'processed',
    content:
      'Focus on YouTube as the primary distribution channel. Publish 2 videos per week: one educational deep-dive and one case study. Repurpose for Instagram Reels, LinkedIn, and email newsletter.',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: generateId(),
    name: 'Student Testimonials Collection',
    type: 'text',
    category: 'social-proof',
    profileId: DEFAULT_PROFILE_ID,
    status: 'processed',
    content:
      'Over 500 students have gone through AI Academy. Top results include: $20k/month consulting business in 90 days, $50k launch from cold audience, quit 9-5 within 6 months of joining.',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: generateId(),
    name: 'Recommended Tools & Resources',
    type: 'url',
    category: 'resources',
    profileId: DEFAULT_PROFILE_ID,
    status: 'processed',
    url: 'https://gustensun.com/resources',
    content: 'Tools: Claude AI, Framer, ConvertKit, Loom, Notion, Stripe, ThriveCart',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

interface BrainStore {
  resources: BrainResource[];
  profiles: BrainProfile[];
  activeProfileId: string;

  addResource: (resource: Omit<BrainResource, 'id' | 'createdAt' | 'updatedAt'>) => string;
  deleteResource: (id: string) => void;
  updateResource: (id: string, updates: Partial<BrainResource>) => void;
  moveCategory: (id: string, category: BrainCategory) => void;
  addProfile: (profile: Omit<BrainProfile, 'id' | 'createdAt' | 'updatedAt'>) => string;
  deleteProfile: (id: string) => void;
  updateProfile: (id: string, updates: Partial<BrainProfile>) => void;
  setActiveProfile: (id: string) => void;
  getResourcesByCategory: (category: BrainCategory) => BrainResource[];
  getResourcesByProfile: (profileId: string) => BrainResource[];
}

export const useBrainStore = create<BrainStore>()(
  persist(
    (set, get) => ({
      resources: sampleResources,
      profiles: [defaultProfile],
      activeProfileId: DEFAULT_PROFILE_ID,

      addResource: (resource) => {
        const id = generateId();
        const now = new Date().toISOString();
        const newResource: BrainResource = { ...resource, id, createdAt: now, updatedAt: now };
        set((state) => ({ resources: [...state.resources, newResource] }));
        return id;
      },

      deleteResource: (id) =>
        set((state) => ({ resources: state.resources.filter((r) => r.id !== id) })),

      updateResource: (id, updates) => {
        const now = new Date().toISOString();
        set((state) => ({
          resources: state.resources.map((r) =>
            r.id === id ? { ...r, ...updates, updatedAt: now } : r
          ),
        }));
      },

      moveCategory: (id, category) => {
        const now = new Date().toISOString();
        set((state) => ({
          resources: state.resources.map((r) =>
            r.id === id ? { ...r, category, updatedAt: now } : r
          ),
        }));
      },

      addProfile: (profile) => {
        const id = generateId();
        const now = new Date().toISOString();
        const newProfile: BrainProfile = { ...profile, id, createdAt: now, updatedAt: now };
        set((state) => ({ profiles: [...state.profiles, newProfile] }));
        return id;
      },

      deleteProfile: (id) => {
        set((state) => ({
          profiles: state.profiles.filter((p) => p.id !== id),
          activeProfileId:
            state.activeProfileId === id
              ? state.profiles.find((p) => p.id !== id)?.id ?? DEFAULT_PROFILE_ID
              : state.activeProfileId,
        }));
      },

      updateProfile: (id, updates) => {
        const now = new Date().toISOString();
        set((state) => ({
          profiles: state.profiles.map((p) =>
            p.id === id ? { ...p, ...updates, updatedAt: now } : p
          ),
        }));
      },

      setActiveProfile: (id) => set({ activeProfileId: id }),

      getResourcesByCategory: (category) => {
        return get().resources.filter((r) => r.category === category);
      },

      getResourcesByProfile: (profileId) => {
        return get().resources.filter((r) => r.profileId === profileId);
      },
    }),
    { name: 'solopreneur-brain' }
  )
);
