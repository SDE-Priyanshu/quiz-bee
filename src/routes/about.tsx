import { createFileRoute } from "@tanstack/react-router";
import { RequireAuth } from "@/components/AppShell";
import { Github, Linkedin, Mail, MapPin, Code2, Sparkles, FileText, Wand2, BarChart3, ArrowRight } from "lucide-react";
import priyanshuPhoto from "@/assets/priyanshu.jpg.asset.json";

export const Route = createFileRoute("/about")({ component: About });

function About() {
  const flow = [
    { icon: Sparkles, value: "AI", label: "Powered" },
    { icon: FileText, value: "PDF", label: "Upload" },
    { icon: Wand2, value: "1-Click", label: "Test Creation" },
    { icon: BarChart3, value: "Instant", label: "Analytics" },
  ];
  const stack = ["HTML", "CSS", "JavaScript", "React", "TypeScript", "Node.js", "LLMs", "AI APIs"];
  const socials = [
    { icon: Linkedin, label: "LinkedIn", href: "https://www.linkedin.com/in/priyanshu-patel-591166382", external: true },
    { icon: Github, label: "GitHub", href: "https://github.com/SDE-Priyanshu", external: true },
    { icon: Mail, label: "Email", href: "mailto:priyanshuvns2008@gmail.com", external: false },
  ];

  return (
    <RequireAuth>
      <div className="animate-in fade-in duration-500">
        <div className="text-[11px] uppercase tracking-[0.25em] text-muted-foreground">About</div>
        <h1 className="mt-2 text-3xl sm:text-4xl font-semibold tracking-tight">Meet the Developer</h1>

        <div className="mt-8 rounded-2xl border border-border bg-card overflow-hidden">
          <div className="h-32 sm:h-40 bg-gradient-to-br from-foreground/10 via-foreground/5 to-transparent" />
          <div className="px-6 sm:px-10 pb-10 -mt-16 sm:-mt-20">
            <div className="flex flex-col sm:flex-row sm:items-end sm:gap-6">
              <div className="group relative h-32 w-32 sm:h-36 sm:w-36 rounded-2xl overflow-hidden border-4 border-card shadow-xl ring-1 ring-border transition-transform duration-300 hover:-translate-y-1 hover:shadow-2xl">
                <img
                  src={priyanshuPhoto.url}
                  alt="Priyanshu Patel"
                  className="h-full w-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
                  draggable={false}
                />
              </div>
              <div className="mt-5 sm:mt-0 sm:pb-2">
                <h2 className="text-2xl font-semibold tracking-tight">Priyanshu Patel</h2>
                <div className="text-sm text-muted-foreground mt-1">
                  B.Tech CSE Student · Software Developer
                </div>
                <div className="mt-1.5 flex items-center gap-2 text-xs text-muted-foreground">
                  <MapPin className="h-3 w-3" /> Varanasi, Uttar Pradesh, India
                </div>
              </div>
            </div>

            <div className="mt-7 space-y-4 text-sm leading-relaxed text-muted-foreground max-w-2xl">
              <p>
                I built PrepZo during my first year of college to solve a problem I faced during my
                own exam preparation. I used to struggle with effective revision and building
                confidence from thick PDF notes.
              </p>
              <p>
                PrepZo uses AI to instantly transform study PDFs into interactive mock tests,
                helping students practice more effectively and track their progress with real-time
                analytics.
              </p>
              <p>
                As a B.Tech Computer Science student, I am passionate about building software that
                solves real problems and makes learning more accessible, efficient, and engaging
                for students.
              </p>
            </div>

            {/* Feature flow */}
            <div className="mt-9">
              <div className="text-[11px] uppercase tracking-[0.25em] text-muted-foreground mb-3">
                How PrepZo works
              </div>
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 relative">
                {flow.map((f, i) => {
                  const I = f.icon;
                  return (
                    <div key={f.label} className="relative">
                      <div className="group rounded-xl border border-border p-4 h-full transition-all hover:border-foreground/30 hover:-translate-y-0.5 hover:shadow-md">
                        <I className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                        <div className="mt-3 text-xl font-semibold tracking-tight">{f.value}</div>
                        <div className="text-[11px] uppercase tracking-wider text-muted-foreground mt-1">
                          {f.label}
                        </div>
                      </div>
                      {i < flow.length - 1 && (
                        <ArrowRight className="hidden lg:block absolute top-1/2 -right-2.5 -translate-y-1/2 h-4 w-4 text-muted-foreground/50 z-10" />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Tech */}
            <div className="mt-9">
              <div className="text-[11px] uppercase tracking-[0.25em] text-muted-foreground mb-3">
                Technologies Used
              </div>
              <div className="flex flex-wrap gap-2">
                {stack.map((t) => (
                  <span
                    key={t}
                    className="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1 text-xs transition-colors hover:bg-accent"
                  >
                    <Code2 className="h-3 w-3" /> {t}
                  </span>
                ))}
              </div>
            </div>

            {/* Socials */}
            <div className="mt-9">
              <div className="text-[11px] uppercase tracking-[0.25em] text-muted-foreground mb-3">
                Connect
              </div>
              <div className="flex flex-wrap gap-2">
                {socials.map((s) => {
                  const I = s.icon;
                  return (
                    <a
                      key={s.label}
                      href={s.href}
                      target={s.external ? "_blank" : undefined}
                      rel={s.external ? "noopener noreferrer" : undefined}
                      className="inline-flex items-center gap-2 h-9 px-3 rounded-lg border border-border hover:bg-accent hover:border-foreground/30 text-xs transition-all"
                    >
                      <I className="h-4 w-4" /> {s.label}
                    </a>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </RequireAuth>
  );
}