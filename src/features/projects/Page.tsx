import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  closestCorners,
} from "@dnd-kit/core";
import type {
  DragEndEvent,
  DragOverEvent,
  DragStartEvent,
  UniqueIdentifier,
} from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  Plus,
  Search,
  Trash2,
  Tag,
  Calendar,
  FolderKanban,
  X,
  AlertCircle,
  ArrowUp,
  Minus,
  ArrowDown,
  Flame,
  GripVertical,
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useProjectsStore } from "@/stores/projects";
import type { Project, ProjectStatus, ProjectPriority } from "@/types";
import { cn } from "@/lib/utils";

// ─── Column config ─────────────────────────────────────────────────────────────

const COLUMNS: {
  id: ProjectStatus;
  label: string;
  color: string;
  headerBg: string;
  accent: string;
}[] = [
  {
    id: "backlog",
    label: "Backlog",
    color: "text-slate-600",
    headerBg: "bg-slate-50",
    accent: "bg-slate-400",
  },
  {
    id: "todo",
    label: "To Do",
    color: "text-blue-600",
    headerBg: "bg-blue-50",
    accent: "bg-blue-500",
  },
  {
    id: "in-progress",
    label: "In Progress",
    color: "text-amber-600",
    headerBg: "bg-amber-50",
    accent: "bg-amber-500",
  },
  {
    id: "review",
    label: "Review",
    color: "text-purple-600",
    headerBg: "bg-purple-50",
    accent: "bg-purple-500",
  },
  {
    id: "done",
    label: "Done",
    color: "text-emerald-600",
    headerBg: "bg-emerald-50",
    accent: "bg-emerald-500",
  },
];

// ─── Priority config ───────────────────────────────────────────────────────────

const PRIORITY_CONFIG: Record<
  ProjectPriority,
  { label: string; classes: string; icon: React.ReactNode }
> = {
  urgent: {
    label: "Urgent",
    classes: "bg-red-100 text-red-700 border-red-200",
    icon: <Flame className="h-3 w-3" />,
  },
  high: {
    label: "High",
    classes: "bg-orange-100 text-orange-700 border-orange-200",
    icon: <ArrowUp className="h-3 w-3" />,
  },
  medium: {
    label: "Medium",
    classes: "bg-yellow-100 text-yellow-700 border-yellow-200",
    icon: <Minus className="h-3 w-3" />,
  },
  low: {
    label: "Low",
    classes: "bg-slate-100 text-slate-600 border-slate-200",
    icon: <ArrowDown className="h-3 w-3" />,
  },
};

// ─── Helpers ───────────────────────────────────────────────────────────────────

