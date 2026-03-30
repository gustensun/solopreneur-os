import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// ─── Types ───────────────────────────────────────────────────────────────────

export interface NicheAnalysisData {
  marketSize: string;
  marketSizeDetail: string;
  competitionLevel: 'Low' | 'Medium' | 'High';
  competitionScore: number; // 0-100
  monetizationScore: number; // 0-100
  trendDirection: 'growing' | 'stable' | 'declining';
  trendDetail: string;
  subNiches: string[];
  viabilityScore: number; // 0-100
  viabilityReason: string;
}

export interface CompetitorProfile {
  id: string;
  name: string;
  offerType: string;
  pricePoint: string;
  audienceSize: string;
  strengths: string[];
  weaknesses: string[];
  opportunityGap: string;
}

export interface OpportunityMatrixCell {
  dimension: string;
  gap: string;
  rating: 'High' | 'Medium' | 'Low';
}

export interface PsychologyItem {
  label: string;
  intensity: number; // 0-100
}

export interface AudiencePsychologyData {
  coreFears: PsychologyItem[];
  burningDesires: PsychologyItem[];
  dailyFrustrations: string[];
  aspirationalIdentity: string;
  buyingTriggers: string[];
  objections: { objection: string; overcome: string }[];
  exactPhrases: string[];
}

export type KeywordIntent = 'Awareness' | 'Consideration' | 'Decision';
export type CompetitionLevel = 'Low' | 'Medium' | 'High';

export interface KeywordRow {
  keyword: string;
  monthlySearches: string;
  competition: CompetitionLevel;
  cpc: string;
  contentAngle: string;
  intent: KeywordIntent;
}

export interface ContentGapKeyword {
  keyword: string;
  opportunity: string;
  searchVolume: string;
}

export interface PricingTier {
  label: string;
  range: string;
  competitors: { name: string; price: string }[];
  percentage: number; // width for bar chart
}

export interface PricingPsychologyTip {
  tip: string;
  detail: string;
}

export interface ResearchData {
  topic: string;
  nicheAnalysis: NicheAnalysisData;
  competitors: CompetitorProfile[];
  opportunityMatrix: OpportunityMatrixCell[];
  audiencePsychology: AudiencePsychologyData;
  keywords: KeywordRow[];
  contentGaps: ContentGapKeyword[];
  pricingTiers: PricingTier[];
  pricingTips: PricingPsychologyTip[];
  pricingOpportunity: string;
  lastRefreshed: string;
}

interface ResearchStore {
  research: ResearchData;
  setTopic: (topic: string) => void;
  refreshSection: (section: keyof Omit<ResearchData, 'topic' | 'lastRefreshed'>) => void;
  resetToDefaults: () => void;
}

// ─── Default seed data ────────────────────────────────────────────────────────

