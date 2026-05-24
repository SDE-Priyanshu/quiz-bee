import * as React from "react";

export type Provider = "google" | "facebook";
export type AuthUser = {
  name: string;
  email: string;
  provider: Provider;
  avatarSeed?: string;
};

type AuthContextValue = {
  user: AuthUser | null;
  signIn: (user: AuthUser) => Promise<void>;
  logout: () => void;
};

const AuthContext = React.createContext<AuthContextValue | null>(null);
export const AUTH_STORAGE_KEY = "prepzo.auth.user";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = React.useState<AuthUser | null>(null);

  React.useEffect(() => {
    try {
      const raw = localStorage.getItem(AUTH_STORAGE_KEY)
        ?? localStorage.getItem("quizforge.auth.user");
      if (raw) setUser(JSON.parse(raw));
    } catch {}
  }, []);

  const signIn = React.useCallback(async (next: AuthUser) => {
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(next));
    setUser(next);
  }, []);

  const logout = React.useCallback(() => {
    localStorage.removeItem(AUTH_STORAGE_KEY);
    localStorage.removeItem("quizforge.auth.user");
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, signIn, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = React.useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}