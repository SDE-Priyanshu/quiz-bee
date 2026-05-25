import * as React from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/lib/theme";
import { cn } from "@/lib/utils";

/**
 * Apple-style theme switch. Persists via ThemeProvider (localStorage).
 */
export function ThemeToggle({ className }: { className?: string }) {
  const { theme, toggle } = useTheme();
  const isDark = theme === "dark";
  return (
    <button
      onClick={toggle}
      aria-label="Toggle theme"
      aria-pressed={isDark}
      className={cn(
        "group relative inline-flex h-9 w-[70px] items-center rounded-full",
        "border border-border bg-card/70 backdrop-blur-md",
        "shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]",
        "transition-all duration-300 hover:bg-card",
        className,
      )}
    >
      <span
        className={cn(
          "absolute top-1 left-1 h-7 w-7 rounded-full",
          "bg-foreground text-background shadow-lg",
          "flex items-center justify-center",
          "transition-transform duration-400 ease-[cubic-bezier(0.16,1,0.3,1)]",
          isDark ? "translate-x-[34px]" : "translate-x-0",
        )}
      >
        {isDark ? <Moon className="h-3.5 w-3.5" /> : <Sun className="h-3.5 w-3.5" />}
      </span>
      <Sun
        className={cn(
          "absolute left-2.5 h-3.5 w-3.5 transition-opacity",
          isDark ? "opacity-30" : "opacity-0",
        )}
      />
      <Moon
        className={cn(
          "absolute right-2.5 h-3.5 w-3.5 transition-opacity",
          isDark ? "opacity-0" : "opacity-30",
        )}
      />
    </button>
  );
}