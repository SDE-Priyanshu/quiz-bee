import { createFileRoute } from "@tanstack/react-router";
import { RequireAuth } from "@/components/AppShell";
import { Github, Linkedin, Twitter, Mail, MapPin, Code2 } from "lucide-react";

export const Route = createFileRoute("/about")({ component: About });

function About() {
  return (
    <RequireAuth>
      <div>
        <div className="text-[11px] uppercase tracking-[0.25em] text-muted-foreground">About</div>
        <h1 className="mt-2 text-3xl sm:text-4xl font-semibold tracking-tight">Meet the developer</h1>

        <div className="mt-8 rounded-2xl border border-border bg-card overflow-hidden">
          <div className="h-40 bg-gradient-to-br from-foreground/10 via-foreground/5 to-transparent" />
          <div className="px-6 sm:px-10 pb-10 -mt-14">
            <div className="h-28 w-28 rounded-2xl bg-foreground text-background flex items-center justify-center text-3xl font-semibold border-4 border-card shadow-xl">
              AS
            </div>
            <div className="mt-5">
              <h2 className="text-2xl font-semibold">Aarav Sharma</h2>
              <div className="text-sm text-muted-foreground">Full-stack engineer · AI tinkerer</div>
              <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                <MapPin className="h-3 w-3" /> Bengaluru, India
              </div>
            </div>

            <p className="mt-6 text-sm leading-relaxed text-muted-foreground max-w-2xl">
              I build calm, opinionated software. PrepZo started as a weekend hack to help my
              cousin prep for JEE — turning dense chapter PDFs into clean, exam-pattern mock
              tests. Today it powers thousands of practice sessions every week.
            </p>

            <div className="mt-7 grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { label: "Years building", value: "7+" },
                { label: "Quizzes generated", value: "42k" },
                { label: "Open-source repos", value: "31" },
                { label: "Coffee per day", value: "∞" },
              ].map((s) => (
                <div key={s.label} className="rounded-xl border border-border p-4">
                  <div className="text-xl font-semibold">{s.value}</div>
                  <div className="text-[11px] uppercase tracking-wider text-muted-foreground mt-1">
                    {s.label}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-7 flex flex-wrap gap-2">
              {["TypeScript", "React", "Node", "Python", "LLMs", "Postgres", "TailwindCSS"].map(
                (t) => (
                  <span
                    key={t}
                    className="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1 text-xs"
                  >
                    <Code2 className="h-3 w-3" /> {t}
                  </span>
                ),
              )}
            </div>

            <div className="mt-7 flex flex-wrap gap-2">
              {[
                { icon: Github, label: "GitHub" },
                { icon: Linkedin, label: "LinkedIn" },
                { icon: Twitter, label: "Twitter" },
                { icon: Mail, label: "Email" },
              ].map((s) => {
                const I = s.icon;
                return (
                  <button
                    key={s.label}
                    className="inline-flex items-center gap-2 h-9 px-3 rounded-lg border border-border hover:bg-accent text-xs"
                  >
                    <I className="h-4 w-4" /> {s.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </RequireAuth>
  );
}