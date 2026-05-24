import * as React from "react";
import { Link, useRouter, useRouterState } from "@tanstack/react-router";
import {
  Menu,
  X,
  LayoutDashboard,
  ClipboardList,
  User,
  MessagesSquare,
  Star,
  Shield,
  Sun,
  Moon,
  LogOut,
  Lock,
} from "lucide-react";
import { useAuth } from "@/lib/auth";
import { useTheme } from "@/lib/theme";
import { cn } from "@/lib/utils";
import { LogoMark } from "@/components/Logo";

const NAV = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/tests", label: "My Tests", icon: ClipboardList },
  { to: "/community", label: "Community", icon: MessagesSquare },
  { to: "/feedback", label: "Feedback", icon: Star },
  { to: "/about", label: "About", icon: User },
] as const;

export function AppShell({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = React.useState(false);
  const { user, logout } = useAuth();
  const { theme, toggle } = useTheme();
  const router = useRouter();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  React.useEffect(() => { setOpen(false); }, [pathname]);

  const initials = user ? user.name.split(" ").map((p) => p[0]).join("").slice(0, 2) : "";

  const handleLogout = () => {
    logout();
    router.navigate({ to: "/" });
  };

  return (
    <div className="relative min-h-screen bg-background text-foreground">
      {/* Top navbar */}
      <header className="fixed top-0 inset-x-0 z-30 h-16 border-b border-border glass">
        <div className="h-full max-w-7xl mx-auto flex items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setOpen(true)}
              aria-label="Open menu"
              className="h-10 w-10 inline-flex items-center justify-center rounded-xl hover:bg-accent transition lg:hidden"
            >
              <Menu className="h-5 w-5" />
            </button>
            <button
              onClick={() => setOpen((v) => !v)}
              aria-label="Toggle sidebar"
              className="hidden lg:inline-flex h-10 w-10 items-center justify-center rounded-xl hover:bg-accent transition"
            >
              <Menu className="h-5 w-5" />
            </button>
            <Link to="/dashboard" className="flex items-center gap-2 ml-1">
              <LogoMark className="h-7 w-7" />
              <span className="text-base font-semibold tracking-tight">PrepZo</span>
            </Link>
          </div>

          {user && (
            <div className="flex items-center gap-2 rounded-full border border-border bg-card/80 px-2.5 py-1.5">
              <div className="h-7 w-7 rounded-full bg-foreground text-background flex items-center justify-center text-[11px] font-semibold">
                {initials}
              </div>
              <span className="text-xs text-muted-foreground hidden sm:inline pr-2">
                {user.email}
              </span>
            </div>
          )}
        </div>
      </header>

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
          "fixed top-0 left-0 z-50 h-full w-[300px] sm:w-[320px] border-r border-border shadow-2xl transition-transform duration-300",
          "bg-[oklch(0.16_0_0)] text-[oklch(0.98_0_0)]",
          open ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex items-center justify-between px-5 pt-5 pb-4">
          <div className="flex items-center gap-2.5">
            <LogoMark className="h-7 w-7" />
            <div>
              <div className="text-base font-semibold leading-none">PrepZo</div>
              <div className="text-[10px] uppercase tracking-[0.22em] text-white/40 mt-1">
                Navigation
              </div>
            </div>
          </div>
          <button
            onClick={() => setOpen(false)}
            className="h-9 w-9 inline-flex items-center justify-center rounded-md hover:bg-white/10"
            aria-label="Close"
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
                  "group flex items-center gap-3 rounded-xl px-3 py-2.5 transition",
                  active ? "bg-white text-black" : "hover:bg-white/10",
                )}
              >
                <Icon className="h-4.5 w-4.5 shrink-0" />
                <span className="text-sm font-medium">{item.label}</span>
              </Link>
            );
          })}

          <Link
            to="/admin"
            className={cn(
              "group flex items-center gap-3 rounded-xl px-3 py-2.5 transition mt-3",
              pathname === "/admin" ? "bg-white text-black" : "hover:bg-white/10",
            )}
          >
            <Shield className="h-4.5 w-4.5 shrink-0" />
            <span className="text-sm font-medium flex-1">Admin Panel</span>
            <Lock className="h-3.5 w-3.5 opacity-60" />
          </Link>

          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 rounded-xl px-3 py-2.5 hover:bg-white/10 transition text-sm"
          >
            <LogOut className="h-4.5 w-4.5" /> Logout
          </button>
        </nav>

        <div className="absolute bottom-0 inset-x-0 p-4 border-t border-white/10">
          <button
            onClick={toggle}
            className="w-full flex items-center justify-between rounded-xl px-3 py-2.5 hover:bg-white/10 transition"
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
        </div>
      </aside>

      <main className="pt-24 pb-16 px-5 sm:px-8 max-w-6xl mx-auto animate-fade-up" key={pathname}>
        {children}
      </main>
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
      const raw =
        typeof window !== "undefined"
          ? localStorage.getItem("prepzo.auth.user") ?? localStorage.getItem("quizforge.auth.user")
          : null;
      if (!raw) router.navigate({ to: "/" });
    }
  }, [user, router]);

  if (!ready || !user) return null;
  return <AppShell>{children}</AppShell>;
}