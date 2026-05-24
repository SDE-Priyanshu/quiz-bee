import { createFileRoute, useRouter } from "@tanstack/react-router";
import * as React from "react";
import { Loader2, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { useAuth, type AuthUser, type Provider } from "@/lib/auth";
import { AccountPickerModal } from "@/components/AccountPickerModal";
import { LogoMark } from "@/components/Logo";

export const Route = createFileRoute("/")({ component: Index });

function Index() {
  const { user, signIn } = useAuth();
  const router = useRouter();
  const [picker, setPicker] = React.useState<Provider | null>(null);
  const [opening, setOpening] = React.useState<Provider | null>(null);

  React.useEffect(() => {
    if (user) router.navigate({ to: "/dashboard" });
  }, [user, router]);

  const open = async (p: Provider) => {
    setOpening(p);
    await new Promise((r) => setTimeout(r, 550));
    setOpening(null);
    setPicker(p);
  };

  const handleSelect = async (u: AuthUser) => {
    await signIn(u);
    toast.success(`Welcome, ${u.name.split(" ")[0]}`);
    router.navigate({ to: "/dashboard" });
  };

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-background text-foreground flex items-center justify-center px-5 py-10">
      {/* Animated grid background */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.12] animate-grid-pan [background-image:linear-gradient(to_right,currentColor_1px,transparent_1px),linear-gradient(to_bottom,currentColor_1px,transparent_1px)] [background-size:60px_60px]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(60% 50% at 50% 0%, color-mix(in oklab, var(--color-foreground) 8%, transparent), transparent 70%), radial-gradient(40% 40% at 80% 90%, color-mix(in oklab, var(--color-foreground) 6%, transparent), transparent 70%)",
        }}
      />
      <div className="pointer-events-none absolute -top-32 left-1/2 -translate-x-1/2 h-[440px] w-[440px] rounded-full bg-foreground/[0.06] blur-3xl animate-pulse-glow" />

      <div className="relative w-full max-w-md animate-fade-up">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 rounded-full border border-border glass px-3 py-1 text-[11px] uppercase tracking-[0.22em] text-muted-foreground mb-6">
            <Sparkles className="h-3 w-3" /> AI Mock Test Engine
          </div>
          <div className="flex items-center justify-center gap-3 mb-2">
            <LogoMark className="h-10 w-10" />
            <h1 className="text-4xl sm:text-5xl font-semibold tracking-tight">PrepZo</h1>
          </div>
          <p className="mt-3 text-sm text-muted-foreground max-w-sm mx-auto leading-relaxed">
            Upload a PDF. Get an exam-grade mock test for JEE, NEET, or CBSE — in seconds.
          </p>
        </div>

        <div className="rounded-3xl border border-border glass shadow-2xl p-7 sm:p-8">
          <div className="text-center mb-7">
            <div className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
              Sign in
            </div>
            <div className="mt-1.5 text-lg font-medium">Continue to your dashboard</div>
          </div>

          <div className="space-y-3">
            <OAuthButton
              label="Continue with Google"
              loading={opening === "google"}
              disabled={!!opening}
              onClick={() => open("google")}
              icon={<GoogleIcon />}
            />
            <OAuthButton
              label="Continue with Facebook"
              loading={opening === "facebook"}
              disabled={!!opening}
              onClick={() => open("facebook")}
              icon={<FacebookIcon />}
            />
          </div>

          <p className="mt-7 text-center text-[11px] text-muted-foreground leading-relaxed">
            By continuing, you agree to our Terms of Service and Privacy Policy.
            Your credentials remain secure and are never stored by us.
          </p>
        </div>

        <p className="mt-6 text-center text-[11px] text-muted-foreground">
          © {new Date().getFullYear()} PrepZo. Crafted for serious learners.
        </p>
      </div>

      <AccountPickerModal
        open={picker !== null}
        provider={picker}
        onClose={() => setPicker(null)}
        onSelect={handleSelect}
      />
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
      className="group relative w-full h-12 rounded-2xl border border-border bg-background/60 hover:bg-accent transition-all duration-200 flex items-center justify-center gap-3 text-sm font-medium disabled:opacity-60 disabled:cursor-not-allowed shadow-sm hover:shadow-md hover:-translate-y-[1px]"
    >
      {loading ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>Opening secure window…</span>
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