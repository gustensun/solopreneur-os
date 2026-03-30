import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Video,
  Sparkles,
  Copy,
  Check,
  ChevronLeft,
  ChevronRight,
  Download,
  Monitor,
  X,
  Clock,
  AlignLeft,
  Wand2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

// ─── Types ─────────────────────────────────────────────────────────────────────

interface VSLStep {
  id: string;
  label: string;
  subtitle: string;
  placeholder: string;
  rows: number;
}

interface VSLScriptSection {
  label: string;
  icon: string;
  content: string;
}

interface VSLInput {
  hook: string;
  problem: string;
  solution: string;
  proof: string;
  cta: string;
  product: string;
  audience: string;
  price: string;
}

// ─── Wizard step definitions ───────────────────────────────────────────────────

const WIZARD_STEPS: VSLStep[] = [
  {
    id: "hook",
    label: "Hook",
    subtitle: "Grab attention in the first 10 seconds",
    placeholder: "e.g. What if I told you there's a way to build a $10k/month business without ever making a cold call or running ads?",
    rows: 3,
  },
  {
    id: "problem",
    label: "Problem",
    subtitle: "Describe the pain your audience feels",
    placeholder: "e.g. Most coaches and consultants are stuck trading time for money, creating content that goes nowhere, and wondering why their offer isn't converting...",
    rows: 4,
  },
  {
    id: "solution",
    label: "Solution",
    subtitle: "Introduce your offer as the bridge",
    placeholder: "e.g. After 3 years and $400k in testing, I discovered a 3-step AI system that completely changed how I run my business...",
    rows: 4,
  },
  {
    id: "proof",
    label: "Proof",
    subtitle: "Share results, testimonials, and credibility",
    placeholder: "e.g. Sarah went from $2k to $11k/month in 8 weeks. Marcus closed his first $5k client in week 3. Emily 10x'd her ROI in month one...",
    rows: 4,
  },
  {
    id: "cta",
    label: "CTA",
    subtitle: "Tell them exactly what to do next",
    placeholder: "e.g. Click the button below this video, fill out the short application, and if you qualify we'll get on a call and map out your personalized roadmap...",
    rows: 3,
  },
];

// ─── Script generator ──────────────────────────────────────────────────────────