function formatDueDate(iso?: string) {
  if (!iso) return null;
  const d = new Date(iso);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function isDueSoon(iso?: string) {
  if (!iso) return false;
  const due = new Date(iso);
  const diff = (due.getTime() - Date.now()) / (1000 * 60 * 60 * 24);
  return diff <= 3 && diff >= 0;
}

function isOverdue(iso?: string) {
  if (!iso) return false;
  return new Date(iso) < new Date();
}

function emptyForm(): Omit<Project, "id" | "createdAt" | "updatedAt"> {
  return {
    title: "",
    description: "",
    status: "todo",
    priority: "medium",
    dueDate: "",
    tags: [],
  };
}

// ─── Project Card (Sortable) ───────────────────────────────────────────────────

function SortableProjectCard({
  project,
  onEdit,
  isDragging,
}: {
  project: Project;
  onEdit: (p: Project) => void;
  isDragging?: boolean;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging: isSortableDragging,
  } = useSortable({ id: project.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isSortableDragging ? 0.4 : 1,
  };

  return (
    <div ref={setNodeRef} style={style}>
      <ProjectCardContent
        project={project}
        onEdit={onEdit}
        dragHandleProps={{ ...attributes, ...listeners }}
        isDragging={isDragging}
      />
    </div>
  );
}

function ProjectCardContent({
  project,
  onEdit,
  dragHandleProps,
  isDragging,
}: {
  project: Project;
  onEdit: (p: Project) => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  dragHandleProps?: Record<string, any>;
  isDragging?: boolean;
}) {
  const cfg = PRIORITY_CONFIG[project.priority];
  const dueDateStr = formatDueDate(project.dueDate);
  const overdue = isOverdue(project.dueDate);
  const dueSoon = isDueSoon(project.dueDate);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className={cn(
        "glass-card p-3.5 cursor-pointer hover:border-primary/30 transition-all duration-200 group relative",
        isDragging
          ? "shadow-2xl shadow-primary/20 border-primary/40 rotate-1 scale-105"
          : "hover:shadow-sm"
      )}
    >
      {/* Drag handle */}
      {dragHandleProps && (
        <div
          {...dragHandleProps}
          className="absolute left-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-40 hover:opacity-70 transition-opacity cursor-grab active:cursor-grabbing touch-none"
          onClick={(e) => e.stopPropagation()}
        >
          <GripVertical className="h-4 w-4 text-muted-foreground" />
        </div>
      )}

      <div
        className={cn("pl-3", dragHandleProps && "pl-5")}
        onClick={() => onEdit(project)}
      >
        {/* Title */}
        <p className="font-medium text-sm leading-snug mb-1.5 group-hover:text-primary transition-colors">
          {project.title}
        </p>

        {/* Description preview */}
        {project.description && (
          <p className="text-xs text-muted-foreground line-clamp-2 mb-2.5">
            {project.description}
          </p>
        )}

        {/* Tags */}
        {project.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-2.5">
            {project.tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-medium bg-primary/8 text-primary/70"
              >
                <Tag className="h-2.5 w-2.5" />
                {tag}
              </span>
            ))}
            {project.tags.length > 3 && (
              <span className="text-[10px] text-muted-foreground">
                +{project.tags.length - 3}
              </span>
            )}
          </div>
        )}

        {/* Footer: priority + due date */}
        <div className="flex items-center justify-between gap-2">
          <span
            className={cn(
              "inline-flex items-center gap-1 px-1.5 py-0.5 rounded border text-[10px] font-medium",
              cfg.classes
            )}
          >
            {cfg.icon}
            {cfg.label}
          </span>

          {dueDateStr && (
            <span
              className={cn(
                "inline-flex items-center gap-1 text-[10px] font-medium",
                overdue
                  ? "text-red-600"
                  : dueSoon
                  ? "text-amber-600"
                  : "text-muted-foreground"
              )}
            >
              {overdue && <AlertCircle className="h-2.5 w-2.5" />}
              <Calendar className="h-2.5 w-2.5" />
              {dueDateStr}
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
}

// ─── Droppable Column ──────────────────────────────────────────────────────────

function KanbanColumn({
  col,
  projects,
  onEdit,
  onAddNew,
  activeId,
}: {
  col: (typeof COLUMNS)[number];
  projects: Project[];
  onEdit: (p: Project) => void;
  onAddNew: (status: ProjectStatus) => void;
  activeId: UniqueIdentifier | null;
}) {
  const ids = projects.map((p) => p.id);

  return (
    <div className="flex-1 min-w-[220px] max-w-[300px] flex flex-col">
      {/* Colored top accent bar */}
      <div className={cn("h-1 rounded-t-lg", col.accent)} />

      {/* Column header */}
      <div
        className={cn(
          "flex items-center justify-between px-3 py-2.5 border border-t-0 border-b-0 border-border/50",
          col.headerBg
        )}
      >
        <div className="flex items-center gap-2">
          <span className={cn("font-semibold text-sm", col.color)}>
            {col.label}
          </span>
          <span
            className={cn(
              "inline-flex items-center justify-center h-5 min-w-5 px-1.5 rounded-full text-[10px] font-bold bg-white/70 border border-border/40",
              col.color
            )}
          >
            {projects.length}
          </span>
        </div>

        <button
          onClick={() => onAddNew(col.id)}
          className="h-6 w-6 rounded flex items-center justify-center hover:bg-white/60 transition-colors text-muted-foreground hover:text-foreground"
          title={`Add to ${col.label}`}
        >
          <Plus className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* Droppable body */}
      <SortableContext items={ids} strategy={verticalListSortingStrategy}>
        <div
          className={cn(
            "flex-1 min-h-[200px] border border-t-0 border-border/50 rounded-b-lg p-2 flex flex-col gap-2 transition-colors",
            activeId ? "bg-muted/50" : "bg-muted/35"
          )}
        >
          <AnimatePresence>
            {projects.map((project) => (
              <SortableProjectCard
                key={project.id}
                project={project}
                onEdit={onEdit}
              />
            ))}
          </AnimatePresence>

          {projects.length === 0 && (
            <div className="flex-1 flex items-center justify-center">
              <p className="text-xs text-muted-foreground/40 text-center py-6">
                Drop cards here
              </p>
            </div>
          )}
        </div>
      </SortableContext>
    </div>
  );
}

// ─── Project Dialog ────────────────────────────────────────────────────────────

