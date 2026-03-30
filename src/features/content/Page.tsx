import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  Search,
  Trash2,
  X,
  Pencil,
  BookOpen,
  Lightbulb,
  Tag,
  LayoutGrid,
  Layers,
  ChevronRight,
  Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useContentStore } from "@/stores/content";
import type { ContentPillar, ContentIdea } from "@/types";
import { cn } from "@/lib/utils";

// ─── Constants ─────────────────────────────────────────────────────────────────

const PILLAR_COLORS = [
  "#8B5CF6",
  "#10B981",
  "#F59E0B",
  "#EC4899",
  "#3B82F6",
  "#EF4444",
  "#06B6D4",
  "#F97316",
  "#14B8A6",
  "#6366F1",
];

const PLATFORMS = [
  "YouTube",
  "Instagram",
  "LinkedIn",
  "Twitter/X",
  "TikTok",
  "Facebook",
  "Newsletter",
  "Blog",
  "Podcast",
  "Other",
];

type IdeaStatus = ContentIdea["status"];

const STATUS_CONFIG: Record<
  IdeaStatus,
  { label: string; variant: "default" | "secondary" | "outline" | "warning" | "success"; classes: string }
> = {
  idea: {
    label: "Idea",
    variant: "secondary",
    classes: "bg-slate-100 text-slate-700 border-slate-200",
  },
  drafting: {
    label: "Drafting",
    variant: "warning",
    classes: "bg-blue-100 text-blue-700 border-blue-200",
  },
  review: {
    label: "Review",
    variant: "warning",
    classes: "bg-amber-100 text-amber-700 border-amber-200",
  },
  published: {
    label: "Published",
    variant: "success",
    classes: "bg-emerald-100 text-emerald-700 border-emerald-200",
  },
};

// ─── Pillar Dialog ──────────────────────────────────────────────────────────────

interface PillarForm {
  title: string;
  description: string;
  color: string;
  topics: string[];
}

