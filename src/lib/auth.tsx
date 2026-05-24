import * as React from "react";

export type AuthUser = { name: string; email: string; provider: "google" | "facebook" };

type AuthContextValue = {
  user: AuthUser | null;
  loginWithProvider: (provider: "google" | "facebook") => Promise<void>;
  logout: () => void;
  loading: boolean;
};

const AuthContext = React.createContext<AuthContextValue | null>(null);

const STORAGE_KEY = "quizforge.auth.user";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = React.useState<AuthUser | null>(null);
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setUser(JSON.parse(raw));
    } catch {}
  }, []);

  const loginWithProvider = React.useCallback(async (provider: "google" | "facebook") => {
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1600));
    const mock: AuthUser =
      provider === "google"
        ? { name: "Aarav Sharma", email: "aarav.sharma@gmail.com", provider }
        : { name: "Aarav Sharma", email: "aarav.sharma@facebook.com", provider };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(mock));
    setUser(mock);
    setLoading(false);
  }, []);

  const logout = React.useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, loginWithProvider, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = React.useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}