function generateVSLScript(input: VSLInput): VSLScriptSection[] {
  const {
    hook,
    problem,
    solution,
    proof,
    cta,
    product,
    audience,
    price,
  } = input;

  const p = product || "The AI Business Accelerator";
  const a = audience || "coaches and consultants";
  const pr = price || "$997";

  const hookText = hook.trim()
    ? `[OPEN ON CAMERA — DIRECT EYE CONTACT]\n\n"${hook.trim()}"\n\n[Pause for 2 seconds. Let it land.]\n\nBecause if you're a ${a} who's tired of working harder and harder with nothing to show for it — this might be the most important video you ever watch.\n\nSo give me the next few minutes. What I'm about to share has changed the trajectory of hundreds of businesses just like yours.`
    : `[OPEN ON CAMERA — DIRECT EYE CONTACT]\n\n"What if you could replace your 9-5 income — working just 4 hours a day — using a system that practically runs itself?"\n\n[Pause for 2 seconds. Let it land.]\n\nIf you're a ${a} who's serious about building real leverage in your business, you're going to want to watch every second of this video.\n\nBecause what I'm about to share is the exact system I used to go from stuck and overwhelmed to consistently generating $20k+ months — without burning out.`;

  const problemText = problem.trim()
    ? `[LEAN FORWARD SLIGHTLY — LOWER YOUR VOICE]\n\nLet me tell you what I see happening with most ${a}...\n\n"${problem.trim()}"\n\nAnd here's the painful part — it's not a hustle problem. You're already working hard. It's not a mindset problem. You already believe you can do this.\n\nIt's a SYSTEMS problem.\n\nMost ${a} are running their business like it's 2015. Manual everything. Inconsistent content. Chasing clients who don't show up. Undercharging because they don't know how to communicate their value.\n\nI know because I was exactly there. And I know the toll it takes.`
    : `[LEAN FORWARD SLIGHTLY — LOWER YOUR VOICE]\n\nHere's the real reason most ${a} never break through...\n\nThey're doing everything right — posting content, attending webinars, buying courses — but nothing seems to compound.\n\nThey're stuck in what I call the "Hamster Wheel" trap. Running fast but going nowhere.\n\nThe real problem? They're using tactics when they need a system. They're creating content nobody sees. They're making offers that don't convert. And they're burning through their time with no leverage.\n\nIf any of that sounds familiar — don't worry. That's exactly why I made this video.`;

  const solutionText = solution.trim()
    ? `[SIT BACK — SMILE — ENERGY SHIFTS TO EXCITED]\n\nHere's what changed everything for me — and for the hundreds of ${a} I've helped since...\n\n"${solution.trim()}"\n\nThis isn't theory. This isn't a rehash of what everyone else is teaching. This is ${p} — the complete, done-for-you system built specifically for ${a} who are ready to stop guessing and start growing.\n\nInside ${p}, you'll get:\n\n→ The AI Content Engine that produces 30 days of content in one afternoon\n→ The Magnetic Offer Framework that attracts your ideal clients automatically\n→ The 5-Step Conversion System that turns followers into paying clients\n→ Done-for-you templates, swipe files, and scripts — ready to deploy immediately\n→ Weekly live coaching to make sure you never get stuck\n\nWe've engineered this so you can see your first real result within 14 days. Not 6 months. 14 days.`
    : `[SIT BACK — SMILE — ENERGY SHIFTS TO EXCITED]\n\nThe breakthrough came when I stopped trying to "work harder" and started building what I call an AI-Powered Business Engine.\n\nIntroducing ${p} — the complete system that helps ${a} go from stuck to scaling using leverage, AI, and proven frameworks.\n\nInside, you get everything you need:\n\n→ The AI Content Batching System — create a month of content in one 4-hour session\n→ The High-Ticket Offer Blueprint — package your expertise into irresistible $3k-$10k offers\n→ The Client Attraction Machine — wake up every morning to inbound leads in your DMs\n→ The AI Delivery System — serve your clients better while working half the hours\n→ Live weekly coaching and a private community of 6 and 7-figure solopreneurs\n\nThis is the exact system. Nothing held back. Everything you need to finally build the business you know you're capable of.`;

  const proofText = proof.trim()
    ? `[SHIFT TO TESTIMONIAL SECTION — WARM TONE]\n\nDon't just take my word for it. Here's what's been happening with the ${a} who've been through ${p}:\n\n"${proof.trim()}"\n\n[On screen: Show screenshots, videos, or written testimonials]\n\nThese aren't cherry-picked outliers. These are typical results for people who show up and implement what I teach.\n\nAnd the thing they all have in common? They were skeptical at first too. They'd been burned before. They weren't sure this would work for them.\n\nBut they took the leap — and it changed everything.`
    : `[SHIFT TO TESTIMONIAL SECTION — WARM TONE]\n\nHere's what's happened with some of the ${a} who've already been through ${p}:\n\n"I went from $2k/month to $11k/month in just 8 weeks. The AI tools alone saved me 20+ hours per week." — Sarah J., Business Coach\n\n"I was skeptical at first, but the results speak for themselves. Closed my first $5k client in week 3 — using the exact scripts from the program." — Marcus C., Consultant\n\n"Finally, a program that actually delivers on its promises. My ROI was 10x in the first month." — Emily R., Online Educator\n\n[On screen: Show real screenshots of results]\n\nOver 500 ${a} have used this exact system. The ones who follow the framework and do the work? They get results. Period.`;

  const ctaText = cta.trim()
    ? `[LEAN FORWARD — DIRECT AND CLEAR]\n\nOkay. Here's what I want you to do right now.\n\n"${cta.trim()}"\n\nLook — you've watched this far for a reason. Something resonated. You're not here by accident.\n\nThe question is: are you ready to stop playing small?\n\nHere's what it costs to join ${p}: ${pr}.\n\nAnd here's what it costs NOT to join: Another 6 months of spinning your wheels. Another year of "almost" breaking through. Another opportunity passing you by while someone else takes the leap you were thinking about.\n\n[PAUSE]\n\nThe button is below this video. Click it now. Fill out the short form. And let's see if this is the right fit for you.\n\nI can't wait to welcome you inside.\n\n[END CARD — Show name, logo, and CTA button]`
    : `[LEAN FORWARD — DIRECT AND CLEAR]\n\nHere's what I want you to do right now:\n\nClick the button below this video. You'll see a short application — it takes less than 2 minutes. Fill it out, and one of my team members will review it and reach out within 24 hours to schedule your onboarding call.\n\nThe investment for ${p} is ${pr}. And yes, there's a money-back guarantee. If you do the work and don't get results within 30 days, we'll refund every penny. No questions asked.\n\nBut here's the thing — I've never had someone ask for a refund who actually showed up and implemented.\n\nThis is the moment. You can close this video and keep doing what you've been doing. Or you can click that button and be part of a different story.\n\nI'll see you on the inside.\n\n[END CARD — Show name, logo, and CTA button]`;

  return [
    { label: "Hook — Attention Grabber", icon: "🎣", content: hookText },
    { label: "Problem — The Pain", icon: "😤", content: problemText },
    { label: "Solution — Your Offer", icon: "💡", content: solutionText },
    { label: "Proof — Testimonials & Credibility", icon: "⭐", content: proofText },
    { label: "CTA — The Close", icon: "🚀", content: ctaText },
  ];
}

