import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Zap,
  Copy,
  ThumbsUp,
  ThumbsDown,
  ChevronDown,
  ChevronUp,
  Clock,
  Sparkles,
  ArrowRight,
  Check,
} from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { cn, generateId } from '@/lib/utils';
import { getAnthropicClient, resolveApiKey } from '@/lib/ai';
import { useUserStore } from '@/stores/user';
import { useContextStore } from '@/stores/context';
import {
  useHooksStore,
  type ContentType,
  type HookFramework,
  type DesiredEmotion,
  type GeneratedHook,
  type HookGenerationOptions,
  type HookSet,
} from '@/stores/hooks';

// ─── Constants ──────────────────────────────────────────────────────────────

const CONTENT_TYPES: { value: ContentType; label: string }[] = [
  { value: 'hook', label: 'Short-Form Hook' },
  { value: 'headline', label: 'Headline' },
  { value: 'subject', label: 'Subject Line' },
  { value: 'ad', label: 'Ad Hook' },
];

const EMOTION_OPTIONS: { value: DesiredEmotion; label: string; color: string }[] = [
  { value: 'curiosity', label: 'Curiosity', color: 'bg-blue-100 text-blue-700 border-blue-200' },
  { value: 'fear', label: 'Fear', color: 'bg-red-100 text-red-700 border-red-200' },
  { value: 'hope', label: 'Hope', color: 'bg-green-100 text-green-700 border-green-200' },
  { value: 'anger', label: 'Anger', color: 'bg-orange-100 text-orange-700 border-orange-200' },
  { value: 'surprise', label: 'Surprise', color: 'bg-yellow-100 text-yellow-700 border-yellow-200' },
  { value: 'fomo', label: 'FOMO', color: 'bg-purple-100 text-purple-700 border-purple-200' },
  { value: 'aspiration', label: 'Aspiration', color: 'bg-teal-100 text-teal-700 border-teal-200' },
  { value: 'disgust', label: 'Disgust', color: 'bg-rose-100 text-rose-700 border-rose-200' },
];

const FRAMEWORKS: { value: HookFramework; label: string; desc: string; color: string }[] = [
  { value: 'contrarian', label: 'The Contrarian', desc: 'Challenge conventional wisdom', color: 'bg-red-50 border-red-200 text-red-700' },
  { value: 'statistic', label: 'The Statistic Shock', desc: 'Lead with surprising data', color: 'bg-blue-50 border-blue-200 text-blue-700' },
  { value: 'story', label: 'The Story Opener', desc: '"3 years ago I was…"', color: 'bg-amber-50 border-amber-200 text-amber-700' },
  { value: 'question', label: 'The Question Hook', desc: 'Poke a pain point', color: 'bg-purple-50 border-purple-200 text-purple-700' },
  { value: 'promise', label: 'The Bold Promise', desc: 'State the transformation', color: 'bg-green-50 border-green-200 text-green-700' },
  { value: 'secret', label: 'The Secret Reveal', desc: '"Nobody talks about this…"', color: 'bg-teal-50 border-teal-200 text-teal-700' },
  { value: 'failure', label: 'The Failure Story', desc: 'Vulnerability builds trust', color: 'bg-orange-50 border-orange-200 text-orange-700' },
  { value: 'hottake', label: 'The Hot Take', desc: 'Controversial but defensible', color: 'bg-rose-50 border-rose-200 text-rose-700' },
];

const FRAMEWORK_EMOTION_MAP: Record<HookFramework, DesiredEmotion> = {
  contrarian: 'surprise',
  statistic: 'curiosity',
  story: 'hope',
  question: 'fear',
  promise: 'aspiration',
  secret: 'curiosity',
  failure: 'hope',
  hottake: 'anger',
};

// ─── Hook Generation Logic ───────────────────────────────────────────────────

