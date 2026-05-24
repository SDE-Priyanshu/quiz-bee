import { createFileRoute } from "@tanstack/react-router";
import * as React from "react";
import { useRouter } from "@tanstack/react-router";
import { useAuth } from "@/lib/auth";
import { Loader2, Sparkles } from "lucide-react";

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  const { user, loginWithProvider, loading } = useAuth();
  const router = useRouter();
  const [pending, setPending] = React.useState<null | "google" | "facebook">(null);

  React.useEffect(() => {
    if (user) router.navigate({ to: "/dashboard" });
  }, [user, router]);

  const handle = async (p: "google" | "facebook") => {
    setPending(p);
    await loginWithProvider(p);
    setPending(null);
  };

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-background text-foreground flex items-center justify-center px-5">
      {/* Background grid */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.08] [background-image:linear-gradient(to_right,currentColor_1px,transparent_1px),linear-gradient(to_bottom,currentColor_1px,transparent_1px)] [background-size:48px_48px]"
      />
      <div className="pointer-events-none absolute -top-40 -left-40 h-[420px] w-[420px] rounded-full bg-foreground/5 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-40 -right-40 h-[420px] w-[420px] rounded-full bg-foreground/5 blur-3xl" />

      <div className="relative w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card/60 backdrop-blur px-3 py-1 text-[11px] uppercase tracking-[0.2em] text-muted-foreground mb-6">
            <Sparkles className="h-3 w-3" /> AI Quiz Engine
          </div>
          <h1 className="text-4xl sm:text-5xl font-semibold tracking-tight">QuizForge</h1>
          <p className="mt-3 text-sm text-muted-foreground max-w-sm mx-auto">
            Turn any PDF into a timed mock test for JEE, NEET, or CBSE Boards — in seconds.
          </p>
        </div>

        <div className="rounded-2xl border border-border bg-card shadow-2xl p-7">
          <div className="text-center mb-6">
            <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Sign in</div>
            <div className="mt-1 text-lg font-medium">Continue to your dashboard</div>
          </div>

          <div className="space-y-3">
            <OAuthButton
              label="Continue with Google"
              loading={pending === "google"}
              disabled={loading}
              onClick={() => handle("google")}
              icon={<GoogleIcon />}
            />
            <OAuthButton
              label="Continue with Facebook"
              loading={pending === "facebook"}
              disabled={loading}
              onClick={() => handle("facebook")}
              icon={<FacebookIcon />}
            />
          </div>

          <div className="relative my-6">
            <div className="h-px bg-border" />
            <span className="absolute inset-0 -top-2.5 mx-auto w-fit px-3 bg-card text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
              Secure OAuth 2.0
            </span>
          </div>

          <p className="text-center text-[11px] text-muted-foreground leading-relaxed">
            By continuing, you agree to our Terms and acknowledge our Privacy Policy.
            We never post or store your password.
          </p>
        </div>

        <p className="mt-6 text-center text-[11px] text-muted-foreground">
          © {new Date().getFullYear()} QuizForge. All rights reserved.
        </p>
      </div>
    </div>
  );
}

function OAuthButton({
  label,
  icon,
  loading,
  disabled,
  onClick,
}: {
  label: string;
  icon: React.ReactNode;
  loading?: boolean;
  disabled?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled || loading}
      className="group w-full h-12 rounded-xl border border-border bg-background hover:bg-accent transition flex items-center justify-center gap-3 text-sm font-medium disabled:opacity-60 disabled:cursor-not-allowed"
    >
      {loading ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>Redirecting to provider…</span>
        </>
      ) : (
        <>
          <span className="h-5 w-5">{icon}</span>
          <span>{label}</span>
        </>
      )}
    </button>
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

function FacebookIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5">
      <path fill="#1877F2" d="M22 12a10 10 0 1 0-11.6 9.9v-7H8v-3h2.4V9.4c0-2.4 1.4-3.7 3.6-3.7 1 0 2.1.2 2.1.2v2.3h-1.2c-1.2 0-1.5.7-1.5 1.5V12H16l-.4 3h-2.2v7A10 10 0 0 0 22 12z"/>
    </svg>
  );
}
