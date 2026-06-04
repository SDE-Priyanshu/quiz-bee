import { createFileRoute, useRouter } from "@tanstack/react-router";
import * as React from "react";
import { Shield, Lock, Loader2, AlertTriangle, LogOut } from "lucide-react";
import { RequireAuth } from "@/components/AppShell";
import { useAuth } from "@/lib/auth";
import { isAdminEmail } from "@/lib/roles";
import { verifyAdminPassword } from "@/lib/admin.functions";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export const Route = createFileRoute("/admin")({ component: AdminPage });

function AdminPage() {
  return (
    <RequireAuth>
      <AdminInner />
    </RequireAuth>
  );
}

function AdminInner() {
  const { user } = useAuth();
  const router = useRouter();
  const allowed = isAdminEmail(user?.email);

  // Do not persist unlock state in sessionStorage/localStorage — that flag
  // is writable by any same-origin JS (including XSS) and would let an
  // attacker bypass the password. Keep unlock state in-memory only.
  const [unlocked, setUnlocked] = React.useState<boolean>(false);
  const [password, setPassword] = React.useState("");
  const [submitting, setSubmitting] = React.useState(false);

  React.useEffect(() => {
    if (!allowed) {
      setUnlocked(false);
    }
  }, [allowed]);

  if (!allowed) {
    return (
      <div className="max-w-lg mx-auto mt-16 rounded-3xl border border-border bg-card p-8 text-center">
        <div className="mx-auto h-12 w-12 rounded-2xl bg-destructive/10 text-destructive flex items-center justify-center mb-3">
          <AlertTriangle className="h-5 w-5" />
        </div>
        <h1 className="text-xl font-semibold">Access denied</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          This area is restricted to authorised administrators.
        </p>
        <button
          onClick={() => router.navigate({ to: "/dashboard" })}
          className="mt-6 h-10 px-5 rounded-xl bg-foreground text-background text-sm font-medium"
        >
          Back to Dashboard
        </button>
      </div>
    );
  }

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password) return;
    setSubmitting(true);
    try {
      const res = await verifyAdminPassword({ data: { password } });
      if (res.ok) {
        setUnlocked(true);
        setPassword("");
        toast.success("Admin access granted");
      } else if (res.reason === "not_configured") {
        toast.error("Admin password is not configured on the server.");
      } else {
        toast.error("Incorrect password");
      }
    } catch {
      toast.error("Could not verify password");
    } finally {
      setSubmitting(false);
    }
  };

  if (!unlocked) {
    return (
      <div className="max-w-md mx-auto mt-16 rounded-3xl border border-border bg-card p-8">
        <div className="flex items-center gap-3 mb-5">
          <div className="h-11 w-11 rounded-2xl bg-foreground/5 flex items-center justify-center">
            <Lock className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-lg font-semibold tracking-tight">Admin Login</h1>
            <p className="text-xs text-muted-foreground">
              Enter the admin password to continue.
            </p>
          </div>
        </div>
        <form onSubmit={submit} className="space-y-3">
          <input
            type="password"
            autoFocus
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Admin password"
            className={cn(
              "w-full h-12 rounded-xl border border-border bg-background px-4 text-sm",
              "focus:outline-none focus:ring-2 focus:ring-ring",
            )}
          />
          <button
            type="submit"
            disabled={submitting || !password}
            className="w-full h-12 rounded-xl bg-foreground text-background text-sm font-medium inline-flex items-center justify-center gap-2 disabled:opacity-40"
          >
            {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Shield className="h-4 w-4" />}
            Unlock Admin Panel
          </button>
        </form>
      </div>
    );
  }

  return (
    <div>
      <header className="mb-8 flex items-start justify-between gap-4">
        <div>
          <div className="text-[11px] uppercase tracking-[0.25em] text-muted-foreground">
            Admin
          </div>
          <h1 className="mt-2 text-3xl sm:text-4xl font-semibold tracking-tight flex items-center gap-2">
            <Shield className="h-7 w-7" /> Control Center
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Signed in as <strong className="font-medium">{user?.email}</strong>
          </p>
        </div>
        <button
          onClick={() => {
            setUnlocked(false);
          }}
          className="h-10 px-4 rounded-xl border border-border text-xs inline-flex items-center gap-2 hover:bg-accent"
        >
          <LogOut className="h-4 w-4" /> Lock
        </button>
      </header>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <AdminCard title="Users" value="—" hint="Coming soon" />
        <AdminCard title="Tests Generated" value="—" hint="Coming soon" />
        <AdminCard title="Active Sessions" value="—" hint="Coming soon" />
        <AdminCard title="Feedback" value="—" hint="Coming soon" />
      </div>
    </div>
  );
}

function AdminCard({ title, value, hint }: { title: string; value: string; hint: string }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <div className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
        {title}
      </div>
      <div className="mt-2 text-3xl font-semibold">{value}</div>
      <div className="mt-1 text-xs text-muted-foreground">{hint}</div>
    </div>
  );
}