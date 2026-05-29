import * as React from "react";
import { useAuth } from "@/lib/auth";

export type Notification = {
  id: string;
  title: string;
  body?: string;
  type: "test" | "system" | "community" | "info";
  createdAt: number;
  read: boolean;
};

type Ctx = {
  items: Notification[];
  unread: number;
  notify: (n: Omit<Notification, "id" | "createdAt" | "read">) => void;
  markRead: (id: string) => void;
  markAllRead: () => void;
  clear: () => void;
};

const NotificationContext = React.createContext<Ctx | null>(null);

function storageKey(userId: string | undefined) {
  return `prepzo.notifications.${userId ?? "anon"}`;
}

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const key = storageKey(user?.id);
  const [items, setItems] = React.useState<Notification[]>([]);

  // Load when user changes
  React.useEffect(() => {
    try {
      const raw = localStorage.getItem(key);
      if (raw) setItems(JSON.parse(raw));
      else {
        // Seed welcome notification once per user
        if (user) {
          const welcome: Notification = {
            id: `welcome-${user.id}`,
            title: "Welcome to PrepZo",
            body: "Generate your first mock test from a PDF to get started.",
            type: "system",
            createdAt: Date.now(),
            read: false,
          };
          setItems([welcome]);
        } else {
          setItems([]);
        }
      }
    } catch {
      setItems([]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  // Persist
  React.useEffect(() => {
    try { localStorage.setItem(key, JSON.stringify(items)); } catch {}
  }, [items, key]);

  const notify: Ctx["notify"] = React.useCallback((n) => {
    setItems((prev) => [
      { ...n, id: `n-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`, createdAt: Date.now(), read: false },
      ...prev,
    ].slice(0, 50));
  }, []);

  const markRead = React.useCallback((id: string) => {
    setItems((p) => p.map((n) => (n.id === id ? { ...n, read: true } : n)));
  }, []);
  const markAllRead = React.useCallback(() => {
    setItems((p) => p.map((n) => ({ ...n, read: true })));
  }, []);
  const clear = React.useCallback(() => setItems([]), []);

  const unread = items.filter((n) => !n.read).length;

  return (
    <NotificationContext.Provider value={{ items, unread, notify, markRead, markAllRead, clear }}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const ctx = React.useContext(NotificationContext);
  if (!ctx) throw new Error("useNotifications must be used inside NotificationProvider");
  return ctx;
}