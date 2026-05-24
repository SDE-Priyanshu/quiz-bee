import * as React from "react";
import { cn } from "@/lib/utils";

export function LogoMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 32 32"
      className={cn("h-7 w-7", className)}
      aria-hidden
    >
      <defs>
        <linearGradient id="prepzo-mark" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="currentColor" stopOpacity="1" />
          <stop offset="100%" stopColor="currentColor" stopOpacity="0.55" />
        </linearGradient>
      </defs>
      <rect x="2" y="2" width="28" height="28" rx="8" fill="url(#prepzo-mark)" />
      <path
        d="M11 22V10h5.2c2.7 0 4.4 1.6 4.4 4.1 0 2.5-1.7 4.1-4.4 4.1H14V22h-3zm3-6.4h2c1.1 0 1.8-.6 1.8-1.5s-.7-1.5-1.8-1.5h-2v3z"
        fill="var(--color-background)"
      />
    </svg>
  );
}

export function Logo({ className }: { className?: string }) {
  return (
    <div className={cn("inline-flex items-center gap-2", className)}>
      <LogoMark />
      <span className="text-lg font-semibold tracking-tight">PrepZo</span>
    </div>
  );
}