import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import ReactMarkdown from "react-markdown";
import { toast } from "sonner";
import {
  Wand2,
  Search,
  Pencil,
  Trash2,
  RefreshCw,
  Download,
  Plus,
  Sparkles,
  CheckCircle,
  AlertCircle,
  Mic,
  Target,
  Layout,
  Users,
  FileText,
  Zap,
  Megaphone,
  Star,
  Clipboard,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useSkillsStore } from "@/stores/skills";
import { useUserStore } from "@/stores/user";
import { useNicheStore } from "@/stores/niche";
import { useOfferStore } from "@/stores/offer";
import { useAvatarStore } from "@/stores/avatar";
import type { Skill, SkillType } from "@/types";
import { cn } from "@/lib/utils";

// ─── Skill type metadata ────────────────────────────────────────────────────

const SKILL_TYPE_META: Record<
  SkillType,
  { label: string; description: string; icon: React.ReactNode; color: string; ready: boolean }
> = {
  "brand-voice": {
    label: "Brand Voice",
    description: "Craft your unique tone, style, and messaging identity",
    icon: <Mic className="h-5 w-5" />,
    color: "bg-purple-100 text-purple-700 border-purple-200",
    ready: true,
  },
  "offer-architect": {
    label: "Offer Architect",
    description: "Design irresistible high-ticket offers that convert",
    icon: <Target className="h-5 w-5" />,
    color: "bg-green-100 text-green-700 border-green-200",
    ready: true,
  },
  "niche-expert": {
    label: "Niche Expert",
    description: "Find and dominate profitable niches in your market",
    icon: <Zap className="h-5 w-5" />,
    color: "bg-yellow-100 text-yellow-700 border-yellow-200",
    ready: true,
  },
  "avatar-specialist": {
    label: "Avatar Specialist",
    description: "Build deep psychological profiles of your ideal customer",
    icon: <Users className="h-5 w-5" />,
    color: "bg-blue-100 text-blue-700 border-blue-200",
    ready: true,
  },
  "content-strategist": {
    label: "Content Strategist",
    description: "Create content systems that attract and convert clients",
    icon: <Layout className="h-5 w-5" />,
    color: "bg-cyan-100 text-cyan-700 border-cyan-200",
    ready: true,
  },
  "sales-page": {
    label: "Sales Page Writer",
    description: "Write high-converting sales pages and landing copy",
    icon: <FileText className="h-5 w-5" />,
    color: "bg-orange-100 text-orange-700 border-orange-200",
    ready: false,
  },
  "ad-writer": {
    label: "Ad Writer",
    description: "Generate scroll-stopping paid ad creatives and copy",
    icon: <Megaphone className="h-5 w-5" />,
    color: "bg-red-100 text-red-700 border-red-200",
    ready: false,
  },
  coach: {
    label: "Coach",
    description: "Deliver transformational coaching frameworks and content",
    icon: <Star className="h-5 w-5" />,
    color: "bg-pink-100 text-pink-700 border-pink-200",
    ready: false,
  },
};

// ─── Default content templates for generation ───────────────────────────────

