import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { generateId } from '@/lib/utils';

// ─── Types ──────────────────────────────────────────────────────────────────

export type ContentType = 'hook' | 'headline' | 'subject' | 'ad';
export type HookFramework =
  | 'contrarian'
  | 'statistic'
  | 'story'
  | 'question'
  | 'promise'
  | 'secret'
  | 'failure'
  | 'hottake';
export type DesiredEmotion =
  | 'curiosity'
  | 'fear'
  | 'hope'
  | 'anger'
  | 'surprise'
  | 'fomo'
  | 'aspiration'
  | 'disgust';

export interface GeneratedHook {
  id: string;
  text: string;
  framework: HookFramework;
  emotion: DesiredEmotion;
  score: number;
  scoreReason: string;
  feedback: 'up' | 'down' | null;
}

export interface HookGenerationOptions {
  contentType: ContentType;
  topic: string;
  audience: string;
  emotions: DesiredEmotion[];
  framework: HookFramework;
  tone: number; // 0 = professional, 4 = casual
}

export interface HookSet {
  id: string;
  generatedAt: string;
  options: HookGenerationOptions;
  hooks: GeneratedHook[];
}

interface HooksStore {
  history: HookSet[];
  addHookSet: (set: Omit<HookSet, 'id' | 'generatedAt'>) => string;
  updateHookFeedback: (setId: string, hookId: string, feedback: 'up' | 'down' | null) => void;
  clearHistory: () => void;
}

export const useHooksStore = create<HooksStore>()(
  persist(
    (set) => ({
      history: [],

      addHookSet: (hookSet) => {
        const id = generateId();
        const generatedAt = new Date().toISOString();
        const newSet: HookSet = { ...hookSet, id, generatedAt };
        set((state) => ({
          history: [newSet, ...state.history].slice(0, 20),
        }));
        return id;
      },

      updateHookFeedback: (setId, hookId, feedback) => {
        set((state) => ({
          history: state.history.map((s) =>
            s.id === setId
              ? {
                  ...s,
                  hooks: s.hooks.map((h) =>
                    h.id === hookId ? { ...h, feedback } : h
                  ),
                }
              : s
          ),
        }));
      },

      clearHistory: () => set({ history: [] }),
    }),
    { name: 'solopreneur-hooks' }
  )
);
