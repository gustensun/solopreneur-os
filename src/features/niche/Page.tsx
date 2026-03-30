import { useState } from "react";
import {
  Crosshair,
  Copy,
  Check,
  Share2,
  Heart,
  TrendingUp,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useNicheStore } from "@/stores/niche";
import { cn } from "@/lib/utils";
import type { NicheMarket } from "@/types";

const marketOptions: {
  value: NicheMarket;
  label: string;
  icon: typeof Heart;
  description: string;
  color: string;
  activeColor: string;
}[] = [
  {
    value: "health",
    label: "Health",
    icon: Heart,
    description: "Physical & mental wellbeing",
    color: "text-rose-500",
    activeColor: "border-rose-400 bg-rose-50 text-rose-700",
  },
  {
    value: "wealth",
    label: "Wealth",
    icon: TrendingUp,
    description: "Money, business & career",
    color: "text-emerald-500",
    activeColor: "border-emerald-500 bg-emerald-50 text-emerald-700",
  },
  {
    value: "relationships",
    label: "Relationships",
    icon: Users,
    description: "Love, family & connections",
    color: "text-blue-500",
    activeColor: "border-blue-400 bg-blue-50 text-blue-700",
  },
];

const exampleTemplates: Record<
  NicheMarket,
  { group: string; outcome: string; benefit: string; pain: string }
> = {
  health: {
    group: "busy professionals over 40",
    outcome: "lose 20 lbs and reclaim their energy",
    benefit: "feel confident, focused, and healthy every day",
    pain: "follow extreme diets or spend hours at the gym",
  },
  wealth: {
    group: "solopreneurs and creators",
    outcome: "build a 6-figure online business using AI tools",
    benefit: "work from anywhere with complete time and financial freedom",
    pain: "spend years figuring it out through trial and error",
  },
  relationships: {
    group: "divorced men in their 40s",
    outcome: "attract a high-quality partner and build a fulfilling relationship",
    benefit: "feel loved, respected, and genuinely connected again",
    pain: "settle for less or repeat old patterns",
  },
};

