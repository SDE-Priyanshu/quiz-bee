import { createFileRoute } from "@tanstack/react-router";
import * as React from "react";
import { RequireAuth } from "@/components/AppShell";
import { Send, Heart, MessageCircle } from "lucide-react";

export const Route = createFileRoute("/community")({ component: Community });

type Msg = { id: string; author: string; avatar: string; time: string; body: string; likes: number };

const SEED: Msg[] = [
  { id: "1", author: "Priya N.", avatar: "PN", time: "2h ago", body: "Just generated a 50-Q JEE mock from my organic chem notes — the negative marking option is 🔥", likes: 24 },
  { id: "2", author: "Rahul K.", avatar: "RK", time: "5h ago", body: "Anyone else using this for NEET bio? The question variety is genuinely impressive.", likes: 18 },
  { id: "3", author: "Sneha D.", avatar: "SD", time: "Yesterday", body: "Suggestion: would love an option to export the test as PDF for offline practice.", likes: 41 },
  { id: "4", author: "Mohit V.", avatar: "MV", time: "2d ago", body: "CBSE Boards mode is perfect for revision week. Clean UI, no distractions.", likes: 12 },
];

function Community() {
  const [msgs, setMsgs] = React.useState<Msg[]>(SEED);
  const [draft, setDraft] = React.useState("");

  const send = () => {
    const v = draft.trim();
    if (!v) return;
    setMsgs((m) => [
      ...m,
      { id: crypto.randomUUID(), author: "You", avatar: "YO", time: "just now", body: v, likes: 0 },
    ]);
    setDraft("");
  };

  const like = (id: string) =>
    setMsgs((m) => m.map((x) => (x.id === id ? { ...x, likes: x.likes + 1 } : x)));

  return (
    <RequireAuth>
      <div>
        <div className="text-[11px] uppercase tracking-[0.25em] text-muted-foreground">Community</div>
        <h1 className="mt-2 text-3xl sm:text-4xl font-semibold tracking-tight">Public threads</h1>
        <p className="mt-2 text-sm text-muted-foreground">Share tips, ask questions, vibe with other PrepZo users.</p>

        <div className="mt-8 rounded-2xl border border-border bg-card">
          <ul className="divide-y divide-border">
            {msgs.map((m) => (
              <li key={m.id} className="flex gap-4 p-5">
                <div className="h-10 w-10 shrink-0 rounded-full bg-foreground text-background flex items-center justify-center text-xs font-semibold">
                  {m.avatar}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">{m.author}</span>
                    <span className="text-[11px] text-muted-foreground">· {m.time}</span>
                  </div>
                  <p className="mt-1 text-sm leading-relaxed">{m.body}</p>
                  <div className="mt-3 flex items-center gap-4 text-xs text-muted-foreground">
                    <button
                      onClick={() => like(m.id)}
                      className="inline-flex items-center gap-1.5 hover:text-foreground transition"
                    >
                      <Heart className="h-3.5 w-3.5" /> {m.likes}
                    </button>
                    <button className="inline-flex items-center gap-1.5 hover:text-foreground transition">
                      <MessageCircle className="h-3.5 w-3.5" /> Reply
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>

          <div className="border-t border-border p-4 flex items-end gap-3">
            <textarea
              rows={1}
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  send();
                }
              }}
              placeholder="Share your thoughts…"
              className="flex-1 resize-none rounded-xl border border-border bg-background px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
            <button
              onClick={send}
              disabled={!draft.trim()}
              className="h-11 px-4 rounded-xl bg-foreground text-background text-sm font-medium inline-flex items-center gap-2 disabled:opacity-40"
            >
              <Send className="h-4 w-4" /> Post
            </button>
          </div>
        </div>
      </div>
    </RequireAuth>
  );
}