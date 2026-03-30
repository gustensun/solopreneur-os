import { useState, useRef, useCallback } from "react";
import {
  Target,
  Eye,
  Plus,
  Trash2,
  Zap,
  Star,
  Clock,
  Layers,
  DollarSign,
  ShieldCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useOfferStore } from "@/stores/offer";
import type { Offer } from "@/types";
import { cn } from "@/lib/utils";

function useDebouncedCallback<T extends (...args: Parameters<T>) => void>(
  fn: T,
  delay: number
): T {
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  return useCallback(
    ((...args: Parameters<T>) => {
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(() => fn(...args), delay);
    }) as T,
    [fn, delay]
  );
}

function calcProgress(offer: Offer): number {
  const fields = [
    offer.name,
    offer.clearOutcome,
    offer.newVehicle,
    offer.betterResults,
    offer.fasterDelivery,
    offer.convenience,
    offer.price,
  ];
  const filled = fields.filter((f) => f && f.trim().length > 0).length;
  const stackBonus = offer.offerStack.length > 0 ? 1 : 0;
  const objectionBonus = offer.objections.length > 0 ? 1 : 0;
  return Math.round(((filled + stackBonus + objectionBonus) / (fields.length + 2)) * 100);
}

const objectionBoxes = [
  {
    key: "newVehicle" as const,
    label: "New (Vehicle)",
    description: "What makes your approach new?",
    icon: Zap,
    color: "text-amber-600",
    bg: "bg-amber-50",
  },
  {
    key: "betterResults" as const,
    label: "Better (Results)",
    description: "Why are your results superior?",
    icon: Star,
    color: "text-emerald-600",
    bg: "bg-emerald-50",
  },
  {
    key: "fasterDelivery" as const,
    label: "Faster (Delivery)",
    description: "How do you deliver faster?",
    icon: Clock,
    color: "text-blue-600",
    bg: "bg-blue-50",
  },
  {
    key: "convenience" as const,
    label: "Convenience (Process)",
    description: "Why is your process easier?",
    icon: Layers,
    color: "text-purple-600",
    bg: "bg-purple-50",
  },
];

