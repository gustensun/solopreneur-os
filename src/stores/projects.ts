import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { generateId } from '@/lib/utils';
import type { Project, ProjectStatus } from '@/types';

const now = new Date().toISOString();
const futureDate = (days: number) => {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().split('T')[0];
};

const sampleProjects: Project[] = [
  {
    id: generateId(),
    title: 'Launch AI Academy 2.0',
    description: 'Redesign and relaunch the AI Academy with updated curriculum and new pricing structure',
    status: 'in-progress',
    priority: 'urgent',
    dueDate: futureDate(14),
    tags: ['launch', 'academy', 'revenue'],
    createdAt: now,
    updatedAt: now,
  },
  {
    id: generateId(),
    title: 'Record YouTube Series: AI for Solopreneurs',
    description: '10-part YouTube series covering AI tools, workflows, and strategies for online business owners',
    status: 'in-progress',
    priority: 'high',
    dueDate: futureDate(30),
    tags: ['content', 'youtube', 'ai'],
    createdAt: now,
    updatedAt: now,
  },
  {
    id: generateId(),
    title: 'Write Sales Page for AI Inner Circle',
    description: 'Complete rewrite of the AI Inner Circle sales page with new case studies and social proof',
    status: 'todo',
    priority: 'high',
    dueDate: futureDate(7),
    tags: ['copywriting', 'sales', 'membership'],
    createdAt: now,
    updatedAt: now,
  },
  {
    id: generateId(),
    title: 'Set Up Email Automation Sequences',
    description: 'Build out 7-day welcome sequence and 30-day nurture sequence for new subscribers',
    status: 'todo',
    priority: 'medium',
    dueDate: futureDate(21),
    tags: ['email', 'automation', 'marketing'],
    createdAt: now,
    updatedAt: now,
  },
  {
    id: generateId(),
    title: 'Affiliate Partner Outreach Campaign',
    description: 'Identify and reach out to 20 potential affiliate partners in the creator economy space',
    status: 'backlog',
    priority: 'medium',
    tags: ['affiliates', 'partnerships'],
    createdAt: now,
    updatedAt: now,
  },
  {
    id: generateId(),
    title: 'Client Onboarding System Revamp',
    description: 'Streamline the client onboarding process with automated contracts, payments, and welcome portal',
    status: 'backlog',
    priority: 'low',
    tags: ['systems', 'clients', 'automation'],
    createdAt: now,
    updatedAt: now,
  },
  {
    id: generateId(),
    title: 'Q1 Strategy Review & Planning',
    description: 'Review Q1 metrics, document learnings, and plan Q2 roadmap and revenue targets',
    status: 'review',
    priority: 'high',
    dueDate: futureDate(3),
    tags: ['strategy', 'planning'],
    createdAt: now,
    updatedAt: now,
  },
  {
    id: generateId(),
    title: 'Brand Identity Refresh',
    description: 'Updated logo, color palette, and visual identity across all platforms',
    status: 'done',
    priority: 'medium',
    tags: ['branding', 'design'],
    createdAt: now,
    updatedAt: now,
  },
];

interface ProjectsStore {
  projects: Project[];

  addProject: (project: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>) => string;
  updateProject: (id: string, updates: Partial<Project>) => void;
  deleteProject: (id: string) => void;
  moveProject: (id: string, status: ProjectStatus) => void;
  getProjectsByStatus: (status: ProjectStatus) => Project[];
}

export const useProjectsStore = create<ProjectsStore>()(
  persist(
    (set, get) => ({
      projects: sampleProjects,

      addProject: (project) => {
        const id = generateId();
        const now = new Date().toISOString();
        const newProject: Project = { ...project, id, createdAt: now, updatedAt: now };
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

      moveProject: (id, status) => {
        const now = new Date().toISOString();
        set((state) => ({
          projects: state.projects.map((p) =>
            p.id === id ? { ...p, status, updatedAt: now } : p
          ),
        }));
      },

      getProjectsByStatus: (status) => {
        return get().projects.filter((p) => p.status === status);
      },
    }),
    { name: 'solopreneur-projects' }
  )
);