const DEFAULT_CONTENT: Record<SkillType, string> = {
  "brand-voice": `You are a brand voice specialist. Your tone is confident, clear, and empathetic.

**Core Style**
- Use storytelling to connect with your audience
- Lead with transformation, not features
- Speak to the aspirations of your ideal client
- Write in a conversational yet authoritative style
- Mix short punchy sentences with thoughtful elaborations

**Voice Principles**
1. Be direct and confident — no hedging or over-qualifying
2. Use "you" language to make the reader feel seen
3. Weave in vivid, specific examples over vague generalities
4. Always anchor copy to a clear desired outcome`,

  "offer-architect": `You are an offer design expert specialising in high-ticket solopreneur businesses.

**Core Philosophy**
Help create offers worth 10× their price by focusing on transformation, not delivery.

**Offer Design Framework**
1. **New Vehicle Mechanism** — Position the offer as a novel solution to an old problem
2. **Transformation Stack** — Layer multiple outcomes that compound on each other
3. **Objection Eliminators** — Add bonuses that remove every "yes but" from the buyer's mind
4. **ROI Framing** — Frame price as an investment with a clear, measurable return

**Pricing Principles**
- Price to the value delivered, not time invested
- Anchor premium pricing to aspirational outcomes
- Use payment plans to lower perceived risk`,

  "niche-expert": `You are a niche research and positioning expert.

**Niche Evaluation Criteria**
- Specific, well-defined audience with shared pain points
- Desperate buyers who have already tried and failed other solutions
- Alignment with the solopreneur's unique experience and skills
- Accessible via organic and paid channels

**Positioning Process**
1. Identify the macro market (health, wealth, relationships)
2. Drill into a specific sub-niche with underserved demand
3. Find a unique angle of attack that competitors haven't claimed
4. Craft a niche statement: "I help [GROUP] achieve [OUTCOME] through [MECHANISM]"`,

  "avatar-specialist": `You are a customer psychology expert.

**Research Framework**
Dig beneath surface demographics to uncover emotional drivers:
- **Core Fears** — What keeps them up at night?
- **Burning Desires** — What do they secretly want most?
- **Failed Attempts** — What have they already tried?
- **Identity Aspirations** — Who do they want to become?

**Avatar Profile Dimensions**
1. Demographics (age, income, occupation)
2. Psychographics (values, beliefs, worldview)
3. Buying behaviour (how they research, what triggers purchase)
4. Language patterns (exact words and phrases they use)

**Output Goal**
Create avatars so vivid that the client feels you are reading their mind.`,

  "content-strategist": `You are a content marketing strategist specialising in solopreneur businesses.

**Content Architecture**
Design content ecosystems around 3–5 core pillars:
1. Educational (how-to, frameworks, tips)
2. Inspirational (stories, transformations, mindset)
3. Conversion (offers, case studies, testimonials)
4. Behind-the-scenes (process, authenticity, trust)

**Distribution Strategy**
- Choose one primary platform to go deep on
- Repurpose every long-form piece into 5–7 short-form assets
- Build an email list as the owned channel

**Content Calendar Principles**
- Consistency over volume
- Batch creation over daily scrambling
- Evergreen content over trend-chasing`,

  "sales-page": `You are a direct response copywriter specialising in long-form sales pages.

**Page Structure**
1. Headline — Interrupt and make a bold promise
2. Hook — Agitate the core pain in vivid detail
3. Story — Build credibility and relatability
4. Mechanism — Introduce the new vehicle
5. Offer Stack — Present deliverables with perceived value
6. Proof — Testimonials and case studies
7. Close — Urgency and clear call to action

**Copy Principles**
- Every line earns the next line
- Specificity beats generality every time
- Overcome objections before they arise`,

  "ad-writer": `You are a performance ad creative specialist.

**Hook Frameworks**
- Pattern interrupt → curiosity → click
- Social proof → desire → proof → click
- Fear → education → solution → click

**Platform-Specific Notes**
- Facebook/Instagram: Visual-first, hook in first 3 seconds
- YouTube: Skip button at 5s means hook must be immediate
- LinkedIn: Professional tone, ROI-focused messaging

**Testing Methodology**
Test one variable at a time: hook, visual, CTA, offer angle.`,

  coach: `You are a transformational business coach for solopreneurs.

**Coaching Framework**
1. **Clarity** — Define the gap between current and desired state
2. **Strategy** — Build the roadmap with milestones
3. **Execution** — Break strategy into weekly actions
4. **Accountability** — Track, review, and adjust

**Communication Style**
- Ask powerful questions before giving advice
- Lead with curiosity, not judgment
- Celebrate small wins to build momentum
- Challenge limiting beliefs with evidence`,
};

// ─── Helpers ────────────────────────────────────────────────────────────────

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function isoDate(iso: string) {
  return iso.slice(0, 10); // YYYY-MM-DD
}

