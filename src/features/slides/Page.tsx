import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutTemplate,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Copy,
  Check,
  Download,
  ChevronDown,
  ChevronUp,
  Wand2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { getAnthropicClient, resolveApiKey } from "@/lib/ai";
import { useContextStore } from "@/stores/context";
import { useUserStore } from "@/stores/user";

// ─── Types ─────────────────────────────────────────────────────────────────────

type SlideType = "title" | "content" | "split" | "quote" | "cta";

interface Slide {
  title: string;
  type: SlideType;
  bullets: string[];
  speakerNotes: string;
}

type Theme = "minimal-light" | "dark-pro" | "forest-green" | "bold-contrast";

interface ThemeConfig {
  id: Theme;
  name: string;
  description: string;
  bg: string;
  accent: string;
  text: string;
  subtleText: string;
  border: string;
  badge: string;
  cardBg: string;
  dotColors: string[];
}

// ─── Theme Definitions ────────────────────────────────────────────────────────

const THEMES: ThemeConfig[] = [
  {
    id: "minimal-light",
    name: "Minimal Light",
    description: "Clean white with subtle grays",
    bg: "bg-white",
    accent: "bg-slate-800",
    text: "text-slate-900",
    subtleText: "text-slate-500",
    border: "border-slate-200",
    badge: "bg-slate-100 text-slate-600",
    cardBg: "bg-slate-50",
    dotColors: ["bg-slate-800", "bg-slate-400", "bg-slate-200"],
  },
  {
    id: "dark-pro",
    name: "Dark Pro",
    description: "Sleek dark with cyan accents",
    bg: "bg-gray-950",
    accent: "bg-cyan-500",
    text: "text-gray-100",
    subtleText: "text-gray-400",
    border: "border-gray-800",
    badge: "bg-cyan-500/10 text-cyan-400",
    cardBg: "bg-gray-900",
    dotColors: ["bg-cyan-500", "bg-cyan-700", "bg-gray-700"],
  },
  {
    id: "forest-green",
    name: "Forest Green",
    description: "Branded green — your business colors",
    bg: "bg-[hsl(160,35%,97%)]",
    accent: "bg-[hsl(160,45%,18%)]",
    text: "text-[hsl(160,35%,8%)]",
    subtleText: "text-[hsl(160,15%,42%)]",
    border: "border-[hsl(155,20%,88%)]",
    badge: "bg-[hsl(160,45%,18%)]/10 text-[hsl(160,45%,18%)]",
    cardBg: "bg-[hsl(155,20%,93%)]",
    dotColors: [
      "bg-[hsl(160,45%,18%)]",
      "bg-[hsl(160,35%,40%)]",
      "bg-[hsl(155,20%,80%)]",
    ],
  },
  {
    id: "bold-contrast",
    name: "Bold Contrast",
    description: "High contrast with vibrant yellow",
    bg: "bg-zinc-900",
    accent: "bg-yellow-400",
    text: "text-zinc-100",
    subtleText: "text-zinc-400",
    border: "border-zinc-700",
    badge: "bg-yellow-400/10 text-yellow-400",
    cardBg: "bg-zinc-800",
    dotColors: ["bg-yellow-400", "bg-yellow-600", "bg-zinc-700"],
  },
];

// ─── Mock fallback data ───────────────────────────────────────────────────────

