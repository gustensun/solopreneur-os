import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { generateId } from '@/lib/utils';
import type { ProgramPhase, ProgramLesson } from '@/types';

const now = new Date().toISOString();

const phase1Id = generateId();
const phase2Id = generateId();
const phase3Id = generateId();

const samplePhases: ProgramPhase[] = [
  {
    id: phase1Id,
    title: 'Phase 1: Clarity & Foundation (Week 1-2)',
    description: 'Define your niche, avatar, and core offer. Build the foundation that everything else rests on.',
    order: 0,
    createdAt: now,
    updatedAt: now,
    lessons: [
      {
        id: generateId(),
        phaseId: phase1Id,
        title: 'Niche Discovery Workshop',
        content: 'Use the AI Niche Finder to identify your most profitable and fulfilling market.',
        order: 0,
        type: 'worksheet',
        createdAt: now,
        updatedAt: now,
      },
      {
        id: generateId(),
        phaseId: phase1Id,
        title: 'Avatar Deep Dive',
        content: 'Build a 360-degree customer avatar using AI-assisted research and interviews.',
        order: 1,
        type: 'worksheet',
        createdAt: now,
        updatedAt: now,
      },
      {
        id: generateId(),
        phaseId: phase1Id,
        title: 'Offer Architecture Session',
        content: 'Design your signature offer using the Value Equation Framework.',
        order: 2,
        type: 'video',
        createdAt: now,
        updatedAt: now,
      },
    ],
  },
  {
    id: phase2Id,
    title: 'Phase 2: Build & Launch (Week 3-6)',
    description: 'Create your content system, sales assets, and launch your offer to your warm audience.',
    order: 1,
    createdAt: now,
    updatedAt: now,
    lessons: [
      {
        id: generateId(),
        phaseId: phase2Id,
        title: 'Content Pillar Creation',
        content: 'Define your 5 content pillars and create your first 30 days of content with AI.',
        order: 0,
        type: 'video',
        createdAt: now,
        updatedAt: now,
      },
      {
        id: generateId(),
        phaseId: phase2Id,
        title: 'Sales Page Masterclass',
        content: 'Write a converting sales page using the AI Sales Page Blueprint.',
        order: 1,
        type: 'text',
        createdAt: now,
        updatedAt: now,
      },
      {
        id: generateId(),
        phaseId: phase2Id,
        title: 'Beta Launch Strategy',
        content: 'Launch to your warm audience at a beta price to validate and collect testimonials.',
        order: 2,
        type: 'video',
        createdAt: now,
        updatedAt: now,
      },
    ],
  },
  {
    id: phase3Id,
    title: 'Phase 3: Scale & Systemize (Week 7-12)',
    description: 'Automate your marketing, systematize delivery, and scale to $10k months.',
    order: 2,
    createdAt: now,
    updatedAt: now,
    lessons: [
      {
        id: generateId(),
        phaseId: phase3Id,
        title: 'Email Funnel Automation',
        content: 'Build a 7-day email sequence that converts subscribers to buyers on autopilot.',
        order: 0,
        type: 'video',
        createdAt: now,
        updatedAt: now,
      },
      {
        id: generateId(),
        phaseId: phase3Id,
        title: 'Client Delivery System',
        content: 'Systemize onboarding, delivery, and offboarding for a premium client experience.',
        order: 1,
        type: 'worksheet',
        createdAt: now,
        updatedAt: now,
      },
      {
        id: generateId(),
        phaseId: phase3Id,
        title: 'Referral & Retention Engine',
        content: 'Build systems that keep clients longer and generate referrals automatically.',
        order: 2,
        type: 'text',
        createdAt: now,
        updatedAt: now,
      },
    ],
  },
];

interface ProgramStore {
  phases: ProgramPhase[];

  addPhase: (phase: Omit<ProgramPhase, 'id' | 'createdAt' | 'updatedAt' | 'lessons'>) => string;
  updatePhase: (id: string, updates: Partial<Omit<ProgramPhase, 'lessons'>>) => void;
  deletePhase: (id: string) => void;
  addLesson: (phaseId: string, lesson: Omit<ProgramLesson, 'id' | 'createdAt' | 'updatedAt'>) => string;
  updateLesson: (phaseId: string, lessonId: string, updates: Partial<ProgramLesson>) => void;
  deleteLesson: (phaseId: string, lessonId: string) => void;
  reorderPhases: (phases: ProgramPhase[]) => void;
}

export const useProgramStore = create<ProgramStore>()(
  persist(
    (set) => ({
      phases: samplePhases,

      addPhase: (phase) => {
        const id = generateId();
        const now = new Date().toISOString();
        const newPhase: ProgramPhase = { ...phase, id, lessons: [], createdAt: now, updatedAt: now };
        set((state) => ({ phases: [...state.phases, newPhase] }));
        return id;
      },

      updatePhase: (id, updates) => {
        const now = new Date().toISOString();
        set((state) => ({
          phases: state.phases.map((p) =>
            p.id === id ? { ...p, ...updates, updatedAt: now } : p
          ),
        }));
      },

      deletePhase: (id) =>
        set((state) => ({ phases: state.phases.filter((p) => p.id !== id) })),

      addLesson: (phaseId, lesson) => {
        const id = generateId();
        const now = new Date().toISOString();
        const newLesson: ProgramLesson = { ...lesson, id, createdAt: now, updatedAt: now };
        set((state) => ({
          phases: state.phases.map((p) =>
            p.id === phaseId
              ? { ...p, lessons: [...p.lessons, newLesson], updatedAt: now }
              : p
          ),
        }));
        return id;
      },

      updateLesson: (phaseId, lessonId, updates) => {
        const now = new Date().toISOString();
        set((state) => ({
          phases: state.phases.map((p) =>
            p.id === phaseId
              ? {
                  ...p,
                  lessons: p.lessons.map((l) =>
                    l.id === lessonId ? { ...l, ...updates, updatedAt: now } : l
                  ),
                  updatedAt: now,
                }
              : p
          ),
        }));
      },

      deleteLesson: (phaseId, lessonId) => {
        const now = new Date().toISOString();
        set((state) => ({
          phases: state.phases.map((p) =>
            p.id === phaseId
              ? {
                  ...p,
                  lessons: p.lessons.filter((l) => l.id !== lessonId),
                  updatedAt: now,
                }
              : p
          ),
        }));
      },

      reorderPhases: (phases) => set({ phases }),
    }),
    { name: 'solopreneur-program' }
  )
);
