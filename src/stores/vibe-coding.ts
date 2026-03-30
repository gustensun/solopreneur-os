import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { generateId } from '@/lib/utils';
import type { VibeCodingProject } from '@/types';

const now = new Date().toISOString();

const sampleProjects: VibeCodingProject[] = [
  {
    id: generateId(),
    name: 'AI Newsletter Curator',
    description: 'Automated newsletter that curates the best AI content each week',
    techStack: 'Next.js, OpenAI API, Resend',
    phase: 'building',
    notes: 'Need to add the email template and scheduling logic.',
    createdAt: now,
    updatedAt: now,
  },
  {
    id: generateId(),
    name: 'Course Platform MVP',
    description: 'Lightweight course delivery platform for solopreneurs',
    techStack: 'React, Supabase, Stripe',
    phase: 'planning',
    notes: 'Wireframes done. Starting DB schema next.',
    createdAt: now,
    updatedAt: now,
  },
  {
    id: generateId(),
    name: 'Client Portal',
    description: 'White-label client portal with file sharing and progress tracking',
    techStack: 'Next.js, Prisma, Vercel',
    phase: 'launched',
    notes: '3 paying clients using it. Looking to add Zapier integration.',
    createdAt: now,
    updatedAt: now,
  },
];

interface VibeCodingStore {
  projects: VibeCodingProject[];
  addProject: (project: Omit<VibeCodingProject, 'id' | 'createdAt' | 'updatedAt'>) => string;
  updateProject: (id: string, updates: Partial<VibeCodingProject>) => void;
  deleteProject: (id: string) => void;
  moveProject: (id: string, phase: VibeCodingProject['phase']) => void;
}

export const useVibeCodingStore = create<VibeCodingStore>()(
  persist(
    (set) => ({
      projects: sampleProjects,

      addProject: (project) => {
        const id = generateId();
        const now = new Date().toISOString();
        const newProject: VibeCodingProject = { ...project, id, createdAt: now, updatedAt: now };
        set((state) => ({ projects: [...state.projects, newProject] }));
        return id;
      },

      updateProject: (id, updates) => {
        const now = new Date().toISOString();
        set((state) => ({
          projects: state.projects.map((p) =>
            p.id === id ? { ...p, ...updates, updatedAt: now } : p
          ),
        }));
      },

      deleteProject: (id) =>
        set((state) => ({ projects: state.projects.filter((p) => p.id !== id) })),

      moveProject: (id, phase) => {
        const now = new Date().toISOString();
        set((state) => ({
          projects: state.projects.map((p) =>
            p.id === id ? { ...p, phase, updatedAt: now } : p
          ),
        }));
      },
    }),
    { name: 'solopreneur-vibe-coding' }
  )
);
