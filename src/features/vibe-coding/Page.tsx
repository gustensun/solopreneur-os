import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Code2,
  Plus,
  Trash2,
  Pencil,
  ArrowRight,
  ArrowLeft,
  Rocket,
  Lightbulb,
  Map,
  Hammer,
  FlaskConical,
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
import { useVibeCodingStore } from "@/stores/vibe-coding";
import type { VibeCodingProject } from "@/types";
import { cn } from "@/lib/utils";

type Phase = VibeCodingProject["phase"];

const PHASES: {
  id: Phase;
  label: string;
  icon: React.ReactNode;
  color: string;
  description: string;
}[] = [
  {
    id: "idea",
    label: "Idea",
    icon: <Lightbulb className="h-4 w-4" />,
    color: "text-yellow-600 bg-yellow-50 border-yellow-200",
    description: "Raw ideas waiting to be explored",
  },
  {
    id: "planning",
    label: "Planning",
    icon: <Map className="h-4 w-4" />,
    color: "text-blue-600 bg-blue-50 border-blue-200",
    description: "Designing the architecture",
  },
  {
    id: "building",
    label: "Building",
    icon: <Hammer className="h-4 w-4" />,
    color: "text-orange-600 bg-orange-50 border-orange-200",
    description: "Actively in development",
  },
  {
    id: "testing",
    label: "Testing",
    icon: <FlaskConical className="h-4 w-4" />,
    color: "text-purple-600 bg-purple-50 border-purple-200",
    description: "QA and user validation",
  },
  {
    id: "launched",
    label: "Launched",
    icon: <Rocket className="h-4 w-4" />,
    color: "text-green-600 bg-green-50 border-green-200",
    description: "Live and generating revenue",
  },
];

const PHASE_ORDER: Phase[] = ["idea", "planning", "building", "testing", "launched"];

interface ProjectForm {
  name: string;
  description: string;
  techStack: string;
  notes: string;
  phase: Phase;
}

const emptyForm = (): ProjectForm => ({
  name: "",
  description: "",
  techStack: "",
  notes: "",
  phase: "idea",
});