const HOOK_TEMPLATES: Record<HookFramework, string[]> = {
  contrarian: [
    'Stop trying to {action}. Here\'s what actually works for {audience}.',
    'Everyone told me to {common_advice}. I did the opposite and made ${result} in {timeframe}.',
    'The reason most {audience} fail at {topic} has nothing to do with {common_belief}.',
    '{common_advice} is one of the worst things you can do if you want to {desired_outcome}.',
    'I spent {timeframe} doing what every guru told me. Then I stopped — and everything changed.',
    'Unpopular opinion: {topic} does NOT require {common_requirement}.',
    'The "hustle harder" advice is keeping {audience} broke. Here\'s the real problem.',
    'I used to believe {common_belief} about {topic}. I was completely wrong.',
    'The best {audience} I know don\'t {common_action}. They do this instead.',
    'What if everything you\'ve been taught about {topic} is designed to keep you stuck?',
  ],
  statistic: [
    '{percentage}% of {audience} never reach {desired_outcome}. The ones who do share one habit.',
    'The average {audience} wastes {timeframe} on {topic} before figuring out what actually works.',
    '{number} {audience} tried {approach} last year. Only {small_number} made it work. Here\'s why.',
    'I analyzed {number} {content_type} from top {audience}. The #1 thing they all had in common:',
    'It takes the average person {timeframe} to hit {milestone}. I did it in {shorter_timeframe}.',
    '{percentage}% of your {outcome} comes from {percentage2}% of your {inputs}. This is how to find it.',
    'Most {audience} are leaving {dollar_amount} on the table every month. The math is shocking.',
    'I made ${result} in {timeframe} using just {number} strategies. Here\'s the breakdown.',
    'The {topic} industry is worth ${market_size}. Here\'s how to grab your slice without {sacrifice}.',
    '{number} hours. That\'s how long it took me to build a {result} business. Here\'s the full breakdown.',
  ],
  story: [
    '{timeframe} ago, I was {past_situation}. Today I {current_success}. This is the exact moment everything changed.',
    'I remember the exact day I decided to {turning_point}. I had {struggle} and I was done playing small.',
    'The day I quit {old_path} to chase {new_path}, everyone thought I was crazy. I\'m so glad I did.',
    'I used to be the {audience_member} who {past_failure}. Now I {current_success}. Here\'s what changed.',
    'Two years ago I was charging ${low_price} and working 60-hour weeks. Then I discovered {insight}.',
    'My first {months} as a {role} were brutal. I made ${low_result} and wanted to quit every single day.',
    '{timeframe} ago I had {number} followers and zero clients. Today I have {current_state}. Thread:',
    'I almost gave up on {goal} in {month}. A conversation with {mentor_type} changed everything.',
    'I failed at {number} businesses before I cracked the code on {topic}. Here\'s what I learned.',
    'The morning I woke up and saw ${result} in my account, I cried. Here\'s the full story of how I got there.',
  ],
  question: [
    'What if you could {desired_outcome} without {sacrifice}?',
    'Why do some {audience} hit {milestone} in {timeframe} while others spend years spinning their wheels?',
    'Are you still {ineffective_behavior}? No wonder you\'re not seeing results with {topic}.',
    'How many more {timeframe} are you going to spend {painful_activity} before you change your approach?',
    'What\'s the real reason {audience} can\'t seem to {desired_outcome}, no matter how hard they try?',
    'If you could only do {number} things to {achieve_goal}, what would they be?',
    'Be honest: are you actually building a {business_type}, or just a very expensive hobby?',
    'When was the last time your {topic} made you feel {positive_emotion}? If you can\'t remember, read this.',
    'What would your {timeline} look like if you stopped {bad_habit} starting today?',
    'Why does {audience_member_1} hit {goal} in {timeframe} while {audience_member_2} struggles for years?',
  ],
  promise: [
    'I\'m going to show you how to {desired_outcome} in {timeframe} — without {sacrifice}.',
    'By the end of this {content_type}, you\'ll know exactly how to {outcome} even if you {limitation}.',
    'This {content_type} will change how you think about {topic} forever. And it\'ll take less than {timeframe}.',
    'You\'re {number} steps away from {desired_outcome}. I\'m going to walk you through every single one.',
    'Here\'s the exact system I used to go from {starting_point} to {end_point} in {timeframe}.',
    'After this, you\'ll never struggle with {problem} again. Guaranteed.',
    'I\'m about to give you the only {framework} you\'ll ever need to {achieve_outcome}.',
    'This one {insight_type} took me {timeframe} to figure out. I\'m handing it to you for free.',
    'If you implement what I share in this {content_type}, your {metric} will change within {timeframe}.',
    'You don\'t need {expensive_thing}. You need this {simple_thing}. And I\'m going to prove it.',
  ],
  secret: [
    'Nobody in the {industry} wants you to know this, but {counterintuitive_truth}.',
    'The {strategy} that top {audience} use that they never talk about publicly.',
    'I\'ve been sitting on this {insight} for {timeframe}. It\'s time to share it.',
    'What the most successful {audience} do differently — and why they don\'t teach it in courses.',
    'The real reason {audience} reach {milestone} isn\'t {common_belief}. It\'s something else entirely.',
    'There\'s a {strategy} that {audience} use to {outcome} without {sacrifice}. Almost no one talks about it.',
    'After studying {number} of the top {audience}, I found the pattern they all share. It\'s not what you think.',
    'The {industry} gatekeeps this information. I\'m sharing it anyway.',
    'I wasn\'t supposed to share this. But here\'s the {secret} behind every {high_achiever}\'s success.',
    'Most {outcome_type} advice ignores the one thing that actually moves the needle. Here it is.',
  ],
  failure: [
    'I lost {loss} on {topic} before I finally figured out what I was doing wrong.',
    'My most embarrassing {failure_type} failure — and the lesson that saved my business.',
    'I spent {timeframe} doing {approach} the wrong way. Here\'s everything I wish someone had told me.',
    'The {number} mistakes I made in my first {timeframe} as a {role} — so you don\'t have to.',
    'I publicly failed at {goal}. Here\'s the full, unfiltered breakdown of what went wrong.',
    'The day my {metric} dropped to {low_number} was the best thing that ever happened to me. Here\'s why.',
    'I\'m not proud of this, but I {past_failure}. And it\'s the reason I can now help you {outcome}.',
    'For {timeframe}, I was doing {approach} backwards. The fix was embarrassingly simple.',
    'I almost burned my {business_type} to the ground in {timeframe}. Here\'s what I did instead.',
    'The {decision_type} decision I made in {year} that cost me {loss} — and what I learned from it.',
  ],
  hottake: [
    '{controversial_claim} — and I have the data to prove it.',
    'Most {business_type} advice is designed to keep you dependent on gurus, not to actually help you succeed.',
    'You don\'t need {commonly_recommended_thing}. That\'s the {industry}\'s way of keeping you consuming, not building.',
    'The "post consistently" advice is ruining {audience}. Quality beats frequency every single time.',
    '{popular_approach} is a trap. Here\'s what the top {percentage}% actually do.',
    'Chasing {vanity_metric} will destroy your {business_type}. Here\'s what actually pays the bills.',
    '{trending_topic} won\'t save your business. Your {fundamentals_type} will.',
    'I\'m tired of pretending {commonly_praised_thing} is the path to {outcome}. It\'s not.',
    'The "just ship it" culture has produced more broke {audience} than any other advice I\'ve seen.',
    'Cold {outreach_type} is dead for {audience}. Here\'s what replaced it — and it\'s working 10x better.',
  ],
};

