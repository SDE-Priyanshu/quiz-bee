import { createFileRoute, useRouter } from "@tanstack/react-router";
import * as React from "react";
import { Loader2, Sparkles, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth";
import { LogoMark } from "@/components/Logo";
import { ThemeToggle } from "@/components/ThemeToggle";
import { lovable } from "@/integrations/lovable";

export const Route = createFileRoute("/")({ component: Index });

function Index() {
  const { user } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = React.useState<"google" | null>(null);

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

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-background text-foreground flex items-center justify-center px-5 py-10">
      {/* Animated grid */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.12] animate-grid-pan [background-image:linear-gradient(to_right,currentColor_1px,transparent_1px),linear-gradient(to_bottom,currentColor_1px,transparent_1px)] [background-size:60px_60px]"
      />
      {/* Particle dots */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-40 [background-image:radial-gradient(circle_at_center,currentColor_1px,transparent_1.5px)] [background-size:38px_38px] [mask-image:radial-gradient(ellipse_at_center,black_30%,transparent_75%)]"
        style={{ color: "color-mix(in oklab, var(--color-foreground) 25%, transparent)" }}
      />
      {/* Radial vignette */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(60% 50% at 50% 0%, color-mix(in oklab, var(--color-foreground) 10%, transparent), transparent 70%), radial-gradient(40% 40% at 80% 90%, color-mix(in oklab, var(--color-foreground) 6%, transparent), transparent 70%)",
        }}
      />

      {/* Theme toggle — top right */}
      <div className="absolute top-4 right-4 sm:top-6 sm:right-6 z-20">
        <ThemeToggle />
      </div>

      <div className="relative w-full max-w-md animate-fade-up">
        <div className="text-center mb-8 sm:mb-10">
          <div className="inline-flex items-center gap-2 rounded-full border border-border glass px-3 py-1 text-[11px] uppercase tracking-[0.22em] text-muted-foreground mb-6">
            <Sparkles className="h-3 w-3" /> AI Mock Test Engine
          </div>
          <div className="relative flex items-center justify-center gap-3 mb-3">
            {/* Soft logo glow */}
            <div
              aria-hidden
              className="absolute h-32 w-32 rounded-full bg-foreground/15 blur-3xl animate-pulse-glow"
            />
            <LogoMark className="relative h-12 w-12 drop-shadow-[0_8px_24px_rgba(0,0,0,0.35)]" />
            <h1 className="relative text-4xl sm:text-5xl font-semibold tracking-tight">
              PrepZo
            </h1>
          </div>
          <p className="mt-2 text-sm text-muted-foreground max-w-sm mx-auto leading-relaxed">
            Upload a PDF. Get an exam-grade mock test for JEE, NEET, or CBSE — in seconds.
          </p>
        </div>

        <div className="rounded-3xl border border-border glass shadow-2xl p-6 sm:p-8 ring-1 ring-foreground/[0.03]">
          <div className="text-center mb-6 sm:mb-7">
            <div className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
              Sign in
            </div>
            <div className="mt-1.5 text-lg font-medium">Continue to your dashboard</div>
          </div>

          <div className="space-y-3">
            <button
              onClick={handleGoogle}
              disabled={loading !== null}
              className="group relative w-full h-12 rounded-2xl border border-border bg-card hover:bg-accent transition-all duration-200 flex items-center justify-center gap-3 text-sm font-medium disabled:opacity-60 disabled:cursor-not-allowed shadow-sm hover:shadow-lg hover:-translate-y-[1px] active:translate-y-0"
            >
              {loading === "google" ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Opening Google…</span>
                </>
              ) : (
                <>
                  <GoogleIcon />
                  <span>Continue with Google</span>
                </>
              )}
            </button>
          </div>

          <div className="mt-6 flex items-center justify-center gap-1.5 text-[11px] text-muted-foreground">
            <ShieldCheck className="h-3 w-3" />
            Secured by Lovable Cloud · Encrypted session
          </div>

          <p className="mt-3 text-center text-[11px] text-muted-foreground leading-relaxed">
            By continuing, you agree to our Terms of Service and Privacy Policy.
          </p>
        </div>

        <p className="mt-6 text-center text-[11px] text-muted-foreground">
          © {new Date().getFullYear()} PrepZo. Crafted for serious learners.
        </p>
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