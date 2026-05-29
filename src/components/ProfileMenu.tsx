import * as React from "react";
import { useRouter } from "@tanstack/react-router";
import { LogOut, Settings, UserRound, RefreshCw } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/lib/auth";
import { lovable } from "@/integrations/lovable";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { getRole } from "@/lib/roles";

export function ProfileMenu({ className }: { className?: string }) {
  const { user, logout } = useAuth();
  const router = useRouter();
  if (!user) return null;

  const initials = user.name.split(" ").map((p) => p[0]).join("").slice(0, 2).toUpperCase();
  const role = getRole(user);

  const handleLogout = async () => {
    await logout();
    router.navigate({ to: "/" });
  };

  const handleSwitch = async () => {
    try {
      // Sign out current session, then re-trigger Google with account picker
      await logout();
      const result = await lovable.auth.signInWithOAuth("google", {
        redirect_uri: window.location.origin,
        extraParams: { prompt: "select_account" },
      });
      if (result?.error) toast.error("Couldn't switch account.");
    } catch {
      toast.error("Couldn't switch account.");
      router.navigate({ to: "/" });
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          aria-label="Account menu"
          className={cn(
            "flex items-center gap-2 rounded-full border border-border bg-card/80 backdrop-blur-md p-0.5 pr-2.5 hover:bg-card transition",
            className,
          )}
        >
          {user.avatarUrl ? (
            <img
              src={user.avatarUrl}
              alt={user.name}
              className="h-7 w-7 rounded-full object-cover"
              referrerPolicy="no-referrer"
            />
          ) : (
            <div className="h-7 w-7 rounded-full bg-foreground text-background flex items-center justify-center text-[11px] font-semibold">
              {initials}
            </div>
          )}
          <span className="hidden sm:inline text-xs text-muted-foreground max-w-[140px] truncate">
            {user.isGuest ? "Guest" : user.email}
          </span>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-60">
        <DropdownMenuLabel className="flex flex-col gap-0.5">
          <span className="text-sm font-medium truncate">{user.name}</span>
          <span className="text-[11px] font-normal text-muted-foreground truncate">
            {user.isGuest ? "Guest session" : user.email}
          </span>
          <span className="mt-1 self-start text-[9px] uppercase tracking-wider rounded bg-foreground/10 px-1.5 py-0.5">
            {role}
          </span>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleSwitch} className="gap-2">
          <RefreshCw className="h-4 w-4" /> Switch account
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => router.navigate({ to: "/about" })}
          className="gap-2"
        >
          <Settings className="h-4 w-4" /> Manage account
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleLogout} className="gap-2 text-red-500 focus:text-red-500">
          <LogOut className="h-4 w-4" /> Logout
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}