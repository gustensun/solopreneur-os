import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FileEdit, Sparkles, Copy, Check, RotateCcw, Wand2, Download } from "lucide-react";
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

// ─── Mock generator ────────────────────────────────────────────────────────────

interface DocOutput {
  title: string;
  sections: { heading: string; content: string }[];
}

function generateDocument(fields: {
  docType: string;
  topic: string;
  keyPoints: string;
  tone: string;
  length: string;
}): DocOutput {
  const { docType, topic, keyPoints, tone: _tone, length } = fields;
  const t = topic || "Building a 6-Figure AI Business";
  const pointList = keyPoints
    ? keyPoints.split(",").map((p) => p.trim())
    : ["AI tools and automation", "Content systems", "Offer creation", "Client acquisition"];

  const sectionMultiplier = length === "Short" ? 1 : length === "Medium" ? 2 : 3;

  const templates: Record<string, DocOutput> = {
    "Blog Post": {
      title: `${t}: The Complete Guide for Solopreneurs in 2025`,
      sections: [
        {
          heading: "Introduction",
          content: `In today's rapidly evolving digital landscape, ${t.toLowerCase()} has become one of the most powerful opportunities available to independent entrepreneurs. Whether you're just starting out or looking to scale your existing business, the strategies and insights in this guide will give you the edge you need.\n\nOver the next few minutes, you'll discover the exact frameworks, tools, and tactics that top solopreneurs are using right now to build sustainable, profitable businesses.`,
        },
        {
          heading: `Why ${pointList[0] || "This Approach"} is a Game-Changer`,
          content: `The traditional business model is broken. Trading time for money has a natural ceiling — and most entrepreneurs hit it fast. That's where ${pointList[0] || "modern approaches"} changes everything.\n\nBy leveraging the right systems and strategies, you can:\n• Build income streams that scale without adding hours\n• Serve more clients at a higher level\n• Create leverage that compounds over time\n• Free yourself from the grind and focus on high-value work`,
        },
        ...(sectionMultiplier >= 2
          ? [
              {
                heading: `The ${pointList[1] || "Core Framework"} Blueprint`,
                content: `Let's break this down into a simple, actionable framework you can implement immediately.\n\n**Step 1: Foundation** — Before anything else, you need clarity on your niche, avatar, and unique positioning. Without this, everything else is guesswork.\n\n**Step 2: System** — Build the infrastructure that will support your growth. This includes your content engine, lead generation, and conversion system.\n\n**Step 3: Scale** — Once your system is working, pour fuel on the fire. Double down on what's working, eliminate what isn't, and watch your results compound.`,
              },
              {
                heading: `Mastering ${pointList[2] || "Advanced Strategies"}`,
                content: `Now that you have the foundation in place, it's time to accelerate. Here's what separates the $10k/month earners from the $100k/month earners:\n\n• **Positioning over promotion** — Be the obvious choice, not the loudest voice\n• **Depth over breadth** — Master one channel before diversifying\n• **Systems over hustle** — Build processes that work without you\n• **Premium pricing** — High-ticket offers with fewer, better clients`,
              },
            ]
          : []),
        ...(sectionMultiplier >= 3
          ? [
              {
                heading: `Real-World Results: What Success Looks Like`,
                content: `Don't just take my word for it. Here are the kinds of results that become possible when you implement these strategies consistently:\n\n— From $2k/month to $18k/month in 6 months using AI content systems\n— From 0 to 847 email subscribers in 30 days with one lead magnet\n— From hourly consulting to $5k/month retainers by packaging expertise\n— From burnout to 4-hour workdays by systematizing delivery`,
              },
              {
                heading: `Your Next Steps`,
                content: `Here's your action plan for the next 7 days:\n\n✅ Day 1-2: Define your niche and ideal client avatar\n✅ Day 3-4: Create your core offer and pricing structure\n✅ Day 5-6: Build your minimum viable content system\n✅ Day 7: Launch your first piece of content and track results\n\nRemember: progress beats perfection every time. Start messy, optimize as you go.`,
              },
            ]
          : []),
        {
          heading: "Conclusion",
          content: `${t} isn't a future opportunity — it's a present one. The entrepreneurs who move now, while others wait for "the right time," will have an insurmountable advantage.\n\nYou've got the knowledge. You've got the roadmap. Now it's time to take action.\n\nThe only question is: are you ready to build the business you know you're capable of?`,
        },
      ],
    },
    Email: {
      title: `Subject: ${t} — What You Need to Know`,
      sections: [
        {
          heading: "Opening",
          content: `Hey [First Name],\n\nI want to share something important with you today.\n\nOver the past few months, I've been deep in the trenches of ${t.toLowerCase()}, and what I've discovered has completely changed how I approach my business.`,
        },
        {
          heading: "The Core Message",
          content: `Here's the thing most people get wrong about ${t.toLowerCase()}:\n\nThey think it requires massive resources, a huge team, or years of experience.\n\nThe truth? ${pointList[0] || "The right approach"} can be implemented this week — and the results will surprise you.\n\nI've seen it happen with:\n• Complete beginners starting from scratch\n• Experienced professionals pivoting their model\n• Side-hustlers ready to go all in`,
        },
        {
          heading: "Call to Action",
          content: `If this resonates with you, here's what I want you to do:\n\n→ Reply to this email with your biggest challenge around ${t.toLowerCase()}\n→ I personally read every reply and will send you a custom resource\n\nTalk soon,\n[Your Name]\n\nP.S. — The people who replied to my last email got access to something really valuable. Don't miss out this time.`,
        },
      ],
    },
    Newsletter: {
      title: `🌿 The Weekly Dispatch | ${t}`,
      sections: [
        {
          heading: "This Week's Focus",
          content: `Welcome back to another edition of The Weekly Dispatch.\n\nThis week, we're diving deep into ${t.toLowerCase()} — specifically, the strategies that are working right now in 2025, and the ones that are quietly fading into irrelevance.`,
        },
        {
          heading: "Main Story",
          content: `**${t}: A New Playbook**\n\nThe rules have changed. What worked 2 years ago is barely effective today. But the principles? Those are timeless.\n\nHere's what's working now:\n\n📌 ${pointList[0] || "Focus on depth, not breadth"}\n📌 ${pointList[1] || "Systemize before you scale"}\n📌 ${pointList[2] || "Serve fewer clients better"}\n${pointList[3] ? `📌 ${pointList[3]}` : "📌 Invest in your brand, not just ads"}\n\nThe entrepreneurs seeing the biggest breakthroughs right now are the ones who've stopped chasing tactics and started building systems.`,
        },
        {
          heading: "Quick Wins",
          content: `**3 Things You Can Do This Week:**\n\n1. Audit your current processes — where are you manually doing something that could be automated?\n2. Review your offer — is the transformation crystal clear? Would a stranger understand the value immediately?\n3. Send a personal note to your 5 best clients or followers — connection builds loyalty faster than content.`,
        },
        {
          heading: "Closing",
          content: `That's a wrap for this week.\n\nIf you found value in this edition, please forward it to one person who needs to see it — it's the best compliment you can give.\n\nUntil next week,\n[Your Name]\n\n---\nYou're receiving this because you subscribed at [website]. Unsubscribe anytime.`,
        },
      ],
    },
    Report: {
      title: `${t}: A Comprehensive Analysis & Strategic Report`,
      sections: [
        {
          heading: "Executive Summary",
          content: `This report provides a comprehensive analysis of ${t.toLowerCase()}, covering current trends, strategic opportunities, and actionable recommendations for implementation.\n\nKey findings:\n• The market opportunity in this space is growing at 35% year-over-year\n• Early movers are capturing disproportionate market share\n• The barriers to entry have never been lower for skilled practitioners\n• Properly executed, the average ROI exceeds 400% within 12 months`,
        },
        {
          heading: "Background & Context",
          content: `To fully understand the significance of ${t.toLowerCase()}, we must examine the broader context in which it exists.\n\nOver the past 24 months, fundamental shifts in technology, consumer behavior, and market dynamics have created a rare confluence of opportunity. Specifically:\n\n**Technology Shift:** AI capabilities have leapfrogged 5 years of projected progress\n**Consumer Behavior:** Buyers increasingly prefer specialized expertise over generalist solutions\n**Market Dynamics:** The gap between sophisticated and unsophisticated operators is widening rapidly`,
        },
        ...(sectionMultiplier >= 2
          ? [
              {
                heading: "Strategic Analysis",
                content: `**Strengths**\n• Low overhead model with high margin potential\n• Scalable delivery mechanisms\n• Strong demand signals from the market\n\n**Opportunities**\n• First-mover advantage in AI-native implementations\n• Adjacent market expansion pathways\n• Partnership and joint venture possibilities\n\n**Challenges**\n• Increasing competition requires stronger positioning\n• Continuous skill development necessary to stay current\n• Building trust at scale requires systematic social proof`,
              },
            ]
          : []),
        {
          heading: "Recommendations",
          content: `Based on this analysis, we recommend the following strategic priorities:\n\n1. **Immediate (0-30 days):** Establish clear positioning and define the primary target segment\n2. **Short-term (30-90 days):** Build the minimum viable system for lead generation and delivery\n3. **Medium-term (90-180 days):** Optimize based on data and begin systematic scaling\n4. **Long-term (6-12 months):** Explore premium tier offerings and strategic partnerships`,
        },
      ],
    },
    Proposal: {
      title: `Business Proposal: ${t}`,
      sections: [
        {
          heading: "Overview",
          content: `This proposal outlines our recommended approach for ${t.toLowerCase()}, designed specifically for your unique situation and goals.\n\nWe've worked with dozens of businesses in similar situations, and we're confident that the methodology outlined here will deliver the results you're looking for — and likely exceed your expectations.`,
        },
        {
          heading: "The Challenge",
          content: `Based on our initial conversations and assessment, here's our understanding of your current situation:\n\n• Current state: [Client's current situation]\n• Primary challenge: ${pointList[0] || "Scaling without proportional cost increase"}\n• Secondary challenge: ${pointList[1] || "Building systems that work without founder dependency"}\n• Desired outcome: Measurable growth with clear ROI within 90 days`,
        },
        {
          heading: "Our Proposed Solution",
          content: `To address these challenges, we propose a comprehensive engagement structured around three phases:\n\n**Phase 1 — Discovery & Strategy (Weeks 1-2)**\nDeep-dive analysis of your current systems, offer positioning, and growth opportunities.\n\n**Phase 2 — Implementation (Weeks 3-8)**\nBuilding and deploying the core systems, content engine, and conversion infrastructure.\n\n**Phase 3 — Optimization & Scale (Weeks 9-12)**\nRefining based on performance data and building toward long-term, sustainable growth.`,
        },
        {
          heading: "Investment & Next Steps",
          content: `**Investment:** Starting from [price point] depending on scope\n**Timeline:** Results visible within 30 days, full implementation over 90 days\n**Guarantee:** We stand behind our work — if we don't hit agreed milestones, we work for free until we do\n\n**To Move Forward:**\n1. Review this proposal with your key stakeholders\n2. Schedule a follow-up call to answer any questions\n3. Sign the agreement and we begin within 48 hours\n\nWe're excited about the possibility of working together and look forward to hearing from you.`,
        },
      ],
    },
  };

  return templates[docType] || templates["Blog Post"];
}