function countWords(text: string): number {
  return text
    .trim()
    .split(/\s+/)
    .filter(Boolean).length;
}

function estimateDuration(wordCount: number): string {
  // Average speaking pace: ~130 words/minute
  const minutes = wordCount / 130;
  if (minutes < 1) return `~${Math.round(minutes * 60)}s`;
  const m = Math.floor(minutes);
  const s = Math.round((minutes - m) * 60);
  return s > 0 ? `~${m}m ${s}s` : `~${m}m`;
}

// ─── Teleprompter Modal ────────────────────────────────────────────────────────

function TeleprompterModal({
  script,
  onClose,
}: {
  script: VSLScriptSection[];
  onClose: () => void;
}) {
  const fullText = script.map((s) => `${s.label.toUpperCase()}\n\n${s.content}`).join("\n\n\n");
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isScrolling, setIsScrolling] = useState(false);
  const [speed, setSpeed] = useState(2); // px per frame
  const animRef = useRef<number | null>(null);

  useEffect(() => {
    if (isScrolling && scrollRef.current) {
      let lastTime = performance.now();
      const scroll = (now: number) => {
        const delta = now - lastTime;
        lastTime = now;
        if (scrollRef.current) {
          scrollRef.current.scrollTop += (speed * delta) / 16;
        }
        animRef.current = requestAnimationFrame(scroll);
      };
      animRef.current = requestAnimationFrame(scroll);
    } else {
      if (animRef.current) cancelAnimationFrame(animRef.current);
    }
    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
  }, [isScrolling, speed]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black flex flex-col"
    >
      {/* Controls */}
      <div className="flex items-center justify-between px-6 py-3 bg-black/80 border-b border-white/10">
        <div className="flex items-center gap-3">
          <Monitor className="h-5 w-5 text-green-400" />
          <span className="text-white font-semibold text-sm">Teleprompter Mode</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-white/60 text-xs">Speed</span>
            <input
              type="range"
              min={0.5}
              max={6}
              step={0.5}
              value={speed}
              onChange={(e) => setSpeed(Number(e.target.value))}
              className="w-24 accent-green-400"
            />
            <span className="text-white/60 text-xs w-8">{speed}x</span>
          </div>
          <Button
            size="sm"
            onClick={() => setIsScrolling((v) => !v)}
            className={cn(
              "text-xs h-8",
              isScrolling
                ? "bg-red-500 hover:bg-red-600 text-white"
                : "bg-green-500 hover:bg-green-600 text-white"
            )}
          >
            {isScrolling ? "Pause" : "Start Scroll"}
          </Button>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-white/10 text-white/60 hover:text-white transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Script */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto px-8 py-16"
        style={{ scrollbarWidth: "none" }}
      >
        <div className="max-w-3xl mx-auto">
          <p className="text-white/90 leading-loose whitespace-pre-wrap"
             style={{ fontSize: "2rem", lineHeight: "3rem", fontWeight: 400 }}>
            {fullText}
          </p>
          <div className="h-[50vh]" />
        </div>
      </div>
    </motion.div>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────────

export default function VSLGeneratorPage() {
  // Meta fields
  const [product, setProduct] = useState("");
  const [audience, setAudience] = useState("");
  const [price, setPrice] = useState("");

  // Wizard inputs
  const [stepInputs, setStepInputs] = useState<Record<string, string>>({
    hook: "",
    problem: "",
    solution: "",
    proof: "",
    cta: "",
  });

  const [currentStep, setCurrentStep] = useState(0);
  const [isGenerating, setIsGenerating] = useState(false);
  const [script, setScript] = useState<VSLScriptSection[] | null>(null);
  const [copied, setCopied] = useState<string | null>(null);
  const [teleprompterOpen, setTeleprompterOpen] = useState(false);

  const totalSteps = WIZARD_STEPS.length;
  const progress = Math.round(((currentStep + 1) / totalSteps) * 100);

  const fullScriptText = script
    ? script.map((s) => `## ${s.label}\n\n${s.content}`).join("\n\n---\n\n")
    : "";
  const wordCount = countWords(fullScriptText);
  const duration = estimateDuration(wordCount);

  function updateInput(stepId: string, value: string) {
    setStepInputs((prev) => ({ ...prev, [stepId]: value }));
  }

  async function handleGenerate() {
    setIsGenerating(true);
    setScript(null);
    await new Promise((r) => setTimeout(r, 600));
    setScript(
      generateVSLScript({
        hook: stepInputs.hook,
        problem: stepInputs.problem,
        solution: stepInputs.solution,
        proof: stepInputs.proof,
        cta: stepInputs.cta,
        product,
        audience,
        price,
      })
    );
    setIsGenerating(false);
  }

  async function handleCopy(text: string, key: string) {
    await navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(null), 1800);
  }

  async function handleCopyAll() {
    await navigator.clipboard.writeText(fullScriptText);
    setCopied("all");
    setTimeout(() => setCopied(null), 1800);
  }

  function handleDownload() {
    if (!script) return;
    const blob = new Blob([fullScriptText], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${(product || "VSL-Script").replace(/[^a-z0-9]/gi, "-")}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  }

  const currentWizardStep = WIZARD_STEPS[currentStep];

  return (
    <>
      <AnimatePresence>
        {teleprompterOpen && script && (
          <TeleprompterModal
            script={script}
            onClose={() => setTeleprompterOpen(false)}
          />
        )}
      </AnimatePresence>

      <div className="page-container">
        {/* Header */}
        <div className="page-header">
          <div className="flex items-center gap-2 mb-1">
            <div className="p-1.5 rounded-lg bg-primary/10">
              <Video className="h-5 w-5 text-primary" />
            </div>
            <h1 className="page-title">VSL Generator</h1>
          </div>
          <p className="page-description">
            Build a compelling Video Sales Letter script step-by-step with AI guidance.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* ── Left: Wizard ── */}
          <div className="space-y-4">
            {/* Meta fields */}
            <div className="glass-card p-5 space-y-4">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                Offer Details
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="vsl-product">Product Name</Label>
                  <Input
                    id="vsl-product"
                    placeholder="e.g. AI Accelerator"
                    value={product}
                    onChange={(e) => setProduct(e.target.value)}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="vsl-audience">Audience</Label>
                  <Input
                    id="vsl-audience"
                    placeholder="e.g. coaches"
                    value={audience}
                    onChange={(e) => setAudience(e.target.value)}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="vsl-price">Price</Label>
                  <Input
                    id="vsl-price"
                    placeholder="e.g. $997"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* Step wizard */}
            <div className="glass-card p-5">
              {/* Progress bar */}
              <div className="mb-5">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">
                    Step{" "}
                    <span className="text-primary font-semibold">{currentStep + 1}</span>
                    {" "}of{" "}
                    <span className="font-semibold">{totalSteps}</span>
                    {" "}—{" "}
                    <span className="text-muted-foreground">{currentWizardStep.label}</span>
                  </span>
                  <span className="text-sm text-muted-foreground">{progress}%</span>
                </div>
                <Progress value={progress} className="h-2 mb-3" />

                {/* Step indicators */}
                <div className="flex gap-2">
                  {WIZARD_STEPS.map((step, i) => {
                    const filled = stepInputs[step.id]?.trim().length > 0;
                    return (
                      <button
                        key={step.id}
                        onClick={() => setCurrentStep(i)}
                        className={cn(
                          "flex-1 py-1.5 rounded-md text-xs font-medium transition-all border",
                          i === currentStep
                            ? "bg-primary text-primary-foreground border-primary"
                            : filled
                            ? "bg-primary/15 text-primary border-primary/30"
                            : "bg-muted/40 text-muted-foreground border-border/40 hover:bg-muted"
                        )}
                      >
                        {step.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Current step input */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentStep}
                  initial={{ opacity: 0, x: 16 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -16 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-3"
                >
                  <div>
                    <Label
                      htmlFor={`vsl-step-${currentStep}`}
                      className="text-base font-semibold"
                    >
                      {currentWizardStep.label}
                    </Label>
                    <p className="text-sm text-muted-foreground mt-0.5">
                      {currentWizardStep.subtitle}
                    </p>
                  </div>

                  <Textarea
                    id={`vsl-step-${currentStep}`}
                    placeholder={currentWizardStep.placeholder}
                    value={stepInputs[currentWizardStep.id] || ""}
                    onChange={(e) => updateInput(currentWizardStep.id, e.target.value)}
                    rows={currentWizardStep.rows + 2}
                    className="resize-none"
                  />

                  <p className="text-xs text-muted-foreground">
                    Leave blank for AI-generated content — or add your own notes for a personalized script.
                  </p>
                </motion.div>
              </AnimatePresence>

              {/* Navigation */}
              <div className="flex items-center justify-between mt-5">
                <Button
                  variant="outline"
                  onClick={() => setCurrentStep((s) => Math.max(0, s - 1))}
                  disabled={currentStep === 0}
                >
                  <ChevronLeft className="h-4 w-4" />
                  Back
                </Button>

                {currentStep < totalSteps - 1 ? (
                  <Button onClick={() => setCurrentStep((s) => s + 1)}>
                    Next
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                ) : (
                  <Button
                    onClick={handleGenerate}
                    disabled={isGenerating}
                    className="bg-[hsl(var(--forest))] hover:bg-[hsl(var(--forest-light))] text-[hsl(var(--primary-foreground))] gap-2"
                  >
                    {isGenerating ? (
                      <>
                        <Sparkles className="h-4 w-4 animate-spin" />
                        Generating Script...
                      </>
                    ) : (
                      <>
                        <Wand2 className="h-4 w-4" />
                        Generate VSL Script
                      </>
                    )}
                  </Button>
                )}
              </div>
            </div>
          </div>

          {/* ── Right: Output ── */}
          <div className="glass-card p-6 flex flex-col gap-4 max-h-[820px] overflow-y-auto">
            {/* Toolbar */}
            <div className="flex items-center justify-between sticky top-0 bg-card/95 backdrop-blur pb-2 -mb-2 z-10">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                Script Preview
              </h2>
              {script && (
                <div className="flex items-center gap-2">
                  {/* Word count & duration */}
                  <div className="flex items-center gap-2 text-xs text-muted-foreground mr-1">
                    <span className="flex items-center gap-1">
                      <AlignLeft className="h-3 w-3" />
                      {wordCount.toLocaleString()} words
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {duration}
                    </span>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-1.5 h-8 text-xs"
                    onClick={() => setTeleprompterOpen(true)}
                  >
                    <Monitor className="h-3.5 w-3.5" />
                    Teleprompter
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-1.5 h-8 text-xs"
                    onClick={handleDownload}
                  >
                    <Download className="h-3.5 w-3.5" />
                    Download
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-1.5 h-8 text-xs"
                    onClick={handleCopyAll}
                  >
                    {copied === "all" ? (
                      <Check className="h-3.5 w-3.5 text-green-600" />
                    ) : (
                      <Copy className="h-3.5 w-3.5" />
                    )}
                    {copied === "all" ? "Copied!" : "Copy All"}
                  </Button>
                </div>
              )}
            </div>

            {/* Loading skeleton */}
            {isGenerating && (
              <div className="space-y-4 pt-2">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="rounded-xl border border-border/60 bg-background/60 p-4 animate-pulse">
                    <div className="h-4 w-48 bg-muted rounded mb-3" />
                    <div className="space-y-2">
                      <div className="h-3 w-full bg-muted/60 rounded" />
                      <div className="h-3 w-5/6 bg-muted/60 rounded" />
                      <div className="h-3 w-4/5 bg-muted/60 rounded" />
                      <div className="h-3 w-full bg-muted/60 rounded" />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Empty state */}
            {!isGenerating && !script && (
              <div className="flex-1 flex flex-col items-center justify-center text-center py-16 text-muted-foreground">
                <Video className="h-12 w-12 mb-4 opacity-20" />
                <p className="font-medium">Your VSL script will appear here</p>
                <p className="text-sm mt-1 opacity-70">
                  Complete the wizard steps and click Generate
                </p>

                {/* Step checklist */}
                <div className="mt-6 space-y-1.5 text-left w-full max-w-xs">
                  {WIZARD_STEPS.map((step, i) => {
                    const filled = stepInputs[step.id]?.trim().length > 0;
                    return (
                      <div
                        key={step.id}
                        className={cn(
                          "flex items-center gap-2 text-xs px-3 py-1.5 rounded-lg",
                          filled ? "text-primary bg-primary/8" : "text-muted-foreground"
                        )}
                      >
                        <span
                          className={cn(
                            "h-4 w-4 rounded-full border flex items-center justify-center text-[9px] font-bold shrink-0",
                            filled
                              ? "border-primary bg-primary text-primary-foreground"
                              : "border-border"
                          )}
                        >
                          {i + 1}
                        </span>
                        <span>{step.label}</span>
                        {filled && (
                          <Check className="h-3 w-3 ml-auto text-primary shrink-0" />
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Script output */}
            <AnimatePresence>
              {script && !isGenerating && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-3 pt-1"
                >
                  {script.map((section, i) => (
                    <motion.div
                      key={section.label}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.07 }}
                      className="rounded-xl border border-border/60 bg-background/60 p-4"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <span className="text-base">{section.icon}</span>
                          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                            {section.label}
                          </span>
                        </div>
                        <button
                          onClick={() => handleCopy(section.content, `section-${i}`)}
                          className="p-1 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                          title="Copy section"
                        >
                          {copied === `section-${i}` ? (
                            <Check className="h-3.5 w-3.5 text-green-600" />
                          ) : (
                            <Copy className="h-3.5 w-3.5" />
                          )}
                        </button>
                      </div>
                      <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap font-mono text-[13px]">
                        {section.content}
                      </p>
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </>
  );
}