function yamlStr(value: string) {
  // Wrap in double quotes and escape any internal double quotes
  return `"${value.replace(/"/g, '\\"')}"`;
}

function buildSkillMarkdown(skill: Skill): string {
  const user = useUserStore.getState().user;
  const niche = useNicheStore.getState().niche;
  const offer = useOfferStore.getState().offer;
  const avatar = useAvatarStore.getState().getDefaultAvatar();

  const nicheStr = niche.fullStatement
    ? niche.fullStatement.slice(0, 100)
    : niche.group
    ? `I help ${niche.group} ${niche.outcome}`
    : "Not yet defined";

  const offerStr =
    offer.name && offer.price
      ? `${offer.name} at $${offer.price}`
      : offer.name || "Not yet defined";

  const avatarStr = avatar ? avatar.name : "Not yet defined";

  const tags = [skill.type, ...skill.title.toLowerCase().split(/\s+/)].filter(
    (t, i, arr) => arr.indexOf(t) === i
  );

  const frontmatter = [
    "---",
    `title: ${yamlStr(skill.title)}`,
    `type: ${skill.type}`,
    `version: ${skill.version}.0`,
    `created: ${isoDate(skill.createdAt)}`,
    `owner: ${yamlStr(user.name || "Unknown")}`,
    `niche: ${yamlStr(nicheStr)}`,
    `offer: ${yamlStr(offerStr)}`,
    `avatar: ${yamlStr(avatarStr)}`,
    `tags: [${tags.join(", ")}]`,
    "---",
  ].join("\n");

  return `${frontmatter}\n\n# ${skill.title}\n\n${skill.content}`;
}