function scoreHook(text: string, framework: HookFramework, topic: string): { score: number; reason: string } {
  let score = 60;
  const reasons: string[] = [];

  if (text.length > 80 && text.length < 200) { score += 8; reasons.push('ideal length'); }
  if (text.includes('?')) { score += 5; reasons.push('uses curiosity'); }
  if (/\d/.test(text)) { score += 7; reasons.push('has specificity'); }
  if (text.includes('you') || text.includes('your')) { score += 6; reasons.push('speaks to reader'); }
  if (/without|instead|real|secret|truth|never|always/.test(text.toLowerCase())) { score += 5; reasons.push('strong language'); }
  if (['contrarian', 'hottake', 'secret'].includes(framework)) score += 5;
  if (topic.length > 10) score += 4;

  score = Math.min(score + Math.floor(Math.random() * 8), 99);
  const primary = reasons.length > 0 ? reasons[0] : 'solid structure';
  return { score, reason: `Strong ${FRAMEWORKS.find(f => f.value === framework)?.label ?? 'framework'} — ${primary}.` };
}

function interpolate(template: string, vars: Record<string, string>): string {
  return template.replace(/\{(\w+)\}/g, (_, key) => vars[key] ?? `{${key}}`);
}

function buildVars(options: HookGenerationOptions): Record<string, string> {
  const topic = options.topic || 'AI coaching';
  const audience = options.audience || 'solopreneurs';
  const topicWords = topic.toLowerCase().split(' ');
  const mainWord = topicWords[topicWords.length - 1] || 'coaching';

  return {
    topic,
    audience,
    action: `scale your ${mainWord}`,
    common_advice: 'post every day',
    result: '10,000',
    timeframe: '90 days',
    desired_outcome: `replace your salary with ${mainWord} income`,
    common_belief: 'working harder',
    common_requirement: 'a big audience',
    common_action: 'chase every trend',
    percentage: '97',
    percentage2: '20',
    number: '127',
    small_number: '12',
    content_type: 'post',
    approach: 'content marketing',
    dollar_amount: '$3,000',
    market_size: '50 billion',
    sacrifice: 'burning out',
    shorter_timeframe: '47 days',
    milestone: '$10k/month',
    inputs: 'actions',
    outcome: 'revenue',
    turning_point: `build my ${mainWord} business`,
    struggle: 'zero clients',
    old_path: 'my 9–5',
    new_path: `${topic} coaching`,
    audience_member: 'person',
    past_failure: 'gave away everything for free',
    current_success: `make $${Math.floor(Math.random() * 15 + 10)}k/month online`,
    low_price: '97',
    insight: 'productized service model',
    months: '3',
    month: 'month 4',
    role: `${mainWord} coach`,
    low_result: '$800',
    current_state: `${Math.floor(Math.random() * 8 + 2)}k engaged followers`,
    goal: `${mainWord} coaching business`,
    mentor_type: 'stranger online',
    ineffective_behavior: 'making content for the algorithm',
    painful_activity: 'posting into the void',
    business_type: `${mainWord} business`,
    limitation: 'have no audience yet',
    starting_point: '$0 and no clients',
    end_point: '$20k months',
    insight_type: 'framework',
    simple_thing: 'one-page offer',
    expensive_thing: 'a massive following',
    metric: 'income',
    industry: topic.split(' ')[0] || 'coaching',
    counterintuitive_truth: 'the best clients come from the least content',
    strategy: 'DM-first approach',
    high_achiever: `7-figure ${mainWord} coach`,
    outcome_type: 'business growth',
    loss: '$12,000',
    failure_type: 'launch',
    low_number: 'zero',
    past_failure: 'charged $500 for a $5,000 result',
    decision_type: 'pricing',
    year: '2022',
    controversial_claim: `${audience} who post less earn more`,
    commonly_recommended_thing: '10k followers before you launch',
    trending_topic: 'viral content',
    popular_approach: 'the follower-first model',
    vanity_metric: 'views',
    fundamentals_type: 'offer and positioning',
    commonly_praised_thing: 'building in public',
    outreach_type: 'outreach',
    audience_member_1: 'Solopreneur A',
    audience_member_2: 'Solopreneur B',
    timeline: 'next 12 months',
    bad_habit: `undercharging for ${mainWord}`,
    positive_emotion: 'genuinely excited',
    achieve_goal: `land your next ${mainWord} client`,
    number: String(Math.floor(Math.random() * 3 + 2)),
    achieveoutcome: `hit $10k/month with ${topic}`,
    framework: 'positioning system',
    outcome: `make ${topic} your full-time income`,
    achieving_outcome: 'scale',
    achieve_outcome: `go full-time with ${topic}`,
    content_type: 'thread',
    months_short: '3',
    market_size_num: '4.5B',
  };
}

