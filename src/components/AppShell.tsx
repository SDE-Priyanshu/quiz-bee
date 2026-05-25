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
  LogOut,
  Lock,
} from "lucide-react";
import { useAuth } from "@/lib/auth";
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
  const router = useRouter();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  React.useEffect(() => { setOpen(false); }, [pathname]);

  const initials = user ? user.name.split(" ").map((p) => p[0]).join("").slice(0, 2) : "";

  const handleLogout = async () => {
    await logout();
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
              {user.avatarUrl ? (
                <img
                  src={user.avatarUrl}
                  alt={user.name}
                  className="h-7 w-7 rounded-full object-cover"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="h-7 w-7 rounded-full bg-foreground text-background flex items-center justify-center text-[11px] font-semibold">
                  {initials}
                </div>
              )}
              <span className="text-xs text-muted-foreground hidden sm:inline pr-2 max-w-[180px] truncate">
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
          "fixed inset-0 z-40 bg-black/70 backdrop-blur-md transition-opacity duration-300",
          open ? "opacity-100" : "pointer-events-none opacity-0",
        )}
      />

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed top-0 left-0 z-50 h-full w-[300px] sm:w-[330px] border-r border-white/10 shadow-2xl",
          "transition-transform duration-400 ease-[cubic-bezier(0.16,1,0.3,1)]",
          "bg-[oklch(0.13_0_0)] text-[oklch(0.98_0_0)]",
          open ? "translate-x-0" : "-translate-x-full",
        )}
      >
        {/* Inner glow */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-50"
          style={{
            background:
              "radial-gradient(70% 40% at 0% 0%, rgba(255,255,255,0.06), transparent 60%)",
          }}
        />
        <div className="relative flex items-center justify-between px-5 pt-5 pb-5">
          <div className="flex items-center gap-2.5">
            <LogoMark className="h-8 w-8" />
            <div>
              <div className="text-base font-semibold leading-none">PrepZo</div>
              <div className="text-[10px] uppercase tracking-[0.22em] text-white/40 mt-1">
                Navigation
              </div>
            </div>
          </div>
          <button
            onClick={() => setOpen(false)}
            className="h-9 w-9 inline-flex items-center justify-center rounded-xl hover:bg-white/10 transition"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="relative px-5 mb-3">
          <div className="h-px bg-gradient-to-r from-transparent via-white/15 to-transparent" />
        </div>

        <nav className="relative px-3 mt-1 space-y-1.5">
          {NAV.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.to;
            return (
              <Link
                key={item.to}
                to={item.to}
                className={cn(
                  "group relative flex items-center gap-3 rounded-xl px-3.5 py-3 transition-all duration-200",
                  active
                    ? "bg-white text-black shadow-lg shadow-black/40"
                    : "text-white/80 hover:bg-white/[0.07] hover:text-white hover:translate-x-0.5",
                )}
              >
                {active && (
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-0.5 rounded-r-full bg-white" />
                )}
                <Icon className="h-[18px] w-[18px] shrink-0" />
                <span className="text-sm font-medium tracking-tight">{item.label}</span>
              </Link>
            );
          })}

          <div className="pt-3 mt-2 border-t border-white/10">
            <Link
              to="/admin"
              className={cn(
                "group flex items-center gap-3 rounded-xl px-3.5 py-3 transition-all duration-200",
                pathname === "/admin"
                  ? "bg-white text-black shadow-lg"
                  : "text-white/80 hover:bg-white/[0.07] hover:text-white",
              )}
            >
              <Shield className="h-[18px] w-[18px] shrink-0" />
              <span className="text-sm font-medium flex-1">Admin Panel</span>
              <Lock className="h-3.5 w-3.5 opacity-60" />
            </Link>
          </div>
        </nav>

        {/* Footer: user card + logout */}
        <div className="absolute bottom-0 inset-x-0 p-4 border-t border-white/10 bg-black/30">
          {user && (
            <div className="flex items-center gap-3 px-2 py-2 mb-2">
              {user.avatarUrl ? (
                <img
                  src={user.avatarUrl}
                  alt={user.name}
                  className="h-9 w-9 rounded-full object-cover ring-1 ring-white/20"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="h-9 w-9 rounded-full bg-white text-black flex items-center justify-center text-xs font-semibold">
                  {initials}
                </div>
              )}
              <div className="min-w-0">
                <div className="text-sm font-medium truncate">{user.name}</div>
                <div className="text-[11px] text-white/50 truncate">{user.email}</div>
              </div>
            </div>
          )}
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 rounded-xl px-3 py-2.5 bg-white/[0.04] hover:bg-white/[0.10] transition text-sm"
          >
            <LogOut className="h-[18px] w-[18px]" /> Logout
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
  const { user, loading } = useAuth();
  const router = useRouter();

  React.useEffect(() => {
    if (!loading && !user) router.navigate({ to: "/" });
  }, [loading, user, router]);

  if (loading || !user) return null;
  return <AppShell>{children}</AppShell>;
}