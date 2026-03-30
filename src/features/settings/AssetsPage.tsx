import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FolderOpen,
  Upload,
  Trash2,
  FileText,
  Image,
  FileType,
  Film,
  Music,
  File,
  Search,
  Filter,
  X,
  Download,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

// ─── Types ────────────────────────────────────────────────────────────────────

type AssetType = "image" | "document" | "pdf" | "video" | "audio" | "other";

interface Asset {
  id: string;
  name: string;
  type: AssetType;
  size: number; // bytes
  url: string;
  createdAt: string;
  thumbnail?: string;
}

// ─── Mock data ────────────────────────────────────────────────────────────────

const MOCK_ASSETS: Asset[] = [
  {
    id: "a1",
    name: "Brand Guidelines.pdf",
    type: "pdf",
    size: 2_400_000,
    url: "#",
    createdAt: "2026-02-15T10:00:00Z",
  },
  {
    id: "a2",
    name: "Profile Photo.png",
    type: "image",
    size: 850_000,
    url: "#",
    createdAt: "2026-02-18T14:30:00Z",
  },
  {
    id: "a3",
    name: "Sales Deck Q1.pdf",
    type: "pdf",
    size: 5_100_000,
    url: "#",
    createdAt: "2026-03-01T09:15:00Z",
  },
  {
    id: "a4",
    name: "Intro Video.mp4",
    type: "video",
    size: 42_000_000,
    url: "#",
    createdAt: "2026-03-05T16:45:00Z",
  },
  {
    id: "a5",
    name: "Offer Template.docx",
    type: "document",
    size: 130_000,
    url: "#",
    createdAt: "2026-03-10T11:00:00Z",
  },
  {
    id: "a6",
    name: "Podcast Episode 12.mp3",
    type: "audio",
    size: 28_500_000,
    url: "#",
    createdAt: "2026-03-12T08:30:00Z",
  },
  {
    id: "a7",
    name: "Content Calendar.xlsx",
    type: "document",
    size: 95_000,
    url: "#",
    createdAt: "2026-03-15T13:20:00Z",
  },
  {
    id: "a8",
    name: "Hero Banner.jpg",
    type: "image",
    size: 620_000,
    url: "#",
    createdAt: "2026-03-20T10:10:00Z",
  },
  {
    id: "a9",
    name: "Client Contract Template.pdf",
    type: "pdf",
    size: 320_000,
    url: "#",
    createdAt: "2026-03-22T15:00:00Z",
  },
  {
    id: "a10",
    name: "Logo Dark.svg",
    type: "image",
    size: 18_000,
    url: "#",
    createdAt: "2026-03-25T09:00:00Z",
  },
];