export function generateHooks(options: HookGenerationOptions): GeneratedHook[] {
  const vars = buildVars(options);
  const templates = HOOK_TEMPLATES[options.framework];
  const shuffled = [...templates].sort(() => Math.random() - 0.5);
  const selected = shuffled.slice(0, 10);

  return selected.map((template) => {
    const text = interpolate(template, vars);
    const emotion = FRAMEWORK_EMOTION_MAP[options.framework];
    const { score, reason } = scoreHook(text, options.framework, options.topic);
    return {
      id: generateId(),
      text,
      framework: options.framework,
      emotion,
      score,
      scoreReason: reason,
      feedback: null,
    };
  });
}

// ─── Subcomponents ───────────────────────────────────────────────────────────

function EmotionChip({
  option,
  selected,
  onToggle,
}: {
  option: (typeof EMOTION_OPTIONS)[0];
  selected: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className={cn(
        'px-3 py-1.5 rounded-full text-xs font-medium border transition-all',
        selected
          ? option.color + ' ring-2 ring-offset-1 ring-current'
          : 'bg-white border-border/60 text-muted-foreground hover:border-border'
      )}
    >
      {option.label}
    </button>
  );
}

function FrameworkCard({
  fw,
  selected,
  onSelect,
}: {
  fw: (typeof FRAMEWORKS)[0];
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        'w-full text-left px-3 py-2.5 rounded-lg border text-sm transition-all',
        selected
          ? fw.color + ' ring-2 ring-offset-1 ring-current font-semibold'
          : 'bg-white border-border/50 hover:border-border/80 text-foreground'
      )}
    >
      <div className="font-medium">{fw.label}</div>
      <div className="text-xs opacity-70 mt-0.5">{fw.desc}</div>
    </button>
  );
}

