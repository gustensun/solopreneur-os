import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Brain,
  Plus,
  Trash2,
  FileText,
  Link,
  Video,
  Upload,
  Tag,
  User,
  Package,
  Megaphone,
  Star,
  BookOpen,
  CheckCircle,
  Clock,
  AlertCircle,
  Lightbulb,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useBrainStore } from "@/stores/brain";
import type { BrainCategory, ResourceType } from "@/types";
import { cn } from "@/lib/utils";

const CATEGORIES: { key: BrainCategory; label: string; icon: React.ReactNode; description: string }[] = [
  { key: "personal-brand", label: "Personal Brand", icon: <User className="h-4 w-4" />, description: "Your story, values, and positioning" },
  { key: "products-offers", label: "Products & Offers", icon: <Package className="h-4 w-4" />, description: "Offer details, sales pages, pricing" },
  { key: "marketing-content", label: "Marketing & Content", icon: <Megaphone className="h-4 w-4" />, description: "Content strategy, campaigns, copy" },
  { key: "social-proof", label: "Social Proof", icon: <Star className="h-4 w-4" />, description: "Testimonials, case studies, results" },
  { key: "resources", label: "Resources", icon: <BookOpen className="h-4 w-4" />, description: "Tools, references, links" },
];

const RESOURCE_ICONS: Record<ResourceType, React.ReactNode> = {
  text: <FileText className="h-4 w-4" />,
  url: <Link className="h-4 w-4" />,
  video: <Video className="h-4 w-4" />,
  file: <Upload className="h-4 w-4" />,
};

const STATUS_CONFIG = {
  processed: { label: "Processed", variant: "success" as const, icon: <CheckCircle className="h-3 w-3" /> },
  pending: { label: "Pending", variant: "warning" as const, icon: <Clock className="h-3 w-3" /> },
  error: { label: "Error", variant: "destructive" as const, icon: <AlertCircle className="h-3 w-3" /> },
};

