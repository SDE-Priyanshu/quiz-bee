import * as React from "react";
import { Link } from "@tanstack/react-router";
import { Lock, Sparkles } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { useAuth } from "@/lib/auth";
import { getRole } from "@/lib/roles";

type GuestGateContext = {
  /**
   * Returns true if the user has full access. If guest/unauth, opens the
   * upgrade modal and returns false. Use to wrap restricted actions.
   */
  ensureFullAccess: (reason?: string) => boolean;
  openUpgrade: (reason?: string) => void;
};

const Ctx = React.createContext<GuestGateContext | null>(null);

export function GuestGateProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [open, setOpen] = React.useState(false);
  const [reason, setReason] = React.useState<string | undefined>();

  const role = getRole(user);
  const isFull = role === "user" || role === "admin";

  const openUpgrade = React.useCallback((r?: string) => {
    setReason(r);
    setOpen(true);
  }, []);

  const ensureFullAccess = React.useCallback(
    (r?: string) => {
      if (isFull) return true;
      openUpgrade(r);
      return false;
    },
    [isFull, openUpgrade],
  );

  return (
    <Ctx.Provider value={{ ensureFullAccess, openUpgrade }}>
      {children}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="mx-auto mb-2 h-12 w-12 rounded-2xl bg-foreground/5 flex items-center justify-center">
              <Lock className="h-5 w-5" />
            </div>
            <DialogTitle className="text-center text-lg">
              Login with Google to unlock full features
            </DialogTitle>
            <DialogDescription className="text-center">
              {reason ?? "Guest mode is for browsing only."} Sign in to save tests,
              upload PDFs, generate mock tests and track your progress across devices.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="sm:justify-center gap-2">
            <button
              onClick={() => setOpen(false)}
              className="h-10 px-4 rounded-xl border border-border text-sm hover:bg-accent transition"
            >
              Keep browsing
            </button>
            <Link
              to="/"
              onClick={() => setOpen(false)}
              className="h-10 px-4 inline-flex items-center gap-2 rounded-xl bg-foreground text-background text-sm font-medium hover:bg-foreground/90 transition"
            >
              <Sparkles className="h-4 w-4" /> Continue with Google
            </Link>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Ctx.Provider>
  );
}

export function useGuestGate() {
  const ctx = React.useContext(Ctx);
  if (!ctx) throw new Error("useGuestGate must be used inside GuestGateProvider");
  return ctx;
}