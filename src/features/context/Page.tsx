import { useState, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  CheckCircle2,
  Circle,
  Copy,
  Check,
  ArrowRight,
  Target,
  Users,
  Package,
  Palette,
  DollarSign,
  Brain,
  Sparkles,
  Info,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useContextStore } from '@/stores/context';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

// ─── helpers ─────────────────────────────────────────────────────────────────

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.07 } },
};

const item = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: 'easeOut' } },
};

function ScoreRing({ score }: { score: number }) {
  const radius = 44;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
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
      <svg width="104" height="104" className="-rotate-90">
        <circle cx="52" cy="52" r={radius} fill="none" stroke="#e8f5e9" strokeWidth="9" />
        <circle
          cx="52"
          cy="52"
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth="9"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ transition: 'stroke-dashoffset 0.8s ease' }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-2xl font-bold text-[#1b4332]">{score}</span>
        <span className="text-[10px] font-semibold uppercase tracking-wide text-[#52b788]">
          score
        </span>
      </div>
    </div>
  );
}

function completionBadge(pct: number) {
  if (pct === 100)
    return (
      <Badge className="bg-[#d8f3dc] text-[#2d6a4f] hover:bg-[#d8f3dc]">
        Complete
      </Badge>
    );
  if (pct >= 50)
    return (
      <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100">
        In Progress
      </Badge>
    );
  return (
    <Badge className="bg-rose-100 text-rose-600 hover:bg-rose-100">
      Incomplete
    </Badge>
  );
}

// ─── section icon map ─────────────────────────────────────────────────────────

const SECTION_META: Record<
  string,
  { icon: React.ElementType; iconColor: string; tip: string }
> = {
  user: {
    icon: Users,
    iconColor: 'text-violet-600 bg-violet-50',
    tip: 'Your name and profile used to personalize every AI output.',
  },
  niche: {
    icon: Target,
    iconColor: 'text-blue-600 bg-blue-50',
    tip: 'The specific market segment and outcome you serve — the anchor for all positioning.',
  },
  avatar: {
    icon: Users,
    iconColor: 'text-emerald-600 bg-emerald-50',
    tip: 'The deep psychological profile of your ideal customer.',
  },
  offer: {
    icon: Package,
    iconColor: 'text-rose-600 bg-rose-50',
    tip: 'Your core product or service with price — used to personalize copy and strategy.',
  },
  income: {
    icon: DollarSign,
    iconColor: 'text-green-600 bg-green-50',
    tip: 'Your active revenue streams — helps AI give relevant financial advice.',
  },
  brand: {
    icon: Palette,
    iconColor: 'text-amber-600 bg-amber-50',
    tip: 'Your mission, values, and tone of voice — shapes the style of every AI response.',
  },
  skills: {
    icon: Brain,
    iconColor: 'text-indigo-600 bg-indigo-50',
    tip: 'Specialized AI skill profiles that power your tools.',
  },
};

// ─── main component ───────────────────────────────────────────────────────────