function generateMockSlides(topic: string, count: number): Slide[] {
  const slides: Slide[] = [
    {
      title: topic || "Your Presentation Title",
      type: "title",
      bullets: ["Presented by [Your Name]", "Today's Date"],
      speakerNotes:
        "Welcome the audience, introduce yourself, and briefly explain what you'll cover today.",
    },
    {
      title: "The Problem",
      type: "content",
      bullets: [
        "Most people struggle with this exact challenge",
        "Traditional solutions fail to address the root cause",
        "The cost of inaction keeps compounding",
        "You deserve a better way",
      ],
      speakerNotes:
        "Paint the pain vividly. Use a story or statistic to make the problem tangible.",
    },
    {
      title: "Why This Matters Now",
      type: "split",
      bullets: [
        "The market has shifted dramatically",
        "Early movers will have an unfair advantage",
        "The window of opportunity is open — but not forever",
      ],
      speakerNotes:
        "Create urgency. Reference a current trend or market change.",
    },
    {
      title: '"The old way no longer works."',
      type: "quote",
      bullets: [],
      speakerNotes: "Let this quote breathe. Pause for 3 seconds after showing.",
    },
    {
      title: "Introducing the Solution",
      type: "content",
      bullets: [
        "A completely new approach to the problem",
        "Built for the way people actually work today",
        "Faster results with less effort",
        "Proven by hundreds of case studies",
      ],
      speakerNotes:
        "Position your solution as the bridge between the problem and the outcome they want.",
    },
    {
      title: "How It Works",
      type: "content",
      bullets: [
        "Step 1: Understand your starting point",
        "Step 2: Deploy the core framework",
        "Step 3: Iterate and optimize",
        "Step 4: Scale what works",
      ],
      speakerNotes:
        "Walk through each step briefly. Use visuals here if available.",
    },
    {
      title: "The Results You Can Expect",
      type: "content",
      bullets: [
        "Achieve X within the first 30 days",
        "Build momentum with Y in 60 days",
        "Hit your full goal of Z by day 90",
      ],
      speakerNotes: "Be specific. Real numbers build credibility.",
    },
    {
      title: "Take the Next Step",
      type: "cta",
      bullets: [
        "Limited spots available",
        "Special pricing expires soon",
        "Get started today",
      ],
      speakerNotes:
        "This is your moment. Be confident and clear. Tell them exactly what to do next.",
    },
  ];
  return slides.slice(0, count);
}

// ─── Step indicator ───────────────────────────────────────────────────────────

