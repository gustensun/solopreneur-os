import { motion } from "framer-motion";
import { LayoutTemplate, Sparkles, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function SlidesPage() {
  return (
    <div className="page-container max-w-3xl">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="flex flex-col items-center text-center gap-8 py-16"
      >
        <div className="w-16 h-16 rounded-2xl bg-[hsl(var(--sidebar-primary))]/10 flex items-center justify-center">
          <LayoutTemplate className="w-8 h-8 text-[hsl(var(--sidebar-primary))]" />
        </div>

        <div className="flex flex-col gap-3 max-w-md">
          <div className="flex items-center justify-center gap-2">
            <h1 className="text-3xl font-bold tracking-tight">Slides</h1>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-[hsl(var(--sidebar-primary))]/10 text-[hsl(var(--sidebar-primary))]">
              Coming Soon
            </span>
          </div>
          <p className="text-muted-foreground text-base leading-relaxed">
            AI-powered presentation builder. Create beautiful pitch decks,
            workshop slides, and client presentations — all branded and
            generated from your business context.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full max-w-lg text-left">
          {[
            { title: "Pitch Decks", desc: "Investor-ready presentations in minutes" },
            { title: "Workshop Slides", desc: "Training content for your programs" },
            { title: "Client Proposals", desc: "Branded proposals that close deals" },
          ].map((item) => (
            <div
              key={item.title}
              className="glass-card p-4 flex flex-col gap-1.5"
            >
              <Sparkles className="w-4 h-4 text-[hsl(var(--sidebar-primary))]" />
              <p className="text-sm font-semibold">{item.title}</p>
              <p className="text-xs text-muted-foreground">{item.desc}</p>
            </div>
          ))}
        </div>

        <Button variant="outline" className="gap-2" disabled>
          Notify me when ready <ArrowRight className="w-4 h-4" />
        </Button>
      </motion.div>
    </div>
  );
}