const defaultData: ResearchData = {
  topic: 'AI Business Coaching for Solopreneurs',

  nicheAnalysis: {
    marketSize: '$14.3B',
    marketSizeDetail: 'Global online coaching & creator economy segment, growing at 18% CAGR',
    competitionLevel: 'Medium',
    competitionScore: 52,
    monetizationScore: 88,
    trendDirection: 'growing',
    trendDetail: 'AI productivity tools for businesses surged 340% in search interest since 2023',
    subNiches: [
      'AI-Powered Content Creation for Course Creators',
      'Automated Client Acquisition Systems for Coaches',
      'AI Financial Forecasting for Freelance Businesses',
    ],
    viabilityScore: 82,
    viabilityReason:
      'Strong demand, underserved by incumbents who ignore AI, high willingness to pay, scalable delivery model',
  },

  competitors: [
    {
      id: '1',
      name: 'Alex Hormozi / Acquisition.com',
      offerType: 'Books + Free Content + Portfolio Model',
      pricePoint: 'Free–$1M equity deals',
      audienceSize: '4.2M followers',
      strengths: ['Massive authority', 'Generous free content', 'Premium brand'],
      weaknesses: ['Not AI-focused', 'No done-for-you for solopreneurs', 'Too high-level'],
      opportunityGap: 'AI-specific implementation for solo operators under $500k/yr',
    },
    {
      id: '2',
      name: 'Amy Porterfield',
      offerType: 'Courses + Membership ($997–$2,000)',
      pricePoint: '$997–$2,000',
      audienceSize: '500K email list',
      strengths: ['Strong course library', 'Trusted brand', 'Community'],
      weaknesses: ['Outdated on AI', 'Generic online business focus', 'Slow content cadence'],
      opportunityGap: 'AI-native course creation workflows — a clear whitespace she ignores',
    },
    {
      id: '3',
      name: 'Justin Welsh',
      offerType: 'LinkedIn + Solo Course ($150–$500)',
      pricePoint: '$150–$500',
      audienceSize: '500K LinkedIn followers',
      strengths: ['Solopreneur credibility', 'Simple offers', 'High trust'],
      weaknesses: ['No AI depth', 'Single-channel focus', 'Low-ticket ceiling'],
      opportunityGap: 'AI systems for scaling solo content beyond LinkedIn at higher price points',
    },
    {
      id: '4',
      name: 'Dan Koe',
      offerType: 'Newsletter + Cohort Programs ($500–$997)',
      pricePoint: '$500–$997',
      audienceSize: '300K multi-platform',
      strengths: ['Philosophy + business blend', 'Young audience', 'Modern aesthetic'],
      weaknesses: ['Abstract content, hard to implement', 'No AI toolstack', 'No 1:1 offers'],
      opportunityGap: 'Concrete AI implementation guides paired with philosophical framing',
    },
    {
      id: '5',
      name: 'Pat Flynn / Smart Passive Income',
      offerType: 'Podcast + Community + Courses ($297–$1,497)',
      pricePoint: '$297–$1,497',
      audienceSize: '200K active community',
      strengths: ['Long-standing trust', 'Diverse content', 'Strong SEO'],
      weaknesses: ['Brand feels dated', 'Slow to adopt AI tools', 'Passive income framing is tired'],
      opportunityGap: 'Modern AI-accelerated business building vs. "passive income" for realists',
    },
    {
      id: '6',
      name: 'Kieran Drew',
      offerType: 'Email + Cohort ($797)',
      pricePoint: '$797',
      audienceSize: '80K newsletter',
      strengths: ['Copywriting niche', 'Tight community', 'Strong engagement'],
      weaknesses: ['Niche is copy, not AI ops', 'Small reach', 'No premium tier'],
      opportunityGap: 'AI-assisted copywriting + offer building as a productized coaching package',
    },
  ],

  opportunityMatrix: [
    { dimension: 'AI Implementation Depth', gap: 'Nobody teaches step-by-step AI tool stacks for solo operators', rating: 'High' },
    { dimension: 'Price Point $1k–$3k', gap: 'Gap between $500 courses and $10k masterminds', rating: 'High' },
    { dimension: 'Done-With-You Format', gap: 'Market is saturated with courses but starved for guided execution', rating: 'High' },
    { dimension: 'Outcome Specificity', gap: 'Most sell "freedom" — opportunity to sell specific revenue milestones', rating: 'Medium' },
    { dimension: 'Speed to Results', gap: 'Slow transformation programs dominate; fast-track AI sprints are rare', rating: 'High' },
    { dimension: 'Community + Accountability', gap: 'Peer accountability with AI tools in a focused cohort is nearly absent', rating: 'Medium' },
  ],

  audiencePsychology: {
    coreFears: [
      { label: 'Being replaced by AI rather than using it', intensity: 92 },
      { label: 'Wasting months on the wrong niche or offer', intensity: 88 },
      { label: 'Never escaping the time-for-money trap', intensity: 85 },
      { label: 'Looking foolish in public with their content', intensity: 79 },
      { label: 'Investing in coaching that doesn\'t deliver', intensity: 76 },
      { label: 'Falling further behind competitors', intensity: 71 },
    ],
    burningDesires: [
      { label: 'Hit $10k/month without burning out', intensity: 96 },
      { label: 'Build a business that runs without constant hustle', intensity: 91 },
      { label: 'Be seen as an authority in their niche', intensity: 87 },
      { label: 'Use AI to 10x output without hiring a team', intensity: 84 },
      { label: 'Have a clear, proven system to follow', intensity: 83 },
      { label: 'Financial freedom by a specific date', intensity: 80 },
    ],
    dailyFrustrations: [
      'Spending 3+ hours creating content that gets 12 likes',
      'Watching less-qualified people charge 3x more',
      'Starting and abandoning new "proven strategies" every month',
      'Inconsistent income — feast or famine cycles',
      'Feeling overwhelmed by too many tools and tactics',
      'Creating a product nobody buys despite months of work',
      'Comparing themselves to gurus who hide how much support they have',
      'Not knowing which AI tools actually matter vs. hype',
    ],
    aspirationalIdentity:
      '"I run a lean, AI-powered business that generates consistent $15k+ months with fewer than 20 hours of real work per week. I\'m known for [specific result], charge premium prices, and have a waitlist of ideal clients."',
    buyingTriggers: [
      'Specific revenue or time-freedom milestone promised',
      'Social proof from people exactly like them (solopreneurs, not teams)',
      'Seeing a clear, step-by-step roadmap before buying',
      'Free content that already delivers real value',
      'Limited cohort or time-bound urgency',
      'Founder-led brand they feel they "know"',
    ],
    objections: [
      {
        objection: '"I\'ve bought courses before and they didn\'t work."',
        overcome: 'Show the accountability structure and done-with-you format — not another course to shelve.',
      },
      {
        objection: '"I don\'t have time to add another program."',
        overcome: 'Position the program as the thing that GIVES them time back via AI, not takes it.',
      },
      {
        objection: '"It\'s too expensive right now."',
        overcome: 'Calculate the cost of staying stuck for 6 more months vs. investing now.',
      },
      {
        objection: '"I\'m not sure AI is right for my business."',
        overcome: 'Lead with a free audit or demo showing exactly how AI applies to their specific workflow.',
      },
      {
        objection: '"What if I fall behind during the program?"',
        overcome: 'Lifetime access + catch-up calls as a safety net framing.',
      },
    ],
    exactPhrases: [
      '"I just need a system"',
      '"work smarter not harder"',
      '"I\'m leaving money on the table"',
      '"I don\'t want to hire a team"',
      '"I\'m wearing all the hats"',
      '"consistent income"',
      '"I want to scale without burnout"',
      '"AI tools feel overwhelming"',
      '"I need to charge more"',
      '"done-with-you"',
      '"I want to be seen as an expert"',
      '"passive income that actually works"',
      '"stop trading time for money"',
      '"build in public"',
      '"one-person business"',
      '"high-ticket offer"',
      '"content that converts"',
      '"solopreneur stack"',
    ],
  },

  keywords: [
    // Awareness
    { keyword: 'how to start an online business with AI', monthlySearches: '18,100', competition: 'Medium', cpc: '$2.40', contentAngle: 'Step-by-step beginner guide with AI tool list', intent: 'Awareness' },
    { keyword: 'AI tools for solopreneurs', monthlySearches: '12,400', competition: 'Low', cpc: '$3.10', contentAngle: 'Top 10 AI tools breakdown with use cases', intent: 'Awareness' },
    { keyword: 'one person business ideas 2025', monthlySearches: '9,900', competition: 'Low', cpc: '$1.80', contentAngle: 'Ideas ranked by AI-leverage potential', intent: 'Awareness' },
    { keyword: 'solopreneur business model', monthlySearches: '8,100', competition: 'Low', cpc: '$2.20', contentAngle: 'Compare 5 solo business models + revenue ceilings', intent: 'Awareness' },
    { keyword: 'AI for content creators', monthlySearches: '22,200', competition: 'High', cpc: '$4.50', contentAngle: 'Focus on monetization angle vs generic productivity', intent: 'Awareness' },
    // Consideration
    { keyword: 'best AI business coaching program', monthlySearches: '3,600', competition: 'Medium', cpc: '$8.90', contentAngle: 'Comparison post with honest pros/cons', intent: 'Consideration' },
    { keyword: 'how to scale a one person business', monthlySearches: '6,600', competition: 'Low', cpc: '$3.40', contentAngle: 'AI automation roadmap for solopreneurs', intent: 'Consideration' },
    { keyword: 'solopreneur coaching program review', monthlySearches: '1,900', competition: 'Low', cpc: '$6.20', contentAngle: 'Transparent review-style sales page', intent: 'Consideration' },
    { keyword: 'AI productivity for entrepreneurs', monthlySearches: '5,400', competition: 'Medium', cpc: '$4.10', contentAngle: 'Before/after workflow case study', intent: 'Consideration' },
    { keyword: 'ChatGPT for business growth', monthlySearches: '14,800', competition: 'High', cpc: '$5.60', contentAngle: 'Niche down to solopreneurs specifically', intent: 'Consideration' },
    { keyword: 'how to build a personal brand with AI', monthlySearches: '4,400', competition: 'Low', cpc: '$3.80', contentAngle: 'Personal brand system using AI content pipeline', intent: 'Consideration' },
    { keyword: 'online business coach for solopreneurs', monthlySearches: '2,900', competition: 'Low', cpc: '$9.10', contentAngle: 'Authority positioning page targeting buyer keywords', intent: 'Consideration' },
    // Decision
    { keyword: 'hire AI business coach', monthlySearches: '1,300', competition: 'Low', cpc: '$14.20', contentAngle: 'Direct landing page with case studies and ROI', intent: 'Decision' },
    { keyword: 'solopreneur mastermind program', monthlySearches: '880', competition: 'Low', cpc: '$11.80', contentAngle: 'Community sales page + cohort scarcity', intent: 'Decision' },
    { keyword: 'AI coaching for online business', monthlySearches: '1,600', competition: 'Low', cpc: '$12.50', contentAngle: 'VSL page showing AI in action for business', intent: 'Decision' },
    { keyword: 'done with you business coaching AI', monthlySearches: '720', competition: 'Low', cpc: '$16.40', contentAngle: 'Differentiate DWY vs DIY course model clearly', intent: 'Decision' },
    { keyword: 'solopreneur revenue system', monthlySearches: '590', competition: 'Low', cpc: '$7.30', contentAngle: 'Framework name + branded system page', intent: 'Decision' },
  ],

  contentGaps: [
    { keyword: 'AI business audit for solopreneurs', opportunity: 'No one offers a free AI audit tool or guide targeted at solo operators', searchVolume: '~400/mo + long-tail' },
    { keyword: 'solopreneur AI tool stack 2025', opportunity: 'High intent, very low competition, tool comparison content missing', searchVolume: '~1,200/mo' },
    { keyword: 'how to replace VA with AI tools', opportunity: 'Massive cost-saving angle, almost no dedicated content exists', searchVolume: '~2,800/mo' },
    { keyword: 'one person business $10k month system', opportunity: 'Exact language audience uses — almost zero optimized content', searchVolume: '~1,900/mo' },
    { keyword: 'AI-powered client acquisition solopreneur', opportunity: 'Growing 3x YoY in searches, zero dominant content pieces', searchVolume: '~900/mo' },
  ],

  pricingTiers: [
    {
      label: 'Budget',
      range: '$97–$497',
      competitors: [
        { name: 'Justin Welsh — LinkedIn OS', price: '$150' },
        { name: 'Dan Koe — Digital Economics', price: '$297' },
        { name: 'Kieran Drew — High Impact Writing', price: '$497' },
      ],
      percentage: 55,
    },
    {
      label: 'Mid-Market',
      range: '$997–$2,000',
      competitors: [
        { name: 'Amy Porterfield — Digital Course Academy', price: '$1,997' },
        { name: 'Pat Flynn — All-Access Pass', price: '$1,497' },
        { name: 'Generic AI Cohorts', price: '$997' },
      ],
      percentage: 75,
    },
    {
      label: 'Premium',
      range: '$3,000–$10,000',
      competitors: [
        { name: 'Tony Robbins — Business Mastery', price: '$5,000' },
        { name: 'Niche Coaching Masterminds', price: '$3,000–$6,000' },
        { name: 'Generic Agency Retainers', price: '$4,000/mo' },
      ],
      percentage: 40,
    },
    {
      label: 'Ultra-Premium',
      range: '$15,000+',
      competitors: [
        { name: 'Hormozi Portfolio / Mentorship', price: '$25,000+' },
        { name: 'High-Ticket Mastermind Groups', price: '$18,000–$50,000' },
      ],
      percentage: 20,
    },
  ],

  pricingTips: [
    {
      tip: 'Anchor High, Then Descend',
      detail: 'Present your highest offer first. Everything else looks affordable by comparison.',
    },
    {
      tip: 'Odd Pricing Signals Value',
      detail: '$1,997 outperforms $2,000. The specificity signals research-backed pricing.',
    },
    {
      tip: 'Bundle for Transformation, Not Features',
      detail: 'Price the outcome ("$10k months in 90 days"), not the deliverables (8 modules + calls).',
    },
    {
      tip: 'Payment Plans Increase Conversion 40%',
      detail: 'Offer 3-pay or 6-pay options. The per-payment amount should still feel premium.',
    },
    {
      tip: 'Scarcity Must Be Real',
      detail: 'Cohort-based pricing with a hard seat limit (12–20 students) justifies premium rates.',
    },
  ],

  pricingOpportunity:
    'The $1,497–$2,997 done-with-you AI coaching slot is almost completely empty in the solopreneur market. Competitors either go low-ticket ($150–$997 self-study) or ultra-high-ticket ($10k+ masterminds). A cohort program at $1,997 with strong AI implementation and accountability fills a real gap — and converts well against both a lower "course" anchor and an aspirational mastermind.',

  lastRefreshed: new Date().toISOString(),
};

// ─── Store ────────────────────────────────────────────────────────────────────

export const useResearchStore = create<ResearchStore>()(
  persist(
    (set) => ({
      research: defaultData,

      setTopic: (topic) =>
        set((state) => ({
          research: { ...state.research, topic, lastRefreshed: new Date().toISOString() },
        })),

      refreshSection: (section) =>
        set((state) => ({
          research: {
            ...state.research,
            [section]: defaultData[section],
            lastRefreshed: new Date().toISOString(),
          },
        })),

      resetToDefaults: () => set({ research: defaultData }),
    }),
    { name: 'solopreneur-research' }
  )
);