export default function VibeCodingPage() {
  const { projects, addProject, updateProject, deleteProject, moveProject } =
    useVibeCodingStore();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<VibeCodingProject | null>(null);
  const [form, setForm] = useState<ProjectForm>(emptyForm());

  function openAdd() {
    setEditingProject(null);
    setForm(emptyForm());
    setDialogOpen(true);
  }

  function openEdit(project: VibeCodingProject) {
    setEditingProject(project);
    setForm({
      name: project.name,
      description: project.description,
      techStack: project.techStack,
      notes: project.notes,
      phase: project.phase,
    });
    setDialogOpen(true);
  }

  function handleSave() {
    if (!form.name.trim()) return;
    if (editingProject) {
      updateProject(editingProject.id, {
        name: form.name.trim(),
        description: form.description.trim(),
        techStack: form.techStack.trim(),
        notes: form.notes.trim(),
        phase: form.phase,
      });
    } else {
      addProject({
        name: form.name.trim(),
        description: form.description.trim(),
        techStack: form.techStack.trim(),
        notes: form.notes.trim(),
        phase: form.phase,
      });
    }
    setDialogOpen(false);
  }

  function handleMoveLeft(project: VibeCodingProject) {
    const idx = PHASE_ORDER.indexOf(project.phase);
    if (idx > 0) moveProject(project.id, PHASE_ORDER[idx - 1]);
  }

  function handleMoveRight(project: VibeCodingProject) {
    const idx = PHASE_ORDER.indexOf(project.phase);
    if (idx < PHASE_ORDER.length - 1) moveProject(project.id, PHASE_ORDER[idx + 1]);
  }

  const totalProjects = projects.length;
  const launchedCount = projects.filter((p) => p.phase === "launched").length;
  const buildingCount = projects.filter((p) => p.phase === "building").length;

  return (
    <div className="page-container">
      {/* Header */}
      <div className="page-header">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="p-1.5 rounded-lg bg-primary/10">
                <Code2 className="h-5 w-5 text-primary" />
              </div>
              <h1 className="page-title">Vibe Coding</h1>
            </div>
            <p className="page-description">
              Build your software projects with AI. Track each idea from spark to launch.
            </p>
          </div>
          <Button onClick={openAdd} className="flex-shrink-0">
            <Plus className="h-4 w-4" />
            New Project
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="stat-card">
          <span className="stat-label">Total Projects</span>
          <span className="stat-value">{totalProjects}</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Building</span>
          <span className="stat-value text-orange-600">{buildingCount}</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Launched</span>
          <span className="stat-value text-green-600">{launchedCount}</span>
        </div>
      </div>

      {/* Pipeline */}
      {projects.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="glass-card p-16 flex flex-col items-center justify-center text-center"
        >
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
            <Code2 className="h-8 w-8 text-primary/60" />
          </div>
          <p className="font-semibold text-lg">No projects yet</p>
          <p className="text-sm text-muted-foreground mt-1 mb-4 max-w-xs">
            Start building your first AI-powered project. The best time to start was yesterday — the second best time is now.
          </p>
          <Button onClick={openAdd}>
            <Plus className="h-4 w-4" />
            Start Building
          </Button>
        </motion.div>
      ) : (
        <div className="overflow-x-auto pb-4">
          <div className="flex gap-4" style={{ minWidth: "max-content" }}>
            {PHASES.map((phase, phaseIndex) => {
              const phaseProjects = projects.filter((p) => p.phase === phase.id);
              return (
                <motion.div
                  key={phase.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: phaseIndex * 0.06 }}
                  className="glass-card flex flex-col"
                  style={{ width: 260, minWidth: 260 }}
                >
                  {/* Phase header */}
                  <div
                    className={cn(
                      "flex items-center gap-2 p-3 border-b border-border/50 rounded-t-lg",
                      phase.color
                    )}
                  >
                    {phase.icon}
                    <div>
                      <p className="font-semibold text-sm">{phase.label}</p>
                      <p className="text-xs opacity-70">{phase.description}</p>
                    </div>
                    <span className="ml-auto font-bold text-sm opacity-60">
                      {phaseProjects.length}
                    </span>
                  </div>

                  {/* Project cards */}
                  <div className="flex-1 p-3 space-y-2 min-h-[200px]">
                    <AnimatePresence>
                      {phaseProjects.map((project) => {
                        const phaseIdx = PHASE_ORDER.indexOf(project.phase);
                        return (
                          <motion.div
                            key={project.id}
                            initial={{ opacity: 0, scale: 0.96 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.96 }}
                            className="bg-background/80 border border-border/40 rounded-lg p-3 group hover:border-border/80 transition-colors"
                          >
                            <div className="flex items-start justify-between gap-2 mb-2">
                              <p className="font-semibold text-sm leading-snug flex-1">
                                {project.name}
                              </p>
                              <div className="flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button
                                  onClick={() => openEdit(project)}
                                  className="p-1 rounded hover:bg-muted text-muted-foreground transition-colors"
                                  aria-label="Edit project"
                                >
                                  <Pencil className="h-3 w-3" />
                                </button>
                                <button
                                  onClick={() => deleteProject(project.id)}
                                  className="p-1 rounded hover:bg-destructive/10 hover:text-destructive text-muted-foreground transition-colors"
                                  aria-label="Delete project"
                                >
                                  <Trash2 className="h-3 w-3" />
                                </button>
                              </div>
                            </div>

                            {project.description && (
                              <p className="text-xs text-muted-foreground mb-2 line-clamp-2">
                                {project.description}
                              </p>
                            )}

                            {project.techStack && (
                              <div className="flex flex-wrap gap-1 mb-2">
                                {project.techStack
                                  .split(",")
                                  .map((t) => t.trim())
                                  .filter(Boolean)
                                  .slice(0, 3)
                                  .map((tech) => (
                                    <span
                                      key={tech}
                                      className="text-xs px-1.5 py-0.5 bg-muted rounded font-mono"
                                    >
                                      {tech}
                                    </span>
                                  ))}
                              </div>
                            )}

                            {project.notes && (
                              <p className="text-xs text-muted-foreground/70 italic line-clamp-2 mb-2">
                                {project.notes}
                              </p>
                            )}

                            {/* Move buttons */}
                            <div className="flex gap-1 mt-2">
                              <button
                                onClick={() => handleMoveLeft(project)}
                                disabled={phaseIdx === 0}
                                className="flex-1 flex items-center justify-center gap-1 py-1 text-xs rounded border border-border/40 hover:bg-muted disabled:opacity-20 disabled:cursor-not-allowed transition-colors"
                              >
                                <ArrowLeft className="h-3 w-3" />
                              </button>
                              <button
                                onClick={() => handleMoveRight(project)}
                                disabled={phaseIdx === PHASE_ORDER.length - 1}
                                className="flex-1 flex items-center justify-center gap-1 py-1 text-xs rounded border border-border/40 hover:bg-muted disabled:opacity-20 disabled:cursor-not-allowed transition-colors"
                              >
                                <ArrowRight className="h-3 w-3" />
                              </button>
                            </div>
                          </motion.div>
                        );
                      })}
                    </AnimatePresence>

                    {phaseProjects.length === 0 && (
                      <div className="py-8 text-center text-xs text-muted-foreground/50">
                        No projects here
                      </div>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      )}

      {/* Project dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingProject ? "Edit Project" : "New Vibe Coding Project"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label>Project Name</Label>
              <Input
                placeholder="e.g. AI Email Curator"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Description</Label>
              <Textarea
                placeholder="What does this project do?"
                value={form.description}
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
                rows={2}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Tech Stack</Label>
              <Input
                placeholder="e.g. Next.js, Supabase, OpenAI API"
                value={form.techStack}
                onChange={(e) =>
                  setForm({ ...form, techStack: e.target.value })
                }
              />
              <p className="text-xs text-muted-foreground">
                Comma-separated list of technologies
              </p>
            </div>
            <div className="space-y-1.5">
              <Label>Phase</Label>
              <div className="grid grid-cols-5 gap-1">
                {PHASES.map((phase) => (
                  <button
                    key={phase.id}
                    onClick={() => setForm({ ...form, phase: phase.id })}
                    className={cn(
                      "flex flex-col items-center gap-1 p-2 rounded-lg border text-xs font-medium transition-all",
                      form.phase === phase.id
                        ? cn(phase.color, "border-current")
                        : "border-border/40 hover:bg-muted text-muted-foreground"
                    )}
                  >
                    {phase.icon}
                    <span className="text-[10px]">{phase.label}</span>
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Notes</Label>
              <Textarea
                placeholder="Current status, blockers, next steps..."
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                rows={3}
              />
            </div>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={!form.name.trim()}>
                {editingProject ? "Save Changes" : "Create Project"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
