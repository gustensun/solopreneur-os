import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { generateId } from '@/lib/utils';

// ─── Types ──────────────────────────────────────────────────────────────────

export type SequenceType = 'welcome' | 'launch' | 'nurture' | 'reengagement';
export type BrandVoice = 'conversational' | 'professional' | 'bold' | 'empathetic';

export interface EmailItem {
  id: string;
  number: number;
  purpose: string;
  subjectLine: string;
  previewText: string;
  body: string;
  sendTiming: string;
}

export interface EmailSequence {
  id: string;
  type: SequenceType;
  name: string;
  brandVoice: BrandVoice;
  createdAt: string;
  updatedAt: string;
  emails: EmailItem[];
  // generation params
  authorName: string;
  offerName: string;
  price: string;
  deadline: string;
}

interface EmailStudioStore {
  sequences: EmailSequence[];
  activeSequenceId: string | null;

  addSequence: (seq: Omit<EmailSequence, 'id' | 'createdAt' | 'updatedAt'>) => string;
  updateSequence: (id: string, updates: Partial<Omit<EmailSequence, 'id' | 'createdAt'>>) => void;
  updateEmail: (sequenceId: string, emailId: string, updates: Partial<EmailItem>) => void;
  deleteSequence: (id: string) => void;
  setActiveSequence: (id: string | null) => void;
}

export const useEmailStudioStore = create<EmailStudioStore>()(
  persist(
    (set) => ({
      sequences: [],
      activeSequenceId: null,

      addSequence: (seq) => {
        const id = generateId();
        const now = new Date().toISOString();
        const newSeq: EmailSequence = { ...seq, id, createdAt: now, updatedAt: now };
        set((state) => ({
          sequences: [newSeq, ...state.sequences],
          activeSequenceId: id,
        }));
        return id;
      },

      updateSequence: (id, updates) => {
        const now = new Date().toISOString();
        set((state) => ({
          sequences: state.sequences.map((s) =>
            s.id === id ? { ...s, ...updates, updatedAt: now } : s
          ),
        }));
      },

      updateEmail: (sequenceId, emailId, updates) => {
        const now = new Date().toISOString();
        set((state) => ({
          sequences: state.sequences.map((s) =>
            s.id === sequenceId
              ? {
                  ...s,
                  updatedAt: now,
                  emails: s.emails.map((e) =>
                    e.id === emailId ? { ...e, ...updates } : e
                  ),
                }
              : s
          ),
        }));
      },

      deleteSequence: (id) =>
        set((state) => ({
          sequences: state.sequences.filter((s) => s.id !== id),
          activeSequenceId:
            state.activeSequenceId === id ? null : state.activeSequenceId,
        })),

      setActiveSequence: (id) => set({ activeSequenceId: id }),
    }),
    { name: 'solopreneur-email-studio' }
  )
);
