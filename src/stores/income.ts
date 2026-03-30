import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { generateId } from '@/lib/utils';
import type { IncomeStream } from '@/types';

const now = new Date().toISOString();

const sampleStreams: IncomeStream[] = [
  {
    id: generateId(),
    name: 'Vibe Coding',
    fee: 10000,
    type: 'Consulting',
    format: 'Recurring',
    monthlySales: 1,
    active: true,
    position: 0,
    createdAt: now,
    updatedAt: now,
  },
  {
    id: generateId(),
    name: 'AI Inner Circle',
    fee: 500,
    type: 'Membership',
    format: 'Recurring',
    monthlySales: 100,
    active: true,
    position: 1,
    createdAt: now,
    updatedAt: now,
  },
  {
    id: generateId(),
    name: 'Affiliate',
    fee: 25000,
    type: 'Affiliate',
    format: 'Recurring',
    monthlySales: 1,
    active: true,
    position: 2,
    createdAt: now,
    updatedAt: now,
  },
  {
    id: generateId(),
    name: 'AI Academy',
    fee: 997,
    type: 'Courses',
    format: 'One Time',
    monthlySales: 30,
    active: true,
    position: 3,
    createdAt: now,
    updatedAt: now,
  },
];

interface IncomeStore {
  streams: IncomeStream[];

  addStream: (stream: Omit<IncomeStream, 'id' | 'createdAt' | 'updatedAt'>) => string;
  updateStream: (id: string, updates: Partial<IncomeStream>) => void;
  deleteStream: (id: string) => void;
  reorderStreams: (streams: IncomeStream[]) => void;
  getMonthlyTotal: () => number;
  getAnnualProjection: () => number;
}

export const useIncomeStore = create<IncomeStore>()(
  persist(
    (set, get) => ({
      streams: sampleStreams,

      addStream: (stream) => {
        const id = generateId();
        const now = new Date().toISOString();
        const newStream: IncomeStream = { ...stream, id, createdAt: now, updatedAt: now };
        set((state) => ({ streams: [...state.streams, newStream] }));
        return id;
      },

      updateStream: (id, updates) => {
        const now = new Date().toISOString();
        set((state) => ({
          streams: state.streams.map((s) =>
            s.id === id ? { ...s, ...updates, updatedAt: now } : s
          ),
        }));
      },

      deleteStream: (id) =>
        set((state) => ({ streams: state.streams.filter((s) => s.id !== id) })),

      reorderStreams: (streams) => set({ streams }),

      getMonthlyTotal: () => {
        const state = get();
        return state.streams
          .filter((s) => s.active)
          .reduce((total, stream) => {
            return total + stream.fee * stream.monthlySales;
          }, 0);
      },

      getAnnualProjection: () => {
        return get().getMonthlyTotal() * 12;
      },
    }),
    { name: 'solopreneur-income' }
  )
);
