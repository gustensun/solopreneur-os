import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { generateId } from '@/lib/utils';
import type { Offer, OfferStackItem, ObjectionPair } from '@/types';

const defaultOffer: Offer = {
  id: generateId(),
  name: 'AI Business Accelerator',
  clearOutcome: 'Go from 0 to $10k/month in 90 days using AI-powered systems',
  newVehicle: 'AI-Assisted Offer & Content System — a done-with-you program that uses AI to compress 12 months of work into 90 days',
  betterResults: 'Most clients see their first $1k week within 30 days, and hit $10k/month by day 90',
  fasterDelivery: 'AI tools cut content creation time by 80%, letting you focus on high-leverage tasks like sales calls and client delivery',
  convenience: 'Weekly live calls, async Slack support, pre-built templates and swipe files so you never start from scratch',
  offerStack: [
    {
      id: generateId(),
      name: '12-Week 1:1 Coaching Program',
      value: '10,000',
      description: 'Weekly 60-minute strategy sessions tailored to your specific business',
    },
    {
      id: generateId(),
      name: 'AI Content Creation System',
      value: '2,500',
      description: 'Complete prompts library and workflow to create 30 days of content in one session',
    },
    {
      id: generateId(),
      name: 'High-Ticket Offer Template Pack',
      value: '1,500',
      description: 'Done-for-you offer framework, sales page template, and pricing guide',
    },
    {
      id: generateId(),
      name: 'Private Community Access',
      value: '997',
      description: 'Lifetime access to the inner circle of solopreneurs scaling to 6 figures',
    },
  ],
  price: '5,000',
  objections: [
    {
      id: generateId(),
      objection: "I don't have time to build a business",
      killer: 'Our AI systems cut the time required by 80%. You only need 2 hours per day to see results — less time than most people spend scrolling social media.',
    },
    {
      id: generateId(),
      objection: "I'm not tech-savvy enough for AI tools",
      killer: 'All tools are set up for you with step-by-step walkthroughs. If you can copy and paste, you can use our system. Average client is up and running in under 30 minutes.',
    },
    {
      id: generateId(),
      objection: "I've tried courses before and they didn't work",
      killer: 'This is not a course — it\'s a done-with-you program with 1:1 accountability. You get a real human checking your work every week, not just watching videos alone.',
    },
  ],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

interface OfferStore {
  offer: Offer;

  updateOffer: (updates: Partial<Omit<Offer, 'id' | 'createdAt' | 'updatedAt'>>) => void;
  addStackItem: (item: Omit<OfferStackItem, 'id'>) => string;
  removeStackItem: (id: string) => void;
  updateStackItem: (id: string, updates: Partial<Omit<OfferStackItem, 'id'>>) => void;
  addObjection: (objection: Omit<ObjectionPair, 'id'>) => string;
  removeObjection: (id: string) => void;
  updateObjection: (id: string, updates: Partial<Omit<ObjectionPair, 'id'>>) => void;
}

export const useOfferStore = create<OfferStore>()(
  persist(
    (set) => ({
      offer: defaultOffer,

      updateOffer: (updates) => {
        const now = new Date().toISOString();
        set((state) => ({ offer: { ...state.offer, ...updates, updatedAt: now } }));
      },

      addStackItem: (item) => {
        const id = generateId();
        const now = new Date().toISOString();
        const newItem: OfferStackItem = { ...item, id };
        set((state) => ({
          offer: {
            ...state.offer,
            offerStack: [...state.offer.offerStack, newItem],
            updatedAt: now,
          },
        }));
        return id;
      },

      removeStackItem: (id) => {
        const now = new Date().toISOString();
        set((state) => ({
          offer: {
            ...state.offer,
            offerStack: state.offer.offerStack.filter((item) => item.id !== id),
            updatedAt: now,
          },
        }));
      },

      updateStackItem: (id, updates) => {
        const now = new Date().toISOString();
        set((state) => ({
          offer: {
            ...state.offer,
            offerStack: state.offer.offerStack.map((item) =>
              item.id === id ? { ...item, ...updates } : item
            ),
            updatedAt: now,
          },
        }));
      },

      addObjection: (objection) => {
        const id = generateId();
        const now = new Date().toISOString();
        const newObjection: ObjectionPair = { ...objection, id };
        set((state) => ({
          offer: {
            ...state.offer,
            objections: [...state.offer.objections, newObjection],
            updatedAt: now,
          },
        }));
        return id;
      },

      removeObjection: (id) => {
        const now = new Date().toISOString();
        set((state) => ({
          offer: {
            ...state.offer,
            objections: state.offer.objections.filter((o) => o.id !== id),
            updatedAt: now,
          },
        }));
      },

      updateObjection: (id, updates) => {
        const now = new Date().toISOString();
        set((state) => ({
          offer: {
            ...state.offer,
            objections: state.offer.objections.map((o) =>
              o.id === id ? { ...o, ...updates } : o
            ),
            updatedAt: now,
          },
        }));
      },
    }),
    { name: 'solopreneur-offer' }
  )
);
