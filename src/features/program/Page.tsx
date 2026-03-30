import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  BookMarked,
  Plus,
  Trash2,
  Video,
  FileText,
  ClipboardList,
  HelpCircle,
  ChevronUp,
  ChevronDown,
  Pencil,
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
import { useProgramStore } from "@/stores/program";
import type { ProgramLesson } from "@/types";
import { cn } from "@/lib/utils";

type LessonType = "video" | "text" | "worksheet" | "quiz";

const TYPE_CONFIG: Record<
  LessonType,
  { icon: React.ReactNode; color: string; label: string }
> = {
  video: {
    icon: <Video className="h-3.5 w-3.5" />,
    color: "text-blue-600 bg-blue-50",
    label: "Video",
  },
  text: {
    icon: <FileText className="h-3.5 w-3.5" />,
    color: "text-green-600 bg-green-50",
    label: "Text",
  },
  worksheet: {
    icon: <ClipboardList className="h-3.5 w-3.5" />,
    color: "text-orange-600 bg-orange-50",
    label: "Worksheet",
  },
  quiz: {
    icon: <HelpCircle className="h-3.5 w-3.5" />,
    color: "text-purple-600 bg-purple-50",
    label: "Quiz",
  },
};

interface LessonEditState {
  phaseId: string;
  lesson?: ProgramLesson;
}

