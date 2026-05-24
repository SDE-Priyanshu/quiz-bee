import * as React from "react";
import { X, Loader2, ShieldCheck, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import type { AuthUser, Provider } from "@/lib/auth";

type Account = { name: string; email: string };

const ACCOUNTS_BY_PROVIDER: Record<Provider, Account[]> = {
  google: [
    { name: "Aarav Sharma", email: "aarav.sharma@gmail.com" },
    { name: "Ishita Verma", email: "ishita.verma@gmail.com" },
    { name: "Rahul Mehta", email: "rahul.mehta98@gmail.com" },
  ],
  facebook: [
    { name: "Aarav Sharma", email: "aarav.sharma@facebook.com" },
    { name: "Priya Nair", email: "priya.nair@facebook.com" },
  ],
};

function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" className={className}>
      <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.5 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3 0 5.8 1.1 7.9 3l5.7-5.7C34.1 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.2-.1-2.3-.4-3.5z"/>
      <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 16 19 13 24 13c3 0 5.8 1.1 7.9 3l5.7-5.7C34.1 6.1 29.3 4 24 4 16.3 4 9.6 8.3 6.3 14.7z"/>
      <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35 26.7 36 24 36c-5.3 0-9.7-3.4-11.3-8.1l-6.5 5C9.5 39.6 16.2 44 24 44z"/>
      <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.3-2.3 4.2-4.1 5.6l6.2 5.2C41 35 44 30 44 24c0-1.2-.1-2.3-.4-3.5z"/>
    </svg>
  );
}
function FacebookIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className}>
      <path fill="#1877F2" d="M22 12a10 10 0 1 0-11.6 9.9v-7H8v-3h2.4V9.4c0-2.4 1.4-3.7 3.6-3.7 1 0 2.1.2 2.1.2v2.3h-1.2c-1.2 0-1.5.7-1.5 1.5V12H16l-.4 3h-2.2v7A10 10 0 0 0 22 12z"/>
    </svg>
  );
}

export function AccountPickerModal({
  open,
  provider,
  onClose,
  onSelect,
}: {
  open: boolean;
  provider: Provider | null;
  onClose: () => void;
  onSelect: (user: AuthUser) => Promise<void> | void;
}) {
  const [signingIn, setSigningIn] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!open) setSigningIn(null);
  }, [open]);

  if (!open || !provider) return null;

  const accounts = ACCOUNTS_BY_PROVIDER[provider];
  const providerLabel = provider === "google" ? "Google" : "Facebook";
  const Icon = provider === "google" ? GoogleIcon : FacebookIcon;

  const handlePick = async (acc: Account) => {
    setSigningIn(acc.email);
    await new Promise((r) => setTimeout(r, 1100));
    await onSelect({ ...acc, provider, avatarSeed: acc.email });
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center px-4 py-6 animate-fade-up"
    >
      <div
        onClick={signingIn ? undefined : onClose}
        className="absolute inset-0 bg-black/70 backdrop-blur-md"
      />
      <div className="relative w-full max-w-md rounded-3xl border border-border glass shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between px-6 pt-5 pb-3">
          <div className="flex items-center gap-2.5">
            <Icon className="h-5 w-5" />
            <div>
              <div className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
                Sign in with {providerLabel}
              </div>
              <div className="text-sm font-medium">Choose an account</div>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={!!signingIn}
            className="h-8 w-8 inline-flex items-center justify-center rounded-full hover:bg-accent disabled:opacity-40"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="px-3 pb-2">
          <div className="text-[11px] text-muted-foreground px-3 pb-2">
            to continue to <span className="font-medium text-foreground">PrepZo</span>
          </div>
          <ul className="space-y-1">
            {accounts.map((acc) => {
              const busy = signingIn === acc.email;
              const initials = acc.name.split(" ").map((p) => p[0]).join("").slice(0, 2);
              return (
                <li key={acc.email}>
                  <button
                    onClick={() => handlePick(acc)}
                    disabled={!!signingIn}
                    className={cn(
                      "w-full flex items-center gap-3 rounded-xl px-3 py-3 text-left transition",
                      "hover:bg-accent/70 disabled:opacity-60 disabled:cursor-wait",
                    )}
                  >
                    <div className="h-10 w-10 rounded-full bg-foreground text-background flex items-center justify-center text-sm font-semibold">
                      {initials}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-medium truncate">{acc.name}</div>
                      <div className="text-xs text-muted-foreground truncate">{acc.email}</div>
                    </div>
                    {busy && <Loader2 className="h-4 w-4 animate-spin opacity-70" />}
                  </button>
                </li>
              );
            })}
            <li>
              <button
                disabled={!!signingIn}
                onClick={() =>
                  handlePick({
                    name: "New PrepZo User",
                    email: `guest.${Math.floor(Math.random() * 9999)}@${provider}.com`,
                  })
                }
                className="w-full flex items-center gap-3 rounded-xl px-3 py-3 text-left hover:bg-accent/70 transition disabled:opacity-60"
              >
                <div className="h-10 w-10 rounded-full border border-dashed border-border flex items-center justify-center text-muted-foreground">
                  <Plus className="h-4 w-4" />
                </div>
                <div>
                  <div className="text-sm font-medium">Use another account</div>
                  <div className="text-xs text-muted-foreground">Continue as guest</div>
                </div>
              </button>
            </li>
          </ul>
        </div>

        <div className="px-6 py-4 border-t border-border bg-card/40">
          <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
            <ShieldCheck className="h-3.5 w-3.5" />
            To continue, {providerLabel} will share your name and email with PrepZo.
          </div>
        </div>
      </div>
    </div>
  );
}