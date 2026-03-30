import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  CheckCircle2,
  ClipboardList,
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useQuizStore, QUIZ_QUESTIONS } from "@/stores/quiz";
import { cn } from "@/lib/utils";

// ─── Slide variants ───────────────────────────────────────────────────────────

const slideVariants = {
  enter: (dir: number) => ({
    x: dir > 0 ? 40 : -40,
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
  },
  exit: (dir: number) => ({
    x: dir > 0 ? -40 : 40,
    opacity: 0,
  }),
};

// ─── Category colors ──────────────────────────────────────────────────────────

const CATEGORY_COLORS: Record<string, string> = {
  revenue: "text-green-600 bg-green-50",
  model: "text-blue-600 bg-blue-50",
  challenge: "text-red-600 bg-red-50",
  audience: "text-purple-600 bg-purple-50",
  "ai-usage": "text-cyan-600 bg-cyan-50",
  goal: "text-amber-600 bg-amber-50",
};

// ─── Results page ─────────────────────────────────────────────────────────────

function ResultsPage({ onRetake }: { onRetake: () => void }) {
  const { result, answers } = useQuizStore();

  if (!result) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="flex flex-col items-center w-full max-w-2xl mx-auto"
    >
      {/* Success badge */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.1 }}
        className="flex items-center justify-center h-16 w-16 rounded-full bg-primary/10 mb-4"
      >
        <CheckCircle2 className="h-8 w-8 text-primary" />
      </motion.div>

      <h2 className="text-2xl font-semibold mb-1 text-center">Your Business Analysis</h2>
      <p className="text-muted-foreground text-center mb-8">
        Based on your {QUIZ_QUESTIONS.length} answers, here's your personalised diagnosis.
      </p>

      {/* Analysis card */}
      <div className="glass-card p-6 sm:p-8 w-full mb-6 prose prose-sm max-w-none prose-headings:font-semibold prose-headings:text-foreground prose-p:text-foreground/80 prose-strong:text-foreground prose-li:text-foreground/80">
        <ReactMarkdown>{result.analysis}</ReactMarkdown>
      </div>

      {/* Answer summary */}
      <div className="w-full mb-8">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-3">
          Your Answers
        </h3>
        <div className="space-y-2">
          {QUIZ_QUESTIONS.map((q, idx) => {
            const ans = answers.find((a) => a.questionId === q.id);
            const option = q.options.find((o) => o.value === ans?.answer);
            const colorClass = CATEGORY_COLORS[q.category] ?? "text-primary bg-primary/10";

            return (
              <div
                key={q.id}
                className="glass-card px-4 py-3 flex items-start gap-3"
              >
                <span
                  className={cn(
                    "mt-0.5 shrink-0 h-5 w-5 rounded-full flex items-center justify-center text-[10px] font-bold",
                    colorClass
                  )}
                >
                  {idx + 1}
                </span>
                <div className="min-w-0">
                  <p className="text-xs font-medium text-muted-foreground mb-0.5 truncate">
                    {q.text}
                  </p>
                  <p className="text-sm font-medium">
                    {option?.text ?? <span className="text-muted-foreground italic">No answer</span>}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <Button onClick={onRetake} variant="outline" size="lg">
        <RotateCcw className="h-4 w-4" />
        Retake Quiz
      </Button>
    </motion.div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function BusinessQuizPage() {
  const {
    currentStep,
    answers,
    isCompleted,
    answerQuestion,
    nextStep,
    prevStep,
    resetQuiz,
  } = useQuizStore();

  const totalQuestions = QUIZ_QUESTIONS.length;
  const question = QUIZ_QUESTIONS[currentStep];
  const currentAnswer = answers.find((a) => a.questionId === question?.id)?.answer;
  const progress = isCompleted
    ? 100
    : Math.round((currentStep / totalQuestions) * 100);

  // Track direction for slide animation
  function handleNext() {
    nextStep();
  }

  function handlePrev() {
    prevStep();
  }

  if (isCompleted) {
    return (
      <div className="page-container flex flex-col items-center">
        <ResultsPage onRetake={resetQuiz} />
      </div>
    );
  }

  const colorClass = question
    ? CATEGORY_COLORS[question.category] ?? "text-primary bg-primary/10"
    : "";

  return (
    <div className="page-container flex flex-col items-center">
      {/* Page header */}
      <div className="w-full max-w-2xl mb-8">
        <div className="flex items-center gap-2 mb-1">
          <div className="p-1.5 rounded-lg bg-primary/10">
            <ClipboardList className="h-5 w-5 text-primary" />
          </div>
          <h1 className="page-title">Business Quiz</h1>
        </div>
        <p className="page-description">
          Answer {totalQuestions} quick questions to get your personalised strategy.
        </p>
      </div>

      {/* Progress */}
      <div className="w-full max-w-2xl mb-8">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium">
            Question{" "}
            <span className="text-primary font-semibold">{currentStep + 1}</span>
            {" "}of{" "}
            <span className="font-semibold">{totalQuestions}</span>
          </span>
          <span className="text-sm text-muted-foreground">{progress}%</span>
        </div>
        <Progress value={progress} className="h-2" />

        {/* Step dots */}
        <div className="flex items-center gap-1.5 mt-3">
          {QUIZ_QUESTIONS.map((q, idx) => {
            const answered = answers.some((a) => a.questionId === q.id);
            return (
              <div
                key={q.id}
                className={cn(
                  "h-1.5 rounded-full transition-all duration-300",
                  idx === currentStep
                    ? "bg-primary flex-[2]"
                    : answered
                    ? "bg-primary/40 flex-1"
                    : "bg-border flex-1"
                )}
              />
            );
          })}
        </div>
      </div>

      {/* Question card */}
      <div className="w-full max-w-2xl relative overflow-hidden">
        <AnimatePresence mode="wait" custom={1}>
          <motion.div
            key={currentStep}
            custom={1}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.25, ease: "easeInOut" }}
          >
            <div className="glass-card p-6 sm:p-8 mb-4">
              {/* Category badge */}
              <span
                className={cn(
                  "inline-block px-2.5 py-1 rounded-full text-xs font-semibold uppercase tracking-wider mb-4",
                  colorClass
                )}
              >
                {question.category.replace("-", " ")}
              </span>

              {/* Question text */}
              <h2 className="text-lg sm:text-xl font-semibold mb-6 leading-snug">
                {question.text}
              </h2>

              {/* Options */}
              <div className="flex flex-col gap-3">
                {question.options.map((option, oIdx) => {
                  const selected = currentAnswer === option.value;

                  return (
                    <motion.button
                      key={option.id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: oIdx * 0.05 }}
                      onClick={() => answerQuestion(question.id, option.value)}
                      className={cn(
                        "w-full text-left px-4 py-3.5 rounded-lg border-2 transition-all duration-150 flex items-center gap-3 group",
                        selected
                          ? "border-primary bg-primary/8 text-foreground"
                          : "border-border hover:border-primary/40 hover:bg-muted/40 text-foreground"
                      )}
                    >
                      <span
                        className={cn(
                          "h-6 w-6 shrink-0 rounded-full border-2 flex items-center justify-center text-xs font-bold transition-all",
                          selected
                            ? "border-primary bg-primary text-primary-foreground"
                            : "border-border text-muted-foreground group-hover:border-primary/60"
                        )}
                      >
                        {String.fromCharCode(65 + oIdx)}
                      </span>
                      <span className="text-sm font-medium leading-snug">
                        {option.text}
                      </span>
                      {selected && (
                        <motion.span
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="ml-auto shrink-0"
                        >
                          <CheckCircle2 className="h-4 w-4 text-primary" />
                        </motion.span>
                      )}
                    </motion.button>
                  );
                })}
              </div>
            </div>

            {/* Navigation */}
            <div className="flex items-center justify-between">
              <Button
                variant="outline"
                onClick={handlePrev}
                disabled={currentStep === 0}
              >
                <ChevronLeft className="h-4 w-4" />
                Back
              </Button>

              <Button
                onClick={handleNext}
                disabled={!currentAnswer}
                className={cn(!currentAnswer && "opacity-50")}
              >
                {currentStep === totalQuestions - 1 ? "See Results" : "Next"}
                {currentStep < totalQuestions - 1 && (
                  <ChevronRight className="h-4 w-4" />
                )}
              </Button>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