export default function OfferCreatorPage() {
  const {
    offer,
    updateOffer,
    addStackItem,
    removeStackItem,
    updateStackItem,
    addObjection,
    removeObjection,
    updateObjection,
  } = useOfferStore();

  const [summaryOpen, setSummaryOpen] = useState(false);
  const progress = calcProgress(offer);

  const debouncedUpdate = useDebouncedCallback(
    (updates: Parameters<typeof updateOffer>[0]) => updateOffer(updates),
    400
  );

  const handleAddStackItem = () => {
    addStackItem({ name: "", value: "", description: "" });
  };

  const handleAddObjection = () => {
    addObjection({ objection: "", killer: "" });
  };

  const totalStackValue = offer.offerStack.reduce((sum, item) => {
    const val = parseFloat(item.value.replace(/,/g, ""));
    return sum + (isNaN(val) ? 0 : val);
  }, 0);

  return (
    <div className="page-container">
      {/* Header */}
      <div className="page-header flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <h1 className="page-title flex items-center gap-2">
            <Target className="w-6 h-6 text-sidebar-primary" />
            Offer Creator
          </h1>
          <p className="page-description">
            Design and refine your irresistible offer.
          </p>
        </div>
        <Button
          onClick={() => setSummaryOpen(true)}
          className="shrink-0 bg-primary text-primary-foreground hover:bg-primary/90"
        >
          <Eye className="w-4 h-4 mr-2" />
          View Summary
        </Button>
      </div>

      {/* Progress */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-muted-foreground">
            Offer Completion
          </span>
          <span className="text-sm font-semibold text-primary">{progress}%</span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      <div className="max-w-3xl space-y-8">

        {/* 1. Offer Name */}
        <section className="glass-card p-5 rounded-lg">
          <Label className="text-sm font-semibold flex items-center gap-2 mb-3">
            <Target className="w-4 h-4 text-sidebar-primary" />
            Offer Name
          </Label>
          <Input
            defaultValue={offer.name}
            placeholder="e.g. AI Business Accelerator"
            className="bg-background/60 text-sm"
            onChange={(e) => debouncedUpdate({ name: e.target.value })}
          />
        </section>

        {/* 2. Clear Outcome */}
        <section className="glass-card p-5 rounded-lg">
          <Label className="text-sm font-semibold flex items-center gap-2 mb-1">
            <Star className="w-4 h-4 text-sidebar-primary" />
            Clear Outcome
          </Label>
          <p className="text-xs text-muted-foreground mb-3">
            The specific, measurable result your client achieves
          </p>
          <Textarea
            defaultValue={offer.clearOutcome}
            placeholder="e.g. Go from 0 to $10k/month in 90 days using AI-powered systems"
            rows={3}
            className="resize-none bg-background/60 text-sm"
            onChange={(e) => debouncedUpdate({ clearOutcome: e.target.value })}
          />
        </section>

        {/* 3. Objection Handling — 4 Boxes */}
        <section>
          <div className="mb-4">
            <h2 className="text-base font-semibold flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-sidebar-primary" />
              Objection Handling
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Make your offer undeniable with these four pillars
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {objectionBoxes.map(({ key, label, description, icon: Icon, color, bg }) => (
              <div key={key} className="glass-card p-4 rounded-lg">
                <div className="flex items-start gap-2 mb-2">
                  <div
                    className={cn(
                      "w-7 h-7 rounded-md flex items-center justify-center shrink-0",
                      bg
                    )}
                  >
                    <Icon className={cn("w-4 h-4", color)} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold leading-tight">{label}</p>
                    <p className="text-xs text-muted-foreground">{description}</p>
                  </div>
                </div>
                <Textarea
                  defaultValue={offer[key]}
                  placeholder={description}
                  rows={3}
                  className="resize-none bg-background/60 text-sm mt-2"
                  onChange={(e) =>
                    debouncedUpdate({ [key]: e.target.value })
                  }
                />
              </div>
            ))}
          </div>
        </section>

        {/* 4. Offer Stack */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-semibold flex items-center gap-2">
                <Layers className="w-4 h-4 text-sidebar-primary" />
                Offer Stack
              </h2>
              {offer.offerStack.length > 0 && (
                <p className="text-xs text-muted-foreground mt-0.5">
                  Total value:{" "}
                  <span className="font-semibold text-foreground">
                    ${totalStackValue.toLocaleString()}
                  </span>
                </p>
              )}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleAddStackItem}
              className="gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              Add to Stack
            </Button>
          </div>
          <div className="space-y-3">
            {offer.offerStack.length === 0 && (
              <div className="glass-card p-8 rounded-lg text-center">
                <Layers className="w-8 h-8 text-muted-foreground/40 mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">
                  No stack items yet. Add bonuses and deliverables to increase perceived value.
                </p>
              </div>
            )}
            {offer.offerStack.map((item, idx) => (
              <div key={item.id} className="glass-card p-4 rounded-lg">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                    <span className="text-xs font-semibold text-primary">{idx + 1}</span>
                  </div>
                  <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="sm:col-span-2">
                      <Label className="text-xs text-muted-foreground mb-1 block">Name</Label>
                      <Input
                        defaultValue={item.name}
                        placeholder="e.g. 12-Week Coaching Program"
                        className="bg-background/60 text-sm"
                        onChange={(e) =>
                          updateStackItem(item.id, { name: e.target.value })
                        }
                      />
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground mb-1 block">
                        Value ($)
                      </Label>
                      <Input
                        defaultValue={item.value}
                        placeholder="e.g. 2,500"
                        className="bg-background/60 text-sm"
                        onChange={(e) =>
                          updateStackItem(item.id, { value: e.target.value })
                        }
                      />
                    </div>
                    <div className="sm:col-span-3">
                      <Label className="text-xs text-muted-foreground mb-1 block">
                        Description
                      </Label>
                      <Textarea
                        defaultValue={item.description}
                        placeholder="Brief description of what's included"
                        rows={2}
                        className="resize-none bg-background/60 text-sm"
                        onChange={(e) =>
                          updateStackItem(item.id, { description: e.target.value })
                        }
                      />
                    </div>
                  </div>
                  <button
                    onClick={() => removeStackItem(item.id)}
                    className="text-muted-foreground/50 hover:text-destructive transition-colors mt-0.5 shrink-0"
                    aria-label="Remove item"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 5. Manual Objections */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-semibold flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-sidebar-primary" />
                Objection Killers
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                Address specific objections your prospects raise
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleAddObjection}
              className="gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Objection
            </Button>
          </div>
          <div className="space-y-3">
            {offer.objections.length === 0 && (
              <div className="glass-card p-8 rounded-lg text-center">
                <ShieldCheck className="w-8 h-8 text-muted-foreground/40 mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">
                  No objections listed. Add common objections and your responses.
                </p>
              </div>
            )}
            {offer.objections.map((pair) => (
              <div key={pair.id} className="glass-card p-4 rounded-lg">
                <div className="flex items-start gap-3">
                  <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <Label className="text-xs text-muted-foreground mb-1 block">
                        Objection
                      </Label>
                      <Textarea
                        defaultValue={pair.objection}
                        placeholder="e.g. I don't have time"
                        rows={2}
                        className="resize-none bg-background/60 text-sm"
                        onChange={(e) =>
                          updateObjection(pair.id, { objection: e.target.value })
                        }
                      />
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground mb-1 block">
                        Killer Response
                      </Label>
                      <Textarea
                        defaultValue={pair.killer}
                        placeholder="Your compelling response..."
                        rows={2}
                        className="resize-none bg-background/60 text-sm"
                        onChange={(e) =>
                          updateObjection(pair.id, { killer: e.target.value })
                        }
                      />
                    </div>
                  </div>
                  <button
                    onClick={() => removeObjection(pair.id)}
                    className="text-muted-foreground/50 hover:text-destructive transition-colors mt-0.5 shrink-0"
                    aria-label="Remove objection"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 6. Price */}
        <section className="glass-card p-5 rounded-lg">
          <Label className="text-sm font-semibold flex items-center gap-2 mb-3">
            <DollarSign className="w-4 h-4 text-sidebar-primary" />
            Investment (Price)
          </Label>
          <div className="relative max-w-xs">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-medium">
              $
            </span>
            <Input
              defaultValue={offer.price}
              placeholder="5,000"
              className="pl-7 bg-background/60 text-sm"
              onChange={(e) => debouncedUpdate({ price: e.target.value })}
            />
          </div>
        </section>
      </div>

      {/* Summary Dialog */}
      <Dialog open={summaryOpen} onOpenChange={setSummaryOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Target className="w-5 h-5 text-sidebar-primary" />
              Offer Summary
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-6 mt-2">
            {/* Offer name + outcome */}
            <div className="glass-card p-4 rounded-lg space-y-3">
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-0.5">
                  Offer Name
                </p>
                <p className="text-sm font-semibold">
                  {offer.name || "—"}
                </p>
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-0.5">
                  Clear Outcome
                </p>
                <p className="text-sm">{offer.clearOutcome || "—"}</p>
              </div>
            </div>

            {/* Objection Handling */}
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
                Objection Handling
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {objectionBoxes.map(({ key, label }) => (
                  <div key={key} className="glass-card p-3 rounded-lg">
                    <p className="text-xs font-medium text-muted-foreground mb-1">
                      {label}
                    </p>
                    <p className="text-sm">{offer[key] || "—"}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Stack */}
            {offer.offerStack.length > 0 && (
              <div>
                <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
                  Offer Stack
                </h3>
                <div className="space-y-2">
                  {offer.offerStack.map((item, i) => (
                    <div
                      key={item.id}
                      className="flex items-start justify-between gap-3 glass-card p-3 rounded-lg"
                    >
                      <div>
                        <p className="text-sm font-medium">
                          {i + 1}. {item.name || "(unnamed)"}
                        </p>
                        {item.description && (
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {item.description}
                          </p>
                        )}
                      </div>
                      {item.value && (
                        <span className="text-sm font-semibold text-primary shrink-0">
                          ${item.value}
                        </span>
                      )}
                    </div>
                  ))}
                  <div className="flex items-center justify-between pt-1 px-1">
                    <span className="text-sm text-muted-foreground">
                      Total Perceived Value
                    </span>
                    <span className="text-base font-bold text-primary">
                      ${totalStackValue.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Objections */}
            {offer.objections.length > 0 && (
              <div>
                <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
                  Objection Killers
                </h3>
                <div className="space-y-2">
                  {offer.objections.map((pair) => (
                    <div key={pair.id} className="glass-card p-3 rounded-lg">
                      <p className="text-xs font-medium text-muted-foreground mb-0.5">
                        Objection
                      </p>
                      <p className="text-sm mb-2">
                        "{pair.objection || "—"}"
                      </p>
                      <p className="text-xs font-medium text-muted-foreground mb-0.5">
                        Response
                      </p>
                      <p className="text-sm">{pair.killer || "—"}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Price */}
            <div className="glass-card p-4 rounded-lg flex items-center justify-between">
              <span className="text-sm font-semibold">Investment</span>
              <span className="text-xl font-bold text-primary">
                ${offer.price || "—"}
              </span>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
