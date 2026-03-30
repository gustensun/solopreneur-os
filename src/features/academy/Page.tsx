import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  GraduationCap,
  ChevronDown,
  ChevronRight,
  Plus,
  Trash2,
  BookOpen,
  Video,
  FileText,
  ClipboardList,
  HelpCircle,
  CheckCircle2,
  Circle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
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
import { Label } from "@/components/ui/label";
import { useAcademyStore } from "@/stores/academy";
import type { AcademyLesson, AcademyModule } from "@/types";
import { cn } from "@/lib/utils";

type LessonType = "video" | "text" | "worksheet" | "quiz";

const LESSON_TYPE_CONFIG: Record<
  LessonType,
  { label: string; icon: React.ReactNode; color: string }
> = {
  video: {
    label: "Video",
    icon: <Video className="h-3 w-3" />,
    color: "bg-blue-100 text-blue-700",
  },
  text: {
    label: "Text",
    icon: <FileText className="h-3 w-3" />,
    color: "bg-green-100 text-green-700",
  },
  worksheet: {
    label: "Worksheet",
    icon: <ClipboardList className="h-3 w-3" />,
    color: "bg-orange-100 text-orange-700",
  },
  quiz: {
    label: "Quiz",
    icon: <HelpCircle className="h-3 w-3" />,
    color: "bg-purple-100 text-purple-700",
  },
};

function LessonTypeBadge({ type }: { type: LessonType }) {
  const config = LESSON_TYPE_CONFIG[type] ?? LESSON_TYPE_CONFIG.text;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium",
        config.color
      )}
    >
      {config.icon}
      {config.label}
    </span>
  );
}

function getModuleCompletion(module: AcademyModule) {
  if (module.lessons.length === 0) return 0;
  const done = module.lessons.filter((l) => l.completed).length;
  return Math.round((done / module.lessons.length) * 100);
}