function HookCard({
  hook,
  setId,
  onFeedback,
}: {
  hook: GeneratedHook;
  setId: string;
  onFeedback: (setId: string, hookId: string, fb: 'up' | 'down' | null) => void;
}) {
  const [copied, setCopied] = useState(false);

  const fw = FRAMEWORKS.find((f) => f.value === hook.framework);
  const em = EMOTION_OPTIONS.find((e) => e.value === hook.emotion);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(hook.text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  const scoreColor =
    hook.score >= 85
      ? 'text-green-700 bg-green-50'
      : hook.score >= 70
      ? 'text-amber-700 bg-amber-50'
      : 'text-slate-600 bg-slate-50';

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white/90 border border-border/70 rounded-xl shadow-sm p-4 flex flex-col gap-3"
    >
      <p className="text-base font-medium leading-relaxed text-foreground">{hook.text}</p>

      <div className="flex flex-wrap items-center gap-2">
        {fw && (
          <span className={cn('text-xs px-2 py-0.5 rounded-full border font-medium', fw.color)}>
            {fw.label}
          </span>
        )}
        {em && (
          <span className={cn('text-xs px-2 py-0.5 rounded-full border font-medium', em.color)}>
            {em.label}
          </span>
        )}
        <span className={cn('text-xs px-2 py-0.5 rounded-full font-semibold ml-auto', scoreColor)}>
          {hook.score}/100
        </span>
      </div>

      <p className="text-xs text-muted-foreground">{hook.scoreReason}</p>

      <div className="flex items-center gap-2 pt-1 border-t border-border/40">
        <Button
          variant="outline"
          size="sm"
          className="h-7 text-xs gap-1.5"
          onClick={handleCopy}
        >
          {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
          {copied ? 'Copied!' : 'Copy'}
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className={cn(
            'h-7 w-7 p-0',
            hook.feedback === 'up' && 'text-green-600 bg-green-50'
          )}
          onClick={() =>
            onFeedback(setId, hook.id, hook.feedback === 'up' ? null : 'up')
          }
        >
          <ThumbsUp className="w-3.5 h-3.5" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className={cn(
            'h-7 w-7 p-0',
            hook.feedback === 'down' && 'text-red-500 bg-red-50'
          )}
          onClick={() =>
            onFeedback(setId, hook.id, hook.feedback === 'down' ? null : 'down')
          }
        >
          <ThumbsDown className="w-3.5 h-3.5" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="h-7 text-xs ml-auto gap-1 text-primary"
          onClick={async () => {
            await navigator.clipboard.writeText(`HOOK: ${hook.text}\n\n[Continue writing your content here...]`);
          }}
        >
          Use in Copy <ArrowRight className="w-3 h-3" />
        </Button>
      </div>
    </motion.div>
  );
}

function HistoryPanel({ history }: { history: HookSet[] }) {
  const [open, setOpen] = useState(false);
  const { updateHookFeedback } = useHooksStore();

  if (history.length === 0) return null;

  return (
    <div className="bg-white/90 border border-border/70 rounded-xl shadow-sm overflow-hidden">
      <button
        type="button"
        className="w-full flex items-center justify-between px-4 py-3 text-sm font-semibold"
        onClick={() => setOpen((v) => !v)}
      >
        <span className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-muted-foreground" />
          Hook History ({history.length})
        </span>
        {open ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: 'auto' }}
            exit={{ height: 0 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 flex flex-col gap-4 max-h-[600px] overflow-y-auto">
              {history.map((set) => (
                <div key={set.id} className="border border-border/40 rounded-lg p-3 bg-muted/20">
                  <div className="text-xs text-muted-foreground mb-2">
                    {new Date(set.generatedAt).toLocaleString()} — {set.options.topic}
                  </div>
                  <div className="flex flex-col gap-2">
                    {set.hooks.map((h) => (
                      <HookCard
                        key={h.id}
                        hook={h}
                        setId={set.id}
                        onFeedback={updateHookFeedback}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Main Page ───────────────────────────────────────────────────────────────

export default function HookGeneratorPage() {
  const { history, addHookSet, updateHookFeedback } = useHooksStore();
  const { user } = useUserStore();
  const { getContextString } = useContextStore();

  const [contentType, setContentType] = useState<ContentType>('hook');
  const [topic, setTopic] = useState('AI solopreneur coaching — how to replace your 9-5 using AI tools and consulting');
  const [audience, setAudience] = useState('Aspiring solopreneurs and side-hustlers who want to go full-time online');
  const [emotions, setEmotions] = useState<DesiredEmotion[]>(['curiosity', 'aspiration']);
  const [framework, setFramework] = useState<HookFramework>('contrarian');
  const [tone, setTone] = useState(2);
  const [generating, setGenerating] = useState(false);
  const [usingAI, setUsingAI] = useState(false);
  const [currentHooks, setCurrentHooks] = useState<GeneratedHook[]>([]);
  const [currentSetId, setCurrentSetId] = useState<string>('');

  // Pre-seed with realistic hooks on first load
  const [seeded, setSeeded] = useState(false);
  if (!seeded) {
    const preseededHooks: GeneratedHook[] = [
      { id: generateId(), text: 'Everyone told me to build an audience first. I got my first $10k client with 47 followers. Here\'s what I did instead.', framework: 'contrarian', emotion: 'surprise', score: 94, scoreReason: 'Specific numbers + contrarian narrative. Extremely scroll-stopping.', feedback: null },
      { id: generateId(), text: '97% of people who start AI coaching businesses quit within 6 months. The ones who stay all share one trait nobody talks about.', framework: 'statistic', emotion: 'curiosity', score: 91, scoreReason: 'Shocking stat + secret reveal combo. Forces completion.', feedback: null },
      { id: generateId(), text: '18 months ago I was $40k in debt, working a job I hated, and had zero online presence. Last month I cleared $23k. Here\'s the exact turning point.', framework: 'story', emotion: 'hope', score: 96, scoreReason: 'Real numbers, relatable starting point, clear transformation arc.', feedback: null },
      { id: generateId(), text: 'What if you could sign your first $5k AI coaching client this week — without a single follower, ad, or sales call?', framework: 'question', emotion: 'aspiration', score: 88, scoreReason: 'Addresses every objection in the hook itself. Very high CTR pattern.', feedback: null },
      { id: generateId(), text: 'I\'m about to show you the exact 3-step system I used to go from charging $97/hour to $5,000/month retainers — in 47 days.', framework: 'promise', emotion: 'aspiration', score: 92, scoreReason: 'Ultra-specific timeframe + price transformation. Transformation is vivid.', feedback: null },
      { id: generateId(), text: 'The AI coaches making $30k+/month don\'t have better content. They have a positioning secret that 99% of beginners miss entirely.', framework: 'secret', emotion: 'curiosity', score: 89, scoreReason: 'Creates strong in-group/out-group dynamic. Elicits powerful curiosity gap.', feedback: null },
      { id: generateId(), text: 'I embarrassingly failed my first 3 AI coaching launches. The fourth one made $47,000. Here\'s everything that was wrong with the first three.', framework: 'failure', emotion: 'hope', score: 93, scoreReason: 'Failure + rebound arc. Specific numbers make it credible. High trust-building.', feedback: null },
      { id: generateId(), text: 'The "post more content" advice is why most AI solopreneurs stay broke. Your content isn\'t the problem — your offer is.', framework: 'hottake', emotion: 'anger', score: 87, scoreReason: 'Reframes the blame, creates contrast, speaks to a frustrated audience.', feedback: null },
      { id: generateId(), text: 'You don\'t need 10k followers to make $10k/month. You need exactly one of these.', framework: 'contrarian', emotion: 'curiosity', score: 90, scoreReason: 'Dismantles the biggest belief that holds solopreneurs back. Cliffhanger ending.', feedback: null },
      { id: generateId(), text: 'The solopreneurs charging $10k+ for AI consulting aren\'t smarter than you. They just figured out one positioning move that changes everything.', framework: 'secret', emotion: 'aspiration', score: 85, scoreReason: 'Aspirational + ego-preserving (not about being smarter). Very shareable.', feedback: null },
    ];
    setCurrentHooks(preseededHooks);
    setSeeded(true);
    const fakeSetId = generateId();
    setCurrentSetId(fakeSetId);
  }

  const toggleEmotion = (em: DesiredEmotion) => {
    setEmotions((prev) =>
      prev.includes(em) ? prev.filter((e) => e !== em) : [...prev, em]
    );
  };

  const handleGenerate = useCallback(async () => {
    if (!topic.trim()) return;
    setGenerating(true);

    const opts: HookGenerationOptions = { contentType, topic, audience, emotions, framework, tone };

    if (resolveApiKey(user.anthropicApiKey)) {
      const toastId = toast.loading('Generating hooks with Claude AI…');
      try {
        const client = getAnthropicClient(resolveApiKey(user.anthropicApiKey));
        const contextString = getContextString();
        const frameworkLabel = FRAMEWORKS.find((f) => f.value === framework)?.label ?? framework;
        const emotionLabel = emotions.map((e) => EMOTION_OPTIONS.find((o) => o.value === e)?.label ?? e).join(', ');
        const toneLabels = ['Formal', 'Professional', 'Balanced', 'Casual', 'Raw'];
        const toneLabel = toneLabels[tone] ?? 'Balanced';

        const response = await client.messages.create({
          model: 'claude-sonnet-4-5',
          max_tokens: 2048,
          system: 'You are a world-class copywriter and viral content strategist. Generate hooks using the exact framework requested.',
          messages: [
            {
              role: 'user',
              content: `Generate 10 viral ${frameworkLabel} hooks for:
Topic: ${topic}
Target Audience: ${audience}
Desired Emotion: ${emotionLabel}
Tone: ${toneLabel}

Business Context:
${contextString}

Return ONLY a JSON array of 10 objects with this exact shape:
[{ "text": "hook text here", "score": 85, "reasoning": "why this works" }]

Each hook must be genuinely viral, specific, and use the ${frameworkLabel} framework correctly. Scores 70-99.`,
            },
          ],
        });

        const raw = response.content[0].type === 'text' ? response.content[0].text : '';
        const jsonMatch = raw.match(/\[[\s\S]*\]/);
        if (!jsonMatch) throw new Error('No JSON array found in response');

        const parsed = JSON.parse(jsonMatch[0]) as { text: string; score: number; reasoning: string }[];

        const emotion = FRAMEWORK_EMOTION_MAP[framework];
        const hooks: GeneratedHook[] = parsed.map((item) => ({
          id: generateId(),
          text: item.text,
          framework,
          emotion,
          score: Math.max(70, Math.min(99, item.score)),
          scoreReason: item.reasoning,
          feedback: null,
        }));

        setCurrentHooks(hooks);
        setUsingAI(true);
        const id = addHookSet({ options: opts, hooks });
        setCurrentSetId(id);
        toast.success('10 AI-powered hooks generated!', { id: toastId });
      } catch (err) {
        console.error('AI hook generation failed:', err);
        toast.warning('AI generation failed — falling back to templates.', { id: toastId });
        // Fallback to static generation
        const hooks = generateHooks(opts);
        setCurrentHooks(hooks);
        setUsingAI(false);
        const id = addHookSet({ options: opts, hooks });
        setCurrentSetId(id);
      }
    } else {
      await new Promise((r) => setTimeout(r, 900));
      const hooks = generateHooks(opts);
      setCurrentHooks(hooks);
      setUsingAI(false);
      const id = addHookSet({ options: opts, hooks });
      setCurrentSetId(id);
    }

    setGenerating(false);
  }, [contentType, topic, audience, emotions, framework, tone, addHookSet, user.anthropicApiKey, getContextString]);

  const TONE_LABELS = ['Formal', 'Professional', 'Balanced', 'Casual', 'Raw'];

  return (
    <div className="min-h-screen bg-[#f5f0e8] p-4 sm:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-1">
            <Zap className="w-5 h-5 text-primary" />
            <h1 className="text-2xl font-bold text-foreground">Hook & Headline Generator</h1>
          </div>
          <p className="text-sm text-muted-foreground">
            World-class viral hooks and scroll-stopping openers — powered by proven frameworks.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[420px_1fr] gap-6">
          {/* ── Left Panel ── */}
          <div className="flex flex-col gap-4">
            {/* Content Type */}
            <div className="bg-white/90 border border-border/70 rounded-xl shadow-sm p-4">
              <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2 block">
                Content Type
              </Label>
              <Tabs value={contentType} onValueChange={(v) => setContentType(v as ContentType)}>
                <TabsList className="w-full grid grid-cols-2 h-auto gap-1 bg-muted/30 p-1">
                  {CONTENT_TYPES.map((ct) => (
                    <TabsTrigger
                      key={ct.value}
                      value={ct.value}
                      className="text-xs py-1.5 data-[state=active]:bg-white data-[state=active]:shadow-sm"
                    >
                      {ct.label}
                    </TabsTrigger>
                  ))}
                </TabsList>
              </Tabs>
            </div>

            {/* Topic & Audience */}
            <div className="bg-white/90 border border-border/70 rounded-xl shadow-sm p-4 flex flex-col gap-3">
              <div>
                <Label htmlFor="topic" className="text-xs font-semibold mb-1.5 block">
                  Topic / Offer
                </Label>
                <Textarea
                  id="topic"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="What is the content about? Be specific..."
                  rows={3}
                  className="text-sm resize-none"
                />
              </div>
              <div>
                <Label htmlFor="audience" className="text-xs font-semibold mb-1.5 block">
                  Target Audience
                </Label>
                <Input
                  id="audience"
                  value={audience}
                  onChange={(e) => setAudience(e.target.value)}
                  placeholder="Who is this for?"
                  className="text-sm"
                />
              </div>
            </div>

            {/* Emotions */}
            <div className="bg-white/90 border border-border/70 rounded-xl shadow-sm p-4">
              <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2 block">
                Desired Emotion
              </Label>
              <div className="flex flex-wrap gap-2">
                {EMOTION_OPTIONS.map((opt) => (
                  <EmotionChip
                    key={opt.value}
                    option={opt}
                    selected={emotions.includes(opt.value)}
                    onToggle={() => toggleEmotion(opt.value)}
                  />
                ))}
              </div>
            </div>

            {/* Framework */}
            <div className="bg-white/90 border border-border/70 rounded-xl shadow-sm p-4">
              <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2 block">
                Hook Framework
              </Label>
              <div className="grid grid-cols-1 gap-1.5">
                {FRAMEWORKS.map((fw) => (
                  <FrameworkCard
                    key={fw.value}
                    fw={fw}
                    selected={framework === fw.value}
                    onSelect={() => setFramework(fw.value)}
                  />
                ))}
              </div>
            </div>

            {/* Tone */}
            <div className="bg-white/90 border border-border/70 rounded-xl shadow-sm p-4">
              <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-3 block">
                Tone — <span className="text-foreground normal-case font-semibold">{TONE_LABELS[tone]}</span>
              </Label>
              <div className="flex items-center gap-3">
                <span className="text-xs text-muted-foreground whitespace-nowrap">Professional</span>
                <Slider
                  min={0}
                  max={4}
                  step={1}
                  value={[tone]}
                  onValueChange={([v]) => setTone(v)}
                  className="flex-1"
                />
                <span className="text-xs text-muted-foreground whitespace-nowrap">Casual</span>
              </div>
            </div>

            {/* Generate Button */}
            <Button
              size="lg"
              className="w-full gap-2 font-semibold text-base py-5 bg-[hsl(160_40%_12%)] hover:bg-[hsl(160_40%_16%)] text-white"
              onClick={handleGenerate}
              disabled={generating || !topic.trim()}
            >
              {generating ? (
                <>
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 0.8, ease: 'linear' }}
                  >
                    <Sparkles className="w-4 h-4" />
                  </motion.div>
                  Generating Hooks…
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4" />
                  Generate 10 Hooks
                </>
              )}
            </Button>
          </div>

          {/* ── Right Panel ── */}
          <div className="flex flex-col gap-4">
            {currentHooks.length > 0 ? (
              <>
                <div className="flex items-center justify-between">
                  <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                    Generated Hooks ({currentHooks.length})
                  </h2>
                  <div className="flex items-center gap-1.5">
                    {usingAI && (
                      <Badge className="text-xs bg-violet-100 text-violet-700 border-violet-200 gap-1">
                        <Sparkles className="w-3 h-3" />
                        AI
                      </Badge>
                    )}
                    <Badge variant="outline" className="text-xs">
                      {FRAMEWORKS.find((f) => f.value === framework)?.label}
                    </Badge>
                  </div>
                </div>
                <div className="flex flex-col gap-3">
                  <AnimatePresence mode="popLayout">
                    {currentHooks.map((hook, i) => (
                      <motion.div
                        key={hook.id}
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.05 }}
                      >
                        <HookCard
                          hook={hook}
                          setId={currentSetId}
                          onFeedback={updateHookFeedback}
                        />
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </>
            ) : (
              <div className="bg-white/90 border border-border/70 rounded-xl shadow-sm flex flex-col items-center justify-center py-20 gap-3 text-center">
                <Zap className="w-10 h-10 text-muted-foreground/30" />
                <p className="text-muted-foreground font-medium">
                  Configure your options and hit Generate
                </p>
                <p className="text-xs text-muted-foreground/60">
                  10 world-class hooks will appear here
                </p>
              </div>
            )}

            {/* History */}
            <HistoryPanel history={history} />
          </div>
        </div>
      </div>
    </div>
  );
}
