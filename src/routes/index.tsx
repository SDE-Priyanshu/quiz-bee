import { createFileRoute, useRouter } from "@tanstack/react-router";
import * as React from "react";
import { Loader2, Sparkles, ShieldCheck, UserRound, X } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth";
import { LogoLockup } from "@/components/Logo";
import { ThemeToggle } from "@/components/ThemeToggle";
import { lovable } from "@/integrations/lovable";

export const Route = createFileRoute("/")({ component: Index });

function Index() {
  const { user, loginAsGuest } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = React.useState<"google" | "guest" | null>(null);
  const [guestOpen, setGuestOpen] = React.useState(false);

  React.useEffect(() => {
    if (user) router.navigate({ to: "/dashboard" });
  }, [user, router]);

  const handleGoogle = async () => {
    setLoading("google");
    try {
      const result = await lovable.auth.signInWithOAuth("google", {
        redirect_uri: window.location.origin,
        extraParams: { prompt: "select_account" },
      });
      if (result.error) {
        console.error(result.error);
        toast.error("Sign-in failed. Please try again.");
        setLoading(null);
        return;
      }
      if (result.redirected) return; // browser navigates to Google
      toast.success("Signed in");
      router.navigate({ to: "/dashboard" });
    } catch (e) {
      console.error(e);
      toast.error("Something went wrong.");
      setLoading(null);
    }
  };

  const handleConfirmGuest = () => {
    setLoading("guest");
    loginAsGuest();
    toast.success("Continuing as Guest");
    setGuestOpen(false);
    // navigation happens via effect once user populates
  };

  return (
    <div className="relative min-h-screen w-full overflow-hidden text-foreground flex items-center justify-center px-5 py-10
                    bg-[radial-gradient(120%_80%_at_50%_-10%,#ffffff_0%,#f3f4f7_45%,#e8eaf0_100%)]
                    dark:bg-[radial-gradient(120%_80%_at_50%_-10%,#0a0a0a_0%,#050505_60%,#000000_100%)]">
      {/* Static grid texture */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.08] dark:opacity-[0.12] [background-image:linear-gradient(to_right,currentColor_1px,transparent_1px),linear-gradient(to_bottom,currentColor_1px,transparent_1px)] [background-size:64px_64px] [mask-image:radial-gradient(ellipse_at_center,black_40%,transparent_85%)]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-foreground/30 to-transparent"
      />

      {/* Theme toggle — top right */}
      <div className="absolute top-4 right-4 sm:top-6 sm:right-6 z-20">
        <ThemeToggle />
      </div>

      <div className="relative w-full max-w-md animate-fade-up">
        <div className="text-center mb-9 sm:mb-11">
          <div className="inline-flex items-center gap-2 rounded-full border border-border glass px-3.5 py-1.5 text-[10px] sm:text-[11px] uppercase tracking-[0.24em] text-muted-foreground mb-7 shadow-sm">
            <Sparkles className="h-3 w-3" /> AI Mock Test Engine
          </div>
          <div className="relative flex items-center justify-center mb-4 py-2">
            <LogoLockup className="relative h-16 sm:h-20" shimmer />
            <h1 className="sr-only">PrepZo</h1>
          </div>
          <p className="mt-3 text-[13px] sm:text-sm text-muted-foreground max-w-sm mx-auto leading-relaxed tracking-[0.005em]">
            Upload a PDF. Get an exam-grade mock test for JEE, NEET, or CBSE — in seconds.
          </p>
        </div>

        <div className="relative rounded-[28px] glass p-7 sm:p-9">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-foreground/40 to-transparent"
          />
          <div className="text-center mb-7 sm:mb-8">
            <div className="text-[10px] uppercase tracking-[0.28em] text-muted-foreground font-medium">
              Sign in
            </div>
            <div className="mt-2 text-[17px] sm:text-lg font-semibold tracking-tight">
              Continue to your dashboard
            </div>
          </div>

          <div className="space-y-3">
            <button
              onClick={handleGoogle}
              disabled={loading !== null}
              className="group relative w-full h-12 sm:h-[52px] rounded-2xl border border-border bg-card transition-all duration-300 flex items-center justify-center gap-3 text-[14px] sm:text-[15px] font-medium disabled:opacity-60 disabled:cursor-not-allowed overflow-hidden
                         shadow-[0_1px_0_rgba(255,255,255,0.6)_inset,0_8px_24px_-12px_rgba(15,23,42,0.25)]
                         hover:shadow-[0_1px_0_rgba(255,255,255,0.6)_inset,0_16px_36px_-12px_rgba(15,23,42,0.35)]
                         hover:-translate-y-[1px] active:translate-y-0 hover:border-foreground/25
                         dark:shadow-[0_1px_0_rgba(255,255,255,0.06)_inset,0_8px_24px_-12px_rgba(0,0,0,0.8)]
                         dark:hover:shadow-[0_1px_0_rgba(255,255,255,0.1)_inset,0_18px_40px_-12px_rgba(0,0,0,0.9)]"
            >
              <span
                aria-hidden
                className="pointer-events-none absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-[1100ms] ease-out"
                style={{
                  background:
                    "linear-gradient(110deg, transparent 40%, color-mix(in oklab, var(--color-foreground) 8%, transparent) 50%, transparent 60%)",
                }}
              />
              {loading === "google" ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Opening Google…</span>
                </>
              ) : (
                <>
                  <GoogleIcon />
                  <span className="tracking-tight">Continue with Google</span>
                </>
              )}
            </button>

            <button
              onClick={() => setGuestOpen(true)}
              disabled={loading !== null}
              className="group relative w-full h-12 sm:h-[52px] rounded-2xl border border-border bg-card/60 transition-all duration-300 flex items-center justify-center gap-3 text-[14px] sm:text-[15px] font-medium disabled:opacity-60 disabled:cursor-not-allowed overflow-hidden
                         shadow-[0_1px_0_rgba(255,255,255,0.5)_inset,0_6px_20px_-12px_rgba(15,23,42,0.2)]
                         hover:shadow-[0_1px_0_rgba(255,255,255,0.6)_inset,0_14px_30px_-12px_rgba(15,23,42,0.3)]
                         hover:-translate-y-[1px] active:translate-y-0 hover:border-foreground/25
                         dark:shadow-[0_1px_0_rgba(255,255,255,0.05)_inset,0_6px_20px_-12px_rgba(0,0,0,0.7)]
                         dark:hover:shadow-[0_1px_0_rgba(255,255,255,0.08)_inset,0_16px_34px_-12px_rgba(0,0,0,0.85)]"
            >
              <span
                aria-hidden
                className="pointer-events-none absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-[1100ms] ease-out"
                style={{
                  background:
                    "linear-gradient(110deg, transparent 40%, color-mix(in oklab, var(--color-foreground) 8%, transparent) 50%, transparent 60%)",
                }}
              />
              <UserRound className="h-[18px] w-[18px]" strokeWidth={1.75} />
              <span className="tracking-tight">Continue as Guest</span>
            </button>
          </div>

          <div className="mt-7 flex items-center justify-center gap-1.5 text-[11px] text-muted-foreground">
            <ShieldCheck className="h-3 w-3" />
            Secured by Lovable Cloud · Encrypted session
          </div>

          <p className="mt-2.5 text-center text-[11px] text-muted-foreground/80 leading-relaxed">
            By continuing, you agree to our Terms of Service and Privacy Policy.
          </p>
        </div>

        <p className="mt-7 text-center text-[11px] text-muted-foreground/70 tracking-wide">
          © {new Date().getFullYear()} PrepZo. Crafted for serious learners.
        </p>
      </div>

      <GuestConfirmModal
        open={guestOpen}
        onClose={() => setGuestOpen(false)}
        onConfirm={handleConfirmGuest}
        loading={loading === "guest"}
      />
    </div>
  );
}

function GuestConfirmModal({
  open,
  onClose,
  onConfirm,
  loading,
}: {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  loading: boolean;
}) {
  React.useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-5 animate-fade-up">
      <div
        className="absolute inset-0 bg-black/55 backdrop-blur-md"
        onClick={onClose}
      />
      <div className="relative w-full max-w-md rounded-3xl glass p-7 sm:p-8 shadow-2xl">
        <button
          onClick={onClose}
          className="absolute top-3.5 right-3.5 h-9 w-9 inline-flex items-center justify-center rounded-xl hover:bg-foreground/10 transition"
          aria-label="Close"
        >
          <X className="h-4 w-4" />
        </button>
        <div className="flex items-center gap-3 mb-4">
          <div className="h-11 w-11 rounded-2xl bg-foreground/10 flex items-center justify-center">
            <UserRound className="h-5 w-5" strokeWidth={1.75} />
          </div>
          <div>
            <div className="text-[10px] uppercase tracking-[0.26em] text-muted-foreground">
              Confirm
            </div>
            <div className="text-lg font-semibold tracking-tight">
              Continue as Guest?
            </div>
          </div>
        </div>
        <p className="text-[13.5px] text-muted-foreground leading-relaxed mb-6">
          You can explore PrepZo without signing in, but your progress and data
          may not sync across devices.
        </p>
        <div className="flex gap-2.5">
          <button
            onClick={onClose}
            disabled={loading}
            className="flex-1 h-11 rounded-xl border border-border bg-card hover:bg-accent transition text-sm font-medium disabled:opacity-60"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="flex-1 h-11 rounded-xl bg-foreground text-background hover:opacity-90 transition text-sm font-medium inline-flex items-center justify-center gap-2 disabled:opacity-60"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" /> Entering…
              </>
            ) : (
              "Continue as Guest"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg viewBox="0 0 48 48" className="h-5 w-5">
      <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.5 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3 0 5.8 1.1 7.9 3l5.7-5.7C34.1 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.2-.1-2.3-.4-3.5z"/>
      <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 16 19 13 24 13c3 0 5.8 1.1 7.9 3l5.7-5.7C34.1 6.1 29.3 4 24 4 16.3 4 9.6 8.3 6.3 14.7z"/>
      <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35 26.7 36 24 36c-5.3 0-9.7-3.4-11.3-8.1l-6.5 5C9.5 39.6 16.2 44 24 44z"/>
      <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.3-2.3 4.2-4.1 5.6l6.2 5.2C41 35 44 30 44 24c0-1.2-.1-2.3-.4-3.5z"/>
    </svg>
  );
}