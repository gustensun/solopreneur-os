import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BarChart2,
  Users,
  Brain,
  Search,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Minus,
  RefreshCw,
  Download,
  ChevronRight,
  AlertCircle,
  CheckCircle2,
  Zap,
  Target,
} from 'lucide-react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { useResearchStore } from '@/stores/research';
import type {
  CompetitorProfile,
  KeywordIntent,
  CompetitionLevel,
  PricingTier,
} from '@/stores/research';

// ─── Motion helpers ───────────────────────────────────────────────────────────

const fadeIn = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -8 },
  transition: { duration: 0.25, ease: 'easeOut' },
};

const stagger = {
  animate: { transition: { staggerChildren: 0.06 } },
};

const childFade = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.2 },
};

// ─── Shared sub-components ────────────────────────────────────────────────────

function SectionHeader({
  title,
  description,
  onRefresh,
}: {
  title: string;
  description?: string;
  onRefresh?: () => void;
}) {
  return (
    <div className="flex items-start justify-between gap-4 mb-6">
      <div>
        <h2 className="text-lg font-semibold text-foreground">{title}</h2>
        {description && <p className="text-sm text-muted-foreground mt-0.5">{description}</p>}
      </div>
      {onRefresh && (
        <Button variant="outline" size="sm" onClick={onRefresh} className="shrink-0 gap-1.5">
          <RefreshCw className="h-3.5 w-3.5" />
          Refresh
        </Button>
      )}
    </div>
  );
}

function ViabilityBadge({ score }: { score: number }) {
  const color =
    score >= 75
      ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
      : score >= 50
      ? 'bg-yellow-100 text-yellow-800 border-yellow-200'
      : 'bg-red-100 text-red-800 border-red-200';
  const label = score >= 75 ? 'Strong Opportunity' : score >= 50 ? 'Viable' : 'High Risk';
  return (
    <span className={cn('inline-flex items-center gap-1 rounded-full border px-3 py-0.5 text-xs font-semibold', color)}>
      {label}
    </span>
  );
}

function CompetitionBadge({ level }: { level: CompetitionLevel }) {
  const styles: Record<CompetitionLevel, string> = {
    Low: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    Medium: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    High: 'bg-red-100 text-red-800 border-red-200',
  };
  return (
    <span className={cn('inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold', styles[level])}>
      {level}
    </span>
  );
}

function OpportunityRatingBadge({ rating }: { rating: 'High' | 'Medium' | 'Low' }) {
  const styles = {
    High: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    Medium: 'bg-blue-100 text-blue-800 border-blue-200',
    Low: 'bg-slate-100 text-slate-600 border-slate-200',
  };
  return (
    <span className={cn('inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold', styles[rating])}>
      {rating}
    </span>
  );
}

function IntensityBar({ label, intensity, color = 'bg-primary' }: { label: string; intensity: number; color?: string }) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <span className="text-sm text-foreground">{label}</span>
        <span className="text-xs font-medium text-muted-foreground">{intensity}%</span>
      </div>
      <div className="h-2 w-full rounded-full bg-secondary overflow-hidden">
        <motion.div
          className={cn('h-full rounded-full', color)}
          initial={{ width: 0 }}
          animate={{ width: `${intensity}%` }}
          transition={{ duration: 0.7, ease: 'easeOut', delay: 0.1 }}
        />
      </div>
    </div>
  );
}

// ─── Tab 1: Niche Analysis ────────────────────────────────────────────────────

