import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { generateId } from '@/lib/utils';
import type { ContentPillar, ContentIdea } from '@/types';

const now = new Date().toISOString();

const pillar1Id = generateId();
const pillar2Id = generateId();
const pillar3Id = generateId();
const pillar4Id = generateId();
const pillar5Id = generateId();

const samplePillars: ContentPillar[] = [
  {
    id: pillar1Id,
    title: 'AI Tools & Workflows',
    description: 'Practical tutorials and demonstrations of AI tools for solopreneurs',
    color: '#8B5CF6',
    topics: ['Claude tutorials', 'AI writing workflows', 'Automation with AI', 'AI tools reviews', 'Prompt engineering basics'],
    createdAt: now,
    updatedAt: now,
  },
  {
    id: pillar2Id,
    title: 'Solopreneur Mindset',
    description: 'Beliefs, habits, and mental frameworks for building a solo business',
    color: '#10B981',
    topics: ['Overcoming imposter syndrome', 'Building confidence', 'Productivity systems', 'Deep work habits', 'Entrepreneurship lessons'],
    createdAt: now,
    updatedAt: now,
  },
  {
    id: pillar3Id,
    title: 'Offer & Sales',
    description: 'How to create, price, and sell high-ticket offers as a solopreneur',
    color: '#F59E0B',
    topics: ['High-ticket offer creation', 'Sales call frameworks', 'Objection handling', 'Pricing strategies', 'Proposal writing'],
    createdAt: now,
    updatedAt: now,
  },
  {
    id: pillar4Id,
    title: 'Content Marketing',
    description: 'Strategies for building an audience and converting followers to clients',
    color: '#EC4899',
    topics: ['YouTube strategy', 'Email list building', 'Instagram growth', 'Content repurposing', 'Viral hooks and hooks'],
    createdAt: now,
    updatedAt: now,
  },
  {
    id: pillar5Id,
    title: 'Income & Business',
    description: 'Real talk about revenue, business models, and financial freedom',
    color: '#3B82F6',
    topics: ['Income stream diversification', 'Revenue milestones', 'Business model comparison', 'Passive income reality', 'Financial independence'],
    createdAt: now,
    updatedAt: now,
  },
];

const sampleIdeas: ContentIdea[] = [
  {
    id: generateId(),
    title: 'How I Use Claude to Write 30 Days of Content in 4 Hours',
    pillarId: pillar1Id,
    status: 'drafting',
    platform: 'YouTube',
    notes: 'Show the actual workflow step by step. Include the prompts I use. Aim for 15-20 min video. High potential for views.',
    createdAt: now,
    updatedAt: now,
  },
  {
    id: generateId(),
    title: '5 AI Tools Every Solopreneur Needs in 2025',
    pillarId: pillar1Id,
    status: 'idea',
    platform: 'YouTube',
    notes: 'Claude, Framer, ElevenLabs, Midjourney, ConvertKit. Focus on ROI for each tool.',
    createdAt: now,
    updatedAt: now,
  },
  {
    id: generateId(),
    title: 'Why I Raised My Prices 5x (And Converted Better)',
    pillarId: pillar3Id,
    status: 'idea',
    platform: 'LinkedIn',
    notes: 'Vulnerable story post. Include the actual numbers. Counter-intuitive lesson about premium pricing.',
    createdAt: now,
    updatedAt: now,
  },
  {
    id: generateId(),
    title: 'The $85k/Month Business Model Breakdown',
    pillarId: pillar5Id,
    status: 'published',
    platform: 'YouTube',
    notes: 'Published March 10. 48k views. Best performing video this quarter. Consider follow-up video on Q2 goals.',
    createdAt: now,
    updatedAt: now,
  },
  {
    id: generateId(),
    title: 'My Morning Routine as a Solopreneur',
    pillarId: pillar2Id,
    status: 'review',
    platform: 'Instagram',
    notes: 'B-roll already recorded. Need to write caption and add subtitles. Schedule for next Tuesday.',
    createdAt: now,
    updatedAt: now,
  },
];

interface ContentStore {
  pillars: ContentPillar[];
  ideas: ContentIdea[];

  addPillar: (pillar: Omit<ContentPillar, 'id' | 'createdAt' | 'updatedAt'>) => string;
  updatePillar: (id: string, updates: Partial<ContentPillar>) => void;
  deletePillar: (id: string) => void;
  addIdea: (idea: Omit<ContentIdea, 'id' | 'createdAt' | 'updatedAt'>) => string;
  updateIdea: (id: string, updates: Partial<ContentIdea>) => void;
  deleteIdea: (id: string) => void;
  getIdeasByPillar: (pillarId: string) => ContentIdea[];
  getIdeasByStatus: (status: ContentIdea['status']) => ContentIdea[];
}

export const useContentStore = create<ContentStore>()(
  persist(
    (set, get) => ({
      pillars: samplePillars,
      ideas: sampleIdeas,

      addPillar: (pillar) => {
        const id = generateId();
        const now = new Date().toISOString();
        const newPillar: ContentPillar = { ...pillar, id, createdAt: now, updatedAt: now };
        set((state) => ({ pillars: [...state.pillars, newPillar] }));
        return id;
      },

      updatePillar: (id, updates) => {
        const now = new Date().toISOString();
        set((state) => ({
          pillars: state.pillars.map((p) =>
            p.id === id ? { ...p, ...updates, updatedAt: now } : p
          ),
        }));
      },

      deletePillar: (id) =>
        set((state) => ({ pillars: state.pillars.filter((p) => p.id !== id) })),

      addIdea: (idea) => {
        const id = generateId();
        const now = new Date().toISOString();
        const newIdea: ContentIdea = { ...idea, id, createdAt: now, updatedAt: now };
        set((state) => ({ ideas: [...state.ideas, newIdea] }));
        return id;
      },

      updateIdea: (id, updates) => {
        const now = new Date().toISOString();
        set((state) => ({
          ideas: state.ideas.map((i) =>
            i.id === id ? { ...i, ...updates, updatedAt: now } : i
          ),
        }));
      },

      deleteIdea: (id) =>
        set((state) => ({ ideas: state.ideas.filter((i) => i.id !== id) })),

      getIdeasByPillar: (pillarId) => {
        return get().ideas.filter((i) => i.pillarId === pillarId);
      },

      getIdeasByStatus: (status) => {
        return get().ideas.filter((i) => i.status === status);
      },
    }),
    { name: 'solopreneur-content' }
  )
);
