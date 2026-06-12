import { createFileRoute, Link } from "@tanstack/react-router";
import * as React from "react";
import { RequireAuth } from "@/components/AppShell";
import { FileText, ArrowRight, ClipboardList } from "lucide-react";
import { useServerFn } from "@tanstack/react-start";
import { listMyTestAttempts, type TestHistoryItem } from "@/lib/tests.functions";

export const Route = createFileRoute("/tests")({ component: Tests });

type Attempt = TestHistoryItem;

const EXAM_LABEL: Record<string, string> = { jee: "JEE", neet: "NEET", cbse: "CBSE" };

function Tests() {
  return (
    <RequireAuth>
      <Inner />
    </RequireAuth>
  );
}

function Inner() {
  const [items, setItems] = React.useState<Attempt[] | null>(null);
  const fetchAttempts = useServerFn(listMyTestAttempts);

  React.useEffect(() => {
    let cancelled = false;
    fetchAttempts()
      .then((data) => {
        if (!cancelled) setItems(data);
      })
      .catch(() => {
        if (!cancelled) setItems([]);
      });
    return () => {
      cancelled = true;
    };
  }, [fetchAttempts]);

  return (
    <div>
      <header className="mb-8">
        <div className="text-[11px] uppercase tracking-[0.25em] text-muted-foreground">My Tests</div>
        <h1 className="mt-2 text-3xl sm:text-4xl font-semibold tracking-tight">Your Mock History</h1>
        <p className="mt-2 text-sm text-muted-foreground">All your previous attempts in one place.</p>
      </header>

      {items === null && (
        <div className="grid gap-3">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-20 rounded-2xl border border-border bg-card animate-pulse" />
          ))}
        </div>
      )}

      {items && items.length === 0 && (
        <div className="rounded-3xl border border-dashed border-border bg-card p-12 text-center">
          <div className="mx-auto h-12 w-12 rounded-2xl bg-foreground/5 flex items-center justify-center mb-3">
            <ClipboardList className="h-6 w-6" />
          </div>
          <div className="text-lg font-medium">No tests yet</div>
          <p className="text-sm text-muted-foreground mt-1">
            Generate your first mock test from the dashboard.
          </p>
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-1.5 mt-5 h-10 px-4 rounded-xl bg-foreground text-background hover:bg-foreground/90 text-sm font-medium"
          >
            Go to Dashboard <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      )}

      {items && items.length > 0 && (
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {items.map((t) => {
            const acc = Math.round((t.correct / t.total) * 100);
            return (
              <div
                key={t.id}
                className="rounded-2xl border border-border bg-card p-4 sm:p-5 flex items-center gap-4"
              >
                <div className="h-11 w-11 rounded-xl bg-foreground/5 flex items-center justify-center shrink-0">
                  <FileText className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-medium truncate">{t.fileName}</div>
                  <div className="text-[11px] text-muted-foreground mt-0.5">
                    {EXAM_LABEL[t.exam] ?? t.exam} · {t.difficulty} ·{" "}
                    {new Date(t.finishedAt).toLocaleString()}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-semibold tabular-nums">{acc}%</div>
                  <div className="text-[11px] text-muted-foreground">
                    {t.correct}/{t.total} correct
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}