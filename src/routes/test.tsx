import { createFileRoute, useRouter } from "@tanstack/react-router";
import * as React from "react";
import { RequireAuth } from "@/components/AppShell";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import {
  Clock, ChevronLeft, ChevronRight, Send, CheckCircle2, XCircle,
  Sparkles, RotateCcw, Trophy,
} from "lucide-react";

export const Route = createFileRoute("/test")({ component: Test });

type Question = {
  q: string;
  options: string[];
  correct: number;
};

type Config = {
  fileName: string;
  exam: string;
  count: number;
  difficulty: string;
  startedAt: number;
};

const EXAM_LABEL: Record<string, string> = { jee: "JEE", neet: "NEET", cbse: "CBSE" };

function generateQuestions(cfg: Config): Question[] {
  const stems = [
    "Which of the following statements best describes the concept?",
    "Identify the correct relationship between the variables.",
    "What is the most accurate definition of the term?",
    "Which option correctly applies the principle?",
    "Select the statement that is logically consistent.",
    "Which case satisfies all of the conditions?",
    "What is the expected outcome of the process?",
    "Pick the option that does NOT belong to the set.",
    "Which derivation correctly leads to the result?",
    "Choose the option that aligns with the standard model.",
  ];
  return Array.from({ length: cfg.count }).map((_, i) => ({
    q: `Q${i + 1}. ${stems[i % stems.length]} (${EXAM_LABEL[cfg.exam] ?? cfg.exam} · ${cfg.difficulty})`,
    options: ["Statement A", "Statement B", "Statement C", "Statement D"],
    correct: (i * 3 + 1) % 4,
  }));
}

function Test() {
  return (
    <RequireAuth>
      <TestInner />
    </RequireAuth>
  );
}

