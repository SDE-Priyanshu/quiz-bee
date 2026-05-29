import * as React from "react";
import { Bell, CheckCheck, Trash2 } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useNotifications } from "@/lib/notifications";
import { cn } from "@/lib/utils";

function timeAgo(ts: number) {
  const s = Math.max(1, Math.floor((Date.now() - ts) / 1000));
  if (s < 60) return `${s}s`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h`;
  return `${Math.floor(h / 24)}d`;
}

export function NotificationBell({ className }: { className?: string }) {
  const { items, unread, markRead, markAllRead, clear } = useNotifications();

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          aria-label="Notifications"
          className={cn(
            "relative h-9 w-9 inline-flex items-center justify-center rounded-full",
            "border border-border bg-card/70 backdrop-blur-md hover:bg-card transition",
            className,
          )}
        >
          <Bell className="h-4 w-4" />
          {unread > 0 && (
            <span className="absolute -top-0.5 -right-0.5 h-4 min-w-4 px-1 rounded-full bg-red-500 text-white text-[9px] font-semibold flex items-center justify-center ring-2 ring-background">
              {unread > 9 ? "9+" : unread}
            </span>
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-[320px] p-0 overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-border">
          <div className="text-sm font-semibold">Notifications</div>
          <div className="flex items-center gap-1">
            {items.length > 0 && (
              <>
                <button
                  onClick={markAllRead}
                  className="text-[11px] inline-flex items-center gap-1 px-2 py-1 rounded-md hover:bg-accent transition"
                  title="Mark all as read"
                >
                  <CheckCheck className="h-3.5 w-3.5" /> Read
                </button>
                <button
                  onClick={clear}
                  className="text-[11px] inline-flex items-center gap-1 px-2 py-1 rounded-md hover:bg-accent transition"
                  title="Clear all"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </>
            )}
          </div>
        </div>
        <div className="max-h-[360px] overflow-y-auto">
          {items.length === 0 ? (
            <div className="px-4 py-10 text-center text-xs text-muted-foreground">
              You're all caught up.
            </div>
          ) : (
            items.map((n) => (
              <button
                key={n.id}
                onClick={() => markRead(n.id)}
                className={cn(
                  "w-full text-left px-4 py-3 border-b border-border/60 last:border-b-0 transition hover:bg-accent/60",
                  !n.read && "bg-accent/30",
                )}
              >
                <div className="flex items-start gap-2">
                  {!n.read && (
                    <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                  )}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <div className="text-sm font-medium truncate">{n.title}</div>
                      <div className="text-[10px] text-muted-foreground shrink-0">
                        {timeAgo(n.createdAt)}
                      </div>
                    </div>
                    {n.body && (
                      <div className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                        {n.body}
                      </div>
                    )}
                  </div>
                </div>
              </button>
            ))
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}