function ProjectDialog({
  open,
  onClose,
  project,
  onSave,
  onDelete,
}: {
  open: boolean;
  onClose: () => void;
  project: Partial<Project> | null;
  onSave: (data: Omit<Project, "id" | "createdAt" | "updatedAt">) => void;
  onDelete?: () => void;
}) {
  const isNew = !project?.id;
  const [form, setForm] = useState<Omit<Project, "id" | "createdAt" | "updatedAt">>(() =>
    project
      ? {
          title: project.title ?? "",
          description: project.description ?? "",
          status: project.status ?? "todo",
          priority: project.priority ?? "medium",
          dueDate: project.dueDate ?? "",
          tags: project.tags ?? [],
        }
      : emptyForm()
  );
  const [tagInput, setTagInput] = useState("");
  const [confirmDelete, setConfirmDelete] = useState(false);

  function handleOpen() {
    setForm(
      project
        ? {
            title: project.title ?? "",
            description: project.description ?? "",
            status: project.status ?? "todo",
            priority: project.priority ?? "medium",
            dueDate: project.dueDate ?? "",
            tags: project.tags ?? [],
          }
        : emptyForm()
    );
    setTagInput("");
    setConfirmDelete(false);
  }

  function addTag() {
    const t = tagInput.trim().toLowerCase();
    if (t && !form.tags.includes(t)) {
      setForm((f) => ({ ...f, tags: [...f.tags, t] }));
    }
    setTagInput("");
  }

  function removeTag(tag: string) {
    setForm((f) => ({ ...f, tags: f.tags.filter((t) => t !== tag) }));
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        if (v) handleOpen();
        else onClose();
      }}
    >
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{isNew ? "New Project" : "Edit Project"}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Title */}
          <div className="space-y-1.5">
            <Label>Title</Label>
            <Input
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              placeholder="Project title..."
              autoFocus
            />
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <Label>Description</Label>
            <Textarea
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              placeholder="What is this project about?"
              rows={3}
              className="resize-none"
            />
          </div>

          {/* Status + Priority */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Status</Label>
              <Select
                value={form.status}
                onValueChange={(v) =>
                  setForm((f) => ({ ...f, status: v as ProjectStatus }))
                }
              >
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
              <Label>Priority</Label>
              <Select
                value={form.priority}
                onValueChange={(v) =>
                  setForm((f) => ({ ...f, priority: v as ProjectPriority }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {(Object.keys(PRIORITY_CONFIG) as ProjectPriority[]).map((p) => (
                    <SelectItem key={p} value={p}>
                      {PRIORITY_CONFIG[p].label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Due Date */}
          <div className="space-y-1.5">
            <Label>Due Date</Label>
            <Input
              type="date"
              value={form.dueDate ?? ""}
              onChange={(e) => setForm((f) => ({ ...f, dueDate: e.target.value }))}
            />
          </div>

          {/* Tags */}
          <div className="space-y-1.5">
            <Label>Tags</Label>
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
                className="flex-1"
              />
              <Button variant="outline" size="sm" onClick={addTag} type="button">
                Add
              </Button>
            </div>
            {form.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-1.5">
                {form.tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-primary/10 text-primary"
                  >
                    {tag}
                    <button
                      onClick={() => removeTag(tag)}
                      className="hover:text-destructive transition-colors"
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
                  <span className="text-xs text-destructive">Are you sure?</span>
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
            onClick={() => {
              if (form.title.trim()) {
                onSave(form);
              }
            }}
            disabled={!form.title.trim()}
          >
            {isNew ? "Create Project" : "Save Changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────────

export default function ProjectsPage() {
  const { projects, addProject, updateProject, deleteProject, moveProject } =
    useProjectsStore();

  const [search, setSearch] = useState("");
  const [priorityFilter, setPriorityFilter] = useState<ProjectPriority | "all">("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [newProjectStatus, setNewProjectStatus] = useState<ProjectStatus>("todo");
  const [activeId, setActiveId] = useState<UniqueIdentifier | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    })
  );

  // Filtered projects
  const filtered = projects.filter((p) => {
    const matchSearch =
      !search ||
      p.title.toLowerCase().includes(search.toLowerCase()) ||
      p.description.toLowerCase().includes(search.toLowerCase()) ||
      p.tags.some((t) => t.toLowerCase().includes(search.toLowerCase()));
    const matchPriority = priorityFilter === "all" || p.priority === priorityFilter;
    return matchSearch && matchPriority;
  });

  const activeProject = activeId
    ? projects.find((p) => p.id === activeId) ?? null
    : null;

  // ── DnD handlers ─────────────────────────────────────────────────────────────

  const handleDragStart = useCallback((event: DragStartEvent) => {
    setActiveId(event.active.id);
  }, []);

  const handleDragOver = useCallback(
    (event: DragOverEvent) => {
      const { active, over } = event;
      if (!over) return;

      const activeProject = projects.find((p) => p.id === active.id);
      if (!activeProject) return;

      // Check if "over" is a column id
      const overColumn = COLUMNS.find((c) => c.id === over.id);
      if (overColumn && activeProject.status !== overColumn.id) {
        moveProject(String(active.id), overColumn.id);
        return;
      }

      // Check if "over" is another card — move to that card's column
      const overProject = projects.find((p) => p.id === over.id);
      if (overProject && activeProject.status !== overProject.status) {
        moveProject(String(active.id), overProject.status);
      }
    },
    [projects, moveProject]
  );

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;
      setActiveId(null);

      if (!over) return;

      const activeProject = projects.find((p) => p.id === active.id);
      if (!activeProject) return;

      // Final drop on column
      const overColumn = COLUMNS.find((c) => c.id === over.id);
      if (overColumn) {
        moveProject(String(active.id), overColumn.id);
        return;
      }

      // Final drop on card
      const overProject = projects.find((p) => p.id === over.id);
      if (overProject && activeProject.status !== overProject.status) {
        moveProject(String(active.id), overProject.status);
      }
    },
    [projects, moveProject]
  );

  // ── Dialog handlers ───────────────────────────────────────────────────────────

  function openNew(status: ProjectStatus = "todo") {
    setNewProjectStatus(status);
    setEditingProject(null);
    setDialogOpen(true);
  }

  function openEdit(project: Project) {
    setEditingProject(project);
    setDialogOpen(true);
  }

  function handleSave(data: Omit<Project, "id" | "createdAt" | "updatedAt">) {
    if (editingProject) {
      updateProject(editingProject.id, data);
    } else {
      addProject({ ...data, status: newProjectStatus });
    }
    setDialogOpen(false);
    setEditingProject(null);
  }

  function handleDelete() {
    if (editingProject) {
      deleteProject(editingProject.id);
      setDialogOpen(false);
      setEditingProject(null);
    }
  }

  return (
    <div className="page-container">
      {/* Page header */}
      <div className="page-header">
        <div className="flex items-center gap-2 mb-1">
          <div className="p-1.5 rounded-lg bg-primary/10">
            <FolderKanban className="h-5 w-5 text-primary" />
          </div>
          <h1 className="page-title">Projects</h1>
        </div>
        <p className="page-description">
          Drag cards between columns to update status. Click any card to edit.
        </p>
      </div>

      {/* Filter bar */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search projects..."
            className="pl-9"
          />
        </div>

        <Select
          value={priorityFilter}
          onValueChange={(v) => setPriorityFilter(v as ProjectPriority | "all")}
        >
          <SelectTrigger className="w-40">
            <SelectValue placeholder="All priorities" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All priorities</SelectItem>
            {(Object.keys(PRIORITY_CONFIG) as ProjectPriority[]).map((p) => (
              <SelectItem key={p} value={p}>
                {PRIORITY_CONFIG[p].label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Button onClick={() => openNew()} className="sm:ml-auto shrink-0">
          <Plus className="h-4 w-4" />
          New Project
        </Button>
      </div>

      {/* Kanban board */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        <div className="flex gap-4 overflow-x-auto pb-6">
          {COLUMNS.map((col) => {
            const colProjects = filtered.filter((p) => p.status === col.id);
            return (
              <KanbanColumn
                key={col.id}
                col={col}
                projects={colProjects}
                onEdit={openEdit}
                onAddNew={openNew}
                activeId={activeId}
              />
            );
          })}
        </div>

        {/* Drag overlay — shows a floating ghost card */}
        <DragOverlay dropAnimation={{ duration: 200, easing: "cubic-bezier(0.18, 0.67, 0.6, 1.22)" }}>
          {activeProject ? (
            <div className="rotate-2 scale-105">
              <ProjectCardContent
                project={activeProject}
                onEdit={() => {}}
                isDragging
              />
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>

      {/* Dialog */}
      <ProjectDialog
        open={dialogOpen}
        onClose={() => {
          setDialogOpen(false);
          setEditingProject(null);
        }}
        project={
          editingProject ?? { status: newProjectStatus, priority: "medium", tags: [] }
        }
        onSave={handleSave}
        onDelete={editingProject ? handleDelete : undefined}
      />
    </div>
  );
}