export default function ProgramPage() {
  const {
    phases,
    addPhase,
    deletePhase,
    addLesson,
    updateLesson,
    deleteLesson,
    reorderPhases,
  } = useProgramStore();

  const [addPhaseOpen, setAddPhaseOpen] = useState(false);
  const [lessonEdit, setLessonEdit] = useState<LessonEditState | null>(null);

  // Phase form
  const [newPhaseTitle, setNewPhaseTitle] = useState("");
  const [newPhaseDesc, setNewPhaseDesc] = useState("");

  // Lesson form
  const [lessonTitle, setLessonTitle] = useState("");
  const [lessonContent, setLessonContent] = useState("");
  const [lessonType, setLessonType] = useState<LessonType>("video");

  const sortedPhases = [...phases].sort((a, b) => a.order - b.order);

  function handleAddPhase() {
    if (!newPhaseTitle.trim()) return;
    addPhase({
      title: newPhaseTitle.trim(),
      description: newPhaseDesc.trim(),
      order: phases.length,
    });
    setNewPhaseTitle("");
    setNewPhaseDesc("");
    setAddPhaseOpen(false);
  }

  function openAddLesson(phaseId: string) {
    setLessonTitle("");
    setLessonContent("");
    setLessonType("video");
    setLessonEdit({ phaseId });
  }

  function openEditLesson(phaseId: string, lesson: ProgramLesson) {
    setLessonTitle(lesson.title);
    setLessonContent(lesson.content);
    setLessonType(lesson.type as LessonType);
    setLessonEdit({ phaseId, lesson });
  }

  function handleSaveLesson() {
    if (!lessonEdit || !lessonTitle.trim()) return;
    const { phaseId, lesson } = lessonEdit;
    if (lesson) {
      updateLesson(phaseId, lesson.id, {
        title: lessonTitle.trim(),
        content: lessonContent.trim(),
        type: lessonType,
      });
    } else {
      const phase = phases.find((p) => p.id === phaseId);
      addLesson(phaseId, {
        phaseId,
        title: lessonTitle.trim(),
        content: lessonContent.trim(),
        order: phase?.lessons.length ?? 0,
        type: lessonType,
      });
    }
    setLessonEdit(null);
  }

  function movePhaseUp(index: number) {
    if (index === 0) return;
    const reordered = [...sortedPhases];
    [reordered[index - 1], reordered[index]] = [
      reordered[index],
      reordered[index - 1],
    ];
    reorderPhases(reordered.map((p, i) => ({ ...p, order: i })));
  }

  function movePhaseDown(index: number) {
    if (index >= sortedPhases.length - 1) return;
    const reordered = [...sortedPhases];
    [reordered[index], reordered[index + 1]] = [
      reordered[index + 1],
      reordered[index],
    ];
    reorderPhases(reordered.map((p, i) => ({ ...p, order: i })));
  }

  return (
    <div className="page-container">
      {/* Header */}
      <div className="page-header">
        <div className="flex items-center gap-2 mb-1">
          <div className="p-1.5 rounded-lg bg-primary/10">
            <BookMarked className="h-5 w-5 text-primary" />
          </div>
          <h1 className="page-title">Program Builder</h1>
        </div>
        <p className="page-description">
          Design your coaching program or course with a structured phase-by-phase curriculum.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6">
        <div className="stat-card">
          <span className="stat-label">Phases</span>
          <span className="stat-value">{phases.length}</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Total Lessons</span>
          <span className="stat-value">
            {phases.reduce((acc, p) => acc + p.lessons.length, 0)}
          </span>
        </div>
        <div className="stat-card hidden sm:flex">
          <span className="stat-label">Videos</span>
          <span className="stat-value">
            {phases.reduce(
              (acc, p) => acc + p.lessons.filter((l) => l.type === "video").length,
              0
            )}
          </span>
        </div>
      </div>

      {/* Phases — horizontal scrolling kanban */}
      <div className="overflow-x-auto pb-4">
        <div className="flex gap-4" style={{ minWidth: "max-content" }}>
          <AnimatePresence initial={false}>
            {sortedPhases.map((phase, index) => {
              const sortedLessons = [...phase.lessons].sort(
                (a, b) => a.order - b.order
              );
              return (
                <motion.div
                  key={phase.id}
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.96 }}
                  transition={{ delay: index * 0.05 }}
                  className="glass-card flex flex-col"
                  style={{ width: 300, minWidth: 300 }}
                >
                  {/* Phase header */}
                  <div className="p-4 border-b border-border/50">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 mb-0.5">
                          <span className="text-xs font-bold text-primary/60 uppercase tracking-wider">
                            Phase {index + 1}
                          </span>
                        </div>
                        <h3 className="font-semibold text-sm leading-snug">
                          {phase.title}
                        </h3>
                        {phase.description && (
                          <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                            {phase.description}
                          </p>
                        )}
                      </div>
                      <div className="flex flex-col gap-0.5">
                        <button
                          onClick={() => movePhaseUp(index)}
                          disabled={index === 0}
                          className="p-1 rounded hover:bg-muted disabled:opacity-20 disabled:cursor-not-allowed transition-colors"
                          aria-label="Move phase up"
                        >
                          <ChevronUp className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => movePhaseDown(index)}
                          disabled={index === sortedPhases.length - 1}
                          className="p-1 rounded hover:bg-muted disabled:opacity-20 disabled:cursor-not-allowed transition-colors"
                          aria-label="Move phase down"
                        >
                          <ChevronDown className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">
                        {phase.lessons.length} lesson
                        {phase.lessons.length !== 1 ? "s" : ""}
                      </span>
                      <button
                        onClick={() => deletePhase(phase.id)}
                        className="p-1 rounded hover:bg-destructive/10 hover:text-destructive text-muted-foreground/40 transition-all"
                        aria-label="Delete phase"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                  </div>

                  {/* Lesson cards */}
                  <div className="flex-1 p-3 space-y-2 overflow-y-auto max-h-[400px]">
                    {sortedLessons.length === 0 ? (
                      <div className="py-6 text-center text-xs text-muted-foreground">
                        No lessons yet
                      </div>
                    ) : (
                      sortedLessons.map((lesson, lessonIndex) => {
                        const typeConfig =
                          TYPE_CONFIG[lesson.type as LessonType] ??
                          TYPE_CONFIG.text;
                        return (
                          <motion.div
                            key={lesson.id}
                            initial={{ opacity: 0, y: 4 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: lessonIndex * 0.03 }}
                            className="bg-background/70 border border-border/40 rounded-lg p-3 group hover:border-border transition-colors"
                          >
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex items-start gap-2 flex-1 min-w-0">
                                <span className="text-xs text-muted-foreground font-mono mt-0.5 w-5 flex-shrink-0">
                                  {lessonIndex + 1}.
                                </span>
                                <div className="min-w-0">
                                  <p className="text-sm font-medium leading-snug">
                                    {lesson.title}
                                  </p>
                                  {lesson.content && (
                                    <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                                      {lesson.content}
                                    </p>
                                  )}
                                </div>
                              </div>
                              <div className="flex items-center gap-1 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button
                                  onClick={() =>
                                    openEditLesson(phase.id, lesson)
                                  }
                                  className="p-1 rounded hover:bg-muted text-muted-foreground transition-colors"
                                  aria-label="Edit lesson"
                                >
                                  <Pencil className="h-3 w-3" />
                                </button>
                                <button
                                  onClick={() =>
                                    deleteLesson(phase.id, lesson.id)
                                  }
                                  className="p-1 rounded hover:bg-destructive/10 hover:text-destructive text-muted-foreground transition-colors"
                                  aria-label="Delete lesson"
                                >
                                  <Trash2 className="h-3 w-3" />
                                </button>
                              </div>
                            </div>
                            <div className="mt-2">
                              <span
                                className={cn(
                                  "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium",
                                  typeConfig.color
                                )}
                              >
                                {typeConfig.icon}
                                {typeConfig.label}
                              </span>
                            </div>
                          </motion.div>
                        );
                      })
                    )}
                  </div>

                  {/* Add lesson */}
                  <div className="p-3 border-t border-border/50">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => openAddLesson(phase.id)}
                      className="w-full text-xs h-8 border border-dashed border-border/60 hover:border-primary/40"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      Add Lesson
                    </Button>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>

          {/* Add phase column */}
          <div
            style={{ width: 220, minWidth: 220 }}
            className="flex-shrink-0"
          >
            <Button
              variant="outline"
              onClick={() => setAddPhaseOpen(true)}
              className="h-full w-full border-dashed min-h-[200px] flex-col gap-2 text-muted-foreground hover:text-foreground"
            >
              <Plus className="h-6 w-6" />
              <span className="text-sm">Add Phase</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Add phase dialog */}
      <Dialog open={addPhaseOpen} onOpenChange={setAddPhaseOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add New Phase</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label>Phase Title</Label>
              <Input
                placeholder="e.g. Phase 4: Scaling & Systemizing"
                value={newPhaseTitle}
                onChange={(e) => setNewPhaseTitle(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAddPhase()}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Description</Label>
              <Textarea
                placeholder="What's the goal of this phase?"
                value={newPhaseDesc}
                onChange={(e) => setNewPhaseDesc(e.target.value)}
                rows={3}
              />
            </div>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setAddPhaseOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddPhase} disabled={!newPhaseTitle.trim()}>
                Add Phase
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Lesson edit/add dialog */}
      <Dialog
        open={!!lessonEdit}
        onOpenChange={(open) => !open && setLessonEdit(null)}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {lessonEdit?.lesson ? "Edit Lesson" : "Add New Lesson"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label>Title</Label>
              <Input
                placeholder="e.g. Advanced Email Marketing"
                value={lessonTitle}
                onChange={(e) => setLessonTitle(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Type</Label>
              <Select
                value={lessonType}
                onValueChange={(v) => setLessonType(v as LessonType)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="video">Video</SelectItem>
                  <SelectItem value="text">Text</SelectItem>
                  <SelectItem value="worksheet">Worksheet</SelectItem>
                  <SelectItem value="quiz">Quiz</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Content</Label>
              <Textarea
                placeholder="Lesson content or description..."
                value={lessonContent}
                onChange={(e) => setLessonContent(e.target.value)}
                rows={5}
              />
            </div>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setLessonEdit(null)}>
                Cancel
              </Button>
              <Button onClick={handleSaveLesson} disabled={!lessonTitle.trim()}>
                {lessonEdit?.lesson ? "Save Changes" : "Add Lesson"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
