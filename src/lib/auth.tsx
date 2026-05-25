import * as React from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Session, User } from "@supabase/supabase-js";

export type AuthUser = {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  provider: string;
};

type AuthContextValue = {
  user: AuthUser | null;
  session: Session | null;
  loading: boolean;
  logout: () => Promise<void>;
};

const AuthContext = React.createContext<AuthContextValue | null>(null);

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
    // Clean any legacy keys
    try {
      localStorage.removeItem("prepzo.auth.user");
      localStorage.removeItem("quizforge.auth.user");
    } catch {}
  }, []);

  const user = React.useMemo(() => toAuthUser(session?.user), [session]);

  return (
    <AuthContext.Provider value={{ user, session, loading, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = React.useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}