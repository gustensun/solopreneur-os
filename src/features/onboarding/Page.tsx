import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle, ArrowRight, Leaf } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useUserStore } from "@/stores/user";
import { useNicheStore } from "@/stores/niche";
import { useOfferStore } from "@/stores/offer";
import { useContextStore } from "@/stores/context";

const TOTAL_STEPS = 5;

// ─── Progress Bar ────────────────────────────────────────────────────────────

function ProgressBar({ step }: { step: number }) {
  return (
    <div className="flex items-center gap-2">
      {Array.from({ length: TOTAL_STEPS }, (_, i) => (
        <div key={i} className="flex items-center gap-2">
          <div
            className={[
              "h-2 rounded-full transition-all duration-500",
              i + 1 === step
                ? "w-8 bg-[hsl(var(--sidebar-primary))]"
                : i + 1 < step
                ? "w-4 bg-[hsl(var(--sidebar-primary))]/60"
                : "w-4 bg-border",
            ].join(" ")}
          />
        </div>
      ))}
      <span className="text-xs text-muted-foreground ml-1">
        {step} / {TOTAL_STEPS}
      </span>
    </div>
  );
}

// ─── Context Score Ring ───────────────────────────────────────────────────────

function ContextRing({ score }: { score: number }) {
  const radius = 38;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  return (
    <div className="relative w-28 h-28 mx-auto">
      <svg className="w-full h-full -rotate-90" viewBox="0 0 96 96">
        <circle
          cx="48"
          cy="48"
          r={radius}
          fill="none"
          stroke="hsl(var(--border))"
          strokeWidth="8"
        />
        <circle
          cx="48"
          cy="48"
          r={radius}
          fill="none"
          stroke="hsl(var(--sidebar-primary))"
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="transition-all duration-1000"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-2xl font-bold text-foreground">{score}%</span>
        <span className="text-xs text-muted-foreground">Context</span>
      </div>
    </div>
  );
}

// ─── Step variants for Framer Motion ─────────────────────────────────────────

const stepVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 60 : -60,
    opacity: 0,
  }),
  center: { x: 0, opacity: 1 },
  exit: (direction: number) => ({
    x: direction > 0 ? -60 : 60,
    opacity: 0,
  }),
};

