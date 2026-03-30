import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { generateId } from '@/lib/utils';
import type { AcademyModule, AcademyLesson } from '@/types';

const now = new Date().toISOString();

const mod1Id = generateId();
const mod2Id = generateId();
const mod3Id = generateId();

const sampleModules: AcademyModule[] = [
  {
    id: mod1Id,
    title: 'Module 1: Foundations of the AI Business',
    description: 'Understand the solopreneur model, niche selection, and how to leverage AI as your unfair advantage',
    order: 0,
    createdAt: now,
    updatedAt: now,
    lessons: [
      {
        id: generateId(),
        moduleId: mod1Id,
        title: '1.1 The Solopreneur Flywheel',
        content: 'Overview of how a modern solopreneur business works — from content to community to clients.',
        order: 0,
        completed: true,
        createdAt: now,
        updatedAt: now,
      },
      {
        id: generateId(),
        moduleId: mod1Id,
        title: '1.2 Choosing Your Niche with AI',
        content: 'Use the AI-powered niche framework to identify a profitable, passion-aligned market.',
        order: 1,
        completed: true,
        createdAt: now,
        updatedAt: now,
      },
      {
        id: generateId(),
        moduleId: mod1Id,
        title: '1.3 Building Your AI Toolkit',
        content: 'Essential AI tools for solopreneurs: Claude, Midjourney, ElevenLabs, and more.',
        order: 2,
        completed: false,
        createdAt: now,
        updatedAt: now,
      },
    ],
  },
  {
    id: mod2Id,
    title: 'Module 2: Crafting Your Irresistible Offer',
    description: 'Design a high-ticket offer that sells itself using the AI Offer Architect framework',
    order: 1,
    createdAt: now,
    updatedAt: now,
    lessons: [
      {
        id: generateId(),
        moduleId: mod2Id,
        title: '2.1 The Offer Value Equation',
        content: 'Understanding perceived value vs. actual value, and how to close the gap.',
        order: 0,
        completed: false,
        createdAt: now,
        updatedAt: now,
      },
      {
        id: generateId(),
        moduleId: mod2Id,
        title: '2.2 Designing Your Offer Stack',
        content: 'Stack bonuses strategically to eliminate every objection before the sales call.',
        order: 1,
        completed: false,
        createdAt: now,
        updatedAt: now,
      },
      {
        id: generateId(),
        moduleId: mod2Id,
        title: '2.3 Pricing Psychology & Strategy',
        content: 'How to set prices that position you as premium without losing leads.',
        order: 2,
        completed: false,
        createdAt: now,
        updatedAt: now,
      },
    ],
  },
  {
    id: mod3Id,
    title: 'Module 3: Content That Converts',
    description: 'Create a high-output content system using AI that builds authority and drives inbound leads',
    order: 2,
    createdAt: now,
    updatedAt: now,
    lessons: [
      {
        id: generateId(),
        moduleId: mod3Id,
        title: '3.1 The 5 Content Pillars Framework',
        content: 'Structure your content around 5 pillars that build trust, authority, and desire.',
        order: 0,
        completed: false,
        createdAt: now,
        updatedAt: now,
      },
      {
        id: generateId(),
        moduleId: mod3Id,
        title: '3.2 AI Content Batching System',
        content: 'Create 30 days of content in one 4-hour session using AI.',
        order: 1,
        completed: false,
        createdAt: now,
        updatedAt: now,
      },
    ],
  },
];

interface AcademyStore {
  modules: AcademyModule[];

  addModule: (module: Omit<AcademyModule, 'id' | 'createdAt' | 'updatedAt' | 'lessons'>) => string;
  updateModule: (id: string, updates: Partial<Omit<AcademyModule, 'lessons'>>) => void;
  deleteModule: (id: string) => void;
  addLesson: (moduleId: string, lesson: Omit<AcademyLesson, 'id' | 'createdAt' | 'updatedAt'>) => string;
  updateLesson: (moduleId: string, lessonId: string, updates: Partial<AcademyLesson>) => void;
  deleteLesson: (moduleId: string, lessonId: string) => void;
  toggleLessonComplete: (moduleId: string, lessonId: string) => void;
  getCompletionRate: () => number;
}

export const useAcademyStore = create<AcademyStore>()(
  persist(
    (set, get) => ({
      modules: sampleModules,

      addModule: (module) => {
        const id = generateId();
        const now = new Date().toISOString();
        const newModule: AcademyModule = { ...module, id, lessons: [], createdAt: now, updatedAt: now };
        set((state) => ({ modules: [...state.modules, newModule] }));
        return id;
      },

      updateModule: (id, updates) => {
        const now = new Date().toISOString();
        set((state) => ({
          modules: state.modules.map((m) =>
            m.id === id ? { ...m, ...updates, updatedAt: now } : m
          ),
        }));
      },

      deleteModule: (id) =>
        set((state) => ({ modules: state.modules.filter((m) => m.id !== id) })),

      addLesson: (moduleId, lesson) => {
        const id = generateId();
        const now = new Date().toISOString();
        const newLesson: AcademyLesson = { ...lesson, id, createdAt: now, updatedAt: now };
        set((state) => ({
          modules: state.modules.map((m) =>
            m.id === moduleId
              ? { ...m, lessons: [...m.lessons, newLesson], updatedAt: now }
              : m
          ),
        }));
        return id;
      },

      updateLesson: (moduleId, lessonId, updates) => {
        const now = new Date().toISOString();
        set((state) => ({
          modules: state.modules.map((m) =>
            m.id === moduleId
              ? {
                  ...m,
                  lessons: m.lessons.map((l) =>
                    l.id === lessonId ? { ...l, ...updates, updatedAt: now } : l
                  ),
                  updatedAt: now,
                }
              : m
          ),
        }));
      },

      deleteLesson: (moduleId, lessonId) => {
        const now = new Date().toISOString();
        set((state) => ({
          modules: state.modules.map((m) =>
            m.id === moduleId
              ? {
                  ...m,
                  lessons: m.lessons.filter((l) => l.id !== lessonId),
                  updatedAt: now,
                }
              : m
          ),
        }));
      },

      toggleLessonComplete: (moduleId, lessonId) => {
        const now = new Date().toISOString();
        set((state) => ({
          modules: state.modules.map((m) =>
            m.id === moduleId
              ? {
                  ...m,
                  lessons: m.lessons.map((l) =>
                    l.id === lessonId ? { ...l, completed: !l.completed, updatedAt: now } : l
                  ),
                }
              : m
          ),
        }));
      },

      getCompletionRate: () => {
        const state = get();
        const allLessons = state.modules.flatMap((m) => m.lessons);
        if (allLessons.length === 0) return 0;
        const completed = allLessons.filter((l) => l.completed).length;
        return Math.round((completed / allLessons.length) * 100);
      },
    }),
    { name: 'solopreneur-academy' }
  )
);
