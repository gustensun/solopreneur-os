import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FileText, Sparkles, Copy, Check, RotateCcw, Wand2, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { getAnthropicClient, resolveApiKey } from "@/lib/ai";
import { useUserStore } from "@/stores/user";
import { useContextStore } from "@/stores/context";

// ─── Mock generator ────────────────────────────────────────────────────────────

interface SalesPageOutput {
  headline: string;
  subheadline: string;
  problem: string;
  solution: string;
  benefits: string;
  testimonials: string;
  offer: string;
  guarantee: string;
  cta: string;
}

function generateSalesPage(fields: {
  product: string;
  audience: string;
  painPoints: string;
  benefits: string;
  price: string;
  guarantee: string;
}): SalesPageOutput {
  const { product, audience, painPoints, benefits, price, guarantee } = fields;
  const p = product || "The Accelerator";
  const a = audience || "entrepreneurs";
  const pr = price || "$997";
  const g = guarantee || "30-day money-back";

  const benefitList = benefits
    ? benefits.split(",").map((b) => `✓ ${b.trim()}`).join("\n")
    : "✓ Go from zero to $10k/month in 90 days\n✓ Done-for-you AI content systems\n✓ Weekly live coaching calls\n✓ Private community access\n✓ Lifetime access to all updates";

  const painList = painPoints
    ? painPoints.split(",").map((p) => `• ${p.trim()}`).join("\n")
    : "• Spending hours creating content with zero results\n• Watching competitors grow while you stay stuck\n• Trading time for money with no leverage\n• Overwhelmed by shiny objects and conflicting advice";

  return {
    headline: `How ${a.charAt(0).toUpperCase() + a.slice(1)} Are Using AI to Build a 6-Figure Business in 90 Days — Without Burning Out`,
    subheadline: `Introducing ${p}: The proven system that helps ${a} replace their 9-5 income using AI-powered leverage and irresistible offers.`,
    problem: `Here's the uncomfortable truth...\n\nMost ${a} are working harder than ever but getting nowhere. Sound familiar?\n\n${painList}\n\nYou've tried everything. The courses. The coaches. The late nights. And yet, the results just aren't matching the effort.\n\nHere's what nobody tells you: it's not a hustle problem. It's a systems problem.`,
    solution: `Introducing ${p} — the all-in-one AI-powered business system built specifically for ${a} who are serious about creating real leverage.\n\nInstead of grinding through content, you'll deploy AI systems that work while you sleep. Instead of chasing clients, you'll have a magnetic offer that attracts them. Instead of guessing what works, you'll follow a proven playbook used by hundreds of successful ${a}.\n\nThis isn't another info product. It's an implementation system designed to get you results fast.`,
    benefits: `Here's everything you get inside ${p}:\n\n${benefitList}\n\nPlus exclusive bonuses:\n→ Bonus #1: AI Content Calendar Template (Value: $297)\n→ Bonus #2: High-Ticket Offer Swipe File (Value: $197)\n→ Bonus #3: Private Slack Community (Value: Priceless)`,
    testimonials: `"I went from $2k/month to $11k/month in just 8 weeks following this exact system. The AI tools alone saved me 20+ hours per week." — Sarah J., Business Coach\n\n"I was skeptical at first, but the results speak for themselves. Closed my first $5k client in week 3." — Marcus C., Consultant\n\n"Finally, a program that actually delivers on its promises. My ROI was 10x in the first month." — Emily R., Online Educator`,
    offer: `Here's everything you get when you join ${p} today:\n\n• Complete ${p} Framework (Value: $1,997)\n• 12 weeks of live group coaching (Value: $2,400)\n• AI Business Toolkit with 50+ templates (Value: $497)\n• Private mastermind community (Value: $997)\n• Bonus bundle (Value: $494)\n\nTotal Real-World Value: $6,385\nYour Investment Today: ${pr}`,
    guarantee: `The "${guarantee.includes("money") ? guarantee : g + " Money-Back"}" Guarantee\n\nIf you show up, do the work, and don't see results within the guarantee period — we'll refund every single penny. No questions asked. No hoops to jump through.\n\nWe can make this promise because we've seen it work for hundreds of ${a} just like you. The risk is entirely on us.`,
    cta: `YES! I'm Ready to Build My AI-Powered Business!\n\nJoin ${p} Today for just ${pr}\n\n🔒 Secure checkout | 💳 All major cards accepted | 🛡️ ${g} guarantee`,
  };
}

// ─── Component ─────────────────────────────────────────────────────────────────

const SECTIONS: { key: keyof SalesPageOutput; label: string; emoji: string }[] = [
  { key: "headline", label: "Headline", emoji: "🎯" },
  { key: "subheadline", label: "Sub-Headline", emoji: "📌" },
  { key: "problem", label: "Problem Section", emoji: "😤" },
  { key: "solution", label: "Solution", emoji: "💡" },
  { key: "benefits", label: "Benefits & What You Get", emoji: "🎁" },
  { key: "testimonials", label: "Social Proof", emoji: "⭐" },
  { key: "offer", label: "The Offer Stack", emoji: "💎" },
  { key: "guarantee", label: "Guarantee", emoji: "🛡️" },
  { key: "cta", label: "Call to Action", emoji: "🚀" },
];

