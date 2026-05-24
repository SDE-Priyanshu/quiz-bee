import { createFileRoute } from "@tanstack/react-router";
import * as React from "react";
import { RequireAuth } from "@/components/AppShell";
import { Lock, ShieldCheck, Users, FileText, Activity, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/admin")({ component: Admin });

const ADMIN_CODE = "QF-ADMIN-2025";

function Admin() {
  return (
    <RequireAuth>
      <AdminInner />
    </RequireAuth>
  );
}

function AdminInner() {
  const [unlocked, setUnlocked] = React.useState(false);
  const [code, setCode] = React.useState("");
  const [error, setError] = React.useState("");
  const [verifying, setVerifying] = React.useState(false);

  const tryUnlock = async (e: React.FormEvent) => {
    e.preventDefault();
    setVerifying(true);
    setError("");
    await new Promise((r) => setTimeout(r, 900));
    if (code.trim() === ADMIN_CODE) {
      setUnlocked(true);
    } else {
      setError("⚠️ Invalid admin access code.");
    }
    setVerifying(false);
  };

  if (!unlocked) {
    return (
      <div className="max-w-md mx-auto mt-10">
        <div className="text-[11px] uppercase tracking-[0.25em] text-muted-foreground text-center">
          Restricted
        </div>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-center">Admin Panel</h1>
        <p className="mt-2 text-sm text-muted-foreground text-center">
          This area is for authorised operators only.
        </p>

        <form
          onSubmit={tryUnlock}
          className="mt-8 rounded-2xl border border-border bg-card p-7 space-y-4"
        >
          <div className="mx-auto h-12 w-12 rounded-full bg-foreground/5 flex items-center justify-center">
            <Lock className="h-5 w-5" />
          </div>
          <label className="block">
            <div className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground mb-2">
              Access code
            </div>
            <input
              type="password"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="Enter admin code"
              className="w-full h-12 rounded-xl border border-border bg-background px-4 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
            <div className="mt-2 text-[11px] text-muted-foreground">
              Hint for demo: <code className="font-mono">{ADMIN_CODE}</code>
            </div>
          </label>

          {error && (
            <div className="flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2 text-xs font-medium text-destructive">
              <AlertTriangle className="h-4 w-4" /> {error}
            </div>
          )}

          <button
            type="submit"
            disabled={verifying || !code}
            className="w-full h-12 rounded-xl bg-foreground text-background text-sm font-medium disabled:opacity-40"
          >
            {verifying ? "Verifying…" : "Unlock admin panel"}
          </button>
        </form>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center gap-2">
        <ShieldCheck className="h-4 w-4" />
        <div className="text-[11px] uppercase tracking-[0.25em] text-muted-foreground">
          Admin · Authorised
        </div>
      </div>
      <h1 className="mt-2 text-3xl sm:text-4xl font-semibold tracking-tight">Operations overview</h1>

      <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { icon: Users, label: "Active users", value: "1,284" },
          { icon: FileText, label: "PDFs processed (24h)", value: "342" },
          { icon: Activity, label: "System health", value: "Nominal" },
        ].map((s) => {
          const I = s.icon;
          return (
            <div key={s.label} className="rounded-2xl border border-border bg-card p-5">
              <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
                <I className="h-3.5 w-3.5" /> {s.label}
              </div>
              <div className="mt-3 text-2xl font-semibold">{s.value}</div>
            </div>
          );
        })}
      </div>

      <div className="mt-6 rounded-2xl border border-border bg-card overflow-hidden">
        <div className="px-5 py-4 border-b border-border flex items-center justify-between">
          <div className="text-sm font-medium">Recent activity</div>
          <span className="text-[11px] text-muted-foreground">last 6 events</span>
        </div>
        <ul className="divide-y divide-border text-sm">
          {[
            ["aarav.sharma@gmail.com", "Generated mock test", "JEE · 50Q", "2m"],
            ["priya.n@gmail.com", "Uploaded PDF", "physics_ch3.pdf", "8m"],
            ["rahul.k@gmail.com", "Generated mock test", "NEET · 30Q", "14m"],
            ["sneha.d@gmail.com", "Left feedback", "★★★★★", "22m"],
            ["mohit.v@gmail.com", "Generated mock test", "CBSE · 20Q", "37m"],
            ["—", "Background cleanup", "Cache pruned", "1h"],
          ].map(([u, a, m, t], i) => (
            <li key={i} className="px-5 py-3 grid grid-cols-[1fr_auto] sm:grid-cols-[1.5fr_1.5fr_1fr_auto] gap-3 items-center">
              <span className="text-foreground truncate">{u}</span>
              <span className="text-muted-foreground hidden sm:block">{a}</span>
              <span className="text-muted-foreground hidden sm:block">{m}</span>
              <span className={cn("text-[11px] text-muted-foreground justify-self-end")}>{t} ago</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}