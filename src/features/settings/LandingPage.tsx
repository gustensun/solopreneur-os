import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Sparkles,
  Brain,
  Users,
  BookOpen,
  TrendingUp,
  Zap,
  ArrowRight,
  CheckCircle2,
  Target,
  Layers,
} from "lucide-react";

// ─── Feature data ─────────────────────────────────────────────────────────────

const FEATURES = [
  {
    icon: Brain,
    title: "AI-Powered Brain",
    description:
      "Upload your knowledge, brand voice, and resources. Let AI remember everything so you don't have to.",
    color: "bg-emerald-50 text-emerald-700",
  },
  {
    icon: Target,
    title: "Niche & Offer Builder",
    description:
      "Craft a crystal-clear niche statement and irresistible offer stack using proven frameworks.",
    color: "bg-blue-50 text-blue-700",
  },
  {
    icon: TrendingUp,
    title: "Income Streams",
    description:
      "Track every revenue stream—coaching, courses, affiliates—and see your path to $10k months.",
    color: "bg-purple-50 text-purple-700",
  },
  {
    icon: Users,
    title: "Client CRM",
    description:
      "Manage your entire client pipeline from lead to loyal advocate with a beautiful Kanban board.",
    color: "bg-amber-50 text-amber-700",
  },
  {
    icon: BookOpen,
    title: "Academy & Program Builder",
    description:
      "Create and deliver your signature course or coaching program with structured phases and lessons.",
    color: "bg-rose-50 text-rose-700",
  },
  {
    icon: Layers,
    title: "Content System",
    description:
      "Build your content pillars, generate AI copy, and maintain a consistent publishing cadence.",
    color: "bg-cyan-50 text-cyan-700",
  },
];

const PROOF_POINTS = [
  "Build your AI business system in days, not months",
  "Replace 10+ tools with one focused OS",
  "Your data stays local — always private",
];

// ─── Animation variants ───────────────────────────────────────────────────────

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.5, ease: [0, 0, 0.58, 1] as const },
  }),
};

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Nav */}
      <nav className="flex items-center justify-between px-6 sm:px-10 py-4 border-b border-border/50">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
            <Sparkles className="h-4 w-4 text-primary-foreground" />
          </div>
          <span className="font-semibold text-sm">Solopreneur OS</span>
        </div>
        <div className="flex items-center gap-3">
          <Link
            to="/ai-chat"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Open App
          </Link>
          <Link
            to="/auth"
            className="inline-flex items-center justify-center rounded-lg bg-primary text-primary-foreground px-4 py-2 text-sm font-medium hover:bg-primary/90 transition-colors"
          >
            Get Started
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="flex-1 flex flex-col items-center justify-center px-4 py-16 sm:py-24 text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-semibold mb-6 border border-primary/20"
        >
          <Zap className="h-3.5 w-3.5" />
          AI-Powered Business OS for Solopreneurs
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.6 }}
          className="text-4xl sm:text-5xl lg:text-6xl font-semibold tracking-tight max-w-3xl mb-5 leading-[1.15]"
        >
          Build your new{" "}
          <span className="text-primary">AI Solopreneur</span>{" "}
          business — faster than ever
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="text-lg text-muted-foreground max-w-2xl mb-8 leading-relaxed"
        >
          Your all-in-one operating system to manage clients, build courses, create
          content, and scale your income — powered by AI and built for one-person businesses.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="flex flex-col sm:flex-row items-center gap-3 mb-10"
        >
          <Link
            to="/auth"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary text-primary-foreground px-8 py-3 text-sm font-semibold hover:bg-primary/90 transition-all hover:shadow-lg hover:shadow-primary/20 hover:-translate-y-0.5"
          >
            Get Started Free
            <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            to="/ai-chat"
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-border px-6 py-3 text-sm font-medium hover:bg-muted transition-colors"
          >
            <Sparkles className="h-4 w-4" />
            Open App
          </Link>
        </motion.div>

        {/* Proof points */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6"
        >
          {PROOF_POINTS.map((point) => (
            <div key={point} className="flex items-center gap-2 text-sm text-muted-foreground">
              <CheckCircle2 className="h-4 w-4 text-primary flex-shrink-0" />
              {point}
            </div>
          ))}
        </motion.div>
      </section>

      {/* Features */}
      <section className="px-4 sm:px-6 lg:px-8 py-16 max-w-6xl mx-auto w-full">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight mb-3">
            Everything you need to run your business
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Six powerful modules, one unified workspace. No more juggling multiple subscriptions.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {FEATURES.map((feature, i) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={feature.title}
                custom={i}
                variants={fadeUp}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                className="glass-card p-5 hover-lift group"
              >
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${feature.color}`}
                >
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="font-semibold mb-1.5 group-hover:text-primary transition-colors">
                  {feature.title}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* CTA Banner */}
      <section className="px-4 sm:px-6 lg:px-8 py-16 max-w-6xl mx-auto w-full">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="rounded-2xl bg-primary p-8 sm:p-12 text-center text-primary-foreground"
        >
          <Sparkles className="h-8 w-8 mx-auto mb-4 opacity-80" />
          <h2 className="text-2xl sm:text-3xl font-semibold mb-3">
            Ready to build your AI business?
          </h2>
          <p className="text-primary-foreground/70 mb-8 max-w-md mx-auto">
            Join the next wave of solopreneurs building profitable, AI-powered businesses on their own terms.
          </p>
          <Link
            to="/auth"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary-foreground text-primary px-8 py-3 text-sm font-semibold hover:bg-primary-foreground/90 transition-colors"
          >
            Get Started — It's Free
            <ArrowRight className="h-4 w-4" />
          </Link>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/50 px-6 py-6 text-center">
        <p className="text-xs text-muted-foreground">
          © 2026 Solopreneur OS · Built by{" "}
          <span className="font-medium text-foreground">Gusten Sun</span>
        </p>
      </footer>
    </div>
  );
}
