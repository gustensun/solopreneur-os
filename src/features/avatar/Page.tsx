import { useState } from "react";
import {
  UserCircle2,
  Plus,
  Trash2,
  ChevronLeft,
  User,
  Brain,
  Activity,
  AlertTriangle,
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
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { useAvatarStore } from "@/stores/avatar";
import { cn } from "@/lib/utils";
import type { CustomerAvatar } from "@/types";

const blankAvatar: Omit<CustomerAvatar, "id" | "createdAt" | "updatedAt"> = {
  name: "",
  age: "",
  gender: "",
  occupation: "",
  income: "",
  goals: "",
  frustrations: "",
  fears: "",
  desires: "",
  dailyLife: "",
  platforms: "",
  objections: "",
};

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 0 || !parts[0]) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function getAvatarColor(id: string): string {
  const colors = [
    "bg-emerald-100 text-emerald-700",
    "bg-blue-100 text-blue-700",
    "bg-violet-100 text-violet-700",
    "bg-amber-100 text-amber-700",
    "bg-rose-100 text-rose-700",
    "bg-cyan-100 text-cyan-700",
  ];
  const hash = id.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0);
  return colors[hash % colors.length];
}

interface FieldProps {
  label: string;
  hint?: string;
  value: string;
  placeholder: string;
  multiline?: boolean;
  rows?: number;
  onChange: (val: string) => void;
}

function AvatarField({ label, hint, value, placeholder, multiline, rows = 3, onChange }: FieldProps) {
  return (
    <div>
      <Label className="text-sm font-medium mb-1 block">
        {label}
        {hint && (
          <span className="text-xs text-muted-foreground font-normal ml-1">
            — {hint}
          </span>
        )}
      </Label>
      {multiline ? (
        <Textarea
          value={value}
          placeholder={placeholder}
          rows={rows}
          className="resize-none bg-background/60 text-sm"
          onChange={(e) => onChange(e.target.value)}
        />
      ) : (
        <Input
          value={value}
          placeholder={placeholder}
          className="bg-background/60 text-sm"
          onChange={(e) => onChange(e.target.value)}
        />
      )}
    </div>
  );
}

interface AvatarFormProps {
  avatar: CustomerAvatar;
  onUpdate: (id: string, updates: Partial<CustomerAvatar>) => void;
}

function AvatarForm({ avatar, onUpdate }: AvatarFormProps) {
  const update = (field: keyof CustomerAvatar) => (val: string) =>
    onUpdate(avatar.id, { [field]: val });

  return (
    <div className="space-y-6">
      {/* Demographics */}
      <section className="glass-card p-5 rounded-lg">
        <h3 className="text-sm font-semibold flex items-center gap-2 mb-4">
          <User className="w-4 h-4 text-sidebar-primary" />
          Demographics
        </h3>
        <div className="space-y-4">
          <AvatarField
            label="Name"
            hint="give them a real name"
            value={avatar.name}
            placeholder="e.g. Alex the Ambitious Creator"
            onChange={update("name")}
          />
          <div className="grid grid-cols-2 gap-4">
            <AvatarField
              label="Age"
              value={avatar.age}
              placeholder="e.g. 28-35"
              onChange={update("age")}
            />
            <AvatarField
              label="Gender"
              value={avatar.gender}
              placeholder="e.g. Male/Female"
              onChange={update("gender")}
            />
          </div>
          <AvatarField
            label="Occupation"
            value={avatar.occupation}
            placeholder="e.g. Content creator, freelancer"
            onChange={update("occupation")}
          />
          <AvatarField
            label="Income"
            hint="current range and aspirations"
            value={avatar.income}
            placeholder="e.g. $50k-$80k/year (wants $150k+)"
            onChange={update("income")}
          />
        </div>
      </section>

      {/* Psychology */}
      <section className="glass-card p-5 rounded-lg">
        <h3 className="text-sm font-semibold flex items-center gap-2 mb-4">
          <Brain className="w-4 h-4 text-sidebar-primary" />
          Psychology
        </h3>
        <div className="space-y-4">
          <AvatarField
            label="Goals"
            hint="what do they want most?"
            value={avatar.goals}
            placeholder="Their top 2-3 goals..."
            multiline
            rows={3}
            onChange={update("goals")}
          />
          <AvatarField
            label="Frustrations"
            hint="what's not working for them?"
            value={avatar.frustrations}
            placeholder="What keeps them stuck..."
            multiline
            rows={3}
            onChange={update("frustrations")}
          />
          <AvatarField
            label="Fears"
            hint="what are they afraid of?"
            value={avatar.fears}
            placeholder="Their deepest fears around the problem..."
            multiline
            rows={3}
            onChange={update("fears")}
          />
          <AvatarField
            label="Desires"
            hint="what do they secretly want?"
            value={avatar.desires}
            placeholder="Their dream outcome..."
            multiline
            rows={3}
            onChange={update("desires")}
          />
        </div>
      </section>

      {/* Behavior */}
      <section className="glass-card p-5 rounded-lg">
        <h3 className="text-sm font-semibold flex items-center gap-2 mb-4">
          <Activity className="w-4 h-4 text-sidebar-primary" />
          Behavior
        </h3>
        <div className="space-y-4">
          <AvatarField
            label="Daily Life"
            hint="how do they spend their time?"
            value={avatar.dailyLife}
            placeholder="A day in their life..."
            multiline
            rows={3}
            onChange={update("dailyLife")}
          />
          <AvatarField
            label="Platforms"
            hint="where do they hang out online?"
            value={avatar.platforms}
            placeholder="e.g. YouTube, Twitter/X, LinkedIn, Instagram"
            onChange={update("platforms")}
          />
          <AvatarField
            label="Objections"
            hint="why might they not buy?"
            value={avatar.objections}
            placeholder="Common objections they raise..."
            multiline
            rows={3}
            onChange={update("objections")}
          />
        </div>
      </section>
    </div>
  );
}