export default function CopyWriterPage() {
  const [product, setProduct] = useState("");
  const [audience, setAudience] = useState("");
  const [painPoints, setPainPoints] = useState("");
  const [benefits, setBenefits] = useState("");
  const [price, setPrice] = useState("");
  const [guarantee, setGuarantee] = useState("");

  const [isGenerating, setIsGenerating] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [output, setOutput] = useState<SalesPageOutput | null>(null);
  const [copied, setCopied] = useState<string | null>(null);

  const { user } = useUserStore();
  const { getContextString } = useContextStore();

  async function handleGenerate() {
    setIsGenerating(true);
    setOutput(null);

    const apiKey = resolveApiKey(user.anthropicApiKey);

    if (apiKey) {
      try {
        setIsStreaming(true);
        const client = getAnthropicClient(apiKey);
        const contextString = getContextString();

        let fullText = "";
        const stream = await client.messages.stream({
          model: "claude-sonnet-4-5",
          max_tokens: 6000,
          system: `You are a world-class direct response copywriter. Write sales page copy that converts. Be specific, use power words, address objections, and create urgency. Never be generic.`,
          messages: [
            {
              role: "user",
              content: `Write a complete, high-converting sales page for:

Business Context:
${contextString}

Product Details:
- Product / Offer Name: ${product || "The Accelerator"}
- Target Audience: ${audience || "entrepreneurs"}
- Pain Points: ${painPoints || "struggling to get clients, no systems, trading time for money"}
- Key Benefits: ${benefits || "go from 0 to $10k/month, done-for-you systems, weekly coaching"}
- Price: ${price || "$997"}
- Guarantee: ${guarantee || "30-day money-back"}

Return ONLY a valid JSON object with exactly these keys:
{
  "headline": "Main headline — bold, specific, outcome-driven",
  "subheadline": "Supporting subheadline that bridges desire and offer",
  "problem": "Problem section — agitate the pain, make it visceral and real",
  "solution": "Solution section — introduce the offer as the answer, build desire",
  "benefits": "Benefits section — list all key benefits and bonuses with value",
  "testimonials": "Social proof section — 2-3 compelling testimonials with results",
  "offer": "The full offer stack — everything included with real/perceived value",
  "guarantee": "The guarantee — make it bold and risk-reversing",
  "cta": "Call to action — urgent, specific, action-oriented"
}

Write every section as if this is a real product with real results. Be specific with numbers. Use power words. Address the reader's exact fears and desires.`,
            },
          ],
        });

        for await (const chunk of stream) {
          if (
            chunk.type === "content_block_delta" &&
            chunk.delta.type === "text_delta"
          ) {
            fullText += chunk.delta.text;
          }
        }

        setIsStreaming(false);

        const jsonMatch = fullText.match(/\{[\s\S]*\}/);
        if (!jsonMatch) throw new Error("No JSON object found in response");

        const parsed = JSON.parse(jsonMatch[0]) as SalesPageOutput;
        setOutput(parsed);
      } catch (err) {
        console.error("AI sales page generation failed:", err);
        setIsStreaming(false);
        // Fallback to template
        setOutput(generateSalesPage({ product, audience, painPoints, benefits, price, guarantee }));
      }
    } else {
      // No API key — use template fallback
      await new Promise((r) => setTimeout(r, 500));
      setOutput(generateSalesPage({ product, audience, painPoints, benefits, price, guarantee }));
    }

    setIsGenerating(false);
  }

  async function handleCopy(text: string, key: string) {
    await navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(null), 1800);
  }

  async function handleCopyAll() {
    if (!output) return;
    const full = SECTIONS.map((s) => `## ${s.label}\n\n${output[s.key]}`).join("\n\n---\n\n");
    await navigator.clipboard.writeText(full);
    setCopied("all");
    setTimeout(() => setCopied(null), 1800);
  }

  function handleDownloadAll() {
    if (!output) return;
    const full = SECTIONS.map((s) => `## ${s.label}\n\n${output[s.key]}`).join("\n\n---\n\n");
    const header = `SALES PAGE: ${product || "My Offer"}\n${"═".repeat(50)}\n\n`;
    const blob = new Blob([header + full], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${(product || "sales-page").replace(/[^a-z0-9]/gi, "-").toLowerCase()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="page-container">
      {/* Header */}
      <div className="page-header">
        <div className="flex items-center gap-2 mb-1">
          <div className="p-1.5 rounded-lg bg-primary/10">
            <FileText className="h-5 w-5 text-primary" />
          </div>
          <h1 className="page-title">Sales Page Writer</h1>
        </div>
        <p className="page-description">Generate a complete, high-converting sales page in seconds.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* ── Left: Form ── */}
        <div className="glass-card p-6 space-y-5">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Sales Page Details</h2>

          <div className="space-y-2">
            <Label htmlFor="sp-product">Product / Offer Name</Label>
            <Input
              id="sp-product"
              placeholder="e.g. AI Business Accelerator"
              value={product}
              onChange={(e) => setProduct(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="sp-audience">Target Audience</Label>
            <Input
              id="sp-audience"
              placeholder="e.g. coaches and consultants wanting to scale online"
              value={audience}
              onChange={(e) => setAudience(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="sp-pain">Pain Points</Label>
            <Textarea
              id="sp-pain"
              placeholder="e.g. struggling to get clients, no systems, trading time for money"
              value={painPoints}
              onChange={(e) => setPainPoints(e.target.value)}
              rows={3}
              className="resize-none"
            />
            <p className="text-xs text-muted-foreground">Separate with commas</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="sp-benefits">Key Benefits</Label>
            <Textarea
              id="sp-benefits"
              placeholder="e.g. go from 0 to $10k/month, done-for-you systems, weekly coaching"
              value={benefits}
              onChange={(e) => setBenefits(e.target.value)}
              rows={3}
              className="resize-none"
            />
            <p className="text-xs text-muted-foreground">Separate with commas</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="sp-price">Price</Label>
              <Input
                id="sp-price"
                placeholder="e.g. $997"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="sp-guarantee">Guarantee</Label>
              <Input
                id="sp-guarantee"
                placeholder="e.g. 30-day money-back"
                value={guarantee}
                onChange={(e) => setGuarantee(e.target.value)}
              />
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
                {isStreaming ? "Claude is writing…" : "Writing Your Sales Page..."}
              </>
            ) : (
              <>
                {resolveApiKey(user.anthropicApiKey) ? (
                  <Sparkles className="h-4 w-4" />
                ) : (
                  <Wand2 className="h-4 w-4" />
                )}
                {resolveApiKey(user.anthropicApiKey) ? "✨ Generate with AI" : "Generate Sales Page"}
              </>
            )}
          </Button>
        </div>

        {/* ── Right: Output ── */}
        <div className="glass-card p-6 flex flex-col gap-4 max-h-[800px] overflow-y-auto">
          <div className="flex items-center justify-between sticky top-0 bg-card/95 backdrop-blur pb-2 -mb-2 z-10">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Sales Page Output</h2>
            {output && (
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-1.5 h-8 text-xs"
                  onClick={handleCopyAll}
                >
                  {copied === "all" ? <Check className="h-3.5 w-3.5 text-green-600" /> : <Copy className="h-3.5 w-3.5" />}
                  {copied === "all" ? "Copied!" : "Copy All"}
                </Button>
                <Button variant="outline" size="sm" className="gap-1.5 h-8 text-xs" onClick={handleDownloadAll}>
                  <Download className="h-3.5 w-3.5" />
                  Download
                </Button>
                <Button variant="outline" size="sm" className="gap-1.5 h-8 text-xs" onClick={handleGenerate}>
                  <RotateCcw className="h-3.5 w-3.5" />
                  Regenerate
                </Button>
              </div>
            )}
          </div>

          {/* Loading skeleton */}
          {isGenerating && (
            <div className="space-y-4 pt-2">
              {[80, 60, 120, 100, 140].map((h, i) => (
                <div key={i} className="space-y-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className={`h-${h > 100 ? "20" : h > 80 ? "16" : "10"} w-full`} style={{ height: h }} />
                </div>
              ))}
            </div>
          )}

          {/* Empty state */}
          {!isGenerating && !output && (
            <div className="flex-1 flex flex-col items-center justify-center text-center py-16 text-muted-foreground">
              <FileText className="h-12 w-12 mb-4 opacity-20" />
              <p className="font-medium">Your sales page will appear here</p>
              <p className="text-sm mt-1 opacity-70">Fill in the details and click Generate</p>
            </div>
          )}

          {/* Output sections */}
          <AnimatePresence>
            {output && !isGenerating && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="space-y-3 pt-1"
              >
                {SECTIONS.map((section, i) => (
                  <motion.div
                    key={section.key}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="rounded-xl border border-border/60 bg-background/60 p-4"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span>{section.emoji}</span>
                        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                          {section.label}
                        </span>
                      </div>
                      <button
                        onClick={() => handleCopy(output[section.key], section.key)}
                        className="p-1 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                        title="Copy section"
                      >
                        {copied === section.key ? (
                          <Check className="h-3.5 w-3.5 text-green-600" />
                        ) : (
                          <Copy className="h-3.5 w-3.5" />
                        )}
                      </button>
                    </div>
                    <p className={cn(
                      "text-sm text-foreground whitespace-pre-line leading-relaxed",
                      section.key === "headline" && "text-base font-semibold",
                      section.key === "subheadline" && "font-medium",
                      section.key === "cta" && "font-semibold text-[hsl(var(--forest-light))]"
                    )}>
                      {output[section.key]}
                    </p>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
