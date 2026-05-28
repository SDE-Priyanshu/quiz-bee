import * as React from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Session, User } from "@supabase/supabase-js";

export type AuthUser = {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  provider: string;
  isGuest?: boolean;
};

type AuthContextValue = {
  user: AuthUser | null;
  session: Session | null;
  loading: boolean;
  logout: () => Promise<void>;
  loginAsGuest: () => void;
};

const AuthContext = React.createContext<AuthContextValue | null>(null);

const GUEST_KEY = "prepzo.auth.guest";

function readGuest(): AuthUser | null {
  try {
    const raw = localStorage.getItem(GUEST_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as AuthUser;
    return { ...parsed, isGuest: true };
  } catch {
    return null;
  }
}

function toAuthUser(u: User | null | undefined): AuthUser | null {
  if (!u) return null;
  const meta = (u.user_metadata ?? {}) as Record<string, unknown>;
  const name =
    (meta.full_name as string) ||
    (meta.name as string) ||
    (u.email ? u.email.split("@")[0] : "PrepZo User");
  const avatarUrl =
    (meta.avatar_url as string) || (meta.picture as string) || undefined;
  const provider =
    (u.app_metadata?.provider as string) ||
    (u.identities?.[0]?.provider as string) ||
    "email";
  return { id: u.id, name, email: u.email ?? "", avatarUrl, provider };
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = React.useState<Session | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [guest, setGuest] = React.useState<AuthUser | null>(() =>
    typeof window !== "undefined" ? readGuest() : null,
  );

  React.useEffect(() => {
    // Listener first
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, s) => {
        setSession(s);
        setLoading(false);
      }
    );
    // Then existing session
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setLoading(false);
    });
    return () => subscription.unsubscribe();
  }, []);

  const logout = React.useCallback(async () => {
    await supabase.auth.signOut();
    try {
      localStorage.removeItem("prepzo.auth.user");
      localStorage.removeItem("quizforge.auth.user");
      localStorage.removeItem(GUEST_KEY);
      // Wipe any locally-stored progress so guest sessions never persist
      localStorage.removeItem("prepzo.tests.history");
      localStorage.removeItem("prepzo.test.progress");
      sessionStorage.removeItem("prepzo.test.config");
      sessionStorage.removeItem("prepzo.admin.session");
    } catch {}
    setGuest(null);
  }, []);

  const loginAsGuest = React.useCallback(() => {
    const g: AuthUser = {
      id: `guest-${Math.random().toString(36).slice(2, 10)}`,
      name: "Guest User",
      email: "guest@prepzo.local",
      provider: "guest",
      isGuest: true,
    };
    try {
      localStorage.setItem(GUEST_KEY, JSON.stringify(g));
    } catch {}
    setGuest(g);
  }, []);

  const user = React.useMemo(
    () => toAuthUser(session?.user) ?? guest,
    [session, guest],
  );

  return (
    <AuthContext.Provider value={{ user, session, loading, logout, loginAsGuest }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = React.useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}