import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { generateId } from '@/lib/utils';
import type { PersonalBrand, BrandPillar } from '@/types';

export const BRAND_PILLARS: BrandPillar[] = [
  {
    id: 'soul',
    name: 'Soul',
    icon: '✦',
    description: 'Your core values, beliefs, and what drives you',
    fields: [
      { key: 'coreValues', label: 'Core Values', value: '', placeholder: 'e.g. Freedom, Impact, Authenticity', type: 'textarea' },
      { key: 'mission', label: 'Mission Statement', value: '', placeholder: 'What is your ultimate mission?', type: 'textarea' },
      { key: 'whyStatement', label: 'Your Why', value: '', placeholder: 'Why do you do what you do?', type: 'textarea' },
      { key: 'personalStory', label: 'Personal Story', value: '', placeholder: 'What\'s the origin story of your brand?', type: 'textarea' },
    ],
  },
  {
    id: 'service',
    name: 'Service',
    icon: '◆',
    description: 'Who you serve and the transformation you deliver',
    fields: [
      { key: 'idealClient', label: 'Ideal Client', value: '', placeholder: 'Who do you specifically help?', type: 'textarea' },
      { key: 'transformation', label: 'Core Transformation', value: '', placeholder: 'What transformation do you deliver?', type: 'textarea' },
      { key: 'uniqueMethod', label: 'Unique Method', value: '', placeholder: 'How is your approach different?', type: 'textarea' },
      { key: 'results', label: 'Signature Results', value: '', placeholder: 'What results do clients achieve?', type: 'textarea' },
    ],
  },
  {
    id: 'shift',
    name: 'Shift',
    icon: '▲',
    description: 'The beliefs and mindset shifts you help create',
    fields: [
      { key: 'commonBelief', label: 'Common Belief You Challenge', value: '', placeholder: 'What does your audience believe that holds them back?', type: 'textarea' },
      { key: 'newBelief', label: 'New Belief You Install', value: '', placeholder: 'What belief do you want them to adopt?', type: 'textarea' },
      { key: 'controversialTake', label: 'Controversial Take', value: '', placeholder: 'What do you believe that others in your space disagree with?', type: 'textarea' },
    ],
  },
  {
    id: 'setting',
    name: 'Setting',
    icon: '●',
    description: 'Your brand aesthetic, environment, and visual identity',
    fields: [
      { key: 'brandAesthetic', label: 'Brand Aesthetic', value: '', placeholder: 'How would you describe your visual style?', type: 'textarea' },
      { key: 'colorPalette', label: 'Color Palette', value: '', placeholder: 'Primary and accent colors', type: 'text' },
      { key: 'brandEnvironment', label: 'Brand Environment', value: '', placeholder: 'Where do you create content? What\'s your backdrop?', type: 'textarea' },
    ],
  },
  {
    id: 'signals',
    name: 'Signals',
    icon: '◉',
    description: 'Your content signals, hooks, and communication patterns',
    fields: [
      { key: 'signaturePhrase', label: 'Signature Phrase', value: '', placeholder: 'A phrase uniquely yours', type: 'text' },
      { key: 'contentStyle', label: 'Content Style', value: '', placeholder: 'How do you communicate? Educational, entertaining, inspiring?', type: 'textarea' },
      { key: 'hookFormulas', label: 'Hook Formulas', value: '', placeholder: 'Patterns you use to open content', type: 'textarea' },
      { key: 'toneOfVoice', label: 'Tone of Voice', value: '', placeholder: 'How does your brand sound?', type: 'textarea' },
    ],
  },
  {
    id: 'sources',
    name: 'Sources',
    icon: '◈',
    description: 'Your credibility sources, proof, and authority builders',
    fields: [
      { key: 'credentials', label: 'Credentials & Experience', value: '', placeholder: 'Relevant experience and achievements', type: 'textarea' },
      { key: 'socialProof', label: 'Social Proof', value: '', placeholder: 'Testimonials, case studies, press mentions', type: 'textarea' },
      { key: 'authorityContent', label: 'Authority Content', value: '', placeholder: 'Books, courses, speaking, podcast appearances', type: 'textarea' },
    ],
  },
  {
    id: 'systems',
    name: 'Systems',
    icon: '⬡',
    description: 'Your content systems, distribution channels, and growth engines',
    fields: [
      { key: 'primaryPlatform', label: 'Primary Platform', value: '', placeholder: 'Where you focus most content effort', type: 'text' },
      { key: 'contentCalendar', label: 'Content Cadence', value: '', placeholder: 'How often and what types of content', type: 'textarea' },
      { key: 'funnelOverview', label: 'Funnel Overview', value: '', placeholder: 'How you convert audience to clients', type: 'textarea' },
      { key: 'distributionChannels', label: 'Distribution Channels', value: '', placeholder: 'All channels you publish on', type: 'textarea' },
    ],
  },
];

const defaultBrand: PersonalBrand = {
  id: generateId(),
  pillars: {
    soul: {},
    service: {},
    shift: {},
    setting: {},
    signals: {},
    sources: {},
    systems: {},
  },
  progress: 0,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

interface BrandStore {
  brand: PersonalBrand;
  pillars: BrandPillar[];

  updateField: (pillarId: string, fieldKey: string, value: string) => void;
  getProgress: () => number;
}

function calculateProgress(pillars: Record<string, Record<string, string>>): number {
  let totalFields = 0;
  let filledFields = 0;

  BRAND_PILLARS.forEach((pillar) => {
    pillar.fields.forEach((field) => {
      totalFields++;
      const value = pillars[pillar.id]?.[field.key];
      if (value && value.trim().length > 0) filledFields++;
    });
  });

  if (totalFields === 0) return 0;
  return Math.round((filledFields / totalFields) * 100);
}

export const useBrandStore = create<BrandStore>()(
  persist(
    (set, get) => ({
      brand: defaultBrand,
      pillars: BRAND_PILLARS,

      updateField: (pillarId, fieldKey, value) => {
        const now = new Date().toISOString();
        set((state) => {
          const updatedPillars = {
            ...state.brand.pillars,
            [pillarId]: {
              ...state.brand.pillars[pillarId],
              [fieldKey]: value,
            },
          };
          const progress = calculateProgress(updatedPillars);
          return {
            brand: {
              ...state.brand,
              pillars: updatedPillars,
              progress,
              updatedAt: now,
            },
          };
        });
      },

      getProgress: () => {
        return get().brand.progress;
      },
    }),
    { name: 'solopreneur-brand' }
  )
);