type DialogType = "text" | "url" | "video" | "file" | "add-profile" | null;

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export default function BrainPage() {
  const {
    resources,
    profiles,
    activeProfileId,
    addResource,
    deleteResource,
    addProfile,
    setActiveProfile,
  } = useBrainStore();

  const [selectedCategory, setSelectedCategory] = useState<BrainCategory>("personal-brand");
  const [dialogType, setDialogType] = useState<DialogType>(null);

  // Dialog fields
  const [textName, setTextName] = useState("");
  const [textContent, setTextContent] = useState("");
  const [urlName, setUrlName] = useState("");
  const [urlValue, setUrlValue] = useState("");
  const [videoName, setVideoName] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [newProfileName, setNewProfileName] = useState("");
  const [newProfileDesc, setNewProfileDesc] = useState("");

  const profileResources = resources.filter((r) => r.profileId === activeProfileId);
  const categoryResources = profileResources.filter((r) => r.category === selectedCategory);

  const totalResources = profileResources.length;
  const processedCount = profileResources.filter((r) => r.status === "processed").length;
  const pendingCount = profileResources.filter((r) => r.status === "pending").length;
  const categoriesUsed = new Set(profileResources.map((r) => r.category)).size;

  function closeDialog() {
    setDialogType(null);
    setTextName(""); setTextContent("");
    setUrlName(""); setUrlValue("");
    setVideoName(""); setVideoUrl("");
    setNewProfileName(""); setNewProfileDesc("");
  }

  function handleAddText() {
    if (!textName.trim() || !textContent.trim()) return;
    addResource({
      name: textName.trim(),
      type: "text",
      category: selectedCategory,
      profileId: activeProfileId,
      status: "processed",
      content: textContent.trim(),
    });
    closeDialog();
  }

  function handleAddUrl() {
    if (!urlName.trim() || !urlValue.trim()) return;
    addResource({
      name: urlName.trim(),
      type: "url",
      category: selectedCategory,
      profileId: activeProfileId,
      status: "pending",
      url: urlValue.trim(),
    });
    closeDialog();
  }

  function handleAddVideo() {
    if (!videoName.trim() || !videoUrl.trim()) return;
    addResource({
      name: videoName.trim(),
      type: "video",
      category: selectedCategory,
      profileId: activeProfileId,
      status: "pending",
      url: videoUrl.trim(),
    });
    closeDialog();
  }

  function handleAddProfile() {
    if (!newProfileName.trim()) return;
    const initials = newProfileName
      .split(" ")
      .map((w) => w[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
    const id = addProfile({
      name: newProfileName.trim(),
      initials,
      description: newProfileDesc.trim(),
      isDefault: false,
    });
    setActiveProfile(id);
    closeDialog();
  }

  const activeProfile = profiles.find((p) => p.id === activeProfileId);

  return (
    <div className="page-container">
      {/* Header */}
      <div className="page-header flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="p-1.5 rounded-lg bg-primary/10">
              <Brain className="h-5 w-5 text-primary" />
            </div>
            <h1 className="page-title">Your AI Brain</h1>
          </div>
          <p className="page-description">
            Your personal knowledge base powering all AI-generated content.
          </p>
        </div>
      </div>

      {/* Stats bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {[
          { label: "Total Resources", value: totalResources },
          { label: "Processed", value: processedCount },
          { label: "Pending", value: pendingCount },
          { label: "Categories Used", value: categoriesUsed },
        ].map((stat) => (
          <div key={stat.label} className="stat-card">
            <span className="stat-value">{stat.value}</span>
            <span className="stat-label">{stat.label}</span>
          </div>
        ))}
      </div>

      {/* Main layout: sidebar + content */}
      <div className="flex flex-col lg:flex-row gap-5 min-h-[600px]">
        {/* Left Sidebar */}
        <div className="w-full lg:w-60 lg:shrink-0 flex flex-col gap-4">
          {/* Profiles */}
          <div className="glass-card p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Profiles
              </span>
              <button
                onClick={() => setDialogType("add-profile")}
                className="p-1 rounded hover:bg-accent/20 transition-colors"
                title="Add Profile"
              >
                <Plus className="h-3.5 w-3.5 text-muted-foreground" />
              </button>
            </div>
            <div className="flex flex-col gap-1">
              {profiles.map((profile) => {
                const isActive = profile.id === activeProfileId;
                return (
                  <button
                    key={profile.id}
                    onClick={() => setActiveProfile(profile.id)}
                    className={cn(
                      "flex items-center gap-2.5 px-2.5 py-2 rounded-md text-sm transition-all text-left w-full",
                      isActive
                        ? "bg-primary text-primary-foreground"
                        : "hover:bg-muted text-foreground"
                    )}
                  >
                    <div
                      className={cn(
                        "h-7 w-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0",
                        isActive ? "bg-primary-foreground/20 text-primary-foreground" : "bg-primary/10 text-primary"
                      )}
                    >
                      {profile.initials}
                    </div>
                    <span className="truncate font-medium text-xs">{profile.name}</span>
                    {isActive && <ChevronRight className="h-3 w-3 ml-auto shrink-0 opacity-60" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Categories */}
          <div className="glass-card p-4">
            <div className="flex items-center mb-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Categories
              </span>
            </div>
            <div className="flex flex-col gap-1">
              {CATEGORIES.map((cat) => {
                const count = profileResources.filter((r) => r.category === cat.key).length;
                const isActive = selectedCategory === cat.key;
                return (
                  <button
                    key={cat.key}
                    onClick={() => setSelectedCategory(cat.key)}
                    className={cn(
                      "flex items-center gap-2.5 px-2.5 py-2 rounded-md text-sm transition-all text-left w-full",
                      isActive
                        ? "bg-primary text-primary-foreground"
                        : "hover:bg-muted text-foreground"
                    )}
                  >
                    <span className={cn("shrink-0", isActive ? "text-primary-foreground" : "text-muted-foreground")}>
                      {cat.icon}
                    </span>
                    <span className="truncate text-xs font-medium flex-1">{cat.label}</span>
                    <span
                      className={cn(
                        "text-xs px-1.5 py-0.5 rounded-full font-semibold shrink-0",
                        isActive ? "bg-primary-foreground/20 text-primary-foreground" : "bg-muted text-muted-foreground"
                      )}
                    >
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Main content area */}
        <div className="flex-1 flex flex-col gap-4">
          {/* Category header + action buttons */}
          <div className="glass-card p-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">
                    {CATEGORIES.find((c) => c.key === selectedCategory)?.icon}
                  </span>
                  <h2 className="font-semibold">
                    {CATEGORIES.find((c) => c.key === selectedCategory)?.label}
                  </h2>
                </div>
                <p className="text-sm text-muted-foreground mt-0.5">
                  {CATEGORIES.find((c) => c.key === selectedCategory)?.description} &mdash; {activeProfile?.name}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button size="sm" onClick={() => setDialogType("text")}>
                  <Plus className="h-3.5 w-3.5" /> Add Text
                </Button>
                <Button size="sm" variant="outline" onClick={() => setDialogType("url")}>
                  <Link className="h-3.5 w-3.5" /> Add URL
                </Button>
                <Button size="sm" variant="outline" onClick={() => setDialogType("video")}>
                  <Video className="h-3.5 w-3.5" /> Add Video
                </Button>
                <Button size="sm" variant="outline" onClick={() => setDialogType("file")}>
                  <Upload className="h-3.5 w-3.5" /> Upload File
                </Button>
              </div>
            </div>
          </div>

          {/* Resources list */}
          <div className="flex flex-col gap-2">
            <AnimatePresence>
              {categoryResources.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="glass-card p-12 flex flex-col items-center justify-center text-center"
                >
                  <Tag className="h-10 w-10 text-muted-foreground/40 mb-3" />
                  <p className="font-medium text-muted-foreground">No resources yet</p>
                  <p className="text-sm text-muted-foreground/60 mt-1">
                    Add text, URLs, videos, or files to train your AI brain.
                  </p>
                </motion.div>
              ) : (
                categoryResources.map((resource, i) => {
                  const statusCfg = STATUS_CONFIG[resource.status];
                  return (
                    <motion.div
                      key={resource.id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ delay: i * 0.04 }}
                      className="glass-card p-4 flex items-center gap-4 hover-lift group"
                    >
                      <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 text-primary">
                        {RESOURCE_ICONS[resource.type]}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-medium text-sm truncate">{resource.name}</span>
                          <Badge variant={statusCfg.variant} className="flex items-center gap-1 text-xs">
                            {statusCfg.icon}
                            {statusCfg.label}
                          </Badge>
                        </div>
                        {resource.content && (
                          <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
                            {resource.content}
                          </p>
                        )}
                        {resource.url && !resource.content && (
                          <p className="text-xs text-muted-foreground mt-0.5 truncate">{resource.url}</p>
                        )}
                      </div>
                      <div className="flex items-center gap-3 shrink-0">
                        <span className="text-xs text-muted-foreground hidden sm:block">
                          {formatDate(resource.createdAt)}
                        </span>
                        <button
                          onClick={() => deleteResource(resource.id)}
                          className="p-1.5 rounded-md opacity-0 group-hover:opacity-100 hover:bg-destructive/10 hover:text-destructive transition-all"
                          title="Delete resource"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </motion.div>
                  );
                })
              )}
            </AnimatePresence>
          </div>

          {/* Training Tips */}
          <div className="glass-card p-4 border-l-4 border-l-primary mt-2">
            <div className="flex items-start gap-3">
              <Lightbulb className="h-5 w-5 text-primary shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-sm mb-1">Training Tips</h3>
                <ul className="text-xs text-muted-foreground space-y-1">
                  <li>Add your brand story, mission, and core values to <strong>Personal Brand</strong> for on-brand content.</li>
                  <li>Paste sales page copy and pricing into <strong>Products &amp; Offers</strong> to improve offer-related outputs.</li>
                  <li>Include testimonials and case studies in <strong>Social Proof</strong> for powerful social content.</li>
                  <li>The more high-quality context you add, the more personalised every AI output becomes.</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Add Text Dialog */}
      <Dialog open={dialogType === "text"} onOpenChange={(o) => !o && closeDialog()}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="h-4 w-4" /> Add Text Resource
            </DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-4 py-2">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="text-name">Name</Label>
              <Input
                id="text-name"
                placeholder="e.g. Brand Story"
                value={textName}
                onChange={(e) => setTextName(e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="text-content">Content</Label>
              <Textarea
                id="text-content"
                placeholder="Paste or type your content here…"
                className="min-h-[140px] resize-none"
                value={textContent}
                onChange={(e) => setTextContent(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={closeDialog}>Cancel</Button>
            <Button onClick={handleAddText} disabled={!textName.trim() || !textContent.trim()}>
              Add Resource
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add URL Dialog */}
      <Dialog open={dialogType === "url"} onOpenChange={(o) => !o && closeDialog()}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Link className="h-4 w-4" /> Add URL Resource
            </DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-4 py-2">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="url-name">Name</Label>
              <Input
                id="url-name"
                placeholder="e.g. Sales Page"
                value={urlName}
                onChange={(e) => setUrlName(e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="url-value">URL</Label>
              <Input
                id="url-value"
                type="url"
                placeholder="https://example.com/page"
                value={urlValue}
                onChange={(e) => setUrlValue(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={closeDialog}>Cancel</Button>
            <Button onClick={handleAddUrl} disabled={!urlName.trim() || !urlValue.trim()}>
              Add URL
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Video Dialog */}
      <Dialog open={dialogType === "video"} onOpenChange={(o) => !o && closeDialog()}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Video className="h-4 w-4" /> Add Video Resource
            </DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-4 py-2">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="video-name">Name</Label>
              <Input
                id="video-name"
                placeholder="e.g. Intro YouTube Video"
                value={videoName}
                onChange={(e) => setVideoName(e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="video-url">Video URL</Label>
              <Input
                id="video-url"
                type="url"
                placeholder="https://youtube.com/watch?v=…"
                value={videoUrl}
                onChange={(e) => setVideoUrl(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={closeDialog}>Cancel</Button>
            <Button onClick={handleAddVideo} disabled={!videoName.trim() || !videoUrl.trim()}>
              Add Video
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Upload File — coming soon placeholder */}
      <Dialog open={dialogType === "file"} onOpenChange={(o) => !o && closeDialog()}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Upload className="h-4 w-4" /> Upload File
            </DialogTitle>
          </DialogHeader>
          <div className="py-6 flex flex-col items-center gap-3 text-center">
            <div className="h-14 w-14 rounded-xl bg-primary/10 flex items-center justify-center">
              <Upload className="h-6 w-6 text-primary" />
            </div>
            <p className="font-medium">File uploads coming soon</p>
            <p className="text-sm text-muted-foreground max-w-xs">
              Drag &amp; drop support for PDFs, Word docs, and text files will be available in an upcoming update.
            </p>
          </div>
          <DialogFooter>
            <Button onClick={closeDialog}>Got it</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Profile Dialog */}
      <Dialog open={dialogType === "add-profile"} onOpenChange={(o) => !o && closeDialog()}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <User className="h-4 w-4" /> New Brain Profile
            </DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-4 py-2">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="profile-name">Full Name</Label>
              <Input
                id="profile-name"
                placeholder="e.g. John Smith"
                value={newProfileName}
                onChange={(e) => setNewProfileName(e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="profile-desc">Description (optional)</Label>
              <Input
                id="profile-desc"
                placeholder="e.g. Client brand knowledge base"
                value={newProfileDesc}
                onChange={(e) => setNewProfileDesc(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={closeDialog}>Cancel</Button>
            <Button onClick={handleAddProfile} disabled={!newProfileName.trim()}>
              Create Profile
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
