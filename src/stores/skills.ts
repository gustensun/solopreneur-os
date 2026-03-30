import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { generateId } from '@/lib/utils';
import type { Skill, SkillType } from '@/types';

const now = new Date().toISOString();

const defaultSkills: Skill[] = [
  {
    id: generateId(),
    title: 'Brand Voice Expert',
    description: 'Craft compelling brand messaging that resonates with your target audience',
    type: 'brand-voice',
    content:
      'You are a brand voice specialist. Your tone is confident, clear, and empathetic. You use storytelling to connect with your audience, lead with transformation not features, and always speak to the aspirations of your ideal client. You write in a conversational yet authoritative style, using short punchy sentences mixed with thoughtful elaborations.',
    version: 1,
    isStale: false,
    createdAt: now,
    updatedAt: now,
  },
  {
    id: generateId(),
    title: 'Offer Architect',
    description: 'Design irresistible high-ticket offers with compelling value stacks',
    type: 'offer-architect',
    content:
      'You are an offer design expert. You help solopreneurs create high-ticket offers worth 10x their price. Focus on the transformation, not the delivery mechanism. Stack bonuses that remove every objection. Frame the price as an investment with clear ROI. Use the "new vehicle" mechanism to position the offer as a novel solution to an old problem.',
    version: 1,
    isStale: false,
    createdAt: now,
    updatedAt: now,
  },
  {
    id: generateId(),
    title: 'Niche Expert',
    description: 'Find and dominate profitable niches in the online education space',
    type: 'niche-expert',
    content:
      'You are a niche research and positioning expert. You analyze markets for underserved segments, identify unique angles of attack, and help solopreneurs claim territory in their niche. The best niches are specific, have a desperate audience, and align with the solopreneur\'s unique experience and skills.',
    version: 1,
    isStale: false,
    createdAt: now,
    updatedAt: now,
  },
  {
    id: generateId(),
    title: 'Avatar Specialist',
    description: 'Build deep psychological profiles of your ideal customer',
    type: 'avatar-specialist',
    content:
      'You are a customer psychology expert. You dig beneath surface demographics to uncover the deep emotional drivers, core fears, and burning desires of your ideal client. You understand that people buy on emotion and justify with logic. You help craft avatar profiles so vivid the client feels you are reading their mind.',
    version: 1,
    isStale: false,
    createdAt: now,
    updatedAt: now,
  },
  {
    id: generateId(),
    title: 'Content Strategist',
    description: 'Create content systems that attract and convert your ideal clients',
    type: 'content-strategist',
    content:
      'You are a content marketing strategist specializing in solopreneur businesses. You design content ecosystems around 3-5 core pillars, create content calendars that balance education, inspiration, and conversion, and help build compounding content assets. You understand the algorithm and how to create content that gets shared and drives inbound leads.',
    version: 1,
    isStale: false,
    createdAt: now,
    updatedAt: now,
  },
];

interface SkillsStore {
  skills: Skill[];

  addSkill: (skill: Omit<Skill, 'id' | 'createdAt' | 'updatedAt'>) => string;
  updateSkill: (id: string, updates: Partial<Skill>) => void;
  deleteSkill: (id: string) => void;
  regenerateSkill: (id: string) => void;
  getSkillByType: (type: SkillType) => Skill | undefined;
}

export const useSkillsStore = create<SkillsStore>()(
  persist(
    (set, get) => ({
      skills: defaultSkills,

      addSkill: (skill) => {
        const id = generateId();
        const now = new Date().toISOString();
        const newSkill: Skill = { ...skill, id, createdAt: now, updatedAt: now };
        set((state) => ({ skills: [...state.skills, newSkill] }));
        return id;
      },

      updateSkill: (id, updates) => {
        const now = new Date().toISOString();
        set((state) => ({
          skills: state.skills.map((s) =>
            s.id === id ? { ...s, ...updates, updatedAt: now } : s
          ),
        }));
      },

      deleteSkill: (id) =>
        set((state) => ({ skills: state.skills.filter((s) => s.id !== id) })),

      regenerateSkill: (id) => {
        const now = new Date().toISOString();
        set((state) => ({
          skills: state.skills.map((s) =>
            s.id === id
              ? { ...s, isStale: false, version: s.version + 1, updatedAt: now }
              : s
          ),
        }));
      },

      getSkillByType: (type) => {
        return get().skills.find((s) => s.type === type);
      },
    }),
    { name: 'solopreneur-skills' }
  )
);
