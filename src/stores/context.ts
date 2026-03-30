import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { useNicheStore } from '@/stores/niche';
import { useBrandStore } from '@/stores/brand';
import { useAvatarStore } from '@/stores/avatar';
import { useOfferStore } from '@/stores/offer';
import { useIncomeStore } from '@/stores/income';
import { useSkillsStore } from '@/stores/skills';
import { useUserStore } from '@/stores/user';

export interface ContextSection {
  key: string;
  label: string;
  filled: boolean;
  value: string;
  route: string;
}

interface ContextStore {
  customContext: string;
  addCustomContext: (text: string) => void;
  clearCustomContext: () => void;
  getContextString: () => string;
  getContextScore: () => number;
  getContextSections: () => ContextSection[];
}

export const useContextStore = create<ContextStore>()(
  persist(
    (set, get) => ({
      customContext: '',

      addCustomContext: (text: string) => {
        set({ customContext: text });
      },

      clearCustomContext: () => {
        set({ customContext: '' });
      },

      getContextSections: (): ContextSection[] => {
        const niche = useNicheStore.getState().niche;
        const brand = useBrandStore.getState().brand;
        const avatar = useAvatarStore.getState().getDefaultAvatar();
        const offer = useOfferStore.getState().offer;
        const streams = useIncomeStore.getState().streams;
        const skills = useSkillsStore.getState().skills;
        const user = useUserStore.getState().user;

        const nicheStatement = niche.fullStatement || '';
        const nicheHasContent =
          !!(niche.group && niche.outcome && niche.benefit && niche.pain);

        const brandSoul = brand.pillars?.soul || {};
        const brandVoice = [
          brandSoul['mission'],
          brandSoul['coreValues'],
          brand.pillars?.signals?.['toneOfVoice'],
        ]
          .filter(Boolean)
          .join('; ');
        const brandFilled = brand.progress > 0;

        const avatarFilled = !!(avatar && avatar.name && avatar.goals);
        const avatarValue = avatar
          ? `${avatar.name}${avatar.occupation ? ` — ${avatar.occupation}` : ''}`
          : '';

        const offerFilled = !!(offer.name && offer.price);
        const offerValue = offer.name
          ? `${offer.name} at $${offer.price}`
          : '';

        const activeStreams = streams.filter((s) => s.active);
        const monthlyTotal = useIncomeStore.getState().getMonthlyTotal();
        const incomeFilled = activeStreams.length > 0;
        const incomeValue = incomeFilled
          ? `$${monthlyTotal.toLocaleString()}/mo across ${activeStreams.length} stream${activeStreams.length !== 1 ? 's' : ''}`
          : '';

        const skillsFilled = skills.length > 0;
        const skillsValue = skills
          .slice(0, 4)
          .map((s) => s.title)
          .join(', ');

        const userFilled = !!(user.name && user.email);
        const userValue = user.name || '';

        return [
          {
            key: 'user',
            label: 'Profile',
            filled: userFilled,
            value: userValue,
            route: '/settings',
          },
          {
            key: 'niche',
            label: 'Niche Statement',
            filled: nicheHasContent,
            value: nicheStatement
              ? nicheStatement.slice(0, 80) + (nicheStatement.length > 80 ? '…' : '')
              : '',
            route: '/niche-statement',
          },
          {
            key: 'avatar',
            label: 'Target Avatar',
            filled: avatarFilled,
            value: avatarValue,
            route: '/avatar-architect',
          },
          {
            key: 'offer',
            label: 'Core Offer',
            filled: offerFilled,
            value: offerValue,
            route: '/offer-creator',
          },
          {
            key: 'income',
            label: 'Income Streams',
            filled: incomeFilled,
            value: incomeValue,
            route: '/income-streams',
          },
          {
            key: 'brand',
            label: 'Brand Voice',
            filled: brandFilled,
            value: brandVoice
              ? brandVoice.slice(0, 80) + (brandVoice.length > 80 ? '…' : '')
              : `${brand.progress}% complete`,
            route: '/personal-brand',
          },
          {
            key: 'skills',
            label: 'AI Skills',
            filled: skillsFilled,
            value: skillsValue,
            route: '/skills',
          },
        ];
      },

      getContextScore: (): number => {
        const sections = get().getContextSections();
        if (sections.length === 0) return 0;
        const filled = sections.filter((s) => s.filled).length;
        return Math.round((filled / sections.length) * 100);
      },

      getContextString: (): string => {
        const niche = useNicheStore.getState().niche;
        const brand = useBrandStore.getState().brand;
        const avatar = useAvatarStore.getState().getDefaultAvatar();
        const offer = useOfferStore.getState().offer;
        const skills = useSkillsStore.getState().skills;
        const user = useUserStore.getState().user;
        const monthlyTotal = useIncomeStore.getState().getMonthlyTotal();
        const { customContext } = get();

        const brandSoul = brand.pillars?.soul || {};
        const brandSignals = brand.pillars?.signals || {};
        const brandSoulSummary = [
          brandSoul['mission'] ? `Mission: ${brandSoul['mission']}` : null,
          brandSoul['coreValues'] ? `Values: ${brandSoul['coreValues']}` : null,
          brandSignals['toneOfVoice'] ? `Tone: ${brandSignals['toneOfVoice']}` : null,
        ]
          .filter(Boolean)
          .join(' | ');

        const nicheStatement =
          niche.fullStatement ||
          (niche.group && niche.outcome
            ? `I help ${niche.group} ${niche.outcome}`
            : 'Not yet defined');

        const avatarLine = avatar
          ? `${avatar.name} — ${avatar.occupation || avatar.goals?.slice(0, 60) || 'No description'}`
          : 'Not yet defined';

        const offerLine =
          offer.name && offer.price
            ? `${offer.name} at $${offer.price}`
            : offer.name || 'Not yet defined';

        const skillTitles =
          skills.length > 0
            ? skills.map((s) => s.title).join(', ')
            : 'No skills configured';

        const lines: string[] = [
          '## Business Context',
          '',
          `**Owner**: ${user.name || 'Unknown'}`,
          `**Niche**: ${nicheStatement}`,
          `**Target Avatar**: ${avatarLine}`,
          `**Core Offer**: ${offerLine}`,
          `**Monthly Revenue**: $${monthlyTotal.toLocaleString()}`,
          `**Brand Voice**: ${brandSoulSummary || 'Not yet defined'}`,
          `**Top Skills**: ${skillTitles}`,
        ];

        if (customContext && customContext.trim().length > 0) {
          lines.push('');
          lines.push('**Additional Context**:');
          lines.push(customContext.trim());
        }

        return lines.join('\n');
      },
    }),
    { name: 'solopreneur-context' }
  )
);
