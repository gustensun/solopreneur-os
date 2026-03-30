import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { generateId } from '@/lib/utils';
import type { QuizAnswer, QuizResult } from '@/types';

export interface QuizQuestion {
  id: string;
  text: string;
  options: QuizOption[];
  category: string;
}

export interface QuizOption {
  id: string;
  text: string;
  value: string;
}

export const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    id: 'q1',
    text: 'What is your current monthly revenue from your online business?',
    category: 'revenue',
    options: [
      { id: 'q1a', text: '$0 — just getting started', value: '0' },
      { id: 'q1b', text: '$1 - $1,000/month', value: '1000' },
      { id: 'q1c', text: '$1,000 - $5,000/month', value: '5000' },
      { id: 'q1d', text: '$5,000 - $10,000/month', value: '10000' },
      { id: 'q1e', text: '$10,000+/month', value: '10000plus' },
    ],
  },
  {
    id: 'q2',
    text: 'Which best describes your current business model?',
    category: 'model',
    options: [
      { id: 'q2a', text: 'I trade time for money (freelancing/consulting)', value: 'time-for-money' },
      { id: 'q2b', text: 'I sell a digital product or course', value: 'digital-product' },
      { id: 'q2c', text: 'I have a recurring membership or subscription', value: 'recurring' },
      { id: 'q2d', text: 'I mix multiple income streams', value: 'mixed' },
      { id: 'q2e', text: 'I haven\'t started monetizing yet', value: 'not-started' },
    ],
  },
  {
    id: 'q3',
    text: 'What is your biggest challenge right now?',
    category: 'challenge',
    options: [
      { id: 'q3a', text: 'Finding clients / getting leads', value: 'lead-gen' },
      { id: 'q3b', text: 'Knowing what niche or offer to focus on', value: 'clarity' },
      { id: 'q3c', text: 'Creating content consistently', value: 'content' },
      { id: 'q3d', text: 'Converting leads into paying clients', value: 'conversion' },
      { id: 'q3e', text: 'Scaling without burning out', value: 'scale' },
    ],
  },
  {
    id: 'q4',
    text: 'How are you currently building your audience?',
    category: 'audience',
    options: [
      { id: 'q4a', text: 'YouTube is my primary channel', value: 'youtube' },
      { id: 'q4b', text: 'Instagram / TikTok (short form video)', value: 'short-form' },
      { id: 'q4c', text: 'LinkedIn / Twitter (written content)', value: 'written' },
      { id: 'q4d', text: 'Email list / newsletter', value: 'email' },
      { id: 'q4e', text: 'I\'m not actively building an audience yet', value: 'none' },
    ],
  },
  {
    id: 'q5',
    text: 'How much are you leveraging AI in your business?',
    category: 'ai-usage',
    options: [
      { id: 'q5a', text: 'Not at all — I\'m new to AI tools', value: 'none' },
      { id: 'q5b', text: 'I use ChatGPT occasionally for small tasks', value: 'occasional' },
      { id: 'q5c', text: 'AI is part of my regular workflow', value: 'regular' },
      { id: 'q5d', text: 'AI automates significant parts of my business', value: 'automated' },
    ],
  },
  {
    id: 'q6',
    text: 'What is your income goal for the next 12 months?',
    category: 'goal',
    options: [
      { id: 'q6a', text: 'Replace my 9-5 income ($3k-$5k/month)', value: 'replace-job' },
      { id: 'q6b', text: 'Hit $10k/month consistently', value: '10k-month' },
      { id: 'q6c', text: 'Reach $100k/year ($8.3k/month)', value: '100k-year' },
      { id: 'q6d', text: 'Scale to $250k-$500k/year', value: '500k-year' },
      { id: 'q6e', text: 'Build a $1M+/year business', value: '1m-year' },
    ],
  },
];