// ─── Component ─────────────────────────────────────────────────────────────────

export default function GDocMagicPage() {
  const [docType, setDocType] = useState("Blog Post");
  const [topic, setTopic] = useState("");
  const [keyPoints, setKeyPoints] = useState("");
  const [tone, setTone] = useState("Professional");
  const [length, setLength] = useState("Medium");

  const [isGenerating, setIsGenerating] = useState(false);
  const [output, setOutput] = useState<DocOutput | null>(null);
  const [copied, setCopied] = useState<string | null>(null);

  async function handleGenerate() {
    setIsGenerating(true);
    setOutput(null);
    await new Promise((r) => setTimeout(r, 500));
    setOutput(generateDocument({ docType, topic, keyPoints, tone, length }));
    setIsGenerating(false);
  }

  async function handleCopy(text: string, key: string) {
    await navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(null), 1800);
  }

  async function handleCopyAll() {
    if (!output) return;
    const full = `# ${output.title}\n\n${output.sections.map((s) => `## ${s.heading}\n\n${s.content}`).join("\n\n---\n\n")}`;
    await navigator.clipboard.writeText(full);
    setCopied("all");
    setTimeout(() => setCopied(null), 1800);
  }

  function handleDownload() {
    if (!output) return;
    const full = `# ${output.title}\n\n${output.sections.map((s) => `## ${s.heading}\n\n${s.content}`).join("\n\n---\n\n")}`;
    const blob = new Blob([full], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${output.title.slice(0, 40).replace(/[^a-z0-9]/gi, "-")}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="page-container">
      {/* Header */}
      <div className="page-header">
        <div className="flex items-center gap-2 mb-1">
          <div className="p-1.5 rounded-lg bg-primary/10">
            <FileEdit className="h-5 w-5 text-primary" />
          </div>
          <h1 className="page-title">G Doc Magic</h1>
        </div>
        <p className="page-description">Create beautifully structured documents, emails, and reports instantly.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* ── Left: Form ── */}
        <div className="glass-card p-6 space-y-5">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Document Settings</h2>

          <div className="space-y-2">
            <Label>Document Type</Label>
            <Select value={docType} onValueChange={setDocType}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Blog Post">Blog Post</SelectItem>
                <SelectItem value="Email">Email</SelectItem>
                <SelectItem value="Newsletter">Newsletter</SelectItem>
                <SelectItem value="Report">Report</SelectItem>
                <SelectItem value="Proposal">Proposal</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="gdoc-topic">Topic / Subject</Label>
            <Input
              id="gdoc-topic"
              placeholder="e.g. How to Build a 6-Figure AI Business"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="gdoc-points">Key Points to Cover</Label>
            <Textarea
              id="gdoc-points"
              placeholder="e.g. AI tools, content systems, offer creation, client acquisition"
              value={keyPoints}
              onChange={(e) => setKeyPoints(e.target.value)}
              rows={3}
              className="resize-none"
            />
            <p className="text-xs text-muted-foreground">Separate with commas</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Tone</Label>
              <Select value={tone} onValueChange={setTone}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Professional">Professional</SelectItem>
                  <SelectItem value="Casual">Casual</SelectItem>
                  <SelectItem value="Authoritative">Authoritative</SelectItem>
                  <SelectItem value="Inspirational">Inspirational</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Length</Label>
              <Select value={length} onValueChange={setLength}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Short">Short</SelectItem>
                  <SelectItem value="Medium">Medium</SelectItem>
                  <SelectItem value="Long">Long</SelectItem>
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
                Creating Your Document...
              </>
            ) : (
              <>
                <Wand2 className="h-4 w-4" />
                Generate Document
              </>
            )}
          </Button>
        </div>

        {/* ── Right: Output ── */}
        <div className="glass-card p-6 flex flex-col gap-4 max-h-[800px] overflow-y-auto">
          <div className="flex items-center justify-between sticky top-0 bg-card/95 backdrop-blur pb-2 -mb-2 z-10">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Document Output</h2>
            {output && (
              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="gap-1.5 h-8 text-xs" onClick={handleDownload}>
                  <Download className="h-3.5 w-3.5" />
                  Download
                </Button>
                <Button variant="outline" size="sm" className="gap-1.5 h-8 text-xs" onClick={handleCopyAll}>
                  {copied === "all" ? <Check className="h-3.5 w-3.5 text-green-600" /> : <Copy className="h-3.5 w-3.5" />}
                  {copied === "all" ? "Copied!" : "Copy All"}
                </Button>
                <Button variant="outline" size="sm" className="gap-1.5 h-8 text-xs" onClick={handleGenerate}>
                  <RotateCcw className="h-3.5 w-3.5" />
                </Button>
              </div>
            )}
          </div>

          {/* Loading skeleton */}
          {isGenerating && (
            <div className="space-y-5 pt-2">
              <Skeleton className="h-7 w-3/4" />
              {[1, 2, 3].map((i) => (
                <div key={i} className="space-y-2">
                  <Skeleton className="h-5 w-40" />
                  <Skeleton className="h-16 w-full" />
                </div>
              ))}
            </div>
          )}

          {/* Empty state */}
          {!isGenerating && !output && (
            <div className="flex-1 flex flex-col items-center justify-center text-center py-16 text-muted-foreground">
              <FileEdit className="h-12 w-12 mb-4 opacity-20" />
              <p className="font-medium">Your document will appear here</p>
              <p className="text-sm mt-1 opacity-70">Configure your settings and click Generate</p>
            </div>
          )}

          {/* Document output */}
          <AnimatePresence>
            {output && !isGenerating && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="space-y-1 pt-1"
              >
                {/* Document title */}
                <div className="rounded-xl border-2 border-[hsl(var(--forest-light))]/30 bg-[hsl(var(--forest))]/5 p-4 mb-4">
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">Document Title</p>
                  <p className="text-lg font-bold leading-snug text-foreground">{output.title}</p>
                </div>

                {/* Sections */}
                {output.sections.map((section, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.06 }}
                    className="rounded-xl border border-border/60 bg-background/60 p-4"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-sm font-semibold text-[hsl(var(--forest-light))]">
                        {section.heading}
                      </h3>
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
                    <p className="text-sm text-foreground leading-relaxed whitespace-pre-line">
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
  );
}
