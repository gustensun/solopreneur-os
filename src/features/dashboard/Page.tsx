import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Mic,
  FileText,
  Search,
  Megaphone,
  Package,
  PenTool,
  TrendingUp,
  DollarSign,
  Layers,
  CheckCircle2,
  Circle,
  ArrowRight,
  Sparkles,
  Target,
  Brain,
  Zap,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useContextStore } from '@/stores/context';
import { useIncomeStore } from '@/stores/income';
import { useUserStore } from '@/stores/user';
import { useNicheStore } from '@/stores/niche';
import { useAvatarStore } from '@/stores/avatar';
import { useOfferStore } from '@/stores/offer';
import { useBrandStore } from '@/stores/brand';

// ─── helpers ────────────────────────────────────────────────────────────────

function getGreeting(): string {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

function formatDate(): string {
  return new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date());
}

function formatCurrencyShort(n: number): string {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(2)}M`;
  if (n >= 1_000) return `$${(n / 1_000).toFixed(1)}k`;
  return `$${n.toLocaleString()}`;
}

// ─── radial progress ring ────────────────────────────────────────────────────

function RadialProgress({ score }: { score: number }) {
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;
  const color =
    score >= 80
      ? '#2d6a4f'
      : score >= 50
      ? '#52b788'
      : score >= 25
      ? '#f59e0b'
      : '#e76f51';

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width="128" height="128" className="-rotate-90">
        <circle
          cx="64"
          cy="64"
          r={radius}
          fill="none"
          stroke="#e8f5e9"
          strokeWidth="10"
        />
        <circle
          cx="64"
          cy="64"
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          style={{ transition: 'stroke-dashoffset 0.8s ease' }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-3xl font-bold text-[#1b4332]">{score}</span>
        <span className="text-xs font-medium text-[#52b788]">/ 100</span>
      </div>
    </div>
  );
}

// ─── stagger animation helpers ───────────────────────────────────────────────

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.07 },
  },
};

const item = {
  hidden: { opacity: 0, y: 18 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: 'easeOut' } },
};

// ─── quick action cards ──────────────────────────────────────────────────────

interface QuickAction {
  label: string;
  description: string;
  icon: React.ElementType;
  route: string;
  color: string;
  iconColor: string;
}

const QUICK_ACTIONS: QuickAction[] = [
  {
    label: 'Start AI Call',
    description: 'Voice session with your AI coach',
    icon: Mic,
    route: '/voice-call',
    color: 'from-violet-50 to-violet-100 hover:from-violet-100 hover:to-violet-200',
    iconColor: 'text-violet-600 bg-violet-100',
  },
  {
    label: 'Create Content',
    description: 'Generate posts, scripts & more',
    icon: FileText,
    route: '/projects',
    color: 'from-blue-50 to-blue-100 hover:from-blue-100 hover:to-blue-200',
    iconColor: 'text-blue-600 bg-blue-100',
  },
  {
    label: 'Research Market',
    description: 'Chat with your AI strategist',
    icon: Search,
    route: '/ai-chat',
    color: 'from-emerald-50 to-emerald-100 hover:from-emerald-100 hover:to-emerald-200',
    iconColor: 'text-emerald-600 bg-emerald-100',
  },
  {
    label: 'Generate Ads',
    description: 'Write high-converting ad copy',
    icon: Megaphone,
    route: '/ad-writer',
    color: 'from-orange-50 to-orange-100 hover:from-orange-100 hover:to-orange-200',
    iconColor: 'text-orange-600 bg-orange-100',
  },
  {
    label: 'Build Offer',
    description: 'Design your irresistible offer',
    icon: Package,
    route: '/offer-creator',
    color: 'from-rose-50 to-rose-100 hover:from-rose-100 hover:to-rose-200',
    iconColor: 'text-rose-600 bg-rose-100',
  },
  {
    label: 'Write Copy',
    description: 'Sales pages that convert',
    icon: PenTool,
    route: '/copy-writer',
    color: 'from-amber-50 to-amber-100 hover:from-amber-100 hover:to-amber-200',
    iconColor: 'text-amber-600 bg-amber-100',
  },
];

// ─── seeded activity feed ────────────────────────────────────────────────────

interface ActivityItem {
  id: string;
  label: string;
  time: string;
  icon: React.ElementType;
  iconColor: string;
}

const RECENT_ACTIVITY: ActivityItem[] = [
  {
    id: '1',
    label: 'Updated income streams — monthly revenue refreshed',
    time: '2 hours ago',
    icon: DollarSign,
    iconColor: 'text-emerald-600 bg-emerald-50',
  },
  {
    id: '2',
    label: 'Refined niche statement for wealth market',
    time: 'Yesterday',
    icon: Target,
    iconColor: 'text-blue-600 bg-blue-50',
  },
  {
    id: '3',
    label: 'Added Brand Voice Expert skill profile',
    time: '2 days ago',
    icon: Brain,
    iconColor: 'text-violet-600 bg-violet-50',
  },
  {
    id: '4',
    label: 'Offer price updated — AI Business Accelerator',
    time: '3 days ago',
    icon: Package,
    iconColor: 'text-rose-600 bg-rose-50',
  },
  {
    id: '5',
    label: 'Completed avatar profile for Alex the Ambitious Creator',
    time: '4 days ago',
    icon: Sparkles,
    iconColor: 'text-amber-600 bg-amber-50',
  },
];

// ─── component ───────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const navigate = useNavigate();
  const { user } = useUserStore();
  const { getMonthlyTotal, getAnnualProjection, streams } = useIncomeStore();
  const { getContextScore, getContextSections } = useContextStore();
  const { niche } = useNicheStore();
  const { getDefaultAvatar } = useAvatarStore();
  const { offer } = useOfferStore();
  const { brand } = useBrandStore();

  const score = useMemo(() => getContextScore(), [getContextScore]);
  const sections = useMemo(() => getContextSections(), [getContextSections]);
  const monthlyTotal = useMemo(() => getMonthlyTotal(), [getMonthlyTotal]);
  const annualProjection = useMemo(
    () => getAnnualProjection(),
    [getAnnualProjection]
  );
  const activeStreams = useMemo(
    () => streams.filter((s) => s.active).length,
    [streams]
  );

  const avatar = getDefaultAvatar();

  // Business completion checklist
  const checklistItems = useMemo(
    () => [
      {
        id: 'niche',
        label: 'Define your niche statement',
        done: !!(niche.group && niche.outcome && niche.benefit && niche.pain),
        route: '/niche-statement',
      },
      {
        id: 'avatar',
        label: 'Build your customer avatar',
        done: !!(avatar && avatar.name && avatar.goals),
        route: '/avatar-architect',
      },
      {
        id: 'offer',
        label: 'Create your core offer',
        done: !!(offer.name && offer.price),
        route: '/offer-creator',
      },
      {
        id: 'brand',
        label: 'Build your personal brand',
        done: brand.progress >= 30,
        route: '/personal-brand',
      },
      {
        id: 'income',
        label: 'Set up income streams',
        done: streams.length > 0,
        route: '/income-streams',
      },
      {
        id: 'content',
        label: 'Publish first content piece',
        done: false,
        route: '/projects',
      },
      {
        id: 'client',
        label: 'Close your first client',
        done: false,
        route: '/clients',
      },
      {
        id: 'skill',
        label: 'Configure an AI skill',
        done: true,
        route: '/skills',
      },
    ],
    [niche, avatar, offer, brand, streams]
  );

  const checklistDone = checklistItems.filter((i) => i.done).length;
  const checklistPct = Math.round((checklistDone / checklistItems.length) * 100);

  return (
    <div className="min-h-full bg-background px-4 pb-12 pt-6 md:px-8">
      {/* ── Welcome header ── */}
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="mb-8"
      >
        <p className="text-sm font-medium text-[#52b788]">{formatDate()}</p>
        <h1 className="mt-0.5 text-2xl sm:text-3xl font-bold tracking-tight text-[#1b4332]">
          {getGreeting()}, {user.name?.split(' ')[0] || 'Solopreneur'} 👋
        </h1>
        <p className="mt-1 text-sm text-[#6b7280]">
          Your business OS is ready. Here&apos;s where you stand today.
        </p>
      </motion.div>

      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="grid gap-6 lg:grid-cols-3"
      >
        {/* ── Left column ── */}
        <div className="flex flex-col gap-6 lg:col-span-2">
          {/* Revenue stat cards */}
          <motion.div variants={item} className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Monthly Revenue */}
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#2d6a4f] to-[#1b4332] p-5 text-white shadow-md">
              <div className="mb-3 flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/20">
                  <DollarSign className="h-4 w-4" />
                </div>
                <span className="text-xs font-medium uppercase tracking-wide text-white/70">
                  Monthly Revenue
                </span>
              </div>
              <p className="text-2xl font-bold">
                {formatCurrencyShort(monthlyTotal)}
              </p>
              <p className="mt-0.5 text-xs text-white/60">Active income</p>
              <div className="absolute -bottom-4 -right-4 h-20 w-20 rounded-full bg-white/5" />
            </div>

            {/* Annual Projection */}
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#52b788] to-[#40916c] p-5 text-white shadow-md">
              <div className="mb-3 flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/20">
                  <TrendingUp className="h-4 w-4" />
                </div>
                <span className="text-xs font-medium uppercase tracking-wide text-white/70">
                  Annual Run Rate
                </span>
              </div>
              <p className="text-2xl font-bold">
                {formatCurrencyShort(annualProjection)}
              </p>
              <p className="mt-0.5 text-xs text-white/60">At current pace</p>
              <div className="absolute -bottom-4 -right-4 h-20 w-20 rounded-full bg-white/5" />
            </div>

            {/* Active Streams */}
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#74c69d] to-[#52b788] p-5 text-white shadow-md">
              <div className="mb-3 flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/20">
                  <Layers className="h-4 w-4" />
                </div>
                <span className="text-xs font-medium uppercase tracking-wide text-white/70">
                  Active Streams
                </span>
              </div>
              <p className="text-2xl font-bold">{activeStreams}</p>
              <p className="mt-0.5 text-xs text-white/60">Income sources</p>
              <div className="absolute -bottom-4 -right-4 h-20 w-20 rounded-full bg-white/5" />
            </div>
          </motion.div>

          {/* Quick Actions Grid */}
          <motion.div variants={item}>
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-[#6b7280]">
                Quick Actions
              </h2>
              <Zap className="h-4 w-4 text-[#52b788]" />
            </div>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {QUICK_ACTIONS.map((action) => {
                const Icon = action.icon;
                return (
                  <button
                    key={action.label}
                    onClick={() => navigate(action.route)}
                    className={cn(
                      'group flex flex-col gap-3 rounded-2xl bg-gradient-to-br p-4 text-left shadow-sm transition-all duration-200 hover:shadow-md hover:-translate-y-0.5',
                      action.color
                    )}
                  >
                    <div
                      className={cn(
                        'flex h-9 w-9 items-center justify-center rounded-xl',
                        action.iconColor
                      )}
                    >
                      <Icon className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-[#1b4332]">
                        {action.label}
                      </p>
                      <p className="mt-0.5 text-xs text-[#6b7280]">
                        {action.description}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </motion.div>

          {/* Business Completion Checklist */}
          <motion.div
            variants={item}
            className="rounded-2xl border border-[#e8f5e9] bg-white p-6 shadow-sm"
          >
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="text-base font-semibold text-[#1b4332]">
                  Business Setup Checklist
                </h2>
                <p className="mt-0.5 text-xs text-[#6b7280]">
                  {checklistDone} of {checklistItems.length} completed
                </p>
              </div>
              <span className="rounded-full bg-[#d8f3dc] px-3 py-1 text-sm font-semibold text-[#2d6a4f]">
                {checklistPct}%
              </span>
            </div>

            {/* Progress bar */}
            <div className="mb-5 h-2 w-full overflow-hidden rounded-full bg-[#f0fdf4]">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${checklistPct}%` }}
                transition={{ duration: 0.8, delay: 0.3, ease: 'easeOut' }}
                className="h-full rounded-full bg-gradient-to-r from-[#52b788] to-[#2d6a4f]"
              />
            </div>

            <div className="space-y-2.5">
              {checklistItems.map((ci) => (
                <div
                  key={ci.id}
                  className="flex items-center gap-3 rounded-xl p-2 transition-colors hover:bg-[#f0fdf4]"
                >
                  {ci.done ? (
                    <CheckCircle2 className="h-5 w-5 flex-shrink-0 text-[#52b788]" />
                  ) : (
                    <Circle className="h-5 w-5 flex-shrink-0 text-[#d1d5db]" />
                  )}
                  <span
                    className={cn(
                      'flex-1 text-sm',
                      ci.done
                        ? 'text-[#6b7280] line-through'
                        : 'font-medium text-[#374151]'
                    )}
                  >
                    {ci.label}
                  </span>
                  {!ci.done && (
                    <button
                      onClick={() => navigate(ci.route)}
                      className="flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-medium text-[#52b788] hover:bg-[#d8f3dc] transition-colors"
                    >
                      Start <ArrowRight className="h-3 w-3" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* ── Right column ── */}
        <div className="flex flex-col gap-6">
          {/* Context Score Card */}
          <motion.div
            variants={item}
            className="rounded-2xl border border-[#e8f5e9] bg-white p-6 shadow-sm"
          >
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-base font-semibold text-[#1b4332]">
                Context Score
              </h2>
              <button
                onClick={() => navigate('/context')}
                className="flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-medium text-[#52b788] hover:bg-[#d8f3dc] transition-colors"
              >
                View all <ArrowRight className="h-3 w-3" />
              </button>
            </div>

            <div className="flex flex-col items-center">
              <RadialProgress score={score} />
              <p className="mt-3 text-center text-sm font-medium text-[#1b4332]">
                {score >= 85
                  ? 'Excellent — AI context is rich'
                  : score >= 60
                  ? 'Good — a few sections remain'
                  : score >= 30
                  ? 'Building — keep going!'
                  : 'Just started — let\'s build your OS'}
              </p>
              <p className="mt-1 text-center text-xs text-[#6b7280]">
                Business context injected into every AI tool
              </p>
            </div>

            <div className="mt-5 space-y-2">
              {sections.map((s) => (
                <div key={s.key} className="flex items-center gap-2">
                  {s.filled ? (
                    <CheckCircle2 className="h-4 w-4 flex-shrink-0 text-[#52b788]" />
                  ) : (
                    <Circle className="h-4 w-4 flex-shrink-0 text-[#d1d5db]" />
                  )}
                  <span
                    className={cn(
                      'flex-1 text-xs',
                      s.filled ? 'text-[#374151]' : 'text-[#9ca3af]'
                    )}
                  >
                    {s.label}
                  </span>
                  {!s.filled && (
                    <button
                      onClick={() => navigate(s.route)}
                      className="rounded px-1.5 py-0.5 text-[10px] font-medium text-[#52b788] hover:bg-[#d8f3dc] transition-colors"
                    >
                      Fix
                    </button>
                  )}
                </div>
              ))}
            </div>
          </motion.div>

          {/* Recent Activity */}
          <motion.div
            variants={item}
            className="rounded-2xl border border-[#e8f5e9] bg-white p-6 shadow-sm"
          >
            <h2 className="mb-4 text-base font-semibold text-[#1b4332]">
              Recent Activity
            </h2>
            <div className="space-y-3">
              {RECENT_ACTIVITY.map((activity) => {
                const Icon = activity.icon;
                return (
                  <div key={activity.id} className="flex items-start gap-3">
                    <div
                      className={cn(
                        'mt-0.5 flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg',
                        activity.iconColor
                      )}
                    >
                      <Icon className="h-3.5 w-3.5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-medium leading-snug text-[#374151]">
                        {activity.label}
                      </p>
                      <p className="mt-0.5 text-[10px] text-[#9ca3af]">
                        {activity.time}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