const TYPE_FILTERS = [
  { id: "all" as const, label: "All Types" },
  { id: "image" as const, label: "Images" },
  { id: "pdf" as const, label: "PDFs" },
  { id: "document" as const, label: "Documents" },
  { id: "video" as const, label: "Videos" },
  { id: "audio" as const, label: "Audio" },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

const TYPE_CONFIG: Record<AssetType, { icon: React.ReactNode; color: string; bg: string }> = {
  image: {
    icon: <Image className="h-8 w-8" />,
    color: "text-emerald-600",
    bg: "bg-emerald-50",
  },
  pdf: {
    icon: <FileType className="h-8 w-8" />,
    color: "text-red-500",
    bg: "bg-red-50",
  },
  document: {
    icon: <FileText className="h-8 w-8" />,
    color: "text-blue-600",
    bg: "bg-blue-50",
  },
  video: {
    icon: <Film className="h-8 w-8" />,
    color: "text-purple-600",
    bg: "bg-purple-50",
  },
  audio: {
    icon: <Music className="h-8 w-8" />,
    color: "text-amber-600",
    bg: "bg-amber-50",
  },
  other: {
    icon: <File className="h-8 w-8" />,
    color: "text-slate-500",
    bg: "bg-slate-50",
  },
};

function inferType(filename: string): AssetType {
  const ext = filename.split(".").pop()?.toLowerCase() ?? "";
  if (["jpg", "jpeg", "png", "gif", "svg", "webp", "avif"].includes(ext)) return "image";
  if (["pdf"].includes(ext)) return "pdf";
  if (["doc", "docx", "xlsx", "xls", "pptx", "ppt", "txt", "csv", "md"].includes(ext)) return "document";
  if (["mp4", "mov", "avi", "webm", "mkv"].includes(ext)) return "video";
  if (["mp3", "wav", "aac", "ogg", "flac"].includes(ext)) return "audio";
  return "other";
}

// ─── Asset Card ───────────────────────────────────────────────────────────────

function AssetCard({
  asset,
  onDelete,
}: {
  asset: Asset;
  onDelete: () => void;
}) {
  const config = TYPE_CONFIG[asset.type];
  const [confirmDelete, setConfirmDelete] = useState(false);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.96 }}
      className="glass-card p-4 flex flex-col gap-3 group hover:border-border hover:shadow-sm transition-all"
    >
      {/* Icon / preview */}
      <div
        className={cn(
          "w-full h-24 rounded-lg flex items-center justify-center",
          config.bg,
          config.color
        )}
      >
        {config.icon}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate leading-tight mb-0.5" title={asset.name}>
          {asset.name}
        </p>
        <p className="text-xs text-muted-foreground">
          {formatBytes(asset.size)}
          <span className="mx-1.5">·</span>
          {formatDate(asset.createdAt)}
        </p>
      </div>

      {/* Type badge */}
      <div className="flex items-center justify-between">
        <span
          className={cn(
            "inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wide",
            config.bg,
            config.color
          )}
        >
          {asset.type}
        </span>

        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => toast.info("Download not available in demo")}
            className="p-1.5 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
            title="Download"
          >
            <Download className="h-3.5 w-3.5" />
          </button>
          {confirmDelete ? (
            <div className="flex items-center gap-1">
              <button
                onClick={onDelete}
                className="p-1.5 rounded-lg bg-destructive/10 text-destructive hover:bg-destructive/20 transition-colors"
                title="Confirm delete"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
              <button
                onClick={() => setConfirmDelete(false)}
                className="p-1.5 rounded-lg hover:bg-muted transition-colors text-muted-foreground"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => setConfirmDelete(true)}
              className="p-1.5 rounded-lg hover:bg-destructive/10 hover:text-destructive text-muted-foreground transition-colors"
              title="Delete"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function AssetsPage() {
  const [assets, setAssets] = useState<Asset[]>(MOCK_ASSETS);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<AssetType | "all">("all");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const filtered = assets.filter((a) => {
    const matchSearch = !search || a.name.toLowerCase().includes(search.toLowerCase());
    const matchType = typeFilter === "all" || a.type === typeFilter;
    return matchSearch && matchType;
  });

  const totalSize = assets.reduce((acc, a) => acc + a.size, 0);

  function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    if (files.length === 0) return;

    const newAssets: Asset[] = files.map((file) => ({
      id: `upload-${Date.now()}-${Math.random().toString(36).slice(2)}`,
      name: file.name,
      type: inferType(file.name),
      size: file.size,
      url: URL.createObjectURL(file),
      createdAt: new Date().toISOString(),
    }));

    setAssets((prev) => [...newAssets, ...prev]);
    toast.success(
      `${files.length} file${files.length > 1 ? "s" : ""} uploaded successfully`
    );
    e.target.value = "";
  }

  function handleDelete(id: string) {
    setAssets((prev) => prev.filter((a) => a.id !== id));
    toast.success("Asset deleted");
  }

  return (
    <div className="page-container">
      {/* Header */}
      <div className="page-header">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="p-1.5 rounded-lg bg-primary/10">
                <FolderOpen className="h-5 w-5 text-primary" />
              </div>
              <h1 className="page-title">Digital Assets</h1>
            </div>
            <p className="page-description">
              Manage your files, images, documents, and media.
            </p>
          </div>
          <Button onClick={() => fileInputRef.current?.click()}>
            <Upload className="h-4 w-4" />
            Upload Files
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        <div className="stat-card">
          <span className="stat-label">Total Assets</span>
          <span className="stat-value">{assets.length}</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Storage Used</span>
          <span className="stat-value">{formatBytes(totalSize)}</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Images</span>
          <span className="stat-value">
            {assets.filter((a) => a.type === "image").length}
          </span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Documents</span>
          <span className="stat-value">
            {assets.filter((a) => ["pdf", "document"].includes(a.type)).length}
          </span>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search assets..."
            className="pl-9"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <Select
            value={typeFilter}
            onValueChange={(v) => setTypeFilter(v as AssetType | "all")}
          >
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {TYPE_FILTERS.map((f) => (
                <SelectItem key={f.id} value={f.id}>
                  {f.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <FolderOpen className="h-12 w-12 text-muted-foreground/30 mb-4" />
          <h3 className="font-semibold mb-1">No assets found</h3>
          <p className="text-sm text-muted-foreground mb-4">
            {search || typeFilter !== "all"
              ? "Try adjusting your search or filter"
              : "Upload your first file to get started"}
          </p>
          {!search && typeFilter === "all" && (
            <Button variant="outline" onClick={() => fileInputRef.current?.click()}>
              <Upload className="h-4 w-4" />
              Upload Files
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          <AnimatePresence>
            {filtered.map((asset) => (
              <AssetCard
                key={asset.id}
                asset={asset}
                onDelete={() => handleDelete(asset.id)}
              />
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        className="hidden"
        onChange={handleUpload}
      />
    </div>
  );
}