function TestInner() {
  const router = useRouter();
  const [cfg, setCfg] = React.useState<Config | null>(null);
  const [questions, setQuestions] = React.useState<Question[]>([]);
  const [answers, setAnswers] = React.useState<Record<number, number>>({});
  const [cur, setCur] = React.useState(0);
  const [submitted, setSubmitted] = React.useState(false);
  const [secondsLeft, setSecondsLeft] = React.useState(0);

  // Load config + questions + saved progress
  React.useEffect(() => {
    const raw = sessionStorage.getItem("prepzo.test.config");
    if (!raw) {
      router.navigate({ to: "/dashboard" });
      return;
    }
    const c: Config = JSON.parse(raw);
    setCfg(c);
    setQuestions(generateQuestions(c));
    setSecondsLeft(c.count * 60);
    const saved = localStorage.getItem("prepzo.test.progress");
    if (saved) {
      try {
        const p = JSON.parse(saved);
        if (p.startedAt === c.startedAt) {
          setAnswers(p.answers ?? {});
          setCur(p.cur ?? 0);
        }
      } catch {}
    }
  }, [router]);

  // Autosave
  React.useEffect(() => {
    if (!cfg) return;
    localStorage.setItem(
      "prepzo.test.progress",
      JSON.stringify({ startedAt: cfg.startedAt, answers, cur }),
    );
  }, [answers, cur, cfg]);

  // Timer
  React.useEffect(() => {
    if (!cfg || submitted) return;
    const iv = setInterval(() => {
      setSecondsLeft((s) => {
        if (s <= 1) {
          clearInterval(iv);
          handleSubmit(true);
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(iv);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cfg, submitted]);

  const handleSubmit = (auto = false) => {
    setSubmitted(true);
    if (!cfg) return;
    const correct = questions.reduce(
      (acc, q, i) => acc + (answers[i] === q.correct ? 1 : 0),
      0,
    );
    const record = {
      id: cfg.startedAt,
      fileName: cfg.fileName,
      exam: cfg.exam,
      difficulty: cfg.difficulty,
      total: questions.length,
      correct,
      attempted: Object.keys(answers).length,
      finishedAt: Date.now(),
    };
    try {
      const prev = JSON.parse(localStorage.getItem("prepzo.tests.history") ?? "[]");
      localStorage.setItem(
        "prepzo.tests.history",
        JSON.stringify([record, ...prev].slice(0, 25)),
      );
    } catch {}
    localStorage.removeItem("prepzo.test.progress");
    toast.success(auto ? "Time's up — test submitted." : "Test submitted successfully.");
  };

  if (!cfg) return null;

  if (submitted) {
    return <Results cfg={cfg} questions={questions} answers={answers} />;
  }

  const mm = String(Math.floor(secondsLeft / 60)).padStart(2, "0");
  const ss = String(secondsLeft % 60).padStart(2, "0");
  const lowTime = secondsLeft < 60;
  const q = questions[cur];

  return (
    <div>
      {/* Header */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="text-[11px] uppercase tracking-[0.25em] text-muted-foreground">
            Mock Test · {EXAM_LABEL[cfg.exam] ?? cfg.exam}
          </div>
          <h1 className="mt-1.5 text-2xl sm:text-3xl font-semibold tracking-tight truncate max-w-md">
            {cfg.fileName}
          </h1>
        </div>
        <div
          className={cn(
            "flex items-center gap-2 rounded-full border px-4 py-2 font-mono text-sm tabular-nums",
            lowTime
              ? "border-destructive/40 bg-destructive/10 text-destructive"
              : "border-border bg-card",
          )}
        >
          <Clock className="h-4 w-4" /> {mm}:{ss}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_260px] gap-6">
        {/* Question card */}
        <div className="rounded-3xl border border-border bg-card p-6 sm:p-8">
          <div className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
            Question {cur + 1} of {questions.length}
          </div>
          <h2 className="mt-2 text-lg sm:text-xl font-medium leading-relaxed">{q.q}</h2>

          <div className="mt-6 space-y-2.5">
            {q.options.map((opt, i) => {
              const selected = answers[cur] === i;
              return (
                <button
                  key={i}
                  onClick={() => setAnswers((a) => ({ ...a, [cur]: i }))}
                  className={cn(
                    "w-full text-left flex items-center gap-3 rounded-2xl border px-4 py-3.5 transition",
                    selected
                      ? "border-foreground bg-foreground text-background"
                      : "border-border bg-background hover:bg-accent/60",
                  )}
                >
                  <span
                    className={cn(
                      "h-7 w-7 shrink-0 rounded-full border flex items-center justify-center text-xs font-semibold",
                      selected ? "border-background/40" : "border-border",
                    )}
                  >
                    {String.fromCharCode(65 + i)}
                  </span>
                  <span className="text-sm">{opt}</span>
                </button>
              );
            })}
          </div>

          <div className="mt-7 flex items-center justify-between">
            <button
              onClick={() => setCur((c) => Math.max(0, c - 1))}
              disabled={cur === 0}
              className="inline-flex items-center gap-1.5 h-10 px-4 rounded-xl border border-border bg-background hover:bg-accent text-sm font-medium disabled:opacity-40"
            >
              <ChevronLeft className="h-4 w-4" /> Previous
            </button>
            {cur < questions.length - 1 ? (
              <button
                onClick={() => setCur((c) => Math.min(questions.length - 1, c + 1))}
                className="inline-flex items-center gap-1.5 h-10 px-4 rounded-xl bg-foreground text-background hover:bg-foreground/90 text-sm font-medium"
              >
                Next <ChevronRight className="h-4 w-4" />
              </button>
            ) : (
              <button
                onClick={() => handleSubmit(false)}
                className="inline-flex items-center gap-1.5 h-10 px-5 rounded-xl bg-foreground text-background hover:bg-foreground/90 text-sm font-medium"
              >
                <Send className="h-4 w-4" /> Submit Test
              </button>
            )}
          </div>
        </div>

        {/* Palette */}
        <aside className="rounded-3xl border border-border bg-card p-5 h-fit lg:sticky lg:top-24">
          <div className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground mb-3">
            Question Palette
          </div>
          <div className="grid grid-cols-6 lg:grid-cols-5 gap-2">
            {questions.map((_, i) => {
              const answered = answers[i] !== undefined;
              const active = i === cur;
              return (
                <button
                  key={i}
                  onClick={() => setCur(i)}
                  className={cn(
                    "h-9 rounded-lg text-xs font-semibold transition border",
                    active
                      ? "bg-foreground text-background border-foreground"
                      : answered
                        ? "bg-foreground/15 border-foreground/30"
                        : "bg-background border-border hover:bg-accent",
                  )}
                >
                  {i + 1}
                </button>
              );
            })}
          </div>
          <div className="mt-4 space-y-1.5 text-[11px] text-muted-foreground">
            <Legend swatch="bg-foreground" label="Current" />
            <Legend swatch="bg-foreground/20" label={`Answered (${Object.keys(answers).length})`} />
            <Legend swatch="bg-background border border-border" label="Not visited" />
          </div>
          <button
            onClick={() => handleSubmit(false)}
            className="mt-5 w-full inline-flex items-center justify-center gap-1.5 h-10 rounded-xl bg-foreground text-background hover:bg-foreground/90 text-sm font-medium"
          >
            <Send className="h-4 w-4" /> Submit Test
          </button>
        </aside>
      </div>
    </div>
  );
}

function Legend({ swatch, label }: { swatch: string; label: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className={cn("h-3 w-3 rounded", swatch)} />
      {label}
    </div>
  );
}

function Results({
  cfg, questions, answers,
}: { cfg: Config; questions: Question[]; answers: Record<number, number> }) {
  const router = useRouter();
  const correct = questions.reduce(
    (a, q, i) => a + (answers[i] === q.correct ? 1 : 0), 0,
  );
  const incorrect = questions.reduce(
    (a, q, i) => a + (answers[i] !== undefined && answers[i] !== q.correct ? 1 : 0), 0,
  );
  const unattempted = questions.length - correct - incorrect;
  const accuracy = questions.length ? Math.round((correct / questions.length) * 100) : 0;

  const feedback =
    accuracy >= 80 ? "Outstanding. You're exam-ready."
    : accuracy >= 60 ? "Solid attempt. Sharpen the weak spots."
    : accuracy >= 40 ? "Decent baseline. Review and try again."
    : "Early days — every rep counts. Keep going.";

  return (
    <div className="animate-fade-up">
      <div className="mb-8 text-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-border glass px-3 py-1 text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
          <Trophy className="h-3 w-3" /> Result
        </div>
        <h1 className="mt-3 text-3xl sm:text-4xl font-semibold tracking-tight">
          {accuracy}% Accuracy
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">{feedback}</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <StatCard icon={<CheckCircle2 className="h-4 w-4" />} label="Correct" value={correct} tone="ok" />
        <StatCard icon={<XCircle className="h-4 w-4" />} label="Incorrect" value={incorrect} tone="bad" />
        <StatCard icon={<Sparkles className="h-4 w-4" />} label="Unattempted" value={unattempted} />
      </div>

      {/* Bar chart */}
      <div className="rounded-3xl border border-border bg-card p-6 sm:p-7">
        <div className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground mb-4">
          Performance Breakdown
        </div>
        <Bar label="Correct" value={correct} total={questions.length} />
        <Bar label="Incorrect" value={incorrect} total={questions.length} dest />
        <Bar label="Unattempted" value={unattempted} total={questions.length} muted />
      </div>

      <div className="mt-8 flex flex-wrap gap-3">
        <button
          onClick={() => {
            sessionStorage.removeItem("prepzo.test.config");
            router.navigate({ to: "/dashboard" });
          }}
          className="inline-flex items-center gap-2 h-11 px-5 rounded-xl bg-foreground text-background hover:bg-foreground/90 text-sm font-medium"
        >
          <RotateCcw className="h-4 w-4" /> New Test
        </button>
        <button
          onClick={() => router.navigate({ to: "/tests" })}
          className="inline-flex items-center gap-2 h-11 px-5 rounded-xl border border-border bg-background hover:bg-accent text-sm font-medium"
        >
          View My Tests
        </button>
      </div>

      <div className="mt-4 text-[11px] text-muted-foreground">
        {cfg.fileName} · {EXAM_LABEL[cfg.exam] ?? cfg.exam} · {cfg.difficulty}
      </div>
    </div>
  );
}

function StatCard({
  icon, label, value, tone,
}: { icon: React.ReactNode; label: string; value: number; tone?: "ok" | "bad" }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <div className={cn(
        "inline-flex items-center gap-1.5 text-[11px] uppercase tracking-[0.2em]",
        tone === "bad" ? "text-destructive" : "text-muted-foreground",
      )}>
        {icon} {label}
      </div>
      <div className="mt-2 text-3xl font-semibold tabular-nums">{value}</div>
    </div>
  );
}

function Bar({
  label, value, total, dest, muted,
}: { label: string; value: number; total: number; dest?: boolean; muted?: boolean }) {
  const pct = total ? (value / total) * 100 : 0;
  return (
    <div className="mb-4 last:mb-0">
      <div className="flex justify-between text-xs mb-1.5">
        <span className={cn("font-medium", dest && "text-destructive")}>{label}</span>
        <span className="text-muted-foreground tabular-nums">{value} / {total}</span>
      </div>
      <div className="h-2 rounded-full bg-foreground/10 overflow-hidden">
        <div
          className={cn(
            "h-full transition-all duration-700",
            dest ? "bg-destructive" : muted ? "bg-foreground/30" : "bg-foreground",
          )}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}