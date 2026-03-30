import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Megaphone, Sparkles, Copy, Check, RotateCcw, Wand2, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

// ─── Types ─────────────────────────────────────────────────────────────────────

interface AdVariation {
  id: string;
  label: string;
  headline: string;
  body: string;
  cta: string;
  platformNote: string;
}

// ─── Mock output generator ─────────────────────────────────────────────────────

function generateAdVariations(fields: {
  product: string;
  audience: string;
  tone: string;
  platform: string;
  benefit: string;
  ctaText: string;
}): AdVariation[] {
  const { product, audience, tone, platform, benefit, ctaText } = fields;
  const p = product || "AI Business Accelerator";
  const a = audience || "entrepreneurs";
  const b = benefit || "grow your income with AI-powered systems";
  const c = ctaText || "Get Started Today";

  const platformNote: Record<string, string> = {
    Facebook: "Optimized for Facebook Feed & Stories | Recommended size: 1200×628px | Max 125 chars primary text",
    Instagram: "Optimized for Instagram Feed & Reels | Recommended size: 1080×1080px | Keep copy punchy",
    Google: "Optimized for Google Display Network | Headline: 30 chars | Description: 90 chars",
    LinkedIn: "Optimized for LinkedIn Feed | Professional tone recommended | 150 char intro",
    TikTok: "Optimized for TikTok In-Feed Ads | Hook in first 3 seconds | Keep energy high",
  };

  const note = platformNote[platform] || platformNote.Facebook;

  const toneVariants: {
    Professional: [string, string, string][];
    Casual: [string, string, string][];
    Urgent: [string, string, string][];
    Playful: [string, string, string][];
  } = {
    Professional: [
      [
        `Elevate Your Business with ${p}`,
        `Are you a ${a} ready to achieve measurable, lasting results?\n\n${p} gives you the proven framework to ${b} — without guesswork or wasted time.\n\nKey advantages:\n• Systematic approach with clear milestones\n• Expert-backed methodology with proven ROI\n• Designed specifically for ${a}\n\nJoin the professionals who've already made the leap.`,
        c,
      ],
      [
        `The Strategic Edge for ${a.charAt(0).toUpperCase() + a.slice(1)}`,
        `High performance doesn't happen by accident.\n\nWith ${p}, you'll gain access to the exact systems and frameworks used by industry-leading ${a} to ${b}.\n\nWhat's included:\n• Step-by-step implementation roadmap\n• Done-for-you templates and tools\n• Expert support every step of the way\n\nYour results-driven journey begins here.`,
        c,
      ],
      [
        `${p}: The Professional's Choice for Scalable Growth`,
        `The most successful ${a} share one thing in common: systems that work without them.\n\n${p} was built to give you exactly that — the structure, tools, and frameworks to ${b} while working smarter, not harder.\n\nSchedule your complimentary strategy consultation today.`,
        `${c} →`,
      ],
    ],
    Casual: [
      [
        `Okay ${a}, this changes everything 👀`,
        `Real talk — if you're trying to ${b}, you NEED to know about ${p}.\n\nNo fluff. No BS. Just the stuff that actually works:\n✅ Built for ${a} like you\n✅ See results in 14 days or less\n✅ No tech skills required\n\nSo many people asked us to open this up again — so here we are. Don't sleep on it.`,
        `${c} 🚀`,
      ],
      [
        `Wait… ${a} are doing WHAT with ${p}? 😮`,
        `I wasn't going to share this publicly, but here we go.\n\nWe've been quietly helping ${a} ${b} — and the results have been a little unreal.\n\nHere's the deal:\n• Super simple to get started\n• Works even if you've tried other things and failed\n• Our community will have your back 24/7\n\nCurious? You should be.`,
        `Yeah, I want in — ${c}`,
      ],
      [
        `The ${p} secret that ${a} are obsessed with 🔥`,
        `Look, I'll keep this short because you're busy.\n\n${p} helps ${a} ${b}. It works. People love it. We have the receipts.\n\nClick the button. See for yourself. You can thank me later.`,
        `${c} (you won't regret it)`,
      ],
    ],
    Urgent: [
      [
        `⚠️ LAST CALL: ${p} Closes in 48 Hours`,
        `This is not a drill.\n\nWe're closing the doors on ${p} at midnight on Friday — and we don't know when (or if) we'll open them again.\n\n${a.charAt(0).toUpperCase() + a.slice(1)} who join now will:\n🔥 ${b}\n🔥 Get all current and future bonuses\n🔥 Lock in the founding member price\n\n${Math.floor(Math.random() * 40) + 12} spots remaining as of right now.`,
        `⚡ CLAIM YOUR SPOT NOW — Before It's Gone`,
      ],
      [
        `The price goes up in 24 hours. This is your warning.`,
        `Starting tomorrow, ${p} increases to $1,997.\n\nRight now, you can still get in at the founding member rate — but only until the clock hits zero.\n\nThis is your last chance to ${b} at the lowest investment we'll ever offer.\n\nDon't wake up tomorrow wishing you acted today.`,
        `Lock in the current price — ${c}`,
      ],
      [
        `${a.charAt(0).toUpperCase() + a.slice(1)}: Don't let this one slip away`,
        `Every week I talk to ${a} who say: "I wish I had started sooner."\n\nDon't be that person.\n\n${p} gives you everything you need to ${b} — starting this week. Not someday. This week.\n\nBut this offer isn't available forever. Join now while the doors are still open.`,
        `${c} — Time is Running Out`,
      ],
    ],
    Playful: [
      [
        `Psst… we found the cheat code for ${a} 🎮`,
        `What if building a successful business was actually... fun?\n\n${p} makes it happen. We've gamified the whole process so you can:\n🎯 Level up your income\n✨ Unlock new skills every week\n🏆 Join a community of winners\n\nWe've helped hundreds of ${a} ${b} — and they had a blast doing it. Your turn.`,
        `${c} — Let's Play 🎮`,
      ],
      [
        `Warning: ${p} may cause excessive success 😂`,
        `Side effects of joining ${p} include:\n\n😎 Actually enjoying your work\n💸 More income than you thought possible\n🙌 A community that hypes you up daily\n😴 Finally sleeping well at night\n🚀 The ability to ${b}\n\nConsult your accountant before proceeding. Results may exceed expectations.`,
        `I'll take the side effects — ${c}!`,
      ],
      [
        `We dare you to find a better way to ${b} 🤷`,
        `Go ahead. Look around. Compare everything.\n\nWe'll wait.\n\n...\n\nStill here? Good. Because ${p} is genuinely the best thing we've built for ${a} who want to ${b} without taking themselves too seriously.\n\nJoin us. We have snacks. (Metaphorically. But also — great community vibes.)`,
        `${c} — I accept the dare`,
      ],
    ],
  };

  const variations = toneVariants[tone as keyof typeof toneVariants] || toneVariants.Professional;

  return variations.map((v, i) => ({
    id: `v${i + 1}`,
    label: `Version ${i + 1}`,
    headline: v[0],
    body: v[1],
    cta: v[2],
    platformNote: note,
  }));
}