export default function AvatarArchitectPage() {
  const { avatars, addAvatar, updateAvatar, deleteAvatar } = useAvatarStore();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const selectedAvatar = selectedId
    ? avatars.find((a) => a.id === selectedId) ?? null
    : null;

  const handleCreate = () => {
    const id = addAvatar({ ...blankAvatar });
    setSelectedId(id);
  };

  const handleDelete = (id: string) => {
    deleteAvatar(id);
    setDeleteConfirmId(null);
    if (selectedId === id) setSelectedId(null);
  };

  if (selectedAvatar) {
    return (
      <div className="page-container">
        {/* Back header */}
        <div className="mb-6 flex items-center justify-between">
          <button
            onClick={() => setSelectedId(null)}
            className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            All Avatars
          </button>
          <Button
            variant="ghost"
            size="sm"
            className="text-destructive hover:text-destructive hover:bg-destructive/10 gap-1.5"
            onClick={() => setDeleteConfirmId(selectedAvatar.id)}
          >
            <Trash2 className="w-4 h-4" />
            Delete Avatar
          </Button>
        </div>

        {/* Avatar identity bar */}
        <div className="flex items-center gap-3 mb-6">
          <div
            className={cn(
              "w-12 h-12 rounded-full flex items-center justify-center text-sm font-bold shrink-0",
              getAvatarColor(selectedAvatar.id)
            )}
          >
            {getInitials(selectedAvatar.name || "?")}
          </div>
          <div>
            <h1 className="text-xl font-semibold leading-tight">
              {selectedAvatar.name || "Unnamed Avatar"}
            </h1>
            {selectedAvatar.occupation && (
              <p className="text-sm text-muted-foreground">
                {selectedAvatar.occupation}
              </p>
            )}
          </div>
        </div>

        <AvatarForm avatar={selectedAvatar} onUpdate={updateAvatar} />

        {/* Delete confirmation dialog */}
        <Dialog
          open={deleteConfirmId === selectedAvatar.id}
          onOpenChange={(open) => !open && setDeleteConfirmId(null)}
        >
          <DialogContent className="max-w-sm">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-destructive" />
                Delete Avatar
              </DialogTitle>
              <DialogDescription>
                Are you sure you want to delete{" "}
                <strong>{selectedAvatar.name || "this avatar"}</strong>? This
                action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setDeleteConfirmId(null)}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => handleDelete(selectedAvatar.id)}
              >
                Delete
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  // Grid view
  return (
    <div className="page-container">
      {/* Header */}
      <div className="page-header flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <h1 className="page-title flex items-center gap-2">
            <UserCircle2 className="w-6 h-6 text-sidebar-primary" />
            Avatar Architect
          </h1>
          <p className="page-description">
            Define your ideal customer to sharpen your marketing.
          </p>
        </div>
        <Button
          onClick={handleCreate}
          className="shrink-0 bg-primary text-primary-foreground hover:bg-primary/90 gap-2"
        >
          <Plus className="w-4 h-4" />
          Create New Avatar
        </Button>
      </div>

      {/* Empty state */}
      {avatars.length === 0 && (
        <div className="flex flex-col items-center justify-center py-24 text-center max-w-md mx-auto">
          <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
            <UserCircle2 className="w-8 h-8 text-muted-foreground/40" />
          </div>
          <h2 className="text-lg font-semibold mb-2">No Avatars Yet</h2>
          <p className="text-sm text-muted-foreground mb-6">
            Define your ideal customer to sharpen your marketing, refine your
            messaging, and create offers that convert.
          </p>
          <Button onClick={handleCreate} className="gap-2">
            <Plus className="w-4 h-4" />
            Create Your First Avatar
          </Button>
        </div>
      )}

      {/* Avatar cards grid */}
      {avatars.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {avatars.map((avatar) => {
            const initials = getInitials(avatar.name || "?");
            const color = getAvatarColor(avatar.id);
            const filledCount = [
              avatar.name,
              avatar.age,
              avatar.occupation,
              avatar.income,
              avatar.goals,
              avatar.frustrations,
              avatar.fears,
              avatar.desires,
              avatar.dailyLife,
              avatar.platforms,
              avatar.objections,
            ].filter((f) => f && f.trim().length > 0).length;
            const completion = Math.round((filledCount / 11) * 100);

            return (
              <button
                key={avatar.id}
                onClick={() => setSelectedId(avatar.id)}
                className="glass-card p-5 rounded-xl text-left hover-lift transition-all cursor-pointer group"
              >
                <div className="flex items-start gap-3 mb-4">
                  <div
                    className={cn(
                      "w-11 h-11 rounded-full flex items-center justify-center text-sm font-bold shrink-0",
                      color
                    )}
                  >
                    {initials}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-semibold text-sm leading-tight truncate">
                      {avatar.name || "Unnamed Avatar"}
                    </h3>
                    {avatar.occupation && (
                      <p className="text-xs text-muted-foreground mt-0.5 truncate">
                        {avatar.occupation}
                      </p>
                    )}
                    {avatar.age && (
                      <p className="text-xs text-muted-foreground truncate">
                        Age: {avatar.age}
                      </p>
                    )}
                  </div>
                </div>

                {/* Snippets */}
                <div className="space-y-1.5 mb-4">
                  {avatar.goals && (
                    <p className="text-xs text-muted-foreground line-clamp-2">
                      <span className="font-medium text-foreground/70">Goals: </span>
                      {avatar.goals}
                    </p>
                  )}
                  {avatar.platforms && (
                    <p className="text-xs text-muted-foreground truncate">
                      <span className="font-medium text-foreground/70">Platforms: </span>
                      {avatar.platforms}
                    </p>
                  )}
                </div>

                {/* Completion bar */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-muted-foreground">
                      Profile
                    </span>
                    <span className="text-xs font-medium text-primary">
                      {completion}%
                    </span>
                  </div>
                  <div className="h-1 rounded-full bg-border overflow-hidden">
                    <div
                      className="h-full bg-sidebar-primary rounded-full transition-all"
                      style={{ width: `${completion}%` }}
                    />
                  </div>
                </div>

                {/* Hover hint */}
                <p className="text-xs text-muted-foreground/0 group-hover:text-muted-foreground mt-2 transition-colors text-right">
                  Click to edit
                </p>
              </button>
            );
          })}

          {/* Add new card */}
          <button
            onClick={handleCreate}
            className={cn(
              "glass-card p-5 rounded-xl border-2 border-dashed border-border",
              "flex flex-col items-center justify-center gap-3 text-center",
              "hover:border-primary/50 hover:bg-primary/5 transition-all duration-150 cursor-pointer group min-h-[200px]"
            )}
          >
            <div className="w-10 h-10 rounded-full bg-muted group-hover:bg-primary/10 transition-colors flex items-center justify-center">
              <Plus className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground group-hover:text-foreground transition-colors">
                Create New Avatar
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Add another customer profile
              </p>
            </div>
          </button>
        </div>
      )}
    </div>
  );
}
