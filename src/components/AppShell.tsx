import * as React from "react";
import { Link, useRouter, useRouterState } from "@tanstack/react-router";
import {
  Menu,
  X,
  LayoutDashboard,
  User,
  MessagesSquare,
  Star,
  Shield,
  Sun,
  Moon,
  LogOut,
} from "lucide-react";
import { useAuth } from "@/lib/auth";
import { useTheme } from "@/lib/theme";
import { cn } from "@/lib/utils";

const NAV = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard, sub: "PDF Quiz Creator" },
  { to: "/about", label: "About Me", icon: User, sub: "Developer bio" },
  { to: "/community", label: "Community", icon: MessagesSquare, sub: "Public threads" },
  { to: "/feedback", label: "Feedback", icon: Star, sub: "Rate & comment" },
  { to: "/admin", label: "Admin Panel", icon: Shield, sub: "Secured space" },
] as const;

export function AppShell({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = React.useState(false);
  const { user, logout } = useAuth();
  const { theme, toggle } = useTheme();
  const router = useRouter();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  React.useEffect(() => {
    setOpen(false);
  }, [pathname]);

  return (
    <div className="relative min-h-screen bg-background text-foreground">
      {/* Floating hamburger */}
      <button
        onClick={() => setOpen(true)}
        aria-label="Open menu"
        className="fixed top-5 left-5 z-40 flex h-11 w-11 items-center justify-center rounded-full border border-border bg-card/80 backdrop-blur shadow-lg hover:bg-accent transition"
      >
        <Menu className="h-5 w-5" />
      </button>

      {/* Top-right user chip */}
      {user && (
        <div className="fixed top-5 right-5 z-40 flex items-center gap-2 rounded-full border border-border bg-card/80 backdrop-blur px-3 py-1.5 shadow-lg">
          <div className="h-7 w-7 rounded-full bg-foreground text-background flex items-center justify-center text-xs font-semibold">
            {user.name.split(" ").map((p) => p[0]).join("").slice(0, 2)}
          </div>
          <span className="text-xs text-muted-foreground hidden sm:inline">{user.email}</span>
        </div>
      )}

      {/* Backdrop */}
      <div
        onClick={() => setOpen(false)}
        className={cn(
          "fixed inset-0 z-40 bg-black/60 backdrop-blur-sm transition-opacity",
          open ? "opacity-100" : "pointer-events-none opacity-0",
        )}
      />

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed top-0 left-0 z-50 h-full w-[300px] sm:w-[340px] border-r border-border shadow-2xl transition-transform duration-300",
          "bg-[oklch(0.18_0_0)] text-[oklch(0.98_0_0)]",
          open ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex items-center justify-between px-6 pt-6 pb-4">
          <div>
            <div className="text-[10px] uppercase tracking-[0.25em] text-white/40">QuizForge</div>
            <div className="text-lg font-semibold">Navigation</div>
          </div>
          <button
            onClick={() => setOpen(false)}
            className="h-9 w-9 inline-flex items-center justify-center rounded-md hover:bg-white/10"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="px-3 mt-2 space-y-1">
          {NAV.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.to;
            return (
              <Link
                key={item.to}
                to={item.to}
                className={cn(
                  "group flex items-start gap-3 rounded-lg px-3 py-3 transition",
                  active ? "bg-white text-black" : "hover:bg-white/10",
                )}
              >
                <Icon className="h-5 w-5 mt-0.5 shrink-0" />
                <div className="min-w-0">
                  <div className="text-sm font-medium">{item.label}</div>
                  <div className={cn("text-[11px]", active ? "text-black/60" : "text-white/40")}>
                    {item.sub}
                  </div>
                </div>
              </Link>
            );
          })}
        </nav>

        <div className="absolute bottom-0 inset-x-0 p-4 border-t border-white/10 space-y-2">
          <button
            onClick={toggle}
            className="w-full flex items-center justify-between rounded-lg px-3 py-2.5 hover:bg-white/10 transition"
          >
            <span className="flex items-center gap-3 text-sm">
              {theme === "dark" ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
              {theme === "dark" ? "Dark mode" : "Light mode"}
            </span>
            <span
              className={cn(
                "h-5 w-9 rounded-full p-0.5 transition",
                theme === "dark" ? "bg-white" : "bg-white/30",
              )}
            >
              <span
                className={cn(
                  "block h-4 w-4 rounded-full bg-black transition",
                  theme === "dark" ? "translate-x-4" : "translate-x-0",
                )}
              />
            </span>
          </button>
          {user && (
            <button
              onClick={() => {
                logout();
                router.navigate({ to: "/" });
              }}
              className="w-full flex items-center gap-3 rounded-lg px-3 py-2.5 hover:bg-white/10 transition text-sm"
            >
              <LogOut className="h-4 w-4" /> Sign out
            </button>
          )}
        </div>
      </aside>

      <main className="pt-24 pb-16 px-5 sm:px-8 max-w-6xl mx-auto">{children}</main>
    </div>
  );
}

export function RequireAuth({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const router = useRouter();
  const [ready, setReady] = React.useState(false);

  React.useEffect(() => {
    setReady(true);
    if (!user) {
      // Defer slightly to avoid hydration race
      const raw = typeof window !== "undefined" ? localStorage.getItem("quizforge.auth.user") : null;
      if (!raw) router.navigate({ to: "/" });
    }
  }, [user, router]);

  if (!ready) return null;
  if (!user) return null;
  return <AppShell>{children}</AppShell>;
}