function exportSkill(skill: Skill) {
  const markdown = buildSkillMarkdown(skill);
  const blob = new Blob([markdown], { type: "text/markdown" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${skill.title.toLowerCase().replace(/\s+/g, "-")}-v${skill.version}.md`;
  a.click();
  URL.revokeObjectURL(url);
}

async function copySkillForClaude(skill: Skill) {
  const markdown = buildSkillMarkdown(skill);
  await navigator.clipboard.writeText(markdown);
}

// ─── Component ───────────────────────────────────────────────────────────────

export default function SkillsPage() {
  const { skills, addSkill, updateSkill, deleteSkill, regenerateSkill } = useSkillsStore();

  const [search, setSearch] = useState("");
  const [generateOpen, setGenerateOpen] = useState(false);
  const [editSkill, setEditSkill] = useState<Skill | null>(null);
  const [editContent, setEditContent] = useState("");
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editTab, setEditTab] = useState<"edit" | "preview">("edit");

  const filtered = useMemo(() => {
    if (!search.trim()) return skills;
    const q = search.toLowerCase();
    return skills.filter(
      (s) =>
        s.title.toLowerCase().includes(q) ||
        s.description.toLowerCase().includes(q) ||
        s.type.toLowerCase().includes(q)
    );
  }, [skills, search]);

  function openEditor(skill: Skill) {
    setEditSkill(skill);
    setEditContent(skill.content);
    setEditTitle(skill.title);
    setEditDescription(skill.description);
    setEditTab("edit");
  }

  function saveEdit() {
    if (!editSkill) return;
    updateSkill(editSkill.id, {
      title: editTitle,
      description: editDescription,
      content: editContent,
    });
    setEditSkill(null);
  }

  function handleGenerate(type: SkillType) {
    const meta = SKILL_TYPE_META[type];
    addSkill({
      title: meta.label,
      description: meta.description,
      type,
      content: DEFAULT_CONTENT[type],
      version: 1,
      isStale: false,
    });
    setGenerateOpen(false);
  }

  const existingTypes = new Set(skills.map((s) => s.type));

  return (
    <div className="page-container">
      {/* Header */}
      <div className="page-header flex items-center justify-between gap-4 flex-wrap">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="p-1.5 rounded-lg bg-primary/10">
              <Wand2 className="h-5 w-5 text-primary" />
            </div>
            <h1 className="page-title">AI Skills</h1>
          </div>
          <p className="page-description">
            Specialised AI personas trained to output in your brand's voice and style.
          </p>
        </div>
        <Button onClick={() => setGenerateOpen(true)}>
          <Sparkles className="h-4 w-4" /> Generate New Skill
        </Button>
      </div>

      {/* Search */}
      <div className="relative mb-6 max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search skills…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Skills grid */}
      {filtered.length === 0 && skills.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="glass-card p-16 flex flex-col items-center justify-center text-center"
        >
          <Wand2 className="h-12 w-12 text-muted-foreground/30 mb-4" />
          <p className="font-semibold text-lg text-muted-foreground">No skills yet</p>
          <p className="text-sm text-muted-foreground/60 mt-1 mb-4">
            Generate your first AI skill to get started.
          </p>
          <Button onClick={() => setGenerateOpen(true)}>
            <Sparkles className="h-4 w-4" /> Generate New Skill
          </Button>
        </motion.div>
      ) : filtered.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="glass-card p-12 flex flex-col items-center text-center"
        >
          <Search className="h-8 w-8 text-muted-foreground/30 mb-3" />
          <p className="font-medium text-muted-foreground">No skills match "{search}"</p>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <AnimatePresence>
            {filtered.map((skill, i) => {
              const meta = SKILL_TYPE_META[skill.type];
              return (
                <motion.div
                  key={skill.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: i * 0.05 }}
                  className="glass-card p-5 flex flex-col gap-4 hover-lift group"
                >
                  {/* Card header */}
                  <div className="flex items-start gap-3">
                    <div
                      className={cn(
                        "h-10 w-10 rounded-xl flex items-center justify-center shrink-0 border",
                        meta.color
                      )}
                    >
                      {meta.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-sm leading-tight">{skill.title}</h3>
                      <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                        {skill.description}
                      </p>
                    </div>
                  </div>

                  {/* Metadata row */}
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge variant="secondary" className="text-xs">
                      {meta.label}
                    </Badge>
                    {skill.isStale ? (
                      <Badge variant="warning" className="text-xs flex items-center gap-1">
                        <AlertCircle className="h-2.5 w-2.5" /> Stale
                      </Badge>
                    ) : (
                      <Badge variant="success" className="text-xs flex items-center gap-1">
                        <CheckCircle className="h-2.5 w-2.5" /> Up to date
                      </Badge>
                    )}
                    <span className="text-xs text-muted-foreground ml-auto">v{skill.version}</span>
                  </div>

                  {/* Content preview */}
                  <p className="text-xs text-muted-foreground line-clamp-3 flex-1">
                    {skill.content}
                  </p>

                  {/* Footer: date + actions */}
                  <div className="flex items-center justify-between pt-1 border-t border-border/40">
                    <span className="text-xs text-muted-foreground">{formatDate(skill.updatedAt)}</span>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => openEditor(skill)}
                        className="p-1.5 rounded-md hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
                        title="Edit skill"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => regenerateSkill(skill.id)}
                        className="p-1.5 rounded-md hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
                        title="Regenerate"
                      >
                        <RefreshCw className="h-3.5 w-3.5" />
                      </button>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <button
                            onClick={() =>
                              copySkillForClaude(skill).then(() =>
                                toast.success("Copied! Paste into a Claude Project as a custom instruction.")
                              ).catch(() =>
                                toast.error("Could not access clipboard.")
                              )
                            }
                            className="p-1.5 rounded-md hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
                          >
                            <Clipboard className="h-3.5 w-3.5" />
                          </button>
                        </TooltipTrigger>
                        <TooltipContent side="top" className="text-xs max-w-[200px] text-center">
                          Copy for Claude Projects — paste as a custom instruction
                        </TooltipContent>
                      </Tooltip>
                      <button
                        onClick={() => exportSkill(skill)}
                        className="p-1.5 rounded-md hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
                        title="Export .md"
                      >
                        <Download className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => deleteSkill(skill.id)}
                        className="p-1.5 rounded-md hover:bg-destructive/10 hover:text-destructive transition-colors text-muted-foreground"
                        title="Delete"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}

      {/* Generate Skill Dialog */}
      <Dialog open={generateOpen} onOpenChange={setGenerateOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" /> Generate New Skill
            </DialogTitle>
            <p className="text-sm text-muted-foreground">
              Choose a skill type to add to your AI toolkit. Skills can be edited and versioned after generation.
            </p>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-3 py-2 max-h-[420px] overflow-y-auto pr-1">
            {(Object.entries(SKILL_TYPE_META) as [SkillType, typeof SKILL_TYPE_META[SkillType]][]).map(
              ([type, meta]) => {
                const alreadyHas = existingTypes.has(type);
                return (
                  <button
                    key={type}
                    onClick={() => !alreadyHas && meta.ready && handleGenerate(type)}
                    disabled={alreadyHas || !meta.ready}
                    className={cn(
                      "flex items-start gap-3 p-4 rounded-xl border-2 text-left transition-all",
                      alreadyHas
                        ? "border-green-200 bg-green-50/50 opacity-80 cursor-default"
                        : meta.ready
                        ? "border-border hover:border-primary/40 hover:bg-primary/5 hover:shadow-sm cursor-pointer"
                        : "border-border/40 bg-muted/20 opacity-50 cursor-not-allowed"
                    )}
                  >
                    <div
                      className={cn(
                        "h-9 w-9 rounded-lg flex items-center justify-center shrink-0 border",
                        meta.color
                      )}
                    >
                      {meta.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="font-semibold text-sm">{meta.label}</span>
                        {alreadyHas && (
                          <CheckCircle className="h-3.5 w-3.5 text-green-600 shrink-0" />
                        )}
                        {!meta.ready && !alreadyHas && (
                          <span className="text-xs text-muted-foreground bg-muted px-1.5 py-0.5 rounded">Soon</span>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                        {meta.description}
                      </p>
                    </div>
                  </button>
                );
              }
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setGenerateOpen(false)}>
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Skill Dialog */}
      <Dialog open={!!editSkill} onOpenChange={(o) => !o && setEditSkill(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Pencil className="h-4 w-4" /> Edit Skill
            </DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-4">
            {/* Title + Description */}
            <div className="grid grid-cols-1 gap-3">
              <div className="flex flex-col gap-1.5">
                <Label>Title</Label>
                <Input
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  placeholder="Skill title"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label>Description</Label>
                <Input
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  placeholder="Short description"
                />
              </div>
            </div>

            {/* Edit / Preview Tabs */}
            <Tabs value={editTab} onValueChange={(v) => setEditTab(v as "edit" | "preview")}>
              <TabsList className="w-full justify-start">
                <TabsTrigger value="edit" className="flex items-center gap-1.5">
                  <Pencil className="h-3.5 w-3.5" /> Edit
                </TabsTrigger>
                <TabsTrigger value="preview" className="flex items-center gap-1.5">
                  <Plus className="h-3.5 w-3.5 rotate-45" /> Preview
                </TabsTrigger>
              </TabsList>
              <TabsContent value="edit" className="mt-0">
                <Textarea
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  className="min-h-[260px] font-mono text-xs resize-none mt-2"
                  placeholder="Write your skill instructions using Markdown…"
                />
              </TabsContent>
              <TabsContent value="preview" className="mt-0">
                <div className="min-h-[260px] max-h-[320px] overflow-y-auto mt-2 rounded-md border border-border p-4 prose prose-sm prose-neutral max-w-none dark:prose-invert text-sm">
                  <ReactMarkdown>{editContent || "*Nothing to preview yet.*"}</ReactMarkdown>
                </div>
              </TabsContent>
            </Tabs>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditSkill(null)}>
              Cancel
            </Button>
            <Button onClick={saveEdit}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