export default function ContextHubPage() {
  const navigate = useNavigate();
  const { getContextScore, getContextSections, getContextString, customContext, addCustomContext } =
    useContextStore();

  const [copiedContext, setCopiedContext] = useState(false);
  const [localCustom, setLocalCustom] = useState<string>(customContext);
  const [savedCustom, setSavedCustom] = useState(false);

  const score = useMemo(() => getContextScore(), [getContextScore]);
  const sections = useMemo(() => getContextSections(), [getContextSections]);
  const contextString = useMemo(() => getContextString(), [getContextString]);

  const handleCopyContext = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(contextString);
      setCopiedContext(true);
      setTimeout(() => setCopiedContext(false), 2000);
    } catch {
      // fallback: select the textarea
    }
  }, [contextString]);

  const handleSaveCustom = useCallback(() => {
    addCustomContext(localCustom);
    setSavedCustom(true);
    setTimeout(() => setSavedCustom(false), 2000);
  }, [localCustom, addCustomContext]);

  const filledCount = sections.filter((s) => s.filled).length;

  return (
    <div className="min-h-full bg-background px-4 pb-12 pt-6 md:px-8">
      {/* ── Page header ── */}
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="mb-8"
      >
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-[#52b788]" />
          <h1 className="text-2xl font-bold tracking-tight text-[#1b4332]">
            Context Hub
          </h1>
        </div>
        <p className="mt-1 text-sm text-[#6b7280]">
          Your business context layer — everything that gets injected into every AI tool.
          The richer this is, the smarter your AI.
        </p>
      </motion.div>

      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="grid gap-6 lg:grid-cols-3"
      >
        {/* ── Left / main ── */}
        <div className="flex flex-col gap-6 lg:col-span-2">
          {/* Context sections grid */}
          <motion.div variants={item}>
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-[#6b7280]">
              Context Sections
            </h2>
            <div className="grid gap-3 sm:grid-cols-2">
              {sections.map((section) => {
                const meta = SECTION_META[section.key] ?? {
                  icon: Brain,
                  iconColor: 'text-gray-600 bg-gray-50',
                  tip: '',
                };
                const Icon = meta.icon;
                const pct = section.filled ? 100 : 0;

                return (
                  <div
                    key={section.key}
                    className={cn(
                      'group relative flex flex-col gap-3 rounded-2xl border bg-white p-5 shadow-sm transition-all duration-200 hover:shadow-md',
                      section.filled
                        ? 'border-[#e8f5e9]'
                        : 'border-[#fee2e2]'
                    )}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2.5">
                        <div
                          className={cn(
                            'flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl',
                            meta.iconColor
                          )}
                        >
                          <Icon className="h-4 w-4" />
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <p className="text-sm font-semibold text-[#1b4332]">
                              {section.label}
                            </p>
                            {meta.tip && (
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Info className="h-3.5 w-3.5 cursor-help text-[#9ca3af]" />
                                </TooltipTrigger>
                                <TooltipContent
                                  side="top"
                                  className="max-w-[220px] text-xs"
                                >
                                  {meta.tip}
                                </TooltipContent>
                              </Tooltip>
                            )}
                          </div>
                        </div>
                      </div>
                      {completionBadge(pct)}
                    </div>

                    {/* Value preview */}
                    <div className="min-h-[2.5rem] rounded-xl bg-[#f9fafb] px-3 py-2">
                      {section.value ? (
                        <p className="text-xs leading-relaxed text-[#374151]">
                          {section.value}
                        </p>
                      ) : (
                        <p className="text-xs italic text-[#9ca3af]">
                          Not yet filled in
                        </p>
                      )}
                    </div>

                    {/* Status row */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        {section.filled ? (
                          <CheckCircle2 className="h-4 w-4 text-[#52b788]" />
                        ) : (
                          <Circle className="h-4 w-4 text-[#d1d5db]" />
                        )}
                        <span className="text-xs text-[#6b7280]">
                          {section.filled ? 'Filled' : 'Missing data'}
                        </span>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => navigate(section.route)}
                        className="h-7 gap-1 rounded-lg px-2.5 text-xs font-medium text-[#52b788] hover:bg-[#d8f3dc] hover:text-[#2d6a4f]"
                      >
                        {section.filled ? 'Edit' : 'Complete'}
                        <ArrowRight className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>

          {/* Context String Preview */}
          <motion.div
            variants={item}
            className="rounded-2xl border border-[#e8f5e9] bg-white p-6 shadow-sm"
          >
            <div className="mb-3 flex items-center justify-between">
              <div>
                <h2 className="text-base font-semibold text-[#1b4332]">
                  Context String Preview
                </h2>
                <p className="mt-0.5 text-xs text-[#6b7280]">
                  This exact text is injected into every AI tool prompt
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleCopyContext}
                className="gap-2 border-[#e8f5e9] text-[#2d6a4f] hover:bg-[#d8f3dc] hover:border-[#52b788]"
              >
                {copiedContext ? (
                  <>
                    <Check className="h-3.5 w-3.5 text-[#52b788]" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="h-3.5 w-3.5" />
                    Copy Context
                  </>
                )}
              </Button>
            </div>
            <Textarea
              readOnly
              value={contextString}
              className="min-h-[260px] resize-none rounded-xl border-[#e8f5e9] bg-[#f9fafb] font-mono text-xs leading-relaxed text-[#374151] focus-visible:ring-[#52b788]"
            />
          </motion.div>

          {/* Custom Context */}
          <motion.div
            variants={item}
            className="rounded-2xl border border-[#e8f5e9] bg-white p-6 shadow-sm"
          >
            <div className="mb-1 flex items-center gap-2">
              <h2 className="text-base font-semibold text-[#1b4332]">
                Custom Context
              </h2>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Info className="h-3.5 w-3.5 cursor-help text-[#9ca3af]" />
                </TooltipTrigger>
                <TooltipContent side="top" className="max-w-[260px] text-xs">
                  Add extra context that doesn&apos;t fit elsewhere — recent wins,
                  specific constraints, personal preferences, or anything your AI
                  should always know.
                </TooltipContent>
              </Tooltip>
            </div>
            <p className="mb-3 text-xs text-[#6b7280]">
              Add any extra information you want injected into every AI conversation — recent wins, constraints, preferences, or notes.
            </p>
            <Textarea
              value={localCustom}
              onChange={(e) => setLocalCustom(e.target.value)}
              placeholder="e.g. I am currently focused on growing my YouTube channel to 10k subs. My main constraint is 2 hours per day. I prefer concise, direct responses. Recent win: just landed a $5k client."
              className="min-h-[120px] resize-none rounded-xl border-[#e8f5e9] text-sm text-[#374151] placeholder:text-[#9ca3af] focus-visible:ring-[#52b788]"
            />
            <div className="mt-3 flex items-center justify-between">
              <p className="text-xs text-[#9ca3af]">
                {localCustom.length} characters
              </p>
              <div className="flex gap-2">
                {localCustom && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setLocalCustom('')}
                    className="h-8 text-xs text-[#9ca3af] hover:text-[#374151]"
                  >
                    Clear
                  </Button>
                )}
                <Button
                  size="sm"
                  onClick={handleSaveCustom}
                  disabled={localCustom === customContext}
                  className="h-8 gap-1.5 bg-[#2d6a4f] text-xs text-white hover:bg-[#1b4332] disabled:opacity-40"
                >
                  {savedCustom ? (
                    <>
                      <Check className="h-3.5 w-3.5" /> Saved
                    </>
                  ) : (
                    'Save Context'
                  )}
                </Button>
              </div>
            </div>
          </motion.div>
        </div>

        {/* ── Right sidebar ── */}
        <div className="flex flex-col gap-6">
          {/* Score card */}
          <motion.div
            variants={item}
            className="rounded-2xl border border-[#e8f5e9] bg-white p-6 shadow-sm"
          >
            <h2 className="mb-4 text-base font-semibold text-[#1b4332]">
              Overall Score
            </h2>
            <div className="flex flex-col items-center text-center">
              <ScoreRing score={score} />
              <p className="mt-3 text-sm font-semibold text-[#1b4332]">
                {score >= 85
                  ? 'Exceptional context'
                  : score >= 60
                  ? 'Good — almost there'
                  : score >= 30
                  ? 'Building momentum'
                  : 'Just getting started'}
              </p>
              <p className="mt-1 text-xs text-[#6b7280]">
                {filledCount} of {sections.length} sections filled
              </p>
            </div>

            {/* Mini breakdown */}
            <div className="mt-5 space-y-2.5">
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
                      className="rounded px-1.5 py-0.5 text-[10px] font-semibold text-[#52b788] hover:bg-[#d8f3dc] transition-colors"
                    >
                      Fix
                    </button>
                  )}
                </div>
              ))}
            </div>
          </motion.div>

          {/* Why context matters */}
          <motion.div
            variants={item}
            className="rounded-2xl border border-[#e8f5e9] bg-gradient-to-br from-[#f0fdf4] to-[#d8f3dc] p-6 shadow-sm"
          >
            <div className="mb-3 flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-[#2d6a4f]" />
              <h3 className="text-sm font-semibold text-[#1b4332]">
                Why this matters
              </h3>
            </div>
            <div className="space-y-3 text-xs leading-relaxed text-[#374151]">
              <p>
                Every time you use an AI tool in this OS — chat, content, ads,
                copy — your full business context is silently injected into the
                prompt.
              </p>
              <p>
                This means the AI already knows your niche, your customer, your
                offer, and your voice before you type a single word.
              </p>
              <p className="font-medium text-[#2d6a4f]">
                A score above 80 means your AI operates like a business partner
                who has studied your brand for months.
              </p>
            </div>
          </motion.div>

          {/* Tips */}
          <motion.div
            variants={item}
            className="rounded-2xl border border-[#e8f5e9] bg-white p-5 shadow-sm"
          >
            <h3 className="mb-3 text-sm font-semibold text-[#1b4332]">
              Quick Tips
            </h3>
            <ul className="space-y-2.5">
              {[
                'Complete your Niche Statement first — it anchors everything.',
                'Your Avatar drives tone and empathy in every piece of copy.',
                'A complete Offer lets AI pre-load your price and promise.',
                'Add custom context for constraints AI should always respect.',
              ].map((tip, i) => (
                <li key={i} className="flex gap-2 text-xs leading-relaxed text-[#6b7280]">
                  <span className="mt-0.5 flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-full bg-[#d8f3dc] text-[10px] font-bold text-[#2d6a4f]">
                    {i + 1}
                  </span>
                  {tip}
                </li>
              ))}
            </ul>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