function NicheAnalysisTab() {
  const { research, setTopic, refreshSection } = useResearchStore();
  const { nicheAnalysis, topic } = research;
  const [inputValue, setInputValue] = useState(topic);

  const handleAnalyze = () => {
    setTopic(inputValue);
  };

  const trendIcon =
    nicheAnalysis.trendDirection === 'growing' ? (
      <TrendingUp className="h-4 w-4 text-emerald-600" />
    ) : nicheAnalysis.trendDirection === 'declining' ? (
      <TrendingDown className="h-4 w-4 text-red-500" />
    ) : (
      <Minus className="h-4 w-4 text-yellow-600" />
    );

  const trendColor =
    nicheAnalysis.trendDirection === 'growing'
      ? 'text-emerald-700 bg-emerald-50 border-emerald-200'
      : nicheAnalysis.trendDirection === 'declining'
      ? 'text-red-700 bg-red-50 border-red-200'
      : 'text-yellow-700 bg-yellow-50 border-yellow-200';

  const viabilityColor =
    nicheAnalysis.viabilityScore >= 75
      ? 'text-emerald-700'
      : nicheAnalysis.viabilityScore >= 50
      ? 'text-yellow-700'
      : 'text-red-700';

  const viabilityRingColor =
    nicheAnalysis.viabilityScore >= 75
      ? '#10b981'
      : nicheAnalysis.viabilityScore >= 50
      ? '#f59e0b'
      : '#ef4444';

  const circumference = 2 * Math.PI * 46;
  const offset = circumference - (nicheAnalysis.viabilityScore / 100) * circumference;

  return (
    <motion.div {...fadeIn} className="space-y-6">
      {/* Topic Input */}
      <div className="glass-card p-5">
        <SectionHeader
          title="Research Topic"
          description="Describe your niche or market to analyze its viability"
        />
        <div className="flex flex-col sm:flex-row gap-3">
          <Textarea
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="e.g. AI Business Coaching for Solopreneurs"
            className="resize-none h-20 bg-background"
          />
          <Button onClick={handleAnalyze} className="shrink-0 sm:self-end">
            <Zap className="h-4 w-4 mr-2" />
            Analyze
          </Button>
        </div>
      </div>

      {/* Viability Score + Key Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Viability Score Card */}
        <div className="glass-card p-6 flex flex-col items-center justify-center gap-3">
          <div className="relative w-28 h-28">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 110 110">
              <circle cx="55" cy="55" r="46" fill="none" stroke="#e5e7eb" strokeWidth="8" />
              <circle
                cx="55"
                cy="55"
                r="46"
                fill="none"
                stroke={viabilityRingColor}
                strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={offset}
                className="transition-all duration-700"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className={cn('text-3xl font-bold', viabilityColor)}>{nicheAnalysis.viabilityScore}</span>
              <span className="text-xs text-muted-foreground">/ 100</span>
            </div>
          </div>
          <div className="text-center">
            <p className="font-semibold text-foreground">Niche Viability Score</p>
            <ViabilityBadge score={nicheAnalysis.viabilityScore} />
          </div>
          <p className="text-xs text-muted-foreground text-center leading-relaxed">{nicheAnalysis.viabilityReason}</p>
        </div>

        {/* Metrics Grid */}
        <div className="lg:col-span-2 grid grid-cols-2 gap-4">
          {/* Market Size */}
          <div className="glass-card p-5 space-y-1">
            <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium">Market Size</p>
            <p className="text-2xl font-bold text-foreground">{nicheAnalysis.marketSize}</p>
            <p className="text-xs text-muted-foreground leading-relaxed">{nicheAnalysis.marketSizeDetail}</p>
          </div>

          {/* Competition Level */}
          <div className="glass-card p-5 space-y-2">
            <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium">Competition Level</p>
            <div className="flex items-center gap-2">
              <span className="text-xl font-bold text-foreground">{nicheAnalysis.competitionLevel}</span>
              <CompetitionBadge level={nicheAnalysis.competitionLevel} />
            </div>
            <div className="space-y-1">
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Low</span><span>High</span>
              </div>
              <Progress value={nicheAnalysis.competitionScore} className="h-2" />
            </div>
          </div>

          {/* Monetization */}
          <div className="glass-card p-5 space-y-2">
            <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium">Monetization Potential</p>
            <p className="text-2xl font-bold text-foreground">{nicheAnalysis.monetizationScore}<span className="text-sm text-muted-foreground font-normal"> / 100</span></p>
            <Progress value={nicheAnalysis.monetizationScore} className="h-2" />
          </div>

          {/* Trend */}
          <div className="glass-card p-5 space-y-1">
            <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium">Trend Direction</p>
            <div className={cn('inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-sm font-semibold capitalize mt-1', trendColor)}>
              {trendIcon}
              {nicheAnalysis.trendDirection}
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed pt-1">{nicheAnalysis.trendDetail}</p>
          </div>
        </div>
      </div>

      {/* Sub-niches */}
      <div className="glass-card p-5">
        <SectionHeader
          title="Top Sub-Niches to Explore"
          description="High-potential adjacent markets within your niche"
          onRefresh={() => refreshSection('nicheAnalysis')}
        />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {nicheAnalysis.subNiches.map((niche, i) => (
            <div key={i} className="rounded-lg border border-border/70 bg-background/60 p-4 flex items-start gap-3">
              <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                {i + 1}
              </div>
              <p className="text-sm text-foreground leading-relaxed">{niche}</p>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

// ─── Tab 2: Competitor Intel ──────────────────────────────────────────────────

function CompetitorCard({ competitor }: { competitor: CompetitorProfile }) {
  return (
    <motion.div variants={childFade} className="glass-card p-5 space-y-4">
      <div className="flex items-start justify-between gap-2">
        <div>
          <h3 className="font-semibold text-foreground text-sm">{competitor.name}</h3>
          <p className="text-xs text-muted-foreground">{competitor.offerType}</p>
        </div>
        <span className="shrink-0 rounded-full border border-border/70 bg-secondary/60 px-2.5 py-0.5 text-xs font-medium text-foreground">
          {competitor.pricePoint}
        </span>
      </div>

      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <Users className="h-3.5 w-3.5 shrink-0" />
        <span>{competitor.audienceSize}</span>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <p className="text-xs font-medium text-emerald-700 mb-1.5 flex items-center gap-1">
            <CheckCircle2 className="h-3 w-3" /> Strengths
          </p>
          <ul className="space-y-0.5">
            {competitor.strengths.map((s, i) => (
              <li key={i} className="text-xs text-muted-foreground">• {s}</li>
            ))}
          </ul>
        </div>
        <div>
          <p className="text-xs font-medium text-red-600 mb-1.5 flex items-center gap-1">
            <AlertCircle className="h-3 w-3" /> Weaknesses
          </p>
          <ul className="space-y-0.5">
            {competitor.weaknesses.map((w, i) => (
              <li key={i} className="text-xs text-muted-foreground">• {w}</li>
            ))}
          </ul>
        </div>
      </div>

      <div className="rounded-lg bg-primary/5 border border-primary/15 p-3">
        <p className="text-xs font-medium text-primary mb-1">Opportunity Gap</p>
        <p className="text-xs text-foreground/80 leading-relaxed">{competitor.opportunityGap}</p>
      </div>
    </motion.div>
  );
}

function CompetitorIntelTab() {
  const { research, refreshSection } = useResearchStore();
  const { competitors, opportunityMatrix } = research;

  return (
    <motion.div {...fadeIn} className="space-y-6">
      {/* Competitor Grid */}
      <div className="glass-card p-5">
        <SectionHeader
          title="Competitor Profiles"
          description="In-depth breakdown of 6 key players in the solopreneur coaching space"
          onRefresh={() => refreshSection('competitors')}
        />
        <motion.div
          variants={stagger}
          initial="initial"
          animate="animate"
          className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4"
        >
          {competitors.map((c) => (
            <CompetitorCard key={c.id} competitor={c} />
          ))}
        </motion.div>
      </div>

      {/* Opportunity Matrix */}
      <div className="glass-card p-5">
        <SectionHeader
          title="Opportunity Matrix"
          description="Where the real gaps are — ranked by strategic value"
          onRefresh={() => refreshSection('opportunityMatrix')}
        />
        <div className="space-y-3">
          {opportunityMatrix.map((row, i) => (
            <motion.div
              key={i}
              variants={childFade}
              initial="initial"
              animate="animate"
              className="flex items-start gap-4 rounded-lg border border-border/60 bg-background/60 p-4"
            >
              <div className="shrink-0 mt-0.5">
                <OpportunityRatingBadge rating={row.rating} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground">{row.dimension}</p>
                <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{row.gap}</p>
              </div>
              <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground/50 mt-0.5" />
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

// ─── Tab 3: Audience Psychology ───────────────────────────────────────────────

function AudiencePsychologyTab() {
  const { research, refreshSection } = useResearchStore();
  const { audiencePsychology } = research;

  return (
    <motion.div {...fadeIn} className="space-y-6">
      {/* Fears & Desires */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="glass-card p-5">
          <SectionHeader title="Core Fears" description="What keeps them up at night" />
          <div className="space-y-4">
            {audiencePsychology.coreFears.map((f, i) => (
              <IntensityBar key={i} label={f.label} intensity={f.intensity} color="bg-red-400" />
            ))}
          </div>
        </div>
        <div className="glass-card p-5">
          <SectionHeader title="Burning Desires" description="What they desperately want" />
          <div className="space-y-4">
            {audiencePsychology.burningDesires.map((d, i) => (
              <IntensityBar key={i} label={d.label} intensity={d.intensity} color="bg-emerald-500" />
            ))}
          </div>
        </div>
      </div>

      {/* Frustrations + Aspirational Identity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="glass-card p-5">
          <SectionHeader
            title="Daily Frustrations"
            description="The recurring pain they experience"
            onRefresh={() => refreshSection('audiencePsychology')}
          />
          <ul className="space-y-2">
            {audiencePsychology.dailyFrustrations.map((f, i) => (
              <motion.li
                key={i}
                variants={childFade}
                initial="initial"
                animate="animate"
                className="flex items-start gap-2.5 text-sm text-foreground/80"
              >
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-red-400" />
                {f}
              </motion.li>
            ))}
          </ul>
        </div>

        <div className="space-y-4">
          {/* Aspirational Identity */}
          <div className="glass-card p-5">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-3">Aspirational Identity</p>
            <blockquote className="border-l-2 border-primary pl-4 text-sm text-foreground leading-relaxed italic">
              {audiencePsychology.aspirationalIdentity}
            </blockquote>
          </div>

          {/* Buying Triggers */}
          <div className="glass-card p-5">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-3">Buying Triggers</p>
            <div className="space-y-2">
              {audiencePsychology.buyingTriggers.map((t, i) => (
                <div key={i} className="flex items-start gap-2.5 text-sm text-foreground/80">
                  <Zap className="h-3.5 w-3.5 shrink-0 mt-0.5 text-yellow-500" />
                  {t}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Objections */}
      <div className="glass-card p-5">
        <SectionHeader title="Objections & How to Overcome Them" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {audiencePsychology.objections.map((o, i) => (
            <motion.div
              key={i}
              variants={childFade}
              initial="initial"
              animate="animate"
              className="rounded-lg border border-border/60 bg-background/60 p-4 space-y-2"
            >
              <p className="text-sm font-medium text-foreground">{o.objection}</p>
              <p className="text-xs text-muted-foreground leading-relaxed border-t border-border/50 pt-2">
                <span className="font-medium text-primary">Override: </span>{o.overcome}
              </p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Exact Phrases Word Cloud */}
      <div className="glass-card p-5">
        <SectionHeader
          title="Exact Language They Use"
          description="Mirror these phrases in your copy, content, and conversations"
        />
        <div className="flex flex-wrap gap-2">
          {audiencePsychology.exactPhrases.map((phrase, i) => (
            <motion.span
              key={i}
              variants={childFade}
              initial="initial"
              animate="animate"
              className={cn(
                'inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium',
                i % 5 === 0 && 'border-primary/30 bg-primary/10 text-primary',
                i % 5 === 1 && 'border-blue-200 bg-blue-50 text-blue-800',
                i % 5 === 2 && 'border-emerald-200 bg-emerald-50 text-emerald-800',
                i % 5 === 3 && 'border-yellow-200 bg-yellow-50 text-yellow-800',
                i % 5 === 4 && 'border-purple-200 bg-purple-50 text-purple-800',
              )}
            >
              {phrase}
            </motion.span>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

// ─── Tab 4: Keyword Intel ─────────────────────────────────────────────────────

const intentColors: Record<KeywordIntent, string> = {
  Awareness: 'border-blue-200 bg-blue-50 text-blue-800',
  Consideration: 'border-yellow-200 bg-yellow-50 text-yellow-800',
  Decision: 'border-emerald-200 bg-emerald-50 text-emerald-800',
};

function KeywordIntelTab() {
  const { research, refreshSection } = useResearchStore();
  const { keywords, contentGaps } = research;

  const grouped: Record<KeywordIntent, typeof keywords> = {
    Awareness: keywords.filter((k) => k.intent === 'Awareness'),
    Consideration: keywords.filter((k) => k.intent === 'Consideration'),
    Decision: keywords.filter((k) => k.intent === 'Decision'),
  };

  return (
    <motion.div {...fadeIn} className="space-y-6">
      {(Object.entries(grouped) as [KeywordIntent, typeof keywords][]).map(([intent, rows]) => (
        <div key={intent} className="glass-card p-5">
          <div className="flex items-center gap-2 mb-4">
            <span className={cn('inline-flex items-center rounded-full border px-3 py-0.5 text-xs font-semibold', intentColors[intent])}>
              {intent}
            </span>
            <span className="text-xs text-muted-foreground">{rows.length} keywords</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border/60">
                  <th className="text-left pb-2.5 text-xs font-medium text-muted-foreground pr-4 min-w-[200px]">Keyword</th>
                  <th className="text-left pb-2.5 text-xs font-medium text-muted-foreground pr-4 whitespace-nowrap">Monthly Searches</th>
                  <th className="text-left pb-2.5 text-xs font-medium text-muted-foreground pr-4">Competition</th>
                  <th className="text-left pb-2.5 text-xs font-medium text-muted-foreground pr-4">CPC</th>
                  <th className="text-left pb-2.5 text-xs font-medium text-muted-foreground">Content Angle</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40">
                {rows.map((kw, i) => (
                  <tr key={i} className="hover:bg-muted/30 transition-colors">
                    <td className="py-2.5 pr-4 font-medium text-foreground">{kw.keyword}</td>
                    <td className="py-2.5 pr-4 text-muted-foreground">{kw.monthlySearches}</td>
                    <td className="py-2.5 pr-4">
                      <CompetitionBadge level={kw.competition} />
                    </td>
                    <td className="py-2.5 pr-4 text-muted-foreground font-mono text-xs">{kw.cpc}</td>
                    <td className="py-2.5 text-muted-foreground text-xs">{kw.contentAngle}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ))}

      {/* Content Gaps */}
      <div className="glass-card p-5">
        <SectionHeader
          title="Content Gap Opportunities"
          description="Underserved keywords with high upside — publish here first"
          onRefresh={() => refreshSection('contentGaps')}
        />
        <div className="space-y-3">
          {contentGaps.map((gap, i) => (
            <motion.div
              key={i}
              variants={childFade}
              initial="initial"
              animate="animate"
              className="flex items-start gap-4 rounded-lg border border-dashed border-emerald-300 bg-emerald-50/50 p-4"
            >
              <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-xs font-bold text-emerald-700 mt-0.5">
                {i + 1}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="text-sm font-semibold text-foreground">{gap.keyword}</p>
                  <span className="text-xs text-muted-foreground">{gap.searchVolume}</span>
                </div>
                <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{gap.opportunity}</p>
              </div>
              <Target className="h-4 w-4 shrink-0 text-emerald-600 mt-0.5" />
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

// ─── Tab 5: Pricing Research ──────────────────────────────────────────────────

function PricingBar({ tier }: { tier: PricingTier }) {
  const tierColors: Record<string, { bar: string; badge: string; border: string }> = {
    Budget: { bar: 'bg-slate-400', badge: 'bg-slate-100 text-slate-700 border-slate-200', border: 'border-slate-200' },
    'Mid-Market': { bar: 'bg-blue-400', badge: 'bg-blue-100 text-blue-700 border-blue-200', border: 'border-blue-200' },
    Premium: { bar: 'bg-primary', badge: 'bg-primary/10 text-primary border-primary/20', border: 'border-primary/20' },
    'Ultra-Premium': { bar: 'bg-amber-500', badge: 'bg-amber-100 text-amber-700 border-amber-200', border: 'border-amber-200' },
  };
  const c = tierColors[tier.label] ?? tierColors['Budget'];

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className={cn('inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold', c.badge)}>
            {tier.label}
          </span>
          <span className="text-sm font-medium text-foreground">{tier.range}</span>
        </div>
        <span className="text-xs text-muted-foreground">{tier.competitors.length} competitors</span>
      </div>
      <div className="h-6 w-full rounded-full bg-secondary overflow-hidden">
        <motion.div
          className={cn('h-full rounded-full', c.bar)}
          initial={{ width: 0 }}
          animate={{ width: `${tier.percentage}%` }}
          transition={{ duration: 0.8, ease: 'easeOut', delay: 0.15 }}
        />
      </div>
      <div className={cn('rounded-lg border p-3 space-y-1', c.border, 'bg-background/60')}>
        {tier.competitors.map((comp, i) => (
          <div key={i} className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">{comp.name}</span>
            <span className="font-medium text-foreground font-mono">{comp.price}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function PricingResearchTab() {
  const { research, refreshSection } = useResearchStore();
  const { pricingTiers, pricingTips, pricingOpportunity } = research;

  return (
    <motion.div {...fadeIn} className="space-y-6">
      {/* Pricing Landscape */}
      <div className="glass-card p-5">
        <SectionHeader
          title="Competitor Pricing Landscape"
          description="Market density by price tier — bar width = relative market saturation"
          onRefresh={() => refreshSection('pricingTiers')}
        />
        <div className="space-y-6">
          {pricingTiers.map((tier, i) => (
            <PricingBar key={i} tier={tier} />
          ))}
        </div>
      </div>

      {/* Pricing Psychology Tips + Opportunity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="glass-card p-5">
          <SectionHeader title="Pricing Psychology Tips" />
          <div className="space-y-4">
            {pricingTips.map((tip, i) => (
              <motion.div
                key={i}
                variants={childFade}
                initial="initial"
                animate="animate"
                className="flex items-start gap-3"
              >
                <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary mt-0.5">
                  {i + 1}
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">{tip.tip}</p>
                  <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{tip.detail}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Opportunity Card */}
        <div className="glass-card p-5 flex flex-col">
          <div className="flex items-center gap-2 mb-4">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
              <DollarSign className="h-4 w-4 text-primary" />
            </div>
            <h3 className="font-semibold text-foreground">Your Pricing Opportunity</h3>
          </div>
          <div className="flex-1 rounded-xl border border-primary/20 bg-primary/5 p-4">
            <p className="text-sm text-foreground/90 leading-relaxed">{pricingOpportunity}</p>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-3">
            {[
              { label: 'Sweet Spot', value: '$1,997', sub: 'One-time or 3-pay' },
              { label: 'ROI Multiple', value: '5–10x', sub: 'For $10k/mo goal' },
            ].map((stat, i) => (
              <div key={i} className="rounded-lg border border-border/60 bg-background/70 p-3 text-center">
                <p className="text-xs text-muted-foreground">{stat.label}</p>
                <p className="text-xl font-bold text-foreground">{stat.value}</p>
                <p className="text-xs text-muted-foreground">{stat.sub}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// ─── Export report ────────────────────────────────────────────────────────────

function buildReportText(research: ReturnType<typeof useResearchStore>['research']): string {
  const lines: string[] = [];
  lines.push(`MARKET RESEARCH REPORT`);
  lines.push(`Topic: ${research.topic}`);
  lines.push(`Generated: ${new Date(research.lastRefreshed).toLocaleString()}`);
  lines.push('');
  lines.push('=== NICHE ANALYSIS ===');
  lines.push(`Market Size: ${research.nicheAnalysis.marketSize} — ${research.nicheAnalysis.marketSizeDetail}`);
  lines.push(`Competition: ${research.nicheAnalysis.competitionLevel} (${research.nicheAnalysis.competitionScore}/100)`);
  lines.push(`Monetization Score: ${research.nicheAnalysis.monetizationScore}/100`);
  lines.push(`Trend: ${research.nicheAnalysis.trendDirection} — ${research.nicheAnalysis.trendDetail}`);
  lines.push(`Viability Score: ${research.nicheAnalysis.viabilityScore}/100`);
  lines.push(`Reason: ${research.nicheAnalysis.viabilityReason}`);
  lines.push('Sub-niches:');
  research.nicheAnalysis.subNiches.forEach((n, i) => lines.push(`  ${i + 1}. ${n}`));
  lines.push('');
  lines.push('=== COMPETITORS ===');
  research.competitors.forEach((c) => {
    lines.push(`\n${c.name} | ${c.offerType} | ${c.pricePoint} | ${c.audienceSize}`);
    lines.push(`Strengths: ${c.strengths.join(', ')}`);
    lines.push(`Weaknesses: ${c.weaknesses.join(', ')}`);
    lines.push(`Gap: ${c.opportunityGap}`);
  });
  lines.push('');
  lines.push('=== AUDIENCE PSYCHOLOGY ===');
  lines.push('Core Fears:');
  research.audiencePsychology.coreFears.forEach((f) => lines.push(`  - ${f.label} (${f.intensity}%)`));
  lines.push('Burning Desires:');
  research.audiencePsychology.burningDesires.forEach((d) => lines.push(`  - ${d.label} (${d.intensity}%)`));
  lines.push(`Aspirational Identity: ${research.audiencePsychology.aspirationalIdentity}`);
  lines.push('');
  lines.push('=== KEYWORDS ===');
  research.keywords.forEach((k) => {
    lines.push(`${k.keyword} | ${k.monthlySearches} searches | ${k.competition} competition | ${k.cpc} CPC | ${k.intent}`);
    lines.push(`  Angle: ${k.contentAngle}`);
  });
  lines.push('');
  lines.push('=== PRICING OPPORTUNITY ===');
  lines.push(research.pricingOpportunity);
  return lines.join('\n');
}

// ─── Main Page ────────────────────────────────────────────────────────────────

const TABS = [
  { value: 'niche', label: 'Niche Analysis', icon: BarChart2, color: 'text-blue-600' },
  { value: 'competitors', label: 'Competitor Intel', icon: Users, color: 'text-purple-600' },
  { value: 'psychology', label: 'Audience Psychology', icon: Brain, color: 'text-rose-600' },
  { value: 'keywords', label: 'Keyword Intel', icon: Search, color: 'text-amber-600' },
  { value: 'pricing', label: 'Pricing Research', icon: DollarSign, color: 'text-emerald-600' },
] as const;

type TabValue = (typeof TABS)[number]['value'];

export default function MarketResearchPage() {
  const [activeTab, setActiveTab] = useState<TabValue>('niche');
  const { research } = useResearchStore();

  const handleExport = () => {
    const text = buildReportText(research);
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `market-research-${research.topic.toLowerCase().replace(/\s+/g, '-')}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="page-container space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <TrendingUp className="h-5 w-5 text-primary" />
            <h1 className="text-2xl font-bold text-foreground">Deep Market Research</h1>
          </div>
          <p className="text-sm text-muted-foreground">
            Researching: <span className="font-medium text-foreground">{research.topic}</span>
            <span className="ml-2 text-xs text-muted-foreground/70">
              · Last updated {new Date(research.lastRefreshed).toLocaleDateString()}
            </span>
          </p>
        </div>
        <Button onClick={handleExport} variant="outline" className="gap-2 shrink-0">
          <Download className="h-4 w-4" />
          Export Report
        </Button>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as TabValue)}>
        <TabsList className="h-auto flex-wrap gap-1 p-1 bg-muted/70 w-full justify-start">
          {TABS.map((tab) => (
            <TabsTrigger
              key={tab.value}
              value={tab.value}
              className={cn(
                'gap-2 px-4 py-2 text-sm data-[state=active]:shadow-sm',
                activeTab === tab.value && 'data-[state=active]:bg-white'
              )}
            >
              <tab.icon className={cn('h-4 w-4', activeTab === tab.value ? tab.color : 'text-muted-foreground')} />
              <span className="hidden sm:inline">{tab.label}</span>
              <span className="sm:hidden">{tab.label.split(' ')[0]}</span>
            </TabsTrigger>
          ))}
        </TabsList>

        <div className="mt-2">
          <AnimatePresence mode="wait">
            {activeTab === 'niche' && (
              <TabsContent key="niche" value="niche" forceMount>
                <NicheAnalysisTab />
              </TabsContent>
            )}
            {activeTab === 'competitors' && (
              <TabsContent key="competitors" value="competitors" forceMount>
                <CompetitorIntelTab />
              </TabsContent>
            )}
            {activeTab === 'psychology' && (
              <TabsContent key="psychology" value="psychology" forceMount>
                <AudiencePsychologyTab />
              </TabsContent>
            )}
            {activeTab === 'keywords' && (
              <TabsContent key="keywords" value="keywords" forceMount>
                <KeywordIntelTab />
              </TabsContent>
            )}
            {activeTab === 'pricing' && (
              <TabsContent key="pricing" value="pricing" forceMount>
                <PricingResearchTab />
              </TabsContent>
            )}
          </AnimatePresence>
        </div>
      </Tabs>
    </div>
  );
}