function StepIndicator({ step }: { step: number }) {
  const steps = ["Topic & Audience", "Choose Theme", "Your Deck"];
  return (
    <div className="flex items-center gap-2">
      {steps.map((label, i) => {
        const num = i + 1;
        const active = num === step;
        const done = num < step;
        return (
          <div key={label} className="flex items-center gap-2">
            <div
              className={cn(
                "w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold border-2 transition-all duration-300",
                active
                  ? "border-[hsl(var(--sidebar-primary))] bg-[hsl(var(--sidebar-primary))] text-white"
                  : done
                  ? "border-[hsl(var(--sidebar-primary))]/60 bg-[hsl(var(--sidebar-primary))]/10 text-[hsl(var(--sidebar-primary))]"
                  : "border-border bg-muted text-muted-foreground"
              )}
            >
              {done ? <Check className="w-3.5 h-3.5" /> : num}
            </div>
            <span
              className={cn(
                "text-sm hidden sm:block",
                active ? "font-semibold text-foreground" : "text-muted-foreground"
              )}
            >
              {label}
            </span>
            {i < steps.length - 1 && (
              <div
                className={cn(
                  "w-8 h-px transition-all duration-300",
                  done ? "bg-[hsl(var(--sidebar-primary))]/60" : "bg-border"
                )}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── Slide Card ───────────────────────────────────────────────────────────────

function SlideCard({
  slide,
  index,
  theme,
}: {
  slide: Slide;
  index: number;
  theme: ThemeConfig;
}) {
  const [notesOpen, setNotesOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    const text = [
      `SLIDE ${index + 1}: ${slide.title}`,
      "",
      ...(slide.bullets.length > 0 ? slide.bullets.map((b) => `• ${b}`) : []),
      "",
      `Speaker Notes: ${slide.speakerNotes}`,
    ].join("\n");
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  }

  const isQuote = slide.type === "quote";
  const isCta = slide.type === "cta";
  const isTitle = slide.type === "title";

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04 }}
      className={cn(
        "rounded-2xl border overflow-hidden shadow-sm",
        theme.border,
        theme.bg
      )}
    >
      {/* Slide number badge */}
      <div
        className={cn(
          "flex items-center justify-between px-5 pt-4 pb-0"
        )}
      >
        <span
          className={cn(
            "text-xs font-semibold px-2.5 py-1 rounded-full",
            theme.badge
          )}
        >
          Slide {index + 1} — {slide.type.charAt(0).toUpperCase() + slide.type.slice(1)}
        </span>
        <button
          onClick={handleCopy}
          className={cn(
            "p-1.5 rounded-lg transition-colors",
            theme.text,
            "hover:opacity-70"
          )}
          title="Copy slide"
        >
          {copied ? (
            <Check className="w-4 h-4 text-green-500" />
          ) : (
            <Copy className="w-4 h-4" />
          )}
        </button>
      </div>

      {/* Slide content */}
      <div
        className={cn(
          "px-5 py-5",
          isQuote && "py-8",
          isTitle && "py-8"
        )}
      >
        {isQuote ? (
          <blockquote
            className={cn("text-xl sm:text-2xl font-bold italic text-center", theme.text)}
          >
            {slide.title}
          </blockquote>
        ) : (
          <h3
            className={cn(
              "font-bold leading-tight mb-3",
              isTitle ? "text-2xl sm:text-3xl text-center" : "text-lg sm:text-xl",
              theme.text
            )}
          >
            {slide.title}
          </h3>
        )}

        {slide.bullets.length > 0 && !isQuote && (
          <ul
            className={cn(
              "space-y-2 mt-3",
              isTitle && "text-center list-none"
            )}
          >
            {slide.bullets.map((bullet, bi) => (
              <li
                key={bi}
                className={cn(
                  "flex items-start gap-2.5 text-sm",
                  theme.subtleText,
                  isTitle && "justify-center"
                )}
              >
                {!isTitle && (
                  <span
                    className={cn(
                      "mt-1.5 w-1.5 h-1.5 rounded-full shrink-0",
                      isCta ? theme.accent : theme.dotColors[0]
                    )}
                  />
                )}
                <span className={cn(isCta && "font-medium")}>{bullet}</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Speaker notes toggle */}
      {slide.speakerNotes && (
        <div className={cn("border-t px-5", theme.border)}>
          <button
            onClick={() => setNotesOpen((o) => !o)}
            className={cn(
              "flex items-center gap-1.5 py-3 text-xs font-medium w-full transition-opacity hover:opacity-70",
              theme.subtleText
            )}
          >
            {notesOpen ? (
              <ChevronUp className="w-3.5 h-3.5" />
            ) : (
              <ChevronDown className="w-3.5 h-3.5" />
            )}
            Speaker Notes
          </button>
          <AnimatePresence>
            {notesOpen && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <p
                  className={cn(
                    "text-sm pb-4 leading-relaxed",
                    theme.subtleText
                  )}
                >
                  {slide.speakerNotes}
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </motion.div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function SlidesPage() {
  const [step, setStep] = useState(1);

  // Step 1 state
  const [topic, setTopic] = useState("");
  const [slideCount, setSlideCount] = useState("8");
  const [audience, setAudience] = useState("Professional");

  // Step 2 state
  const [selectedTheme, setSelectedTheme] = useState<Theme>("forest-green");

  // Step 3 state
  const [slides, setSlides] = useState<Slide[] | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copiedAll, setCopiedAll] = useState(false);

  const getContextString = useContextStore((s) => s.getContextString);
  const user = useUserStore((s) => s.user);

  const theme = THEMES.find((t) => t.id === selectedTheme) ?? THEMES[2];

  // ── Generate slides ──────────────────────────────────────────────────────────

  async function handleGenerate() {
    setIsGenerating(true);
    setError(null);
    setSlides(null);

    const apiKey = resolveApiKey(user.anthropicApiKey ?? "");

    if (!apiKey) {
      // Fall back to mock slides
      await new Promise((r) => setTimeout(r, 600));
      setSlides(generateMockSlides(topic, parseInt(slideCount)));
      setIsGenerating(false);
      setStep(3);
      return;
    }

    try {
      const client = getAnthropicClient(apiKey);
      const businessContext = getContextString();
      const count = parseInt(slideCount);

      const prompt = `You are an expert presentation designer. Create a ${count}-slide deck on the following topic.

Topic: ${topic || "Build a successful online business"}
Target Audience: ${audience}
Number of Slides: ${count}

Business Context:
${businessContext}

Return a JSON array of exactly ${count} slide objects. Each object must have:
- title: string (the slide headline)
- type: one of "title" | "content" | "split" | "quote" | "cta"
- bullets: string[] (3-5 bullet points; empty array for quote slides)
- speakerNotes: string (2-3 sentences for the presenter)

Rules:
- First slide should be type "title"
- Last slide should be type "cta"
- Include 1-2 "quote" slides for impact
- Keep bullets concise (under 12 words each)
- Make content relevant to the business context above
- Make speakerNotes practical and actionable

Return ONLY valid JSON array, no markdown, no explanation.`;

      const response = await client.messages.create({
        model: "claude-haiku-3-5",
        max_tokens: 4000,
        messages: [{ role: "user", content: prompt }],
      });

      const raw =
        response.content[0].type === "text" ? response.content[0].text : "";

      // Extract JSON from response
      const jsonMatch = raw.match(/\[[\s\S]*\]/);
      if (!jsonMatch) throw new Error("Invalid response format");

      const parsed: Slide[] = JSON.parse(jsonMatch[0]);
      setSlides(parsed.slice(0, count));
      setStep(3);
    } catch (err) {
      console.error(err);
      // Fall back to mock
      setSlides(generateMockSlides(topic, parseInt(slideCount)));
      setStep(3);
    } finally {
      setIsGenerating(false);
    }
  }

  // ── Download all ─────────────────────────────────────────────────────────────

  function handleDownloadAll() {
    if (!slides) return;
    const text = slides
      .map(
        (s, i) =>
          `SLIDE ${i + 1}: ${s.title}\nType: ${s.type}\n${s.bullets
            .map((b) => `• ${b}`)
            .join("\n")}\n\nSpeaker Notes: ${s.speakerNotes}`
      )
      .join("\n\n" + "─".repeat(50) + "\n\n");

    const header = `SLIDE DECK: ${topic || "Presentation"}\nAudience: ${audience} | Slides: ${slides.length} | Theme: ${theme.name}\n\n${"═".repeat(50)}\n\n`;
    const blob = new Blob([header + text], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${(topic || "slides").replace(/[^a-z0-9]/gi, "-").toLowerCase()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  }

  async function handleCopyAll() {
    if (!slides) return;
    const text = slides
      .map(
        (s, i) =>
          `SLIDE ${i + 1}: ${s.title}\n${s.bullets
            .map((b) => `• ${b}`)
            .join("\n")}\n\nSpeaker Notes: ${s.speakerNotes}`
      )
      .join("\n\n---\n\n");
    await navigator.clipboard.writeText(text);
    setCopiedAll(true);
    setTimeout(() => setCopiedAll(false), 1800);
  }

  // ─── Render ───────────────────────────────────────────────────────────────────

  return (
    <div className="page-container max-w-4xl">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {/* Header */}
        <div className="page-header">
          <div className="flex items-center gap-2 mb-1">
            <div className="p-1.5 rounded-lg bg-[hsl(var(--sidebar-primary))]/10">
              <LayoutTemplate className="h-5 w-5 text-[hsl(var(--sidebar-primary))]" />
            </div>
            <h1 className="page-title">Slides Builder</h1>
          </div>
          <p className="page-description">
            AI-powered presentation builder. Create beautiful decks from your
            business context.
          </p>
        </div>

        {/* Step indicator */}
        <div className="mb-8">
          <StepIndicator step={step} />
        </div>

        <AnimatePresence mode="wait">
          {/* ── STEP 1: Topic & Audience ── */}
          {step === 1 && (
            <motion.div
              key="step-1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.25 }}
              className="glass-card p-6 sm:p-8 space-y-6 max-w-2xl"
            >
              <div>
                <h2 className="text-xl font-semibold">What's your presentation about?</h2>
                <p className="text-muted-foreground text-sm mt-1">
                  Give Claude the context it needs to build a compelling deck.
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="slide-topic">Topic / Title</Label>
                <Textarea
                  id="slide-topic"
                  placeholder="e.g. How to build a 6-figure coaching business using AI tools in 90 days"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  className="resize-none min-h-[80px]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Number of Slides</Label>
                  <Select value={slideCount} onValueChange={setSlideCount}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="5">5 slides</SelectItem>
                      <SelectItem value="8">8 slides</SelectItem>
                      <SelectItem value="10">10 slides</SelectItem>
                      <SelectItem value="12">12 slides</SelectItem>
                      <SelectItem value="15">15 slides</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Target Audience</Label>
                  <Select value={audience} onValueChange={setAudience}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="General">General</SelectItem>
                      <SelectItem value="Professional">Professional</SelectItem>
                      <SelectItem value="Students">Students</SelectItem>
                      <SelectItem value="Investors">Investors</SelectItem>
                      <SelectItem value="Clients">Clients</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Button
                size="lg"
                className="w-full sm:w-auto gap-2"
                onClick={() => setStep(2)}
                disabled={!topic.trim()}
              >
                Choose Theme <ArrowRight className="w-4 h-4" />
              </Button>
            </motion.div>
          )}

          {/* ── STEP 2: Pick Theme ── */}
          {step === 2 && (
            <motion.div
              key="step-2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.25 }}
              className="space-y-6"
            >
              <div>
                <h2 className="text-xl font-semibold">Choose a theme</h2>
                <p className="text-muted-foreground text-sm mt-1">
                  Select the visual style for your presentation.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {THEMES.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setSelectedTheme(t.id)}
                    className={cn(
                      "glass-card p-5 text-left transition-all duration-200 hover:shadow-md",
                      selectedTheme === t.id
                        ? "ring-2 ring-[hsl(var(--sidebar-primary))] shadow-md"
                        : "hover:border-[hsl(var(--sidebar-primary))]/40"
                    )}
                  >
                    {/* Color preview */}
                    <div
                      className={cn(
                        "w-full h-20 rounded-lg mb-4 flex items-end p-2 gap-1.5",
                        t.bg,
                        "border",
                        t.border
                      )}
                    >
                      {/* Mini slide preview */}
                      <div className={cn("flex-1 rounded p-2", t.cardBg)}>
                        <div
                          className={cn(
                            "h-2 rounded mb-1.5 w-3/4",
                            t.dotColors[0]
                          )}
                        />
                        <div
                          className={cn("h-1.5 rounded mb-1 w-1/2", t.dotColors[1])}
                        />
                        <div
                          className={cn("h-1.5 rounded w-2/3", t.dotColors[2])}
                        />
                      </div>
                      <div
                        className={cn(
                          "w-8 h-8 rounded flex items-center justify-center shrink-0",
                          t.accent
                        )}
                      >
                        <div className="w-3 h-3 rounded-sm bg-white/30" />
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold text-sm">{t.name}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {t.description}
                        </p>
                      </div>
                      {selectedTheme === t.id && (
                        <div className="w-5 h-5 rounded-full bg-[hsl(var(--sidebar-primary))] flex items-center justify-center shrink-0">
                          <Check className="w-3 h-3 text-white" />
                        </div>
                      )}
                    </div>
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-3">
                <Button variant="outline" onClick={() => setStep(1)} className="gap-2">
                  <ArrowLeft className="w-4 h-4" /> Back
                </Button>
                <Button
                  size="lg"
                  className="gap-2"
                  onClick={handleGenerate}
                  disabled={isGenerating}
                >
                  {isGenerating ? (
                    <>
                      <Sparkles className="w-4 h-4 animate-spin" />
                      Generating your deck...
                    </>
                  ) : (
                    <>
                      <Wand2 className="w-4 h-4" />
                      Generate Deck
                    </>
                  )}
                </Button>
              </div>
            </motion.div>
          )}

          {/* ── STEP 3: Deck Preview ── */}
          {step === 3 && slides && (
            <motion.div
              key="step-3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.25 }}
              className="space-y-6"
            >
              {/* Deck toolbar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h2 className="text-xl font-semibold">Your Deck</h2>
                  <p className="text-muted-foreground text-sm mt-0.5">
                    {slides.length} slides &bull; {theme.name} theme &bull;{" "}
                    {audience} audience
                  </p>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-1.5 h-8 text-xs"
                    onClick={handleCopyAll}
                  >
                    {copiedAll ? (
                      <Check className="h-3.5 w-3.5 text-green-600" />
                    ) : (
                      <Copy className="h-3.5 w-3.5" />
                    )}
                    {copiedAll ? "Copied!" : "Copy All"}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-1.5 h-8 text-xs"
                    onClick={handleDownloadAll}
                  >
                    <Download className="h-3.5 w-3.5" />
                    Download .txt
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-1.5 h-8 text-xs"
                    onClick={() => {
                      setSlides(null);
                      setStep(1);
                    }}
                  >
                    New Deck
                  </Button>
                </div>
              </div>

              {error && (
                <div className="rounded-lg bg-destructive/10 border border-destructive/20 px-4 py-3 text-sm text-destructive">
                  {error}
                </div>
              )}

              {/* Slides */}
              <div className="space-y-4">
                {slides.map((slide, i) => (
                  <SlideCard
                    key={i}
                    slide={slide}
                    index={i}
                    theme={theme}
                  />
                ))}
              </div>

              {/* Bottom actions */}
              <div className="flex items-center gap-3 pt-2 pb-4">
                <Button
                  variant="outline"
                  onClick={() => setStep(2)}
                  className="gap-2"
                >
                  <ArrowLeft className="w-4 h-4" /> Back to themes
                </Button>
                <Button
                  onClick={handleGenerate}
                  disabled={isGenerating}
                  className="gap-2"
                >
                  {isGenerating ? (
                    <>
                      <Sparkles className="w-4 h-4 animate-spin" /> Regenerating...
                    </>
                  ) : (
                    <>
                      <Wand2 className="w-4 h-4" /> Regenerate
                    </>
                  )}
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