export default function AcademyPage() {
  const {
    modules,
    addModule,
    deleteModule,
    addLesson,
    deleteLesson,
    toggleLessonComplete,
    getCompletionRate,
  } = useAcademyStore();

  const [expandedModules, setExpandedModules] = useState<Set<string>>(
    new Set(modules.slice(0, 1).map((m) => m.id))
  );
  const [selectedLesson, setSelectedLesson] = useState<AcademyLesson | null>(null);
  const [addModuleOpen, setAddModuleOpen] = useState(false);
  const [addLessonModuleId, setAddLessonModuleId] = useState<string | null>(null);

  // New module form
  const [newModuleTitle, setNewModuleTitle] = useState("");
  const [newModuleDesc, setNewModuleDesc] = useState("");

  // New lesson form
  const [newLessonTitle, setNewLessonTitle] = useState("");
  const [newLessonContent, setNewLessonContent] = useState("");
  const [newLessonType, setNewLessonType] = useState<LessonType>("video");

  const overallProgress = getCompletionRate();
  const totalLessons = modules.reduce((acc, m) => acc + m.lessons.length, 0);
  const completedLessons = modules.reduce(
    (acc, m) => acc + m.lessons.filter((l) => l.completed).length,
    0
  );

  function toggleModule(id: string) {
    setExpandedModules((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }

  function handleAddModule() {
    if (!newModuleTitle.trim()) return;
    const id = addModule({
      title: newModuleTitle.trim(),
      description: newModuleDesc.trim(),
      order: modules.length,
    });
    setExpandedModules((prev) => new Set([...prev, id]));
    setNewModuleTitle("");
    setNewModuleDesc("");
    setAddModuleOpen(false);
  }

  function handleAddLesson() {
    if (!addLessonModuleId || !newLessonTitle.trim()) return;
    const module = modules.find((m) => m.id === addLessonModuleId);
    if (!module) return;
    addLesson(addLessonModuleId, {
      moduleId: addLessonModuleId,
      title: newLessonTitle.trim(),
      content: newLessonContent.trim(),
      order: module.lessons.length,
      completed: false,
    });
    setNewLessonTitle("");
    setNewLessonContent("");
    setNewLessonType("video");
    setAddLessonModuleId(null);
  }

  const sortedModules = [...modules].sort((a, b) => a.order - b.order);

  return (
    <div className="page-container">
      {/* Header */}
      <div className="page-header">
        <div className="flex items-center gap-2 mb-1">
          <div className="p-1.5 rounded-lg bg-primary/10">
            <GraduationCap className="h-5 w-5 text-primary" />
          </div>
          <h1 className="page-title">Academy</h1>
        </div>
        <p className="page-description">
          Your curated learning curriculum. Track your progress through each module and lesson.
        </p>
      </div>

      {/* Overall Progress */}
      <div className="glass-card p-5 mb-6">
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="text-sm font-semibold">Overall Progress</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              {completedLessons} of {totalLessons} lessons completed
            </p>
          </div>
          <span className="text-2xl font-bold text-primary">{overallProgress}%</span>
        </div>
        <Progress value={overallProgress} className="h-2.5" />
      </div>

      {/* Modules */}
      <div className="space-y-3">
        <AnimatePresence initial={false}>
          {sortedModules.map((module, index) => {
            const isOpen = expandedModules.has(module.id);
            const completion = getModuleCompletion(module);
            const sortedLessons = [...module.lessons].sort((a, b) => a.order - b.order);

            return (
              <motion.div
                key={module.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="glass-card overflow-hidden"
              >
                {/* Module header */}
                <button
                  onClick={() => toggleModule(module.id)}
                  className="w-full flex items-center gap-4 p-4 text-left hover:bg-muted/30 transition-colors"
                >
                  <div className="flex-shrink-0">
                    {isOpen ? (
                      <ChevronDown className="h-5 w-5 text-muted-foreground" />
                    ) : (
                      <ChevronRight className="h-5 w-5 text-muted-foreground" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <h3 className="font-semibold text-sm sm:text-base leading-snug">
                          {module.title}
                        </h3>
                        {module.description && (
                          <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
                            {module.description}
                          </p>
                        )}
                      </div>
                      <div className="flex-shrink-0 flex items-center gap-3">
                        <span className="text-xs text-muted-foreground hidden sm:block">
                          {module.lessons.length} lesson{module.lessons.length !== 1 ? "s" : ""}
                        </span>
                        <div className="flex items-center gap-2">
                          <div className="w-20 hidden sm:block">
                            <Progress value={completion} className="h-1.5" />
                          </div>
                          <span className="text-xs font-medium text-primary w-8 text-right">
                            {completion}%
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </button>

                {/* Lessons list */}
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2, ease: "easeInOut" }}
                    >
                      <div className="border-t border-border/50">
                        {sortedLessons.length === 0 ? (
                          <div className="px-6 py-6 text-center text-sm text-muted-foreground">
                            No lessons yet. Add the first one below.
                          </div>
                        ) : (
                          sortedLessons.map((lesson) => (
                            <div
                              key={lesson.id}
                              className="flex items-center gap-3 px-4 sm:px-6 py-3 hover:bg-muted/20 transition-colors group border-b border-border/30 last:border-0"
                            >
                              <button
                                onClick={() =>
                                  toggleLessonComplete(module.id, lesson.id)
                                }
                                className="flex-shrink-0"
                                aria-label={
                                  lesson.completed
                                    ? "Mark incomplete"
                                    : "Mark complete"
                                }
                              >
                                {lesson.completed ? (
                                  <CheckCircle2 className="h-4.5 w-4.5 text-green-600" />
                                ) : (
                                  <Circle className="h-4.5 w-4.5 text-muted-foreground/50" />
                                )}
                              </button>

                              <button
                                onClick={() => setSelectedLesson(lesson)}
                                className={cn(
                                  "flex-1 text-left text-sm font-medium leading-snug",
                                  lesson.completed &&
                                    "line-through text-muted-foreground"
                                )}
                              >
                                {lesson.title}
                              </button>

                              <div className="flex items-center gap-2 flex-shrink-0">
                                <LessonTypeBadge
                                  type={
                                    (lesson as AcademyLesson & {
                                      type?: LessonType;
                                    }).type ?? "text"
                                  }
                                />
                                <button
                                  onClick={() =>
                                    deleteLesson(module.id, lesson.id)
                                  }
                                  className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-destructive/10 hover:text-destructive text-muted-foreground transition-all"
                                  aria-label="Delete lesson"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </button>
                              </div>
                            </div>
                          ))
                        )}

                        {/* Module footer actions */}
                        <div className="flex items-center justify-between px-4 sm:px-6 py-3 bg-muted/10">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => setAddLessonModuleId(module.id)}
                            className="text-xs h-7"
                          >
                            <Plus className="h-3.5 w-3.5" />
                            Add Lesson
                          </Button>
                          <button
                            onClick={() => deleteModule(module.id)}
                            className="p-1 rounded hover:bg-destructive/10 hover:text-destructive text-muted-foreground/50 transition-all text-xs flex items-center gap-1"
                          >
                            <Trash2 className="h-3 w-3" />
                            <span className="hidden sm:inline">Delete Module</span>
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </AnimatePresence>

        {/* Add module button */}
        <Button
          variant="outline"
          onClick={() => setAddModuleOpen(true)}
          className="w-full border-dashed h-11"
        >
          <Plus className="h-4 w-4" />
          Add Module
        </Button>
      </div>

      {/* Lesson content dialog */}
      <Dialog
        open={!!selectedLesson}
        onOpenChange={(open) => !open && setSelectedLesson(null)}
      >
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 pr-6">
              <BookOpen className="h-4.5 w-4.5 text-primary flex-shrink-0" />
              <span className="line-clamp-2">{selectedLesson?.title}</span>
            </DialogTitle>
          </DialogHeader>
          {selectedLesson && (
            <div className="space-y-4">
              <LessonTypeBadge
                type={
                  (selectedLesson as AcademyLesson & { type?: LessonType })
                    .type ?? "text"
                }
              />
              <div className="bg-muted/40 rounded-lg p-4 text-sm leading-relaxed text-foreground/90 whitespace-pre-wrap min-h-[80px]">
                {selectedLesson.content || (
                  <span className="text-muted-foreground italic">
                    No content yet.
                  </span>
                )}
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">
                  {selectedLesson.completed ? "Completed" : "Not yet completed"}
                </span>
                <Button
                  size="sm"
                  variant={selectedLesson.completed ? "outline" : "default"}
                  onClick={() => {
                    const mod = modules.find((m) =>
                      m.lessons.some((l) => l.id === selectedLesson.id)
                    );
                    if (mod) {
                      toggleLessonComplete(mod.id, selectedLesson.id);
                      setSelectedLesson({
                        ...selectedLesson,
                        completed: !selectedLesson.completed,
                      });
                    }
                  }}
                >
                  {selectedLesson.completed ? "Mark Incomplete" : "Mark Complete"}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Add module dialog */}
      <Dialog open={addModuleOpen} onOpenChange={setAddModuleOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add New Module</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label>Module Title</Label>
              <Input
                placeholder="e.g. Module 4: Advanced Marketing"
                value={newModuleTitle}
                onChange={(e) => setNewModuleTitle(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAddModule()}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Description</Label>
              <Textarea
                placeholder="What will students learn in this module?"
                value={newModuleDesc}
                onChange={(e) => setNewModuleDesc(e.target.value)}
                rows={3}
              />
            </div>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setAddModuleOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddModule} disabled={!newModuleTitle.trim()}>
                Add Module
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add lesson dialog */}
      <Dialog
        open={!!addLessonModuleId}
        onOpenChange={(open) => !open && setAddLessonModuleId(null)}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add New Lesson</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label>Lesson Title</Label>
              <Input
                placeholder="e.g. 1.4 Understanding Your Market"
                value={newLessonTitle}
                onChange={(e) => setNewLessonTitle(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Type</Label>
              <Select
                value={newLessonType}
                onValueChange={(v) => setNewLessonType(v as LessonType)}
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
                placeholder="Lesson description or content..."
                value={newLessonContent}
                onChange={(e) => setNewLessonContent(e.target.value)}
                rows={4}
              />
            </div>
            <div className="flex gap-2 justify-end">
              <Button
                variant="outline"
                onClick={() => setAddLessonModuleId(null)}
              >
                Cancel
              </Button>
              <Button
                onClick={handleAddLesson}
                disabled={!newLessonTitle.trim()}
              >
                Add Lesson
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
