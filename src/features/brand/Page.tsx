import { useState, useCallback, useRef } from "react";
import {
  Sparkles,
  Eye,
  CheckCircle2,
  Circle,
  ChevronRight,
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
import { useBrandStore, BRAND_PILLARS } from "@/stores/brand";
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

function pillarHasContent(
  pillarId: string,
  pillars: Record<string, Record<string, string>>
): boolean {
  const data = pillars[pillarId];
  if (!data) return false;
  return Object.values(data).some((v) => v && v.trim().length > 0);
}

export default function PersonalBrandPage() {
  const { brand, updateField } = useBrandStore();
  const [activeTab, setActiveTab] = useState(BRAND_PILLARS[0].id);
  const [summaryOpen, setSummaryOpen] = useState(false);

  const debouncedUpdate = useDebouncedCallback(
    (pillarId: string, key: string, value: string) => {
      updateField(pillarId, key, value);
    },
    400
  );

  const activePillar = BRAND_PILLARS.find((p) => p.id === activeTab)!;

  return (
    <div className="page-container">
      {/* Header */}
      <div className="page-header flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <h1 className="page-title flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-sidebar-primary" />
            Personal Brand
          </h1>
          <p className="page-description">
            Build your brand blueprint across 7 pillars.
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

      {/* Progress bar */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-muted-foreground">
            Brand Blueprint Progress
          </span>
          <span className="text-sm font-semibold text-primary">
            {brand.progress}%
          </span>
        </div>
        <Progress value={brand.progress} className="h-2" />
      </div>

      {/* Horizontal tab bar */}
      <div className="mb-6 overflow-x-auto">
        <div className="flex gap-1 min-w-max border-b border-border pb-0">
          {BRAND_PILLARS.map((pillar) => {
            const hasContent = pillarHasContent(pillar.id, brand.pillars);
            const isActive = activeTab === pillar.id;
            return (
              <button
                key={pillar.id}
                onClick={() => setActiveTab(pillar.id)}
                className={cn(
                  "relative flex items-center gap-2 px-4 py-2.5 text-sm font-medium transition-all duration-150 border-b-2 -mb-px whitespace-nowrap",
                  isActive
                    ? "border-primary text-primary"
                    : "border-transparent text-muted-foreground hover:text-foreground hover:border-border"
                )}
              >
                <span className="text-base leading-none">{pillar.icon}</span>
                <span>{pillar.name}</span>
                {hasContent ? (
                  <span className="w-1.5 h-1.5 rounded-full bg-sidebar-primary shrink-0" />
                ) : (
                  <span className="w-1.5 h-1.5 rounded-full bg-border shrink-0" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Pillar content */}
      <div className="max-w-3xl">
        {/* Pillar header */}
        <div className="mb-6 flex items-start gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
            <span className="text-xl text-primary">{activePillar.icon}</span>
          </div>
          <div>
            <h2 className="text-lg font-semibold">{activePillar.name}</h2>
            <p className="text-sm text-muted-foreground">
              {activePillar.description}
            </p>
          </div>
        </div>

        {/* Fields */}
        <div className="space-y-5">
          {activePillar.fields.map((field) => {
            const currentValue = brand.pillars[activePillar.id]?.[field.key] ?? "";
            const isFilled = currentValue.trim().length > 0;
            return (
              <div
                key={field.key}
                className="glass-card p-4 sm:p-5 rounded-lg"
              >
                <div className="flex items-center justify-between mb-2">
                  <Label className="text-sm font-medium flex items-center gap-1.5">
                    {isFilled ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-sidebar-primary" />
                    ) : (
                      <Circle className="w-3.5 h-3.5 text-border" />
                    )}
                    {field.label}
                  </Label>
                </div>
                {field.type === "textarea" ? (
                  <Textarea
                    defaultValue={currentValue}
                    placeholder={field.placeholder}
                    rows={3}
                    className="resize-none bg-background/60 text-sm"
                    onChange={(e) =>
                      debouncedUpdate(activePillar.id, field.key, e.target.value)
                    }
                  />
                ) : (
                  <Input
                    defaultValue={currentValue}
                    placeholder={field.placeholder}
                    className="bg-background/60 text-sm"
                    onChange={(e) =>
                      debouncedUpdate(activePillar.id, field.key, e.target.value)
                    }
                  />
                )}
              </div>
            );
          })}
        </div>

        {/* Navigation arrows */}
        <div className="flex items-center justify-between mt-8">
          <Button
            variant="outline"
            size="sm"
            disabled={BRAND_PILLARS[0].id === activeTab}
            onClick={() => {
              const idx = BRAND_PILLARS.findIndex((p) => p.id === activeTab);
              if (idx > 0) setActiveTab(BRAND_PILLARS[idx - 1].id);
            }}
          >
            Previous
          </Button>
          <span className="text-xs text-muted-foreground">
            {BRAND_PILLARS.findIndex((p) => p.id === activeTab) + 1} of{" "}
            {BRAND_PILLARS.length}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={
              BRAND_PILLARS[BRAND_PILLARS.length - 1].id === activeTab
            }
            onClick={() => {
              const idx = BRAND_PILLARS.findIndex((p) => p.id === activeTab);
              if (idx < BRAND_PILLARS.length - 1)
                setActiveTab(BRAND_PILLARS[idx + 1].id);
            }}
          >
            Next
            <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        </div>
      </div>

      {/* Summary Dialog */}
      <Dialog open={summaryOpen} onOpenChange={setSummaryOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-sidebar-primary" />
              Brand Blueprint Summary
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-6 mt-2">
            {/* Progress summary */}
            <div className="glass-card p-4 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Overall Completion</span>
                <span className="text-sm font-semibold text-primary">
                  {brand.progress}%
                </span>
              </div>
              <Progress value={brand.progress} className="h-1.5" />
            </div>

            {/* Pillars */}
            {BRAND_PILLARS.map((pillar) => {
              const pillarData = brand.pillars[pillar.id] ?? {};
              const hasAny = Object.values(pillarData).some(
                (v) => v && v.trim().length > 0
              );
              return (
                <div key={pillar.id}>
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-lg">{pillar.icon}</span>
                    <h3 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground">
                      {pillar.name}
                    </h3>
                    {!hasAny && (
                      <span className="text-xs text-muted-foreground italic">
                        — not filled
                      </span>
                    )}
                  </div>
                  {hasAny && (
                    <div className="space-y-3 pl-7">
                      {pillar.fields.map((field) => {
                        const val = pillarData[field.key];
                        if (!val || !val.trim()) return null;
                        return (
                          <div key={field.key}>
                            <p className="text-xs font-medium text-muted-foreground mb-0.5">
                              {field.label}
                            </p>
                            <p className="text-sm">{val}</p>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