export default function NicheStatementPage() {
  const { niche, updateNiche, getFullStatement } = useNicheStore();
  const [copied, setCopied] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);

  const fullStatement = getFullStatement();

  const handleCopy = async () => {
    if (!fullStatement) return;
    await navigator.clipboard.writeText(fullStatement);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleLoadTemplate = () => {
    const tpl = exampleTemplates[niche.market];
    updateNiche(tpl);
  };

  const activeMarket = marketOptions.find((m) => m.value === niche.market);

  return (
    <div className="page-container">
      {/* Header */}
      <div className="page-header">
        <h1 className="page-title flex items-center gap-2">
          <Crosshair className="w-6 h-6 text-sidebar-primary" />
          Niche Statement
        </h1>
        <p className="page-description">
          Craft your perfect niche statement in one clear sentence.
        </p>
      </div>

      <div className="max-w-2xl space-y-8">

        {/* Formula display */}
        <div className="glass-card p-5 rounded-xl">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
            The Formula
          </p>
          <p className="text-sm leading-relaxed font-medium text-foreground/80">
            <span className="font-semibold text-foreground">I help</span>{" "}
            <span className="inline-block px-1.5 py-0.5 rounded bg-primary/10 text-primary font-semibold text-xs">
              [group]
            </span>{" "}
            <span className="inline-block px-1.5 py-0.5 rounded bg-primary/10 text-primary font-semibold text-xs">
              [outcome]
            </span>
            <span className="font-semibold text-foreground">, so they can</span>{" "}
            <span className="inline-block px-1.5 py-0.5 rounded bg-primary/10 text-primary font-semibold text-xs">
              [benefit]
            </span>
            <span className="font-semibold text-foreground">, without having to</span>{" "}
            <span className="inline-block px-1.5 py-0.5 rounded bg-primary/10 text-primary font-semibold text-xs">
              [pain]
            </span>
            <span className="font-semibold text-foreground">.</span>
          </p>
        </div>

        {/* Market Selector */}
        <div>
          <Label className="text-sm font-semibold mb-3 block">Market</Label>
          <div className="grid grid-cols-3 gap-3">
            {marketOptions.map(({ value, label, icon: Icon, description, color, activeColor }) => {
              const isActive = niche.market === value;
              return (
                <button
                  key={value}
                  onClick={() => updateNiche({ market: value })}
                  className={cn(
                    "flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all duration-150 text-center",
                    isActive
                      ? activeColor + " border-2 shadow-sm"
                      : "border-border bg-card hover:border-border/80 hover:bg-muted/30 text-muted-foreground"
                  )}
                >
                  <Icon
                    className={cn(
                      "w-5 h-5",
                      isActive ? "" : color
                    )}
                  />
                  <span className="text-sm font-semibold leading-tight">
                    {label}
                  </span>
                  <span className={cn("text-xs leading-tight", isActive ? "opacity-80" : "text-muted-foreground")}>
                    {description}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Input Fields */}
        <div className="space-y-4">
          <div className="glass-card p-4 rounded-lg">
            <Label className="text-sm font-medium mb-1.5 block">
              Group{" "}
              <span className="text-xs text-muted-foreground font-normal">
                — who do you help?
              </span>
            </Label>
            <Input
              value={niche.group}
              placeholder="e.g. busy professionals over 40"
              className="bg-background/60 text-sm"
              onChange={(e) => updateNiche({ group: e.target.value })}
            />
          </div>

          <div className="glass-card p-4 rounded-lg">
            <Label className="text-sm font-medium mb-1.5 block">
              Outcome{" "}
              <span className="text-xs text-muted-foreground font-normal">
                — what do you help them achieve?
              </span>
            </Label>
            <Input
              value={niche.outcome}
              placeholder="e.g. build a 6-figure online business"
              className="bg-background/60 text-sm"
              onChange={(e) => updateNiche({ outcome: e.target.value })}
            />
          </div>

          <div className="glass-card p-4 rounded-lg">
            <Label className="text-sm font-medium mb-1.5 block">
              Benefit{" "}
              <span className="text-xs text-muted-foreground font-normal">
                — so they can...
              </span>
            </Label>
            <Input
              value={niche.benefit}
              placeholder="e.g. work from anywhere with complete freedom"
              className="bg-background/60 text-sm"
              onChange={(e) => updateNiche({ benefit: e.target.value })}
            />
          </div>

          <div className="glass-card p-4 rounded-lg">
            <Label className="text-sm font-medium mb-1.5 block">
              Pain{" "}
              <span className="text-xs text-muted-foreground font-normal">
                — without having to...
              </span>
            </Label>
            <Input
              value={niche.pain}
              placeholder="e.g. spend years figuring it out"
              className="bg-background/60 text-sm"
              onChange={(e) => updateNiche({ pain: e.target.value })}
            />
          </div>
        </div>

        {/* Live Preview */}
        <div className="rounded-xl border-2 border-primary/20 bg-primary/5 p-5">
          <p className="text-xs font-semibold uppercase tracking-wider text-primary/70 mb-3">
            Live Preview
          </p>
          {fullStatement ? (
            <p className="text-base font-medium leading-relaxed text-foreground">
              {fullStatement}
            </p>
          ) : (
            <p className="text-sm text-muted-foreground italic">
              Fill in the fields above to see your statement come to life...
            </p>
          )}
        </div>

        {/* Actions */}
        <div className="flex flex-wrap gap-3">
          <Button
            onClick={handleCopy}
            variant="default"
            className="bg-primary text-primary-foreground hover:bg-primary/90 gap-2"
            disabled={!fullStatement}
          >
            {copied ? (
              <Check className="w-4 h-4" />
            ) : (
              <Copy className="w-4 h-4" />
            )}
            {copied ? "Copied!" : "Copy Statement"}
          </Button>
          <Button
            onClick={() => setShareOpen(true)}
            variant="outline"
            className="gap-2"
            disabled={!fullStatement}
          >
            <Share2 className="w-4 h-4" />
            Share
          </Button>
          <Button
            onClick={handleLoadTemplate}
            variant="ghost"
            className="gap-2 text-muted-foreground hover:text-foreground"
          >
            Load {activeMarket?.label} Example
          </Button>
        </div>
      </div>

      {/* Share Dialog */}
      <Dialog open={shareOpen} onOpenChange={setShareOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Share2 className="w-5 h-5 text-sidebar-primary" />
              Share Your Niche Statement
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            <div className="glass-card p-4 rounded-lg">
              <p className="text-sm leading-relaxed">{fullStatement}</p>
            </div>
            <div>
              <Label className="text-xs text-muted-foreground mb-1.5 block">
                Share link
              </Label>
              <div className="flex gap-2">
                <Input
                  readOnly
                  value={`${window.location.origin}/niche-statement`}
                  className="bg-background/60 text-xs"
                />
                <Button
                  size="sm"
                  variant="outline"
                  onClick={async () => {
                    await navigator.clipboard.writeText(
                      `${window.location.origin}/niche-statement`
                    );
                  }}
                >
                  <Copy className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              Share this link with anyone to showcase your niche statement.
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