function PillarDialog({
  open,
  onClose,
  pillar,
  onSave,
  onDelete,
}: {
  open: boolean;
  onClose: () => void;
  pillar: ContentPillar | null;
  onSave: (data: Omit<ContentPillar, "id" | "createdAt" | "updatedAt">) => void;
  onDelete?: () => void;
}) {
  const isNew = !pillar?.id;

  const buildForm = (): PillarForm => ({
    title: pillar?.title ?? "",
    description: pillar?.description ?? "",
    color: pillar?.color ?? PILLAR_COLORS[0],
    topics: pillar?.topics ?? [],
  });

  const [form, setForm] = useState<PillarForm>(buildForm);
  const [topicInput, setTopicInput] = useState("");
  const [confirmDelete, setConfirmDelete] = useState(false);

  function handleOpenChange(v: boolean) {
    if (v) {
      setForm(buildForm());
      setTopicInput("");
      setConfirmDelete(false);
    } else {
      onClose();
    }
  }

  function addTopic() {
    const t = topicInput.trim();
    if (t && !form.topics.includes(t)) {
      setForm((f) => ({ ...f, topics: [...f.topics, t] }));
    }
    setTopicInput("");
  }

  function removeTopic(topic: string) {
    setForm((f) => ({ ...f, topics: f.topics.filter((t) => t !== topic) }));
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <div
              className="h-4 w-4 rounded-full shrink-0"
              style={{ backgroundColor: form.color }}
            />
            {isNew ? "New Content Pillar" : "Edit Pillar"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Title */}
          <div className="space-y-1.5">
            <Label>Pillar Title</Label>
            <Input
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              placeholder="e.g. AI Tools & Workflows"
              autoFocus
            />
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <Label>Description</Label>
            <Textarea
              value={form.description}
              onChange={(e) =>
                setForm((f) => ({ ...f, description: e.target.value }))
              }
              placeholder="What content does this pillar cover?"
              rows={2}
              className="resize-none"
            />
          </div>

          {/* Color */}
          <div className="space-y-1.5">
            <Label>Color</Label>
            <div className="flex flex-wrap gap-2">
              {PILLAR_COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setForm((f) => ({ ...f, color: c }))}
                  className={cn(
                    "h-7 w-7 rounded-full transition-all duration-150 hover:scale-110 flex items-center justify-center",
                    form.color === c && "ring-2 ring-offset-2 ring-primary scale-110"
                  )}
                  style={{ backgroundColor: c }}
                >
                  {form.color === c && <Check className="h-3 w-3 text-white" />}
                </button>
              ))}
            </div>
          </div>

          {/* Topics */}
          <div className="space-y-1.5">
            <Label>Content Topics</Label>
            <div className="flex gap-2">
              <Input
                value={topicInput}
                onChange={(e) => setTopicInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addTopic();
                  }
                }}
                placeholder="Add a topic..."
                className="flex-1"
              />
              <Button variant="outline" size="sm" onClick={addTopic} type="button">
                Add
              </Button>
            </div>
            {form.topics.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-1.5">
                {form.topics.map((topic) => (
                  <span
                    key={topic}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium text-white"
                    style={{ backgroundColor: form.color }}
                  >
                    {topic}
                    <button
                      onClick={() => removeTopic(topic)}
                      className="opacity-70 hover:opacity-100 transition-opacity"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          {!isNew && onDelete && (
            <div className="flex-1">
              {confirmDelete ? (
                <div className="flex items-center gap-2">
                  <span className="text-xs text-destructive">Delete this pillar?</span>
                  <Button variant="destructive" size="sm" onClick={onDelete}>
                    Delete
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setConfirmDelete(false)}
                  >
                    Cancel
                  </Button>
                </div>
              ) : (
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-muted-foreground hover:text-destructive"
                  onClick={() => setConfirmDelete(true)}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  Delete
                </Button>
              )}
            </div>
          )}
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            disabled={!form.title.trim()}
            onClick={() => {
              if (form.title.trim()) {
                onSave(form);
              }
            }}
          >
            {isNew ? "Create Pillar" : "Save Changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Idea Dialog ───────────────────────────────────────────────────────────────

interface IdeaForm {
  title: string;
  pillarId: string;
  status: IdeaStatus;
  platform: string;
  notes: string;
}

function IdeaDialog({
  open,
  onClose,
  idea,
  pillars,
  defaultPillarId,
  onSave,
  onDelete,
}: {
  open: boolean;
  onClose: () => void;
  idea: ContentIdea | null;
  pillars: ContentPillar[];
  defaultPillarId?: string;
  onSave: (data: Omit<ContentIdea, "id" | "createdAt" | "updatedAt">) => void;
  onDelete?: () => void;
}) {
  const isNew = !idea?.id;

  const buildForm = (): IdeaForm => ({
    title: idea?.title ?? "",
    pillarId: idea?.pillarId ?? defaultPillarId ?? "",
    status: idea?.status ?? "idea",
    platform: idea?.platform ?? "YouTube",
    notes: idea?.notes ?? "",
  });

  const [form, setForm] = useState<IdeaForm>(buildForm);
  const [confirmDelete, setConfirmDelete] = useState(false);

  function handleOpenChange(v: boolean) {
    if (v) {
      setForm(buildForm());
      setConfirmDelete(false);
    } else {
      onClose();
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{isNew ? "New Content Idea" : "Edit Idea"}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Title */}
          <div className="space-y-1.5">
            <Label>Title / Hook</Label>
            <Input
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              placeholder="Your content title or hook..."
              autoFocus
            />
          </div>

          {/* Pillar + Status */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Content Pillar</Label>
              <Select
                value={form.pillarId || "__none__"}
                onValueChange={(v) =>
                  setForm((f) => ({ ...f, pillarId: v === "__none__" ? "" : v }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select pillar" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__none__">No pillar</SelectItem>
                  {pillars.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      <span className="flex items-center gap-2">
                        <span
                          className="h-2.5 w-2.5 rounded-full inline-block shrink-0"
                          style={{ backgroundColor: p.color }}
                        />
                        {p.title}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label>Status</Label>
              <Select
                value={form.status}
                onValueChange={(v) =>
                  setForm((f) => ({ ...f, status: v as IdeaStatus }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {(Object.keys(STATUS_CONFIG) as IdeaStatus[]).map((s) => (
                    <SelectItem key={s} value={s}>
                      {STATUS_CONFIG[s].label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Platform */}
          <div className="space-y-1.5">
            <Label>Platform</Label>
            <Select
              value={form.platform}
              onValueChange={(v) => setForm((f) => ({ ...f, platform: v }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PLATFORMS.map((p) => (
                  <SelectItem key={p} value={p}>
                    {p}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Notes */}
          <div className="space-y-1.5">
            <Label>Notes</Label>
            <Textarea
              value={form.notes}
              onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
              placeholder="Angle, key points, references, inspiration..."
              rows={3}
              className="resize-none"
            />
          </div>
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          {!isNew && onDelete && (
            <div className="flex-1">
              {confirmDelete ? (
                <div className="flex items-center gap-2">
                  <span className="text-xs text-destructive">Delete this idea?</span>
                  <Button variant="destructive" size="sm" onClick={onDelete}>
                    Delete
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setConfirmDelete(false)}
                  >
                    Cancel
                  </Button>
                </div>
              ) : (
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-muted-foreground hover:text-destructive"
                  onClick={() => setConfirmDelete(true)}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  Delete
                </Button>
              )}
            </div>
          )}
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            disabled={!form.title.trim()}
            onClick={() => {
              if (form.title.trim()) {
                onSave({
                  title: form.title,
                  pillarId: form.pillarId || undefined,
                  status: form.status,
                  platform: form.platform,
                  notes: form.notes,
                });
              }
            }}
          >
            {isNew ? "Add Idea" : "Save Changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Pillar Card ───────────────────────────────────────────────────────────────

function PillarCard({
  pillar,
  ideaCount,
  onEdit,
}: {
  pillar: ContentPillar;
  ideaCount: number;
  onEdit: (p: ContentPillar) => void;
}) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="glass-card overflow-hidden group"
    >
      {/* Colored top bar */}
      <div className="h-1.5 w-full" style={{ backgroundColor: pillar.color }} />

      <div className="p-5">
        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <div
              className="h-9 w-9 rounded-lg shrink-0 flex items-center justify-center"
              style={{ backgroundColor: `${pillar.color}18` }}
            >
              <Layers className="h-5 w-5" style={{ color: pillar.color }} />
            </div>
            <div className="min-w-0">
              <h3 className="font-semibold text-sm leading-tight truncate">
                {pillar.title}
              </h3>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                {ideaCount} {ideaCount === 1 ? "idea" : "ideas"}
              </p>
            </div>
          </div>
          <button
            onClick={() => onEdit(pillar)}
            className="shrink-0 h-7 w-7 rounded-md flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all hover:bg-muted text-muted-foreground hover:text-foreground"
          >
            <Pencil className="h-3.5 w-3.5" />
          </button>
        </div>

        {/* Description */}
        <p className="text-xs text-muted-foreground mb-3 line-clamp-2 leading-relaxed">
          {pillar.description}
        </p>

        {/* Topics */}
        {pillar.topics.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {pillar.topics.slice(0, 4).map((topic) => (
              <span
                key={topic}
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium"
                style={{
                  backgroundColor: `${pillar.color}15`,
                  color: pillar.color,
                }}
              >
                <Tag className="h-2.5 w-2.5" />
                {topic}
              </span>
            ))}
            {pillar.topics.length > 4 && (
              <span
                className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium"
                style={{
                  backgroundColor: `${pillar.color}10`,
                  color: pillar.color,
                }}
              >
                +{pillar.topics.length - 4} more
              </span>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
}

// ─── Idea Card ─────────────────────────────────────────────────────────────────

function IdeaCard({
  idea,
  pillar,
  onEdit,
}: {
  idea: ContentIdea;
  pillar?: ContentPillar;
  onEdit: (i: ContentIdea) => void;
}) {
  const status = STATUS_CONFIG[idea.status];

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      onClick={() => onEdit(idea)}
      className="glass-card p-4 cursor-pointer hover:border-primary/30 hover:shadow-sm transition-all duration-200 group"
    >
      {/* Pillar color accent + status */}
      <div className="flex items-start justify-between gap-2 mb-2.5">
        <div className="flex items-center gap-2 flex-wrap min-w-0">
          {pillar && (
            <span
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold shrink-0"
              style={{
                backgroundColor: `${pillar.color}18`,
                color: pillar.color,
              }}
            >
              <span
                className="h-1.5 w-1.5 rounded-full"
                style={{ backgroundColor: pillar.color }}
              />
              {pillar.title}
            </span>
          )}
          <span
            className={cn(
              "inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold border",
              status.classes
            )}
          >
            {status.label}
          </span>
        </div>
        <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/40 group-hover:text-primary/60 transition-colors shrink-0 mt-0.5" />
      </div>

      {/* Title */}
      <h4 className="font-medium text-sm leading-snug mb-2 group-hover:text-primary transition-colors line-clamp-2">
        {idea.title}
      </h4>

      {/* Notes preview */}
      {idea.notes && (
        <p className="text-xs text-muted-foreground line-clamp-2 mb-3 leading-relaxed">
          {idea.notes}
        </p>
      )}

      {/* Platform */}
      <div className="flex items-center gap-1.5">
        <span className="inline-flex items-center gap-1 text-[10px] font-medium text-muted-foreground bg-muted/60 px-2 py-0.5 rounded-full">
          <BookOpen className="h-2.5 w-2.5" />
          {idea.platform}
        </span>
      </div>
    </motion.div>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────────

export default function ContentPage() {
  const {
    pillars,
    ideas,
    addPillar,
    updatePillar,
    deletePillar,
    addIdea,
    updateIdea,
    deleteIdea,
  } = useContentStore();

  // Pillar dialog state
  const [pillarDialogOpen, setPillarDialogOpen] = useState(false);
  const [editingPillar, setEditingPillar] = useState<ContentPillar | null>(null);

  // Idea dialog state
  const [ideaDialogOpen, setIdeaDialogOpen] = useState(false);
  const [editingIdea, setEditingIdea] = useState<ContentIdea | null>(null);
  const [defaultIdeaPillarId, setDefaultIdeaPillarId] = useState<string>("");

  // Vault filters
  const [vaultSearch, setVaultSearch] = useState("");
  const [vaultPillarFilter, setVaultPillarFilter] = useState<string>("all");
  const [vaultStatusFilter, setVaultStatusFilter] = useState<IdeaStatus | "all">("all");
  const [vaultPlatformFilter, setVaultPlatformFilter] = useState<string>("all");

  // ── Pillar handlers ─────────────────────────────────────────────────────────

  function openNewPillar() {
    setEditingPillar(null);
    setPillarDialogOpen(true);
  }

  function openEditPillar(pillar: ContentPillar) {
    setEditingPillar(pillar);
    setPillarDialogOpen(true);
  }

  function handleSavePillar(
    data: Omit<ContentPillar, "id" | "createdAt" | "updatedAt">
  ) {
    if (editingPillar) {
      updatePillar(editingPillar.id, data);
    } else {
      addPillar(data);
    }
    setPillarDialogOpen(false);
    setEditingPillar(null);
  }

  function handleDeletePillar() {
    if (editingPillar) {
      deletePillar(editingPillar.id);
      setPillarDialogOpen(false);
      setEditingPillar(null);
    }
  }

  // ── Idea handlers ───────────────────────────────────────────────────────────

  function openNewIdea(pillarId?: string) {
    setEditingIdea(null);
    setDefaultIdeaPillarId(pillarId ?? "");
    setIdeaDialogOpen(true);
  }

  function openEditIdea(idea: ContentIdea) {
    setEditingIdea(idea);
    setIdeaDialogOpen(true);
  }

  function handleSaveIdea(
    data: Omit<ContentIdea, "id" | "createdAt" | "updatedAt">
  ) {
    if (editingIdea) {
      updateIdea(editingIdea.id, data);
    } else {
      addIdea(data);
    }
    setIdeaDialogOpen(false);
    setEditingIdea(null);
  }

  function handleDeleteIdea() {
    if (editingIdea) {
      deleteIdea(editingIdea.id);
      setIdeaDialogOpen(false);
      setEditingIdea(null);
    }
  }

  // ── Filtered vault ideas ────────────────────────────────────────────────────

  const filteredIdeas = ideas.filter((idea) => {
    const matchSearch =
      !vaultSearch ||
      idea.title.toLowerCase().includes(vaultSearch.toLowerCase()) ||
      idea.notes.toLowerCase().includes(vaultSearch.toLowerCase());
    const matchPillar =
      vaultPillarFilter === "all" ||
      (vaultPillarFilter === "__none__"
        ? !idea.pillarId
        : idea.pillarId === vaultPillarFilter);
    const matchStatus =
      vaultStatusFilter === "all" || idea.status === vaultStatusFilter;
    const matchPlatform =
      vaultPlatformFilter === "all" || idea.platform === vaultPlatformFilter;
    return matchSearch && matchPillar && matchStatus && matchPlatform;
  });

  // Unique platforms in vault
  const vaultPlatforms = Array.from(new Set(ideas.map((i) => i.platform))).sort();

  // Pillar lookup map
  const pillarMap = Object.fromEntries(pillars.map((p) => [p.id, p]));

  // Count ideas per pillar
  const ideaCountByPillar = Object.fromEntries(
    pillars.map((p) => [p.id, ideas.filter((i) => i.pillarId === p.id).length])
  );

  return (
    <div className="page-container">
      {/* Page header */}
      <div className="page-header">
        <div className="flex items-center gap-2 mb-1">
          <div className="p-1.5 rounded-lg bg-primary/10">
            <Lightbulb className="h-5 w-5 text-primary" />
          </div>
          <h1 className="page-title">Content</h1>
        </div>
        <p className="page-description">
          Manage your content pillars and build out your content vault.
        </p>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="pillars" className="w-full">
        <TabsList className="mb-6 w-auto">
          <TabsTrigger value="pillars" className="gap-2">
            <Layers className="h-4 w-4" />
            Content Pillars
            <span className="ml-1 text-xs font-bold opacity-60">
              {pillars.length}
            </span>
          </TabsTrigger>
          <TabsTrigger value="vault" className="gap-2">
            <LayoutGrid className="h-4 w-4" />
            Content Vault
            <span className="ml-1 text-xs font-bold opacity-60">
              {ideas.length}
            </span>
          </TabsTrigger>
        </TabsList>

        {/* ── Pillars Tab ── */}
        <TabsContent value="pillars">
          {/* Toolbar */}
          <div className="flex items-center justify-between mb-5">
            <p className="text-sm text-muted-foreground">
              {pillars.length === 0
                ? "Define the core themes your content revolves around."
                : `${pillars.length} pillars · ${ideas.length} total ideas`}
            </p>
            <Button onClick={openNewPillar} size="sm">
              <Plus className="h-4 w-4" />
              Add Pillar
            </Button>
          </div>

          {/* Pillar grid */}
          {pillars.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="glass-card p-12 flex flex-col items-center text-center gap-3"
            >
              <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-1">
                <Layers className="h-7 w-7 text-primary" />
              </div>
              <h3 className="font-semibold text-base">No content pillars yet</h3>
              <p className="text-sm text-muted-foreground max-w-sm">
                Content pillars are the core themes your brand is known for. Start
                by defining 3-5 pillars that represent your expertise.
              </p>
              <Button onClick={openNewPillar} className="mt-2">
                <Plus className="h-4 w-4" />
                Create Your First Pillar
              </Button>
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <AnimatePresence>
                {pillars.map((pillar) => (
                  <PillarCard
                    key={pillar.id}
                    pillar={pillar}
                    ideaCount={ideaCountByPillar[pillar.id] ?? 0}
                    onEdit={openEditPillar}
                  />
                ))}
              </AnimatePresence>

              {/* Add pillar card */}
              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                onClick={openNewPillar}
                className="glass-card p-5 border-dashed border-border/70 hover:border-primary/40 transition-colors flex flex-col items-center justify-center gap-2 text-muted-foreground hover:text-primary min-h-[160px] group"
              >
                <div className="h-9 w-9 rounded-lg border-2 border-dashed border-current flex items-center justify-center transition-transform group-hover:scale-110">
                  <Plus className="h-4 w-4" />
                </div>
                <span className="text-sm font-medium">Add Pillar</span>
              </motion.button>
            </div>
          )}

          {/* Pillar-grouped ideas preview */}
          {pillars.length > 0 && (
            <div className="mt-8">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold text-base">Ideas by Pillar</h2>
                <button
                  onClick={() => openNewIdea()}
                  className="text-xs text-primary hover:underline flex items-center gap-1"
                >
                  <Plus className="h-3 w-3" />
                  Add idea
                </button>
              </div>

              <div className="space-y-4">
                {pillars.map((pillar) => {
                  const pillarIdeas = ideas
                    .filter((i) => i.pillarId === pillar.id)
                    .slice(0, 3);

                  return (
                    <div key={pillar.id} className="glass-card overflow-hidden">
                      {/* Pillar header */}
                      <div
                        className="px-4 py-3 flex items-center justify-between"
                        style={{ backgroundColor: `${pillar.color}12` }}
                      >
                        <div className="flex items-center gap-2.5">
                          <div
                            className="h-2.5 w-2.5 rounded-full"
                            style={{ backgroundColor: pillar.color }}
                          />
                          <span className="font-semibold text-sm">{pillar.title}</span>
                          <span
                            className="text-[10px] font-bold px-1.5 py-0.5 rounded-full"
                            style={{
                              backgroundColor: `${pillar.color}20`,
                              color: pillar.color,
                            }}
                          >
                            {ideaCountByPillar[pillar.id] ?? 0}
                          </span>
                        </div>
                        <button
                          onClick={() => openNewIdea(pillar.id)}
                          className="text-xs font-medium hover:underline flex items-center gap-0.5"
                          style={{ color: pillar.color }}
                        >
                          <Plus className="h-3 w-3" />
                          Add idea
                        </button>
                      </div>

                      {/* Ideas list */}
                      <div className="divide-y divide-border/40">
                        {pillarIdeas.length === 0 ? (
                          <p className="px-4 py-3 text-xs text-muted-foreground italic">
                            No ideas yet — add your first!
                          </p>
                        ) : (
                          pillarIdeas.map((idea) => {
                            const status = STATUS_CONFIG[idea.status];
                            return (
                              <button
                                key={idea.id}
                                onClick={() => openEditIdea(idea)}
                                className="w-full px-4 py-3 flex items-center gap-3 hover:bg-muted/30 transition-colors text-left group"
                              >
                                <span
                                  className={cn(
                                    "inline-flex shrink-0 items-center px-2 py-0.5 rounded-full text-[10px] font-semibold border",
                                    status.classes
                                  )}
                                >
                                  {status.label}
                                </span>
                                <span className="text-sm flex-1 truncate group-hover:text-primary transition-colors">
                                  {idea.title}
                                </span>
                                <span className="text-[10px] text-muted-foreground shrink-0 bg-muted/60 px-2 py-0.5 rounded-full">
                                  {idea.platform}
                                </span>
                              </button>
                            );
                          })
                        )}
                        {(ideaCountByPillar[pillar.id] ?? 0) > 3 && (
                          <p className="px-4 py-2 text-xs text-muted-foreground">
                            +{(ideaCountByPillar[pillar.id] ?? 0) - 3} more ideas in vault
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </TabsContent>

        {/* ── Vault Tab ── */}
        <TabsContent value="vault">
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-3 mb-5">
            {/* Search */}
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                value={vaultSearch}
                onChange={(e) => setVaultSearch(e.target.value)}
                placeholder="Search ideas..."
                className="pl-9"
              />
            </div>

            {/* Pillar filter */}
            <Select
              value={vaultPillarFilter}
              onValueChange={setVaultPillarFilter}
            >
              <SelectTrigger className="w-44">
                <SelectValue placeholder="All pillars" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All pillars</SelectItem>
                <SelectItem value="__none__">No pillar</SelectItem>
                {pillars.map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    <span className="flex items-center gap-2">
                      <span
                        className="h-2 w-2 rounded-full inline-block shrink-0"
                        style={{ backgroundColor: p.color }}
                      />
                      {p.title}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Status filter */}
            <Select
              value={vaultStatusFilter}
              onValueChange={(v) =>
                setVaultStatusFilter(v as IdeaStatus | "all")
              }
            >
              <SelectTrigger className="w-36">
                <SelectValue placeholder="All statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All statuses</SelectItem>
                {(Object.keys(STATUS_CONFIG) as IdeaStatus[]).map((s) => (
                  <SelectItem key={s} value={s}>
                    {STATUS_CONFIG[s].label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Platform filter */}
            {vaultPlatforms.length > 1 && (
              <Select
                value={vaultPlatformFilter}
                onValueChange={setVaultPlatformFilter}
              >
                <SelectTrigger className="w-36">
                  <SelectValue placeholder="All platforms" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All platforms</SelectItem>
                  {vaultPlatforms.map((p) => (
                    <SelectItem key={p} value={p}>
                      {p}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}

            <Button onClick={() => openNewIdea()} className="sm:ml-auto shrink-0">
              <Plus className="h-4 w-4" />
              Add Idea
            </Button>
          </div>

          {/* Results count */}
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-muted-foreground">
              {filteredIdeas.length === ideas.length
                ? `${ideas.length} ${ideas.length === 1 ? "idea" : "ideas"}`
                : `${filteredIdeas.length} of ${ideas.length} ideas`}
            </p>
            {(vaultSearch ||
              vaultPillarFilter !== "all" ||
              vaultStatusFilter !== "all" ||
              vaultPlatformFilter !== "all") && (
              <button
                onClick={() => {
                  setVaultSearch("");
                  setVaultPillarFilter("all");
                  setVaultStatusFilter("all");
                  setVaultPlatformFilter("all");
                }}
                className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors"
              >
                <X className="h-3 w-3" />
                Clear filters
              </button>
            )}
          </div>

          {/* Idea grid */}
          {ideas.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="glass-card p-12 flex flex-col items-center text-center gap-3"
            >
              <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-1">
                <Lightbulb className="h-7 w-7 text-primary" />
              </div>
              <h3 className="font-semibold text-base">Your vault is empty</h3>
              <p className="text-sm text-muted-foreground max-w-sm">
                Capture content ideas as they come to you. Assign them to a pillar,
                set a status, and track their progress.
              </p>
              <Button onClick={() => openNewIdea()} className="mt-2">
                <Plus className="h-4 w-4" />
                Add Your First Idea
              </Button>
            </motion.div>
          ) : filteredIdeas.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="glass-card p-10 flex flex-col items-center text-center gap-2"
            >
              <Search className="h-8 w-8 text-muted-foreground/40 mb-1" />
              <h3 className="font-medium text-sm">No ideas match your filters</h3>
              <p className="text-xs text-muted-foreground">
                Try adjusting the search or filter criteria.
              </p>
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <AnimatePresence>
                {filteredIdeas.map((idea) => (
                  <IdeaCard
                    key={idea.id}
                    idea={idea}
                    pillar={idea.pillarId ? pillarMap[idea.pillarId] : undefined}
                    onEdit={openEditIdea}
                  />
                ))}
              </AnimatePresence>
            </div>
          )}

          {/* Status summary strip */}
          {ideas.length > 0 && (
            <div className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-3">
              {(Object.keys(STATUS_CONFIG) as IdeaStatus[]).map((status) => {
                const count = ideas.filter((i) => i.status === status).length;
                const cfg = STATUS_CONFIG[status];
                return (
                  <div key={status} className="stat-card">
                    <span className="stat-label">{cfg.label}</span>
                    <span className="stat-value">{count}</span>
                  </div>
                );
              })}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Pillar dialog */}
      <PillarDialog
        open={pillarDialogOpen}
        onClose={() => {
          setPillarDialogOpen(false);
          setEditingPillar(null);
        }}
        pillar={editingPillar}
        onSave={handleSavePillar}
        onDelete={editingPillar ? handleDeletePillar : undefined}
      />

      {/* Idea dialog */}
      <IdeaDialog
        open={ideaDialogOpen}
        onClose={() => {
          setIdeaDialogOpen(false);
          setEditingIdea(null);
        }}
        idea={editingIdea}
        pillars={pillars}
        defaultPillarId={defaultIdeaPillarId}
        onSave={handleSaveIdea}
        onDelete={editingIdea ? handleDeleteIdea : undefined}
      />
    </div>
  );
}