// ─── Component ─────────────────────────────────────────────────────────────────

export default function AdWriterPage() {
  const [product, setProduct] = useState("");
  const [audience, setAudience] = useState("");
  const [tone, setTone] = useState("Professional");
  const [platform, setPlatform] = useState("Facebook");
  const [benefit, setBenefit] = useState("");
  const [ctaText, setCtaText] = useState("");

  const [isGenerating, setIsGenerating] = useState(false);
  const [variations, setVariations] = useState<AdVariation[] | null>(null);
  const [activeTab, setActiveTab] = useState(0);
  const [copied, setCopied] = useState<string | null>(null);

  async function handleGenerate() {
    setIsGenerating(true);
    setVariations(null);
    setActiveTab(0);
    await new Promise((r) => setTimeout(r, 550));
    setVariations(generateAdVariations({ product, audience, tone, platform, benefit, ctaText }));
    setIsGenerating(false);
  }

  async function handleCopy(text: string, key: string) {
    await navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(null), 1800);
  }

  async function handleCopyAll() {
    if (!variations) return;
    const full = variations
      .map(
        (v) =>
          `=== ${v.label} ===\n\nHEADLINE:\n${v.headline}\n\nBODY:\n${v.body}\n\nCTA:\n${v.cta}\n\n${v.platformNote}`
      )
      .join("\n\n" + "─".repeat(40) + "\n\n");
    await navigator.clipboard.writeText(full);
    setCopied("all");
    setTimeout(() => setCopied(null), 1800);
  }

  function handleDownloadAll() {
    if (!variations) return;
    const full = variations
      .map(
        (v) =>
          `=== ${v.label} ===\n\nHEADLINE:\n${v.headline}\n\nBODY:\n${v.body}\n\nCTA:\n${v.cta}\n\n${v.platformNote}`
      )
      .join("\n\n" + "─".repeat(40) + "\n\n");
    const blob = new Blob([full], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${(product || "ad-copy").replace(/[^a-z0-9]/gi, "-")}-${platform.toLowerCase()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  }

  const activeVariation = variations?.[activeTab] ?? null;

  return (
    <div className="page-container">
      {/* Header */}
      <div className="page-header">
        <div className="flex items-center gap-2 mb-1">
          <div className="p-1.5 rounded-lg bg-primary/10">
            <Megaphone className="h-5 w-5 text-primary" />
          </div>
          <h1 className="page-title">Ad Writer</h1>
        </div>
        <p className="page-description">
          Create high-converting ad copy in 3 variations for any platform in seconds.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* ── Left: Form ── */}
        <div className="glass-card p-6 space-y-5">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            Ad Details
          </h2>

          <div className="space-y-2">
            <Label htmlFor="product">Product / Service Name</Label>
            <Input
              id="product"
              placeholder="e.g. AI Business Accelerator"
              value={product}
              onChange={(e) => setProduct(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="audience">Target Audience</Label>
            <Input
              id="audience"
              placeholder="e.g. Coaches & consultants earning under $10k/month"
              value={audience}
              onChange={(e) => setAudience(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="benefit">Key Benefit</Label>
            <Textarea
              id="benefit"
              placeholder="e.g. Triple your income in 90 days using AI-powered systems without burning out"
              value={benefit}
              onChange={(e) => setBenefit(e.target.value)}
              rows={2}
              className="resize-none"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="cta-text">CTA Text</Label>
            <Input
              id="cta-text"
              placeholder="e.g. Get Instant Access, Book Your Call, Start Free Trial"
              value={ctaText}
              onChange={(e) => setCtaText(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">Leave blank to auto-generate based on tone</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Ad Platform</Label>
              <Select value={platform} onValueChange={setPlatform}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Facebook">Facebook</SelectItem>
                  <SelectItem value="Instagram">Instagram</SelectItem>
                  <SelectItem value="Google">Google</SelectItem>
                  <SelectItem value="LinkedIn">LinkedIn</SelectItem>
                  <SelectItem value="TikTok">TikTok</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Tone</Label>
              <Select value={tone} onValueChange={setTone}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Professional">Professional</SelectItem>
                  <SelectItem value="Casual">Casual</SelectItem>
                  <SelectItem value="Urgent">Urgent</SelectItem>
                  <SelectItem value="Playful">Playful</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button
            onClick={handleGenerate}
            disabled={isGenerating}
            className="w-full bg-[hsl(var(--forest))] hover:bg-[hsl(var(--forest-light))] text-[hsl(var(--primary-foreground))] gap-2"
            size="lg"
          >
            {isGenerating ? (
              <>
                <Sparkles className="h-4 w-4 animate-spin" />
                Generating 3 Variations...
              </>
            ) : (
              <>
                <Wand2 className="h-4 w-4" />
                Generate Ad Copy
              </>
            )}
          </Button>
        </div>

        {/* ── Right: Output ── */}
        <div className="glass-card p-6 flex flex-col gap-5">
          {/* Toolbar */}
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              Generated Output
            </h2>
            {variations && (
              <div className="flex gap-2">
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
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-1.5 h-8 text-xs"
                  onClick={handleDownloadAll}
                >
                  <Download className="h-3.5 w-3.5" />
                  Download
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-1.5 h-8 text-xs"
                  onClick={handleGenerate}
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  Regenerate
                </Button>
              </div>
            )}
          </div>

          {/* Loading skeleton */}
          {isGenerating && (
            <div className="space-y-4">
              <div className="flex gap-2">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-8 flex-1 rounded-lg" />
                ))}
              </div>
              <div className="space-y-2">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-8 w-full" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-28 w-full" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-4 w-12" />
                <Skeleton className="h-8 w-3/4" />
              </div>
            </div>
          )}

          {/* Empty state */}
          {!isGenerating && !variations && (
            <div className="flex-1 flex flex-col items-center justify-center text-center py-16 text-muted-foreground">
              <Megaphone className="h-12 w-12 mb-4 opacity-20" />
              <p className="font-medium">Your ad copy will appear here</p>
              <p className="text-sm mt-1 opacity-70">
                Fill in the details and click Generate to get 3 unique variations
              </p>
            </div>
          )}

          {/* Tab + output */}
          <AnimatePresence>
            {variations && !isGenerating && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="space-y-4"
              >
                {/* Variation tabs */}
                <div className="flex gap-2">
                  {variations.map((v, i) => (
                    <button
                      key={v.id}
                      onClick={() => setActiveTab(i)}
                      className={cn(
                        "flex-1 py-2 rounded-lg text-sm font-medium transition-all border",
                        activeTab === i
                          ? "bg-primary text-primary-foreground border-primary"
                          : "border-border/60 text-muted-foreground hover:bg-muted/60"
                      )}
                    >
                      {v.label}
                    </button>
                  ))}
                </div>

                {/* Active variation content */}
                <AnimatePresence mode="wait">
                  {activeVariation && (
                    <motion.div
                      key={activeTab}
                      initial={{ opacity: 0, x: 8 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -8 }}
                      transition={{ duration: 0.18 }}
                      className="space-y-3"
                    >
                      {/* Platform note */}
                      <div className="text-xs text-muted-foreground bg-muted/50 rounded-lg px-3 py-2">
                        📍 {activeVariation.platformNote}
                      </div>

                      {/* Headline */}
                      <OutputSection
                        label="Headline"
                        content={activeVariation.headline}
                        onCopy={() => handleCopy(activeVariation.headline, `${activeTab}-headline`)}
                        copied={copied === `${activeTab}-headline`}
                        contentClass="text-base font-semibold leading-snug"
                      />

                      {/* Body */}
                      <OutputSection
                        label="Body Copy"
                        content={activeVariation.body}
                        onCopy={() => handleCopy(activeVariation.body, `${activeTab}-body`)}
                        copied={copied === `${activeTab}-body`}
                        contentClass="text-sm leading-relaxed whitespace-pre-line"
                      />

                      {/* CTA */}
                      <OutputSection
                        label="Call to Action"
                        content={activeVariation.cta}
                        onCopy={() => handleCopy(activeVariation.cta, `${activeTab}-cta`)}
                        copied={copied === `${activeTab}-cta`}
                        contentClass="text-sm font-semibold text-[hsl(var(--forest-light))]"
                      />
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

// ─── OutputSection helper ──────────────────────────────────────────────────────

function OutputSection({
  label,
  content,
  onCopy,
  copied,
  contentClass,
}: {
  label: string;
  content: string;
  onCopy: () => void;
  copied: boolean;
  contentClass?: string;
}) {
  return (
    <div className="rounded-xl border border-border/60 bg-background/60 p-4">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          {label}
        </span>
        <button
          onClick={onCopy}
          className="p-1 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
          title="Copy"
        >
          {copied ? (
            <Check className="h-3.5 w-3.5 text-green-600" />
          ) : (
            <Copy className="h-3.5 w-3.5" />
          )}
        </button>
      </div>
      <p className={cn("text-foreground", contentClass)}>{content}</p>
    </div>
  );
}
