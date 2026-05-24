import { createFileRoute } from "@tanstack/react-router";
import * as React from "react";
import { RequireAuth } from "@/components/AppShell";
import { Star, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/feedback")({ component: Feedback });

function Feedback() {
  const [rating, setRating] = React.useState(0);
  const [hover, setHover] = React.useState(0);
  const [comment, setComment] = React.useState("");
  const [submitted, setSubmitted] = React.useState(false);

  const labels = ["", "Poor", "Fair", "Good", "Great", "Excellent"];

  const submit = () => {
    if (!rating) return;
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setRating(0);
      setComment("");
    }, 2400);
  };

  return (
    <RequireAuth>
      <div>
        <div className="text-[11px] uppercase tracking-[0.25em] text-muted-foreground">Feedback</div>
        <h1 className="mt-2 text-3xl sm:text-4xl font-semibold tracking-tight">How are we doing?</h1>
        <p className="mt-2 text-sm text-muted-foreground max-w-xl">
          Your honest feedback shapes the roadmap. Give us a star rating and tell us what to build next.
        </p>

        <div className="mt-8 rounded-2xl border border-border bg-card p-7 sm:p-10">
          <div className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">Your rating</div>
          <div className="mt-4 flex items-center gap-2">
            {[1, 2, 3, 4, 5].map((n) => {
              const active = (hover || rating) >= n;
              return (
                <button
                  key={n}
                  onMouseEnter={() => setHover(n)}
                  onMouseLeave={() => setHover(0)}
                  onClick={() => setRating(n)}
                  className="p-1 transition hover:scale-110"
                  aria-label={`${n} stars`}
                >
                  <Star
                    className={cn(
                      "h-9 w-9 transition",
                      active ? "fill-foreground text-foreground" : "text-muted-foreground/40",
                    )}
                  />
                </button>
              );
            })}
            <span className="ml-3 text-sm text-muted-foreground">
              {hover ? labels[hover] : rating ? labels[rating] : "Tap to rate"}
            </span>
          </div>

          <div className="mt-8">
            <label className="block text-[11px] uppercase tracking-[0.2em] text-muted-foreground mb-2">
              Your comments
            </label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={5}
              placeholder="Tell us what's working, what's not, what you'd love to see…"
              className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none"
            />
          </div>

          <div className="mt-6 flex items-center gap-4">
            <button
              onClick={submit}
              disabled={!rating || submitted}
              className="h-11 px-6 rounded-xl bg-foreground text-background text-sm font-medium disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {submitted ? "Sent ✓" : "Submit feedback"}
            </button>
            {submitted && (
              <div className="inline-flex items-center gap-2 text-sm text-muted-foreground">
                <CheckCircle2 className="h-4 w-4" /> Thanks — we read every word.
              </div>
            )}
          </div>
        </div>
      </div>
    </RequireAuth>
  );
}