function generateAnalysis(answers: QuizAnswer[]): string {
  const revenueAnswer = answers.find((a) => a.questionId === 'q1')?.answer;
  const challengeAnswer = answers.find((a) => a.questionId === 'q3')?.answer;
  let stage = 'Beginner';
  if (revenueAnswer === '5000' || revenueAnswer === '10000') stage = 'Intermediate';
  if (revenueAnswer === '10000plus') stage = 'Advanced';

  const challengeMap: Record<string, string> = {
    'lead-gen': 'Your #1 priority is building visibility. Focus on one content platform and go all-in for 90 days before adding another.',
    'clarity': 'Clarity comes from commitment, not contemplation. Pick the most specific niche that aligns with your experience and test it for 30 days.',
    'content': 'Implement the AI Content Batching System — batch all your content for the month in one 4-hour session using AI.',
    'conversion': 'Your conversion rate improves with social proof and specificity. Collect 3 detailed case studies and add them to your sales process.',
    'scale': 'To scale without burnout, you need systems before more clients. Build your AI-powered delivery system first.',
  };

  const challengeAdvice = challengeMap[challengeAnswer ?? ''] ?? 'Focus on building a strong foundation with a clear niche, compelling offer, and consistent content.';

  return `**Your Solopreneur Stage: ${stage}**\n\nBased on your answers, here's your personalized business diagnosis:\n\n${challengeAdvice}\n\n**Your Next 3 Actions:**\n1. Complete the Niche Statement exercise in the Niche Builder\n2. Design your signature offer using the Offer Architect\n3. Set up your content pillar system in the Content Vault\n\nYou have strong potential to hit your income goals. The key is to focus on one thing at a time, leverage AI to move faster, and stay consistent for 90 days. Most solopreneurs who follow this framework see their first $10k month within 90 days.`;
}

interface QuizStore {
  currentStep: number;
  answers: QuizAnswer[];
  result: QuizResult | null;
  isCompleted: boolean;

  answerQuestion: (questionId: string, answer: string) => void;
  nextStep: () => void;
  prevStep: () => void;
  getResult: () => QuizResult;
  resetQuiz: () => void;
}

export const useQuizStore = create<QuizStore>()(
  persist(
    (set, get) => ({
      currentStep: 0,
      answers: [],
      result: null,
      isCompleted: false,

      answerQuestion: (questionId, answer) => {
        set((state) => {
          const existing = state.answers.findIndex((a) => a.questionId === questionId);
          let newAnswers: QuizAnswer[];
          if (existing >= 0) {
            newAnswers = state.answers.map((a, i) =>
              i === existing ? { ...a, answer } : a
            );
          } else {
            newAnswers = [...state.answers, { questionId, answer }];
          }
          return { answers: newAnswers };
        });
      },

      nextStep: () => {
        const state = get();
        const nextStep = state.currentStep + 1;

        if (nextStep >= QUIZ_QUESTIONS.length) {
          // Complete the quiz
          const analysis = generateAnalysis(state.answers);
          const now = new Date().toISOString();
          const result: QuizResult = {
            id: generateId(),
            answers: state.answers,
            analysis,
            completed: true,
            createdAt: now,
            updatedAt: now,
          };
          set({ result, isCompleted: true, currentStep: nextStep });
        } else {
          set({ currentStep: nextStep });
        }
      },

      prevStep: () => {
        set((state) => ({
          currentStep: Math.max(0, state.currentStep - 1),
        }));
      },

      getResult: () => {
        const state = get();
        if (state.result) return state.result;

        const analysis = generateAnalysis(state.answers);
        const now = new Date().toISOString();
        const result: QuizResult = {
          id: generateId(),
          answers: state.answers,
          analysis,
          completed: true,
          createdAt: now,
          updatedAt: now,
        };
        set({ result, isCompleted: true });
        return result;
      },

      resetQuiz: () => {
        set({ currentStep: 0, answers: [], result: null, isCompleted: false });
      },
    }),
    { name: 'solopreneur-quiz' }
  )
);