const stepTransition = { duration: 0.28, ease: "easeInOut" as const };

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function OnboardingPage() {
  const navigate = useNavigate();

  // Stores
  const { user, updateProfile, completeOnboarding } = useUserStore();
  const { niche, updateNiche } = useNicheStore();
  const { offer, updateOffer } = useOfferStore();
  const getContextScore = useContextStore((s) => s.getContextScore);

  // Step state
  const [step, setStep] = useState(1);
  const [direction, setDirection] = useState(1);

  // Step 2 — Profile
  const [name, setName] = useState(user.name || "");
  const [email, setEmail] = useState(user.email || "");
  const [goal, setGoal] = useState("");

  // Step 3 — Niche
  const [group, setGroup] = useState(niche.group || "");
  const [outcome, setOutcome] = useState(niche.outcome || "");
  const [benefit, setBenefit] = useState(niche.benefit || "");
  const [pain, setPain] = useState(niche.pain || "");

  // Step 4 — Offer
  const [offerName, setOfferName] = useState(offer.name || "");
  const [offerPrice, setOfferPrice] = useState(offer.price || "");
  const [offerTransformation, setOfferTransformation] = useState(
    offer.clearOutcome || ""
  );

  function go(next: number) {
    setDirection(next > step ? 1 : -1);
    setStep(next);
  }

  function handleProfileNext() {
    updateProfile({ name, email });
    go(3);
  }

  function handleNicheNext() {
    updateNiche({ group, outcome, benefit, pain });
    go(4);
  }

  function handleOfferNext() {
    updateOffer({ name: offerName, price: offerPrice, clearOutcome: offerTransformation });
    go(5);
  }

  function handleFinish() {
    completeOnboarding();
    navigate("/dashboard");
  }

  const contextScore = step === 5 ? getContextScore() : 0;

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ background: "hsl(var(--background))" }}
    >
      {/* Top bar */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-border/50">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-[hsl(var(--sidebar-primary))]/15 flex items-center justify-center">
            <Leaf className="w-4 h-4 text-[hsl(var(--sidebar-primary))]" />
          </div>
          <span className="font-semibold text-sm">Solopreneur OS</span>
        </div>
        <ProgressBar step={step} />
      </div>

      {/* Content area */}
      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-lg">
          <AnimatePresence mode="wait" custom={direction}>
            {step === 1 && (
              <motion.div
                key="step-1"
                custom={direction}
                variants={stepVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={stepTransition}
                className="flex flex-col items-center text-center gap-8"
              >
                <div className="w-20 h-20 rounded-2xl bg-[hsl(var(--sidebar-primary))]/12 flex items-center justify-center">
                  <Leaf className="w-10 h-10 text-[hsl(var(--sidebar-primary))]" />
                </div>
                <div className="flex flex-col gap-3">
                  <h1 className="text-3xl font-bold tracking-tight">
                    Welcome to Solopreneur OS
                  </h1>
                  <p className="text-muted-foreground text-base leading-relaxed max-w-sm mx-auto">
                    Let&apos;s set up your AI business brain in 5 minutes. The more context you give, the smarter your AI gets.
                  </p>
                </div>
                <div className="flex flex-col gap-3 w-full max-w-xs">
                  <Button
                    size="lg"
                    className="w-full gap-2"
                    onClick={() => go(2)}
                  >
                    Let&apos;s Go <ArrowRight className="w-4 h-4" />
                  </Button>
                </div>
                <div className="flex items-center gap-6 text-center">
                  {["Niche", "Offer", "Avatar", "Skills"].map((item) => (
                    <div key={item} className="flex flex-col items-center gap-1">
                      <div className="w-2 h-2 rounded-full bg-[hsl(var(--sidebar-primary))]/40" />
                      <span className="text-xs text-muted-foreground">{item}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                key="step-2"
                custom={direction}
                variants={stepVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={stepTransition}
                className="flex flex-col gap-8"
              >
                <div>
                  <p className="text-xs font-medium text-[hsl(var(--sidebar-primary))] uppercase tracking-widest mb-2">
                    Step 1 of 4
                  </p>
                  <h2 className="text-2xl font-bold">Your Profile</h2>
                  <p className="text-muted-foreground text-sm mt-1">
                    Tell us a bit about yourself.
                  </p>
                </div>

                <div className="flex flex-col gap-4">
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="ob-name">Full Name</Label>
                    <Input
                      id="ob-name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Gusten Sun"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="ob-email">Email</Label>
                    <Input
                      id="ob-email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="ob-goal">What&apos;s your biggest goal right now?</Label>
                    <Textarea
                      id="ob-goal"
                      value={goal}
                      onChange={(e) => setGoal(e.target.value)}
                      placeholder="e.g. Hit $10k/month by December using AI to grow my coaching business"
                      className="resize-none min-h-[90px]"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Button variant="outline" onClick={() => go(1)} className="flex-1">
                    Back
                  </Button>
                  <Button onClick={handleProfileNext} className="flex-1 gap-1">
                    Next <ArrowRight className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div
                key="step-3"
                custom={direction}
                variants={stepVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={stepTransition}
                className="flex flex-col gap-8"
              >
                <div>
                  <p className="text-xs font-medium text-[hsl(var(--sidebar-primary))] uppercase tracking-widest mb-2">
                    Step 2 of 4
                  </p>
                  <h2 className="text-2xl font-bold">Who do you help?</h2>
                  <p className="text-muted-foreground text-sm mt-1">
                    This becomes your niche statement — the foundation of all your AI outputs.
                  </p>
                </div>

                <div className="flex flex-col gap-4">
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="ob-group">I help…</Label>
                    <Input
                      id="ob-group"
                      value={group}
                      onChange={(e) => setGroup(e.target.value)}
                      placeholder="e.g. solopreneurs and coaches"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="ob-outcome">…to achieve…</Label>
                    <Input
                      id="ob-outcome"
                      value={outcome}
                      onChange={(e) => setOutcome(e.target.value)}
                      placeholder="e.g. build a 6-figure online business using AI"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="ob-benefit">…so they can…</Label>
                    <Input
                      id="ob-benefit"
                      value={benefit}
                      onChange={(e) => setBenefit(e.target.value)}
                      placeholder="e.g. work from anywhere with full time and financial freedom"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="ob-pain">…without having to…</Label>
                    <Input
                      id="ob-pain"
                      value={pain}
                      onChange={(e) => setPain(e.target.value)}
                      placeholder="e.g. spend years figuring it out through trial and error"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Button variant="outline" onClick={() => go(2)} className="flex-1">
                    Back
                  </Button>
                  <Button onClick={handleNicheNext} className="flex-1 gap-1">
                    Next <ArrowRight className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </motion.div>
            )}

            {step === 4 && (
              <motion.div
                key="step-4"
                custom={direction}
                variants={stepVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={stepTransition}
                className="flex flex-col gap-8"
              >
                <div>
                  <p className="text-xs font-medium text-[hsl(var(--sidebar-primary))] uppercase tracking-widest mb-2">
                    Step 3 of 4
                  </p>
                  <h2 className="text-2xl font-bold">What do you sell?</h2>
                  <p className="text-muted-foreground text-sm mt-1">
                    Your core offer — what you charge money for.
                  </p>
                </div>

                <div className="flex flex-col gap-4">
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="ob-offer-name">Offer Name</Label>
                    <Input
                      id="ob-offer-name"
                      value={offerName}
                      onChange={(e) => setOfferName(e.target.value)}
                      placeholder="e.g. AI Business Accelerator"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="ob-price">Price ($)</Label>
                    <Input
                      id="ob-price"
                      value={offerPrice}
                      onChange={(e) => setOfferPrice(e.target.value)}
                      placeholder="e.g. 5000"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="ob-transformation">
                      Transformation (1 sentence — what do they get?)
                    </Label>
                    <Textarea
                      id="ob-transformation"
                      value={offerTransformation}
                      onChange={(e) => setOfferTransformation(e.target.value)}
                      placeholder="e.g. Go from 0 to $10k/month in 90 days using AI-powered business systems"
                      className="resize-none min-h-[80px]"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Button variant="outline" onClick={() => go(3)} className="flex-1">
                    Back
                  </Button>
                  <Button onClick={handleOfferNext} className="flex-1 gap-1">
                    Next <ArrowRight className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </motion.div>
            )}

            {step === 5 && (
              <motion.div
                key="step-5"
                custom={direction}
                variants={stepVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={stepTransition}
                className="flex flex-col items-center text-center gap-8"
              >
                <div className="flex flex-col items-center gap-3">
                  <h2 className="text-3xl font-bold">Your AI brain is ready 🎉</h2>
                  <p className="text-muted-foreground text-sm max-w-sm">
                    You&apos;ve given your AI the context it needs to help you build your business faster.
                  </p>
                </div>

                <ContextRing score={contextScore} />

                <div className="w-full max-w-sm flex flex-col gap-2.5 text-left">
                  {[
                    { label: "Profile saved", done: !!(name || user.name) },
                    { label: "Niche statement set", done: !!(group || niche.group) },
                    { label: "Core offer defined", done: !!(offerName || offer.name) },
                  ].map(({ label, done }) => (
                    <div key={label} className="flex items-center gap-3">
                      <div
                        className={[
                          "w-5 h-5 rounded-full flex items-center justify-center shrink-0",
                          done
                            ? "bg-[hsl(var(--sidebar-primary))]/15"
                            : "bg-muted",
                        ].join(" ")}
                      >
                        <CheckCircle
                          className={[
                            "w-3.5 h-3.5",
                            done
                              ? "text-[hsl(var(--sidebar-primary))]"
                              : "text-muted-foreground/40",
                          ].join(" ")}
                        />
                      </div>
                      <span
                        className={[
                          "text-sm",
                          done ? "text-foreground font-medium" : "text-muted-foreground",
                        ].join(" ")}
                      >
                        {label}
                      </span>
                    </div>
                  ))}
                </div>

                <Button
                  size="lg"
                  className="w-full max-w-xs gap-2"
                  onClick={handleFinish}
                >
                  Enter Your OS <ArrowRight className="w-4 h-4" />
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
