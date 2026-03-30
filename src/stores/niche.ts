import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { generateId } from '@/lib/utils';
import type { NicheStatement } from '@/types';

const defaultNiche: NicheStatement = {
  id: generateId(),
  market: 'wealth',
  group: 'solopreneurs and creators',
  outcome: 'build a 6-figure online business using AI tools',
  benefit: 'work from anywhere with complete time and financial freedom',
  pain: 'spend years figuring it out through trial and error',
  fullStatement:
    'I help solopreneurs and creators build a 6-figure online business using AI tools, so they can work from anywhere with complete time and financial freedom, without having to spend years figuring it out through trial and error.',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

interface NicheStore {
  niche: NicheStatement;

  updateNiche: (updates: Partial<Omit<NicheStatement, 'id' | 'createdAt' | 'updatedAt' | 'fullStatement'>>) => void;
  getFullStatement: () => string;
}

function buildFullStatement(niche: NicheStatement): string {
  const { group, outcome, benefit, pain } = niche;
  if (!group && !outcome && !benefit && !pain) return '';
  return `I help ${group || '[group]'} ${outcome || '[outcome]'}, so they can ${benefit || '[benefit]'}, without having to ${pain || '[pain]'}.`;
}

export const useNicheStore = create<NicheStore>()(
  persist(
    (set, get) => ({
      niche: defaultNiche,

      updateNiche: (updates) => {
        const now = new Date().toISOString();
        set((state) => {
          const updatedNiche = { ...state.niche, ...updates, updatedAt: now };
          updatedNiche.fullStatement = buildFullStatement(updatedNiche);
          return { niche: updatedNiche };
        });
      },

      getFullStatement: () => {
        return get().niche.fullStatement || buildFullStatement(get().niche);
      },
    }),
    { name: 'solopreneur-niche' }
  )
);
