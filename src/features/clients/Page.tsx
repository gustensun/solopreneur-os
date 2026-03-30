import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Users,
  Plus,
  X,
  Trash2,
  Tag,
  DollarSign,
  Building2,
  Mail,
  LayoutGrid,
  List,
  GripVertical,
  Search,
  ChevronRight,
  Edit2,
  Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useClientsStore } from "@/stores/clients";
import type { Client, ClientStatus } from "@/types";
import { cn } from "@/lib/utils";

// ─── Column config ────────────────────────────────────────────────────────────

const COLUMNS: {
  id: ClientStatus;
  label: string;
  color: string;
  headerBg: string;
  dot: string;
}[] = [
  {
    id: "lead",
    label: "Lead",
    color: "text-slate-600",
    headerBg: "bg-slate-100",
    dot: "bg-slate-400",
  },
  {
    id: "prospect",
    label: "Prospect",
    color: "text-blue-600",
    headerBg: "bg-blue-50",
    dot: "bg-blue-400",
  },
  {
    id: "active",
    label: "Active",
    color: "text-emerald-600",
    headerBg: "bg-emerald-50",
    dot: "bg-emerald-400",
  },
  {
    id: "completed",
    label: "Completed",
    color: "text-purple-600",
    headerBg: "bg-purple-50",
    dot: "bg-purple-400",
  },
  {
    id: "churned",
    label: "Churned",
    color: "text-red-500",
    headerBg: "bg-red-50",
    dot: "bg-red-400",
  },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatCurrency(val: number) {
  if (val === 0) return "—";
  return "$" + val.toLocaleString();
}

function getInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function getAvatarColor(name: string) {
  const colors = [
    "bg-emerald-100 text-emerald-700",
    "bg-blue-100 text-blue-700",
    "bg-purple-100 text-purple-700",
    "bg-amber-100 text-amber-700",
    "bg-rose-100 text-rose-700",
    "bg-cyan-100 text-cyan-700",
  ];
  let hash = 0;
  for (const c of name) hash = c.charCodeAt(0) + hash * 31;
  return colors[Math.abs(hash) % colors.length];
}

// ─── Client Card ──────────────────────────────────────────────────────────────

function ClientCard({
  client,
  onClick,
  onDragStart,
  onDragOver,
  onDrop,
}: {
  client: Client;
  onClick: () => void;
  onDragStart: (e: React.DragEvent<HTMLDivElement>) => void;
  onDragOver: (e: React.DragEvent<HTMLDivElement>) => void;
  onDrop: (e: React.DragEvent<HTMLDivElement>) => void;
}) {
  return (
    <div
      draggable
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDrop={onDrop}
      onClick={onClick}
      className="glass-card p-3.5 cursor-pointer hover:border-primary/30 hover:shadow-sm transition-all duration-200 group select-none"
    >
      <div className="flex items-start gap-2.5 mb-2.5">
        <div
          className={cn(
            "w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0",
            getAvatarColor(client.name)
          )}
        >
          {getInitials(client.name)}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-sm leading-tight group-hover:text-primary transition-colors">
            {client.name}
          </p>
          {client.company && (
            <p className="text-xs text-muted-foreground truncate">{client.company}</p>
          )}
        </div>
        <GripVertical className="h-4 w-4 text-muted-foreground/30 flex-shrink-0 mt-0.5" />
      </div>

      <p className="text-xs text-muted-foreground mb-2.5 truncate">{client.email}</p>

      {client.value > 0 && (
        <div className="mb-2.5">
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-primary/10 text-primary">
            <DollarSign className="h-3 w-3" />
            {client.value.toLocaleString()}
          </span>
        </div>
      )}

      {client.tags.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {client.tags.slice(0, 2).map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-medium bg-muted text-muted-foreground"
            >
              <Tag className="h-2.5 w-2.5" />
              {tag}
            </span>
          ))}
          {client.tags.length > 2 && (
            <span className="text-[10px] text-muted-foreground self-center">
              +{client.tags.length - 2}
            </span>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Client Detail Panel ──────────────────────────────────────────────────────

function ClientDetailPanel({
  client,
  onClose,
  onDelete,
}: {
  client: Client;
  onClose: () => void;
  onDelete: () => void;
}) {
  const { updateClient } = useClientsStore();

  const [name, setName] = useState(client.name);
  const [email, setEmail] = useState(client.email);
  const [company, setCompany] = useState(client.company ?? "");
  const [status, setStatus] = useState<ClientStatus>(client.status);
  const [value, setValue] = useState(String(client.value));
  const [notes, setNotes] = useState(client.notes);
  const [tags, setTags] = useState<string[]>(client.tags);
  const [tagInput, setTagInput] = useState("");
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [saved, setSaved] = useState(false);

  function handleSave() {
    updateClient(client.id, {
      name: name.trim(),
      email: email.trim(),
      company: company.trim() || undefined,
      status,
      value: Number(value) || 0,
      notes,
      tags,
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  function addTag() {
    const t = tagInput.trim().toLowerCase().replace(/\s+/g, "-");
    if (t && !tags.includes(t)) setTags((prev) => [...prev, t]);
    setTagInput("");
  }

  function removeTag(tag: string) {
    setTags((prev) => prev.filter((t) => t !== tag));
  }

  const isDirty =
    name !== client.name ||
    email !== client.email ||
    (company || "") !== (client.company ?? "") ||
    status !== client.status ||
    Number(value) !== client.value ||
    notes !== client.notes ||
    JSON.stringify(tags) !== JSON.stringify(client.tags);

  return (
    <motion.div
      initial={{ x: "100%", opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: "100%", opacity: 0 }}
      transition={{ type: "spring", damping: 30, stiffness: 300 }}
      className="fixed right-0 top-0 h-full w-full max-w-md bg-background border-l border-border shadow-2xl z-50 flex flex-col"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-border flex-shrink-0">
        <div className="flex items-center gap-3">
          <div
            className={cn(
              "w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold",
              getAvatarColor(client.name)
            )}
          >
            {getInitials(client.name)}
          </div>
          <div>
            <p className="font-semibold text-sm">{client.name}</p>
            <p className="text-xs text-muted-foreground">{client.email}</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-1.5 rounded-lg hover:bg-muted transition-colors"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
        {/* Name */}
        <div className="space-y-1.5">
          <Label className="text-xs">Full Name</Label>
          <Input value={name} onChange={(e) => setName(e.target.value)} />
        </div>

        {/* Email */}
        <div className="space-y-1.5">
          <Label className="text-xs">
            <span className="flex items-center gap-1">
              <Mail className="h-3 w-3" />
              Email
            </span>
          </Label>
          <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>

        {/* Company */}
        <div className="space-y-1.5">
          <Label className="text-xs">
            <span className="flex items-center gap-1">
              <Building2 className="h-3 w-3" />
              Company
            </span>
          </Label>
          <Input
            value={company}
            onChange={(e) => setCompany(e.target.value)}
            placeholder="Optional"
          />
        </div>

        {/* Status + Value */}
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label className="text-xs">Status</Label>
            <Select value={status} onValueChange={(v) => setStatus(v as ClientStatus)}>
              <SelectTrigger className="h-9">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {COLUMNS.map((col) => (
                  <SelectItem key={col.id} value={col.id}>
                    {col.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">
              <span className="flex items-center gap-1">
                <DollarSign className="h-3 w-3" />
                Value ($)
              </span>
            </Label>
            <Input
              type="number"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder="0"
              className="h-9"
            />
          </div>
        </div>

        {/* Notes */}
        <div className="space-y-1.5">
          <Label className="text-xs">Notes</Label>
          <Textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Add client notes..."
            rows={5}
            className="resize-none"
          />
        </div>

        {/* Tags */}
        <div className="space-y-1.5">
          <Label className="text-xs">
            <span className="flex items-center gap-1">
              <Tag className="h-3 w-3" />
              Tags
            </span>
          </Label>
          <div className="flex gap-2">
            <Input
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  addTag();
                }
              }}
              placeholder="Add tag..."
              className="flex-1 h-9"
            />
            <Button variant="outline" size="sm" onClick={addTag} className="h-9">
              Add
            </Button>
          </div>
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-1.5">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-primary/10 text-primary"
                >
                  {tag}
                  <button
                    onClick={() => removeTag(tag)}
                    className="hover:text-destructive transition-colors ml-0.5"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-border px-5 py-4 flex items-center justify-between flex-shrink-0">
        <div>
          {confirmDelete ? (
            <div className="flex items-center gap-2">
              <span className="text-xs text-destructive">Are you sure?</span>
              <Button size="sm" variant="destructive" onClick={onDelete}>
                Delete
              </Button>
              <Button size="sm" variant="ghost" onClick={() => setConfirmDelete(false)}>
                Cancel
              </Button>
            </div>
          ) : (
            <Button
              size="sm"
              variant="ghost"
              className="text-muted-foreground hover:text-destructive"
              onClick={() => setConfirmDelete(true)}
            >
              <Trash2 className="h-3.5 w-3.5" />
              Delete
            </Button>
          )}
        </div>
        <Button
          size="sm"
          onClick={handleSave}
          disabled={!isDirty && !saved}
          className={cn(saved && "bg-emerald-600 hover:bg-emerald-700")}
        >
          {saved ? (
            <>
              <Check className="h-3.5 w-3.5" />
              Saved
            </>
          ) : (
            <>
              <Edit2 className="h-3.5 w-3.5" />
              Save Changes
            </>
          )}
        </Button>
      </div>
    </motion.div>
  );
}

// ─── Add Client Dialog ────────────────────────────────────────────────────────

function AddClientDialog({
  open,
  onClose,
  defaultStatus,
}: {
  open: boolean;
  onClose: () => void;
  defaultStatus: ClientStatus;
}) {
  const { addClient } = useClientsStore();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [company, setCompany] = useState("");
  const [status, setStatus] = useState<ClientStatus>(defaultStatus);
  const [value, setValue] = useState("");

  function reset() {
    setName("");
    setEmail("");
    setCompany("");
    setStatus(defaultStatus);
    setValue("");
  }

  function handleSubmit() {
    if (!name.trim() || !email.trim()) return;
    addClient({
      name: name.trim(),
      email: email.trim(),
      company: company.trim() || undefined,
      status,
      value: Number(value) || 0,
      notes: "",
      tags: [],
    });
    reset();
    onClose();
  }

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) { reset(); onClose(); } }}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Add New Client</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label>Full Name *</Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Jane Smith"
              autoFocus
            />
          </div>
          <div className="space-y-1.5">
            <Label>Email *</Label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="jane@example.com"
            />
          </div>
          <div className="space-y-1.5">
            <Label>Company</Label>
            <Input
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              placeholder="Optional"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Status</Label>
              <Select value={status} onValueChange={(v) => setStatus(v as ClientStatus)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {COLUMNS.map((col) => (
                    <SelectItem key={col.id} value={col.id}>
                      {col.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Value ($)</Label>
              <Input
                type="number"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                placeholder="0"
              />
            </div>
          </div>
          <div className="flex gap-2 justify-end pt-2">
            <Button variant="outline" onClick={() => { reset(); onClose(); }}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={!name.trim() || !email.trim()}>
              Add Client
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ─── List Row ─────────────────────────────────────────────────────────────────

function ClientListRow({ client, onClick }: { client: Client; onClick: () => void }) {
  const col = COLUMNS.find((c) => c.id === client.status)!;
  return (
    <motion.div
      layout
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClick}
      className="flex items-center gap-4 px-4 py-3 border-b border-border/50 last:border-0 hover:bg-muted/30 cursor-pointer transition-colors group"
    >
      <div
        className={cn(
          "w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0",
          getAvatarColor(client.name)
        )}
      >
        {getInitials(client.name)}
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-medium text-sm">{client.name}</p>
        <p className="text-xs text-muted-foreground">{client.email}</p>
      </div>
      {client.company && (
        <p className="text-xs text-muted-foreground hidden md:block truncate max-w-[120px]">
          {client.company}
        </p>
      )}
      <div className="flex items-center gap-1.5 flex-shrink-0">
        <span className={cn("h-1.5 w-1.5 rounded-full", col.dot)} />
        <span className={cn("text-xs font-medium", col.color)}>{col.label}</span>
      </div>
      <span className="text-xs font-semibold text-primary flex-shrink-0 w-16 text-right">
        {formatCurrency(client.value)}
      </span>
      <ChevronRight className="h-4 w-4 text-muted-foreground/40 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
    </motion.div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function ClientsPage() {
  const { clients, deleteClient, getTotalRevenue, updateClient } = useClientsStore();

  const [view, setView] = useState<"kanban" | "list">("kanban");
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [addOpen, setAddOpen] = useState(false);
  const [addStatus, setAddStatus] = useState<ClientStatus>("lead");
  const [search, setSearch] = useState("");
  const [dragClientId, setDragClientId] = useState<string | null>(null);

  const totalRevenue = getTotalRevenue();
  const activeClients = clients.filter((c) => c.status === "active").length;

  const filtered = clients.filter((c) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      c.name.toLowerCase().includes(q) ||
      c.email.toLowerCase().includes(q) ||
      (c.company ?? "").toLowerCase().includes(q) ||
      c.tags.some((t) => t.toLowerCase().includes(q))
    );
  });

  function handleDragStart(e: React.DragEvent, clientId: string) {
    setDragClientId(clientId);
    e.dataTransfer.effectAllowed = "move";
  }

  function handleDragOver(e: React.DragEvent) {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  }

  function handleDropOnColumn(e: React.DragEvent, colId: ClientStatus) {
    e.preventDefault();
    if (!dragClientId) return;
    updateClient(dragClientId, { status: colId });
    setDragClientId(null);
  }

  function handleDeleteSelected() {
    if (!selectedClient) return;
    deleteClient(selectedClient.id);
    setSelectedClient(null);
  }

  // Sync detail panel when client changes
  const displayClient = selectedClient
    ? clients.find((c) => c.id === selectedClient.id) ?? null
    : null;

  return (
    <div className="page-container">
      {/* Header */}
      <div className="page-header">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="p-1.5 rounded-lg bg-primary/10">
                <Users className="h-5 w-5 text-primary" />
              </div>
              <h1 className="page-title">Clients</h1>
            </div>
            <p className="page-description">
              Manage your client relationships and pipeline.
            </p>
          </div>
          <Button
            onClick={() => {
              setAddStatus("lead");
              setAddOpen(true);
            }}
            className="shrink-0"
          >
            <Plus className="h-4 w-4" />
            Add Client
          </Button>
        </div>
      </div>

      {/* Stats bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
        <div className="stat-card">
          <span className="stat-label">Total Clients</span>
          <span className="stat-value">{clients.length}</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Active</span>
          <span className="stat-value">{activeClients}</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Total Revenue</span>
          <span className="stat-value text-primary">
            ${totalRevenue.toLocaleString()}
          </span>
        </div>
      </div>

      {/* Filter + View toggle bar */}
      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search clients..."
            className="pl-9"
          />
        </div>
        <div className="flex items-center gap-1 ml-auto bg-muted/60 rounded-lg p-1">
          <button
            onClick={() => setView("kanban")}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors",
              view === "kanban"
                ? "bg-background shadow-sm text-foreground"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <LayoutGrid className="h-3.5 w-3.5" />
            Kanban
          </button>
          <button
            onClick={() => setView("list")}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors",
              view === "list"
                ? "bg-background shadow-sm text-foreground"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <List className="h-3.5 w-3.5" />
            List
          </button>
        </div>
      </div>

      {/* Kanban view */}
      {view === "kanban" && (
        <div className="flex gap-4 overflow-x-auto pb-4">
          {COLUMNS.map((col) => {
            const colClients = filtered.filter((c) => c.status === col.id);
            return (
              <div
                key={col.id}
                className="flex-1 min-w-[220px] sm:min-w-[220px] flex flex-col"
                onDragOver={handleDragOver}
                onDrop={(e) => handleDropOnColumn(e, col.id)}
              >
                {/* Column header */}
                <div
                  className={cn(
                    "flex items-center justify-between px-3 py-2.5 rounded-t-lg border border-b-0 border-border/50",
                    col.headerBg
                  )}
                >
                  <div className="flex items-center gap-2">
                    <span className={cn("h-2 w-2 rounded-full", col.dot)} />
                    <span className={cn("font-semibold text-sm", col.color)}>
                      {col.label}
                    </span>
                    <span
                      className={cn(
                        "inline-flex items-center justify-center h-5 min-w-5 px-1.5 rounded-full text-[10px] font-bold bg-white/70 border border-border/40",
                        col.color
                      )}
                    >
                      {colClients.length}
                    </span>
                  </div>
                  <button
                    onClick={() => {
                      setAddStatus(col.id);
                      setAddOpen(true);
                    }}
                    className="h-6 w-6 rounded flex items-center justify-center hover:bg-white/60 transition-colors text-muted-foreground hover:text-foreground"
                  >
                    <Plus className="h-3.5 w-3.5" />
                  </button>
                </div>

                {/* Column body */}
                <div className="flex-1 min-h-[200px] bg-muted/20 border border-border/50 rounded-b-lg p-2 flex flex-col gap-2">
                  <AnimatePresence>
                    {colClients.map((client) => (
                      <ClientCard
                        key={client.id}
                        client={client}
                        onClick={() => setSelectedClient(client)}
                        onDragStart={(e) => handleDragStart(e, client.id)}
                        onDragOver={handleDragOver}
                        onDrop={(e) => handleDropOnColumn(e, col.id)}
                      />
                    ))}
                  </AnimatePresence>
                  {colClients.length === 0 && (
                    <div className="flex-1 flex items-center justify-center">
                      <p className="text-xs text-muted-foreground/40 text-center py-6">
                        No clients
                      </p>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* List view */}
      {view === "list" && (
        <div className="glass-card overflow-hidden">
          {/* Table header */}
          <div className="flex items-center gap-4 px-4 py-2.5 bg-muted/40 border-b border-border/50">
            <div className="w-9 flex-shrink-0" />
            <span className="flex-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Client
            </span>
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground hidden md:block w-[120px]">
              Company
            </span>
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground w-24 text-center">
              Status
            </span>
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground w-16 text-right">
              Value
            </span>
            <div className="w-4 flex-shrink-0" />
          </div>
          <AnimatePresence>
            {filtered.length === 0 ? (
              <div className="py-12 text-center text-sm text-muted-foreground">
                No clients found
              </div>
            ) : (
              filtered.map((client) => (
                <ClientListRow
                  key={client.id}
                  client={client}
                  onClick={() => setSelectedClient(client)}
                />
              ))
            )}
          </AnimatePresence>
        </div>
      )}

      {/* Detail panel */}
      <AnimatePresence>
        {displayClient && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/20 z-40"
              onClick={() => setSelectedClient(null)}
            />
            <ClientDetailPanel
              key={displayClient.id}
              client={displayClient}
              onClose={() => setSelectedClient(null)}
              onDelete={handleDeleteSelected}
            />
          </>
        )}
      </AnimatePresence>

      {/* Add client dialog */}
      <AddClientDialog
        open={addOpen}
        onClose={() => setAddOpen(false)}
        defaultStatus={addStatus}
      />
    </div>
  );
}
